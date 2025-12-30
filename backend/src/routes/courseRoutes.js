const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Course = require("../models/Course");
const cloudinary = require("../cloudinary");

const router = express.Router();

/* 🔐 AUTH */
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

/* 🎭 ROLE */
const mentorOnly = (req, res, next) => {
  if (req.user.role !== "mentor") {
    return res.status(403).json({ message: "Mentor access only" });
  }
  next();
};

/* 📦 MULTER (MEMORY) */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/* ---------------- ROUTES ---------------- */

// Public – published courses
router.get("/", async (req, res) => {
  const courses = await Course.find({ published: true }).populate("mentor", "name");
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

// Mentor – publish course
router.patch("/:id/publish", auth, mentorOnly, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });

  if (course.mentor.toString() !== req.user.id) {
    return res.status(403).json({ message: "Not your course" });
  }

  course.published = true;
  await course.save();

  res.json({ message: "Course published successfully" });
});

// 🔥 ADD LESSON (TEXT / VIDEO / PDF)
router.post(
  "/:id/lessons",
  auth,
  mentorOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, type, textContent, isFree } = req.body;

      const course = await Course.findById(req.params.id);
      if (!course) return res.status(404).json({ message: "Course not found" });

      if (course.mentor.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not your course" });
      }

      let content = "";

      // TEXT lesson
      if (type === "text") {
        content = textContent;
      }

      // VIDEO or PDF
      if (type === "video" || type === "pdf") {
        if (!req.file) {
          return res.status(400).json({ message: "File required" });
        }

        const uploadResult = await cloudinary.uploader.upload_stream(
          {
            resource_type: type === "video" ? "video" : "raw",
            folder: `courses/${course._id}`,
          },
          async (error, result) => {
            if (error) throw error;

            course.lessons.push({
              title,
              type,
              content: result.secure_url,
              isFree: isFree === "true",
            });

            await course.save();

            res.status(201).json({
              message: "Lesson added successfully",
              lessons: course.lessons,
            });
          }
        );

        uploadResult.end(req.file.buffer);
        return;
      }

      // Save TEXT lesson
      course.lessons.push({
        title,
        type,
        content,
        isFree: isFree === "true",
      });

      await course.save();

      res.status(201).json({
        message: "Lesson added successfully",
        lessons: course.lessons,
      });

    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      res.status(500).json({ message: "Failed to add lesson" });
    }
  }
);

module.exports = router;
