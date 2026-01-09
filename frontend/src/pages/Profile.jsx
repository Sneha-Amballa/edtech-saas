import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { getMyProfile } from "../services/profileService";
import "../styles/studentDashboard.css";
import "../styles/profile.css";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Pie, Doughnut } from "react-chartjs-2";
import {
  FaGraduationCap,
  FaUserCircle,
  FaEnvelope,
  FaBookOpen,
  FaChartLine,
  FaTrophy,
  FaMedal,
  FaCalendarAlt,
  FaCog,
  FaSignOutAlt,
  FaHome,
  FaBook,
  FaComments,
  FaBell,
  FaEdit,
  FaShare,
  FaDownload,
  FaCertificate,
  FaClock,
  FaUsers,
  FaStar,
  FaFire,
  FaRocket,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight
} from "react-icons/fa";
import { FiTrendingUp, FiGrid, FiList } from "react-icons/fi";
import { IoIosTrendingUp, IoIosStats } from "react-icons/io";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [timeRange, setTimeRange] = useState("month");
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await getMyProfile();
        setProfile(res.data);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to load profile");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return "success";
    if (progress >= 50) return "warning";
    return "danger";
  };

  if (loading) {
    return (
      <div className="student-dashboard">
        <aside className="dashboard-sidebar">
          {/* Sidebar Skeleton */}
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <FaGraduationCap />
              <span>EduMentor</span>
            </div>
          </div>
        </aside>
        <main className="dashboard-main">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading profile data...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="student-dashboard">
        <aside className="dashboard-sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <FaGraduationCap />
              <span>EduMentor</span>
            </div>
          </div>
        </aside>
        <main className="dashboard-main">
          <div className="empty-state">
            <div className="empty-icon">
              <FaUserCircle />
            </div>
            <h3>No profile data found</h3>
            <p>Unable to load your profile information</p>
            <button onClick={() => navigate(-1)} className="btn-primary">
              Go Back
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Generate chart data based on profile
  const generateChartData = () => {
    const months = profile.enrollmentsOverTime?.labels || ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const values = profile.enrollmentsOverTime?.data || Array(6).fill(0).map((_, i) => Math.floor(Math.random() * 30) + 10);

    if (profile.role === "student") {
      return {
        learningActivity: {
          labels: months,
          datasets: [{
            label: "Learning Activity",
            data: values,
            borderColor: "#4361ee",
            backgroundColor: "rgba(67, 97, 238, 0.1)",
            tension: 0.4,
            fill: true
          }]
        },
        courseProgress: {
          labels: ["In Progress", "Completed", "Not Started"],
          datasets: [{
            data: [
              profile.inProgress || 0,
              profile.completed || 0,
              (profile.totalEnrolled || 0) - (profile.inProgress || 0) - (profile.completed || 0)
            ],
            backgroundColor: ["#f59e0b", "#10b981", "#94a3b8"]
          }]
        }
      };
    } else {
      return {
        enrollments: {
          labels: months,
          datasets: [{
            label: "Enrollments",
            data: values,
            borderColor: "#8b5cf6",
            backgroundColor: "rgba(139, 92, 246, 0.1)",
            tension: 0.4,
            fill: true
          }]
        },
        completionRate: {
          labels: ["Completed", "In Progress", "Not Started"],
          datasets: [{
            data: [
              profile.totalCompleted || Math.round((profile.totalEnrollments || 0) * 0.6),
              profile.inProgress || Math.round((profile.totalEnrollments || 0) * 0.3),
              (profile.totalEnrollments || 0) - (profile.totalCompleted || 0) - (profile.inProgress || 0)
            ],
            backgroundColor: ["#10b981", "#f59e0b", "#94a3b8"]
          }]
        },
        studentSatisfaction: {
          labels: ["Excellent", "Good", "Average", "Poor"],
          datasets: [{
            data: [45, 35, 15, 5],
            backgroundColor: ["#10b981", "#60a5fa", "#f59e0b", "#ef4444"]
          }]
        }
      };
    }
  };

  const chartData = generateChartData();

  return (
    <div className="student-dashboard">
      {/* Background Elements */}
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
              {getInitials(profile.name)}
            </div>
            <div className="user-info">
              <h4>{profile.name}</h4>
              <p>{profile.role === "student" ? "Student" : "Mentor"}</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link to="/student" className="nav-item">
            <FaHome />
            <span>Dashboard</span>
          </Link>
          <Link to="/student/mycourses" className="nav-item">
            <FaBook />
            <span>My Courses</span>
            {profile.role === "student" && profile.totalEnrolled > 0 && (
              <span className="badge">{profile.totalEnrolled}</span>
            )}
          </Link>
          <Link to="/student/messages" className="nav-item">
            <FaComments />
            <span>Messages</span>
          </Link>
          <Link to="/profile" className="nav-item active">
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
        {/* Header */}
        <motion.header 
          className="dashboard-header"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="header-left">
            <h1>My Profile</h1>
            <p>Manage your account and track your progress</p>
          </div>
          
        </motion.header>

        {/* Profile Tabs */}
        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === "courses" ? "active" : ""}`}
            onClick={() => setActiveTab("courses")}
          >
            {profile.role === "student" ? "Completed Courses" : "My Teaching"}
          </button>
          <button 
            className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            Analytics
          </button>
          
        </div>

        {/* Profile Overview */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div 
              className="profile-overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Profile Header Card */}
              <div className="profile-header-card">
                <div className="profile-background">
                  <div className="background-gradient"></div>
                </div>
                <div className="profile-content">
                  <div className="avatar-section">
                    <div className="avatar-large">
                      {getInitials(profile.name)}
                    </div>
                    <div className="avatar-info">
                      <h2>{profile.name}</h2>
                      <p className="profile-role">
                        {profile.role === "student" ? "Student" : "Mentor"}
                        <span className="role-badge">
                          {profile.role === "student" ? "Learner" : "Instructor"}
                        </span>
                      </p>
                      <p className="profile-email">
                        <FaEnvelope /> {profile.email}
                      </p>
                      <div className="profile-stats">
                        <div className="stat">
                          <FaCalendarAlt />
                          <span>Joined {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                        </div>
                        
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="profile-stats-grid">
                {profile.role === "student" ? (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <FaBookOpen />
                      </div>
                      <div className="stat-content">
                        <h3>{profile.totalEnrolled || 0}</h3>
                        <p>Total Enrolled</p>
                      </div>
                      <div className="stat-trend up">
                        <IoIosTrendingUp />
                        <span>+12% from last month</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                        <FaChartLine />
                      </div>
                      <div className="stat-content">
                        <h3>{profile.inProgress || 0}</h3>
                        <p>In Progress</p>
                      </div>
                      <div className="stat-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${((profile.inProgress || 0) / (profile.totalEnrolled || 1)) * 100}%` }}
                          ></div>
                        </div>
                        <span>{Math.round(((profile.inProgress || 0) / (profile.totalEnrolled || 1)) * 100)}%</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                        <FaTrophy />
                      </div>
                      <div className="stat-content">
                        <h3>{profile.completed || 0}</h3>
                        <p>Completed</p>
                      </div>
                      <div className="achievement-badge">
                        <FaMedal />
                        <span>{profile.completed >= 5 ? "Advanced Learner" : "Beginner"}</span>
                      </div>
                    </div>

                  </>
                ) : (
                  <>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <FaBookOpen />
                      </div>
                      <div className="stat-content">
                        <h3>{profile.totalCourses || 0}</h3>
                        <p>Courses Created</p>
                      </div>
                      <div className="stat-trend up">
                        <IoIosTrendingUp />
                        <span>+2 this month</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                        <FaUsers />
                      </div>
                      <div className="stat-content">
                        <h3>{profile.totalEnrollments || 0}</h3>
                        <p>Total Students</p>
                      </div>
                      <div className="stat-trend up">
                        <FaArrowUp />
                        <span>+15% enrollment rate</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                        <FaChartLine />
                      </div>
                      <div className="stat-content">
                        <h3>94%</h3>
                        <p>Satisfaction Rate</p>
                      </div>
                      <div className="achievement-badge">
                        <FaStar />
                        <span>Top Rated Mentor</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                        <FaCertificate />
                      </div>
                      <div className="stat-content">
                        <h3>{profile.totalCompleted || 0}</h3>
                        <p>Course Completions</p>
                      </div>
                      <div className="stat-trend up">
                        <FaRocket />
                        <span>85% completion rate</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

            
            </motion.div>
          )}

          {/* Courses Tab */}
          {activeTab === "courses" && (
            <motion.div 
              className="courses-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {profile.role === "student" ? (
                <>
                  <div className="section-header">
                    <h2>My Learning Journey</h2>
                    <div className="section-actions">
                      <button className="btn-outline">View All</button>
                      <button className="btn-primary">Continue Learning</button>
                    </div>
                  </div>

                  {profile.completedCourses?.length ? (
                    <div className="courses-grid">
                      {profile.completedCourses.map((course, index) => (
                        <div key={index} className="course-item">
                          <div className="course-item-header">
                            <h4>{course.courseTitle}</h4>
                            <span className="course-status completed">Completed</span>
                          </div>
                          <p className="course-meta">
                            Completed on {new Date(course.completionDate).toLocaleDateString()}
                          </p>
                          {course.certificateId && (
                            <div className="certificate-info">
                              <FaCertificate />
                              <span>Certificate ID: {course.certificateId}</span>
                              <button className="download-btn">
                                <FaDownload />
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-courses">
                      <div className="empty-icon">
                        <FaBookOpen />
                      </div>
                      <h3>No completed courses yet</h3>
                      <p>Start your learning journey by enrolling in courses</p>
                      <Link to="/student" className="btn-primary">
                        Browse Courses
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="section-header">
                    <h2>My Teaching Portfolio</h2>
                    <div className="section-actions">
                      <button className="btn-outline">Create New Course</button>
                      <button className="btn-primary">View Analytics</button>
                    </div>
                  </div>
                  
                  <div className="mentor-courses">
                    {/* Mentor courses would be rendered here */}
                    <div className="empty-courses">
                      <div className="empty-icon">
                        <FaBookOpen />
                      </div>
                      <h3>Teaching Analytics</h3>
                      <p>Manage your courses and track student progress</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <motion.div 
              className="analytics-tab"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="analytics-header">
                <h2>Learning Analytics</h2>
                <p>Track your progress and performance over time</p>
              </div>

              <div className="analytics-grid">
                <div className="analytics-card">
                  <div className="card-header">
                    <h4>
                      <IoIosStats />
                      {profile.role === "student" ? "Learning Activity" : "Enrollment Trends"}
                    </h4>
                  </div>
                  <div className="chart-container">
                    <Line 
                      data={profile.role === "student" ? chartData.learningActivity : chartData.enrollments}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { display: false }
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            grid: { color: 'rgba(0,0,0,0.05)' }
                          }
                        }
                      }}
                    />
                  </div>
                </div>

                <div className="analytics-card">
                  <div className="card-header">
                    <h4>
                      <FaChartLine />
                      {profile.role === "student" ? "Course Progress" : "Completion Rate"}
                    </h4>
                  </div>
                  <div className="chart-container">
                    <Doughnut 
                      data={profile.role === "student" ? chartData.courseProgress : chartData.completionRate}
                      options={{
                        responsive: true,
                        plugins: {
                          legend: { position: 'bottom' }
                        }
                      }}
                    />
                  </div>
                </div>


                
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="dashboard-footer">
          <p>© 2024 EduMentor. Your learning journey matters.</p>
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

export default Profile;