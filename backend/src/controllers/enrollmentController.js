const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const crypto = require("crypto");

/* ---------------- ENROLL STUDENT ---------------- */
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(courseId);
    if (!course || !course.published) {
      return res.status(404).json({ message: "Course not available" });
    }

    const alreadyEnrolled = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (alreadyEnrolled) {
      return res
        .status(400)
        .json({ message: "Already enrolled in this course" });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      completedLessons: [],
      status: "in-progress",
      progress: 0,
    });

    course.enrolledCount += 1;
    await course.save();

    res.status(201).json({
      message: "Enrolled successfully",
      enrollment,
      enrolledCount: course.enrolledCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Enrollment failed" });
  }
};



/* ---------------- MARK LESSON COMPLETE ---------------- */
exports.markLessonComplete = async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You are not enrolled in this course",
      });
    }

    const alreadyCompleted = enrollment.completedLessons.some(
      (id) => id.toString() === lessonId
    );

    if (alreadyCompleted) {
      return res.json({ message: "Lesson already completed" });
    }

    enrollment.completedLessons.push(lessonId);

    const course = await Course.findById(courseId);
    if (!course || !course.lessons) {
      return res.status(404).json({ message: "Course not found" });
    }

    const total = course.lessons.length;
    const completed = enrollment.completedLessons.length;

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    enrollment.progress = progress;

    if (progress === 100) {
      enrollment.completedAt = new Date();
      enrollment.status = "completed";
      // generate certificate if not already present
      if (!enrollment.certificateId) {
        const cid = `CERT-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;
        enrollment.certificateId = cid;
        enrollment.certificateIssuedAt = new Date();
      }
    } else {
      enrollment.status = "in-progress";
    }

    await enrollment.save();

    // return updated enrollment + user counts so frontend can update dashboard
    const inProgressCount = await Enrollment.countDocuments({
      student: studentId,
      status: "in-progress",
    });

    const completedCount = await Enrollment.countDocuments({
      student: studentId,
      status: "completed",
    });

    const enrolledCount = await Enrollment.countDocuments({
      student: studentId,
    });

    res.json({
      message: "Lesson marked complete",
      enrollment,
      counts: {
        enrolledCount,
        inProgressCount,
        completedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark lesson complete" });
  }
};




/* ---------------- MY COURSES (STUDENT) ---------------- */
exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
    })
      .populate("course")
      .lean();

    const formatted = enrollments.map((e) => {
      const totalLessons = e.course.lessons.length;
      const completedLessonsArray = e.completedLessons || [];
      const completedLessonsCount = completedLessonsArray.length;

      const progress = e.progress ?? (totalLessons === 0 ? 0 : Math.round((completedLessonsCount / totalLessons) * 100));

      return {
        _id: e._id,
        course: e.course,
        status: e.status,
        progress,
        completedLessons: completedLessonsArray,
        completedLessonsCount,
        totalLessons,
      };
    });

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch enrolled courses" });
  }
};


exports.getCounts = async (req, res) => {
  try {
    const studentId = req.user._id;

    const enrolledCount = await Enrollment.countDocuments({ student: studentId });
    const inProgressCount = await Enrollment.countDocuments({ student: studentId, status: "in-progress" });
    const completedCount = await Enrollment.countDocuments({ student: studentId, status: "completed" });

    res.json({ enrolledCount, inProgressCount, completedCount });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch counts" });
  }
};


exports.getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const studentId = req.user._id;

    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId })
      .populate({ path: "course", populate: { path: "mentor", select: "name" } })
      .lean();

    if (!enrollment || enrollment.status !== "completed") {
      return res.status(404).json({ message: "Certificate not available" });
    }

    const certificate = {
      studentName: req.user.name || `${req.user.email}`,
      courseTitle: enrollment.course.title,
      mentorName: enrollment.course.mentor?.name || "",
      completionDate: enrollment.certificateIssuedAt || enrollment.completedAt,
      certificateId: enrollment.certificateId,
    };

    res.json({ certificate });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch certificate" });
  }
};

