import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicCourseById } from "../services/courseService";
import ThemeToggle from "../components/ThemeToggle";
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
  FaSignOutAlt,
  FaPlay,
  FaBookOpen,
  FaGraduationCap,
  FaCertificate,
  FaArrowRight,
  FaChevronRight,
  FaChevronDown,
  FaRegCircle,
  FaRegCheckCircle,
  FaTrophy,
  FaMedal,
  FaQuestionCircle,
  FaComments
} from "react-icons/fa";
import { FiTrendingUp, FiBook, FiCalendar, FiBarChart2 } from "react-icons/fi";
import { GiDuration } from "react-icons/gi";
import "../styles/courseDetails.css";
import { enrollInCourse, getMyCourses, markLessonComplete as markLessonCompleteService, createPaymentOrder, verifyPayment } from "../services/enrollmentService";
import ChatModal from "../components/ChatModal";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLesson, setActiveLesson] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [user, setUser] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [status, setStatus] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);


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
  }, [id]);

  /* ------------------------------ CALCULATE PROGRESS ------------------------------ */
  useEffect(() => {
    if (!course || course.lessons.length === 0) return;

    const percent =
      (completedLessons.length / course.lessons.length) * 100;
    setProgress(Math.round(percent));
  }, [completedLessons, course]);

  /* ------------------------------ ENROLLMENT CHECK ------------------------------ */
  const checkEnrollment = async () => {
    try {
      const res = await getMyCourses();
      const enrollments = res.data || [];
      const match = enrollments.find((e) => e.course._id === id);
      if (match) {
        setIsEnrolled(true);
        setStatus(match.status);
        setCompletedLessons(match.completedLessons || []);
        setProgress(match.progress || 0);
      } else {
        setIsEnrolled(false);
        setCompletedLessons([]);
        setProgress(0);
      }
    } catch {
      setIsEnrolled(false);
    }
  };

  useEffect(() => {
    checkEnrollment();
  }, [id]);

  /* -------------------------------- ACTIONS -------------------------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const markLessonComplete = (lessonId) => {
    if (completedLessons.includes(lessonId)) return;
    markLessonCompleteApi(lessonId);
  };

  const markLessonCompleteApi = async (lessonId) => {
    try {
      const res = await markLessonCompleteService(id, lessonId);
      const enrollment = res.data.enrollment;
      if (enrollment) {
        setCompletedLessons(enrollment.completedLessons || []);
        setProgress(enrollment.progress || 0);
      }

      if (enrollment?.status === "completed") {
        alert("Congratulations — course completed!");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to mark complete");
    }
  };

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleEnroll = async () => {
    // If course is free or 0
    if (!course.price || course.price === 0) {
      try {
        const res = await enrollInCourse(id);
        const enrollment = res.data?.enrollment;
        alert("Enrolled successfully!");
        setIsEnrolled(true);
        setCompletedLessons(enrollment?.completedLessons || []);
        setProgress(enrollment?.progress || 0);
      } catch (err) {
        alert(err.response?.data?.message || "Enrollment failed");
      }
      return;
    }

    // Paid Course Logic
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Please check your connection.");
      return;
    }

    try {
      // 1. Create Order
      const { data } = await createPaymentOrder(id);

      // 2. Open Razorpay
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "EdTech Platform",
        description: data.course.title,
        order_id: data.orderId,
        handler: async function (response) {
          try {
            // 3. Verify Payment
            const verifyRes = await verifyPayment(id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            alert("Payment Successful! You are now enrolled.");
            setIsEnrolled(true);
            // Optionally refresh enrollment data
            checkEnrollment();
          } catch (err) {
            console.error(err);
            alert("Payment verification failed. Please contact support if money was deducted.");
          }
        },
        prefill: {
          name: data.user.name,
          email: data.user.email,
          contact: data.user.contact
        },
        theme: {
          color: "#3399cc"
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        alert(response.error.description || "Payment failed");
      });
      rzp1.open();

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Could not initiate payment");
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
    return <h2 className="course-not-found">Course not found</h2>;
  }

  return (
    <div className="course-details-container">
      {/* HEADER */}
      <header className="course-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate("/student")} className="back-btn">
              <FaArrowLeft /> Back to Dashboard
            </button>
            <div className="breadcrumb">
              <span className="crumb">Courses</span>
              <FaChevronRight className="crumb-separator" />
              <span className="crumb active">{course.title}</span>
            </div>
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                <FaUserCircle />
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || "Student"}</span>
                <span className="user-role">Student</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="course-main">
        {/* HERO SECTION */}
        <div className="course-hero">
          <div className="hero-content">
            <div className="course-badge">
              <FaBookOpen className="badge-icon" />
              <span>{course.category || "Development"}</span>
            </div>
            <h1 className="course-title">{course.title}</h1>
            <p className="course-description">{course.description}</p>

            <div className="hero-meta">
              <div className="meta-item">
                <FiBarChart2 className="meta-icon" />
                <span>{course.level || "All Levels"}</span>
              </div>
              <div className="meta-item">
                <GiDuration className="meta-icon" />
                <span>{course.duration || "Self-paced"}</span>
              </div>
              <div className="meta-item">
                <FaUsers className="meta-icon" />
                <span>{course.enrolledCount || 0} enrolled</span>
              </div>
              <div className="meta-item">
                <FaStar className="meta-icon" />
                <span>{course.rating || "4.5"}</span>
              </div>
            </div>
          </div>

          <div className="hero-action">
            <div className="price-section">
              <div className="price-label">Course Price</div>
              <div className="price-amount">₹{course.price}</div>
              {course.originalPrice && (
                <div className="original-price">₹{course.originalPrice}</div>
              )}
            </div>

            {!isEnrolled ? (
              <button className="enroll-btn primary" onClick={handleEnroll}>
                <FaGraduationCap /> Enroll Now
              </button>
            ) : status === "completed" ? (
              <div className="completed-actions">
                <button className="enroll-btn success" disabled>
                  <FaTrophy /> Course Completed
                </button>
                <button className="certificate-btn" onClick={() => navigate(`/certificate/${id}`)}>
                  <FaCertificate /> View Certificate
                </button>
              </div>
            ) : (
              <button className="enroll-btn continue" onClick={() => {
                const first = course.lessons.find((l) => l.isFree) || course.lessons[0];
                if (first) navigate(`/course/${id}/lesson/${first._id}`);
              }}>
                <FaPlay /> Continue Learning
              </button>
            )}

            <div className="action-features">
              <div className="feature">
                <FaVideo /> 30-Day Money-Back Guarantee
              </div>
              <div className="feature">
                <FaCertificate /> Certificate of Completion
              </div>
              <div className="feature">
                <FaClock /> Lifetime Access
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="content-grid">
          {/* LEFT COLUMN - COURSE CONTENT */}
          <div className="content-left">
            {/* PROGRESS SECTION */}
            <div className="progress-card">
              <div className="progress-header">
                <h3><FiBook /> Your Learning Progress</h3>
                <span className="progress-percent">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
              <div className="progress-stats">
                <div className="stat">
                  <span className="stat-value">{completedLessons.length}</span>
                  <span className="stat-label">Lessons Completed</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{course.lessons.length - completedLessons.length}</span>
                  <span className="stat-label">Remaining</span>
                </div>
                <div className="stat">
                  <span className="stat-value">{course.lessons.length}</span>
                  <span className="stat-label">Total Lessons</span>
                </div>
              </div>
            </div>

            {/* LESSONS SECTION */}
            <div className="lessons-card">
              <div className="card-header">
                <h3><FaBookOpen /> Course Curriculum</h3>
                <span className="lessons-count">{course.lessons.length} lessons</span>
              </div>

              <div className="lessons-list">
                {course.lessons.map((lesson, index) => {
                  const canAccess = lesson.isFree || isEnrolled;
                  const isCompleted = completedLessons.includes(lesson._id);

                  return (
                    <div
                      key={lesson._id}
                      className={`lesson-item ${isCompleted ? "completed" : ""} ${canAccess ? "accessible" : "locked"} ${activeLesson?._id === lesson._id ? "active" : ""}`}
                    >
                      <div className="lesson-header" onClick={() => {
                        if (!canAccess) return;
                        navigate(`/course/${id}/lesson/${lesson._id}`);
                      }}>
                        <div className="lesson-status">
                          {isCompleted ? (
                            <FaCheckCircle className="completed-icon" />
                          ) : (
                            <div className="lesson-number">{index + 1}</div>
                          )}
                        </div>

                        <div className="lesson-info">
                          <div className="lesson-title-row">
                            <h4>{lesson.title}</h4>
                            <span className={`lesson-type ${lesson.type}`}>
                              {lesson.type === "video" ? <FaVideo /> : <FaFileAlt />}
                              {lesson.type}
                            </span>
                          </div>
                          <div className="lesson-meta">
                            <span className="duration">
                              <FaClock /> {lesson.duration || "10 mins"}
                            </span>
                            {!lesson.isFree && !isEnrolled && (
                              <span className="premium-badge">
                                <FaStar /> Premium
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="lesson-actions">
                          {canAccess ? (
                            <button className="expand-btn">
                              <FaArrowRight />
                            </button>
                          ) : (
                            <span className="lock-icon">
                              <FaLock />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WHAT YOU'LL LEARN */}
            <div className="learnings-card">
              <h3><FaGraduationCap /> What You'll Learn</h3>
              <div className="learnings-grid">
                <div className="learning-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Master key concepts and techniques</span>
                </div>
                <div className="learning-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Build real-world projects</span>
                </div>
                <div className="learning-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Get certified upon completion</span>
                </div>
                <div className="learning-item">
                  <FaCheckCircle className="check-icon" />
                  <span>Access to exclusive resources</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="content-right">
            {/* INSTRUCTOR CARD */}
            <div className="instructor-card">
              <div className="instructor-header">
                <div className="instructor-avatar">
                  {course.instructor?.name?.charAt(0) || "I"}
                </div>
                <div className="instructor-info">
                  <span className="instructor-label">Instructor</span>
                  <h4>{course.instructor?.name || "Expert Instructor"}</h4>
                </div>
              </div>
              <p className="instructor-bio">
                Experienced professional with years of industry experience
              </p>
              <button className="ask-doubt-btn" onClick={() => setShowChatModal(true)}>
                <FaComments /> Ask a Doubt
              </button>
            </div>

            {/* COURSE FEATURES */}
            <div className="features-card">
              <h4><FaStar /> Course Features</h4>
              <ul className="features-list">
                <li>
                  <FaVideo className="feature-icon" />
                  <span>Video Lessons</span>
                </li>
                <li>
                  <FaFileAlt className="feature-icon" />
                  <span>Downloadable Resources</span>
                </li>
                <li>
                  <FaChartLine className="feature-icon" />
                  <span>Progress Tracking</span>
                </li>
                <li>
                  <FaCertificate className="feature-icon" />
                  <span>Certificate of Completion</span>
                </li>
                <li>
                  <FaClock className="feature-icon" />
                  <span>Lifetime Access</span>
                </li>
                <li>
                  <FaQuestionCircle className="feature-icon" />
                  <span>Q&A Support</span>
                </li>
              </ul>
            </div>

            {/* ACHIEVEMENTS */}
            {isEnrolled && (
              <div className="achievements-card">
                <div className="achievements-header">
                  <FaTrophy className="trophy-icon" />
                  <h4>Your Achievements</h4>
                </div>
                <div className="achievements-list">
                  <div className={`achievement ${progress >= 25 ? 'unlocked' : 'locked'}`}>
                    <div className="achievement-icon">
                      {progress >= 25 ? <FaMedal /> : <FaRegCircle />}
                    </div>
                    <div className="achievement-info">
                      <span className="achievement-title">Getting Started</span>
                      <span className="achievement-desc">Complete 25% of course</span>
                    </div>
                  </div>
                  <div className={`achievement ${progress >= 50 ? 'unlocked' : 'locked'}`}>
                    <div className="achievement-icon">
                      {progress >= 50 ? <FaMedal /> : <FaRegCircle />}
                    </div>
                    <div className="achievement-info">
                      <span className="achievement-title">Halfway There</span>
                      <span className="achievement-desc">Complete 50% of course</span>
                    </div>
                  </div>
                  <div className={`achievement ${progress >= 100 ? 'unlocked' : 'locked'}`}>
                    <div className="achievement-icon">
                      {progress >= 100 ? <FaMedal /> : <FaRegCircle />}
                    </div>
                    <div className="achievement-info">
                      <span className="achievement-title">Course Master</span>
                      <span className="achievement-desc">Complete 100% of course</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NEED HELP */}
            <div className="help-card">
              <FaQuestionCircle className="help-icon" />
              <h4>Need Help?</h4>
              <p>Our support team is here to assist you</p>
              <button className="help-btn" onClick={() => setShowChatModal(true)}>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </main>

      {showChatModal && (
        <ChatModal
          courseId={id}
          mentorName={course.instructor?.name}
          onClose={() => setShowChatModal(false)}
        />
      )}
    </div>
  );
};

export default CourseDetails;