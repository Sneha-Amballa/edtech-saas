import { useEffect, useRef, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import "../styles/chatModal.css";

const ChatModal = ({ courseId, onClose, mentorName }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [chatId, setChatId] = useState(null);
  const [error, setError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [partnerStatus, setPartnerStatus] = useState("offline");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const socketRef = useRef();
  const typingTimeoutRef = useRef();
  const fileInputRef = useRef(null);

  const [attachment, setAttachment] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const API_BASE_URL = "https://edtech-saas.onrender.com";

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const markAsRead = async () => {
    if (!chatId) return;
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      await axios.put(`${API_BASE_URL}/api/chat/${chatId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, partnerTyping]);

  // Mark read when messages update (if chat is open)
  useEffect(() => {
    if (messages.length > 0) {
      markAsRead();
    }
  }, [messages.length, chatId]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  // Socket Connection
  useEffect(() => {
    socketRef.current = io(API_BASE_URL);

    // Register user
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user._id) {
      socketRef.current.emit("register_user", user._id);
    }

    return () => {
      socketRef.current.disconnect();
    };
  }, [API_BASE_URL]);

  // Join chat when chatId is available
  useEffect(() => {
    if (!chatId) return;

    socketRef.current.emit("join_chat", chatId);

    socketRef.current.on("receive_message", (message) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const senderId = message.sender._id || message.sender;

      if (senderId.toString() === user._id?.toString()) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });
    });

    socketRef.current.on("typing", (userId) => {
      // Simple check: if not me, someone is typing in this room
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (userId !== user._id) {
        setPartnerTyping(true);
      }
    });

    socketRef.current.on("stop_typing", (userId) => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (userId !== user._id) {
        setPartnerTyping(false);
      }
    });

    socketRef.current.on("user_status", ({ userId, status }) => {
      // ideally we check if this userId matches the mentor for this chat
      // but for now we can just show active if we receive an event? 
      // No, that would show online for ANY user. 
      // We'll skip complex matching for the modal lite version or match if we have mentorId
      setPartnerStatus(status);
    });

    return () => {
      socketRef.current.off("receive_message");
      socketRef.current.off("typing");
      socketRef.current.off("stop_typing");
      socketRef.current.off("user_status");
    };
  }, [chatId]);

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

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping && chatId) {
      setIsTyping(true);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      socketRef.current.emit("typing", { chatId, userId: user._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (chatId) socketRef.current.emit("stop_typing", { chatId, userId: user._id });
    }, 2000);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }
      setAttachment(file);
      setError("");
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if ((!newMessage.trim() && !attachment) || !chatId) return;

    // Clear typing
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    socketRef.current.emit("stop_typing", { chatId, userId: user._id });

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        return;
      }

      let payload = { chatId, content: newMessage || "Sent an attachment" };

      if (attachment) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", attachment);

        const uploadRes = await axios.post(
          `${API_BASE_URL}/api/chat/upload`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        payload.type = attachment.type.startsWith("image/") ? "image" : "file";
        payload.fileUrl = uploadRes.data.url;
        payload.fileMetadata = uploadRes.data.metadata;

        // If no text, use a generic message or keep empty if allowed? 
        // Backend requirement says content required.
        // We set default text above.
        if (newMessage.trim()) payload.content = newMessage;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/chat/send-message`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((prev) => {
        if (prev.some(m => m._id === res.data.message._id)) return prev;
        return [...prev, res.data.message];
      });
      setNewMessage("");
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setError("");
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Failed to send message";
      setError(errMsg);
      console.error("Send message error:", err);
    } finally {
      setIsUploading(false);
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
          <div className="chat-header-info">
            <h3>Ask {mentorName || "Mentor"}</h3>
            <span className="chat-status-text">
              {partnerTyping ? "Typing..." : "Online support"}
            </span>
          </div>
          <button onClick={onClose} className="chat-close">✕</button>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="chat-empty">Start a conversation with your mentor.</div>
          ) : (
            messages.map((msg, idx) => {
              const senderId = msg.sender?._id || msg.sender;
              const isOwn = senderId === currentUser?._id;

              return (
                <div
                  key={msg._id || idx}
                  className={`chat-message ${isOwn ? "own" : "other"}`}
                >
                  <div className="message-sender">
                    {isOwn ? "You" : (msg.sender?.name || "Mentor")}
                  </div>
                  <div className="message-content">
                    {msg.type === "image" && (
                      <div className="message-image-container">
                        <img
                          src={msg.fileUrl}
                          alt="Shared image"
                          className="message-image"
                          onClick={() => window.open(msg.fileUrl, "_blank")}
                        />
                      </div>
                    )}
                    {msg.type === "file" && (
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="message-file">
                        📄 {msg.fileMetadata?.originalName || "Download File"}
                      </a>
                    )}
                    {msg.content && <p>{msg.content}</p>}
                  </div>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && <div className="chat-error-small">{error}</div>}

        <form onSubmit={handleSendMessage} className="chat-form">
          {attachment && (
            <div className="attachment-preview">
              <span className="attachment-name">📎 {attachment.name}</span>
              <button type="button" onClick={removeAttachment} className="attachment-remove">✕</button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            style={{ display: "none" }}
            id="file-upload"
          />

          <button
            type="button"
            className="chat-attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            📎
          </button>

          <input
            type="text"
            placeholder="Type your doubt..."
            value={newMessage}
            onChange={handleInputChange}
            className="chat-input"
            disabled={!chatId || isUploading}
          />
          <button
            type="submit"
            className="chat-send-btn"
            disabled={(!newMessage.trim() && !attachment) || !chatId || isUploading}
          >
            {isUploading ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatModal;
