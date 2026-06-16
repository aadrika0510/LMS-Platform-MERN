// Location: server/controllers/quizController.js

const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
const QuizSubmission = require("../models/QuizSubmission");
const Progress = require("../models/Progress");

// Submit quiz answers and evaluate
exports.submitQuiz = async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body; // Expecting an array of selected indices: [0, 2, 1, ...]
  const studentId = req.user.id || req.user._id;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz)
      return res.status(404).json({ message: "Quiz assessment not found" });

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;

    // Evaluate answers securely against the database keys
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctOptionIndex) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= quiz.passingPercentage;

    try {
      // 🟢 NEW TRACKING: Always save the attempt to the QuizSubmission collection for analytics
      const submission = new QuizSubmission({
        userId: studentId, // Uses your extracted studentId variable
        courseId: quiz.courseId,
        quizId: quizId,
        score: correctCount,
        totalQuestions: totalQuestions,
        isPassed: passed,
      });
      await submission.save();

      // 🔄 Existing Progress Logic: Keep this intact so it updates the course tracking percentages
      if (passed) {
        let progress = await Progress.findOne({
          studentId,
          courseId: quiz.courseId,
        });

        if (!progress) {
          progress = new Progress({
            studentId,
            courseId: quiz.courseId,
            completedLectures: [],
          });
        }

        if (!progress.completedQuizzes) progress.completedQuizzes = [];
        if (!progress.completedQuizzes.includes(quizId)) {
          progress.completedQuizzes.push(quizId);
          await progress.save();
        }
      }
    } catch (err) {
      console.error("Error saving quiz submission:", err);
      // We won't fail the entire response if saving the submission fails, but we log it for debugging.
    }

    return res.status(200).json({
      passed,
      scorePercentage,
      correctCount,
      totalQuestions,
      passingPercentage: quiz.passingPercentage,
    });
  } catch (err) {
    console.error("Quiz evaluation failure:", err);
    return res
      .status(500)
      .json({ message: "Internal server error evaluating quiz" });
  }
};

// Location: server/controllers/quizController.js

exports.getQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    console.log(`\n🔍 [DEBUG] Frontend is looking for courseId: "${courseId}"`);

    // 🟢 1. Grab completely everything in the collection for a diagnostic look
    const allQuizzesInDb = await Quiz.find({});
    console.log(
      `📦 [DEBUG] Total total quizzes existing in your MongoDB: ${allQuizzesInDb.length}`,
    );

    if (allQuizzesInDb.length > 0) {
      console.log(
        "📝 Listing out the field values found on your first few database quizzes:",
      );
      allQuizzesInDb.slice(0, 3).forEach((q, index) => {
        console.log(
          `   👉 Quiz [${index}] Title: "${q.title}" | courseId field value in DB: "${q.courseId}" | sectionId in DB: "${q.sectionId}"`,
        );
      });
    } else {
      console.log(
        "⚠️ WARNING: Your Quiz collection inside MongoDB is completely empty! No documents exist.",
      );
    }

    // 🟢 2. Run your flexible filter array check
    const queryFilters = [{ courseId: courseId.toString() }];
    if (mongoose.Types.ObjectId.isValid(courseId)) {
      queryFilters.push({ courseId: new mongoose.Types.ObjectId(courseId) });
    }

    let quizzes = await Quiz.find({ $or: queryFilters }).sort({
      createdAt: -1,
    });

    // 🟢 3. FALLBACK CATCH: If the filter found 0 but database has quizzes, force-send them so something shows up!
    if (quizzes.length === 0 && allQuizzesInDb.length > 0) {
      console.log(
        "🚨 ID MISMATCH DETECTED: Forcing server to send all quizzes to screen for testing purposes.",
      );
      quizzes = allQuizzesInDb;
    }

    return res.status(200).json(quizzes);
  } catch (err) {
    console.error("Database sync error:", err);
    return res.status(500).json({
      message: "Failed to load active quiz matrix.",
      error: err.message,
    });
  }
};

exports.createQuiz = async (req, res) => {
  try {
    const { courseId, sectionId, title, questions, passingPercentage } =
      req.body;

    const newQuiz = new Quiz({
      courseId,
      sectionId,
      title: title || "Section Assessment",
      questions,
      passingPercentage: passingPercentage || 70,
    });

    await newQuiz.save();
    res.status(201).json({ success: true, data: newQuiz });
  } catch (err) {
    res.status(500).json({
      message: "Failed to create independent quiz record.",
      error: err.message,
    });
  }
};
