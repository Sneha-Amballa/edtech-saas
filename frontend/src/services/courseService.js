import axios from "axios";

const API = "http://localhost:5000/courses";

const getToken = () => localStorage.getItem("token");

/* 🌍 Public – student browse */
export const getPublishedCourses = () => {
  return axios.get(API);
};

/* 👨‍🏫 Mentor – create course */
export const createCourse = (courseData) => {
  return axios.post(API, courseData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/* 👨‍🏫 Mentor – get own courses */
export const getMyCourses = () => {
  return axios.get(`${API}/my`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/* 👨‍🏫 Mentor – publish course */
export const publishCourse = (courseId) => {
  return axios.patch(
    `${API}/${courseId}/publish`,
    {},
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }
  );
};

/* 👨‍🏫 Mentor – get course by ID (manage page) */
export const getCourseById = (courseId) => {
  return axios.get(`${API}/${courseId}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/* 👨‍🏫 Mentor – add lesson (TEXT / VIDEO ONLY) */
export const addLesson = (courseId, formData) => {
  return axios.post(`${API}/${courseId}/lessons`, formData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
};
