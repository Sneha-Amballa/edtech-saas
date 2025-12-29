import { useEffect, useState } from "react";
import { getPublishedCourses } from "../services/courseService";

const Courses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    getPublishedCourses()
      .then((res) => setCourses(res.data))
      .catch(() => alert("Failed to load courses"));
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h1>📚 Available Courses</h1>

      {courses.length === 0 && <p>No courses available</p>}

      {courses.map((course) => (
        <div
          key={course._id}
          style={{
            border: "1px solid #ccc",
            padding: "20px",
            marginBottom: "15px",
          }}
        >
          <h3>{course.title}</h3>
          <p>{course.description}</p>
          <p><strong>₹{course.price}</strong></p>
        </div>
      ))}
    </div>
  );
};

export default Courses;
