const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { protect, authorize } = require("../middleware/authMiddleware");

// Public endpoints
router.post("/register", register);
router.post("/login", login);

// Secure Endpoint Test: Anyone logged in can see their own data
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Welcome to your private profile!",
    user: req.user,
  });
});

// Admin-Only Endpoint Test: Try hitting this as a student to see it block you!
router.get("/admin-dashboard", protect, authorize("Admin"), (req, res) => {
  res.json({ message: "Welcome Master Admin! You have all-access power." });
});

module.exports = router;
