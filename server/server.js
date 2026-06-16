const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// 1. Load our secrets
dotenv.config();

// 2. Connect to the database
connectDB();

const app = express();

// 3. Middlewares (Tools to help express handle data)
app.use(cors()); // Allows our React frontend to talk to this server
app.use(express.json()); // Allows our server to read JSON data sent by users

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/progress", require("./routes/progressRoutes"));
app.use("/api/quizzes", require("./routes/quizRoutes"));
app.use("/api/assignments", require("./routes/assignmentRoutes"));
// 4. Test Route to ensure server works
app.get("/", (req, res) => {
  res.send("LMS Server Engine is running successfully! 🚀");
});

// 5. Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔥 Server listening on port ${PORT}`));
