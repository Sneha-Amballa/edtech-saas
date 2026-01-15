const Chat = require("../models/Chat");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const cloudinary = require("../cloudinary");

// Get or create a chat between student and mentor for a specific course
exports.getOrCreateChat = async (req, res) => {
  try {
    const { courseId } = req.body;
    const studentId = req.user._id;

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({ message: "Not enrolled in this course" });
    }

    // Get course to find mentor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const mentorId = course.mentor;

    // Find or create chat
    let chat = await Chat.findOne({
      student: studentId,
      mentor: mentorId,
      course: courseId,
    }).populate("messages.sender", "name email");

    if (!chat) {
      chat = await Chat.create({
        student: studentId,
        mentor: mentorId,
        course: courseId,
        messages: [],
      });
    }

    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get or create chat" });
  }
};

// Fetch messages for a chat
exports.fetchMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const studentId = req.user._id;

    // Verify ownership
    const chat = await Chat.findById(chatId).populate("messages.sender", "name email");
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (chat.student.toString() !== studentId.toString() && chat.mentor.toString() !== studentId.toString()) {
      return res.status(403).json({ message: "Unauthorized access to chat" });
    }

    res.json({ messages: chat.messages });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

// Send a message in a chat
exports.sendMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const senderId = req.user._id;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Message cannot be empty" });
    }

    // Find chat and verify access
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    if (
      chat.student.toString() !== senderId.toString() &&
      chat.mentor.toString() !== senderId.toString()
    ) {
      return res.status(403).json({ message: "Unauthorized access to chat" });
    }

    const recipientId = chat.student.toString() === senderId.toString() ? chat.mentor.toString() : chat.student.toString();

    // Check if recipient is online to set 'delivered'
    const io = req.app.get("io");
    let initialStatus = "sent";

    if (io) {
      // Check if recipient has joined their personal room
      // Note: checking room size requires exact room name
      const room = io.sockets.adapter.rooms.get(recipientId);
      if (room && room.size > 0) {
        initialStatus = "delivered";
      }
    }

    // Add message
    const message = {
      sender: senderId,
      content: content.trim(),
      type: req.body.type || "text",
      fileUrl: req.body.fileUrl,
      fileMetadata: req.body.fileMetadata,
      status: initialStatus,
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // Populate sender info for response
    await chat.populate("messages.sender", "name email");
    const addedMessage = chat.messages[chat.messages.length - 1];

    if (io) {
      // Emit to chat room (active viewers)
      io.to(chatId).emit("receive_message", addedMessage);

      // Emit to recipient's personal room (for global notification/badge)
      io.to(recipientId).emit("incoming_message", {
        message: addedMessage,
        chatId: chatId
      });

      // If we auto-marked as delivered, notify sender immediately
      if (initialStatus === 'delivered') {
        io.to(senderId).emit("messages_delivered", {
          chatId: chat._id,
          userId: recipientId,
          status: 'delivered'
        });
        // Also emit to chat room so sender sees it if open
        io.to(chatId).emit("messages_delivered", {
          chatId: chat._id,
          userId: recipientId,
          status: 'delivered'
        });
      }
    }

    res.json({ message: addedMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// List student's chats for a course
exports.getStudentChats = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.params;

    const chats = await Chat.find({
      student: studentId,
      course: courseId,
    })
      .populate("mentor", "name email")
      .populate("course", "title")
      .select("_id mentor course createdAt");

    res.json({ chats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chats" });
  }
};

// List all chats for a mentor (grouped by course)
exports.getMentorChats = async (req, res) => {
  try {
    const mentorId = req.user._id;

    // Get all courses owned by mentor
    const Course = require("../models/Course");
    const courses = await Course.find({ mentor: mentorId }).select("_id title");
    const courseIds = courses.map(c => c._id);

    // Get all chats for these courses
    const chats = await Chat.find({
      mentor: mentorId,
      course: { $in: courseIds },
    })
      .populate("student", "name email")
      .populate("course", "title _id")
      .select("_id student course messages createdAt")
      .sort({ updatedAt: -1 });

    // Group by course
    const grouped = {};
    chats.forEach(chat => {
      const courseId = chat.course._id.toString();
      if (!grouped[courseId]) {
        grouped[courseId] = {
          courseId: chat.course._id,
          courseTitle: chat.course.title,
          chats: [],
        };
      }
      grouped[courseId].chats.push({
        _id: chat._id,
        student: chat.student,
        lastMessage: chat.messages[chat.messages.length - 1] || null,
        messageCount: chat.messages.length,
        unreadCount: chat.messages.filter(m => m.sender.toString() !== mentorId.toString() && m.status !== 'read').length,
        createdAt: chat.createdAt,
      });
    });

    const groupedChats = Object.values(grouped);

    res.json({ chats: groupedChats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch mentor chats" });
  }
};

// Get a specific chat for mentor (verify ownership)
exports.getMentorChat = async (req, res) => {
  try {
    const mentorId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      mentor: mentorId,
    })
      .populate("student", "name email")
      .populate("course", "title")
      .populate("messages.sender", "name email role");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or not authorized" });
    }

    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
};

// List all chats for a student (grouped by course)
exports.getAllStudentChats = async (req, res) => {
  try {
    const studentId = req.user._id;

    // Get all chats for this student
    const chats = await Chat.find({ student: studentId })
      .populate("mentor", "name email")
      .populate("course", "title _id")
      .select("_id mentor course messages createdAt")
      .sort({ updatedAt: -1 });

    // Group by course
    const grouped = {};
    chats.forEach(chat => {
      const courseId = chat.course._id.toString();
      if (!grouped[courseId]) {
        grouped[courseId] = {
          courseId: chat.course._id,
          courseTitle: chat.course.title,
          chats: [],
        };
      }
      grouped[courseId].chats.push({
        _id: chat._id,
        mentor: chat.mentor,
        lastMessage: chat.messages[chat.messages.length - 1] || null,
        messageCount: chat.messages.length,
        unreadCount: chat.messages.filter(m => m.sender.toString() !== studentId.toString() && m.status !== 'read').length,
        createdAt: chat.createdAt,
      });
    });

    const groupedChats = Object.values(grouped);

    res.json({ chats: groupedChats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch student chats" });
  }
};

// Get a specific chat for student (verify ownership)
exports.getStudentChat = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { chatId } = req.params;

    const chat = await Chat.findOne({
      _id: chatId,
      student: studentId,
    })
      .populate("mentor", "name email")
      .populate("course", "title")
      .populate("messages.sender", "name email role");

    if (!chat) {
      return res.status(404).json({ message: "Chat not found or not authorized" });
    }

    res.json({ chat });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch chat" });
  }
};

// Mark messages as read
exports.markChatRead = async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    // Verify participant
    if (chat.student.toString() !== userId.toString() && chat.mentor.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    let updatedCount = 0;
    const now = new Date();

    // Mark all messages from the *other* person as read
    chat.messages.forEach(msg => {
      // If I am NOT the sender, and it's not read, mark it read
      if (msg.sender.toString() !== userId.toString() && msg.status !== 'read') {
        msg.status = 'read';
        msg.readAt = now;
        updatedCount++;
      }
    });

    if (updatedCount > 0) {
      await chat.save();

      // Notify the other user via socket that their messages were read
      const io = req.app.get("io");
      if (io) {
        io.to(chatId).emit("messages_read", { chatId, readBy: userId, count: updatedCount });
      }
    }

    res.json({ message: "Messages marked read", count: updatedCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to mark messages read" });
  }
};

// Upload attachment
exports.uploadAttachment = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Convert buffer to base64 for Cloudinary upload
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    let dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    // Determine resource type (image or raw for documents)
    // Cloudinary auto-detects, but explicit is better for non-images
    const resourceType = req.file.mimetype.startsWith("image/") ? "image" : "auto";

    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "chat_attachments",
      resource_type: resourceType,
      use_filename: true, // keep original filename in url if possible
    });

    res.json({
      url: result.secure_url,
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ message: "Failed to upload file" });
  }
};
