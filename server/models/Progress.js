// Location: server/models/Progress.js
const mongoose = require("mongoose");

const ProgressSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: true,
    },
    courseId: {
      type: String,
      required: true,
    },
    completedLectures: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
    // 🛡️ Tells Mongoose to bypass strict indexing checks if there's a local mismatch
    autoIndex: false,
  },
);

module.exports = mongoose.model("Progress", ProgressSchema);
