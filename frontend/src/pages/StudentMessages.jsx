import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  FaArrowLeft, 
  FaUserCircle, 
  FaSignOutAlt, 
  FaComments, 
  FaChevronRight,
  FaEnvelope,
  FaCalendarAlt,
  FaUserGraduate,
  FaBook,
  FaSearch,
  FaFilter,
  FaRegCommentDots,
  FaRegClock,
  FaCrown,
  FaRegStar,
  FaStar
} from "react-icons/fa";
import { FiMessageSquare, FiUser, FiBook } from "react-icons/fi";
import ChatThread from "../components/ChatThread";
import "../styles/studentMessages.css";

const StudentMessages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredChats, setFilteredChats] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all"); // "all", "unread", "mentor"
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadChats();
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      let filtered = [...chats];
      
      // Filter by search term
      if (searchTerm) {
        filtered = filtered.map(courseGroup => ({
          ...courseGroup,
          chats: courseGroup.chats.filter(chat => 
            chat.mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chat.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
          )
        })).filter(courseGroup => courseGroup.chats.length > 0);
      }
      
      // Filter by active filter
      if (activeFilter === "unread") {
        filtered = filtered.map(courseGroup => ({
          ...courseGroup,
          chats: courseGroup.chats.filter(chat => chat.unreadCount > 0)
        })).filter(courseGroup => courseGroup.chats.length > 0);
      } else if (activeFilter === "mentor") {
        // Sort by mentor name
        filtered = filtered.map(courseGroup => ({
          ...courseGroup,
          chats: [...courseGroup.chats].sort((a, b) => 
            a.mentor.name.localeCompare(b.mentor.name)
          )
        }));
      }
      
      setFilteredChats(filtered);
    } else {
      setFilteredChats([]);
    }
  }, [chats, searchTerm, activeFilter]);

  const loadChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${API_BASE_URL}/api/chat/student/all-chats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChats(res.data.chats || []);
      setError("");
    } catch (err) {
      console.error("Load chats error:", err);
      setError(err.response?.data?.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleChatClose = () => {
    setSelectedChatId(null);
  };

  const handleMessageSent = () => {
    loadChats();
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 7) {
      return date.toLocaleDateString();
    } else if (diffDays > 0) {
      return `${diffDays}d ago`;
    } else if (diffHours > 0) {
      return `${diffHours}h ago`;
    } else if (diffMins > 0) {
      return `${diffMins}m ago`;
    } else {
      return "Just now";
    }
  };

  const getUnreadCount = () => {
    return chats.reduce((total, courseGroup) => {
      return total + courseGroup.chats.reduce((sum, chat) => sum + (chat.unreadCount || 0), 0);
    }, 0);
  };

  if (selectedChatId) {
    return (
      <ChatThread
        chatId={selectedChatId}
        onClose={handleChatClose}
        onMessageSent={handleMessageSent}
        isStudent={true}
      />
    );
  }

  return (
    <div className="student-messages-container">
      {/* HEADER */}
      <header className="messages-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate("/student")} className="back-btn">
              <FaArrowLeft /> Back to Dashboard
            </button>
            <div className="breadcrumb">
              <span className="crumb">Dashboard</span>
              <FaChevronRight className="crumb-separator" />
              <span className="crumb active">Messages</span>
            </div>
          </div>

          <div className="header-right">
            <div className="user-profile">
              <div className="user-avatar">
                <FaUserCircle />
              </div>
              <div className="user-info">
                <span className="user-name">{user?.name || "Student"}</span>
                <span className="user-role">Student</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="messages-main">
        {/* HERO SECTION */}
        <div className="messages-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <FaComments />
            </div>
            <div>
              <h1 className="hero-title">Your Messages</h1>
              <p className="hero-subtitle">
                Connect with your course mentors and get help when you need it
              </p>
            </div>
          </div>
          
          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-icon total">
                <FiMessageSquare />
              </div>
              <div className="stat-info">
                <span className="stat-value">{chats.reduce((acc, group) => acc + group.chats.length, 0)}</span>
                <span className="stat-label">Conversations</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon unread">
                <FaEnvelope />
              </div>
              <div className="stat-info">
                <span className="stat-value">{getUnreadCount()}</span>
                <span className="stat-label">Unread Messages</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon mentors">
                <FaUserGraduate />
              </div>
              <div className="stat-info">
                <span className="stat-value">
                  {[...new Set(chats.flatMap(group => group.chats.map(chat => chat.mentor._id)))].length}
                </span>
                <span className="stat-label">Mentors</span>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT GRID */}
        <div className="messages-grid">
          {/* LEFT COLUMN - CHATS LIST */}
          <div className="chats-column">
            {/* SEARCH AND FILTERS */}
            <div className="controls-card">
              <div className="search-bar">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Search mentors or courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              
              <div className="filters">
                <button 
                  className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
                  onClick={() => setActiveFilter("all")}
                >
                  All Chats
                </button>
                <button 
                  className={`filter-btn ${activeFilter === "unread" ? "active" : ""}`}
                  onClick={() => setActiveFilter("unread")}
                >
                  Unread
                </button>
                <button 
                  className={`filter-btn ${activeFilter === "mentor" ? "active" : ""}`}
                  onClick={() => setActiveFilter("mentor")}
                >
                  By Mentor
                </button>
              </div>
            </div>

            {/* CHATS LIST */}
            <div className="chats-list-container">
              {loading ? (
                <div className="loading-state">
                  <div className="spinner"></div>
                  <p>Loading your conversations...</p>
                </div>
              ) : error ? (
                <div className="error-state">
                  <div className="error-icon">⚠️</div>
                  <h3>Something went wrong</h3>
                  <p>{error}</p>
                  <button onClick={loadChats} className="retry-btn">
                    Try Again
                  </button>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <FaRegCommentDots />
                  </div>
                  <h3>No Conversations Yet</h3>
                  <p>
                    {searchTerm || activeFilter !== "all" 
                      ? "No conversations match your search or filter. Try different criteria."
                      : "Start a conversation with your course mentors by asking questions in the course page."}
                  </p>
                  {!searchTerm && activeFilter === "all" && (
                    <button 
                      className="browse-courses-btn"
                      onClick={() => navigate("/student")}
                    >
                      Browse Courses
                    </button>
                  )}
                </div>
              ) : (
                <div className="chats-list">
                  {filteredChats.map((courseGroup) => (
                    <div key={courseGroup.courseId} className="course-group">
                      <div className="course-group-header">
                        <div className="course-icon">
                          <FiBook />
                        </div>
                        <div className="course-group-info">
                          <h3 className="course-title">{courseGroup.courseTitle}</h3>
                          <span className="course-chats-count">
                            {courseGroup.chats.length} {courseGroup.chats.length === 1 ? "conversation" : "conversations"}
                          </span>
                        </div>
                      </div>

                      <div className="chats-grid">
                        {courseGroup.chats.map((chat) => {
                          const hasUnread = chat.unreadCount > 0;
                          const isActiveMentor = chat.mentor.isActive;
                          
                          return (
                            <div
                              key={chat._id}
                              className={`chat-card ${hasUnread ? "unread" : ""}`}
                              onClick={() => setSelectedChatId(chat._id)}
                            >
                              <div className="chat-card-header">
                                <div className="mentor-avatar">
                                  {chat.mentor.name.charAt(0)}
                                  {isActiveMentor && <span className="active-dot"></span>}
                                  {chat.mentor.isPremium && <FaCrown className="premium-badge" />}
                                </div>
                                
                                <div className="chat-info">
                                  <div className="mentor-name-row">
                                    <h4>{chat.mentor.name}</h4>
                                    {chat.mentor.isPremium && (
                                      <span className="premium-tag">
                                        <FaStar /> Premium Mentor
                                      </span>
                                    )}
                                  </div>
                                  <p className="mentor-role">{chat.mentor.role || "Course Mentor"}</p>
                                </div>

                                <div className="chat-meta">
                                  {chat.lastMessage && (
                                    <span className="last-message-time">
                                      {formatTime(chat.lastMessage.createdAt)}
                                    </span>
                                  )}
                                  {hasUnread && (
                                    <span className="unread-badge">{chat.unreadCount}</span>
                                  )}
                                </div>
                              </div>

                              {chat.lastMessage && (
                                <div className="last-message-preview">
                                  <span className="sender-indicator">
                                    {chat.lastMessage.sender?.role === "mentor" ? (
                                      <>
                                        <FiUser className="mentor-icon" />
                                        {chat.mentor.name.split(" ")[0]}:
                                      </>
                                    ) : (
                                      "You:"
                                    )}
                                  </span>
                                  <p className="message-content">
                                    {chat.lastMessage.content.substring(0, 80)}
                                    {chat.lastMessage.content.length > 80 ? "..." : ""}
                                  </p>
                                </div>
                              )}

                              <div className="chat-footer">
                                <div className="message-count">
                                  <FiMessageSquare />
                                  <span>{chat.messageCount} messages</span>
                                </div>
                                <div className="last-active">
                                  <FaRegClock />
                                  <span>
                                    {chat.lastMessage 
                                      ? `Last message ${formatTime(chat.lastMessage.createdAt)}`
                                      : "No messages yet"}
                                  </span>
                                </div>
                              </div>

                              <div className="chat-hover-action">
                                <FaChevronRight />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - TIPS */}
          <div className="tips-column">
            <div className="tips-card">
              <div className="tips-header">
                <FaComments className="tips-icon" />
                <h3>Messaging Tips</h3>
              </div>
              
              <div className="tips-list">
                <div className="tip-item">
                  <div className="tip-number">1</div>
                  <div className="tip-content">
                    <h4>Be Specific</h4>
                    <p>Include course name and lesson number when asking questions</p>
                  </div>
                </div>
                
                <div className="tip-item">
                  <div className="tip-number">2</div>
                  <div className="tip-content">
                    <h4>Check Existing</h4>
                    <p>Review previous messages before asking similar questions</p>
                  </div>
                </div>
                
                <div className="tip-item">
                  <div className="tip-number">3</div>
                  <div className="tip-content">
                    <h4>Response Time</h4>
                    <p>Mentors typically respond within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="actions-card">
              <h3>Quick Actions</h3>
              <div className="actions-list">
                <button 
                  className="action-btn"
                  onClick={() => navigate("/student")}
                >
                  <FaBook />
                  <span>Browse Courses</span>
                  <FaChevronRight />
                </button>
                
                <button 
                  className="action-btn"
                  onClick={loadChats}
                >
                  <FaEnvelope />
                  <span>Refresh Messages</span>
                  <FaChevronRight />
                </button>
                
                <button 
                  className="action-btn"
                  onClick={() => {
                    // Scroll to search
                    document.querySelector('.search-input')?.focus();
                  }}
                >
                  <FaSearch />
                  <span>Search Messages</span>
                  <FaChevronRight />
                </button>
              </div>
            </div>

            {/* STATS */}
            <div className="stats-card">
              <h3>Your Activity</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{chats.reduce((acc, group) => acc + group.chats.reduce((sum, chat) => sum + chat.messageCount, 0), 0)}</div>
                  <div className="stat-label">Total Messages</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{chats.length}</div>
                  <div className="stat-label">Active Courses</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">
                    {[...new Set(chats.flatMap(group => group.chats.map(chat => chat.mentor._id)))].length}
                  </div>
                  <div className="stat-label">Mentors</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{getUnreadCount()}</div>
                  <div className="stat-label">Unread</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default StudentMessages;