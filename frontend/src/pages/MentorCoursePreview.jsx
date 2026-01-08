import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPublicCourseById } from "../services/courseService";
import {
  FaArrowLeft,
  FaVideo,
  FaFileAlt,
  FaUsers,
  FaStar,
  FaClock,
  FaEdit,
  FaBookOpen
} from "react-icons/fa";
import { FiTrendingUp } from "react-icons/fi";
import "../styles/courseDetails.css"; // reuse same styles

const MentorCoursePreview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);

  /* ---------------- LOAD COURSE ---------------- */
  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const res = await getPublicCourseById(id);
      setCourse(res.data);

      if (res.data.lessons?.length) {
        setActiveLesson(res.data.lessons[0]);
      }
    } catch (err) {
      alert("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- UI STATES ---------------- */
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course preview...</p>
      </div>
    );
  }

  if (!course) {
    return <h2>Course not found</h2>;
  }

  return (
    <div className="course-details-container">
      {/* ---------------- HEADER ---------------- */}
      <header className="course-header">
        <div className="header-left">
          <button onClick={() => navigate("/mentor")} className="back-btn">
            <FaArrowLeft /> Back to Dashboard
          </button>
          <h1 className="course-title">{course.title}</h1>
        </div>

        <Link
          to={`/mentor/course/${course._id}/manage`}
          className="edit-course-btn"
        >
          <FaEdit /> Edit Course
        </Link>
      </header>

      {/* ---------------- OVERVIEW ---------------- */}
      <div className="course-overview">
        <div className="course-meta-info">
          <div className="course-stats">
            <span><FaStar /> {course.rating || "4.5"}</span>
            <span><FaUsers /> {course.enrolledCount || 0} Enrolled</span>
            <span><FiTrendingUp /> {course.level || "All Levels"}</span>
            <span><FaClock /> {course.duration || "Self-paced"}</span>
          </div>
        </div>

        <p>{course.description}</p>
      </div>

      {/* ---------------- CONTENT ---------------- */}
      <div className="course-content-wrapper">
        {/* LEFT SIDE */}
        <div className="course-content-left">
          <div className="content-header">
            <h2>
              <FaBookOpen /> Course Content (Preview)
            </h2>
          </div>

          <div className="lessons-list">
            {course.lessons.map((lesson, index) => (
              <div
                key={lesson._id}
                className={`lesson-item ${
                  activeLesson?._id === lesson._id ? "active" : ""
                }`}
              >
                <div
                  className="lesson-header"
                  onClick={() => setActiveLesson(lesson)}
                >
                  <span className="lesson-number">{index + 1}</span>

                  <div className="lesson-info">
                    <h4>{lesson.title}</h4>
                    <span>
                      {lesson.type === "video" ? <FaVideo /> : <FaFileAlt />}
                      {lesson.type}
                    </span>
                  </div>
                </div>

                {activeLesson?._id === lesson._id && (
                  <div className="lesson-content">
                    {lesson.type === "video" ? (
                      <video src={lesson.content} controls />
                    ) : (
                      <p>{lesson.content}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="course-content-right">
          <div className="course-card">
            <h2>₹{course.price}</h2>

            <ul>
              <li><FaVideo /> Video lessons</li>
              <li><FaFileAlt /> Text lessons</li>
              <li><FaUsers /> {course.enrolledCount || 0} students</li>
              <li><FaStar /> Ratings enabled</li>
            </ul>

            <Link
              to={`/mentor/course/${course._id}/manage`}
              className="manage-course-btn"
            >
              <FaEdit /> Manage Course
            </Link>
          </div>
        </div>

        <div className="mentor-analytics">
  <p><FaUsers /> {course.enrolledCount || 0} Enrollments</p>
  <p><FaStar /> Rating: {course.rating || "N/A"}</p>
  <p><FiTrendingUp /> Status: {course.published ? "Published" : "Draft"}</p>
</div>

      </div>
    </div>
  );
};

export default MentorCoursePreview;
