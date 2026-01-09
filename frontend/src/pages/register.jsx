import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaGraduationCap,
  FaUser,
  FaEnvelope,
  FaLock,
  FaUserTie,
  FaArrowRight,
  FaCheck,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import { registerUser } from "../services/authService";
import "../styles/register.css";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const roles = [
    { value: "student", icon: <FaUserGraduate />, title: "Student", desc: "Learn from experts" },
    { value: "mentor", icon: <FaChalkboardTeacher />, title: "Mentor", desc: "Share your knowledge" },
  ];

  // Password strength checker
  useEffect(() => {
    const calculateStrength = () => {
      let strength = 0;
      if (formData.password.length >= 8) strength += 25;
      if (/[A-Z]/.test(formData.password)) strength += 25;
      if (/[0-9]/.test(formData.password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(formData.password)) strength += 25;
      setPasswordStrength(strength);
    };
    calculateStrength();
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleSelect = (role) => {
    setFormData(prev => ({
      ...prev,
      role
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  const form = e.target; // ✅ move it here (important)

  if (!agreedToTerms) {
    alert("Please agree to the Terms of Service and Privacy Policy");
    return;
  }

  if (!formData.name || !formData.email || !formData.password || !formData.role) {
    alert("Please fill in all fields");
    return;
  }

  setIsLoading(true);

  try {
    await registerUser(formData);

    form.classList.add("success");

    setTimeout(() => {
      alert("Registration successful! Please login.");
      navigate("/login");
    }, 1500);

  } catch (error) {
    form.classList.add("error-shake");
    setTimeout(() => form.classList.remove("error-shake"), 500);

    alert(
      error.response?.data?.message ||
      "Registration failed. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};


  const passwordRequirements = [
    { label: "At least 8 characters", met: formData.password.length >= 8 },
    { label: "Contains uppercase letter", met: /[A-Z]/.test(formData.password) },
    { label: "Contains number", met: /[0-9]/.test(formData.password) },
    { label: "Contains special character", met: /[^A-Za-z0-9]/.test(formData.password) },
  ];

  return (
    <div className="register-page-container">
      {/* Background Elements */}
      <div className="register-bg-gradient"></div>
      <div className="register-floating-shape shape-1"></div>
      <div className="register-floating-shape shape-2"></div>
      <div className="register-floating-shape shape-3"></div>

      {/* Main Content */}
      <div className="register-content-wrapper">
        {/* Left Panel - Form */}
        <motion.div 
          className="register-form-panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="form-header">
            <div className="form-logo">
              <FaGraduationCap className="logo-icon" />
              <div className="logo-text">
                <span>Edu</span>
                <span className="logo-accent">Mentor</span>
              </div>
            </div>
            <h1>Create Your Account</h1>
            <p className="form-subtitle">
              Join thousands of learners and mentors on EduMentor
            </p>
          </div>

          <form className="register-form" onSubmit={handleSubmit}>
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

            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  <FaUser className="label-icon" />
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  <FaEnvelope className="label-icon" />
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
                <p className="input-hint">We'll send a confirmation email to this address</p>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Security</h3>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  <FaLock className="label-icon" />
                  Password
                </label>
                <div className="password-input-wrapper">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-input"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                <div className="password-strength">
                  <div className="strength-meter">
                    <div 
                      className="strength-fill"
                      style={{ width: `${passwordStrength}%` }}
                      data-strength={passwordStrength}
                    ></div>
                  </div>
                  <span className="strength-text">
                    {passwordStrength < 50 ? "Weak" : 
                     passwordStrength < 75 ? "Fair" : 
                     passwordStrength < 90 ? "Good" : "Strong"}
                  </span>
                </div>

                {/* Password Requirements */}
                <div className="password-requirements">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className={`requirement ${req.met ? 'met' : ''}`}>
                      <div className="requirement-icon">
                        {req.met ? <FaCheck /> : <span>•</span>}
                      </div>
                      <span>{req.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Select Your Role</h3>
              
              <div className="role-selection">
                {roles.map((role) => (
                  <motion.div
                    key={role.value}
                    className={`role-option ${formData.role === role.value ? 'selected' : ''}`}
                    onClick={() => !isLoading && handleRoleSelect(role.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="role-icon">{role.icon}</div>
                    <div className="role-info">
                      <h4>{role.title}</h4>
                      <p>{role.desc}</p>
                    </div>
                    {formData.role === role.value && (
                      <div className="role-check">
                        <FaCheck />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <div className="role-hint">
                <p>
                  <strong>Student:</strong> Access courses, join live sessions, get mentorship
                </p>
                <p>
                  <strong>Mentor:</strong> Create courses, host sessions, guide students
                </p>
              </div>
            </div>

            <div className="form-section">
              <div className="terms-agreement">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={isLoading}
                  />
                  <span className="checkmark"></span>
                  <span className="terms-text">
                    I agree to the <Link to="/terms">Terms of Service</Link> and{" "}
                    <Link to="/privacy">Privacy Policy</Link>
                  </span>
                </label>
              </div>
            </div>

            <motion.button
              type="submit"
              className="submit-button"
              disabled={isLoading || !agreedToTerms}
              whileHover={!isLoading ? { scale: 1.02 } : {}}
              whileTap={!isLoading ? { scale: 0.98 } : {}}
            >
              {isLoading ? (
                <span className="button-loading">
                  <span className="loading-dots"></span>
                </span>
              ) : (
                <>
                  Create Account
                  <FaArrowRight className="button-icon" />
                </>
              )}
            </motion.button>

            <div className="login-redirect">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="login-link">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </motion.div>

        {/* Right Panel - Benefits */}
        <motion.div 
          className="register-benefits-panel"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="benefits-header">
            <h2>Why Join EduMentor?</h2>
            <p className="benefits-subtitle">
              Discover the benefits of our learning community
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <FaUserGraduate />
              </div>
              <h3>Personalized Learning</h3>
              <p>Get custom learning paths tailored to your goals and skill level</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FaChalkboardTeacher />
              </div>
              <h3>Expert Mentorship</h3>
              <p>Learn directly from industry professionals with real-world experience</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FaUserTie />
              </div>
              <h3>Career Growth</h3>
              <p>Access career guidance, portfolio reviews, and job placement support</p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon">
                <FaGraduationCap />
              </div>
              <h3>Flexible Schedule</h3>
              <p>Learn at your own pace with live and recorded sessions available</p>
            </div>
          </div>

          <div className="testimonial-section">
            <h3>What Our Members Say</h3>
            <div className="testimonial">
              <p className="testimonial-text">
                "EduMentor transformed my career. The 1:1 mentorship helped me land my dream job in tech."
              </p>
              <div className="testimonial-author">
                <div className="author-avatar"></div>
                <div className="author-info">
                  <strong>Sarah Chen</strong>
                  <span>Software Engineer at Google</span>
                </div>
              </div>
            </div>
          </div>

          <div className="stats-section">
            <div className="stat">
              <h4>50,000+</h4>
              <p>Active Learners</p>
            </div>
            <div className="stat">
              <h4>98%</h4>
              <p>Satisfaction Rate</p>
            </div>
            <div className="stat">
              <h4>500+</h4>
              <p>Industry Experts</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="register-footer">
        <p>© 2024 EduMentor. All rights reserved.</p>
        <div className="footer-links">
          <Link to="/help">Help Center</Link>
          <span>•</span>
          <Link to="/contact">Contact Us</Link>
          <span>•</span>
          <Link to="/status">System Status</Link>
        </div>
      </footer>
    </div>
  );
};

export default Register;