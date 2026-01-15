import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllMentors } from "../services/mentorService";
import ThemeToggle from "../components/ThemeToggle";
import "../styles/mentors.css";
import { 
  FaUsers, 
  FaStar, 
  FaArrowLeft,
  FaUserTie,
  FaMessageSquare,
  FaGraduationCap
} from "react-icons/fa";

const Mentors = () => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    loadMentors();
  }, []);

  const loadMentors = async () => {
    try {
      setLoading(true);
      const res = await getAllMentors();
      
      // Map backend data to include additional properties for display
      const mentorsWithDefaults = (res.data || []).map((mentor, index) => ({
        ...mentor,
        expertise: ["Tech", "Design", "Business"][index % 3],
        description: `Experienced ${mentor.role || "mentor"} dedicated to helping others succeed`,
        avatar: ["👩‍💼", "👨‍💼"][index % 2],
        students: ["5,200", "3,800", "7,100", "9,400", "4,200", "6,100", "3,500", "5,800"][index % 8],
        company: ["Google", "Meta", "Amazon", "Microsoft", "Apple", "Netflix", "Adobe", "LinkedIn"][index % 8],
        role: mentor.role || "Mentor"
      }));
      
      setMentors(mentorsWithDefaults);
    } catch (error) {
      console.error("Failed to load mentors:", error);
    } finally {
      setLoading(false);
    }
  };

  // Get unique categories
  const categories = ["all", ...new Set(mentors.map(m => m.expertise))];

  // Filter mentors based on search and category
  const filteredMentors = mentors.filter((mentor) => {
    const matchesSearch = 
      mentor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mentor.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === "all" || mentor.expertise === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleContact = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      navigate("/messages");
    }
  };

  if (loading) {
    return (
      <div className="mentors-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading mentors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mentors-container">
      {/* Header Section */}
      <div className="mentors-header">
        <div className="header-content">
          <h1>Meet Our Expert Mentors</h1>
          <p>Connect with industry leaders and get personalized guidance to accelerate your career growth</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="mentors-main">
        {/* Controls Section */}
        <div className="mentors-controls">
          <div className="filter-group">
            <input
              type="text"
              className="search-box"
              placeholder="Search mentors by name, role, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div className="results-info">
            {filteredMentors.length} {filteredMentors.length === 1 ? "mentor" : "mentors"} found
          </div>
        </div>

        {/* Mentors Grid */}
        {filteredMentors.length > 0 ? (
          <div className="mentors-grid">
            {filteredMentors.map((mentor) => (
              <div key={mentor._id} className="mentor-card">
                <div className="mentor-avatar-container">
                  <div className="mentor-avatar">{mentor.avatar || "👤"}</div>
                </div>
                
                <div className="mentor-content">
                  <div className="mentor-expertise">
                    {mentor.expertise || "General"}
                  </div>
                  
                  <h3 className="mentor-name">{mentor.name}</h3>
                  <p className="mentor-role">{mentor.role}</p>
                  <p className="mentor-company">
                    <strong>{mentor.company}</strong>
                  </p>

                  <p className="mentor-description">
                    {mentor.description || "Passionate mentor dedicated to helping others succeed"}
                  </p>
                  
                  <div className="mentor-stats">
                    <div className="stat-item">
                      <span className="stat-label">Students</span>
                      <div className="stat-value">{mentor.students}</div>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Rating</span>
                      <div className="stat-value" style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                        4.9 <FaStar style={{ color: "#fbbf24", fontSize: "0.875rem" }} />
                      </div>
                    </div>
                  </div>

                  <div className="mentor-footer">
                    <button
                      className="btn-contact"
                      onClick={handleContact}
                    >
                      <FaMessageSquare style={{ marginRight: "0.5rem" }} />
                      Connect
                    </button>
                    <button
                      className="btn-profile"
                      onClick={() => navigate(`/mentor/${mentor._id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h2>No Mentors Found</h2>
            <p>
              {searchTerm
                ? "Try adjusting your search terms or browse all mentors"
                : "No mentors available at the moment"}
            </p>
            <button
              className="btn-back"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("all");
              }}
            >
              <FaArrowLeft />
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mentors;
