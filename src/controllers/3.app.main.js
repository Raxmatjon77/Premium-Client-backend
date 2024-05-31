const {
  InternalServerError,
  ForbiddenError,
  NotFoundError,
  BadRequestError,
} = require("../utils/errors.js");

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
  async newZayavka(req, res, next) {
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
      req.body.address = JSON.stringify(req.body.address)
  
        // console.log(req.body);
      req.body.passport= user.passport;
     
      if (!id  ||   !phoneNumber  || !phoneNumber2 || !cardId || !passport_date || !passport_by || !address || !region_id || !fullname || !cardNumber) {

        return res.status(400).json({
          status:false,
          message:"all fields are  required !"
        })
      }
      if (cardNumber.length!=16) {
        
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

module.exports = new App();