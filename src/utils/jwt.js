
const JWT = require("jsonwebtoken");

module.exports = {
  sign: (payload) => {
    try {
      return JWT.sign(
        {
          ...payload,
          iat: Math.floor(new Date().add__Hours(-6).getTime() / 1000),
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRATION_TIME,
        }
      );
    } catch (error) {
      console.log(error);
      return new InternalServerError(500, error);
    }
  },

  verify: (token) => {
    try {
      const decodedToken = JWT.verify(token, process.env.JWT_SECRET);

      console.log(decodedToken);
    
      return decodedToken;
    } catch (error) {
      throw error;
    }
  },
};

Date.prototype.add__Hours = function (h) {
  this.setHours(this.getHours() + h);
  return this;
};
