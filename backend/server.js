const express = require("express");

const cors = require("cors");
const helmet = require("helmet")

const userRoute = require("./routes/user.route");
const authRoutes = require("./routes/auth.routes")
const errorHandler = require("./middleware/error");
const dashboardRoutes = require("./routes/external.routes")

require("./utils/cron")

const app = express();

// middleware
app.use(express.json());

app.use(cors());
app.use(helmet());

app.use("/api/users", userRoute);
app.use("/api/auth",authRoutes) ;
app.use("/api/dashboard", dashboardRoutes);

// health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});



app.use(errorHandler);

module.exports = app;

