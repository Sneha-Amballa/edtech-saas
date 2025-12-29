import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCourses, publishCourse } from "../services/courseService";

const MentorDashboard = () => {
  const [courses, setCourses] = useState([]);

  const loadCourses = async () => {
    try {
      const res = await getMyCourses();
      setCourses(res.data);
    } catch (err) {
      alert("Failed to load courses");
    }
  };

  const handlePublish = async (courseId) => {
    try {
      await publishCourse(courseId);
      alert("Course published!");
      loadCourses(); // refresh list
    } catch (err) {
      alert("Publish failed");
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>🧑‍🏫 Mentor Dashboard</h1>
      <p>Manage your courses</p>

      <Link to="/mentor/create-course">
        <button>Create New Course</button>
      </Link>

      <hr style={{ margin: "20px 0" }} />

      <h2>Your Courses</h2>

      {courses.length === 0 && <p>No courses created yet</p>}

      {courses.map((course) => (
        <div
          key={course._id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p>₹{course.price}</p>

          {course.published ? (
            <span style={{ color: "green", fontWeight: "bold" }}>
              ✅ Published
            </span>
          ) : (
            <button onClick={() => handlePublish(course._id)}>
              Publish
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default MentorDashboard;
