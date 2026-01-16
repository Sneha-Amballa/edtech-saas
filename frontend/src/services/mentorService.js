import axios from "axios";

const API_BASE_URL = "https://edtech-saas.onrender.com";
const API = `${API_BASE_URL}/api/mentors`;

// Get all mentors (public endpoint)
export const getAllMentors = () => {
  return axios.get(API);
};

// Get mentor profile by ID (public endpoint)
export const getMentorProfile = (mentorId) => {
  return axios.get(`${API}/${mentorId}`);
};

