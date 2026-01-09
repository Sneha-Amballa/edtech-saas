import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaUserCircle } from "react-icons/fa";
import "../styles/chatThread.css";

const ChatThread = ({ chatId, onClose, onMessageSent, isStudent = false }) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    loadChat();
  }, [chatId]);

  const loadChat = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session expired");
        return;
      }

      const endpoint = isStudent ? `/api/chat/student/${chatId}` : `/api/chat/mentor/${chatId}`;
      const res = await axios.get(
        `${API_BASE_URL}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const chatData = res.data.chat;
      setChat(chatData);
      setMessages(chatData.messages || []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat");
      console.error("Load chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/chat/send-message`,
        { chatId, content: newMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => [...prev, res.data.message]);
      setNewMessage("");
      setError("");
      onMessageSent?.();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send message";
      setError(errMsg);
      console.error("Send message error:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="chat-thread-container">
        <div className="thread-header">
          <button onClick={onClose} className="back-btn">
            <FaArrowLeft /> Back to Messages
          </button>
          <h2>Loading...</h2>
        </div>
        <div className="thread-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="chat-thread-container">
        <div className="thread-header">
          <button onClick={onClose} className="back-btn">
            <FaArrowLeft /> Back to Messages
          </button>
        </div>
        <div className="thread-error">
          <p>Chat not found</p>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-thread-container">
      {/* HEADER */}
      <div className="thread-header">
        <div className="header-left">
          <button onClick={onClose} className="back-btn">
            <FaArrowLeft /> Back
          </button>
          <div className="student-header-info">
            <div className="student-avatar-large">
              {isStudent ? chat.mentor.name.charAt(0) : chat.student.name.charAt(0)}
            </div>
            <div>
              <h2>{isStudent ? chat.mentor.name : chat.student.name}</h2>
              <span className="course-name">📚 {chat.course.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="thread-messages">
        {messages.length === 0 ? (
          <div className="empty-thread">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg._id || idx}
              className={`thread-message ${
                msg.sender?.role === "mentor" ? "mentor" : "student"
              }`}
            >
              <div className="message-bubble">
                <div className="message-sender">
                  {msg.sender?.name || "User"}
                </div>
                <div className="message-text">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ERROR */}
      {error && <div className="thread-error-msg">{error}</div>}

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="thread-form">
        <input
          type="text"
          placeholder="Type your reply..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="thread-input"
          disabled={sending}
        />
        <button
          type="submit"
          className="thread-send-btn"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? "Sending..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatThread;
