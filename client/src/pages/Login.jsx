import React, { useState } from "react";
import { loginAPI, registerAPI } from "../api";
import { useLocation } from "react-router-dom";

export default function Auth() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const intendedRole = queryParams.get("intent");
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState(
    intendedRole === "instructor" ? "Instructor" : "Student",
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let response;
      if (isRegister) {
        response = await registerAPI({ ...formData, role });
      } else {
        response = await loginAPI({
          email: formData.email,
          password: formData.password,
        });
      }

      if (response.data?.token) {
        localStorage.setItem("token", response.data.token);
      }
      const userProfileData = response.data?.user || response.data;

      localStorage.setItem("userProfile", JSON.stringify(userProfileData));
      window.location.href = "/dashboard";
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Authentication failed. Please verify your fields.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070a13] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-950/30 via-[#070a13] to-[#070a13] px-4 py-12 text-slate-100">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-slate-900/40 border border-slate-800/60 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,0.05)] transition-all duration-500">
        {/* 🎨 MODERN GRADIENT MESH BANNER */}
        <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 px-8 py-10 text-center relative border-b border-slate-800/60">
          <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.4))]" />
          <div className="absolute -top-12 -left-12 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl" />

          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent relative z-10">
            {isRegister ? "Begin Your Journey" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-slate-400 relative z-10">
            {isRegister
              ? "Join our global community of learners and educators."
              : "Access your courses, dashboard, and custom toolkits."}
          </p>
        </div>

        {/* INPUT & FORM CONTAINER */}
        <div className="p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-2xl font-semibold flex items-center gap-2 animate-pulse">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                {/* ROLE SWITCHER CARDS */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                    Choose Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole("Student")}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                        role === "Student"
                          ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xl mb-1">🎓</div>
                      <div className="font-bold text-white text-sm">
                        Student
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Learn new skillsets
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole("Instructor")}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                        role === "Instructor"
                          ? "border-indigo-500 bg-indigo-500/10 ring-2 ring-indigo-500/20"
                          : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xl mb-1">👨‍🏫</div>
                      <div className="font-bold text-white text-sm">
                        Instructor
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Publish curriculums
                      </div>
                    </button>
                  </div>
                </div>

                {/* NAME FIELD */}
                <div>
                  <label className="block text-sm font-semibold text-slate-300">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    className="mt-1.5 block w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-950/50"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* EMAIL FIELD */}
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-950/50"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-semibold text-slate-300">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 placeholder-slate-600 outline-none transition focus:border-indigo-500 focus:bg-slate-950 focus:ring-4 focus:ring-indigo-950/50"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            {/* ACTION TRIGGER BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-950 hover:from-indigo-500 hover:to-purple-500 transition duration-300 disabled:opacity-50"
            >
              {loading
                ? "Processing Securely..."
                : isRegister
                  ? "Create Secure Account"
                  : "Sign In To Platform"}
            </button>
          </form>

          {/* TOGGLE LINKS */}
          <div className="mt-8 text-center border-t border-slate-800/60 pt-6">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-sm font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              {isRegister
                ? "Already have an account? Sign In"
                : "Don't have an account yet? Create One"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
