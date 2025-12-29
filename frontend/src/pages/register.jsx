import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  FaGraduationCap,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTie,
} from "react-icons/fa";
import { registerUser } from "../services/authService";
import "../styles/register.css";

const Register = () => {
  const navigate = useNavigate();

  // 1️⃣ Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });

  // 2️⃣ Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // 3️⃣ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page refresh

    try {
      await registerUser(formData);
      alert("Registration successful! Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">

        {/* Logo */}
        <div className="register-logo">
          <FaGraduationCap className="logo-icon" />
          <h2>
            Edu<span>Mentor</span>
          </h2>
        </div>

        <p className="register-subtitle">
          Create your account and start learning
        </p>

        <form className="register-form" onSubmit={handleSubmit}>

          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Full name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Email address"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaUserTie className="input-icon" />
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="mentor">Mentor</option>
            </select>
          </div>

          <button type="submit" className="register-btn">
            Create Account
          </button>
        </form>

        <p className="register-text">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
