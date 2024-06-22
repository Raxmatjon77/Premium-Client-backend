
var express = require("express");
const morgan = require("morgan");
require('dotenv').config()
const cors = require("cors");

const helmet = require("helmet");
const path = require("path");

const bodyParser = require("body-parser");
let axios = require("axios");
let userRouter=require("./src/routes/1.login-routes")
let myidRouter = require("./src/routes/2.myid-login");
let appRouter = require("./src/routes/3.app-routes");
let cardRouter = require("./src/routes/4.card.js");
const errorHandler = require("./src/middlewares/error-handler.js");


const app = express();

const PORT = process.env.PORT || 3030;



app.use(express.json({ limit: "20mb" }));

app.use(express.urlencoded({ extended: true, limit: "20mb" }));
morgan.token(
  "ip",
  (req) => req.headers["x-forwarded-for"] || req.connection.remoteAddress
);

app.use(morgan(":method :url :status :response-time ms - :ip"));
app.use("/api/v1/myid/", myidRouter);
app.use("/api/v1/user/",userRouter);
app.use("/api/v1/zayavka/", appRouter);
app.use("/api/v1/card/", cardRouter);

app.use(errorHandler)

app.use(helmet());



// testing server
app.get("/", (req, res) => res.send("premium pay "));

const fs = require("fs");

function imageToBase64(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(`Error reading file: ${err.message}`);
      } else {
        const base64Image = data.toString("base64");
        resolve(base64Image);
      }
    });
  });
}



// starting server
app.listen(PORT, async () => {
  console.log(`server ready on port:${PORT}`);

});
