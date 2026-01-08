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

      // Course-wise progress for the student
      const coursesWithProgress = enrollments.map(e => ({
        id: e.course?._id,
        title: e.course?.title || e.course?.name || "",
        progress: e.progress || 0,
        status: e.status,
        avgScore: e.avgScore || null,
      }));

      // Learning activity over last 6 months (by enrollment date)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const monthlyAgg = await Enrollment.aggregate([
        { $match: { student: user._id, createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      const labels = [];
      const values = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.push(d.toLocaleString('default', { month: 'short' }));
        const found = monthlyAgg.find(m => m._id === key);
        values.push(found ? found.count : 0);
      }

      return res.json({
        role: user.role,
        name: user.name,
        email: user.email,
        totalEnrolled,
        inProgress,
        completed,
        completedCourses,
        courses: coursesWithProgress,
        enrollmentsOverTime: { labels, data: values },
      });
    }

    if (user.role === "mentor") {
      // mentor profile
      const courses = await Course.find({ mentor: userId }).lean();
      const courseIds = courses.map(c => c._id);
      const totalCourses = courses.length;
      const totalEnrollments = await Enrollment.countDocuments({ course: { $in: courseIds } });

      // Per-course stats: enrollments and completions
      const enrollAgg = await Enrollment.aggregate([
        { $match: { course: { $in: courseIds } } },
        { $group: { _id: "$course", enrollments: { $sum: 1 }, completions: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } } } }
      ]);

      const enrollMap = {};
      enrollAgg.forEach(e => {
        enrollMap[e._id.toString()] = { enrollments: e.enrollments, completions: e.completions };
      });

      const coursesWithStats = courses.map(c => {
        const stats = enrollMap[c._id.toString()] || { enrollments: 0, completions: 0 };
        return {
          id: c._id,
          title: c.title,
          enrollments: stats.enrollments,
          completions: stats.completions,
          avgScore: null,
        };
      });

      // Enrollments over last 6 months (by month label YYYY-MM)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);

      const monthlyAgg = await Enrollment.aggregate([
        { $match: { course: { $in: courseIds }, createdAt: { $gte: sixMonthsAgo } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // Build labels for the last 6 months
      const labels = [];
      const values = [];
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        labels.push(d.toLocaleString('default', { month: 'short' }));
        const found = monthlyAgg.find(m => m._id === key);
        values.push(found ? found.count : 0);
      }

      return res.json({
        role: user.role,
        name: user.name,
        email: user.email,
        totalCourses,
        totalEnrollments,
        courses: coursesWithStats,
        enrollmentsOverTime: { labels, data: values },
      });
    }

    // default for admin or others
    res.json({ role: user.role, name: user.name, email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};
