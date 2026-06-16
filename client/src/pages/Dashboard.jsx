import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { fetchCoursesAPI, deleteCourseAPI, fetchProgressAPI } from "../api";
import CourseBuilder from "../components/CourseBuilder";
import CourseDetail from "./CourseDetail";

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [studentProgress, setStudentProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [progressList, setProgressList] = useState([]);

  const user = JSON.parse(localStorage.getItem("userProfile"));
  const isInstructor = user?.role === "Instructor" || user?.role === "Admin";

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const coursesResponse = await fetchCoursesAPI();
      setCourses(coursesResponse.data || []);

      // Only fetch student milestone documents if the user is a Student role
      if (!isInstructor) {
        // 🛡️ Create an array of network requests for every course in your system
        const progressRequests = (coursesResponse.data || []).map((course) => {
          const cId = course._id || course.id;

          // Using fetchProgressAPI instead of direct unmapped "API.get" to stay safe
          return fetchProgressAPI(cId)
            .then((res) => res.data)
            .catch(() => ({ courseId: cId, completedLectures: [] }));
        });

        const progressResults = await Promise.all(progressRequests);

        // 🟢 Save all progress matrices to the hook name your renderProgressBar expects:
        // If your file uses setStudentProgress, make sure you match this state array!
        setStudentProgress(progressResults);
      }

      setLoading(false);
    } catch (err) {
      console.error("Error synchronizing dashboard datasets:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userProfile");
    window.location.reload();
  };

  if (selectedCourseId) {
    return (
      <CourseDetail
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  const renderProgressBar = (course) => {
    // 🛡️ 1. Safely locate the tracking sheet matching this user and course context
    const courseProgressDoc = studentProgress?.find(
      (p) => p.courseId?.toString() === (course._id || course.id)?.toString(),
    );

    // 📈 2. Extract completed lectures length safely
    const completedCount = courseProgressDoc?.completedLectures?.length || 0;

    // 📐 3. Count total items inside all modules of this specific curriculum course
    const totalLecturesCount =
      course.sections?.reduce((sum, section) => {
        return sum + (section.lectures?.length || 0);
      }, 0) || 0;

    // 🧮 4. Calculate final percentage tracking
    const progressPercentage =
      totalLecturesCount > 0
        ? Math.round((completedCount / totalLecturesCount) * 100)
        : 0;

    return (
      <div className="mt-4 px-6 space-y-1.5">
        <div className="flex justify-between text-xs font-bold text-slate-500">
          <span>Course Completion Metrics</span>
          <span className="text-indigo-600 font-black">
            {progressPercentage}%
          </span>
        </div>

        {/* Visual Progress Bar Track Track */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        <p className="text-[10px] text-slate-400 font-medium pb-2">
          Checked: {completedCount} of {totalLecturesCount} milestone tasks
          completed
        </p>
      </div>
    );
  };
  return (
    <div className="space-y-8">
      {/* 👑 IF INSTRUCTOR: Render Course Management Panel */}
      {isInstructor && (
        <div className="max-w-5xl mx-auto">
          <CourseBuilder onCourseCreated={loadDashboardData} />
        </div>
      )}

      {/* Main Grid Content Container */}
      <div className="max-w-5xl mx-auto">
        {/* Course Directory Title Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">
              Explore Live Curriculums
            </h2>
            <p className="text-xs text-slate-500">
              Acquire fresh operational skillsets from certified experts.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {courses.length} Available
          </span>
        </div>

        {loading ? (
          <p className="text-slate-500 text-sm animate-pulse">
            Synchronizing platform data links...
          </p>
        ) : courses.length === 0 ? (
          <div className="bg-white/60 rounded-3xl p-12 text-center border-2 border-dashed border-slate-200">
            <p className="text-slate-500 text-sm font-medium">
              No active courses published on the platform network yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course._id}
                className="bg-white rounded-3xl shadow-xl shadow-slate-100/40 overflow-hidden border border-slate-100 flex flex-col justify-between hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300 group"
              >
                <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                  <img
                    src={
                      course.thumbnail &&
                      course.thumbnail !== "default-course.jpg"
                        ? course.thumbnail
                        : course.category === "Web Development"
                          ? "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop"
                          : course.category === "Data Science"
                            ? "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
                            : "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"
                    }
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                </div>
                <div className="p-6">
                  <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {course.category}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-3 line-clamp-1 group-hover:text-indigo-600 transition duration-300">
                    {course.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>
                  <div className="text-[11px] text-slate-400 mt-4 pt-4 border-t border-slate-50 flex items-center gap-1.5 font-medium">
                    <span>👨‍🏫</span> Instructor:{" "}
                    <strong className="text-slate-600 font-semibold">
                      {course.instructor?.name || "Platform Faculty"}
                    </strong>
                  </div>
                </div>
                {renderProgressBar(course)}
                <div className="bg-slate-50 px-6 py-4 flex justify-between items-center border-t border-slate-100/60">
                  <span className="font-black text-slate-900 text-base">
                    {course.price === 0
                      ? "Free"
                      : `₹${course.price.toLocaleString("en-IN")}`}
                  </span>
                  <div className="flex items-center gap-2">
                    {isInstructor && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (
                            window.confirm(
                              `Are you sure you want to permanently delete "${course.title}"?`,
                            )
                          ) {
                            try {
                              await deleteCourseAPI(course._id || course.id);
                              loadDashboardData();
                            } catch (err) {
                              alert(
                                err.response?.data?.message ||
                                  "Failed to delete course",
                              );
                            }
                          }
                        }}
                        className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2.5 rounded-xl transition duration-200 cursor-pointer"
                        title="Delete Course Blueprint"
                      >
                        🗑️
                      </button>
                    )}

                    <button
                      onClick={() =>
                        setSelectedCourseId(course._id || course.id)
                      }
                      className="bg-indigo-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-md shadow-indigo-100/80 cursor-pointer"
                    >
                      View Course
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
