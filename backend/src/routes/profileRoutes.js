const express = require("express");
const { getProfile } = require("../controllers/profileController");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/me", protect, getProfile);

module.exports = router;
