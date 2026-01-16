import { Link, useNavigate } from "react-router-dom";
import {
  FaGraduationCap,
  FaUser,
  FaArrowRight,
  FaPlay,
  FaUsers,
  FaChartLine,
  FaStar,
  FaCheck,
  FaBriefcase,
  FaCertificate,
  FaClock,
  FaChalkboardTeacher,
  FaLaptopCode,
  FaSearch,
  FaCalendarAlt,
} from "react-icons/fa";
import { MdOutlineLiveTv, MdOutlineWorkspacePremium } from "react-icons/md";
import { IoIosRocket, IoIosTrendingUp } from "react-icons/io";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import "../styles/home.css";

const Home = () => {
  const [scrollY, setScrollY] = useState(0);
  const [showCoursesDropdown, setShowCoursesDropdown] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in
  const isLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  // Handle course navigation with auth check
  const handleCourseAccess = (path = "/courses") => {
    if (!isLoggedIn()) {
      navigate("/login");
    } else {
      navigate(path);
    }
  };

  // Handle enrollment with auth check
  const handleEnroll = () => {
    if (!isLoggedIn()) {
      navigate("/login");
    }
  };

  // Handle courses dropdown
  const toggleCoursesDropdown = () => {
    if (!isLoggedIn()) {
      navigate("/login");
    } else {
      setShowCoursesDropdown(!showCoursesDropdown);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const courses = [
    { title: "Data Science", category: "Tech", students: "12.5k", duration: "6 months" },
    { title: "UX/UI Design", category: "Design", students: "8.2k", duration: "4 months" },
    { title: "Digital Marketing", category: "Business", students: "15.3k", duration: "3 months" },
    { title: "Web Development", category: "Tech", students: "21.7k", duration: "8 months" },
  ];

  const mentors = [
    { name: "Dr. Sarah Chen", role: "Senior Data Scientist", company: "Google", students: "5,200" },
    { name: "Michael Rodriguez", role: "Lead UX Designer", company: "Meta", students: "3,800" },
    { name: "Alex Johnson", role: "Marketing Director", company: "Amazon", students: "7,100" },
    { name: "Prof. James Wilson", role: "Full Stack Architect", company: "Microsoft", students: "9,400" },
  ];

  return (
    <div className="home-container">
      {/* Professional Header with Navigation */}
      <header className={`header ${scrollY > 50 ? 'header-scrolled' : ''}`}>
        <div className="header-container">
          <div className="header-logo">
            <FaGraduationCap className="logo-icon" />
            <div className="logo-text">
              <span className="logo-main">Edu</span>
              <span className="logo-accent">Mentor</span>
            </div>
          </div>

          <nav className="header-nav">
            <div className="nav-main">
              <div className="nav-item-wrapper" style={{ position: "relative" }}>
                <button
                  onClick={toggleCoursesDropdown}
                  className="nav-link"
                  style={{ background: "none", border: "none", cursor: "pointer" }}
                >
                  <span>Courses</span>
                  <div className="nav-indicator"></div>
                </button>

                {/* Courses Dropdown */}
                {showCoursesDropdown && (
                  <div className="courses-dropdown">
                    <div className="dropdown-content">
                      {courses.map((course, index) => (
                        <div key={index} className="dropdown-course-card">
                          <div className="course-category-badge">{course.category}</div>
                          <h4 className="dropdown-course-title">{course.title}</h4>
                          <div className="dropdown-course-meta">
                            <div className="meta-item">
                              <FaUsers style={{ fontSize: "0.75rem" }} />
                              <span>{course.students}</span>
                            </div>
                            <div className="meta-item">
                              <FaClock style={{ fontSize: "0.75rem" }} />
                              <span>{course.duration}</span>
                            </div>
                          </div>
                          <button
                            onClick={handleEnroll}
                            className="dropdown-course-btn"
                          >
                            View Course
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => {
                          setShowCoursesDropdown(false);
                          handleCourseAccess("/courses");
                        }}
                        className="view-all-courses-btn"
                      >
                        View All Courses <FaArrowRight style={{ fontSize: "0.875rem" }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <Link to="/mentors" className="nav-link">
                <span>Mentors</span>
                <div className="nav-indicator"></div>
              </Link>
              <Link to="/enterprise" className="nav-link">
                <span>For Business</span>
                <div className="nav-indicator"></div>
              </Link>
              <Link to="/pricing" className="nav-link">
                <span>Pricing</span>
                <div className="nav-indicator"></div>
              </Link>
            </div>
          </nav>

          <div className="header-actions">
            <button className="search-btn">
              <FaSearch />
            </button>
            <Link to="/login" className="btn-login">
              <FaUser className="btn-icon" />
              <span>Log in</span>
            </Link>
            <Link to="/register" className="btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="hero-badge"
            >
              <FaStar className="badge-icon" />
              <span>Trusted by 500+ companies worldwide</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="hero-title"
            >
              Advance Your Career with
              <span className="title-gradient"> Industry-Leading</span> Mentors
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hero-description"
            >
              Join 50,000+ professionals in live, interactive learning experiences
              with personalized mentorship from top industry experts.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="hero-actions"
            >
              <button
                onClick={() => handleCourseAccess("/courses")}
                className="btn-primary btn-large"
                style={{ background: "var(--gradient-primary)", border: "none", cursor: "pointer" }}
              >
                <span>Explore Courses</span>
                <FaArrowRight className="arrow-icon" />
              </button>
              <button className="btn-video">
                <div className="video-play">
                  <FaPlay />
                </div>
                <span>Watch Demo</span>
              </button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="hero-features"
            >
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>1-on-1 mentorship</span>
              </div>
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>Career coaching</span>
              </div>
              <div className="feature">
                <FaCheck className="feature-icon" />
                <span>Project portfolio</span>
              </div>
            </motion.div>
          </div>

          <div className="hero-visual">
            <div className="visual-card">
              <div className="card-header">
                <div className="live-badge">
                  <div className="live-dot"></div>
                  LIVE
                </div>
                <span className="card-title">Data Science Bootcamp</span>
              </div>
              <div className="card-stats">
                <div className="stat">
                  <FaUsers />
                  <span>248 students online</span>
                </div>
                <div className="stat">
                  <FaClock />
                  <span>Starts in 15 min</span>
                </div>
              </div>
              <div className="card-mentor">
                <div className="mentor-avatar"></div>
                <div className="mentor-info">
                  <span className="mentor-name">Dr. Sarah Chen</span>
                  <span className="mentor-role">Senior Data Scientist, Google</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="trust-bar">
        <div className="trust-container">
          <span className="trust-label">Trusted by professionals at</span>
          <div className="trust-logos">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix'].map((company, index) => (
              <div key={index} className="company-logo">
                {company}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="stats-container">
          <div className="stat-card stat-mentors">
            <div className="stat-icon">
              <FaUsers />
            </div>
            <div className="stat-content">
              <h3>500+</h3>
              <p>Expert Mentors</p>
            </div>
          </div>
          <div className="stat-card stat-courses">
            <div className="stat-icon">
              <MdOutlineLiveTv />
            </div>
            <div className="stat-content">
              <h3>2,000+</h3>
              <p>Live Courses</p>
            </div>
          </div>
          <div className="stat-card stat-career">
            <div className="stat-icon">
              <FaBriefcase />
            </div>
            <div className="stat-content">
              <h3>85%</h3>
              <p>Career Advancement</p>
            </div>
          </div>
          <div className="stat-card stat-satisfaction">
            <div className="stat-icon">
              <FaCertificate />
            </div>
            <div className="stat-content">
              <h3>4.9/5</h3>
              <p>Student Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Courses */}
      <section className="courses-section">
        <div className="section-header">
          <h2 className="section-title">Most Popular Courses</h2>
          <p className="section-subtitle">Hands-on learning with industry experts</p>
          <button
            onClick={() => handleCourseAccess("/courses")}
            className="section-link"
            style={{ background: "none", border: "none", cursor: "pointer", color: "var(--primary)", display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            View all courses <FaArrowRight />
          </button>
        </div>

        <div className="courses-grid">
          {courses.map((course, index) => (
            <div key={index} className="course-card">
              <div className="course-category">{course.category}</div>
              <h3 className="course-title">{course.title}</h3>
              <div className="course-meta">
                <div className="meta-item">
                  <FaUsers />
                  <span>{course.students} students</span>
                </div>
                <div className="meta-item">
                  <FaClock />
                  <span>{course.duration}</span>
                </div>
              </div>
              <div className="course-footer">
                <span className="course-price">From $499</span>
                <button
                  onClick={handleEnroll}
                  className="btn-outline"
                  style={{ padding: "0.625rem 1.25rem", borderRadius: "6px", border: "1.5px solid var(--gray-300)", background: "transparent", color: "var(--gray-700)", fontWeight: "500", cursor: "pointer", transition: "all 0.2s ease" }}
                  onMouseEnter={(e) => { e.target.style.borderColor = "var(--primary)"; e.target.style.color = "var(--primary)"; e.target.style.background = "rgba(37, 99, 235, 0.05)"; }}
                  onMouseLeave={(e) => { e.target.style.borderColor = "var(--gray-300)"; e.target.style.color = "var(--gray-700)"; e.target.style.background = "transparent"; }}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="works-section">
        <div className="works-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Start your learning journey in three simple steps</p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">
                <FaSearch />
              </div>
              <h3>Find Your Course</h3>
              <p>Browse our catalog and choose the perfect program for your career goals</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">
                <FaChalkboardTeacher />
              </div>
              <h3>Learn with Experts</h3>
              <p>Join live sessions and get personalized guidance from industry leaders</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">
                <FaBriefcase />
              </div>
              <h3>Launch Your Career</h3>
              <p>Complete real-world projects and receive career placement support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors */}
      <section className="mentors-section">
        <div className="section-header">
          <h2 className="section-title">Meet Our Expert Mentors</h2>
          <p className="section-subtitle">Learn directly from industry leaders</p>
        </div>

        <div className="mentors-grid">
          {mentors.map((mentor, index) => (
            <div key={index} className="mentor-card">
              <div className="mentor-avatar-large">
                <FaUser style={{ color: "white", fontSize: "2rem" }} />
              </div>
              <div className="mentor-info">
                <h3>{mentor.name}</h3>
                <p className="mentor-role">{mentor.role}</p>
                <p className="mentor-company">{mentor.company}</p>
                <div className="mentor-stats">
                  <FaUsers />
                  <span>{mentor.students} students mentored</span>
                </div>
              </div>
              <button className="btn-outline">View Profile</button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <div className="cta-content">
            <h2>Ready to Transform Your Career?</h2>
            <p>Join thousands of professionals who have accelerated their growth with EduMentor</p>
            <div className="cta-actions">
              <button
                onClick={handleEnroll}
                className="btn-primary btn-large"
                style={{ background: "var(--gradient-primary)", border: "none", cursor: "pointer" }}
              >
                Start Free Trial
              </button>
              <Link to="/demo" className="btn-secondary">
                Schedule a Demo
              </Link>
            </div>
            <div className="cta-note">
              <FaCalendarAlt />
              <span>7-day free trial • Cancel anytime • No credit card required</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-container">
          <div className="footer-main">
            <div className="footer-brand">
              <div className="footer-logo">
                <FaGraduationCap />
                <span>EduMentor</span>
              </div>
              <p className="footer-tagline">
                Empowering careers through expert-led, live learning experiences.
              </p>
            </div>

            <div className="footer-links">
              <div className="link-group">
                <h4>Platform</h4>
                <Link to="/courses">Courses</Link>
                <Link to="/mentors">Mentors</Link>
                <Link to="/pricing">Pricing</Link>
                <Link to="/enterprise">For Business</Link>
              </div>
              <div className="link-group">
                <h4>Resources</h4>
                <Link to="/blog">Blog</Link>
                <Link to="/careers">Careers</Link>
                <Link to="/help">Help Center</Link>
                <Link to="/community">Community</Link>
              </div>
              <div className="link-group">
                <h4>Company</h4>
                <Link to="/about">About Us</Link>
                <Link to="/contact">Contact</Link>
                <Link to="/privacy">Privacy Policy</Link>
                <Link to="/terms">Terms of Service</Link>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© 2026 EduMentor. All rights reserved.</p>
            <div className="footer-social">
              <span>Connect with us:</span>
              <div className="social-links">
                {['Twitter', 'LinkedIn', 'YouTube', 'Instagram'].map((social, index) => (
                  <a key={index} href={`#${social.toLowerCase()}`} className="social-link">
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;