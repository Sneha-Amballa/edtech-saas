const express = require("express");
const jwt = require("jsonwebtoken");
const Course = require("../models/Course");

const router = express.Router();

/* 🔐 SIMPLE AUTH CHECK */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

/* 🎭 ROLE CHECK */
const mentorOnly = (req, res, next) => {
  if (req.user.role !== "mentor") {
    return res.status(403).json({ message: "Mentor access only" });
  }
  next();
};

/* 📌 ROUTES */

// Public – get published courses
router.get("/", async (req, res) => {
  const courses = await Course.find({ published: true }).populate(
    "mentor",
    "name"
  );
  res.json(courses);
});

// Mentor – create course
router.post("/", auth, mentorOnly, async (req, res) => {
  const { title, description, price } = req.body;

  const course = await Course.create({
    title,
    description,
    price,
    mentor: req.user.id,
  });

  res.status(201).json(course);
});

// Mentor – get own courses
router.get("/my", auth, mentorOnly, async (req, res) => {
  const courses = await Course.find({ mentor: req.user.id });
  res.json(courses);
});

module.exports = router;

// Mentor – publish course
router.patch("/:id/publish", auth, mentorOnly, async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return res.status(404).json({ message: "Course not found" });
  }

  // Ensure mentor owns the course
  if (course.mentor.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not your course" });
  }

  course.published = true;
  await course.save();

  res.json({ message: "Course published successfully" });
});
