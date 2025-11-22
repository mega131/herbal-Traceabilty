// backend/models/Processor.js
const mongoose = require('mongoose');

const ProcessorSchema = new mongoose.Schema({
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],  // array of Batch references
  labTestId: { type: mongoose.Schema.Types.ObjectId, ref: "LabTest" }, // LabTest reference

  finalProductBatchId: { type: String, required: true },

  // Herb Info
  herbName: { type: String, required: true },
  partUsed: { type: String, required: true },
  quantityProcessed: { type: Number, required: true },

  // Processing
  dryingMethod: { type: String, enum: ['Sun', 'Shade', 'Mechanical'], required: true },
  extractionMethod: { type: String, enum: ['None', 'Water', 'Alcohol'], required: true },
  dateProcessed: { type: Date, default: Date.now },

  // Manufacturing
  productName: { type: String, required: true },
  formulationType: { type: String, enum: ['Capsule','Powder','Syrup'], required: true },
  manufactureDate: { type: Date, default: Date.now },
  expiryDate: { type: Date },

  // QA
  finalLabCheck: { type: String, enum: ['Pass', 'Fail'], default: 'Pass' },

  // QR Code
  qrCodeDataUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Processor', ProcessorSchema);
