// Location: client/src/components/QuizView.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://lms-backend-api-oyv9.onrender.com/api";

export default function QuizView({ quiz, onQuizPassed }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🟢 FIX 1: Reset state automatically when the student switches between different quizzes
  useEffect(() => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setResult(null);
  }, [quiz?._id]);

  const currentQuestion = quiz?.questions?.[currentQuestionIndex];

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optionIndex,
    });
  };

  const handleNext = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !quiz.questions) return;
    setLoading(true);

    // 🧭 Convert selected answers map into an indexed ordered array
    const answersArray = quiz.questions.map(
      (_, idx) => selectedAnswers[idx] ?? -1,
    );

    // 🛡️ 1. MOCK DATA CHECK: Fallback evaluation logic for practice materials
    // 🟢 FIX 2: Added optional chaining and toString() protection against blank IDs
    if (
      !quiz?._id ||
      quiz._id === "mock_quiz_101" ||
      quiz._id.toString().startsWith("mock_")
    ) {
      let correctCount = 0;
      quiz.questions.forEach((question, idx) => {
        if (selectedAnswers[idx] === question.correctOptionIndex) {
          correctCount++;
        }
      });

      const scorePercentage = Math.round(
        (correctCount / quiz.questions.length) * 100,
      );
      const passed = scorePercentage >= (quiz.passingPercentage || 70);

      setResult({
        passed,
        scorePercentage,
        correctCount,
        totalQuestions: quiz.questions.length,
      });

      if (passed && onQuizPassed) {
        onQuizPassed(quiz._id);
      }
      setLoading(false);
      return;
    }

    // 🌐 2. REAL DATABASE QUIZ LOGIC: Sends data to your backend router pattern
    try {
      let token =
        localStorage.getItem("token") || localStorage.getItem("auth-token");

      if (!token) {
        const storedProfile = localStorage.getItem("userProfile");
        if (storedProfile) {
          const parsed = JSON.parse(storedProfile);
          token = parsed.token || parsed.authToken || parsed;
        }
      }

      // 🟢 Matches backend pattern: router.post("/:quizId/submit")
      const res = await axios.post(
        `${BASE_URL}/quizzes/${quiz._id}/submit`,
        {
          answers: answersArray,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setResult(res.data);
      if (res.data.passed && onQuizPassed) {
        onQuizPassed(quiz._id);
      }
    } catch (err) {
      console.error("Error submitting quiz choices:", err);
    } finally {
      setLoading(false);
    }
  };

  // 📝 Result Overlay View Card
  if (result) {
    return (
      <div className="p-6 bg-slate-900 text-white rounded-2xl text-center shadow-xl max-w-md mx-auto border border-slate-800">
        <h3 className="text-2xl font-black mb-2">Assessment Completed!</h3>
        <p className="text-6xl font-black my-4 text-indigo-400">
          {result.scorePercentage}%
        </p>
        <p className="text-sm text-slate-400">
          You answered {result.correctCount} out of {result.totalQuestions}{" "}
          questions correctly.
        </p>

        <div
          className={`mt-6 p-4 rounded-xl font-bold ${
            result.passed
              ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
              : "bg-rose-600/20 text-rose-400 border border-rose-500/30"
          }`}
        >
          {result.passed
            ? "🎉 Congratulations, You Passed!"
            : "❌ Score below passing rate. Try Again!"}
        </div>

        {!result.passed && (
          <button
            onClick={() => {
              setResult(null);
              setCurrentQuestionIndex(0);
              setSelectedAnswers({});
            }}
            className="mt-4 text-xs font-bold underline text-indigo-400 cursor-pointer"
          >
            Retake Assessment
          </button>
        )}
      </div>
    );
  }

  if (!currentQuestion)
    return <p className="text-slate-400">Loading assessment module...</p>;

  return (
    <div className="bg-white border border-slate-200 shadow-sm p-6 rounded-2xl max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400">
        <span className="truncate max-w-[200px] block">{quiz.title}</span>
        <span>
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </span>
      </div>

      <h4 className="text-base font-bold text-slate-800 mb-4">
        {currentQuestion.questionText}
      </h4>

      <div className="space-y-2 mb-6">
        {currentQuestion.options.map((option, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectOption(idx)}
            className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
              selectedAnswers[currentQuestionIndex] === idx
                ? "bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm"
                : "border-slate-200 hover:bg-slate-50 text-slate-600"
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex justify-between border-t border-slate-100 pt-4">
        <button
          disabled={currentQuestionIndex === 0}
          onClick={handlePrevious}
          className="px-4 py-2 text-xs font-bold text-slate-500 border border-slate-200 rounded-xl disabled:opacity-40"
        >
          Back
        </button>

        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md shadow-indigo-200"
          >
            {loading ? "Submitting..." : "Submit Assessment"}
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={selectedAnswers[currentQuestionIndex] === undefined}
            className="px-5 py-2 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white rounded-xl disabled:opacity-50"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
