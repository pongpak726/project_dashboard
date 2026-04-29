const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const allowedRoles = require("../middleware/role")
const controller = require("../controllers/log.controller")

router.get("/", auth, allowedRoles("ADMIN", "SUPER_ADMIN"), controller.getLogs)

module.exports = router