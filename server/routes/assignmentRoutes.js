const express = require("express");
const router = express.Router();
const {
  getCourseAssignments,
  createAssignment,
  submitAssignment,
  gradeSubmission,
  getGlobalAllAssignments,
} = require("../controllers/assignmentController");
const { protect } = require("../middleware/authMiddleware");

router.get("/global/all", protect, getGlobalAllAssignments);

router.get("/:courseId", protect, getCourseAssignments);
router.post("/create", protect, createAssignment);
router.post("/submit", protect, submitAssignment);
router.post("/grade", protect, gradeSubmission);

module.exports = router;
