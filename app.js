

var express = require("express");
require('dotenv').config()
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
let axios = require("axios");
let userRouter=require("./src/routes/1.login-routes")
let myidRouter = require("./src/routes/2.myid-login");
let appRouter = require("./src/routes/3.app-routes");
let cardRouter = require("./src/routes/4.card.js");


const app = express();



// PORT
const PORT = process.env.PORT || 3030;


app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/v1/myid/", myidRouter);
app.use("/api/v1/user/",userRouter);
app.use("/api/v1/app/", appRouter);
app.use("/api/v1/card/", cardRouter);



app.use(helmet());




// testing server
app.get("/", (req, res) => res.send("premium pay "));

// starting server
app.listen(PORT, async () => {
  console.log(`server ready on port:${PORT}`);

});
