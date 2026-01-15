import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyCourses, publishCourse } from "../services/courseService";
import "../styles/mentorDashboard.css";

// Icons
import {
  FaGraduationCap,
  FaBookOpen,
  FaUsers,
  FaEdit,
  FaEye,
  FaRocket,
  FaPlus,
  FaCheckCircle,
  FaStar,
  FaBook,
  FaRegClock,
  FaComments,
  FaBell,
  FaUserCircle,
  FaSignOutAlt,
  FaHome,
  FaChevronRight,
  FaFilter,
  FaSortAmountDown,
  FaChartLine,
  FaUserGraduate,
  FaFire,
  FaTrophy,
  FaMedal,
  FaBookReader,
  FaLightbulb,
  FaCrown,
  FaPercent,
  FaCalendarAlt,
  FaTimes,
  FaCheck,
  FaPlayCircle,
  FaClock
} from "react-icons/fa";
import {
  FiBook,
  FiUsers,
  FiTrendingUp,
  FiGrid,
  FiList,
  FiDollarSign
} from "react-icons/fi";
import { IoIosTrendingUp } from "react-icons/io";

const MentorDashboard = () => {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    drafts: 0
  });
  const [viewMode, setViewMode] = useState("grid");
  const [user, setUser] = useState(null);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState(2);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadCourses();
    // Simulate message count
    setUnreadMessages(3);
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await getMyCourses();
      setCourses(res.data);
      calculateStats(res.data);
    } catch (err) {
      alert("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (coursesData) => {
    const published = coursesData.filter(c => c.published).length;
    const drafts = coursesData.filter(c => !c.published).length;
    setStats({
      total: coursesData.length,
      published,
      drafts
    });
  };

  const handlePublish = async (courseId) => {
    if (!window.confirm("Are you sure you want to publish this course? It will be visible to students.")) return;
    
    try {
      await publishCourse(courseId);
      alert("Course published successfully!");
      loadCourses();
    } catch (err) {
      alert("Publish failed. Please try again.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getFilteredCourses = () => {
    let filtered = [...courses];

    if (filter === "published") {
      filtered = filtered.filter(course => course.published);
    } else if (filter === "drafts") {
      filtered = filtered.filter(course => !course.published);
    }

    if (sort === "popular") {
      filtered.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    } else if (sort === "alpha") {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return filtered;
  };

  const filteredCourses = getFilteredCourses();

  const totalEnrollments = courses.reduce((total, course) => total + (course.enrolledCount || 0), 0);

  return (
    <div className="mentor-dashboard">
      {/* Floating Background Elements */}
      <div className="dashboard-bg-gradient mentor"></div>
      <div className="floating-element el-1"></div>
      <div className="floating-element el-2"></div>

      {/* Sidebar Navigation */}
      <motion.aside 
        className="dashboard-sidebar mentor-sidebar"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo mentor">
            <FaGraduationCap />
            <span>EduMentor</span>
            <span className="mentor-tag">Mentor</span>
          </div>
          <div className="sidebar-user mentor">
            <div className="user-avatar mentor">
              {user?.name?.charAt(0) || "M"}
            </div>
            <div className="user-info">
              <h4>{user?.name || "Mentor"}</h4>
              <p>Expert Instructor</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/mentor" className="nav-item active">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/mentor/create-course" className="nav-item">
            <FaPlus />
            <span>Create Course</span>
          </Link>
          <Link to="/mentor/messages" className="nav-item">
            <FaComments />
            <span>Messages</span>
            {unreadMessages > 0 && <span className="badge badge-primary">{unreadMessages}</span>}
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
      <main className="dashboard-main mentor-main">
        {/* Top Header */}
        <motion.header 
          className="dashboard-header mentor-header"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="header-left">
            <h1>Welcome back, {user?.name?.split(' ')[0] || 'Mentor'}!</h1>
            <p>Manage your courses and connect with students</p>
          </div>
          
          <div className="header-right">
            <div className="header-actions">
              <Link to="/mentor/create-course" className="create-course-btn">
                <FaPlus />
                <span>Create Course</span>
              </Link>
              
              <Link to="/mentor/messages" className="message-btn">
                <FaComments />
                {unreadMessages > 0 && <span className="badge">{unreadMessages}</span>}
              </Link>
              
              <div className="user-dropdown">
                <div className="user-avatar-small mentor">
                  {user?.name?.charAt(0) || "M"}
                </div>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Stats Overview */}
        <motion.section 
          className="stats-overview mentor-stats"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="stats-grid">
            <motion.div 
              className="stat-card mentor"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <FaBook />
              </div>
              <div className="stat-content">
                <h3>{stats.total}</h3>
                <p>Total Courses</p>
              </div>
              <div className="stat-trend">
                <IoIosTrendingUp />
                <span>Your content library</span>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card mentor"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                <FaCheckCircle />
              </div>
              <div className="stat-content">
                <h3>{stats.published}</h3>
                <p>Published</p>
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
                      strokeDashoffset: 157 - (stats.published / Math.max(stats.total, 1) * 157)
                    }}
                  ></circle>
                </svg>
                <span>{stats.total > 0 ? Math.round((stats.published / stats.total) * 100) : 0}%</span>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card mentor"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                <FaRegClock />
              </div>
              <div className="stat-content">
                <h3>{stats.drafts}</h3>
                <p>Drafts</p>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${(stats.drafts / Math.max(stats.total, 1)) * 100}%` }}
                ></div>
              </div>
            </motion.div>

            <motion.div 
              className="stat-card mentor"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                <FiUsers />
              </div>
              <div className="stat-content">
                <h3>{totalEnrollments}</h3>
                <p>Total Students</p>
              </div>
              <div className="achievement-badge">
                <FaUserGraduate />
                <span>Inspiring {totalEnrollments} learners</span>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section 
          className="quick-actions mentor"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="section-header">
            <h2>Quick Actions</h2>
            <Link to="/mentor/create-course" className="view-all-btn">
              Create New <FaChevronRight />
            </Link>
          </div>
          
          <div className="actions-grid">
            <Link to="/mentor/create-course" className="action-card">
              <div className="action-icon" style={{ background: 'rgba(67, 97, 238, 0.1)' }}>
                <FaPlus style={{ color: '#4361ee' }} />
              </div>
              <div className="action-content">
                <h4>Create Course</h4>
                <p>Start building a new course</p>
              </div>
            </Link>
            
            <Link to="/mentor/messages" className="action-card">
              <div className="action-icon" style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                <FaComments style={{ color: '#10b981' }} />
              </div>
              <div className="action-content">
                <h4>Messages</h4>
                <p>Connect with students</p>
              </div>
            </Link>
            
            <Link to="/profile" className="action-card">
              <div className="action-icon" style={{ background: 'rgba(245, 158, 11, 0.1)' }}>
                <FaUserCircle style={{ color: '#f59e0b' }} />
              </div>
              <div className="action-content">
                <h4>Profile</h4>
                <p>Update your instructor profile</p>
              </div>
            </Link>
            
            <div className="action-card">
              <div className="action-icon" style={{ background: 'rgba(239, 68, 68, 0.1)' }}>
                <FaChartLine style={{ color: '#ef4444' }} />
              </div>
              <div className="action-content">
                <h4>Course Insights</h4>
                <p>View your teaching impact</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Courses Section */}
        <motion.section
          className="courses-section mentor-courses"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="section-header">
            <div className="section-title-group">
              <h2>Your Courses</h2>
              <span className="courses-count">
                {filteredCourses.length} courses • {stats.published} published • {stats.drafts} drafts
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
                  <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="all">All Courses</option>
                    <option value="published">Published</option>
                    <option value="drafts">Drafts</option>
                  </select>
                </div>
                
                <div className="filter-group">
                  <FaSortAmountDown />
                  <select value={sort} onChange={(e) => setSort(e.target.value)}>
                    <option value="recent">Recently Created</option>
                    <option value="popular">Most Popular</option>
                    <option value="alpha">Alphabetical</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Loading your courses...</p>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <FaBookOpen />
              </div>
              <h3>No courses found</h3>
              <p>Start creating courses to share your knowledge with students</p>
              <Link to="/mentor/create-course" className="create-course-btn">
                <FaPlus /> Create First Course
              </Link>
            </div>
          ) : (
            <motion.div 
              className={`courses-container ${viewMode}`}
              layout
            >
              <AnimatePresence>
                {filteredCourses.map((course, index) => (
                  <motion.div
                    key={course._id}
                    className={`course-card mentor ${viewMode} ${course.published ? 'published' : 'draft'}`}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ 
                      y: -5,
                      boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div className="course-header mentor">
                      <div className="course-status">
                        {course.published ? (
                          <span className="status-badge published">
                            <FaCheckCircle /> Published
                          </span>
                        ) : (
                          <span className="status-badge draft">
                            <FaRegClock /> Draft
                          </span>
                        )}
                        {course.featured && (
                          <span className="featured-badge">
                            <FaStar /> Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="course-engagement">
                        <span className="engagement-badge">
                          <FiUsers /> {course.enrolledCount || 0} students
                        </span>
                      </div>
                    </div>

                    <div className="course-image">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} />
                      ) : (
                        <div className="course-image-placeholder mentor">
                          <FaBookOpen />
                        </div>
                      )}
                    </div>

                    <div className="course-content mentor">
                      <div className="course-title-section">
                        <h3 className="course-title">{course.title}</h3>
                        <div className="course-category">
                          {course.category || "General"}
                        </div>
                      </div>

                      <p className="course-description">
                        {course.description?.length > 120
                          ? `${course.description.substring(0, 120)}...`
                          : course.description}
                      </p>

                      <div className="course-meta mentor">
                        <div className="meta-item">
                          <span className="meta-label">Price</span>
                          <span className="meta-value price">₹{course.price}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-label">Rating</span>
                          <span className="meta-value rating">
                            <FaStar /> {course.rating || "No ratings"}
                          </span>
                        </div>
                      </div>

                      <div className="course-stats mentor">
                        <div className="stat-item">
                          <FaCalendarAlt />
                          <span>{new Date(course.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="stat-item">
                          <FaClock />
                          <span>{course.duration || "Self-paced"}</span>
                        </div>
                      </div>

                      <div className="course-actions mentor">
                        {course.published ? (
                          <div className="published-actions">
                            <Link 
                              to={`/mentor/course/${course._id}`}
                              className="action-btn view"
                            >
                              <FaEye /> View Course
                            </Link>
                            <Link 
                              to={`/mentor/course/${course._id}/manage`}
                              className="action-btn edit"
                            >
                              <FaEdit /> Edit Details
                            </Link>
                          </div>
                        ) : (
                          <div className="draft-actions">
                            <button
                              className="action-btn publish"
                              onClick={() => handlePublish(course._id)}
                            >
                              <FaRocket /> Publish Course
                            </button>
                            <Link
                              to={`/mentor/course/${course._id}/manage`}
                              className="action-btn edit"
                            >
                              <FaEdit /> Course Settings
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.section>

        {/* Footer */}
        <footer className="dashboard-footer mentor-footer">
          <p>© 2026 EduMentor. Empowering mentors to create impact.</p>
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

export default MentorDashboard;