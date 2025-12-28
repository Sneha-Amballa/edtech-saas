import { Link } from "react-router-dom";
import { FaGraduationCap, FaEnvelope, FaLock } from "react-icons/fa";
import "../styles/login.css";

const Login = () => {
  return (
    <div className="login-container">
      <div className="login-card">

        {/* Logo */}
        <div className="login-logo">
          <FaGraduationCap className="logo-icon" />
          <h2>
            Edu<span>Mentor</span>
          </h2>
        </div>

        <p className="login-subtitle">
          Welcome back. Please login to your account.
        </p>

        <form className="login-form">
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input type="email" placeholder="Email address" />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input type="password" placeholder="Password" />
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="login-text">
          Don’t have an account?{" "}
          <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
