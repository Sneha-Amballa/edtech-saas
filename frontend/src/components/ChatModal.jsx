import { useEffect, useRef, useState } from "react";
import axios from "axios";
import "../styles/chatModal.css";

const ChatModal = ({ courseId, onClose, mentorName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load or create chat on mount
  useEffect(() => {
    const loadChat = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Please log in to access chat");
          setLoading(false);
          return;
        }

        const res = await axios.post(
          `${API_BASE_URL}/api/chat/get-or-create`,
          { courseId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const cId = res.data.chat._id;
        setChatId(cId);

        // Fetch messages
        const msgRes = await axios.get(
          `${API_BASE_URL}/api/chat/${cId}/messages`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setMessages(msgRes.data.messages || []);
        setError("");
      } catch (err) {
        const errMsg = err.response?.data?.message || err.message || "Failed to load chat";
        setError(errMsg);
        console.error("Chat load error:", err);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [courseId, API_BASE_URL]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !chatId) return;

    try {
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
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to send message";
      setError(errMsg);
      console.error("Send message error:", err);
    }
  };

  if (loading) {
    return (
      <div className="chat-modal-overlay">
        <div className="chat-modal">
          <div className="chat-header">
            <h3>Ask Mentor Doubt</h3>
            <button onClick={onClose} className="chat-close">
              ✕
            </button>
          </div>
          <div className="chat-loading">Loading chat...</div>
        </div>
      </div>
    );
  }

  if (error && !chatId) {
    return (
      <div className="chat-modal-overlay">
        <div className="chat-modal">
          <div className="chat-header">
            <h3>Ask Mentor Doubt</h3>
            <button onClick={onClose} className="chat-close">
              ✕
            </button>
          </div>
          <div className="chat-error">{error}</div>
          <button onClick={onClose} className="chat-close-btn">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-modal-overlay">
      <div className="chat-modal">
        <div className="chat-header">
          <h3>💬 Ask {mentorName || "Mentor"}</h3>
          <button onClick={onClose} className="chat-close">
            ✕
          </button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">
              Start a conversation with your mentor about the course.
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`chat-message ${
                  msg.sender?._id ? "other" : "own"
                }`}
              >
                <div className="message-sender">
                  {msg.sender?.name || "You"}
                </div>
                <div className="message-content">{msg.content}</div>
                <div className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <div className="chat-error-small">{error}</div>}

        <form onSubmit={handleSendMessage} className="chat-form">
          <input
            type="text"
            placeholder="Type your doubt..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="chat-input"
            disabled={!chatId}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={!newMessage.trim() || !chatId}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
