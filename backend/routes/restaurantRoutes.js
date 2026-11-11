
const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant
} = require("../controllers/restaurantController");

const {
  assignOwner,
  getOwnerRestaurantReviews
} = require("../controllers/ownerController");

const {
  protect,
  authorizeRoles
} = require("../middleware/authMiddleware");

// Public: Get all restaurants
router.get("/", getRestaurants);

// Owner: View assigned restaurant
router.get(
  "/owner/my-restaurant",
  protect,
  authorizeRoles("owner"),
  getMyRestaurant
);

// Owner: View restaurant reviews and average rating
router.get(
  "/owner/my-reviews",
  protect,
  authorizeRoles("owner"),
  getOwnerRestaurantReviews
);

// Public: Get restaurant by ID
router.get("/:id", getRestaurantById);

// Admin: Create restaurant
router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createRestaurant
);

// Admin: Assign owner to restaurant
router.put(
  "/:id/owner",
  protect,
  authorizeRoles("admin"),
  assignOwner
);

// Owner/Admin: Update restaurant
router.put(
  "/:id",
  protect,
  authorizeRoles("owner", "admin"),
  updateRestaurant
);

// Admin: Deactivate restaurant
router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteRestaurant
);

module.exports = router;
