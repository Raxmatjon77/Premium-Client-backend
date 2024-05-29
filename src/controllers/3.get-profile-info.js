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
 async getInfo(req,res,next){
  
    let id=req.body.id
    try {
        if (id) {
          let profileData = await new Promise(function (resolve, reject) {
            db.query(
              `Select * from client WHERE id='${id}'`,
              function (err, results, fields) {
                if (err) {
                  resolve(null);
                  return null;
                }
                // console.log("++++", results);
                if (results.length != 0) {
                  resolve(results[0]);
                } else {
                  resolve(null);
                }
              }
            );
          });

          return res.status(200).json({
            message: "success",
            preofileData: profileData,
          });
        }
    } catch (error) {
        console.log(error);
    }
   
 }

 

  
}

module.exports = new Myid();
