import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPublishedCourses } from "../services/courseService";
import "../styles/courses.css";
import { 
  FaUsers, 
  FaClock, 
  FaStar, 
  FaArrowLeft,
  FaBook
} from "react-icons/fa";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("recommended");
  const navigate = useNavigate();

  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const res = await getPublishedCourses();
      setCourses(res.data || []);
    } catch (error) {
      console.error("Failed to load courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
  };

  // Filter courses based on search
  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort courses
  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortOption) {
      case "price-low":
        return (a.price || 0) - (b.price || 0);
      case "price-high":
        return (b.price || 0) - (a.price || 0);
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="courses-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="courses-container">
      {/* Header Section */}
      <div className="courses-header">
        <div className="header-content">
          <h1>Explore Courses</h1>
          <p>Discover and enroll in our comprehensive collection of courses taught by industry experts</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="courses-main">
        {/* Controls Section */}
        <div className="courses-controls">
          <div className="filter-group">
            <input
              type="text"
              className="search-box"
              placeholder="Search courses, topics, or skills..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="sort-select"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
          <div className="results-info">
            {sortedCourses.length} {sortedCourses.length === 1 ? "course" : "courses"} found
          </div>
        </div>

        {/* Courses Grid */}
        {sortedCourses.length > 0 ? (
          <div className="courses-grid">
            {sortedCourses.map((course) => (
              <div key={course._id} className="course-card">
                <div className="course-image">
                  <FaBook />
                </div>
                
                <div className="course-content">
                  <div className="course-category">
                    {course.category || "General"}
                  </div>
                  
                  <h3 className="course-title">{course.title}</h3>
                  
                  <p className="course-description">
                    {course.description || "No description available"}
                  </p>
                  
                  <div className="course-meta">
                    <div className="meta-item">
                      <FaUsers />
                      <span>{course.enrolledStudents?.length || 0} students</span>
                    </div>
                    <div className="meta-item">
                      <FaClock />
                      <span>{course.duration || "Self-paced"}</span>
                    </div>
                  </div>

                  <div className="course-footer">
                    <div>
                      <div className="course-price-label">Price</div>
                      <div className="course-price">₹{course.price || "Free"}</div>
                    </div>
                    <button
                      className="btn-enroll"
                      onClick={handleEnroll}
                    >
                      Enroll Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h2>No Courses Found</h2>
            <p>
              {searchTerm
                ? "Try adjusting your search terms or browse all courses"
                : "No courses available at the moment"}
            </p>
            <button
              className="btn-back"
              onClick={() => navigate("/")}
            >
              <FaArrowLeft />
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
