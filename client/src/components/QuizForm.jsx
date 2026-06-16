// Location: client/src/components/QuizForm.jsx
import React from "react";

export default function QuizForm({ questions, setQuestions }) {
  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      { questionText: "", options: ["", "", "", ""], correctOptionIndex: 0 },
    ]);
  };

  const handleQuestionTextChange = (qIndex, text) => {
    const updated = [...questions];
    updated[qIndex].questionText = text;
    setQuestions(updated);
  };

  const handleOptionTextChange = (qIndex, oIndex, text) => {
    const updated = [...questions];
    updated[qIndex].options[oIndex] = text;
    setQuestions(updated);
  };

  const handleCorrectAnswerChange = (qIndex, oIndex) => {
    const updated = [...questions];
    updated[qIndex].correctOptionIndex = Number(oIndex);
    setQuestions(updated);
  };

  const handleRemoveQuestion = (qIndex) => {
    setQuestions(questions.filter((_, idx) => idx !== qIndex));
  };

  return (
    <div className="space-y-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 mt-4">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-black text-slate-700 tracking-wider uppercase">
          Section Assessment Builder
        </h4>
        <button
          type="button"
          onClick={handleAddQuestion}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer"
        >
          + Add Question
        </button>
      </div>

      {questions.map((q, qIndex) => (
        <div
          key={qIndex}
          className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 relative shadow-sm"
        >
          <button
            type="button"
            onClick={() => handleRemoveQuestion(qIndex)}
            className="absolute top-3 right-3 text-xs text-rose-500 font-bold hover:underline cursor-pointer"
          >
            Remove
          </button>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1">
              Question {qIndex + 1}
            </label>
            <input
              type="text"
              value={q.questionText}
              onChange={(e) => handleQuestionTextChange(qIndex, e.target.value)}
              placeholder="e.g., What does DOM stand for?"
              className="w-full text-sm px-3 py-2 border rounded-xl border-slate-200 focus:outline-indigo-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((option, oIndex) => (
              <div
                key={oIndex}
                className="flex items-center space-x-2 border border-slate-100 p-2 rounded-lg bg-slate-50/50"
              >
                <input
                  type="radio"
                  name={`correct-${qIndex}`}
                  checked={q.correctOptionIndex === oIndex}
                  onChange={() => handleCorrectAnswerChange(qIndex, oIndex)}
                  className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) =>
                    handleOptionTextChange(qIndex, oIndex, e.target.value)
                  }
                  placeholder={`Option ${oIndex + 1}`}
                  className="w-full text-xs px-2 py-1 border rounded-md border-slate-200 bg-white"
                />
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-medium block">
            Select the radio button next to the choice to mark it as the correct
            answer.
          </span>
        </div>
      ))}
    </div>
  );
}
