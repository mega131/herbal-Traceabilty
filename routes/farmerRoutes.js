// backend/routes/farmerRoutes.js
const express = require("express");
const router = express.Router();
const { registerFarmer, addBatch, addLocation, getFarmerBatches, getFarmerByEmail } = require("../controllers/farmerController");

// Register farmer
router.post("/register", registerFarmer);

// Add batch
router.post("/add-batch", addBatch);

// Get farmer's batches
router.get("/:farmerId/batches", getFarmerBatches);

// Get farmer by email
router.get("/lookup/by-email", getFarmerByEmail);

// Update farm location
router.post("/add-location", addLocation);

module.exports = router;
