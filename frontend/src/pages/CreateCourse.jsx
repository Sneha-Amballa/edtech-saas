import { useState } from "react";
import { createCourse } from "../services/courseService";

const CreateCourse = () => {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
  });

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCourse(course);
      alert("Course created successfully!");
      setCourse({ title: "", description: "", price: "" });
    } catch (err) {
      alert("Failed to create course");
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Create Course</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Course title"
          value={course.title}
          onChange={handleChange}
          required
        />
        <br /><br />

        <textarea
          name="description"
          placeholder="Course description"
          value={course.description}
          onChange={handleChange}
          required
        />
        <br /><br />

        <input
          name="price"
          type="number"
          placeholder="Price"
          value={course.price}
          onChange={handleChange}
          required
        />
        <br /><br />

        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateCourse;
