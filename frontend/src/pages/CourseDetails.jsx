import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicCourseById } from "../services/courseService";
import {
  FaLock,
  FaUnlock,
  FaVideo,
  FaFileAlt,
  FaCheckCircle,
  FaClock,
  FaBook,
  FaUserGraduate,
  FaStar,
  FaUsers,
  FaChartLine,
  FaArrowLeft,
  FaUserCircle,
  FaSignOutAlt
} from "react-icons/fa";
import { FiTrendingUp, FiBook } from "react-icons/fi";
import "../styles/courseDetails.css";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);

  /* -------------------------------- LOAD COURSE -------------------------------- */
  useEffect(() => {
    loadCourse();
  }, [id]);

  const loadCourse = async () => {
    try {
      setLoading(true);
      const res = await getPublicCourseById(id);
      setCourse(res.data);

      const firstFree = res.data.lessons.find(l => l.isFree);
      if (firstFree) setActiveLesson(firstFree);
    } catch (err) {
      console.error(err);
      alert("Failed to load course");
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------ LOAD USER + PROGRESS ------------------------------ */
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);

    const completed = JSON.parse(
      localStorage.getItem(`completed_${id}`) || "[]"
    );
    setCompletedLessons(completed);
  }, [id]);

  /* ------------------------------ CALCULATE PROGRESS ------------------------------ */
  useEffect(() => {
    if (!course || course.lessons.length === 0) return;

    const percent =
      (completedLessons.length / course.lessons.length) * 100;
    setProgress(Math.round(percent));
  }, [completedLessons, course]);

  /* -------------------------------- ACTIONS -------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const markLessonComplete = (lessonId) => {
    if (completedLessons.includes(lessonId)) return;

    const updated = [...completedLessons, lessonId];
    setCompletedLessons(updated);
    localStorage.setItem(`completed_${id}`, JSON.stringify(updated));
  };

  const handleEnroll = () => {
    const enrolled = JSON.parse(
      localStorage.getItem("enrolledCourses") || "[]"
    );

    if (!enrolled.includes(id)) {
      enrolled.push(id);
      localStorage.setItem("enrolledCourses", JSON.stringify(enrolled));
      alert("Enrolled successfully!");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading course...</p>
      </div>
    );
  }

  if (!course) {
    return <h2>Course not found</h2>;
  }

  const isEnrolled = JSON.parse(
    localStorage.getItem("enrolledCourses") || "[]"
  ).includes(id);

  return (
    <div className="course-details-container">
      {/* HEADER */}
      <header className="course-header">
        <div className="header-left">
          <button onClick={() => navigate("/student")} className="back-btn">
            <FaArrowLeft /> Back
          </button>
          <h1 className="course-title">{course.title}</h1>
        </div>

        <div className="profile-section">
          <div className="user-info">
            <FaUserCircle className="user-avatar" />
            <div>
              <span className="user-name">{user?.name || "Student"}</span>
              <span className="user-role">Student</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* OVERVIEW */}
      <div className="course-overview">
        <div className="course-meta-info">
          <div className="instructor-info">
            <div className="instructor-avatar">
              {course.instructor?.name?.charAt(0) || "I"}
            </div>
            <div>
              <p className="instructor-label">Instructor</p>
              <h3>{course.instructor?.name || "Unknown"}</h3>
            </div>
          </div>

          <div className="course-stats">
            <span><FaStar /> {course.rating || "4.5"}</span>
            <span><FaUsers /> {course.enrolledCount || 0}</span>
            <span><FiTrendingUp /> {course.level || "All Levels"}</span>
            <span><FaClock /> {course.duration || "Self paced"}</span>
          </div>
        </div>

        <p>{course.description}</p>
      </div>

      {/* CONTENT */}
      <div className="course-content-wrapper">
        <div className="course-content-left">
          <div className="content-header">
            <h2><FiBook /> Course Content</h2>
            <div className="progress-section">
              <span>{progress}% completed</span>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="lessons-list">
            {course.lessons.map((lesson, index) => {
              const canAccess = lesson.isFree || isEnrolled;
              const isCompleted = completedLessons.includes(lesson._id);

              return (
                <div
                  key={lesson._id}
                  className={`lesson-item ${isCompleted ? "completed" : ""}`}
                >
                  <div
                    className="lesson-header"
                    onClick={() => canAccess && setActiveLesson(lesson)}
                  >
                    <span className="lesson-number">
                      {isCompleted ? <FaCheckCircle /> : index + 1}
                    </span>

                    <div className="lesson-info">
                      <h4>{lesson.title}</h4>
                      <span>
                        {lesson.type === "video" ? <FaVideo /> : <FaFileAlt />}
                        {lesson.type}
                      </span>
                    </div>

                    {!canAccess && (
                      <span className="access-badge locked">
                        <FaLock /> Locked
                      </span>
                    )}
                  </div>

                  {activeLesson?._id === lesson._id && canAccess && (
                    <div className="lesson-content">
                      {lesson.type === "video" ? (
                        <video
                          src={lesson.content}
                          controls
                          onEnded={() => markLessonComplete(lesson._id)}
                        />
                      ) : (
                        <p>{lesson.content}</p>
                      )}

                      <button
                        className="mark-complete-btn"
                        onClick={() => markLessonComplete(lesson._id)}
                        disabled={isCompleted}
                      >
                        {isCompleted ? "Completed" : "Mark Complete"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT CARD */}
        <div className="course-content-right">
          <div className="course-card">
            <h2>₹{course.price}</h2>

            {!isEnrolled ? (
              <button className="enroll-btn" onClick={handleEnroll}>
                Enroll Now
              </button>
            ) : (
              <div className="status-badge">
                <FaUserGraduate /> Enrolled
              </div>
            )}

            <ul>
              <li><FaVideo /> Video lessons</li>
              <li><FaFileAlt /> Text lessons</li>
              <li><FaChartLine /> Progress tracking</li>
              <li><FaStar /> Certificate</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
