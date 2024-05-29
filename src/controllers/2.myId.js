const {
  InternalServerError,
  ForbiddenError,
  BadRequestError,
} = require("../utils/errors.js");
let axios = require("axios");
let path = require("path");
let fs = require("fs");

let db = require("../config/db");
class Myid {
  async getMe(req, res, next) {
    try {
      console.log("my id getme");
      let { id, base64, passport, birthDate } = req.body;
      console.log('id:',id);

      if (base64) {
        var filePath = path.join(
          __dirname,
          "..",
          "..",
          "public",
          "myid",
          `${req.body.passport}.png`
        );
        console.log(filePath);
        console.log(process.env.FACE_URL);
        base64_decode(base64, filePath);
        let url1 = process.env.FACE_URL + "oauth2/access-token";
        let url2 =
          process.env.FACE_URL +
          "authentication/simple-inplace-authentication-request-task";

        const response1 = await axios
          .post(
            url1,
            {
              grant_type: "password",
              client_id: process.env.FACE_CLIENT_ID_2,
              username: process.env.FACE_USERNAME,
              password: process.env.FACE_PASSWORD,
            },
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            }
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });

        // console.log(response1);
        let access_token = response1.data["access_token"];
        let response2 = await axios
          .post(
            url2,
            {
              pass_data: req.body.passport,
              birth_date: req.body.birthDate,
              photo_from_camera: {
                front: base64,
              },
              agreed_on_terms: true,
              client_id: process.env.FACE_CLIENT_ID_2,
              // liveness: true
            },

            {
              headers: {
                Authorization: "Bearer " + access_token,
              },
            }
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });

