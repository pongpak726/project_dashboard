const express = require("express")
const router = express.Router()
const controller = require("../controllers/external.controller")

router.get("/weather", controller.getWeather)
router.get("/restroom", controller.getRestroom)

module.exports = router