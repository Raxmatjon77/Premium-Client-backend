const { Router } = require("express");
const myIdController = require("../controllers/2.myId.js");
let myIdMiddleware = require("../middlewares/check-myid.js");
const  checktoken = require("../middlewares/check-token")
const router = Router();

router.post("/getme/", checktoken,myIdMiddleware, myIdController.getMe);

module.exports = router;
