// backend/seeder.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Agency = require("./models/Agency");

dotenv.config({ path: path.resolve(__dirname, ".env") });

const connectDB = require("./config/db");

connectDB();

const seedAgency = async () => {
  try {
    const existing = await Agency.findOne({ email: "agency@example.com" });
    if (existing) return console.log("✅ Default agency already exists");

    const agency = new Agency({
      name: "Green Supply Agency",
      email: "agency@example.com",
      password: "agency123",
      contactNumber: "9123456789",
      location: { latitude: 12.96, longitude: 77.60 }
    });

    await agency.save();
    console.log("✅ Default agency seeded!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedAgency();
