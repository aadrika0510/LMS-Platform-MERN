import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ProgressTracker from "./pages/ProgressTracker";
import AssignmentPage from "./pages/AssignmentPage";
import SidebarLayout from "./components/SidebarLayout";

function App() {
  // Check if a valid user session profiles exist in storage
  const userExists = localStorage.getItem("userProfile");

  return (
    <Router>
      <div className="min-h-screen bg-gray-50 antialiased selection:bg-blue-100">
        <Routes>
          {/* 🟢 1. Absolute Default Root Path - Loads your new Landing Page */}
          <Route path="/" element={<LandingPage />} />

          {/* Public Login Route (Redirects to dashboard if already logged in) */}
          <Route
            path="/login"
            element={
              !userExists ? <Login /> : <Navigate to="/dashboard" replace />
            }
          />

          {/* 🔒 2. Modernized Protected Layout Route Nesting Architecture */}
          <Route
            element={
              userExists ? <SidebarLayout /> : <Navigate to="/login" replace />
            }
          >
            {/* All routes inside here will render inside your Sidebar Layout automatically via <Outlet /> */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/progress-tracker" element={<ProgressTracker />} />
            <Route
              path="/course/:courseId/assignments"
              element={<AssignmentPage />}
            />
            <Route
              path="/course/all-assignments"
              element={<AssignmentPage />}
            />
          </Route>

          {/* 🟢 3. Corrected Catch-All Fallback Redirect (No more infinite loops!) */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
