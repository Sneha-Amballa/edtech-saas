import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTie,
} from "react-icons/fa";

import "../styles/register.css";

const Register = () => {
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

        <form className="register-form">
          <div className="input-group">
            <FaUser className="input-icon" />
            <input type="text" placeholder="Full name" />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input type="email" placeholder="Email address" />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input type="password" placeholder="Password" />
          </div>

          <div className="input-group">
            <FaUserTie className="input-icon" />
            <select>
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
