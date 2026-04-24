const cron = require("node-cron")
const { ingestAll } = require("../services/ingest.service")

const SITES = ["bangkok_01", "Sikhio-Outbound", "Sikhio-Inbound"]

cron.schedule("*/5 * * * *", async () => {
  try {
    console.log("Ingesting all sites...")
    await Promise.all(SITES.map(site => ingestAll({ site, limit: 50 })))
    console.log("Done ingest")
  } catch (err) {
    console.error("Ingest failed:", err.message)  // ✅ ไม่ crash
  }
})