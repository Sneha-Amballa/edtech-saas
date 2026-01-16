import axios from "axios";

const API = "https://edtech-saas.onrender.com/auth";

export const registerUser = (data) =>
  axios.post(`${API}/register`, data);

export const loginUser = (data) =>
  axios.post(`${API}/login`, data);
