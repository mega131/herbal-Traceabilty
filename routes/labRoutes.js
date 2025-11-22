// backend/routes/labRoutes.js
const express = require("express");
const router = express.Router();
const { 
  createLabTest, 
  getLabTests, 
  getLabTestById, 
  updateLabTest, 
  getBatchesForTesting 
} = require("../controllers/labController");

// ----------------------
// POST /api/lab/test
// Create a new lab test
// ----------------------
router.post("/test", createLabTest);

// ----------------------
// GET /api/lab/tests
// Get all lab tests
// ----------------------
router.get("/tests", getLabTests);

// ----------------------
// GET /api/lab/batches-for-testing
// Get batches ready for lab testing
// ----------------------
router.get("/batches-for-testing", getBatchesForTesting);

// ----------------------
// GET /api/lab/test/:testId
// Get lab test by ID
// ----------------------
router.get("/test/:testId", getLabTestById);

// ----------------------
// PUT /api/lab/test/:testId
// Update lab test
// ----------------------
router.put("/test/:testId", updateLabTest);

module.exports = router;
