const express = require("express");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const {
  getOrCreateChat,
  fetchMessages,
  sendMessage,
  getStudentChats,
  getMentorChats,
  getMentorChat,
  getAllStudentChats,
  getStudentChat,
  markChatRead,
  uploadAttachment,
} = require("../controllers/chatController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Get or create chat between student and mentor for a course
router.post("/get-or-create", protect, getOrCreateChat);

// Fetch messages in a chat
router.get("/:chatId/messages", protect, fetchMessages);

// Mark chat messages as read
router.put("/:chatId/read", protect, markChatRead);

// Send a message
// Send a message
router.post("/send-message", protect, sendMessage);

// Upload attachment
router.post("/upload", protect, upload.single("file"), uploadAttachment);

// Get all chats for a student in a course
router.get("/course/:courseId", protect, getStudentChats);

// Student routes
router.get("/student/all-chats", protect, getAllStudentChats);
router.get("/student/:chatId", protect, getStudentChat);

// Mentor routes
router.get("/mentor/all-chats", protect, getMentorChats);
router.get("/mentor/:chatId", protect, getMentorChat);

module.exports = router;
