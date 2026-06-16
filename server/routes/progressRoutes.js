// Location: server/routes/progress.js
const express = require("express");
const router = express.Router();
const {
  getProgress,
  toggleLectureProgress,
  getAllUserProgress,
} = require("../controllers/progressController");
const { protect } = require("../middleware/authMiddleware"); // Use your existing token validator middleware

router.get("/", protect, getAllUserProgress);
router.post("/:courseId/toggle", protect, toggleLectureProgress);
router.get("/:courseId", protect, getProgress);

module.exports = router;
