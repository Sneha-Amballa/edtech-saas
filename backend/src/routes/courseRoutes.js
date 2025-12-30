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

/* 📦 MULTER */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB for videos
});

/* 🌍 Public – published courses */
router.get("/", async (req, res) => {
  const courses = await Course.find({ published: true }).populate("mentor", "name");
  res.json(courses);
});

/* 👨‍🏫 Mentor – own courses */
router.get("/my", auth, mentorOnly, async (req, res) => {
  const courses = await Course.find({ mentor: req.user.id });
  res.json(courses);
});

/* 🔎 Mentor – get single course */
router.get("/:id", auth, mentorOnly, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (course.mentor.toString() !== req.user.id)
    return res.status(403).json({ message: "Not your course" });

  res.json(course);
});

/* ➕ Create course */
router.post("/", auth, mentorOnly, async (req, res) => {
  const course = await Course.create({
    title: req.body.title,
    description: req.body.description,
    price: req.body.price,
    mentor: req.user.id,
    published: false,
  });
  res.status(201).json(course);
});

/* 🚀 Publish */
router.patch("/:id/publish", auth, mentorOnly, async (req, res) => {
  const course = await Course.findById(req.params.id);
  if (!course) return res.status(404).json({ message: "Course not found" });
  if (course.mentor.toString() !== req.user.id)
    return res.status(403).json({ message: "Not your course" });

  course.published = true;
  await course.save();
  res.json({ message: "Published" });
});

/* 📚 ADD LESSON (TEXT / VIDEO ONLY) */
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

      /* TEXT */
      if (type === "text") {
        course.lessons.push({
          title,
          type,
          content: textContent,
          isFree: isFree === "true",
        });
        await course.save();
        return res.status(201).json(course.lessons);
      }

      /* VIDEO */
      if (type === "video" && req.file) {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video",
            folder: `courses/${course._id}`,
          },
          async (error, result) => {
            if (error) return res.status(500).json({ message: "Upload failed" });

            course.lessons.push({
              title,
              type,
              content: result.secure_url,
              isFree: isFree === "true",
            });

            await course.save();
            res.status(201).json(course.lessons);
          }
        );

        uploadStream.end(req.file.buffer);
        return;
      }

      res.status(400).json({ message: "Invalid lesson data" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to add lesson" });
    }
  }
);

module.exports = router;
