import axios from "axios";

const API = "http://localhost:5000/courses";

const getToken = () => localStorage.getItem("token");

/* 🔓 Public – get all published courses */
export const getPublishedCourses = () => {
  return axios.get(API);
};

/* 🔐 Mentor – create course */
export const createCourse = (courseData) => {
  return axios.post(API, courseData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/* 🔐 Mentor – get own courses */
export const getMyCourses = () => {
  return axios.get(`${API}/my`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

/* 🔐 Mentor – publish/unpublish (future use) */
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
