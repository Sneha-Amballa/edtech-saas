import { Link } from "react-router-dom";
import {
  FaGraduationCap,
  FaUser,
  FaArrowRight,
  FaPlay,
  FaUsers,
  FaChartLine,
  FaStar,
} from "react-icons/fa";
import { MdOutlineLiveTv } from "react-icons/md";
import { IoIosRocket } from "react-icons/io";

import "../styles/home.css";

const Home = () => {
  return (
    <div className="home-container">

      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <FaGraduationCap />
            <span>Edu<span className="highlight">Mentor</span></span>
          </div>

          <div className="nav-links">
            <Link to="/courses">Courses</Link>
            <Link to="/mentors">Mentors</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/login" className="login-btn">
              <FaUser /> Login
            </Link>
            <Link to="/register" className="signup-btn">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">

          <div className="badge">
            <FaStar /> Trusted by 50,000+ Professionals
          </div>

          <h1>
            Master <span className="gradient-text">In-Demand Skills</span><br />
            with Industry Experts
          </h1>

          <p>
            Live interactive learning, real mentors, real projects.
            Grow faster with personalized guidance.
          </p>

          <div className="hero-cta">
            <Link to="/register" className="btn-primary">
              Start Free Trial <FaArrowRight />
            </Link>

            <Link to="/demo" className="btn-secondary">
              <span className="play-circle">
                <FaPlay />
              </span>
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <FaUsers />
            <h3>500+</h3>
            <p>Expert Mentors</p>
          </div>

          <div className="stat-card">
            <MdOutlineLiveTv />
            <h3>2,000+</h3>
            <p>Live Courses</p>
          </div>

          <div className="stat-card">
            <IoIosRocket />
            <h3>98%</h3>
            <p>Career Growth</p>
          </div>

          <div className="stat-card">
            <FaChartLine />
            <h3>4.9/5</h3>
            <p>Student Rating</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
