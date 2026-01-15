import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getPublishedCourses } from "../services/courseService";
import "../styles/studentDashboard.css";
import { enrollInCourse, getMyCourses, getCounts } from "../services/enrollmentService";
import axios from "axios";

// Icons
import { 
  FaGraduationCap, 
  FaBookOpen, 
  FaUserGraduate, 
  FaSearch,
  FaFilter,
  FaStar,
  FaUsers,
  FaPlayCircle,
  FaClock,
  FaChartLine,
  FaUserCircle,
  FaSignOutAlt,
  FaThLarge,
  FaList,
  FaComments,
  FaBell,
  FaHome,
  FaBook,
  FaCog,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,   // ✅ ADD THIS
  FaFire,
  FaTrophy,
  FaRocket,
  FaMedal
} from "react-icons/fa";

import { FiBook, FiTrendingUp, FiGrid, FiList } from "react-icons/fi";
import { IoIosTrendingUp } from "react-icons/io";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [enrollments, setEnrollments] = useState([]);
  const [inProgressCount, setInProgressCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const [sortOption, setSortOption] = useState("recommended");
  const [user, setUser] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState(3);
  const [activeTab, setActiveTab] = useState("all");
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    loadCourses();
    loadEnrollments();
    loadMessageCount();
  }, []);

  useEffect(() => {
    if (courses.length > 0) {
      const uniqueCategories = ["all", ...new Set(courses.map(course => course.category).filter(Boolean))];
      setCategories(uniqueCategories);
    }
  }, [courses]);

  const loadMessageCount = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
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

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await getPublishedCourses();
      setCourses(res.data);
    } catch (error) {
      alert("Failed to load courses");
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

  const sortCourses = (courses) => {
    const sorted = [...courses];
    
    switch (sortOption) {
      case "price-low-high":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-high-low":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating-highest":
        return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case "popular":
        return sorted.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
      default:
        return sorted.sort((a, b) => {
          const scoreA = (a.rating || 0) * 10 + (a.enrolledCount || 0);
          const scoreB = (b.rating || 0) * 10 + (b.enrolledCount || 0);
          return scoreB - scoreA;
        });
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedAndFilteredCourses = sortCourses(filteredCourses);

  const handleEnroll = async (courseId) => {
    try {
      await enrollInCourse(courseId);
      await loadEnrollments();
      alert("Enrolled successfully!");
      navigate(`/course/${courseId}`);
    } catch (err) {
      alert(err.response?.data?.message || "Enrollment failed");
    }
  };

  const loadEnrollments = async () => {
    try {
      const res = await getMyCourses();
      setEnrollments(res.data);

      const countsRes = await getCounts();
      setEnrolledCount(countsRes.data.enrolledCount || 0);
      setInProgressCount(countsRes.data.inProgressCount || 0);
      setCompletedCount(countsRes.data.completedCount || 0);
    } catch (err) {
      console.error("Failed to load enrollments");
    }
  };

  const enrolledCourseIds = enrollments
    .map((e) => (e.course && e.course._id ? e.course._id : e.course))
    .map((id) => String(id));

  const getProgressColor = (progress) => {
    if (progress >= 80) return "progress-success";
    if (progress >= 50) return "progress-warning";
    return "progress-danger";
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
          <Link to="/student" className="nav-item active">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/student/mycourses" className="nav-item">
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
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Student'}!</h1>
            <p>Continue your learning journey</p>
          </div>
          
          <div className="header-right">
            <div className="header-search">
              <FaSearch />
              <input
                type="text"
                placeholder="Search courses, topics, or mentors..."
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
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <FaBookOpen />
              </div>
              <div className="stat-content">
                <h3>{courses.length}</h3>
                <p>Available Courses</p>
              </div>
              <div className="stat-trend">
                <IoIosTrendingUp />
                <span>+12% this month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                <FaUserGraduate />
              </div>
              <div className="stat-content">
                <h3>{enrolledCount}</h3>
                <p>Enrolled Courses</p>
              </div>
              <div className="progress-ring">
                <svg width="60" height="60">
                  <circle cx="30" cy="30" r="25" className="progress-bg"></circle>
                  <circle 
                    cx="30" 
                    cy="30" 
                    r="25" 
                    className="progress-circle"
                    style={{
                      strokeDasharray: '157',
                      strokeDashoffset: 157 - (enrolledCount / Math.max(courses.length, 1)) * 157
                    }}
                  ></circle>
                </svg>
                <span>{Math.round((enrolledCount / Math.max(courses.length, 1)) * 100)}%</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h3>{inProgressCount}</h3>
                <p>In Progress</p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(inProgressCount / Math.max(enrolledCount, 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                <FaTrophy />
              </div>
              <div className="stat-content">
                <h3>{completedCount}</h3>
                <p>Completed</p>
              </div>
              <div className="achievement-badge">
                <FaMedal />
                <span>Top Learner</span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions & Categories */}
        <motion.section 
          className="quick-actions"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="section-header">
            <h2>Browse by Category</h2>
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
      <h2>Available Courses</h2>
      <span className="courses-count">
        {sortedAndFilteredCourses.length} courses available
      </span>
    </div>

    <div className="section-controls">
      <div className="view-toggle-group">
        <button
          className={`view-toggle ${viewMode === "grid" ? "active" : ""}`}
          onClick={() => setViewMode("grid")}
        >
          <FiGrid /> Grid
        </button>
        <button
          className={`view-toggle ${viewMode === "list" ? "active" : ""}`}
          onClick={() => setViewMode("list")}
        >
          <FiList /> List
        </button>
      </div>

      <div className="filter-controls">
        <div className="filter-group">
          <FaFilter />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="recommended">Recommended</option>
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating-highest">Highest Rated</option>
            <option value="price-low-high">Price: Low to High</option>
            <option value="price-high-low">Price: High to Low</option>
          </select>
        </div>
      </div>
    </div>
  </div>

  {/* CONTENT */}
  {loading ? (
    <div className="loading-state">
      <div className="loading-spinner"></div>
      <p>Loading courses...</p>
    </div>
  ) : sortedAndFilteredCourses.length === 0 ? (
    <div className="empty-state">
      <div className="empty-icon">
        <FaBookOpen />
      </div>
      <h3>No courses found</h3>
      <p>Try adjusting your search or filter criteria</p>
      <button
        className="clear-filters-btn"
        onClick={() => {
          setSearchTerm("");
          setSelectedCategory("all");
        }}
      >
        Clear All Filters
      </button>
    </div>
  ) : (
    <motion.div
      className={`courses-container ${viewMode}`}
      layout
    >
      {sortedAndFilteredCourses.map((course) => (
        <motion.div
          key={course._id}
          className={`course-card ${viewMode}`}
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
          </div>

          {/* CONTENT */}
          <div className="course-content">
            <div className="course-header">
              <div className="course-category">
                {course.category || "General"}
              </div>
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
                {course.originalPrice && (
                  <span className="original-price">
                    ₹{course.originalPrice}
                  </span>
                )}
              </div>

              <div className="course-actions">
                {enrolledCourseIds.includes(course._id) ? (
                  <button
                    className="btn-continue"
                    onClick={() => navigate(`/course/${course._id}`)}
                  >
                    <FaPlayCircle /> Continue
                  </button>
                ) : (
                  <button
                    className="btn-enroll"
                    onClick={() => handleEnroll(course._id)}
                  >
                    Enroll Now <FaChevronRight />
                  </button>
                )}
                <Link
                  to={`/course/${course._id}`}
                  className="btn-outline"
                >
                  Preview
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
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

export default StudentDashboard;