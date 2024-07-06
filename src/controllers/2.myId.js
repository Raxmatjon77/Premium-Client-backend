const {
  InternalServerError,
  ForbiddenError,
  BadRequestError,
} = require("../utils/errors.js");
let axios = require("axios");
let path = require("path");
let fs = require("fs");
let Fapi=require("../utils/fapi.js")
let db = require("../config/db");
const { log } = require("logrocket");
class Myid {
 

  async getMe(req, res, next) {
    try {
      console.log(">>>>>>>>>>>>>>>>>");

      let { code, base64, passport, birthDate } = req.body;
      console.log("code: " + code);

      const loginData = await Fapi.login();
      let access_token = loginData["access_token"];
      if (code) {
        let url2 = process.env.FAPI_MYID_SDK + "?code=" + code;
        console.log("access_token: " + access_token);
        let response2 = await axios
          .get(
            url2,

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
        console.log("success:");
        console.log(response2.data);
        return res.status(200).json(response2.data);
      } 

      return next(new BadRequestError(400, "Myid Sdk code genereting Error !"));
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
  async base64(req, res, next) {
    try {
      console.log(">>>>>>>>>>>>>>>>>");
      let { passport } = req.params;

      let response3 = await axios
        .get("http://localhost:7070/api/v1/base64/" + passport)
        .then((res) => res)
        .catch((err) => {
          console.log(">>>> Test server ERROR", err.response.data);
          return err.response;
        });

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

async function base64_decode(base64str, filePath) {
  let base64Image = base64str.split(";base64,")[1];
  var bitmap = Buffer.from(base64Image.toString(), "base64");

  const image = await resizeImg(bitmap, {
    width: 480,
    height: 640,
  });

  fs.writeFileSync(filePath, image);

  const newBase64 = fs.readFileSync(filePath, { encoding: "base64" });

  // console.log("******** File created from base64 encoded string ********");
  // console.log(newBase64.slice(50));
  return "data:image/jpeg;base64," + newBase64;
}

module.exports = new Myid();
