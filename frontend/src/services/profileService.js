import axios from "axios";

const API = "https://edtech-saas.onrender.com/api/profile";

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
