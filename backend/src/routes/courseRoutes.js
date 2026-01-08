const express = require("express");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const Course = require("../models/Course");
const cloudinary = require("../cloudinary");

const Enrollment = require("../models/Enrollment");
const router = express.Router();

/* ================= AUTH ================= */
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded._id,
      role: decoded.role,
    };
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const mentorOnly = (req, res, next) => {
  if (req.user.role !== "mentor") {
    return res.status(403).json({ message: "Mentor access only" });
  }
  next();
};

/* ================= MULTER ================= */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB
});

// Helper: reconcile enrollments after course changes
async function reconcileEnrollments(course, editTime) {
  try {
    const lessonIds = (course.lessons || []).map((l) => l._id.toString());

    const enrollments = await Enrollment.find({ course: course._id });

    for (const e of enrollments) {
      // Preserve students who completed BEFORE the edit time
      if (e.status === "completed" && e.completedAt && e.completedAt < editTime) {
        continue;
      }

      // Filter completed lessons to those that still exist
      const filtered = (e.completedLessons || []).filter((id) =>
        lessonIds.includes(id.toString())
      );

      e.completedLessons = filtered;

      const total = lessonIds.length;
      const completedCount = filtered.length;
      e.progress = total === 0 ? 0 : Math.round((completedCount / total) * 100);

      if (completedCount === total && total > 0) {
        if (e.status !== "completed") {
          e.status = "completed";
          e.completedAt = new Date();
          if (!e.certificateId) {
            const crypto = require("crypto");
            const cid = `CERT-${crypto
              .randomBytes(6)
              .toString("hex")
              .toUpperCase()}`;
            e.certificateId = cid;
            e.certificateIssuedAt = new Date();
          }
        }
      } else {
        e.status = "in-progress";
      }

      await e.save();
    }
  } catch (err) {
    console.error("[courses] reconcile error:", err);
  }
}

/* =========================================================
   PUBLIC ROUTES
========================================================= */

/* 🌍 Get all published courses */
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find({ published: true })
      .populate("mentor", "name");
    // Include an `instructor` alias for frontend compatibility
    const response = courses.map((c) => {
      const obj = c.toObject();
      obj.instructor = obj.mentor;
      return obj;
    });

    res.json(response);
  } catch {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

/* 👀 Student – public course */
router.get("/:id/public", async (req, res) => {
  try {
    console.log('[courses] fetching public course id=', req.params.id);
    const course = await Course.findById(req.params.id)
      .populate("mentor", "name");

    if (!course) {
      console.log('[courses] course not found for id=', req.params.id);
      return res.status(404).json({ message: "Course not found" });
    }

    if (!course.published) {
      console.log('[courses] course not published id=', req.params.id);
      return res.status(404).json({ message: "Course not found" });
    }

    const lessons = course.lessons
      .filter(l => l.type === "text" || l.type === "video") // 🚫 block old pdf
      .map(l => ({
        _id: l._id,
        title: l.title,
        type: l.type,
        isFree: l.isFree,
        content: l.isFree ? l.content : null,
      }));

    // Determine if the requesting user (if any) is enrolled
    let isEnrolled = false;
    const token = req.headers.authorization?.split(" ")[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const existing = await Enrollment.findOne({
          student: decoded._id,
          course: course._id,
        });
        if (existing) isEnrolled = true;
      } catch (e) {
        // ignore invalid token — treat as not enrolled
      }
    }

    res.json({
      _id: course._id,
      title: course.title,
      description: course.description,
      price: course.price,
      instructor: course.mentor, // alias for frontend
      lessons,
      enrolledCount: course.enrolledCount || 0,
      isEnrolled,
    });
  } catch (err) {
    console.error('[courses] fetch public error:', err);
    res.status(500).json({ message: "Failed to load course" });
  }
});

/* =========================================================
   MENTOR ROUTES
========================================================= */

/* 👨‍🏫 Mentor – own courses */
router.get("/my", auth, mentorOnly, async (req, res) => {
  try {
    const courses = await Course.find({ mentor: req.user.id });
    res.json(courses);
  } catch {
    res.status(500).json({ message: "Failed to fetch courses" });
  }
});

