const { Router } = require("express");
const myIdController = require("../controllers/2.myId.js");
let myIdMiddleware = require("../middlewares/check-myid.js");
const router = Router();

router.post("/getme/",myIdMiddleware,myIdController.getMe);

module.exports = router;
