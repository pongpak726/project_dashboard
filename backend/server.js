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

// external API
app.get('/api/external', async (req, res, next) => {
  try {
    const response = await fetch(process.env.EXTERNAL_API, {
      headers: {
        Authorization: `Bearer ${process.env.SECRET_API}`,
        "Content-Type": "application/json"
      },
    })

    if (!response.ok) {
      throw new Error(`External API error: ${response.status}`)
    }

    const data = await response.json()

    res.json(data)
  } catch (err) {
    next(err) // ส่งไป errorHandler
  }
})


app.use(errorHandler);

module.exports = app;

