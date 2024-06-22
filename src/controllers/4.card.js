let axios = require("axios");
let {
  InternalServerError,
  BadRequestError,
  ForbiddenError,
} = require("../utils/errors.js");
const jwt = require("../utils/jwt.js");

class CardController {
  async sendOtp(req, res, next) {
    let { cardNumber, expiry } = req.user.data;

    function isNumeric(num) {
      return !isNaN(num);
    }
    try {
      if (cardNumber.length != 16 || !isNumeric(cardNumber)) {
        return next(new BadRequestError(400, "Invalid card number"));
      }
      if (expiry.length != 4 || !isNumeric(expiry)) {
        return next(new BadRequestError(400, "Invalid expiration date !"));
      }
      expiry = expiry.substring(2) + expiry.substring(0, 2);
      let url1 = process.env.DAVR_BASE_URL + process.env.DAVR_LOGIN;
      let url2 = process.env.DAVR_BASE_URL + "/card/sendOTP";
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
      const response2 = await axios.post(
        url2,
        {
          card: cardNumber,
          expiry: expiry,
        },
        {
          headers: {
            Authorization: "Bearer " + response1.data["token"],
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response2.data);
      if (response2.data["successCode"] != 0) {
        return next(
          new BadRequestError(400, response2.data["error"]["message"])
        );
      }

      const token = jwt.sign({
        data: response2.data["result"],
      });

      return res.status(200).json({
        success: true,
        data: token,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
  async verify(req, res, next) {
    const { id, code, type } = req.user.data;
    if (code.length != 6) {
      return next(new BadRequestError(400, "code must consist of 6 numbers!"));
    }

    try {
      let url1 = process.env.DAVR_BASE_URL + process.env.DAVR_LOGIN;
      let url2 = process.env.DAVR_BASE_URL + "/card/verify";
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
      console.log(response1.data);
      const response2 = await axios.post(
        url2,
        {
          id,
          code,
          type,
        },
        {
          headers: {
            Authorization: "Bearer " + response1.data["token"],
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response2.data);
      if (response2.data["successCode"] != 0) {
        return next(
          new BadRequestError(400, response2.data["error"]["message"])
        );
      }
      const token = jwt.sign({
        data: response2.data["result"],
      });

      return res.status(200).json({
        success: true,
        data: token,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
  async check(req, res, next) {
    const { cardNumber } = req.user.data;

    function isNumeric(num) {
      return !isNaN(num);
    }
    try {
      if (cardNumber.length != 16 || !isNumeric(cardNumber)) {
        return next(new BadRequestError(400, "Invalid card number"));
      }

      let url1 = process.env.DAVR_BASE_URL + process.env.DAVR_LOGIN;
      let url2 = process.env.DAVR_BASE_URL + "/card/check";
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
      let response2 = await axios
        .post(
          url2,
          {
            card: cardNumber,
          },
          {
            
            headers: {
              Authorization: "Bearer " + response1.data["token"],
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => res)
        .catch((err) => err.response);
      let k = 2;

      console.log(response2.data);
      if (response2.status != 200) {
        while (k > 0) {
          k = k - 1;
          response2 = await axios
            .post(
              url2,
              {
                card: cardNumber,
              },
              {
                headers: {
                  Authorization: "Bearer " + response1.data["token"],
                  "Content-Type": "application/json",
                },
              }
            )
            .then((res) => res)
            .catch((err) => err.response);
          if (response2.status == 200) {
            break;
          }
        }

        console.log(response2.data);
      }

      if (response2.data["successCode"] != 0) {
        return next(
          new BadRequestError(400, response2.data["error"]["message"])
        );
      }

      if (response2.status != 200) {
        throw response2;
      }

      const token = jwt.sign({
        data: response2.data["result"],
      });

      console.log({ success: true, data: token });
      return res.status(200).json({
        success: true,
        data: token,
      });
    } catch (error) {
      console.log(error);
      return next(new InternalServerError(500, error));
    }
  }
}

module.exports = new CardController();
