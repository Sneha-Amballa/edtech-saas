import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses, publishCourse } from "../services/courseService";
import "../styles/mentorDashboard.css";

// Import icons (assuming you're using react-icons)
import { FaGraduationCap, FaBookOpen, FaUsers, FaEdit, FaEye, FaRocket, FaPlus, FaCheckCircle, FaStar, FaBook, FaChartLine, FaRegClock } from "react-icons/fa";
import { FiBook, FiUsers, FiTrendingUp } from "react-icons/fi";

const MentorDashboard = () => {
  const [filter, setFilter] = useState("all"); // all | published | drafts
  const [sort, setSort] = useState("recent"); // recent | popular | alpha
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({

    total: 0,
    published: 0,
    drafts: 0
  });

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

  const getFilteredCourses = () => {
  let filtered = [...courses];

  // FILTER
  if (filter === "published") {
    filtered = filtered.filter(course => course.published);
  } else if (filter === "drafts") {
    filtered = filtered.filter(course => !course.published);
  }

  // SORT
  if (sort === "popular") {
    filtered.sort(
      (a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0)
    );
  } else if (sort === "alpha") {
    filtered.sort((a, b) => a.title.localeCompare(b.title));
  } else {
    // recent (default) – newest first
    filtered.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  return filtered;
};

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div className="mentor-container">
      {/* Header Section */}
      <div className="mentor-header">
        <div className="header-content">
          <div className="title-section">
            <div className="title-icon">
              <FaGraduationCap />
            </div>
            <div>
              <h1 className="mentor-title">Mentor Dashboard</h1>
              <p className="mentor-subtitle">Create, manage, and publish your courses</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ marginLeft: "auto" }}>
            <Link to="/profile" className="profile-btn">
              View Profile
            </Link>
          </div>
        </div>

        <div className="mentor-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaBook />
            </div>
            <div>
              <div className="stat-number">{stats.total}</div>
              <div className="stat-label">Total Courses</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon published">
              <FaCheckCircle />
            </div>
            <div>
              <div className="stat-number">{stats.published}</div>
              <div className="stat-label">Published</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon drafts">
              <FaRegClock />
            </div>
            <div>
              <div className="stat-number">{stats.drafts}</div>
              <div className="stat-label">Drafts</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon enrolled">
              <FiUsers />
            </div>
            <div>
              <div className="stat-number">
                {courses.reduce((total, course) => total + (course.enrolledCount || 0), 0)}
              </div>
              <div className="stat-label">Total Enrollments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Section */}
      <div className="action-section">
        <Link to="/mentor/create-course" className="create-course-btn">
          <FaPlus className="btn-icon" />
          Create New Course
        </Link>
        
        <div className="view-toggle">
  <button
    className={`view-toggle-btn ${filter === "all" ? "active" : ""}`}
    onClick={() => setFilter("all")}
  >
    All Courses
  </button>

  <button
    className={`view-toggle-btn ${filter === "published" ? "active" : ""}`}
    onClick={() => setFilter("published")}
  >
    Published
  </button>

  <button
    className={`view-toggle-btn ${filter === "drafts" ? "active" : ""}`}
    onClick={() => setFilter("drafts")}
  >
    Drafts
  </button>
</div>

      </div>

      <div className="divider"></div>

      {/* Courses Section */}
      <div className="courses-section">
        <div className="section-header">
          <h2 className="section-title">
            <FaBookOpen className="section-icon" />
            Your Courses
          </h2>
          <div className="sort-filter">
            <select className="sort-select"
  value={sort}
  onChange={(e) => setSort(e.target.value)}
>
  <option value="recent">Recently Created</option>
  <option value="popular">Most Popular</option>
  <option value="alpha">Alphabetical</option>
  </select>

          </div>
        </div>

        {loading ? (
          <div className="loading-courses">
            {[1, 2, 3].map((n) => (
              <div key={n} className="course-skeleton">
                <div className="skeleton-header"></div>
                <div className="skeleton-line"></div>
                <div className="skeleton-line short"></div>
                <div className="skeleton-footer"></div>
              </div>
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaBookOpen />
            </div>
            <h3>No courses created yet</h3>
            <p>Start creating courses to share your knowledge with students</p>
            <Link to="/mentor/create-course" className="create-course-btn primary">
              <FaPlus className="btn-icon" />
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="course-grid">
            {getFilteredCourses().map((course) => (
              <div 
                key={course._id} 
                className={`course-card ${course.published ? 'published' : 'draft'}`}
              >
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
                
                <div className="course-content">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">{course.description}</p>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <span className="meta-label">Price</span>
                      <span className="meta-value price">₹{course.price}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-label">Category</span>
                      <span className="meta-value category">{course.category || "General"}</span>
                    </div>
                  </div>
                  
                  <div className="course-stats">
                    <div className="stat-item">
                      <FiUsers className="stat-icon" />
                      <span>{course.enrolledCount || 0} enrolled</span>
                    </div>
                    <div className="stat-item">
                      <FaStar className="stat-icon" />
                      <span>{course.rating || "No ratings"}</span>
                    </div>
                  </div>
                </div>
                
                <div className="course-actions">
                  {course.published ? (
                    <div className="published-actions">
                      <Link 
                        to={`/mentor/course/${course._id}`} 
                        className="action-btn view"
                      >
                        <FaEye /> Preview Course
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorDashboard;