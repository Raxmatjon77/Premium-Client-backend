const {
  AuthorizationError,
  ForbiddenError,
  InternalServerError,
  InvalidTokenError,
  UnAvailableError,
} = require("../utils/errors.js");
const { TokenExpiredError, JsonWebTokenError } = require("jsonwebtoken");

let db = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    console.log(req.body);
    let myIdData = await new Promise(function (resolve, reject) {
      db.query(
        `Select * from MyId WHERE pass_seriya='${req.body.passport}' and Date(now()) < Date(created_day + INTERVAL 1 YEAR)`,
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

    if (!myIdData) {
      return next();
    }

    console.log("my id ---", myIdData);
    return res.status(200).json({
      response_id: myIdData.response_id,
      comparison_value: myIdData.comparison_value,
      result_code: 1,
      result_note: "Все проверки успешно прошли",
      profile: myIdData.profile,
    });
  } catch (error) {
    console.log("????????????");
    console.log(error);

    return next(new InternalServerError(500, error));
  }
};
