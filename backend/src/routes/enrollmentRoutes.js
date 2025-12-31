const express = require("express");
const {
  enrollInCourse,
  getMyCourses,
  markLessonComplete,
  getCounts,
  getCertificate,
} = require("../controllers/enrollmentController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

/* Student dashboard → My Courses */
router.get("/my", protect, getMyCourses);
router.get("/my-courses", protect, getMyCourses);

/* Student dashboard → counts */
router.get("/counts", protect, getCounts);

/* Certificate */
router.get("/:courseId/certificate", protect, getCertificate);

/* Student enrolls in a course */
router.post("/:courseId", protect, enrollInCourse);

/* Student marks a lesson complete */
router.post(
  "/:courseId/lesson/:lessonId",
  protect,
  markLessonComplete
);

module.exports = router;
