const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["text", "video"], // ❌ pdf removed
    required: true,
  },
  content: {
    type: String, // text OR video URL
    required: true,
  },
  isFree: {
    type: Boolean,
    default: false,
  },
});

const courseSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    mentor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    lessons: [lessonSchema],
    published: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Course", courseSchema);
