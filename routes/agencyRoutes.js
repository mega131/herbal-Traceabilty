// backend/routes/agencyRoutes.js
const express = require("express");
const router = express.Router();
const {
  registerAgency,
  getAvailableBatches,
  assignBatch,
  getAgencyBatches,
  updateBatchStatus,
} = require("../controllers/agencyController");

// Register agency
router.post("/register", registerAgency);

// Get available batches for assignment (Pending Collection)
router.get("/available-batches", getAvailableBatches);

// Assign batch to agency
router.post("/assign-batch", assignBatch);

// Get agency's assigned batches
router.get("/:agencyId/batches", getAgencyBatches);

// Update batch status
router.put("/batch/:batchId/status", updateBatchStatus);

module.exports = router;
