import axios from "axios";

const API = "http://localhost:5000/api/profile";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getMyProfile = () => {
  return axios.get(`${API}/me`, getAuthConfig());
};
