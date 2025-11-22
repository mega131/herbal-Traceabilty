// routes/blockchainRoutes.js
const express = require("express");
const router = express.Router();
const { addBlockchainEvent, getBlockchainLogs } = require("../controllers/blockchainController");

// POST a new blockchain event
router.post("/event", addBlockchainEvent);

// GET all blockchain logs
router.get("/logs", getBlockchainLogs);

module.exports = router;
