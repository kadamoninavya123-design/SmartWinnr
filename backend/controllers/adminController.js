
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");

// Admin Dashboard
const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalRestaurants, totalReviews, ratingStats, ratingDistribution] =
      await Promise.all([
        User.countDocuments(),
        Restaurant.countDocuments(),
        Review.countDocuments(),

        Review.aggregate([
          {
            $group: {
              _id: null,
              averageRating: { $avg: "$rating" }
            }
          }
        ]),

        Review.aggregate([
          {
            $group: {
              _id: "$rating",
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

    const averageRating = ratingStats.length
      ? Number(ratingStats[0].averageRating.toFixed(2))
      : 0;

    const distribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      dashboard: {
        totalUsers,
        totalRestaurants,
        totalReviews,
        averageRating,
        ratingDistribution: distribution
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard",
      error: error.message
    });
  }
};

module.exports = { getAdminDashboard };
