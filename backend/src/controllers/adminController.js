const User = require("../models/User");
const Course = require("../models/Course");

// Get Dashboard Stats (All Users, All Courses)
exports.getDashboardStats = async (req, res) => {
    try {
        const students = await User.find({ role: "student" }).select("-password");
        const mentors = await User.find({ role: "mentor" }).select("-password");
        const courses = await Course.find().populate("mentor", "name email");

        res.json({
            students,
            mentors,
            courses,
        });
    } catch (err) {
        console.error("[admin] getDashboardStats error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete User
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        // Also delete associated data if needed, but for now just user
        // Ideally delete courses if mentor, enrollments if student
        // For simplicity, just user for now as requested "control to do all crud"
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("[admin] deleteUser error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Delete Course
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        await Course.findByIdAndDelete(id);
        res.json({ message: "Course deleted successfully" });
    } catch (err) {
        console.error("[admin] deleteCourse error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Update User Role
exports.updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['student', 'mentor', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const user = await User.findByIdAndUpdate(id, { role }, { new: true });
        res.json({ message: "User role updated successfully", user });
    } catch (err) {
        console.error("[admin] updateUserRole error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Toggle Course Publish Status
exports.toggleCoursePublish = async (req, res) => {
    try {
        const { id } = req.params;
        const { published } = req.body;

        const course = await Course.findByIdAndUpdate(id, { published }, { new: true });
        res.json({ message: "Course publish status updated", course });
    } catch (err) {
        console.error("[admin] toggleCoursePublish error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// Get Analytics
exports.getAnalytics = async (req, res) => {
    try {
        const now = new Date();
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);

        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now);
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        // 1. Overview Metrics
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalMentors = await User.countDocuments({ role: 'mentor' });
        const totalCourses = await Course.countDocuments();

        // Active vs Inactive (Active = logged in last 30 days)
        const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));
        const activeUsers = await User.countDocuments({ lastLogin: { $gte: thirtyDaysAgo } });
        const inactiveUsers = totalUsers - activeUsers;

        // New Users counts
        const newUsersToday = await User.countDocuments({ createdAt: { $gte: startOfDay } });
        const newUsersThisWeek = await User.countDocuments({ createdAt: { $gte: startOfWeek } }); // Approximate, depends on definition of week
        const newUsersThisMonth = await User.countDocuments({ createdAt: { $gte: startOfMonth } });

        // 2. User Growth (Last 30 days)
        const rawGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        role: "$role"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.date": 1 } }
        ]);

        // Process growth data into easier format for frontend: [{ date, student, mentor }]
        const growthMap = {};
        rawGrowth.forEach(item => {
            const date = item._id.date;
            const role = item._id.role;
            if (!growthMap[date]) growthMap[date] = { date, student: 0, mentor: 0 };
            if (role === 'student') growthMap[date].student += item.count;
            if (role === 'mentor') growthMap[date].mentor += item.count;
        });
        const userGrowth = Object.values(growthMap).sort((a, b) => a.date.localeCompare(b.date));

        // 3. Course Analytics
        const publishedCourses = await Course.countDocuments({ published: true });
        const unpublishedCourses = await Course.countDocuments({ published: false });

        // Courses by Category
        const coursesByCategory = await Course.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } }
        ]);

        // Top 5 courses by enrollment
        const topCourses = await Course.find()
            .sort({ enrolledCount: -1 })
            .limit(5)
            .select('title enrolledCount mentor published category')
            .populate('mentor', 'name');

        // Zero enrollments
        const zeroEnrollmentCourses = await Course.countDocuments({ enrolledCount: 0 });

        res.json({
            overview: {
                totalUsers,
                totalStudents,
                totalMentors,
                totalCourses,
                activeUsers,
                inactiveUsers,
                newUsersToday,
                newUsersThisWeek,
                newUsersThisMonth
            },
            userGrowth,
            courseAnalytics: {
                publishedCourses,
                unpublishedCourses,
                coursesByCategory,
                topCourses,
                zeroEnrollmentCourses
            }
        });

    } catch (err) {
        console.error("[admin] getAnalytics error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
