import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaGraduationCap, 
  FaEnvelope, 
  FaLock, 
  FaArrowRight,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaUserShield
} from "react-icons/fa";
import { loginUser } from "../services/authService";
import "../styles/login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Role cards for visual enhancement
  const roles = [
    { icon: <FaUserGraduate />, title: "Student", desc: "Access your courses" },
    { icon: <FaChalkboardTeacher />, title: "Mentor", desc: "Manage your sessions" }
  ];

  useEffect(() => {
    // Preload animation
    document.body.classList.add('login-page');
    return () => document.body.classList.remove('login-page');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setIsLoading(true);
    
    try {
      const res = await loginUser({ email, password });

      // Store authentication data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem(
        "user",
        JSON.stringify({ 
          token: res.data.token, 
          role: res.data.role, 
          name: res.data.name 
        })
      );

      // Redirect based on role
      const redirectPaths = {
        "student": "/student",
        "mentor": "/mentor"
      };
      
      navigate(redirectPaths[res.data.role] || "/");

    } catch (error) {
      // Show error state
      const form = e.target;
      form.classList.add('shake');
      setTimeout(() => form.classList.remove('shake'), 500);
      
      alert(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      {/* Animated Background Elements */}
      <div className="login-bg-gradient"></div>
      <div className="login-floating-shape shape-1"></div>
      <div className="login-floating-shape shape-2"></div>
      
      {/* Main Content */}
      <div className="login-content-wrapper">
        {/* Left Panel - Brand & Info */}
        <motion.div 
          className="login-brand-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="brand-header">
            <div className="brand-logo">
              <FaGraduationCap className="brand-icon" />
              <div className="brand-text">
                <span className="brand-primary">Edu</span>
                <span className="brand-accent">Mentor</span>
              </div>
            </div>
            <p className="brand-tagline">
              Empowering learners through expert mentorship
            </p>
          </div>

          <div className="role-cards">
            {roles.map((role, index) => (
              <motion.div 
                key={index}
                className="role-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="role-icon">{role.icon}</div>
                <div className="role-info">
                  <h4>{role.title}</h4>
                  <p>{role.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="brand-stats">
            <div className="stat-item">
              <h3>50K+</h3>
              <p>Active Learners</p>
            </div>
            <div className="stat-item">
              <h3>500+</h3>
              <p>Expert Mentors</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </motion.div>

        {/* Right Panel - Login Form */}
        <motion.div 
          className="login-form-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="form-header">
            <h2>Welcome Back</h2>
            <p>Sign in to continue your learning journey</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <AnimatePresence>
              {isLoading && (
                <motion.div 
                  className="form-loading-overlay"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <div className="loading-spinner"></div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <FaEnvelope className="label-icon" />
                Email Address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <FaLock className="label-icon" />
                Password
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <div className="form-helper">
                <Link to="/forgot-password" className="forgot-link">
                  Forgot password?
                </Link>
              </div>
            </div>

            <motion.button
              type="submit"
              className="submit-button"
              disabled={isLoading}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <span className="button-loading">
                  <span className="loading-dots"></span>
                </span>
              ) : (
                <>
                  Sign In
                  <FaArrowRight className="button-icon" />
                </>
              )}
            </motion.button>

            <div className="form-divider">
              <span>New to EduMentor?</span>
            </div>

            <Link to="/register" className="register-link">
              Create an account
            </Link>

            <div className="form-footer">
              <p className="terms-text">
                By signing in, you agree to our{" "}
                <Link to="/terms">Terms of Service</Link> and{" "}
                <Link to="/privacy">Privacy Policy</Link>
              </p>
            </div>
          </form>

          
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="login-footer">
        <p>© 2026 EduMentor. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/help">Help Center</Link>
          <span>•</span>
          <Link to="/contact">Contact</Link>
          <span>•</span>
          <Link to="/status">Status</Link>
        </div>
      </footer>
    </div>
  );
};

export default Login;