const mongoose = require("mongoose");

const enrollmentSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: {
      type: [mongoose.Schema.Types.ObjectId],
      validate: {
        validator: function (v) {
          return v.length === new Set(v.map(id => id.toString())).size;
        },
        message: "Duplicate lessons not allowed",
      },
    },
    status: {
      type: String,
      enum: ["in-progress", "completed"],
      default: "in-progress",
    },
    progress: {
      type: Number,
      default: 0,
    },
    certificateId: {
      type: String,
      default: null,
    },
    certificateIssuedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
