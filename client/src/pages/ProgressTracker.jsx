// Location: client/src/pages/ProgressTracker.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://lms-backend-api-oyv9.onrender.com/api";

export default function ProgressTracker() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLectures: 0,
    passedQuizzes: 0,
  });
  const [activeFilter, setActiveFilter] = useState("all"); // 'all', 'in-progress', 'completed'

  useEffect(() => {
    const fetchProgressMetrics = async () => {
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

        const res = await axios.get(`${BASE_URL}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data || [];
        setProgressData(data);

        let lecturesCount = 0;
        let quizzesCount = 0;
        data.forEach((item) => {
          // Check if it's a real database entry or dummy track
          if (!item._id.startsWith("temp_")) {
            lecturesCount += item.completedLectures?.length || 0;
            quizzesCount += item.completedQuizzes?.length || 0;
          }
        });

        // Count real non-temporary records as actively started courses
        const activeCoursesCount = data.filter(
          (item) => !item._id.startsWith("temp_"),
        ).length;

        setStats({
          totalCourses: activeCoursesCount,
          completedLectures: lecturesCount,
          passedQuizzes: quizzesCount,
        });
      } catch (err) {
        console.error("Error fetching progress analytics:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressMetrics();
  }, []);

  // Helper function to calculate data objects per course track element
  const getCourseMetrics = (prog) => {
    const completedCount = prog.completedLectures?.length || 0;
    const totalLectures =
      prog.courseId?.sections?.reduce(
        (sum, s) => sum + (s.lectures?.length || 0),
        0,
      ) || 0;
    const percentage =
      totalLectures > 0
        ? Math.min(100, Math.round((completedCount / totalLectures) * 100))
        : 0;

    let status = "not-started";
    if (prog._id.startsWith("temp_")) status = "not-started";
    else if (percentage === 100) status = "completed";
    else status = "in-progress";

    return { completedCount, totalLectures, percentage, status };
  };

  // Filter logic execution
  const filteredData = progressData.filter((prog) => {
    const metrics = getCourseMetrics(prog);
    if (activeFilter === "in-progress") return metrics.status === "in-progress";
    if (activeFilter === "completed") return metrics.status === "completed";
    return true; // 'all'
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-sm font-bold text-slate-500 animate-pulse">
          Gathering your learning metrics...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 md:p-10 max-w-5xl mx-auto space-y-8">
      {/* Top Banner Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Your Learning Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track milestones, watched lessons, and quiz scores.
          </p>
        </div>

        {/* ⭐ FEATURE 2: Dynamic Milestone Achievement Badges */}
        <div className="flex items-center gap-2 bg-indigo-50/70 border border-indigo-100 px-4 py-2.5 rounded-xl self-start sm:self-auto">
          <span className="text-xl">🛡️</span>
          <div>
            <span className="text-[9px] font-black uppercase text-indigo-500 block tracking-wider">
              Current Standing
            </span>
            <span className="text-xs font-black text-slate-800">
              {stats.completedLectures >= 10
                ? "🥇 Scholar Elite"
                : stats.completedLectures > 0
                  ? "🥈 Active Learner"
                  : "🥉 Rookie"}
            </span>
          </div>
        </div>
      </div>

      {/* Metrics Counter Dashboard Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <span className="p-3 bg-indigo-50 text-indigo-600 rounded-xl text-xl">
            📚
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Progressions
            </h3>
            <p className="text-2xl font-black text-slate-800">
              {stats.totalCourses}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <span className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-xl">
            📺
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Lectures Completed
            </h3>
            <p className="text-2xl font-black text-slate-800">
              {stats.completedLectures}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
          <span className="p-3 bg-amber-50 text-amber-600 rounded-xl text-xl">
            🏆
          </span>
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Quizzes Cleared
            </h3>
            <p className="text-2xl font-black text-slate-800">
              {stats.passedQuizzes}
            </p>
          </div>
        </div>
      </div>

      {/* Course Curriculum Area Layout Header */}
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200 pb-3">
          <h2 className="text-base font-extrabold text-slate-800">
            Course-by-Course Milestone Breakdown
          </h2>

          {/* ⭐ FEATURE 3: Tab State Filters */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold border border-slate-200 self-start">
            <button
              onClick={() => setActiveFilter("all")}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === "all" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              All Courses
            </button>
            <button
              onClick={() => setActiveFilter("in-progress")}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === "in-progress" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              In Progress
            </button>
            <button
              onClick={() => setActiveFilter("completed")}
              className={`px-3 py-1.5 rounded-lg transition-all ${activeFilter === "completed" ? "bg-white text-slate-800 shadow-sm" : "text-slate-400 hover:text-slate-600"}`}
            >
              Completed
            </button>
          </div>
        </div>

        {filteredData.length === 0 ? (
          <div className="bg-white p-12 border border-slate-200 rounded-2xl text-center text-slate-400 text-sm">
            No courses match the active filtering category selected.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredData.map((prog) => {
              const { completedCount, totalLectures, percentage, status } =
                getCourseMetrics(prog);
              const targetCourseId = prog.courseId?._id;

              return (
                <div
                  key={prog._id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">
                        {prog.courseId?.category || "General Curriculum"}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          status === "completed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : status === "in-progress"
                              ? "bg-amber-50 text-amber-600 border border-amber-100"
                              : "bg-slate-50 text-slate-400"
                        }`}
                      >
                        {status === "completed"
                          ? "Completed"
                          : status === "in-progress"
                            ? "In Progress"
                            : "Not Started"}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-slate-800 line-clamp-1">
                      {prog.courseId?.title || "Course Blueprint Document"}
                    </h3>
                  </div>

                  {/* Progress Bar Display Track */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Curriculum Track Progress</span>
                      <span className="text-slate-800">{percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${percentage === 100 ? "bg-emerald-500" : "bg-indigo-600"}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Sub-items Metadata Row */}
                  <div className="flex justify-between items-center text-[11px] font-medium text-slate-400 pt-2 border-t border-slate-100">
                    <span>
                      🎬 Watched:{" "}
                      <b className="text-slate-700">
                        {completedCount}/{totalLectures}
                      </b>
                    </span>
                    <span>
                      📝 Quizzes Cleared:{" "}
                      <b className="text-slate-700">
                        {prog.completedQuizzes?.length || 0}
                      </b>
                    </span>
                  </div>

                  {/* ⭐ FEATURE 1: Quick Jump Action Routing Button */}
                  <div className="pt-2">
                    <Link
                      to={`/course/${targetCourseId}`}
                      className={`w-full block text-center py-2 text-xs font-bold rounded-xl transition-all border ${
                        status === "completed"
                          ? "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white border-transparent shadow-sm"
                      }`}
                    >
                      {status === "completed"
                        ? "Review Classroom Modules"
                        : status === "in-progress"
                          ? "Resume Learning →"
                          : "Start First Lesson →"}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
