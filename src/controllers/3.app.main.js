const {
  InternalServerError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} = require("../utils/errors.js");

const base64test =require("../utils/base64.test.js")

let db = require("../config/db.js");
const mime = require("mime-types");
const { exec } = require("child_process");
let axios = require("axios");
// let bot = require("../bot/bot");

const fs = require("fs");
const path = require("path");
const { join } = require("path");
// let pdf_generate = require("../utils/pdf_generate");
class App {
  async getAll(req, res, next) {
    console.log("req.user", req.user);

    if (req.user.role != "SuperAdmin") {
      return next(new ForbiddenError(403,"You do not have permission to this page."));
    }
    let zayavkalar;
    try {
      zayavkalar = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * FROM ClientZayavka`,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              return null;
            }
            resolve(results);
          }
        );
      });

      if (!zayavkalar) {
        return next(new NotFoundError(400));
      }
      console.log("🚀 ~ App ~ getAll ~    all zayavkalar :");
      return res.status(200).json({
        success: true,
        allZayavkalar: zayavkalar,
      });
    } catch (error) {}
  }

  async  clientGetAll(req, res, next) {
 

    if (req.user.role != "client") {
      return res.status(403).json({
        message: "You are not allowed to this url !",
      });
    }
    let zayavkalar;
    try {
      zayavkalar = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * FROM ClientZayavka where client_id=${req.user.id}`,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              return null;
            }
            resolve(results);
          }
        );
      });

      if (!zayavkalar) {
        return next(new NotFoundError(400));
      }
      console.log("🚀 ~ App ~ get All zayavkalar :");
      return res.status(200).json({
        success: true,
        allZayavkalar: zayavkalar,
      });
    } catch (error) {}
  }

  async newZayavka(req, res, next) {


     if (req.user.role != "client") {
       return next(
         new ForbiddenError(403, "You do not have permission to this page.")
       );
     }

   let  newZayavka;
    try {
      let user = await new Promise(function (resolve, reject) {
        db.query(
          `Select * from Client WHERE id=${req.user.id}`,
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
      console.log("🚀 ~ App ~ newZayavka ~ newZayavka:");
      let data = {
        id: req.user.id,
        passport: user.passport,
      };
      let userData = await new Promise(function (resolve, reject) {
        db.query(getInfoUSer(data), function (err, results, fields) {
          // console.log(err);
          if (err) {
            resolve(null);
            return null;
          }

          if (results) {
            resolve(results[0]);
          } else {
            resolve(null);
            return null;
          }
        });
      });

      res.status(200).json({
        // data: zayavka,
        id: req.user.id,
        message: "new Zayavka  ",
        userData: userData,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }

  async createClientZayavka(req, res, next) {
     if (req.user.role != "client") {
       return next(
         new ForbiddenError(403, "You do not have permission to this page !")
       );
     }

    try {
      let user = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * from Client WHERE id=${req.user.id}`,
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

      let {
        id,
        phoneNumber,
        phoneNumber2,
        cardNumber,
        passport_date,
        passport_by,
        address,
        region_id,
        fullname,
        cardId,
      } = req.body;
      req.body.address = JSON.stringify(req.body.address);

      // console.log(req.body);
      req.body.passport = user.passport;

      if (
        !id ||
        !phoneNumber ||
        !phoneNumber2 ||
        !cardId ||
        !passport_date ||
        !passport_by ||
        !address ||
        !region_id ||
        !fullname ||
        !cardNumber
      ) {
        return res.status(400).json({
          status: false,
          message: "all fields are  required !",
        });
      }
      if (cardNumber.length != 16) {
        return res.status(400).json({
          status: false,
          message: "card number must consist of  16 digits !",
        });
      }
      fullname = `${fullname}`;
      fullname = fullname.replaceAll("'", "ʻ");
      passport_by = passport_by.replaceAll("'", "ʻ");

      await new Promise(function (resolve, reject) {
        db.query(
          createClientZayavkaFunc(req.body),

          function (err, results, fields) {
            // console.log(err);
            if (err) {
              resolve(null);
              return null;
            }

            resolve(results);
          }
        );
      });

      let createdzayavka = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * from ClientZayavka WHERE client_id=${req.body.id}`,
          function (err, results, fields) {
            if (err) {
              resolve(null);
              return null;
            }
            if (results.length != 0) {
              resolve(results[results.length - 1]);
            } else {
              resolve(null);
            }
          }
        );
      });

      if (!createdzayavka) {
        return res.status(500).json({
          success: false,
          message: "error occured ",
        });
      }
      return res.status(201).json({
        data: createdzayavka,
        message: "Zayavka created successfully !",
      });
    } catch (error) {
      console.log("error");
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
  async PostScoring(req, res, next) {

     console.log("🚀 ~ App ~ PostScoring ~ ")

     if (req.user.role != "client") {
       return next(
         new ForbiddenError(403, "You do not have permission to this page.")
       );
     }
    try {
      let {
        id,
        max_amount,
        selfie_with_passport,
        passport1,
        passport2,
        birthDate,
        IdentificationVideoBase64,
      } = req.body;

      if (IdentificationVideoBase64) {
        return next(new BadRequestError(400, "Invalid base 64 encoding !"));
      }

      let zayavka = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * from ClientZayavka WHERE id=${req.body.id}`,
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

      let alldata = {
        orderId: "PPD-" + zayavka.id,
        //   amount: Math.floor(max_amount * (1 + val["percent"] / 100)),
        amount: max_amount,
        duration: "12",
        term: "12",
        // passport :zayavka.passport,
        passSeria: zayavka.passport.substring(0, 2),
        passNumber: zayavka.passport.substring(2),
        birthDate: birthDate,
        phoneNumber: zayavka.phoneNumber,
        phoneNumber2: zayavka.phoneNumber2,
        cardNumber: cardNumber,
        inn: process.env.PREMIUM_INN,
        cardId: zayavka.cardId,

        selfie: selfie_with_passport.substring(0, 30),
        identificationVideoBase64: IdentificationVideoBase64.substring(0, 30),
      };

      fs.appendFile(
        path.join(__dirname, "output.txt"),
        `\n ${Date().toString()}` + " >> " + JSON.stringify(alldata),
        (err) => {
          if (err)
            throw {
              err,
              type: "file",
            };
        }
      );

      // return next(new InternalServerError(500, error));
      let url1 = process.env.DAVR_BASE_URL + process.env.DAVR_LOGIN;
      let url2 = process.env.DAVR_BASE_URL + process.env.DAVR_SCORING;

      const response1 = await axios.post(
        url1,
        {
          username: process.env.DAVR_USERNAME,
          password: process.env.DAVR_PASSWORD,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      var filePath = path.join(
        __dirname,
        "..",
        "..",
        "public",
        "myid",
        `${zayavka.passport}.png`
      );
      if (fs.existsSync(filePath)) {
        console.log(filePath);
        var bitmap = fs.readFileSync(filePath);
        const encoded = Buffer(bitmap).toString("base64");
        IdentificationVideoBase64 = `data:image/jpeg;base64,${encoded}`;
        console.log("IdentificationVideoBase64 : " + IdentificationVideoBase64);
      }

      if (!IdentificationVideoBase64 || IdentificationVideoBase64 == null) {
        return next(
          new InternalServerError(500, "IdentificationVideoBase64 error")
        );
      }

      const response2 = await axios.post(
        url2,
        {
          orderId: "PPD-" + zayavka.id,
          // amount: Math.floor(max_amount * (1 + val["percent"] / 100)),
          amount: max_amount,
          term: "12",
          duration: "12",
          passSeria: zayavka.passport.substring(0, 2),
          passNumber: zayavka.passport.substring(2),
          birthDate: birthDate,
          phoneNumber: zayavka.phoneNumber.substring(1),
          phoneNumber2: zayavka.phoneNumber2.substring(1),
          cardId: zayavka.cardId,
          inn: 310187940,
          identificationVideoBase64: IdentificationVideoBase64,
          selfie: selfie_with_passport,
        },
        {
          headers: {
            Authorization: "Bearer " + response1.data["token"],
            "Content-Type": "application/json",
          },
        }
      );

      console.log(response2.data);

      await new Promise(function (resolve, reject) {
        db.query(
          update3ZayavkaFunc({
            ...req.body,
           
          }),
          function (err, results, fields) {
            console.log(err);
            if (err) {
              return resolve(null);
              return null;
            }
            resolve(results);
          }
        );
      });

      let zayavkaUpdated = await new Promise(function (resolve, reject) {
        db.query(
          `SELECT * from Zayavka WHERE id=${id}`,
          function (err, results, fields) {
            console.log(err);
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

      let t1 = setTimeout(async function () {
        let Updatedzayavka = await new Promise(function (resolve, reject) {
          db.query(
            `SELECT * from Zayavka WHERE id=${id}`,
            function (err, results, fields) {
              if (err) {
                console.log(err);
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
        if (Updatedzayavka) {
          if (Updatedzayavka.status == "progress" && Updatedzayavka.step == 3) {
            try {
              var filePath = path.join(
                __dirname,
                "..",
                "..",
                "public",
                "myid",
                `${Updatedzayavka.passport}.png`
              );
              // bot.sendMessage(
              //   "-4009277227",
              //   `<b>MESSAGE : ⚠️ KUTISH VAQTI 4 daqiqadan oshdi\nID: PPD-${id} \nFULLNAME: ${Updatedzayavka.fullname}\n</b>`,
              //   {
              //     parse_mode: "HTML",
              //   }
              // );

              bot.sendPhoto("-4009277227", filePath, {
                parse_mode: "HTML",
                caption: `<b>MESSAGE : ⚠️ KUTISH VAQTI 4 daqiqadan oshdi\nID: PPD-${Updatedzayavka.id} \nFULLNAME: ${Updatedzayavka.fullname}\nADDRESS: ${Updatedzayavka.address.home}\n</b>`,
              });
            } catch (error) {
              bot.sendMessage(2053690211, `${error}`);
            }
          }
        }
        clearTimeout(t1);
      }, 240 * 1000);

      return res.status(200).json({
        data: zayavkaUpdated,
        message: "Update 3 is done",
      });
    } catch (error) {
      console.log("update 3");
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
}
function getInfoUSer(data) {
  let { id, phoneNumber,passport} = data;

  return `select *  from  MyId where pass_seriya='${passport}'; `;
}

function createClientZayavkaFunc(data) {
  let {
    id,
    fullname,
    phoneNumber,
    phoneNumber2,
    cardNumber,
    passport,
    passport_by,
    passport_date,
    address,
    cardId,
    region_id,
    
  } = data;



    return `insert into  ClientZayavka  (fullName,phoneNumber,phoneNumber2,cardNumber,passport_date,passport_by,address,region_id,cardId,client_id,passport) values('${fullname}',${phoneNumber},${phoneNumber2},${cardNumber},'${passport_date}','${passport_by}','${address}',${region_id},'${cardId}',${id},'${passport}') ; `;

  }
  function scoringUpdateZayavkaFunc(data) {
    let { id, max_amount, payment_amount } = data;
    return `UPDATE Zayavka SET step=3,max_amount='${max_amount}' WHERE id = ${id};`;
  }
function insertUpdate3ZayavkaFunc(data) {
  let {
    id,
    fullname,
    phoneNumber,
    phoneNumber2,
    cardNumber,
    passport,
    passport_by,
    passport_date,
    address,
    cardId,
    region_id,
  } = data;

  return `insert into  ClientZayavka  (fullName,phoneNumber,phoneNumber2,cardNumber,passport_date,passport_by,address,region_id,cardId,client_id,passport) values('${fullname}',${phoneNumber},${phoneNumber2},${cardNumber},'${passport_date}','${passport_by}','${address}',${region_id},'${cardId}',${id},'${passport}') ; `;
}

module.exports = new App();