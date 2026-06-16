// Location: server/models/Course.js
const mongoose = require("mongoose");

const LectureSchema = new mongoose.Schema({
  title: { type: String, required: true },
  duration: { type: String, required: true },
  videoUrl: { type: String, required: true },
  summary: { type: String, required: true },
});

// 🟢 STEP 1: Define an inline Question Schema matching what your QuizForm sends
const InlineQuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
});

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  lectures: [LectureSchema],
  // 🟢 STEP 2: Add the questions field right here so Mongoose doesn't strip it!
  questions: [InlineQuestionSchema],
});

const CourseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    thumbnail: { type: String },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    sections: [SectionSchema],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Course", CourseSchema);
