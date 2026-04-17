const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")
const allowedRoles = require("../middleware/role")

const controller = require("../controllers/user.controller");

//====validators====
const validate = require("../middleware/validate");
const { createUserSchema,updateUserSchema } = require("../validators/user.validator")


router.get("/", auth,allowedRoles("ADMIN", "SUPER_ADMIN"), controller.getUsers);
router.get("/:id", auth, allowedRoles("ADMIN", "SUPER_ADMIN"), controller.getUserById);
router.post("/", auth, allowedRoles("ADMIN", "SUPER_ADMIN"), validate(createUserSchema), controller.createUser);
router.patch("/:id", auth, allowedRoles("ADMIN", "SUPER_ADMIN"), validate(updateUserSchema), controller.updateUser);
router.delete("/:id", auth, allowedRoles("SUPER_ADMIN"), controller.deleteUser);

module.exports = router;