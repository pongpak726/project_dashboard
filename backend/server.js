const express = require("express")
const cors = require("cors")
const helmet = require("helmet")

const userRoute = require("./routes/user.route")
const authRoutes = require("./routes/auth.routes")
const errorHandler = require("./middleware/error")
const dashboardRoutes = require("./routes/external.routes")
const vmsRoutes = require("./routes/vms.routes")
const docRoutes = require("./routes/doc.routes")

require("./utils/cron")

const app = express()

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true
}

app.use(cors(corsOptions))        // ✅ cors ก่อน helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }  // ✅ อนุญาต static files
}))
app.use(express.json())

// ✅ uploads ก่อน api routes
app.use("/uploads", express.static("uploads"))

app.use("/api/users", userRoute)
app.use("/api/auth", authRoutes)
app.use("/api/dashboard", dashboardRoutes)
app.use("/api/vms", vmsRoutes)

app.get("/", (req, res) => res.send("Backend running 🚀"))
app.use("/api-docs", docRoutes)

app.use(errorHandler)

module.exports = app