        let url3 = `${process.env.FACE_URL}authentication/simple-inplace-authentication-request-status?job_id=${response2.data["job_id"]}`;
        console.log(JSON.stringify(url3));
        let response3 = await axios
          .post(
            url3,
            "",
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                // 'Content-Type': 'application/json',
                "Content-Type": "text/plain",

                // "responseType": 'blob',
                // "Accept":"*/*",
                responseType: "json",
                responseEncoding: "utf8",
              },
            },
            {}
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });
        while (response3.status != 200) {
          response3 = await axios
            .post(
              url3,
              "",
              {
                headers: {
                  Authorization: `Bearer ${access_token}`,
                  // 'Content-Type': 'application/json',
                  "Content-Type": "text/plain",

                  // "responseType": 'blob',
                  // "Accept":"*/*",
                  responseType: "json",
                  responseEncoding: "utf8",
                },
              },
              {}
            )
            .then((r) => r)
            .catch((err) => {
              throw err;
            });
        }
        console.log(response3.data);
        // console.log(response3.data);
        if (response3.data.profile != null && response3.data.result_code != 3) {
          let userMyIdData = await new Promise((resolve, reject) => {
            db.query(
              `INSERT INTO MyId (response_id,pass_seriya,comparison_value,profile) VALUES ('${
                response3.data.response_id
              }', '${passport}','${
                response3.data.comparison_value
              }','${JSON.stringify(response3.data.profile)}')`,
              function (err, results, fields) {
                if (err) {
                  resolve(null);
                  // return null;
                }
                console.log("", results);
                if (!results.warningStatus) {
                  resolve("success");
                } else {
                  resolve(null);
                  // return null;
                }
              }
            );
            db.query(
              `update  client set fullName='${
                response3.data.profile.common_data.last_name +
                " " +
                response3.data.profile.common_data.first_name +
                " " +
                response3.data.profile.common_data.middle_name
              }',passport='${passport}',pinfl='${
                response3.data.profile.common_data.pinfl
              }',birthdate='${
                response3.data.profile.common_data.birth_date
              }' where id=${id}`
            );
          });

          return res.status(response3.status).json(response3.data);
        } else {
          return next(
            new InternalServerError(500, response3.data.result_note ?? "error")
          );
        }
      }

      return next(new InternalServerError(500, "error"));
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }

  async check(req, res, next) {
    try {
      let { passport, gender, date } = req.body;

      console.log(new Date().getFullYear() - `${date}`.split(".")[2], " yil");
      let age = new Date().getFullYear() - `${date}`.split(".")[2];
      console.log(req.body);
      if (gender == "ERKAK") {
        if (age < 18 || age > 64) {
          return res.status(200).json({
            message: "Возраст клиента указан неверно.",
            status: false,
          });
        }
      } else {
        if (age < 18 || age > 64) {
          return res.status(200).json({
            message: "Возраст клиента указан неверно.",
            status: false,
          });
        }
      }

      let zayavka2 = await new Promise(function (resolve, reject) {
        db.query(
          `Select * from Zayavka WHERE passport='${passport}' AND status='canceled_by_scoring' ORDER BY id DESC`,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              return null;
            }
            if (results.length != 0) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          }
        );
      });

      //  esdan chiqmasin
      // console.log(Date.daysBetween(Date.parse(zayavka2.created_time), Date.now()));
      if (zayavka2) {
        console.log(
          `Недавно клиент получил отказ, теперь он(она) может проверить через ${
            16 -
            Date.daysBetween(
              Date.parse(zayavka2.created_time ?? `${Date.now()}`),
              Date.now()
            )
          } дней.`
        );

        if (
          Date.daysBetween(
            Date.parse(zayavka2.created_time ?? `${Date.now()}`),
            Date.now()
          ) <= 15
        ) {
          return res.status(200).json({
            message: `Недавно клиент получил отказ, теперь он(она) может проверить через ${
              16 -
              Date.daysBetween(Date.parse(zayavka2.created_time), Date.now())
            } дней.`,
            status: false,
          });
        }
      }

      let zayavka = await new Promise(function (resolve, reject) {
        db.query(
          `Select * from Zayavka WHERE passport='${passport}' AND step>6 AND status in ("finished","paid") ORDER BY id DESC `,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              return null;
            }

            if (results.length != 0) {
              resolve(results[0]);
            } else {
              resolve(null);
            }
          }
        );
      });

      if (!zayavka) {
        return res.status(200).json({
          message: "Пользователю предоставлено разрешение",
          status: true,
        });
      } else {
        if (
          Date.daysBetween(Date.parse(zayavka.created_time), Date.now()) < 4
        ) {
          return res.status(200).json({
            message: "Клиент недавно получил товар",
            status: false,
          });
        }
      }
      db.query(
        `UPDATE Zayavka SET status="canceled_by_client",canceled_reason="- - -"  WHERE passport='${passport}' AND step<7 AND status="progress" `,
        function (err, results, fields) {}
      );

      return res.status(200).json({
        message: "Пользователю предоставлено разрешение",
        status: true,
      });
    } catch (error) {
      console.log(">>>>>>>>>. ERROR >>>>>>>>>>");
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }

  async imageGetMe(req, res, next) {
    try {
      console.log(">>>>>>>>>>>>>>>>>");
      let { passport, birthDate } = req.body;

      console.log(req.body);
      let filePath = path.join(__dirname, "../../", req.file.path);

      var bitmap = fs.readFileSync(filePath);
      const encoded = Buffer(bitmap).toString("base64");

      fs.unlink(filePath, function (err) {
        if (err && err.code == "ENOENT") {
          // file doens't exist
          console.info("File doesn't exist, won't remove it.");
        } else if (err) {
          // other errors, e.g. maybe we don't have enough permission
          console.error("Error occurred while trying to remove file");
        } else {
          console.info(`removed`);
        }
      });

      let url1 = process.env.FACE_URL_DEV + "oauth2/access-token";
      let url2 =
        process.env.FACE_URL_DEV +
        "authentication/simple-inplace-authentication-request-task";

      const response1 = await axios
        .post(
          url1,
          {
            grant_type: "password",
            client_id: process.env.FACE_CLIENT_ID_2,
            username: process.env.FACE_USERNAME,
            password: process.env.FACE_PASSWORD,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        )
        .then((r) => r)
        .catch((err) => {
          throw err;
        });

      // console.log(response1);
      let access_token = response1.data["access_token"];
      console.log(birthDate);
      let response2 = await axios
        .post(
          url2,
          {
            pass_data: passport,
            birth_date: birthDate,
            photo_from_camera: {
              front: `data:image/jpeg;base64,${encoded}`,
            },
            agreed_on_terms: true,
            client_id: process.env.FACE_CLIENT_ID_2,
          },

          {
            headers: {
              Authorization: "Bearer " + access_token,
            },
          }
        )
        .then((r) => r)
        .catch((err) => {
          throw err;
        });

      let url3 = `${process.env.FACE_URL_DEV}authentication/simple-inplace-authentication-request-status?job_id=${response2.data["job_id"]}`;
      console.log(JSON.stringify(url3));
      let response3 = await axios
        .post(
          url3,
          "",
          {
            headers: {
              Authorization: `Bearer ${access_token}`,
              // 'Content-Type': 'application/json',
              "Content-Type": "text/plain",

              // "responseType": 'blob',
              // "Accept":"*/*",
              responseType: "json",
              responseEncoding: "utf8",
            },
          },
          {}
        )
        .then((r) => r)
        .catch((err) => {
          throw err;
        });
      while (response3.status != 200) {
        response3 = await axios
          .post(
            url3,
            "",
            {
              headers: {
                Authorization: `Bearer ${access_token}`,
                // 'Content-Type': 'application/json',
                "Content-Type": "text/plain",

                // "responseType": 'blob',
                // "Accept":"*/*",
                responseType: "json",
                responseEncoding: "utf8",
              },
            },
            {}
          )
          .then((r) => r)
          .catch((err) => {
            throw err;
          });
      }

      return res.status(response3.status).json(response3.data);
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
}

Date.daysBetween = function (date1, date2) {
  //Get 1 day in milliseconds
  var one_day = 1000 * 60 * 60 * 24;

  // Calculate the difference in milliseconds
  var difference = date2 - date1;

  // Convert back to days and return
  return Math.round(difference / one_day);
};

function base64_decode(base64str, filePath) {
  let base64Image = base64str.split(";base64,")[1];
  var bitmap = Buffer.from(base64Image.toString(), "base64");

  fs.writeFileSync(filePath, bitmap);
  console.log("******** File created from base64 encoded string ********");
}

module.exports = new Myid();
