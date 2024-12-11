// authRoutes.js
const express = require("express");
const { register, login, updateUser } = require("../controllers/authController");
const { verifyToken, verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

/**
 * @route POST /api/auth/signup
 * @desc User registration
 * @access Public
 */
router.post("/signup", async (req, res) => {
  console.log("New user registration attempt.");
  try {
    await register(req, res);
  } catch (error) {
    console.error("Signup error:", error.message);
    res.status(500).json({ message: "Error during user signup.", error: error.message });
  }
});

/**
 * @route POST /api/auth/login
 * @desc User login (Regular users)
 * @access Public
 */
router.post("/login", async (req, res) => {
  console.log("User login attempt.");
  try {
    req.body.isAdmin = false; // For regular users
    await login(req, res);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Login failed.", error: error.message });
  }
});

/**
 * @route POST /api/auth/admin/login
 * @desc Admin login
 * @access Public
 */
router.post("/admin/login", async (req, res) => {
  console.log("Admin login attempt.");
  try {
    req.body.isAdmin = true; // For admin users
    await login(req, res);
  } catch (error) {
    console.error("Admin login error:", error.message);
    res.status(500).json({ message: "Admin login failed.", error: error.message });
  }
});

/**
 * @route PUT /api/auth/update
 * @desc Update user profile
 * @access Private (requires valid token)
 */
router.put("/update", verifyToken, async (req, res) => {
  console.log(`Profile update attempt by user ID: ${req.user._id}`);
  try {
    await updateUser(req, res);
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ message: "Failed to update profile.", error: error.message });
  }
});

/**
 * @route PUT /api/auth/admin/update
 * @desc Update user profile (Admin only)
 * @access Private (Admin-only)
 */
router.put("/admin/update", verifyAdmin, async (req, res) => {
  console.log(`Admin profile update attempt: User ID ${req.user._id}`);
  try {
    await updateUser(req, res);
  } catch (error) {
    console.error("Admin update error:", error.message);
    res.status(500).json({ message: "Admin profile update failed.", error: error.message });
  }
});

module.exports = router;
