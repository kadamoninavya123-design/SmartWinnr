
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");

// @desc Submit a restaurant review
// @route POST /api/reviews
// @access Customer
const createReview = async (req, res) => {
  try {
    const { restaurantId, rating, reviewText } = req.body;

    if (!restaurantId || rating === undefined || !reviewText) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID, rating and review content are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID"
      });
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be a whole number between 1 and 5"
      });
    }

    if (
      typeof reviewText !== "string" ||
      reviewText.trim().length < 3 ||
      reviewText.trim().length > 1000
    ) {
      return res.status(400).json({
        success: false,
        message: "Review must contain 3 to 1000 characters"
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: restaurantId,
      isActive: true
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const existingReview = await Review.findOne({
      customer: req.user._id,
      restaurant: restaurantId
    });

    if (existingReview) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this restaurant. Update your existing review instead."
      });
    }

    const review = await Review.create({
      customer: req.user._id,
      restaurant: restaurantId,
      rating,
      reviewText: reviewText.trim()
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "You have already reviewed this restaurant"
      });
    }

    console.error("Create Review Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to submit review"
    });
  }
};


// @desc Get all reviews for a restaurant
// @route GET /api/reviews/restaurant/:restaurantId
// @access Public
const getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID"
      });
    }

    const restaurant = await Restaurant.findById(restaurantId);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const reviews = await Review.find({
      restaurant: restaurantId
    })
      .populate("customer", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error("Get Restaurant Reviews Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch reviews"
    });
  }
};


// @desc Get logged-in customer's reviews
// @route GET /api/reviews/my-reviews
// @access Customer
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({
      customer: req.user._id
    })
      .populate("restaurant", "name location cuisine")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error("Get My Reviews Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch your reviews"
    });
  }
};


// @desc Update customer's own review
// @route PUT /api/reviews/:id
// @access Customer
const updateReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID"
      });
    }

    const { rating, reviewText } = req.body;

    if (rating === undefined && reviewText === undefined) {
      return res.status(400).json({
        success: false,
        message: "Provide a rating or review content to update"
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    if (!review.customer.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own review"
      });
    }

    if (rating !== undefined) {
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          message: "Rating must be a whole number between 1 and 5"
        });
      }

      review.rating = rating;
    }

    if (reviewText !== undefined) {
      if (
        typeof reviewText !== "string" ||
        reviewText.trim().length < 3 ||
        reviewText.trim().length > 1000
      ) {
        return res.status(400).json({
          success: false,
          message: "Review must contain 3 to 1000 characters"
        });
      }

      review.reviewText = reviewText.trim();
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review
    });

  } catch (error) {
    console.error("Update Review Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to update review"
    });
  }
};


// @desc Delete customer's own review
// @route DELETE /api/reviews/:id
// @access Customer
const deleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID"
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    if (!review.customer.equals(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own review"
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Delete Review Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to delete review"
    });
  }
};


// @desc Admin: View all reviews
// @route GET /api/reviews/admin/all
// @access Admin
const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("customer", "name email")
      .populate("restaurant", "name location cuisine")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });

  } catch (error) {
    console.error("Get All Reviews Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch all reviews"
    });
  }
};


// @desc Admin: Remove an inappropriate review
// @route DELETE /api/reviews/admin/:id
// @access Admin
const adminDeleteReview = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid review ID"
      });
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found"
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      message: "Review removed successfully by Admin"
    });

  } catch (error) {
    console.error("Admin Delete Review Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to remove review"
    });
  }
};


module.exports = {
  createReview,
  getRestaurantReviews,
  getMyReviews,
  updateReview,
  deleteReview,
  getAllReviews,
  adminDeleteReview
};
