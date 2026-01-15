import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getMyCourses, getCounts } from "../services/enrollmentService";
import axios from "axios";
import "../styles/studentDashboard.css";

// Icons
import {
  FaGraduationCap,
  FaBookOpen,
  FaUserGraduate,
  FaSearch,
  FaStar,
  FaUsers,
  FaPlayCircle,
  FaClock,
  FaChartLine,
  FaUserCircle,
  FaSignOutAlt,
  FaComments,
  FaBell,
  FaHome,
  FaBook,
  FaChevronRight,
  FaFire,
  FaTrophy,
  FaMedal,
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import { IoIosTrendingUp } from "react-icons/io";

const MyCourses = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(3);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadEnrollments();
    loadMessageCount();
  }, []);

  const loadMessageCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/chat/student/all-chats`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let totalMessages = 0;
      const chats = res.data.chats || [];
      chats.forEach((courseGroup) => {
        courseGroup.chats?.forEach((chat) => {
          if (chat.lastMessage && chat.lastMessage.sender?.role === "mentor") {
            totalMessages += 1;
          }
        });
      });

      setUnreadCount(totalMessages);
    } catch (error) {
      console.error("Failed to load message count:", error);
    }
  };

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const res = await getMyCourses();
      setEnrollments(res.data || []);

      const countsRes = await getCounts();
      setEnrolledCount(countsRes.data.enrolledCount || 0);
      setInProgressCount(countsRes.data.inProgressCount || 0);
      setCompletedCount(countsRes.data.completedCount || 0);
    } catch (err) {
      console.error("Failed to load enrollments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("enrolledCourses");
    navigate("/login");
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const course = enrollment.course;
    return (
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getProgressColor = (progress) => {
    if (progress >= 80) return "progress-success";
    if (progress >= 50) return "progress-warning";
    return "progress-danger";
  };

  const setNavItemActive = (path) => {
    const currentPath = window.location.pathname;
    return currentPath === path ? "active" : "";
  };

  return (
    <div className="student-dashboard">
      {/* Floating Background Elements */}
      <div className="dashboard-bg-gradient"></div>
      <div className="floating-element el-1"></div>
      <div className="floating-element el-2"></div>

      {/* Sidebar Navigation */}
      <motion.aside
        className="dashboard-sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <FaGraduationCap />
            <span>EduMentor</span>
          </div>
          <div className="sidebar-user">
            <div className="user-avatar">
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="user-info">
              <h4>{user?.name || "Student"}</h4>
              <p>Student</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/student" className={`nav-item ${setNavItemActive("/student")}`}>
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/student/mycourses" className={`nav-item ${setNavItemActive("/student/mycourses")}`}>
            <FaBook />
            <span>My Courses</span>
            <span className="badge">{enrolledCount}</span>
          </Link>
          <Link to="/student/messages" className="nav-item">
            <FaComments />
            <span>Messages</span>
            {unreadCount > 0 && <span className="badge badge-primary">{unreadCount}</span>}
          </Link>

          <Link to="/profile" className="nav-item">
            <FaUserCircle />
            <span>Profile</span>
          </Link>
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={handleLogout}>
            <FaSignOutAlt />
            <span>Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Top Header */}
        <motion.header
          className="dashboard-header"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="header-left">
            <h1>My Courses</h1>
            <p>Track your learning progress</p>
          </div>

          <div className="header-right">
            <div className="header-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Search your courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="header-actions">
              <Link to="/student/notifications" className="notification-btn">
                <FaBell />
                {notifications > 0 && <span className="notification-badge">{notifications}</span>}
              </Link>
              <Link to="/student/messages" className="message-btn">
                <FaComments />
                {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
              </Link>
              <div className="user-dropdown">
                <div className="user-avatar-small">
                  {user?.name?.charAt(0) || "S"}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Stats Overview */}
        <motion.section
          className="stats-overview"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "linear-gradient(135deg, #10b981, #34d399)" }}>
                <FaUserGraduate />
              </div>
              <div className="stat-content">
                <h3>{enrolledCount}</h3>
                <p>Enrolled</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>{inProgressCount}</h3>
                <p>In Progress</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: "linear-gradient(135deg, #ec4899, #f472b6)" }}>
                <FaTrophy />
              </div>
              <div className="stat-content">
                <h3>{completedCount}</h3>
                <p>Completed</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Courses Section */}
        <motion.section
          className="courses-section"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="section-header">
            <div className="section-title-group">
              <h2>Your Learning Journey</h2>
              <span className="courses-count">
                {filteredEnrollments.length} {filteredEnrollments.length === 1 ? "course" : "courses"}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your courses...</p>
            </div>
          ) : filteredEnrollments.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaBookOpen />
              </div>
              <h3>No courses yet</h3>
              <p>Enroll in courses from the dashboard to get started</p>
              <Link to="/student" className="clear-filters-btn">
                Back to Dashboard
              </Link>
            </div>
          ) : (
            <motion.div className="courses-container grid" layout>
              {filteredEnrollments.map((enrollment) => {
                const course = enrollment.course;
                const progress = enrollment.progress || 0;
                const status = enrollment.status || "in-progress";

                return (
                  <motion.div
                    key={course._id}
                    className="course-card grid"
                    layout
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {/* IMAGE */}
                    <div className="course-image">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} />
                      ) : (
                        <div className="course-image-placeholder">
                          <FaBookOpen />
                        </div>
                      )}
                      <div className="progress-overlay">
                        <div className="progress-bar-large">
                          <div
                            className={`progress-fill ${getProgressColor(progress)}`}
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="progress-text">{progress}%</span>
                      </div>
                    </div>

                    {/* CONTENT */}
                    <div className="course-content">
                      <div className="course-header">
                        <div className="course-category">{course.category || "General"}</div>
                        {status === "completed" && (
                          <div className="course-badge completed">
                            <FaTrophy /> Completed
                          </div>
                        )}
                      </div>

                      <h3 className="course-title">{course.title}</h3>

                      <p className="course-instructor">
                        By {course.instructor?.name || "Expert Instructor"}
                      </p>

                      <p className="course-description">
                        {course.description.length > 100
                          ? `${course.description.substring(0, 100)}...`
                          : course.description}
                      </p>

                      <div className="course-meta">
                        <div className="meta-item">
                          <FaClock />
                          <span>{course.duration || "Self-paced"}</span>
                        </div>
                        <div className="meta-item">
                          <FaUsers />
                          <span>{course.enrolledCount || 0} students</span>
                        </div>
                        <div className="meta-item">
                          <FiTrendingUp />
                          <span>{course.level || "All Levels"}</span>
                        </div>
                      </div>

                      <div className="course-footer">
                        <div className="course-pricing">
                          <span className="current-price">₹{course.price}</span>
                        </div>

                        <div className="course-actions">
                          <button
                            className="btn-continue"
                            onClick={() => navigate(`/course/${course._id}`)}
                          >
                            <FaPlayCircle /> Continue
                          </button>
                          <Link to={`/course/${course._id}`} className="btn-outline">
                            View
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.section>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>© 2026 EduMentor. Empowering learners worldwide.</p>
          <div className="footer-links">
            <Link to="/help">Help Center</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/contact">Contact</Link>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default MyCourses;
