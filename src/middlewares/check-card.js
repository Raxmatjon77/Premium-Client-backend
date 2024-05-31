const jwt = require("../utils/jwt.js");
const {
  AuthorizationError,
  ForbiddenError,
  InternalServerError,
  InvalidTokenError,
} = require("../utils/errors.js");
const { TokenExpiredError, JsonWebTokenError } = require("jsonwebtoken");
module.exports = async (req, res, next) => {
  try {
    console.log("req.body.data :", req.body.data);
    let token = req.body.data;
    if (!token) {
      return next(new AuthorizationError(401, "No token provided"));
    }
    console.log("token :", token);
    let data = jwt.verify(token);
    console.log("data :", data);
    req.user.data = data;

    return next();
  } catch (error) {
    console.log("custom middlware >>");
    console.log(error);
    if (error instanceof TokenExpiredError) {
      return next(new AuthorizationError(401, "Token has expired"));
    } else if (error instanceof JsonWebTokenError) {
      return next(new InvalidTokenError(401, "Malformed token"));
    }

    return next(new InternalServerError(500, error));
  }
};
