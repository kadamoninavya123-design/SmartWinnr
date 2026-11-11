
const express = require("express");
const router = express.Router();

const {
  createReview,
  getRestaurantReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview
} = require("../controllers/reviewController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Admin: View all reviews
router.get(
  "/admin/all",
  protect,
  authorizeRoles("admin"),
  getAllReviews
);

// Admin: Remove inappropriate review
router.delete(
  "/admin/:id",
  protect,
  authorizeRoles("admin"),
  adminDeleteReview
);

// Public: View restaurant reviews
router.get("/restaurant/:restaurantId", getRestaurantReviews);

// Customer: View own reviews
router.get(
  "/my-reviews",
  protect,
  authorizeRoles("customer"),
  getMyReviews
);

// Customer: Submit a review
router.post(
  "/",
  protect,
  authorizeRoles("customer"),
  createReview
);

// Customer: Update own review
router.put(
  "/:id",
  protect,
  authorizeRoles("customer"),
  updateReview
);

// Customer: Delete own review
router.delete(
  "/:id",
  protect,
  authorizeRoles("customer"),
  deleteReview
);

module.exports = router;
