
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("./config/db");

const fixUserIndex = async () => {
  try {
    await connectDB();

    console.log("Connected database:", mongoose.connection.name);

    const indexes = await mongoose.connection
      .collection("users")
      .indexes();

    console.log("Existing indexes:");
    console.log(indexes.map(index => index.name));

    const mobileIndexExists = indexes.some(
      index => index.name === "mobile_1"
    );

    if (mobileIndexExists) {
      await mongoose.connection
        .collection("users")
        .dropIndex("mobile_1");

      console.log("Old mobile_1 index removed successfully.");
    } else {
      console.log("mobile_1 index was not found.");
    }

  } catch (error) {
    console.error("Index fix failed:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
  }
};

fixUserIndex();
