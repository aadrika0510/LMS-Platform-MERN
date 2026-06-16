// Location: client/src/components/CourseBuilder.jsx
import React, { useState } from "react";
import { createCourseAPI } from "../api";
import QuizForm from "../components/QuizForm";
import axios from "axios";

export default function CourseBuilder({ onCourseCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Web Development");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Dynamic state to hold nested sections and their respective lectures
  const [sections, setSections] = useState([
    {
      title: "Module 1: Getting Started",
      lectures: [
        {
          title: "1.1 Introduction Lecture",
          duration: "10",
          videoUrl: "",
          summary: "",
        },
      ],
      quizQuestions: [],
    },
  ]);

  // Handler to add a completely new module section block
  const addSection = () => {
    setSections([
      ...sections,
      {
        title: `Module ${sections.length + 1}: New Section`,
        lectures: [],
        quizQuestions: [],
      },
    ]);
  };

  // Handler to append a new video lecture link input to a specific section index
  const addLecture = (sectionIndex) => {
    const updatedSections = [...sections];
    updatedSections[sectionIndex].lectures.push({
      title: `Lecture ${updatedSections[sectionIndex].lectures.length + 1}`,
      duration: "10",
      videoUrl: "",
      summary: "",
    });
    setSections(updatedSections);
  };

  // Synchronize changes made inside text inputs directly to the state arrays
  const handleSectionTitleChange = (index, value) => {
    const updatedSections = [...sections];
    updatedSections[index].title = value;
    setSections(updatedSections);
  };

  const handleLectureChange = (secIndex, lecIndex, field, value) => {
    const updatedSections = [...sections];
    updatedSections[secIndex].lectures[lecIndex][field] = value;
    setSections(updatedSections);
  };

  // Remove a section or lecture if the instructor changes their mind
  const removeSection = (index) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const removeLecture = (secIndex, lecIndex) => {
    const updatedSections = [...sections];
    updatedSections[secIndex].lectures = updatedSections[
      secIndex
    ].lectures.filter((_, i) => i !== lecIndex);
    setSections(updatedSections);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Prepare clean sections layout for the main course object
    const cleanSections = sections.map((sec) => ({
      title: sec.title,
      lectures: sec.lectures,
    }));

    const coursePayload = {
      title,
      description,
      category,
      thumbnail: thumbnail || "default-course.jpg",
      price: Number(price) || 0,
      sections: cleanSections, // Sends only what CourseSchema natively supports
    };

    try {
      // 🟢 Step 1: Save the course to MongoDB first
      const courseResponse = await createCourseAPI(coursePayload);

      // Extract the real database-generated Course Document and its _id
      const savedCourse = courseResponse.data;
      const savedCourseId = savedCourse?._id || savedCourse?.id;

      // 🟢 Step 2: Extract quiz questions from your form and send them to the standalone collection
      // Loop through the local form sections state array
      for (let i = 0; i < sections.length; i++) {
        const currentFormSection = sections[i];

        // Check if the instructor actually built questions for this section
        if (
          currentFormSection.quizQuestions &&
          currentFormSection.quizQuestions.length > 0
        ) {
          // Match it with the corresponding database-generated section sub-document _id
          const savedSectionId =
            savedCourse?.sections?.[i]?._id || `section_idx_${i}`;

          const quizPayload = {
            courseId: savedCourseId, // Dynamic MongoDB references linked!
            sectionId: savedSectionId,
            title: `${currentFormSection.title} Assessment`,
            passingPercentage: 70,
            questions: currentFormSection.quizQuestions.map((q) => ({
              questionText: q.questionText,
              options: q.options,
              correctOptionIndex: q.correctOptionIndex,
            })),
          };

          // Send an independent POST to populate your empty quizzes collection
          const token =
            localStorage.getItem("token") || localStorage.getItem("auth-token");
          await axios.post(
            "http://localhost:5000/api/quizzes/create",
            quizPayload,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        }
      }

      setMessage(
        "🎉 Course and matching assessment entries published successfully!",
      );

      // Reset inputs
      setTitle("");
      setDescription("");
      setPrice("");
      setThumbnail("");
      setSections([
        {
          title: "Module 1: Getting Started",
          lectures: [
            {
              title: "1.1 Introduction Lecture",
              duration: "10",
              videoUrl: "",
              summary: "",
            },
          ],
          quizQuestions: [],
        },
      ]);

      if (onCourseCreated) onCourseCreated();
    } catch (err) {
      console.error("Error finalizing course building synchronization:", err);
      setMessage(
        err.response?.data?.message || "Failed to publish curriculum layout.",
      );
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-white/80 rounded-3xl p-6 md:p-8 shadow-xl border border-slate-100 backdrop-blur-xl mb-10">
      <div className="flex items-center gap-3 mb-6">
        <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl text-xl">
          🛠️
        </span>
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">
            Create a New Curriculum
          </h2>
          <p className="text-xs text-slate-500">
            Draft your course core details and attach live video modules below.
          </p>
        </div>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 text-sm font-semibold rounded-2xl border ${
            message.includes("successfully")
              ? "bg-emerald-50 border-emerald-100 text-emerald-600"
              : "bg-rose-50 border-rose-100 text-rose-600"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Course Title
            </label>
            <input
              type="text"
              required
              placeholder="Advanced Full-Stack Engineering"
              className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Category
            </label>
            <select
              className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option>Web Development</option>
              <option>Data Science</option>
              <option>Mobile Apps</option>
              <option>Design & UI/UX</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700">
            Course Description
          </label>
          <textarea
            rows="2"
            required
            placeholder="Provide an actionable structural abstract of what students will accomplish..."
            className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Price (₹ INR)
            </label>
            <input
              type="number"
              required
              placeholder="2499"
              min="0"
              className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700">
              Thumbnail Link
            </label>
            <input
              type="text"
              placeholder="Paste image address path..."
              className="mt-1.5 block w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-800 outline-none focus:border-indigo-600 focus:bg-white transition"
              value={thumbnail}
              onChange={(e) => setThumbnail(e.target.value)}
            />
          </div>
        </div>

        {/* Syllabus Curriculum Modules */}
        <div className="pt-4 border-t border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                Syllabus Curriculum Modules
              </h3>
              <p className="text-xs text-slate-400">
                Map out section folders and link specific video items below.
              </p>
            </div>
            <button
              type="button"
              onClick={addSection}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100/80 px-3 py-1.5 rounded-xl transition"
            >
              ＋ Add Module Section
            </button>
          </div>

          <div className="space-y-4">
            {sections.map((section, secIndex) => (
              <div
                key={secIndex}
                className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/30 space-y-4 relative"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Section Title..."
                    className="bg-white px-3 py-1.5 font-bold text-slate-800 text-sm border border-slate-200 rounded-xl outline-none focus:border-indigo-600 flex-1"
                    value={section.title}
                    onChange={(e) =>
                      handleSectionTitleChange(secIndex, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    onClick={() => removeSection(secIndex)}
                    className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1"
                  >
                    Delete Section
                  </button>
                </div>

                {/* Video lectures block */}
                <div className="pl-4 border-l-2 border-slate-100 space-y-3">
                  {section.lectures.map((lecture, lecIndex) => (
                    <div
                      key={lecIndex}
                      className="bg-white p-4 rounded-xl border border-slate-200/60 shadow-sm space-y-3 relative"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          Lecture Track Item #{lecIndex + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeLecture(secIndex, lecIndex)}
                          className="text-[11px] text-rose-500 font-semibold hover:underline"
                        >
                          Remove Link
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <input
                          type="text"
                          required
                          placeholder="Lecture Title (e.g., 1.1 Intro)"
                          className="px-3 py-2 text-xs border border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:bg-white"
                          value={lecture.title}
                          onChange={(e) =>
                            handleLectureChange(
                              secIndex,
                              lecIndex,
                              "title",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="number"
                          required
                          placeholder="Duration (Mins)"
                          className="px-3 py-2 text-xs border border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:bg-white"
                          value={lecture.duration}
                          onChange={(e) =>
                            handleLectureChange(
                              secIndex,
                              lecIndex,
                              "duration",
                              e.target.value,
                            )
                          }
                        />
                        <input
                          type="text"
                          required
                          placeholder="Video URL Link (Direct .mp4)"
                          className="px-3 py-2 text-xs border border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:bg-white"
                          value={lecture.videoUrl}
                          onChange={(e) =>
                            handleLectureChange(
                              secIndex,
                              lecIndex,
                              "videoUrl",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                      <input
                        type="text"
                        required
                        placeholder="Brief objective summary overview detail..."
                        className="w-full px-3 py-2 text-xs border border-slate-100 rounded-xl bg-slate-50/50 outline-none focus:bg-white"
                        value={lecture.summary}
                        onChange={(e) =>
                          handleLectureChange(
                            secIndex,
                            lecIndex,
                            "summary",
                            e.target.value,
                          )
                        }
                      />
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLecture(secIndex)}
                    className="mt-2 text-[11px] font-bold text-indigo-600 hover:underline flex items-center gap-1"
                  >
                    📂 ＋ Connect Video Lecture link to this module
                  </button>
                </div>

                {/* Inline Quiz Section */}
                <div className="mt-4 border-t border-slate-100 pt-4">
                  <QuizForm
                    questions={section.quizQuestions || []}
                    setQuestions={(updatedQuestions) => {
                      const updatedSections = [...sections];
                      updatedSections[secIndex].quizQuestions =
                        updatedQuestions;
                      setSections(updatedSections);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Submission Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600 text-sm font-bold text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition duration-300 disabled:opacity-50"
        >
          {loading ? "Publishing Launch Layout..." : "Publish Course Blueprint"}
        </button>
      </form>
    </div>
  );
}
