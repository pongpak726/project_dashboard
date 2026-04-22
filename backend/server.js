const express = require("express");
const app = express();
const cors = require("cors");
const helmet = require("helmet")

const userRoute = require("./routes/user.route");
const authRoutes = require("./routes/auth.routes")
const errorHandler = require("./middleware/error");
const weatherRoutes = require("./routes/external.routes")

// middleware
app.use(express.json());

app.use(cors());
app.use(helmet());

app.use("/api/users", userRoute);
app.use("/api/auth",authRoutes) ;
app.use("/api/dashboard", weatherRoutes);

// health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});



app.use(errorHandler);

module.exports = app;

