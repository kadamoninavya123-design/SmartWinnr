
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Customer is required"]
    },

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: [true, "Restaurant is required"]
    },

    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating cannot exceed 5"],
      validate: {
        validator: Number.isInteger,
        message: "Rating must be a whole number"
      }
    },

    reviewText: {
      type: String,
      required: [true, "Review content is required"],
      trim: true,
      minlength: [3, "Review must contain at least 3 characters"],
      maxlength: [1000, "Review cannot exceed 1000 characters"]
    }
  },
  {
    timestamps: true
  }
);

// A customer can review a restaurant only once.
reviewSchema.index(
  { customer: 1, restaurant: 1 },
  { unique: true }
);

reviewSchema.index({ restaurant: 1 });
reviewSchema.index({ customer: 1 });

module.exports = mongoose.model("Review", reviewSchema);
