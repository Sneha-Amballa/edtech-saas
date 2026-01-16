import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft, FaUserCircle, FaSignOutAlt, FaComments, FaSearch } from "react-icons/fa";
import io from "socket.io-client";
import ChatThread from "../components/ChatThread";
import "../styles/mentorMessages.css";

const MentorMessages = () => {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [filteredChats, setFilteredChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef();

  const API_BASE_URL = "https://edtech-saas.onrender.com";

  useEffect(() => {
    // Socket connection for real-time list updates
    socketRef.current = io(API_BASE_URL);
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user._id) {
      socketRef.current.emit("register_user", user._id);
    }

    socketRef.current.on("receive_message", () => {
      // Reload chats to update order, badges, and previews
      loadChats();
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUser(userData);
    loadChats();
  }, []);

  useEffect(() => {
    if (chats.length > 0) {
      // Flatten chats if they are grouped, or just use them if not
      // The API returns groups by course
      let allChats = [];
      chats.forEach(group => {
        if (group.chats) {
          group.chats.forEach(chat => {
            allChats.push({
              ...chat,
              courseTitle: group.courseTitle
            });
          });
        }
      });

      let filtered = allChats;

      if (searchTerm) {
        filtered = filtered.filter(chat =>
          chat.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Sort by last message
      filtered.sort((a, b) => {
        const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt);
        const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt);
        return dateB - dateA;
      });

      setFilteredChats(filtered);
    } else {
      setFilteredChats([]);
    }
  }, [chats, searchTerm]);

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

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="mentor-messages-container">
      {/* HEADER */}
      <header className="messages-header">
        <div className="header-left">
          <button onClick={() => navigate("/mentor")} className="back-btn">
            <FaArrowLeft />
          </button>
          <div className="page-title">
            <span>Messages</span>
          </div>
        </div>

        <div className="profile-section">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0) || "M"}
            </div>
            <span className="user-name">{user?.name || "Mentor"}</span>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
          </button>
        </div>
      </header>

      {/* CHAT LAYOUT */}
      <div className={`chat-layout ${selectedChatId ? 'chat-open' : ''}`}>

        {/* SIDEBAR */}
        <div className="chat-sidebar">
          <div className="sidebar-header">
            <div className="search-container">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="sidebar-list">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="empty-state">
                <p>No conversations found</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat._id}
                  className={`sidebar-chat-item ${selectedChatId === chat._id ? 'active' : ''}`}
                  onClick={() => setSelectedChatId(chat._id)}
                >
                  <div className="chat-item-avatar">
                    <div className="avatar-circle">
                      {chat.student.name.charAt(0)}
                    </div>
                  </div>
                  <div className="chat-item-content">
                    <div className="chat-item-top">
                      <div className="chat-item-name">{chat.student.name}</div>
                      <div className="chat-item-time">
                        {chat.lastMessage ? formatTime(chat.lastMessage.createdAt) : ""}
                      </div>
                    </div>
                    <div className="chat-item-bottom">
                      <div className="chat-item-preview">
                        <span style={{ fontSize: '11px', color: '#6366f1', marginRight: '6px' }}>{chat.courseTitle}</span>
                        {chat.lastMessage ? chat.lastMessage.content : "Start a conversation"}
                      </div>
                      {chat.messageCount > 0 && chat.unreadCount > 0 && (
                        <div className="chat-item-badge">{chat.unreadCount}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="chat-main">
          {selectedChatId ? (
            <ChatThread
              chatId={selectedChatId}
              onClose={handleChatClose}
              onMessageSent={handleMessageSent}
              isStudent={false}
            />
          ) : (
            <div className="chat-empty-state">
              <FaComments className="chat-empty-icon" />
              <div className="chat-empty-text">Select a student to chat</div>
              <div className="chat-empty-subtext">Choose a conversation from the left to start messaging</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorMessages;
