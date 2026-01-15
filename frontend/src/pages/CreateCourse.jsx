import { useState } from "react";
import { createCourse } from "../services/courseService";
import { Link } from "react-router-dom";
import { 
  FiArrowLeft, 
  FiBookOpen, 
  FiFileText, 
  FiDollarSign,
  FiCheckCircle,
  FiPlus
} from "react-icons/fi";

const CreateCourse = () => {
  const [course, setCourse] = useState({
    title: "",
    description: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);
    
    try {
      await createCourse(course);
      setSuccess(true);
      alert("Course created successfully!");
      setCourse({ title: "", description: "", price: "" });
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      alert("Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container" style={{ minHeight: "100vh", backgroundColor: "#f8fafc" }}>
      {/* Header Section */}
      <div className="navbar" style={{ background: "white", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <div className="nav-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="logo">
            <div style={{ 
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              width: "40px",
              height: "40px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <FiBookOpen color="white" size={24} />
            </div>
            <span style={{ fontSize: "24px", fontWeight: "700" }}>
              Create<span className="highlight" style={{ color: "#6366f1" }}>Course</span>
            </span>
          </div>
          
          <div className="nav-links">
            <Link 
              to="/mentor" 
              className="btn-secondary"
              style={{
                padding: "10px 20px",
                border: "2px solid #6366f1",
                borderRadius: "10px",
                color: "#6366f1",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontWeight: "500"
              }}
            >
              <FiArrowLeft size={18} />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ 
        maxWidth: "800px", 
        margin: "0 auto", 
        padding: "40px 20px" 
      }}>
        {/* Success Message */}
        {success && (
          <div style={{
            background: "linear-gradient(135deg, #10b981, #059669)",
            color: "white",
            padding: "16px 24px",
            borderRadius: "12px",
            marginBottom: "32px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 4px 20px rgba(16, 185, 129, 0.3)"
          }}>
            <FiCheckCircle size={24} />
            <div>
              <h3 style={{ margin: "0", fontWeight: "600" }}>Course Created Successfully!</h3>
              <p style={{ margin: "4px 0 0 0", opacity: "0.9" }}>
                Your course is now live and visible to students.
              </p>
            </div>
          </div>
        )}

        {/* Form Card */}
        <div style={{
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          padding: "40px",
          border: "1px solid #e5e7eb"
        }}>
          <div style={{ marginBottom: "32px" }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px"
            }}>
              <div style={{
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <FiPlus color="white" size={24} />
              </div>
              <div>
                <h1 style={{
                  fontSize: "28px",
                  fontWeight: "800",
                  margin: "0",
                  color: "#1e293b"
                }}>
                  Create New Course
                </h1>
                <p style={{
                  color: "#64748b",
                  margin: "4px 0 0 0"
                }}>
                  Fill in the details below to create your course
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Course Title */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#475569",
                fontSize: "14px"
              }}>
                <FiBookOpen size={16} />
                Course Title
              </label>
              <input
                name="title"
                placeholder="e.g., Advanced React Development"
                value={course.title}
                onChange={handleChange}
                required
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Description */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#475569",
                fontSize: "14px"
              }}>
                <FiFileText size={16} />
                Description
              </label>
              <textarea
                name="description"
                placeholder="Describe what students will learn in this course..."
                value={course.description}
                onChange={handleChange}
                required
                rows="6"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  fontSize: "16px",
                  transition: "all 0.2s",
                  resize: "vertical",
                  boxSizing: "border-box",
                  fontFamily: "'Inter', sans-serif"
                }}
                onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
              />
            </div>

            {/* Price */}
            <div style={{ marginBottom: "32px" }}>
              <label style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
                fontWeight: "600",
                color: "#475569",
                fontSize: "14px"
              }}>
                <FiDollarSign size={16} />
                Price
              </label>
              <div style={{ position: "relative" }}>
                <input
                  name="price"
                  type="number"
                  placeholder="0.00"
                  value={course.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    border: "1px solid #e2e8f0",
                    borderRadius: "10px",
                    fontSize: "16px",
                    transition: "all 0.2s",
                    boxSizing: "border-box"
                  }}
                  onFocus={(e) => e.target.style.borderColor = "#6366f1"}
                  onBlur={(e) => e.target.style.borderColor = "#e2e8f0"}
                />
                <div style={{
                  position: "absolute",
                  left: "16px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8"
                }}>
                  $
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "16px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                opacity: loading ? "0.7" : "1"
              }}
              onMouseOver={(e) => !loading && (e.target.style.transform = "translateY(-2px)")}
              onMouseOut={(e) => !loading && (e.target.style.transform = "translateY(0)")}
            >
              {loading ? (
                <>
                  <div style={{
                    width: "20px",
                    height: "20px",
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "white",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite"
                  }} />
                  Creating Course...
                </>
              ) : (
                <>
                  <FiPlus size={20} />
                  Create Course
                </>
              )}
            </button>
          </form>
        </div>

        {/* Quick Tips */}
        <div style={{
          marginTop: "32px",
          background: "white",
          borderRadius: "16px",
          padding: "24px",
          border: "1px solid #e5e7eb"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#1e293b",
            marginBottom: "16px"
          }}>
            💡 Course Creation Tips
          </h3>
          <ul style={{
            listStyle: "none",
            padding: "0",
            margin: "0",
            color: "#64748b",
            lineHeight: "1.6"
          }}>
            <li style={{ padding: "8px 0", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <div style={{
                width: "6px",
                height: "6px",
                backgroundColor: "#6366f1",
                borderRadius: "50%",
                marginTop: "8px"
              }} />
              <span>Use clear and descriptive titles that reflect course content</span>
            </li>
            <li style={{ padding: "8px 0", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <div style={{
                width: "6px",
                height: "6px",
                backgroundColor: "#6366f1",
                borderRadius: "50%",
                marginTop: "8px"
              }} />
              <span>Provide detailed descriptions of what students will learn</span>
            </li>
            <li style={{ padding: "8px 0", display: "flex", alignItems: "flex-start", gap: "8px" }}>
              <div style={{
                width: "6px",
                height: "6px",
                backgroundColor: "#6366f1",
                borderRadius: "50%",
                marginTop: "8px"
              }} />
              <span>Price competitively based on course length and complexity</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          input:focus, textarea:focus {
            outline: none;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
          }
          
          ::placeholder {
            color: #94a3b8;
          }
        `}
      </style>
    </div>
  );
};

export default CreateCourse;