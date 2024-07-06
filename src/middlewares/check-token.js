const jwt = require("../utils/jwt.js");

const {
  AuthorizationError,
  ForbiddenError,
  InternalServerError,
  InvalidTokenError,
  NotFoundError,
} = require("../utils/errors.js");
const { TokenExpiredError, JsonWebTokenError } = require("jsonwebtoken");

let db = require("../config/db");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const queryTOKEN = req.query.authorization;
    let token = authHeader && authHeader.split(" ")[1];
    if (!token) {
      token = queryTOKEN;
    }

    if (!token) {
      return next(new AuthorizationError(401, "No token provided"));
    }

    let { userId, phoneNumber,role} = jwt.verify(token);
 
    console.log("role", role);

    let user;
    if(role === "client") {
         user = await new Promise(function (resolve, reject) {
           db.query(
             `SELECT * from Client WHERE id='${userId}' and phoneNumber='${phoneNumber}'`,
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
    }
    else if (role == "SuperAdmin") {
         user = await new Promise(function (resolve, reject) {
           db.query(
             `SELECT * from SuperAdmin WHERE id='${userId}'`,
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
    }
    console.log("user:",user);
    if (user) {
      req.user = {
        userId: user["id"],
        phoneNumber: user["phoneNumber"],
        role: user["role"],
      };
        return next();
    }
    return next(new NotFoundError(400,"User not found !"))
  
  } catch (error) {
    console.log("check token >>");
    console.log(error);
    if (error instanceof TokenExpiredError) {
      return next(new AuthorizationError(401, "Token has expired"));
    } else if (error instanceof JsonWebTokenError) {
      console.log(error);
      return next(new InvalidTokenError(401, "Malformed token"));
    }

    return next(new InternalServerError(500, error));
  }
};
