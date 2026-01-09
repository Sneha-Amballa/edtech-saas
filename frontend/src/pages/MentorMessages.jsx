import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaUserCircle, FaSignOutAlt, FaComments } from "react-icons/fa";
import ChatThread from "../components/ChatThread";
import "../styles/mentorMessages.css";

const MentorMessages = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [error, setError] = useState("");

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
  }, []);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login");
        return;
      }

      const res = await axios.get(
        `${API_BASE_URL}/api/chat/mentor/all-chats`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setChats(res.data.chats || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chats");
      console.error("Load chats error:", err);
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

  if (selectedChatId) {
    return (
      <ChatThread
        chatId={selectedChatId}
        onClose={handleChatClose}
        onMessageSent={handleMessageSent}
      />
    );
  }

  return (
    <div className="mentor-messages-container">
      {/* HEADER */}
      <header className="messages-header">
        <div className="header-left">
          <button onClick={() => navigate("/mentor")} className="back-btn">
            <FaArrowLeft /> Back
          </button>
          <div>
            <h1 className="page-title">
              <FaComments /> Messages
            </h1>
            <p className="page-subtitle">
              Manage 1-to-1 chats with enrolled students
            </p>
          </div>
        </div>

        <div className="profile-section">
          <div className="user-info">
            <FaUserCircle className="user-avatar" />
            <div>
              <span className="user-name">{user?.name || "Mentor"}</span>
              <span className="user-role">Mentor</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="messages-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={loadChats} className="retry-btn">
              Retry
            </button>
          </div>
        ) : chats.length === 0 ? (
          <div className="empty-state">
            <FaComments className="empty-icon" />
            <h2>No Messages Yet</h2>
            <p>When students ask you doubts about your courses, they'll appear here.</p>
          </div>
        ) : (
          <div className="chats-container">
            {chats.map((courseGroup) => (
              <div key={courseGroup.courseId} className="course-group">
                <h2 className="course-title">{courseGroup.courseTitle}</h2>

                <div className="chats-list">
                  {courseGroup.chats.map((chat) => (
                    <div
                      key={chat._id}
                      className="chat-item"
                      onClick={() => setSelectedChatId(chat._id)}
                    >
                      <div className="chat-header-row">
                        <div className="student-info">
                          <div className="student-avatar">
                            {chat.student.name.charAt(0)}
                          </div>
                          <div className="student-details">
                            <h3>{chat.student.name}</h3>
                            <span className="student-email">
                              {chat.student.email}
                            </span>
                          </div>
                        </div>

                        <div className="chat-meta">
                          <span className="message-count">
                            {chat.messageCount} {chat.messageCount === 1 ? "msg" : "msgs"}
                          </span>
                          {chat.lastMessage && (
                            <span className="last-message-time">
                              {new Date(chat.lastMessage.createdAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>

                      {chat.lastMessage && (
                        <div className="last-message">
                          <span className="last-sender">
                            {chat.lastMessage.sender?.role === "mentor" ? "You" : chat.student.name}:
                          </span>
                          <span className="last-content">
                            {chat.lastMessage.content.substring(0, 60)}
                            {chat.lastMessage.content.length > 60 ? "..." : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorMessages;
