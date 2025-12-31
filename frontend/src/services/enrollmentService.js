import axios from "axios";

const API = "http://localhost:5000/api/enrollments";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

// 🎓 Enroll in course
export const enrollInCourse = (courseId) => {
  // Backend expects POST /api/enrollments/:courseId
  return axios.post(`${API}/${courseId}`, {}, getAuthConfig());
};

// 📚 Get student's enrolled courses
export const getMyCourses = () => {
  return axios.get(`${API}/my-courses`, getAuthConfig());
};

// ✅ Mark a lesson complete (backend-driven progress)
export const markLessonComplete = (courseId, lessonId) => {
  return axios.post(`${API}/${courseId}/lesson/${lessonId}`, {}, getAuthConfig());
};

// 📊 Get counts for enrolled, in-progress, completed courses for current student
export const getCounts = () => {
  return axios.get(`${API}/counts`, getAuthConfig());
};

// 🧾 Get certificate data for a completed course
export const getCertificate = (courseId) => {
  return axios.get(`${API}/${courseId}/certificate`, getAuthConfig());
};
