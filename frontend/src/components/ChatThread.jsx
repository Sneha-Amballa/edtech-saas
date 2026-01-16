import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { FaArrowLeft, FaUserCircle, FaCheck, FaCheckDouble } from "react-icons/fa";
import io from "socket.io-client";
import "../styles/chatThread.css";

const ChatThread = ({ chatId, onClose, onMessageSent, isStudent = false }) => {
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
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

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setCurrentUser(user);
  }, []);

  useEffect(() => {
    // Connect to socket
    socketRef.current = io(API_BASE_URL);

    // Register user for online status
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user._id) {
      socketRef.current.emit("register_user", user._id);
    }

    // Join chat room
    socketRef.current.emit("join_chat", chatId);

    // Listen for new messages
    socketRef.current.on("receive_message", (message) => {
      // Get latest user state
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const senderId = message.sender._id || message.sender;
      // If I sent the message, ignore it (already added by optimistic UI or API response)
      if (senderId.toString() === user._id?.toString()) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === message._id)) return prev;
        return [...prev, message];
      });

      // Mark as read immediately if chat is open
      markAsRead();
    });

    // Listen for status
    socketRef.current.on("user_status", ({ userId, status }) => {
      if (chat && (
        (isStudent && chat.mentor._id === userId) ||
        (!isStudent && chat.student._id === userId)
      )) {
        setPartnerStatus(status);
      }
    });

    // Listen for typing
    socketRef.current.on("typing", (userId) => {
      if (chat && (
        (isStudent && chat.mentor._id === userId) ||
        (!isStudent && chat.student._id === userId)
      )) {
        setPartnerTyping(true);
      }
    });

    // Listen for stop typing
    socketRef.current.on("stop_typing", (userId) => {
      if (chat && (
        (isStudent && chat.mentor._id === userId) ||
        (!isStudent && chat.student._id === userId)
      )) {
        setPartnerTyping(false);
      }
    });

    // Listen for read receipts
    socketRef.current.on("messages_read", ({ chatId: eventChatId, readBy }) => {
      if (eventChatId === chatId) {
        setMessages(prev => prev.map(msg => {
          // If message was sent by ME and now read by OTHER
          if ((msg.sender === user._id || msg.sender?._id === user._id) && msg.status !== 'read') {
            return { ...msg, status: 'read' };
          }
          return msg;
        }));
      }
    });

    // Listen for delivered receipts
    socketRef.current.on("messages_delivered", ({ chatId: eventChatId }) => {
      if (eventChatId === chatId) {
        setMessages(prev => prev.map(msg => {
          if ((msg.sender === user._id || msg.sender?._id === user._id) && msg.status === 'sent') {
            return { ...msg, status: 'delivered' };
          }
          return msg;
        }));
      }
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [chatId, API_BASE_URL, chat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!loading) {
      scrollToBottom();
    }
  }, [messages, loading, partnerTyping]);

  useEffect(() => {
    loadChat();
  }, [chatId]);

  const markAsRead = async () => {
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

      // Determine partner online status (mock for now if not live, or fetch from server if possible)
      // Since we rely on socket events, it will update when they do something or we can fetch explicitly.
      // For now, default is offline until event received.

      setError("");

      // Mark as read on load
      setTimeout(() => markAsRead(), 1000);

    } catch (err) {
      setError(err.response?.data?.message || "Failed to load chat");
      console.error("Load chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Typing emission
    if (!isTyping) {
      setIsTyping(true);
      socketRef.current.emit("typing", { chatId, userId: currentUser._id });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketRef.current.emit("stop_typing", { chatId, userId: currentUser._id });
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

    if (!newMessage.trim() && !attachment) return;

    // clear typing immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    socketRef.current.emit("stop_typing", { chatId, userId: currentUser._id });

    try {
      setSending(true);
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
      onMessageSent?.();
    } catch (err) {
      const errMsg = err.response?.data?.message || "Failed to send message";
      setError(errMsg);
      console.error("Send message error:", err);
    } finally {
      setSending(false);
      setIsUploading(false);
    }
  };

  const getPartnerName = () => isStudent ? chat?.mentor?.name : chat?.student?.name;

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
            <FaArrowLeft />
          </button>
          <div className="student-header-info">
            <div className={`student-avatar-large ${partnerStatus === 'online' ? 'online' : ''}`}>
              {getPartnerName().charAt(0)}
              {partnerStatus === 'online' && <div className="status-dot-large"></div>}
            </div>
            <div>
              <h2>{getPartnerName()}</h2>
              <span className="user-status-text">
                {partnerTyping ? (
                  <span className="typing-text">Typing...</span>
                ) : (
                  partnerStatus === 'online' ? 'Online' : `Course: ${chat.course.title}`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="thread-messages">
        {messages.length === 0 ? (
          <div className="empty-thread">
            <div className="empty-thread-icon">👋</div>
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, idx) => {
            const senderId = msg.sender?._id || msg.sender;
            const isMe = senderId === currentUser?._id;

            return (
              <div
                key={msg._id || idx}
                className={`thread-message ${isMe ? "is-me" : "is-other"}`}
              >
                {!isMe && (
                  <div className="message-avatar-small">
                    {(msg.sender?.name || getPartnerName()).charAt(0)}
                  </div>
                )}
                <div className="message-content-wrapper">
                  <div className="message-bubble">
                    {msg.type === "image" && (
                      <div className="thread-image-container">
                        <img
                          src={msg.fileUrl}
                          alt="Shared image"
                          className="thread-image"
                          onClick={() => window.open(msg.fileUrl, "_blank")}
                        />
                      </div>
                    )}
                    {msg.type === "file" && (
                      <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="thread-file">
                        📄 {msg.fileMetadata?.originalName || "Download File"}
                      </a>
                    )}
                    {msg.content && <div className="message-text">{msg.content}</div>}
                  </div>
                  <div className="message-meta">
                    <span className="message-time">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {isMe && (
                      <span className={`message-status ${msg.status}`}>
                        {msg.status === 'read' ? (
                          <FaCheckDouble className="read-icon blue" />
                        ) : msg.status === 'delivered' ? (
                          <FaCheckDouble className="read-icon" />
                        ) : (
                          <FaCheck className="read-icon" />
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ERROR */}
      {error && <div className="thread-error-msg">{error}</div>}

      {/* INPUT */}
      <form onSubmit={handleSendMessage} className="thread-form">
        {attachment && (
          <div className="thread-attachment-preview">
            <span className="attachment-name">📎 {attachment.name}</span>
            <button type="button" onClick={removeAttachment} className="thread-attachment-remove">✕</button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          style={{ display: "none" }}
        />

        <button
          type="button"
          className="thread-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={sending || isUploading}
        >
          📎
        </button>

        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={handleInputChange}
          className="thread-input"
          disabled={sending || isUploading}
        />
        <button
          type="submit"
          className="thread-send-btn"
          disabled={(!newMessage.trim() && !attachment) || sending || isUploading}
        >
          {sending || isUploading ? "..." : "Send"}
        </button>
      </form>
    </div>
  );
};

export default ChatThread;
