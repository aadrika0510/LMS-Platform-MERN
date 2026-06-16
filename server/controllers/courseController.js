const Course = require("../models/Course");

// @desc    Create a new course
// @route   POST /api/courses
// @access  Private (Instructors/Admins only)
exports.createCourse = async (req, res) => {
  try {
    const { title, description, category, thumbnail, price, sections } =
      req.body;

    // Create the course and automatically assign the logged-in user's ID as the instructor
    const course = new Course({
      title,
      description,
      category,
      thumbnail,
      price,
      sections,
      instructor: req.user._id, // Taken from our protect middleware passport check
    });

    const savedCourse = await course.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
  try {
    // Find all courses and pull the instructor's name and email while ignoring their password
    const courses = await Course.find().populate("instructor", "name email");
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course blueprint
// @route   DELETE /api/courses/:id
exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found in the database network" });
    }

    // SECURITY MIDDLEWARE CHECK: Verify if the logged-in user is the instructor who owns the course
    if (
      course.instructor.toString() !== req.user.id &&
      req.user.role !== "Admin"
    ) {
      return res
        .status(401)
        .json({ message: "Not authorized to delete this course curriculum" });
    }

    // Erase the course blueprint document from your MongoDB cloud cluster
    await Course.findByIdAndDelete(req.params.id);

    return res
      .status(200)
      .json({
        message: "Course removed successfully from the platform network",
      });
  } catch (err) {
    console.error("Error in deleteCourse controller:", err);
    return res
      .status(500)
      .json({ message: "Server error encountered during deletion pipeline" });
  }
};
