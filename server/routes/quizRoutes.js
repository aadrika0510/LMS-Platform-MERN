// Location: server/routes/quizRoutes.js
const express = require("express");
const router = express.Router();
// 🟢 1. Import getQuizzes from your controller alongside submitQuiz
const {
  submitQuiz,
  getQuizzes,
  createQuiz,
} = require("../controllers/quizController");
const { protect } = require("../middleware/authMiddleware");

// 🟢 2. Add the GET endpoint to fetch quizzes from MongoDB
router.get("/course/:courseId", protect, getQuizzes);
router.post("/create", createQuiz);

// POST endpoint for evaluations
router.post("/:quizId/submit", protect, submitQuiz);

module.exports = router;
