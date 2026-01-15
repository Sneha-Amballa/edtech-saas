const express = require("express");
const { getAllMentors, getMentorById } = require("../controllers/mentorController");

const router = express.Router();

// Public endpoints - no authentication required
router.get("/", getAllMentors);
router.get("/:id", getMentorById);

module.exports = router;
