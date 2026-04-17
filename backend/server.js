const express = require("express");
const app = express();
const cors = require("cors");

const userRoute = require("./routes/user.route");
const authRoutes = require("./routes/auth.routes")
const errorHandler = require("./middleware/error");

// middleware
app.use(express.json());

app.use(cors());

app.use("/api/users", userRoute);
app.use("/api/auth",authRoutes) ;

// health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.use(errorHandler);

module.exports = app;

