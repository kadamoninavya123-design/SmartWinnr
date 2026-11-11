
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// @desc Get all users (Admin only)
// @route GET /api/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users"
    });
  }
};

// @desc Get a user by ID (Admin only)
// @route GET /api/users/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }
};

// @desc Activate or deactivate a user (Admin only)
// @route PUT /api/users/:id/status
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false"
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user._id.equals(req.user._id)) {
      return res.status(400).json({
        success: false,
        message: "You cannot deactivate your own account"
      });
    }

    user.isActive = isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID"
    });
  }
};

// @desc Create a Restaurant Owner account (Admin only)
// @route POST /api/users/owner
const createOwner = async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required"
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Validate password
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: "Password must be 8-16 characters and include uppercase, lowercase, number and special character"
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check existing email
    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create owner
    const owner = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "owner",
      phone: phone || "",
      address: address || ""
    });

    res.status(201).json({
      success: true,
      message: "Restaurant Owner account created successfully",
      owner: {
        id: owner._id,
        name: owner.name,
        email: owner.email,
        role: owner.role,
        phone: owner.phone,
        address: owner.address
      }
    });

  } catch (error) {
    console.error("Create Owner Error:", error.message);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to create Restaurant Owner account"
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserStatus,
  createOwner
};
