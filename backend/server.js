const express = require("express");
const app = express();
const cors = require("cors");

const userRoute = require("./routes/user.route");

// middleware
app.use(express.json());

app.use(cors());

app.use("/users", userRoute);

// health check
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});



module.exports = app;

