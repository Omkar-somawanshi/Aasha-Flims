const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  createTicket,
  updateProfile,
} = require("../controllers/userController");
const userAuth = require("../middleware/userAuth");
// Middleware for handling file uploads
const uploadMiddleware = require("../middleware/imgUpload");

const router = express.Router();

// Route for user registration
router.post("/register", registerUser);

// Route for user login
router.post("/login", loginUser);

// Route to get user profile (protected)
router.get("/profile", userAuth, getUserProfile);

// Route to create a ticket
router.post("/createTicket", createTicket);

// Route to update user profile (protected)
router.put("/profile", userAuth, updateProfile);

module.exports = router;
