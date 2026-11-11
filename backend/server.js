
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

// Database connection
const connectDB = require("./config/db");

// Routes
const authRoutes = require("./routes/authRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const userRoutes = require("./routes/userRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Load environment variables
dotenv.config();

// Initialize Express application
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API welcome route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Smart Winnr Restaurant Rating and Review Platform API"
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Winnr Backend is Running",
    database: "Connected"
  });
});

// Authentication routes
app.use("/api/auth", authRoutes);

// Restaurant management routes
app.use("/api/restaurants", restaurantRoutes);

// User management routes (Admin)
app.use("/api/users", userRoutes);

// Review management routes
app.use("/api/reviews", reviewRoutes);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);

  res.status(500).json({
    success: false,
    message: "Internal Server Error"
  });
});

// Server port
const PORT = process.env.PORT || 5000;

// Connect MongoDB and start server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log("Smart Winnr API is ready!");
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

// Start application
startServer();
