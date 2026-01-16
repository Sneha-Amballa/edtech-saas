import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaUserGraduate,
  FaChalkboardTeacher,
  FaBook,
  FaSignOutAlt,
  FaTrash,
  FaEnvelope,
  FaClock,
  FaSearch,
  FaFilter,
  FaChartLine
} from "react-icons/fa";
import "../styles/adminDashboard.css";
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
  DoughnutController
} from 'chart.js';
import { Line, Pie, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  DoughnutController
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ students: [], mentors: [], courses: [] });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [statsRes, analyticsRes] = await Promise.all([
          axios.get("https://edtech-saas.onrender.com/api/admin/dashboard", { headers }),
          axios.get("https://edtech-saas.onrender.com/api/admin/analytics", { headers })
        ]);

        setData(statsRes.data);
        setAnalyticsData(analyticsRes.data);
      } catch (err) {
        console.error("Error fetching admin data", err);
        // alert("Failed to load admin dashboard"); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDeleteUser = async (id, role) => {
    if (!window.confirm(`Are you sure you want to delete this ${role}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://edtech-saas.onrender.com/api/admin/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update state
      if (role === 'student') {
        setData({ ...data, students: data.students.filter(u => u._id !== id) });
      } else {
        setData({ ...data, mentors: data.mentors.filter(u => u._id !== id) });
      }
    } catch (err) {
      alert("Failed to delete user");
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`https://edtech-saas.onrender.com/api/admin/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData({ ...data, courses: data.courses.filter(c => c._id !== id) });
    } catch (err) {
      alert("Failed to delete course");
    }

  };

  const handleUpdateRole = async (id, newRole, type) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`https://edtech-saas.onrender.com/api/admin/user/${id}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state by removing from current list if role changed to something else
      // or just refreshing. Ideally, move it to the correct list.
      // For simplicity in this dashboard, we might want to refresh the stats or manually move them.
      // Let's manually move them between arrays for instant feedback.

      const user = type === 'student'
        ? data.students.find(u => u._id === id)
        : data.mentors.find(u => u._id === id);

      if (user) {
        user.role = newRole;
        // Logic to move user between arrays
        const newData = { ...data };
        if (type === 'student') newData.students = newData.students.filter(u => u._id !== id);
        if (type === 'mentor') newData.mentors = newData.mentors.filter(u => u._id !== id);

        if (newRole === 'student') newData.students.push(user);
        else if (newRole === 'mentor') newData.mentors.push(user);

        setData(newData);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update role");
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !currentStatus;
      await axios.put(`https://edtech-saas.onrender.com/api/admin/course/${id}/publish`,
        { published: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setData({
        ...data,
        courses: data.courses.map(c =>
          c._id === id ? { ...c, published: newStatus } : c
        )
      });
    } catch (err) {
      console.error(err);
      alert("Failed to update course status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Chart Data Preparation
  const userGrowthChart = {
    labels: analyticsData?.userGrowth?.map(d => d.date) || [],
    datasets: [{
      label: 'Students',
      data: analyticsData?.userGrowth?.map(d => d.student) || [],
      borderColor: '#4ade80',
      backgroundColor: 'rgba(74, 222, 128, 0.2)',
      tension: 0.4,
      fill: true
    }, {
      label: 'Mentors',
      data: analyticsData?.userGrowth?.map(d => d.mentor) || [],
      borderColor: '#fbbf24',
      backgroundColor: 'rgba(251, 191, 36, 0.2)',
      tension: 0.4,
      fill: true
    }]
  };

  const roleDistributionChart = {
    labels: ['Students', 'Mentors'],
    datasets: [{
      data: [
        analyticsData?.overview?.totalStudents || 0,
        analyticsData?.overview?.totalMentors || 0
      ],
      backgroundColor: ['#4ade80', '#fbbf24'],
      hoverOffset: 4
    }]
  };

  const topCoursesChart = {
    labels: analyticsData?.courseAnalytics?.topCourses?.map(c => c.title.substring(0, 15) + '...') || [],
    datasets: [{
      label: 'Enrollments',
      data: analyticsData?.courseAnalytics?.topCourses?.map(c => c.enrolledCount) || [],
      backgroundColor: ['#f87171', '#4361ee', '#4ade80', '#fbbf24', '#7209b7'],
      borderRadius: 8
    }]
  };

  if (loading) return <div className="admin-loading">Loading Dashboard...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-sidebar">
        <div className="admin-brand">
          <h2>Admin Panel</h2>
        </div>
        <nav className="admin-nav">
          <button
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            <FaChartLine /> Overview
          </button>
          <button
            className={activeTab === 'students' ? 'active' : ''}
            onClick={() => setActiveTab('students')}
          >
            <FaUserGraduate /> Students ({data.students.length})
          </button>
          <button
            className={activeTab === 'mentors' ? 'active' : ''}
            onClick={() => setActiveTab('mentors')}
          >
            <FaChalkboardTeacher /> Mentors ({data.mentors.length})
          </button>
          <button
            className={activeTab === 'courses' ? 'active' : ''}
            onClick={() => setActiveTab('courses')}
          >
            <FaBook /> Courses ({data.courses.length})
          </button>
        </nav>
        <div className="admin-footer">
          <button onClick={handleLogout} className="logout-btn">
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      <div className="admin-content">
        <header className="admin-header">
          <h1>Dashboard Overview</h1>
          <div className="admin-controls">
            <div className="search-bar">
              <FaSearch />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === 'courses' ? (
              <select
                className="filter-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Unpublished</option>
              </select>
            ) : null}
          </div>
        </header>

        <div className="admin-main-view">
          {activeTab === 'overview' && (
            <>
              <div className="analytics-overview">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(67, 97, 238, 0.1)', color: '#4361ee' }}>
                    <FaUserGraduate />
                  </div>
                  <div className="stat-info">
                    <h4>Total Users</h4>
                    <p>{analyticsData?.overview?.totalUsers || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#166534' }}>
                    <FaUserGraduate />
                  </div>
                  <div className="stat-info">
                    <h4>Total Students</h4>
                    <p>{analyticsData?.overview?.totalStudents || 0}</p>
                    <small className="trend-text">
                      +{analyticsData?.overview?.newUsersToday || 0} today
                    </small>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(251, 191, 36, 0.1)', color: '#b45309' }}>
                    <FaChalkboardTeacher />
                  </div>
                  <div className="stat-info">
                    <h4>Total Mentors</h4>
                    <p>{analyticsData?.overview?.totalMentors || 0}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: 'rgba(248, 113, 113, 0.1)', color: '#b91c1c' }}>
                    <FaBook />
                  </div>
                  <div className="stat-info">
                    <h4>Total Courses</h4>
                    <p>{analyticsData?.overview?.totalCourses || 0}</p>
                    <small className="trend-text">
                      {analyticsData?.courseAnalytics?.publishedCourses || 0} Published
                    </small>
                  </div>
                </div>
              </div>

              {/* Engagement & Growth Section */}
              <div className="analytics-overview secondary">
                <div className="stat-card small">
                  <div className="stat-info">
                    <h4>Active Users</h4>
                    <p>{analyticsData?.overview?.activeUsers || 0}</p>
                    <small className="sub-text">vs {analyticsData?.overview?.inactiveUsers || 0} Inactive</small>
                  </div>
                </div>
                <div className="stat-card small">
                  <div className="stat-info">
                    <h4>New (Today)</h4>
                    <p>{analyticsData?.overview?.newUsersToday || 0}</p>
                  </div>
                </div>
                <div className="stat-card small">
                  <div className="stat-info">
                    <h4>New (Month)</h4>
                    <p>{analyticsData?.overview?.newUsersThisMonth || 0}</p>
                  </div>
                </div>
                <div className="stat-card small warning">
                  <div className="stat-info">
                    <h4>Zero Enrollment Courses</h4>
                    <p>{analyticsData?.courseAnalytics?.zeroEnrollmentCourses || 0}</p>
                  </div>
                </div>
              </div>

              <div className="analytics-charts" style={{ gridTemplateColumns: '1fr' }}>
                <div className="chart-container">
                  <h3>User Growth Trends</h3>
                  <Line data={userGrowthChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              <div className="analytics-charts">
                <div className="chart-container">
                  <h3>Top 5 Courses (Enrollments)</h3>
                  <Bar data={topCoursesChart} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
                <div className="chart-container">
                  <h3>Student vs Mentor Ratio</h3>
                  <div style={{ height: '300px', display: 'flex', justifyContent: 'center' }}>
                    <Pie data={roleDistributionChart} />
                  </div>
                </div>
              </div>

              <div className="data-table-container">
                <h3>Course Performance Details</h3>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Course Name</th>
                      <th>Mentor</th>
                      <th>Category</th>
                      <th>Enrollments</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData?.courseAnalytics?.topCourses?.map(course => (
                      <tr key={course._id}>
                        <td>{course.title}</td>
                        <td>{course.mentor?.name}</td>
                        <td>{course.category || 'General'}</td>
                        <td>{course.enrolledCount}</td>
                        <td>
                          <span className={`status-btn ${course.published ? 'published' : 'draft'}`}>
                            {course.published ? 'Published' : 'Unpublished'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {activeTab === 'students' && (
            <div className="data-table-container">
              <h3>All Students</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined At</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.students
                    .filter(student =>
                      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      student.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(student => (
                      <tr key={student._id}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{new Date(student.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            value="student"
                            onChange={(e) => handleUpdateRole(student._id, e.target.value, 'student')}
                            className="role-select"
                          >
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button className="icon-btn delete" onClick={() => handleDeleteUser(student._id, 'student')}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'mentors' && (
            <div className="data-table-container">
              <h3>All Mentors</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined At</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.mentors
                    .filter(mentor =>
                      mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      mentor.email.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map(mentor => (
                      <tr key={mentor._id}>
                        <td>{mentor.name}</td>
                        <td>{mentor.email}</td>
                        <td>{new Date(mentor.createdAt).toLocaleDateString()}</td>
                        <td>
                          <select
                            value="mentor"
                            onChange={(e) => handleUpdateRole(mentor._id, e.target.value, 'mentor')}
                            className="role-select"
                          >
                            <option value="student">Student</option>
                            <option value="mentor">Mentor</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td>
                          <button className="icon-btn delete" onClick={() => handleDeleteUser(mentor._id, 'mentor')}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="data-table-container">
              <h3>All Courses</h3>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Mentor</th>
                    <th>Price</th>
                    <th>Created At</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.courses
                    .filter(course =>
                      (course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (course.mentor?.name || '').toLowerCase().includes(searchTerm.toLowerCase())) &&
                      (filterStatus === 'all' ||
                        (filterStatus === 'published' ? course.published : !course.published))
                    )
                    .map(course => (
                      <tr key={course._id}>
                        <td>{course.title}</td>
                        <td>{course.mentor?.name || 'Unknown'} <small>({course.mentor?.email})</small></td>
                        <td>${course.price}</td>
                        <td>{new Date(course.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            className={`status-btn ${course.published ? 'published' : 'draft'}`}
                            onClick={() => handleTogglePublish(course._id, course.published)}
                          >
                            {course.published ? 'Published' : 'Unpublished'}
                          </button>
                        </td>
                        <td>
                          <button className="icon-btn delete" onClick={() => handleDeleteCourse(course._id)}>
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
