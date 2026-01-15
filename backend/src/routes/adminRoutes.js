const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
// We need middleware to check if user is admin. 
// Assuming validation of token is done, we need a specific 'isAdmin' check or reuse auth middleware.
// For now, I'll assume we can't easily reuse 'auth' middleware without seeing it, 
// so will assume the router is mounted with auth middleware in server.js or I should import it.
// Checking file structure... 'middlewares' folder exists.
const auth = require("../middlewares/authMiddleware");

// But checking 'authController' login, it returns a token.
// The user requests "separate login details for admin".
// The admin logs in via normal login but with specific creds.
// So he gets a token with role: 'admin'.

// Middleware to check role = admin
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin only." });
    }
};

// Routes
// Note: 'auth' middleware usually adds req.user
router.get("/analytics", auth.protect, verifyAdmin, adminController.getAnalytics);
router.get("/dashboard", auth.protect, verifyAdmin, adminController.getDashboardStats);
router.delete("/user/:id", auth.protect, verifyAdmin, adminController.deleteUser);
router.delete("/course/:id", auth.protect, verifyAdmin, adminController.deleteCourse);
router.put("/user/:id/role", auth.protect, verifyAdmin, adminController.updateUserRole);
router.put("/course/:id/publish", auth.protect, verifyAdmin, adminController.toggleCoursePublish);

module.exports = router;
