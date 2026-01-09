const Chat = require("../models/Chat");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

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

    // Add message
    const message = {
      sender: senderId,
      content: content.trim(),
      createdAt: new Date(),
    };

    chat.messages.push(message);
    await chat.save();

    // Populate sender info for response
    await chat.populate("messages.sender", "name email");
    const addedMessage = chat.messages[chat.messages.length - 1];

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
