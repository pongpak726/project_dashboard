const express = require("express")
const router = express.Router()
const controller = require("../controllers/external.controller")

router.get("/weather", controller.getWeather)
router.get("/restroom", controller.getRestroom)
router.get("/overview", controller.getOverview)
router.get("/parking", controller.getParking)


module.exports = router

// รอ update 
// 1. prefix version (production)
// 2. validation
// 