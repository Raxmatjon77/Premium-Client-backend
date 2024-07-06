const { Router } = require("express");
const myidController = require("../controllers/2.myId.js");
let myIdMiddleware = require("../middlewares/check-myid.js");
const  checktoken = require("../middlewares/check-token")
const router = Router();
// router.use(checktoken)
router.post("/",myidController.getMe);
router.get("/base64/:passport", myidController.base64);

module.exports = router;
