// Location: server/models/Assignment.js
const mongoose = require("mongoose");

const AssignmentSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dueDate: { type: Date, required: true },
    submissions: [
      {
        studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        studentName: String,
        submittedAt: { type: Date, default: Date.now },
        fileUrl: String,
        grade: { type: String, default: "Ungraded" },
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Assignment", AssignmentSchema);
