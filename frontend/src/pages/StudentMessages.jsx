import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaUserCircle, FaSignOutAlt, FaComments } from "react-icons/fa";
import ChatThread from "../components/ChatThread";
import "../styles/studentMessages.css";

const StudentMessages = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
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
        <div className="header-left">
          <button onClick={() => navigate("/student")} className="back-btn">
            <FaArrowLeft /> Back
          </button>
          <div>
            <h1 className="page-title">
              <FaComments /> Messages
            </h1>
            <p className="page-subtitle">
              View conversations with your course mentors
            </p>
          </div>
        </div>

        <div className="profile-section">
          <div className="user-info">
            <FaUserCircle className="user-avatar" />
            <div>
              <span className="user-name">{user?.name || "Student"}</span>
              <span className="user-role">Student</span>
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
            <p>When you ask questions to your course mentors, conversations will appear here.</p>
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
                        <div className="mentor-info">
                          <div className="mentor-avatar">
                            {chat.mentor.name.charAt(0)}
                          </div>
                          <div className="mentor-details">
                            <h3>{chat.mentor.name}</h3>
                            <span className="mentor-email">
                              {chat.mentor.email}
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
                            {chat.lastMessage.sender?.role === "mentor" ? chat.mentor.name : "You"}:
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

export default StudentMessages;
