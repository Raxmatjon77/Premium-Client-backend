

var express = require("express");
require('dotenv').config()
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
let axios = require("axios");
let userRouter=require("./src/routes/1.client-routes")


const app = express();



// PORT
const PORT = process.env.PORT || 3030;


app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

app.use("/api/v3",userRouter);


app.use(helmet());




// testing server
app.get("/", (req, res) => res.send("premium pay "));

// starting server
app.listen(PORT, async () => {
  console.log(`server ready on port:${PORT}`);

});
