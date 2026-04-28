const express = require("express")
const router = express.Router()
const upload = require("../utils/upload")
const controller = require("../controllers/vms.controller")

router.post("/ingest", upload.single("image"), controller.ingestVMS)

router.get("/latesvms", controller.getVMS)        //  list ล่าสุด
router.get("/logs", controller.getVMSLogs)        //  history

router.patch("/:id/location", controller.updateVMSLocation)

module.exports = router