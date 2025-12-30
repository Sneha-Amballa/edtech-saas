const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: String,
  type: {
    type: String,
    enum: ["video", "pdf", "text"],
  },
  content: String, // URL (video/pdf) or text content
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
    overview: {
      whatYouWillLearn: [String],
      requirements: [String],
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
