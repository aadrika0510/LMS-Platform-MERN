// Location: server/controllers/progressController.js
const Progress = require("../models/Progress");
const QuizSubmission = require("../models/QuizSubmission");
const Course = require("../models/Course");

Progress.collection
  .dropIndex("userId_1_courseId_1")
  .then(() =>
    console.log("✅ Successfully dropped the stale userId unique index rule!"),
  )
  .catch((err) => {
    console.log(
      "ℹ️ Dynamic Index sync: Index not found or already deleted, moving on cleanly.",
    );
  });

Progress.collection.dropIndex("studentId_1_courseId_1").catch(() => {});

// @desc    Get progress details for a specific course
// @route   GET /api/progress/:courseId
exports.getProgress = async (req, res) => {
  try {
    let progress = await Progress.findOne({
      studentId: req.user.id,
      courseId: req.params.courseId,
    });

    // If no progress document exists yet for this student/course combo, create an empty tracker
    if (!progress) {
      progress = await Progress.create({
        studentId: req.user.id,
        courseId: req.params.courseId,
        completedLectures: [],
      });
    }

    return res.status(200).json(progress);
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to retrieve progress tracking links" });
  }
};

// @desc    Get overall progress metrics for all courses enrolled by the student
// @route   GET /api/progress
exports.getAllUserProgress = async (req, res) => {
  try {
    const studentId = req.user.id || req.user._id;

    // 1. Fetch all progress documents for this user and populate course data
    let allProgress = await Progress.find({ studentId }).populate({
      path: "courseId",
      model: "Course", // Ensure this matches your Course model name exactly
    });

    // 2. FALLBACK INJECTION: If the student has zero trackers created yet, build dummy 0% tracks on the fly!
    if (!allProgress || allProgress.length === 0) {
      const allSystemCourses = await Course.find({});

      allProgress = allSystemCourses.map((course) => ({
        _id: `temp_${course._id}`,
        courseId: course,
        completedLectures: [],
        completedQuizzes: [],
      }));
    }

    // 🟢 CRITICAL FIX: Loop through each progress document and inject the real passed quizzes array from QuizSubmissions!
    const updatedProgressWithQuizzes = await Promise.all(
      allProgress.map(async (prog) => {
        // Handle both standard Mongoose documents and lean fallback objects safely
        const progressObj =
          typeof prog.toObject === "function" ? prog.toObject() : prog;

        // Extract the course ID value depending on whether it's populated or an ID string
        const targetCourseId =
          progressObj.courseId?._id || progressObj.courseId;

        // Query the QuizSubmission collection for unique quizzes cleared by this user for this specific course
        const distinctPassedQuizzes = await QuizSubmission.distinct("quizId", {
          userId: studentId,
          courseId: targetCourseId,
          isPassed: true,
        });

        return {
          ...progressObj,
          // 🏁 This guarantees prog.completedQuizzes.length works perfectly on Line 277!
          completedQuizzes: distinctPassedQuizzes || [],
        };
      }),
    );

    // Send the cleanly aggregated metrics array straight to your ProgressTracker component loop
    return res.status(200).json(updatedProgressWithQuizzes);
  } catch (err) {
    console.error("Error retrieving overall analytics datasets:", err);
    return res.status(500).json({
      message: "Failed to retrieve total user milestone progress analytics",
    });
  }
};

// Location: server/controllers/progressController.js

exports.toggleLectureProgress = async (req, res) => {
  const lectureId = req.body.lectureId || req.query.lectureId;
  const courseId = req.params.courseId;

  if (!lectureId) {
    return res.status(400).json({ message: "Missing lectureId parameter" });
  }

  try {
    // 🛡️ Safe Extraction: Grab the user ID string from whatever property your auth middleware uses
    const rawUserId = req.user ? req.user.id || req.user._id : null;

    if (!rawUserId) {
      return res
        .status(401)
        .json({ message: "User authentication credentials not found" });
    }

    const studentIdString = rawUserId.toString();

    // Look up progress matching your exact database schema model variables
    let progress = await Progress.findOne({
      studentId: studentIdString,
      courseId: courseId,
    });

    // If no document tracking layer is set up yet, initialize a fresh blueprint row safely
    if (!progress) {
      progress = new Progress({
        studentId: studentIdString,
        courseId: courseId,
        completedLectures: [],
      });
    }

    // Standardize your comparison variables to clean arrays of strings
    const targetLectureId = lectureId.toString();
    const completedStrings = (progress.completedLectures || []).map((id) =>
      id.toString(),
    );

    const index = completedStrings.indexOf(targetLectureId);

    if (index > -1) {
      // Toggle off: If it was already completed, remove it from the database list
      progress.completedLectures.splice(index, 1);
    } else {
      // Toggle on: Add the string version directly to your database tracker tracking array
      progress.completedLectures.push(targetLectureId);
    }

    await progress.save();
    return res.status(200).json(progress);
  } catch (err) {
    // This console error log prints out exactly what went wrong inside your terminal window
    console.error("Critical tracking controller error exception:", err);
    return res.status(500).json({
      message: "Internal server error processing completion checkpoint",
    });
  }
};

exports.getProgressTrackerData = async (req, res) => {
  try {
    // 1. Identify the logged-in student using your auth middleware token info
    const studentId = req.user.id || req.user._id;

    // 2. Fetch all raw core course progressions for this student
    const progressRecords = await Progress.find({
      studentId: studentId,
    }).lean();

    // 🟢 STEP 3 INTEGRATION: Match and inject independent submission counts dynamically
    const formatProgressionMetrics = await Promise.all(
      progressRecords.map(async (prog) => {
        // Find how many unique quizzes this specific student successfully cleared for THIS course
        const distinctPassedQuizzes = await QuizSubmission.distinct("quizId", {
          userId: studentId,
          courseId: prog.courseId,
          isPassed: true,
        });

        return {
          ...prog,
          // Fallback array mapping to guarantee your frontend .length check on line 277 doesn't break!
          completedQuizzes: distinctPassedQuizzes || [],
        };
      }),
    );

    // Send the cleanly aggregated metrics array straight to your ProgressTracker component loop
    return res.status(200).json(formatProgressionMetrics);
  } catch (err) {
    console.error("Error aggregating dashboard progress metrics:", err);
    return res.status(500).json({ message: "Internal server tracking error." });
  }
};
