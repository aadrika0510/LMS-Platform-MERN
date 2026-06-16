const express = require("express");
const router = express.Router();
const {
  createCourse,
  getCourses,
  deleteCourse,
} = require("../controllers/courseController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Anyone can view the course list
router.get("/", getCourses);

// ONLY logged-in users who are Instructors or Admins can create a course
router.post("/", protect, authorize("Instructor", "Admin"), createCourse);

// ONLY logged-in users who are Instructors or Admins can delete a course
router.delete("/:id", protect, authorize("Instructor", "Admin"), deleteCourse);

module.exports = router;
