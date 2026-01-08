import axios from "axios";

const API = "http://localhost:5000/courses";

const getToken = () => localStorage.getItem("token");

/* 🌍 Student – browse courses */
export const getPublishedCourses = () => {
  return axios.get(API);
};

/* 🌍 Student – course details */
export const getPublicCourseById = (courseId) => {
  return axios.get(`${API}/${courseId}/public`);
};

/* 👨‍🏫 Mentor – create course */
export const createCourse = (courseData) => {
  return axios.post(API, courseData, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/* 👨‍🏫 Mentor – own courses */
export const getMyCourses = () => {
  return axios.get(`${API}/my`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/* 👨‍🏫 Mentor – manage course */
export const getCourseById = (id) => {
  return axios.get(`${API}/${id}/manage`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/* 👨‍🏫 Mentor – add lesson (TEXT / VIDEO ONLY) */
export const addLesson = (id, data) => {
  return axios.post(`${API}/${id}/lessons`, data, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
};

/* 👨‍🏫 Mentor – publish */
export const publishCourse = (id) => {
  return axios.patch(
    `${API}/${id}/publish`,
    {},
    { headers: { Authorization: `Bearer ${getToken()}` } }
  );
};

/* 👨‍🏫 Mentor – update course details */
export const updateCourse = (id, data) => {
  return axios.put(`${API}/${id}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/* 👨‍🏫 Mentor – edit lesson */
export const editLesson = (id, lessonId, data) => {
  return axios.patch(`${API}/${id}/lessons/${lessonId}`, data, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};

/* 👨‍🏫 Mentor – delete lesson */
export const deleteLesson = (id, lessonId) => {
  return axios.delete(`${API}/${id}/lessons/${lessonId}`, {
    headers: { Authorization: `Bearer ${getToken()}` },
  });
};
