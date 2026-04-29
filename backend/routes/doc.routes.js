const express = require("express")
const router = express.Router()

const swaggerUi = require("swagger-ui-express")
const YAML = require("yamljs")
const path = require("path")

// 🔥 load swagger.yaml แบบ safe
const swaggerDocument = YAML.load(
  path.join(__dirname, "../swagger.yaml")
)

// 👉 serve swagger UI + custom config
router.use(
  "/",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: "Dashboard API Docs 🚀",

    swaggerOptions: {
      docExpansion: "none",             // collapse ทั้งหมด
      defaultModelsExpandDepth: -1,     // ซ่อน schema
      displayRequestDuration: true
    },

    customCss: `
      .topbar { display: none }
      body { background: #0f172a }
      .swagger-ui { color: #e2e8f0 }
      .swagger-ui .opblock {
        border-radius: 10px;
        background: #1e293b;
        border: none;
      }
      .swagger-ui .opblock-summary {
        color: #f1f5f9;
      }
    `
  })
)

module.exports = router