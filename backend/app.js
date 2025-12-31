const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const courseRoutes = require("./src/routes/courseRoutes");
const enrollmentRoutes = require("./src/routes/enrollmentRoutes");
const profileRoutes = require("./src/routes/profileRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/profile", profileRoutes);


app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

module.exports = app;