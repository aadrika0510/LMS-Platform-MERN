// Location: client/src/pages/LandingPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleRoleSelection = (role) => {
    // 🟢 Prefill or pass intended role context to your login/register route
    navigate(`/login?intent=${role}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center space-y-8 bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
        {/* Brand Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white shadow-md text-3xl font-black">
            L
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            LMS Academy
          </h1>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Welcome to your centralized curriculum hub. Select your access
            pathway below to get started.
          </p>
        </div>

        <hr className="border-slate-100" />

        {/* Access Portals Options */}
        <div className="space-y-3">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-4">
            Choose your workspace role
          </h2>

          {/* Student Access Portal */}
          <button
            onClick={() => handleRoleSelection("student")}
            className="w-full flex items-center justify-between px-5 py-4 bg-white border border-slate-200 hover:border-indigo-500 rounded-2xl shadow-sm text-left group transition cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl p-2 bg-indigo-50 rounded-xl group-hover:bg-indigo-100 transition">
                🎓
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition">
                  Sign In as Student
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Submit task sheets, track progress benchmarks, and view
                  grades.
                </p>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-indigo-600 font-bold transition text-sm">
              →
            </span>
          </button>

          {/* Instructor Access Portal */}
          <button
            onClick={() => handleRoleSelection("instructor")}
            className="w-full flex items-center justify-between px-5 py-4 bg-white border border-slate-200 hover:border-violet-500 rounded-2xl shadow-sm text-left group transition cursor-pointer"
          >
            <div className="flex items-center space-x-4">
              <span className="text-2xl p-2 bg-violet-50 rounded-xl group-hover:bg-violet-100 transition">
                🛠️
              </span>
              <div>
                <p className="text-xs font-bold text-slate-800 group-hover:text-violet-600 transition">
                  Sign In as Instructor
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Deploy new assignments, manage pipelines, and grade
                  submissions.
                </p>
              </div>
            </div>
            <span className="text-slate-400 group-hover:text-violet-600 font-bold transition text-sm">
              →
            </span>
          </button>
        </div>

        {/* Footer Details */}
        <div className="pt-2">
          <p className="text-[10px] text-slate-400">
            Secure workspace network framework verified.
          </p>
        </div>
      </div>
    </div>
  );
}
