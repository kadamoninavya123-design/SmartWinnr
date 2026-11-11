
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const Review = require("../models/Review");

// Admin: Assign owner to restaurant
const assignOwner = async (req, res) => {
  try {
    const { ownerId } = req.body;
    const { id } = req.params;

    if (!ownerId) {
      return res.status(400).json({
        success: false,
        message: "Owner ID is required"
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const owner = await User.findById(ownerId);

    if (!owner || owner.role !== "owner" || !owner.isActive) {
      return res.status(400).json({
        success: false,
        message: "Valid active Restaurant Owner account not found"
      });
    }

    restaurant.owner = owner._id;
    await restaurant.save();

    res.status(200).json({
      success: true,
      message: "Restaurant Owner assigned successfully",
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        owner: {
          id: owner._id,
          name: owner.name,
          email: owner.email
        }
      }
    });

  } catch (error) {
    console.error("Assign Owner Error:", error.message);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID or owner ID"
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to assign Restaurant Owner"
    });
  }
};


// Owner: View restaurant reviews and average rating
const getOwnerRestaurantReviews = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
      isActive: true
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No assigned restaurant found"
      });
    }

    const reviews = await Review.find({
      restaurant: restaurant._id
    })
      .populate("customer", "name email")
      .sort({ createdAt: -1 });

    const ratingSummary = await Review.aggregate([
      {
        $match: {
          restaurant: restaurant._id
        }
      },
      {
        $group: {
          _id: "$restaurant",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    const summary = ratingSummary.length > 0
      ? ratingSummary[0]
      : { averageRating: 0, totalReviews: 0 };

    res.status(200).json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name
      },
      averageRating: Number(summary.averageRating.toFixed(2)),
      totalReviews: summary.totalReviews,
      reviews
    });

  } catch (error) {
    console.error("Owner Reviews Error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant reviews"
    });
  }
};

module.exports = {
  assignOwner,
  getOwnerRestaurantReviews
};
