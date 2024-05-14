const { Router } = require("express");
const User = require("../controllers/1.login.js");

const router = Router();

router.post("/user", User.login);
router.post("/user/verify", User.verify);
module.exports = router;


