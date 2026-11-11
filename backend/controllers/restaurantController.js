
const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const Review = require("../models/Review");
const User = require("../models/User");

const isValidId = (id) => mongoose.isValidObjectId(id);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Calculate average rating and review count using MongoDB aggregation
const addRatingStats = async (restaurants) => {
  if (!restaurants || restaurants.length === 0) {
    return [];
  }

  const restaurantIds = restaurants.map((restaurant) => restaurant._id);

  const ratingStats = await Review.aggregate([
    {
      $match: {
        restaurant: { $in: restaurantIds }
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

  const statsMap = new Map(
    ratingStats.map((item) => [
      item._id.toString(),
      {
        averageRating: Number(item.averageRating.toFixed(1)),
        totalReviews: item.totalReviews
      }
    ])
  );

  return restaurants.map((restaurant) => {
    const data = restaurant.toObject
      ? restaurant.toObject()
      : restaurant;

    const stats = statsMap.get(restaurant._id.toString());

    return {
      ...data,
      averageRating: stats ? stats.averageRating : null,
      totalReviews: stats ? stats.totalReviews : 0
    };
  });
};

// ADMIN: Create restaurant
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      description,
      cuisine,
      location,
      address,
      phone,
      email,
      owner
    } = req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof cuisine !== "string" ||
      !cuisine.trim() ||
      typeof location !== "string" ||
      !location.trim() ||
      typeof address !== "string" ||
      !address.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Name, cuisine, location and address are required"
      });
    }

    let ownerId = null;

    if (owner) {
      if (!isValidId(owner)) {
        return res.status(400).json({
          success: false,
          message: "Invalid owner ID"
        });
      }

      const ownerUser = await User.findById(owner);

      if (!ownerUser || ownerUser.role !== "owner") {
        return res.status(400).json({
          success: false,
          message: "Please provide a valid restaurant owner"
        });
      }

      ownerId = ownerUser._id;
    }

    const restaurant = await Restaurant.create({
      name: name.trim(),
      description,
      cuisine: cuisine.trim(),
      location: location.trim(),
      address: address.trim(),
      phone,
      email,
      owner: ownerId
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant
    });
  } catch (error) {
    console.error("Create restaurant:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Restaurant already exists"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create restaurant"
    });
  }
};

// PUBLIC: View and search restaurants
const getRestaurants = async (req, res) => {
  try {
    const { search, location, cuisine } = req.query;

    const filter = { isActive: true };

    if (search?.trim()) {
      filter.name = {
        $regex: escapeRegex(search.trim()),
        $options: "i"
      };
    }

    if (location?.trim()) {
      filter.location = {
        $regex: escapeRegex(location.trim()),
        $options: "i"
      };
    }

    if (cuisine?.trim()) {
      filter.cuisine = {
        $regex: escapeRegex(cuisine.trim()),
        $options: "i"
      };
    }

    const restaurants = await Restaurant.find(filter)
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    const restaurantsWithRatings = await addRatingStats(restaurants);

    return res.status(200).json({
      success: true,
      count: restaurantsWithRatings.length,
      restaurants: restaurantsWithRatings
    });
  } catch (error) {
    console.error("Get restaurants:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants"
    });
  }
};

// PUBLIC: View one restaurant
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID"
      });
    }

    const restaurant = await Restaurant.findOne({
      _id: id,
      isActive: true
    }).populate("owner", "name email");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    const [restaurantWithRating] = await addRatingStats([restaurant]);

    return res.status(200).json({
      success: true,
      restaurant: restaurantWithRating
    });
  } catch (error) {
    console.error("Get restaurant:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant"
    });
  }
};

// OWNER: View assigned restaurant
const getMyRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      owner: req.user._id,
      isActive: true
    }).populate("owner", "name email");

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "No restaurant assigned to your account"
      });
    }

    const [restaurantWithRating] = await addRatingStats([restaurant]);

    return res.status(200).json({
      success: true,
      restaurant: restaurantWithRating
    });
  } catch (error) {
    console.error("Get my restaurant:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch assigned restaurant"
    });
  }
};

// OWNER / ADMIN: Update restaurant
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID"
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    // Owner can update only their own restaurant
    if (
      req.user.role === "owner" &&
      restaurant.owner?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You cannot update another owner's restaurant"
      });
    }

    const allowedFields = [
      "name",
      "description",
      "cuisine",
      "location",
      "address",
      "phone",
      "email"
    ];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        restaurant[field] = req.body[field];
      }
    }

    // Only admin can change restaurant ownership
    if (req.user.role === "admin" && req.body.owner !== undefined) {
      if (req.body.owner === null || req.body.owner === "") {
        restaurant.owner = null;
      } else {
        if (!isValidId(req.body.owner)) {
          return res.status(400).json({
            success: false,
            message: "Invalid owner ID"
          });
        }

        const ownerUser = await User.findById(req.body.owner);

        if (!ownerUser || ownerUser.role !== "owner") {
          return res.status(400).json({
            success: false,
            message: "Please provide a valid owner"
          });
        }

        restaurant.owner = ownerUser._id;
      }
    }

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant
    });
  } catch (error) {
    console.error("Update restaurant:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update restaurant"
    });
  }
};

// ADMIN: Deactivate restaurant
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID"
      });
    }

    const restaurant = await Restaurant.findById(id);

    if (!restaurant || !restaurant.isActive) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found"
      });
    }

    restaurant.isActive = false;
    await restaurant.save();

    return res.status(200).json({
      success: true,
      message: "Restaurant deactivated successfully"
    });
  } catch (error) {
    console.error("Delete restaurant:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to deactivate restaurant"
    });
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant
};
