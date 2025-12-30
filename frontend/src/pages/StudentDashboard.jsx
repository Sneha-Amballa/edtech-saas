import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getPublishedCourses } from "../services/courseService";
import "../styles/studentDashboard.css";

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
  FaList
} from "react-icons/fa";
import { FiBook, FiTrendingUp } from "react-icons/fi";

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"
  const [sortOption, setSortOption] = useState("recommended");
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
    // In a real app, you would fetch enrolled courses count from user data
    const enrolled = JSON.parse(localStorage.getItem("enrolledCourses") || "[]");
    setEnrolledCount(enrolled.length);
    
    // Get user data from localStorage or API
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

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

  const getCategories = () => {
    const allCategories = courses.map(course => course.category).filter(Boolean);
    return ["all", ...new Set(allCategories)];
  };

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("enrolledCourses");
    
    // Redirect to login page
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
      default: // "recommended"
        // For recommended, we can combine rating and enrollment
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

  return (
    <div className="student-dashboard">
      {/* Top Bar with Profile */}
      <div className="dashboard-top-bar">
        <div className="dashboard-title-section">
          <div className="title-icon student">
            <FaGraduationCap />
          </div>
          <div>
            <h1 className="dashboard-title">Student Dashboard</h1>
            <p className="dashboard-subtitle">Discover and enroll in courses to expand your knowledge</p>
          </div>
        </div>
        
        <div className="profile-section">
          <div className="user-info">
            <FaUserCircle className="user-avatar" />
            <div className="user-details">
              <span className="user-name">{user?.name || "Student"}</span>
              <span className="user-role">Student</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon available">
            <FaBookOpen />
          </div>
          <div>
            <div className="stat-number">{courses.length}</div>
            <div className="stat-label">Available Courses</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon enrolled">
            <FaUserGraduate />
          </div>
          <div>
            <div className="stat-number">{enrolledCount}</div>
            <div className="stat-label">Enrolled Courses</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon progress">
            <FaChartLine />
          </div>
          <div>
            <div className="stat-number">0</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon completed">
            <FaStar />
          </div>
          <div>
            <div className="stat-number">0</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="filter-section">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search courses by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-options">
          <div className="filter-group">
            <FaFilter className="filter-icon" />
            <select 
              className="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {getCategories()
                .filter(cat => cat !== "all")
                .map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))
              }
            </select>
          </div>
          
          <div className="sort-options">
            <select 
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="price-low-high">Price: Low to High</option>
              <option value="price-high-low">Price: High to Low</option>
              <option value="rating-highest">Rating: Highest First</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
        </div>
      </div>

      <div className="divider"></div>

      {/* Courses Section */}
      <div className="courses-section">
        <div className="section-header">
          <h2 className="section-title">
            <FiBook className="section-icon" />
            Available Courses
            <span className="course-count">{sortedAndFilteredCourses.length} courses</span>
          </h2>
          
          <div className="view-options">
            <button 
              className={`view-toggle ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode("grid")}
            >
              <FaThLarge /> Grid View
            </button>
            <button 
              className={`view-toggle ${viewMode === "list" ? "active" : ""}`}
              onClick={() => setViewMode("list")}
            >
              <FaList /> List View
            </button>
          </div>
        </div>

        {loading ? (
          <div className={`loading-courses ${viewMode}`}>
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className={`course-skeleton ${viewMode}`}>
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line"></div>
                  <div className="skeleton-line short"></div>
                  <div className="skeleton-footer"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedAndFilteredCourses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <FaBookOpen />
            </div>
            <h3>No courses found</h3>
            <p>Try adjusting your search or filter to find what you're looking for</p>
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
          <div className={`course-container ${viewMode}`}>
            {sortedAndFilteredCourses.map((course) => (
              <div key={course._id} className={`course-card ${viewMode}`}>
                <div className="course-image">
                  {course.imageUrl ? (
                    <img src={course.imageUrl} alt={course.title} />
                  ) : (
                    <div className="course-image-placeholder">
                      <FaBookOpen />
                    </div>
                  )}
                  {course.featured && (
                    <div className="featured-badge">
                      <FaStar /> Featured
                    </div>
                  )}
                </div>
                
                <div className="course-content">
                  <div className="course-header">
                    <h3 className="course-title">{course.title}</h3>
                    <div className="course-rating">
                      <FaStar className="star-icon" />
                      <span>{course.rating || "New"}</span>
                      {course.reviewCount && (
                        <span className="review-count">({course.reviewCount})</span>
                      )}
                    </div>
                  </div>
                  
                  <p className="course-instructor">
                    By {course.instructor?.name || "Unknown Instructor"}
                  </p>
                  
                  <p className="course-description">
                    {course.description.length > (viewMode === "list" ? 200 : 120)
                      ? `${course.description.substring(0, viewMode === "list" ? 200 : 120)}...`
                      : course.description}
                  </p>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <FaClock className="meta-icon" />
                      <span>{course.duration || "Self-paced"}</span>
                    </div>
                    <div className="meta-item">
                      <FaUsers className="meta-icon" />
                      <span>{course.enrolledCount || 0} enrolled</span>
                    </div>
                    <div className="meta-item">
                      <FiTrendingUp className="meta-icon" />
                      <span>{course.level || "All Levels"}</span>
                    </div>
                    {viewMode === "list" && course.category && (
                      <div className="meta-item">
                        <span className="category-tag">{course.category}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="course-footer">
                    <div className="course-pricing">
                      <div className="price">₹{course.price}</div>
                      {course.originalPrice && (
                        <div className="original-price">₹{course.originalPrice}</div>
                      )}
                      {course.discountPercentage && (
                        <div className="discount-badge">{course.discountPercentage}% OFF</div>
                      )}
                    </div>
                    
                    <div className="course-actions">
                      <Link 
                        to={`/course/${course._id}`}
                        className="view-course-btn"
                      >
                        <FaPlayCircle /> View Details
                      </Link>
                      <button className="enroll-btn">
                        Enroll Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;