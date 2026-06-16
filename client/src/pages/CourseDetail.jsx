import React, { useEffect, useState } from "react";
import axios from "axios"; // 🟢 1. Import axios for fetching live quizzes
import { fetchCoursesAPI, fetchProgressAPI, toggleProgressAPI } from "../api";
import QuizView from "../components/QuizView";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://lms-backend-api-oyv9.onrender.com/api";
  
export default function CourseDetail({ courseId, onBack }) {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeLecture, setActiveLecture] = useState(null);
  const [completedLectures, setCompletedLectures] = useState([]);
  const [showQuiz, setShowQuiz] = useState(false);

  // 🟢 2. NEW STATES: Dynamic DB quiz containers
  const [quizzes, setQuizzes] = useState([]);
  const [quizLoading, setQuizLoading] = useState(true);

  // Helper utility to safely gather authentication headers
  const getAuthHeaders = () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("auth-token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    if (!courseId) {
      setLoading(false);
      return;
    }

    Promise.all([
      fetchCoursesAPI(),
      fetchProgressAPI(courseId).catch((err) => {
        console.warn(
          "No progress tracking document found yet for this course context.",
          err,
        );
        return { data: { completedLectures: [] } };
      }),
    ])
      .then(([courseRes, progressRes]) => {
        const currentCourse = courseRes.data.find((c) => {
          const targetId = c._id || c.id;
          return targetId && targetId.toString() === courseId.toString();
        });

        if (currentCourse) {
          setCourse(currentCourse);
          setCompletedLectures(progressRes?.data?.completedLectures || []);

          if (currentCourse.sections?.[0]?.lectures?.[0]) {
            setActiveLecture(currentCourse.sections[0].lectures[0]);
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Critical error inside tracking dashboard sync:", err);
        setLoading(false);
      });
  }, [courseId]);

  // 🟢 Update this block inside client/src/pages/CourseDetail.jsx
  useEffect(() => {
    const fetchLiveQuizzes = async () => {
      try {
        setQuizLoading(true);

        // Changed from "/quizzes/all" to pass the exact courseId as a query parameter or path parameter
        const res = await axios.get(
          `${BASE_URL}/quizzes/course/${courseId}`,
          getAuthHeaders(),
        );
        setQuizzes(res.data || []);
      } catch (err) {
        console.error("Failed to load live database quizzes:", err);
      } finally {
        setQuizLoading(false);
      }
    };

    if (courseId) {
      fetchLiveQuizzes();
    }
  }, [courseId]);

  const handleToggleComplete = async (lectureId) => {
    if (!lectureId || !courseId) return;
    try {
      const res = await toggleProgressAPI(courseId, lectureId);
      setCompletedLectures(res.data.completedLectures || []);
    } catch (err) {
      console.error("Failed to alter checkpoint status state alignment:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-slate-400 font-bold tracking-wide animate-pulse">
          Synchronizing workspace configurations...
        </p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-rose-500 font-black text-lg mb-4">
          Course could not be loaded or located.
        </p>
        <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
          The requested identifier{" "}
          <code className="bg-slate-900 px-2 py-1 rounded text-indigo-400">
            {courseId}
          </code>{" "}
          does not map to any live published structures in your database
          instance.
        </p>
        <button
          onClick={onBack}
          className="text-xs font-black text-indigo-400 bg-indigo-950/60 border border-indigo-900/60 hover:bg-indigo-900 px-5 py-2.5 rounded-xl transition duration-200 cursor-pointer"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  const targetSections = course.sections || [];
  const currentLectureId = activeLecture?._id || activeLecture?.id;
  const isActiveLectureCompleted = completedLectures.includes(currentLectureId);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Dynamic Header Section */}
      <nav className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition font-bold text-xs cursor-pointer"
          >
            ← Back to Catalog
          </button>
          <div>
            <span className="text-[10px] font-black tracking-wider text-indigo-400 uppercase bg-indigo-950/60 border border-indigo-900 px-2 py-0.5 rounded-md">
              {course.category || "Curriculum"}
            </span>
            <h1 className="text-base font-extrabold tracking-tight mt-0.5 line-clamp-1 text-white">
              {course.title}
            </h1>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* LEFT COLUMN: Media Player or Quiz Workspace Layout */}
        <div className="flex-1 bg-slate-950 p-4 md:p-6 lg:overflow-y-auto space-y-6">
          {/* 🟢 4. DYNAMIC LOGIC CHANGED HERE: Map through live quizzes from database state */}
          {showQuiz ? (
            <div className="py-4 space-y-6">
              {quizLoading ? (
                <p className="text-xs text-slate-400 italic animate-pulse">
                  Loading assigned quizzes...
                </p>
              ) : quizzes.length === 0 ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-xs text-slate-400 italic">
                  No active quizzes custom-published by instructors yet.
                </div>
              ) : (
                <div className="space-y-8">
                  {quizzes.map((liveQuiz) => (
                    <div
                      key={liveQuiz._id}
                      className="border border-slate-800/80 rounded-2xl p-4 bg-slate-900/40"
                    >
                      <div className="mb-4">
                        <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-950/40 border border-indigo-900/50 px-2 py-0.5 rounded">
                          Live Database Quiz
                        </span>
                        <h3 className="text-sm font-bold text-white mt-1">
                          {liveQuiz.title}
                        </h3>
                        {liveQuiz.description && (
                          <p className="text-xs text-slate-400 mt-0.5">
                            {liveQuiz.description}
                          </p>
                        )}
                      </div>
                      <QuizView
                        quiz={liveQuiz}
                        onQuizPassed={(id) => {
                          console.log(
                            "Quiz cleared and submitted to tracking matrices:",
                            id,
                          );
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Media Video Player Frame Container Block */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl border border-slate-800/80">
                {activeLecture ? (
                  activeLecture.videoUrl?.includes("youtube") ||
                  activeLecture.videoUrl?.includes("youtu.be") ? (
                    <iframe
                      key={currentLectureId}
                      src={`https://www.youtube.com/embed/${activeLecture.videoUrl.split("v=")[1]?.split("&")[0] || activeLecture.videoUrl.split("/").pop()}`}
                      title={activeLecture.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      key={currentLectureId}
                      controls
                      autoPlay
                      className="w-full h-full object-cover"
                    >
                      <source src={activeLecture.videoUrl} type="video/mp4" />
                    </video>
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm">
                    No active track streaming module chosen.
                  </div>
                )}
              </div>

              {/* Core Video Meta details panel layout block */}
              {activeLecture && (
                <div className="bg-slate-900/60 rounded-2xl border border-slate-800/60 p-6 shadow-xl space-y-4">
                  <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                    <div>
                      <h2 className="text-xl font-black text-white">
                        {activeLecture.title}
                      </h2>
                      <div className="flex items-center gap-2 mt-1 text-xs font-semibold text-slate-400">
                        <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                          ⏱️ {activeLecture.duration} Mins
                        </span>
                        <span>•</span>
                        <span>Active Step</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleComplete(currentLectureId)}
                      type="button"
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md shrink-0 ${
                        isActiveLectureCompleted
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-950/40"
                          : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                      }`}
                    >
                      {isActiveLectureCompleted
                        ? "✓ Completed"
                        : "Mark as Completed"}
                    </button>
                  </div>

                  <hr className="border-slate-800/80 my-4" />
                  <div>
                    <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                      Lecture Roadmap Summary
                    </h4>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                      {activeLecture.summary}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN: Curriculum Sidebar Scroll Tray System */}
        <div className="w-full lg:w-96 bg-slate-900 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col lg:overflow-hidden">
          {/* Quiz Action Command Board Block */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-black text-white">
                Knowledge Checkpoint
              </h4>
              <p className="text-[10px] text-slate-400 font-medium">
                Verify your comprehension metrics
              </p>
            </div>
            <button
              onClick={() => setShowQuiz(!showQuiz)}
              className={`px-3 py-1.5 font-bold text-xs rounded-lg transition-all shadow-sm ${
                showQuiz
                  ? "bg-rose-600/20 text-rose-400 border border-rose-500/30 hover:bg-rose-600/30"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white"
              }`}
            >
              {showQuiz ? "Watch Video" : "Take Quiz"}
            </button>
          </div>

          <div className="p-4 bg-slate-950/40 border-b border-slate-800/80">
            <h3 className="text-sm font-black text-white tracking-wide">
              Course Curriculum
            </h3>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">
              📈 Done: {completedLectures.length} Milestone lessons checked
            </p>
          </div>

          <div className="flex-1 lg:overflow-y-auto p-4 space-y-4">
            {targetSections.map((section, idx) => (
              <div key={section._id || idx} className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 px-1 select-none">
                  {section.title}
                </h4>
                <div className="space-y-1">
                  {section.lectures?.map((lecture) => {
                    const lecId = lecture._id || lecture.id;
                    const isSelected = !showQuiz && currentLectureId === lecId;
                    const isFinished = completedLectures.includes(lecId);

                    return (
                      <button
                        key={lecId}
                        onClick={() => {
                          setActiveLecture(lecture);
                          setShowQuiz(false);
                        }}
                        className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 border-indigo-500 text-white shadow-md"
                            : "bg-slate-800/40 border-slate-800 hover:bg-slate-800/90 text-slate-300"
                        }`}
                      >
                        <div className="flex items-start gap-2.5 pr-2">
                          <span
                            className={`text-xs p-1 rounded-md shrink-0 ${
                              isFinished
                                ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                : "isSelected"
                                  ? "bg-indigo-700 text-white"
                                  : "bg-slate-700 text-slate-400"
                            }`}
                          >
                            {isFinished ? "✓" : isSelected ? "▶️" : "📄"}
                          </span>
                          <span
                            className={`text-xs font-bold mt-0.5 line-clamp-2 leading-tight ${isFinished && !isSelected ? "text-slate-400 line-through decoration-slate-600" : ""}`}
                          >
                            {lecture.title}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-bold shrink-0 px-1.5 py-0.5 rounded-md ${
                            isFinished && !isSelected
                              ? "bg-emerald-950 text-emerald-400"
                              : isSelected
                                ? "bg-indigo-700 text-indigo-200"
                                : "bg-slate-900 text-slate-400"
                          }`}
                        >
                          {lecture.duration}m
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
