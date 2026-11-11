
const express = require("express");
const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateUserStatus,
  createOwner
} = require("../controllers/userController");

const {
  getAdminDashboard
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// All routes below require Admin access
router.use(protect, authorizeRoles("admin"));

// Admin Dashboard
router.get("/dashboard", getAdminDashboard);

// Create Restaurant Owner
router.post("/owner", createOwner);

// Get all users
router.get("/", getAllUsers);

// Get user by ID
router.get("/:id", getUserById);

// Update user status
router.put("/:id/status", updateUserStatus);

module.exports = router;
