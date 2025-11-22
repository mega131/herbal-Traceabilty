// backend/models/Batch.js
const mongoose = require("mongoose");

const BatchSchema = new mongoose.Schema({
  farmer: { type: mongoose.Schema.Types.ObjectId, ref: "Farmer", required: true },
  batchId: { type: String, required: true, unique: true },
  species: { type: String, required: true },
  quantity: { type: Number, required: true },
  geoTag: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true }
  },
  photos: [String],

  // Who collected it
  agency: { type: mongoose.Schema.Types.ObjectId, ref: "Agency" },

  // Track lifecycle
  status: { type: String, default: "Pending Collection" },

  // Full history log
  history: [
    {
      step: String,
      date: { type: Date, default: Date.now },
      by: String,
      remarks: String
    }
  ],

  // Add connections
  labTestId: { type: mongoose.Schema.Types.ObjectId, ref: "LabTest" },       // connect to LabTest
  processorId: { type: mongoose.Schema.Types.ObjectId, ref: "Processor" }    // connect to Processor
}, { timestamps: true });

module.exports = mongoose.model("Batch", BatchSchema);