/* 🔧 Mentor – manage course */
router.get("/:id/manage", auth, mentorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.mentor) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.mentor) !== req.user.id) {
      return res.status(403).json({ message: "Not your course" });
    }

    // Remove any legacy pdf lessons safely
    course.lessons = course.lessons.filter(
      l => l.type === "text" || l.type === "video"
    );

    res.json(course);
  } catch {
    res.status(500).json({ message: "Failed to load course" });
  }
});

/* ➕ Create course */
router.post("/", auth, mentorOnly, async (req, res) => {
  try {
    const course = await Course.create({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      mentor: req.user.id,
      published: false,
    });

    res.status(201).json(course);
  } catch {
    res.status(500).json({ message: "Course creation failed" });
  }
});

/* ✏️ Mentor – update course details */
router.put("/:id", auth, mentorOnly, async (req, res) => {
  try {
    const { title, description, price } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course || !course.mentor) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.mentor) !== req.user.id) {
      return res.status(403).json({ message: "Not your course" });
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = price;

    await course.save();

    // reconcile enrollments — use current time as edit marker
    await reconcileEnrollments(course, new Date());

    res.json({ message: "Course updated", course });
  } catch (err) {
    console.error('[courses] update error:', err);
    res.status(500).json({ message: "Course update failed" });
  }
});

/* 🚀 Publish course */
router.patch("/:id/publish", auth, mentorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.mentor) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.mentor) !== req.user.id) {
      return res.status(403).json({ message: "Not your course" });
    }

    course.published = true;
    await course.save();

    res.json({ message: "Course published" });
  } catch {
    res.status(500).json({ message: "Publish failed" });
  }
});

/* 📚 ADD LESSON — TEXT / VIDEO ONLY */
router.post(
  "/:id/lessons",
  auth,
  mentorOnly,
  upload.single("file"),
  async (req, res) => {
    try {
      const { title, type, textContent, isFree } = req.body;

      if (!["text", "video"].includes(type)) {
        return res.status(400).json({ message: "Invalid lesson type" });
      }

      const course = await Course.findById(req.params.id);
      if (!course || !course.mentor) {
        return res.status(404).json({ message: "Course not found" });
      }

      if (String(course.mentor) !== req.user.id) {
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
          async (err, result) => {
            if (err) {
              return res.status(500).json({ message: "Video upload failed" });
            }

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
    } catch {
      res.status(500).json({ message: "Lesson creation failed" });
    }
  }
);

/* 🛠️ Mentor – edit a lesson (title, content, isFree) */
router.patch("/:id/lessons/:lessonId", auth, mentorOnly, async (req, res) => {
  try {
    const { title, textContent, isFree } = req.body;

    const course = await Course.findById(req.params.id);
    if (!course || !course.mentor) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.mentor) !== req.user.id) {
      return res.status(403).json({ message: "Not your course" });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    if (title !== undefined) lesson.title = title;
    if (textContent !== undefined) lesson.content = textContent;
    if (isFree !== undefined) lesson.isFree = isFree === "true" || isFree === true;

    await course.save();

    await reconcileEnrollments(course, new Date());

    res.json({ message: "Lesson updated", lesson });
  } catch (err) {
    console.error('[courses] edit lesson error:', err);
    res.status(500).json({ message: "Lesson update failed" });
  }
});

/* 🗑️ Mentor – delete a lesson */
router.delete("/:id/lessons/:lessonId", auth, mentorOnly, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course || !course.mentor) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (String(course.mentor) !== req.user.id) {
      return res.status(403).json({ message: "Not your course" });
    }

    const lesson = course.lessons.id(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    lesson.remove();
    await course.save();

    // reconcile enrollments after deletion
    await reconcileEnrollments(course, new Date());

    res.json({ message: "Lesson deleted" });
  } catch (err) {
    console.error('[courses] delete lesson error:', err);
    res.status(500).json({ message: "Lesson deletion failed" });
  }
});

module.exports = router;
