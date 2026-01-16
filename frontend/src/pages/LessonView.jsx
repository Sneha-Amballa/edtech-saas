import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getPublicCourseById } from "../services/courseService";
import { getMyCourses, markLessonComplete as markLessonCompleteServer } from "../services/enrollmentService";
import { FaArrowLeft, FaCheckCircle, FaRegCircle } from "react-icons/fa";
import "../styles/lessonView.css";

const LessonView = () => {
    const { id, lessonId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lesson, setLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessons, setCompletedLessons] = useState([]);

    useEffect(() => {
        loadData();
    }, [id, lessonId]);

    const loadData = async () => {
        try {
            setLoading(true);
            // 1. Fetch Course
            const courseRes = await getPublicCourseById(id);
            const courseData = courseRes.data;
            setCourse(courseData);

            // 2. Find Lesson
            const currentLesson = courseData.lessons.find((l) => l._id === lessonId);
            if (currentLesson) {
                setLesson(currentLesson);
            } else {
                // Lesson not found, maybe redirect
                alert("Lesson not found");
                navigate(`/course/${id}`);
                return;
            }

            // 3. Check Enrollment
            try {
                const enrollRes = await getMyCourses();
                const enrollments = enrollRes.data || [];
                const match = enrollments.find((e) => e.course._id === id);

                if (match) {
                    setIsEnrolled(true);
                    setCompletedLessons(match.completedLessons || []);
                } else {
                    setIsEnrolled(false);
                }
            } catch (err) {
                console.error("Failed to check enrollment", err);
                setIsEnrolled(false);
            }

        } catch (err) {
            console.error(err);
            alert("Failed to load lesson");
            navigate(`/course/${id}`);
        } finally {
            setLoading(false);
        }
    };

    const markLessonComplete = async () => {
        if (!isEnrolled) return; // Should not happen if UI is correct
        if (completedLessons.includes(lessonId)) return;

        try {
            const res = await markLessonCompleteServer(id, lessonId);
            const enrollment = res.data.enrollment;
            if (enrollment) {
                setCompletedLessons(enrollment.completedLessons || []);
                if (enrollment.status === "completed") {
                    alert("Congratulations — You've completed the course!");
                }
            }
        } catch (err) {
            console.error(err);
            alert("Failed to mark lesson complete");
        }
    };

    if (loading) {
        return (
            <div className="lesson-view-container" style={{ justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (!lesson) return null;

    // Access Control
    const canAccess = lesson.isFree || isEnrolled;

    if (!canAccess) {
        return (
            <div className="lesson-view-container">
                <div className="lesson-content-card" style={{ padding: '2rem', textAlign: 'center' }}>
                    <h2>Access Denied</h2>
                    <p>You need to enroll in this course to view this lesson.</p>
                    <button onClick={() => navigate(`/course/${id}`)} className="back-btn" style={{ margin: '1rem auto' }}>
                        Back to Course
                    </button>
                </div>
            </div>
        );
    }

    const isCompleted = completedLessons.includes(lesson._id);

    return (
        <div className="lesson-view-container">
            <div className="lesson-view-header">
                <button onClick={() => navigate(`/course/${id}`)} className="back-btn">
                    <FaArrowLeft /> Back to Course
                </button>
                <div style={{ flex: 1 }}></div>
            </div>

            <div className="lesson-content-card">
                <div className="lesson-meta-bar">
                    <h1 className="lesson-title">{lesson.title}</h1>
                    {isCompleted && (
                        <span className="completed-badge">
                            <FaCheckCircle /> Completed
                        </span>
                    )}
                </div>

                {lesson.type === "video" ? (
                    <div className="lesson-video-wrapper">
                        <video src={lesson.content} controls controlsList="nodownload" />
                    </div>
                ) : (
                    <div className="lesson-text-wrapper">
                        {lesson.content}
                    </div>
                )}

                <div className="lesson-actions-bar">
                    <button
                        className="mark-complete-btn"
                        onClick={markLessonComplete}
                        disabled={isCompleted || !isEnrolled}
                    >
                        {isCompleted ? (
                            <><FaCheckCircle /> Lesson Completed</>
                        ) : (
                            <><FaRegCircle /> Mark as Complete</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LessonView;
