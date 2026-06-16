import React, { useState } from "react";
import { loginAPI, registerAPI } from "../api";
import { useLocation } from "react-router-dom";

export default function Auth() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const intendedRole = queryParams.get("intent");
  const [isRegister, setIsRegister] = useState(false); // Toggle between Login and Signup view
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
        // Send register payload including selected role card metric
        response = await registerAPI({ ...formData, role });
      } else {
        // Send normal login payload
        response = await loginAPI({
          email: formData.email,
          password: formData.password,
        });
      }
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      const userProfileData = response.data.user || response.data;

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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-slate-50 to-indigo-100 px-4 py-12">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white/80 shadow-2xl shadow-indigo-100/50 border border-white backdrop-blur-xl transition-all duration-500">
        {/* Banner Headers */}
        <div className="bg-gradient-to-br from-indigo-600 to-blue-600 px-8 py-10 text-center text-white relative">
          <div className="absolute inset-0 bg-grid-white/[0.08] [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
          <h2 className="text-3xl font-extrabold tracking-tight relative z-10">
            {isRegister ? "Begin Your Journey" : "Welcome Back"}
          </h2>
          <p className="mt-2 text-sm text-indigo-100/80 relative z-10">
            {isRegister
              ? "Join our global community of learners and educators."
              : "Access your courses, dashboard, and custom toolkits."}
          </p>
        </div>

        {/* Input & Form Container */}
        <div className="p-8 md:p-10">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-sm rounded-2xl font-semibold flex items-center gap-2 animate-pulse">
              <span>⚠️</span> {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isRegister && (
              <>
                {/* Role Switcher Cards */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                    Choose Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setRole("Student")}
                      className={`p-4 rounded-2xl border text-left transition-all duration-300 ${
                        role === "Student"
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xl mb-1">🎓</div>
                      <div className="font-bold text-slate-800 text-sm">
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
                          ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xl mb-1">👨‍🏫</div>
                      <div className="font-bold text-slate-800 text-sm">
                        Instructor
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Publish curriculums
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name Input Field */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <input
                    name="name"
                    type="text"
                    required
                    placeholder="Alex Mercer"
                    className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-600 focus:bg-white focus:ring-4 focus:ring-indigo-100"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>

            {/* Action Trigger Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-blue-700 transition duration-300 disabled:opacity-50"
            >
              {loading
                ? "Processing Securely..."
                : isRegister
                  ? "Create Secure Account"
                  : "Sign In To Platform"}
            </button>
          </form>

          {/* Alternative Toggle Links */}
          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition"
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
