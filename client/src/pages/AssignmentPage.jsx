// Location: client/src/pages/AssignmentPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://lms-backend-api-oyv9.onrender.com/api";

export default function AssignmentPage() {
  const { courseId } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [userRole, setUserRole] = useState("Student");
  const [submissionUrls, setSubmissionUrls] = useState({});

  // Instructor Creation States
  const [selectedCourse, setSelectedCourse] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [grades, setGrades] = useState({});

  const getHeaders = () => {
    const token =
      localStorage.getItem("token") || localStorage.getItem("auth-token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("userProfile");
    let currentUserRole = "Student";

    if (storedUser) {
      const parsedProfile = JSON.parse(storedUser);
      currentUserRole = parsedProfile.role || "Student";
      setUserRole(currentUserRole);
    }

    const loadData = async () => {
      try {
        const isGlobalView =
          !courseId ||
          courseId === "all-assignments" ||
          courseId === "undefined";
        const url = isGlobalView
          ? `${BASE_URL}/assignments/global/all`
          : `${BASE_URL}/assignments/${courseId}`;

        const res = await axios.get(url, getHeaders());
        setAssignments(res.data || []);

        if (currentUserRole === "Instructor" || currentUserRole === "Admin") {
          const courseRes = await axios.get(
            `${BASE_URL}/courses`,
            getHeaders(),
          );
          setCourses(courseRes.data || []);

          if (!isGlobalView) {
            setSelectedCourse(courseId);
          }
        }
      } catch (err) {
        console.error("Error populating component dataset balances:", err);
      }
    };

    loadData();
  }, [courseId]);

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    const isGlobalView =
      !courseId || courseId === "all-assignments" || courseId === "undefined";
    const targetCourseId = isGlobalView ? selectedCourse : courseId;

    if (
      !targetCourseId ||
      targetCourseId === "undefined" ||
      targetCourseId === ""
    ) {
      return alert(
        "Please select an active target curriculum pathway course framework.",
      );
    }

    setLoading(true);
    try {
      const payload = { title, description, dueDate, courseId: targetCourseId };
      const res = await axios.post(
        `${BASE_URL}/assignments/create`,
        payload,
        getHeaders(),
      );

      alert("Assignment successfully assigned to class pipeline!");
      setAssignments([res.data, ...assignments]);
      setTitle("");
      setDescription("");
      setDueDate("");
      if (isGlobalView) setSelectedCourse("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to deploy new task block.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmission = async (e, assignmentId) => {
    e.preventDefault();

    // Safety Fallback Check
    if (!assignmentId || assignmentId === "undefined") {
      return alert(
        "Critical Error: Core tracking benchmark assignment reference ID is invalid.",
      );
    }

    const urlToSubmit = submissionUrls[assignmentId];
    if (!urlToSubmit || urlToSubmit.trim() === "") {
      return alert("Please enter a project link before submitting.");
    }

    try {
      const payload = { assignmentId, fileUrl: urlToSubmit };
      await axios.post(`${BASE_URL}/assignments/submit`, payload, getHeaders());

      alert("Assignment milestone submitted successfully! 🎉");
      setSubmissionUrls({ ...submissionUrls, [assignmentId]: "" });
      window.location.reload();
    } catch (err) {
      alert(
        err.response?.data?.message || "Failed to transmit workspace files.",
      );
    }
  };

  const handleGradeSubmit = async (e, assignmentId, studentId) => {
    e.preventDefault();
    const gradeKey = `${assignmentId}-${studentId}`;
    const gradeValue = grades[gradeKey];

    if (!gradeValue || gradeValue.trim() === "") {
      return alert("Please enter a grade score value.");
    }

    try {
      await axios.post(
        `${BASE_URL}/assignments/grade`,
        { assignmentId, studentId, grade: gradeValue },
        getHeaders(),
      );
      alert("Grade submitted successfully! 🎓");
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit grading update.");
    }
  };

  const isInstructor = userRole === "Instructor" || userRole === "Admin";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          Curriculum Assignments Workspace
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Publish test criteria or manage standard homework tasks.
        </p>
      </div>

      {isInstructor && (
        <form
          onSubmit={handleCreateAssignment}
          className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-4"
        >
          <h3 className="text-xs font-black text-indigo-600 tracking-wider uppercase">
            🛠️ Instructor Deck: Deploy New Task Sheet
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!courseId ||
            courseId === "all-assignments" ||
            courseId === "undefined" ? (
              <select
                required
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white"
              >
                <option value="">-- Choose Target Course Sub-path --</option>
                {courses.map((c) => (
                  <option key={c._id || c.id} value={c._id || c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                disabled
                value="Course Context Locked"
                className="px-4 py-2 text-xs border border-slate-100 bg-slate-50 rounded-xl text-slate-400 font-medium"
              />
            )}

            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
            />
          </div>

          <input
            type="text"
            placeholder="Assignment Topic Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
          />

          <textarea
            placeholder="Write out detailed target criteria instructions..."
            required
            rows="4"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Publishing Milestone Task..." : "Publish Assignment"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-700">
          Active Course Benchmarks ({assignments.length})
        </h2>

        {assignments.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center shadow-sm">
            <span className="text-2xl">🎉</span>
            <p className="text-xs font-bold text-slate-400 mt-2">
              Zero outstanding files pending inside this dashboard collection
              track.
            </p>
          </div>
        ) : (
          assignments.map((asm) => {
            // Safe variable resolution for fallback routing ids
            const currentId = asm._id || asm.id;

            const personalSubmission = asm.submissions?.find(
              (sub) =>
                sub.studentId ===
                JSON.parse(localStorage.getItem("userProfile"))?._id,
            );

            return (
              <div
                key={currentId}
                className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm space-y-3 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">
                      {asm.title}
                    </h3>
                    {asm.courseId?.title && (
                      <span className="inline-block mt-1 text-[9px] bg-slate-100 text-slate-600 font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
                        📚 {asm.courseId.title}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-xl">
                    ⏰ Due: {new Date(asm.dueDate).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100 whitespace-pre-wrap">
                  {asm.description}
                </p>

                {/* 👑 INSTRUCTOR SUBMISSION GRADING VIEW PANEL */}
                {isInstructor && (
                  <div className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      📥 Student Submissions ({asm.submissions?.length || 0})
                    </h4>

                    {!asm.submissions || asm.submissions.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">
                        No submissions sent in for this assignment yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {asm.submissions.map((sub) => (
                          <div
                            key={sub.studentId}
                            className="bg-slate-50 border border-slate-100 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                          >
                            <div>
                              <p className="font-semibold text-slate-800">
                                {sub.studentName || "Anonymous Student"}
                              </p>
                              <a
                                href={sub.fileUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-indigo-600 underline text-[11px] hover:text-indigo-800 break-all"
                              >
                                View Project Files Link 🔗
                              </a>
                            </div>

                            {/* Grading Form Form Action */}
                            <form
                              onSubmit={(e) =>
                                handleGradeSubmit(e, asm._id, sub.studentId)
                              }
                              className="flex items-center gap-2"
                            >
                              <input
                                type="text"
                                placeholder={
                                  sub.grade || "Enter Grade (e.g. A, 95%)"
                                }
                                value={
                                  grades[`${asm._id}-${sub.studentId}`] || ""
                                }
                                onChange={(e) =>
                                  setGrades({
                                    ...grades,
                                    [`${asm._id}-${sub.studentId}`]:
                                      e.target.value,
                                  })
                                }
                                className="w-36 px-2 py-1 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:border-indigo-500 text-center"
                              />
                              <button
                                type="submit"
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-bold rounded-lg transition"
                              >
                                {sub.grade ? "Update" : "Grade"}
                              </button>
                            </form>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {!isInstructor && (
                  <div className="pt-2 border-t border-slate-100 mt-2">
                    {personalSubmission ? (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-xl flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold">✅ Submitted Work:</span>{" "}
                          <a
                            href={personalSubmission.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="underline font-medium hover:text-emerald-900"
                          >
                            View Project URL link
                          </a>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                          {personalSubmission.grade || "Un-Graded"}
                        </span>
                      </div>
                    ) : (
                      <form
                        onSubmit={(e) => handleUploadSubmission(e, currentId)}
                        className="flex flex-col sm:flex-row gap-2"
                      >
                        <input
                          type="url"
                          placeholder="Paste your submission link here (e.g., GitHub, Google Drive)..."
                          required
                          value={submissionUrls[currentId] || ""}
                          onChange={(e) =>
                            setSubmissionUrls({
                              ...submissionUrls,
                              [currentId]: e.target.value,
                            })
                          }
                          className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-indigo-500 bg-white"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap cursor-pointer"
                        >
                          Submit Task
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
