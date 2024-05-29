const { Router } = require("express");
const User = require("../controllers/1.login.js");
const Myid = require("../controllers/2.myId.js");
const userouter = Router();

userouter.post("/login", User.login);
userouter.post("/verify", User.verify);
userouter.post("/getme/", Myid.getMe);
module.exports = userouter;


