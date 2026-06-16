// Location: client/src/components/SidebarLayout.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom"; // 🟢 Outlet is imported here

// 🟢 Removed { children } from the parameters since React Router handles child views via <Outlet /> now
export default function SidebarLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const [profileName, setProfileName] = useState("User Account");
  const [profileRole, setProfileRole] = useState("Student");

  // Helper check to highlight the active tab
  const isActive = (path) => location.pathname === path;

  useEffect(() => {
    const stored = localStorage.getItem("userProfile");
    if (stored) {
      const parsed = JSON.parse(stored);
      setProfileName(parsed.name || "User Account");
      setProfileRole(parsed.role || "Student");
    }
  }, [location]);

  const handleSignOut = (e) => {
    if (e) e.preventDefault();
    localStorage.clear();
    window.location.href = "/login";
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex">
      {/* 🧭 LEFT SIDEBAR CONTAINER */}
      <aside className="w-64 bg-white border-r border-slate-200 p-5 flex flex-col justify-between fixed h-screen">
        <div className="space-y-6">
          {/* Platform Branding Header */}
          <div className="flex items-center gap-2 px-2">
            <div className="h-7 w-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black text-sm">
              L
            </div>
            <span className="font-black text-sm text-slate-800 tracking-tight">
              LMS Academy
            </span>
          </div>

          {/* Navigation Link Menu Array */}
          <nav className="space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block px-2 mb-2">
              {profileRole === "Instructor"
                ? "Instructor Space"
                : "Student Space"}
            </span>

            <Link
              to="/dashboard"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive("/dashboard")
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>🏠</span> Home Dashboard
            </Link>

            <Link
              to="/progress-tracker"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive("/progress-tracker")
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>📊</span> Progress Tracking
            </Link>

            {/* Dynamic context linking fallback for assignments */}
            <Link
              to="/course/all-assignments"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                location.pathname === "/course/all-assignments"
                  ? "bg-indigo-50 text-indigo-700 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <span>📋</span> All Assignments
            </Link>
          </nav>
        </div>

        {/* User Account / Profile Box At Bottom */}
        <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs uppercase">
              {getInitials(profileName)}
            </div>
            <div>
              <h4 className="text-xs font-black text-slate-800 leading-none">
                {profileName}
              </h4>
              <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                {profileRole}
              </span>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            type="button"
            className="text-xs text-slate-400 hover:text-rose-600 font-bold transition-colors cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* 🖥️ RIGHT MAIN WORKSPACE INTERFACE PANEL */}
      <main className="flex-1 ml-64 p-6 md:p-10 min-h-screen">
        {/* 🟢 CRITICAL CHANGE: Replaced {children} with <Outlet /> to let nested sub-routes paint screens */}
        <Outlet />
      </main>
    </div>
  );
}
