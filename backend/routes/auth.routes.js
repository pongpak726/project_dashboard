const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.controller");

const validate = require("../middleware/validate");
const { loginSchema, registerSchema } = require("../validators/auth.validators");

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);

module.exports = router;