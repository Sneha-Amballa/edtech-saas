import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPublicCourseById } from "../services/courseService";
import { FaLock, FaUnlock, FaVideo, FaFileAlt } from "react-icons/fa";

const CourseDetails = () => {
  const { id } = useParams();
  const [course, setCourse] = useState(null);

  useEffect(() => {
    loadCourse();
  }, []);

  const loadCourse = async () => {
    try {
      const res = await getPublicCourseById(id);
      setCourse(res.data);
    } catch {
      alert("Failed to load course");
    }
  };

  if (!course) return <p>Loading...</p>;

  return (
    <div style={{ padding: "40px" }}>
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <h3>₹{course.price}</h3>

      <hr />

      <h2>Course Content</h2>

      {course.lessons.map((lesson, index) => (
        <div
          key={lesson._id}
          style={{
            border: "1px solid #ccc",
            padding: "12px",
            marginBottom: "10px",
          }}
        >
          <h4>
            {index + 1}. {lesson.title}
          </h4>

          <p>Type: {lesson.type}</p>

          {lesson.isFree ? (
            <>
              <p style={{ color: "green" }}>
                <FaUnlock /> Free Preview
              </p>

              {lesson.type === "text" && <p>{lesson.content}</p>}

              {lesson.type === "video" && (
                <video src={lesson.content} controls width="100%" />
              )}
            </>
          ) : (
            <p style={{ color: "red" }}>
              <FaLock /> Locked – Enroll to access
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CourseDetails;
