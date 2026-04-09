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

// const express = require("express");
// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();
// const app = express();

// app.use(express.json());

// app.get("/", (req, res) => {
//   res.send("Backend is running");
// });

// app.get("/users", async (req, res) => {
//   const users = await prisma.user.findMany();
//   res.json(users);
// });

// app.post("/users", async (req, res) => {
//   const user = await prisma.user.create({
//     data: req.body
//   });
//   res.json(user);
// });

// app.listen(5000, () => {
//   console.log("Server running on http://localhost:5000");
// });