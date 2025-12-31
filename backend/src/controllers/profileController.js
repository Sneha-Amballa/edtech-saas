const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    if (user.role === "student") {
      // student profile
      const enrollments = await Enrollment.find({ student: userId }).populate("course").lean();

      const totalEnrolled = enrollments.length;
      const inProgress = enrollments.filter(e => e.status === "in-progress").length;
      const completed = enrollments.filter(e => e.status === "completed").length;

      const completedCourses = enrollments
        .filter((e) => e.status === "completed")
        .map((e) => ({
          courseTitle: e.course?.title || "",
          completionDate: e.certificateIssuedAt || e.completedAt,
          certificateId: e.certificateId || null,
        }));

      return res.json({
        role: user.role,
        name: user.name,
        email: user.email,
        totalEnrolled,
        inProgress,
        completed,
        completedCourses,
      });
    }

    if (user.role === "mentor") {
      // mentor profile
      const courses = await Course.find({ mentor: userId }).lean();
      const courseIds = courses.map(c => c._id);
      const totalCourses = courses.length;
      const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });

      return res.json({
        role: user.role,
        name: user.name,
        email: user.email,
        totalCourses,
        totalEnrollments,
      });
    }

    // default for admin or others
    res.json({ role: user.role, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
