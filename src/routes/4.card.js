const { Router } = require("express");
const CardController = require("../controllers/4.card.js");
const cardMiddlware = require("../middlewares/check-card.js");
const checkToken = require("../middlewares/check-token.js");
const router = Router();

router.use(checkToken);
router.use(cardMiddlware);
router.post("/sendOtp", CardController.sendOtp);
router.post("/verify", CardController.verify);
router.post("/check", CardController.check);

module.exports = router;
