const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware 1: Verify if the user is logged in at all
const protect = async (req, res, next) => {
  let token;

  // Check if the request contains a Bearer token in the Headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Extract the token string out of "Bearer <TOKEN>"
      token = req.headers.authorization.split(" ")[1];

      // Decode the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user in the database and attach their data to the "req" object (excluding password)
      req.user = await User.findById(decoded.id).select("-password");

      // Move to the next step/function
      return next();
    } catch (error) {
      return res
        .status(401)
        .json({ message: "Not authorized, token validation failed" });
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
};

// Middleware 2: Restrict access based on specific account roles
const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if the user object exists and matches one of the allowed roles
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user?.role || "Guest"}' is not authorized to access this resource.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
