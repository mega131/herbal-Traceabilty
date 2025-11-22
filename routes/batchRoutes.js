// backend/routes/batchRoutes.js
const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const Batch = require("../models/Batch");
const Processor = require("../models/Processor");

// List recent batches (for dashboards/testing)
router.get("/", async (req, res) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const batches = await Batch.find({})
      .populate({ path: "farmer", select: "name contactNumber farmLocation crops totalHarvested seasonalHarvest smartContractAddress" })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:batchId", async (req, res) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId })
      .populate({
        path: "farmer",
        select: "name contactNumber farmLocation crops totalHarvested seasonalHarvest smartContractAddress",
      })
      .populate({ path: "agency", select: "name contactNumber location" })
      .populate({ path: "labTestId" })
      .populate({ path: "processorId" });

    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const processorRecords = await Processor.find({ batches: batch._id }).sort({ createdAt: 1 });

    // ✅ Combine all info
    const finalData = {
      batch,
      processorRecords,
    };

    // ✅ Generate QR code from this final JSON data
    // const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(finalData));
const url = `https://ai-herb-tracker.onrender.com/batch/${batch.batchId}`;
const qrCodeDataUrl = await QRCode.toDataURL(url);
    // ✅ Save QR into the latest processor (so it’s persisted in DB)
    if (processorRecords.length > 0) {
      const latestProcessor = processorRecords[processorRecords.length - 1];
      latestProcessor.qrCodeDataUrl = qrCodeDataUrl;
      await latestProcessor.save();
    }

    // ✅ Send response including QR
    res.json({
      ...finalData,
      finalQR: qrCodeDataUrl,
    });
  } catch (err) {
    console.error("batchRoutes error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;