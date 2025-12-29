import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaGraduationCap, FaEnvelope, FaLock } from "react-icons/fa";
import { loginUser } from "../services/authService";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();

  // 1️⃣ State for form data
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 2️⃣ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page reload

    try {
      const res = await loginUser({ email, password });

      // 3️⃣ Store token & role
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // 4️⃣ Redirect based on role
      if (res.data.role === "student") navigate("/student");
      else if (res.data.role === "mentor") navigate("/mentor");
      else if (res.data.role === "admin") navigate("/admin");

    } catch (error) {
      alert("Invalid email or password");
    }
  };

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

        <form className="login-form" onSubmit={handleSubmit}>
          
          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <FaLock className="input-icon" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
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
