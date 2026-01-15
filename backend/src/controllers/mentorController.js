const User = require("../models/User");

// Get all mentors
exports.getAllMentors = async (req, res) => {
  try {
    const mentors = await User.find({ role: "mentor" }).select("name email role");
    res.status(200).json(mentors);
  } catch (err) {
    console.error("[mentors] getAllMentors error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get mentor by ID
exports.getMentorById = async (req, res) => {
  try {
    const { id } = req.params;
    const mentor = await User.findById(id).select("name email role");
    
    if (!mentor || mentor.role !== "mentor") {
      return res.status(404).json({ message: "Mentor not found" });
    }

    res.status(200).json(mentor);
  } catch (err) {
    console.error("[mentors] getMentorById error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
