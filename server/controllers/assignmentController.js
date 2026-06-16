// Location: server/controllers/assignmentController.js
const Assignment = require("../models/Assignment");

// 1. Get all assignments for a specific course
exports.getCourseAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find({
      courseId: req.params.courseId,
    });
    return res.status(200).json(assignments);
  } catch (err) {
    return res.status(500).json({ message: "Failed to load assignments" });
  }
};

// 2. [Instructor Only] Create a brand new assignment
exports.createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;

    const newAssignment = new Assignment({
      courseId,
      title,
      description,
      dueDate,
    });

    await newAssignment.save();
    return res.status(201).json(newAssignment);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create assignment" });
  }
};

// 3. [Student Only] Submit a solution link

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId, fileUrl } = req.body;
    const studentId = req.user.id; // Extracted from your auth middleware protect token
    const studentName = req.user.name;

    if (!fileUrl) {
      return res
        .status(400)
        .json({ message: "Please provide a valid project URL link." });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment target not found." });
    }

    // Optional: Check if student already submitted to overwrite or prevent multiple uploads
    const alreadySubmitted = assignment.submissions.find(
      (sub) => sub.studentId.toString() === studentId.toString(),
    );

    if (alreadySubmitted) {
      // Update existing submission link
      alreadySubmitted.fileUrl = fileUrl;
      alreadySubmitted.submittedAt = Date.now();
    } else {
      // Add a fresh submission block
      assignment.submissions.push({
        studentId,
        studentName,
        fileUrl,
      });
    }

    await assignment.save();
    return res
      .status(200)
      .json({ message: "Assignment submitted successfully!", assignment });
  } catch (err) {
    console.error("Submission crash error:", err);
    return res
      .status(500)
      .json({ message: "Internal server error saving submission." });
  }
};

// Add to assignmentController.js
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, studentId, grade } = req.body;

    if (!assignmentId || !studentId || !grade) {
      return res
        .status(400)
        .json({ message: "Missing required grading fields." });
    }

    // Find the assignment
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found." });
    }

    // Find the specific student's submission in the array
    const submission = assignment.submissions.find(
      (sub) => sub.studentId.toString() === studentId.toString(),
    );

    if (!submission) {
      return res.status(404).json({ message: "Student submission not found." });
    }

    // Update the grade field
    submission.grade = grade;
    await assignment.save();

    res
      .status(200)
      .json({ message: "Grade updated successfully!", assignment });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Server error during grading.", error: err.message });
  }
};
// Location: server/controllers/assignmentController.js

// Get all assignments across all courses for the global sidebar view
exports.getGlobalAllAssignments = async (req, res) => {
  try {
    // Finds all documents and dynamically attaches the course title for UI context
    const assignments = await Assignment.find({}).populate("courseId", "title");
    return res.status(200).json(assignments);
  } catch (err) {
    console.error("Error retrieving global assignment collection:", err);
    return res
      .status(500)
      .json({ message: "Failed to load global assignments catalog" });
  }
};
