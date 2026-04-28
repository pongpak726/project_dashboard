const cron = require("node-cron")
const { ingestAll } = require("../services/ingest.service")

const SITES = ["bangkok_01", "Sikhio-Outbound", "Sikhio-Inbound","Rest Area KM 120"]

// ✅ แก้ cron ให้ skip site ที่ไม่มีข้อมูลแล้ว แทนที่จะ error
cron.schedule("*/10 * * * *", async () => {
  try {
    console.log("Ingesting all sites...")
    // ✅ รันทีละ site ไม่ parallel
    for (const site of SITES) {
      try {
        await ingestAll({ site, limit: 50 })
      } catch (err) {
        console.error(`Ingest failed for ${site}:`, err.message)
      }
    }
    console.log("Done ingest")
  } catch (err) {
    console.error("Cron error:", err.message)
  }
})