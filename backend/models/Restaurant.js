
const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Restaurant name is required"],
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: ""
    },

    cuisine: {
      type: String,
      required: [true, "Cuisine is required"],
      trim: true
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    },

    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true
    },

    phone: {
      type: String,
      trim: true,
      default: ""
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: ""
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

restaurantSchema.index({ name: 1 });
restaurantSchema.index({ location: 1 });
restaurantSchema.index({ cuisine: 1 });

module.exports = mongoose.model("Restaurant", restaurantSchema);
