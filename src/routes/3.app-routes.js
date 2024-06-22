const { Router } = require("express");
const appController = require("../controllers/3.app.main.js");
let checkToken = require("../middlewares/check-token.js");
const router = Router();

router.post("/add/", checkToken, appController.newZayavka);
router.get("/getAll/", checkToken, appController.getAll);
router.post("/create/", checkToken, appController.createClientZayavka);
router.post("/scoring/", checkToken,appController.PostScoring);
router.get("/clientGetAll/",checkToken, appController.clientGetAll);


module.exports = router;
