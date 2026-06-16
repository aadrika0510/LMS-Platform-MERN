// Location: server/models/Quiz.js
const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of multiple-choice strings
  correctOptionIndex: { type: Number, required: true }, // 0-based index of the right answer
});

const QuizSchema = new mongoose.Schema(
  {
    courseId: { type: String, required: true },
    sectionId: { type: String, required: true },
    title: { type: String, required: true, default: "Section Assessment" },
    questions: [QuestionSchema],
    passingPercentage: { type: Number, default: 70 }, // Threshold to clear the quiz
  },
  { timestamps: true },
);

module.exports = mongoose.model("Quiz", QuizSchema);
