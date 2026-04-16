const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth")
const allowedRoles = require("../middleware/role")

const controller = require("../controllers/user.controller");

router.get("/", auth,allowedRoles("ADMIN", "SUPER_ADMIN"), controller.getUsers);
router.get("/:id", controller.getUserById);
router.post("/", controller.createUser);
router.patch("/:id", controller.updateUser);
router.delete("/:id", controller.deleteUser);

module.exports = router;