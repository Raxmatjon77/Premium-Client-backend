const { Router } = require("express");
const appController = require("../controllers/3.app.main.js");
let checkToken = require("../middlewares/check-token.js");
const router = Router();

router.get("/addZayavka/", checkToken, appController.newZayavka);
router.post("/createZayavka/", checkToken, appController.createClientZayavka);


module.exports = router;
