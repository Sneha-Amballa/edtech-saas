const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const enrollmentRoutes = require("./src/routes/enrollmentRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);


app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

module.exports = app;