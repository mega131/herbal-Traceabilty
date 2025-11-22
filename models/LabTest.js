// backend/models/LabTest.js
const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  labName: { type: String, required: true },
  analystId: { type: String },
  testDate: { type: Date, default: Date.now },
  parameters: {
    moisture: { type: Number },            // % moisture
    pesticide_ppm: { type: Map, of: Number }, // e.g., { "DDT": 0.02, "Atrazine": 0.01 }
    heavyMetals_ppm: { type: Map, of: Number }, // e.g., { "Pb": 0.3 }
    ashContent: { type: Number },
    dnaBarcode: {                       // result of DNA barcode matching
      matched: { type: Boolean },
      matchConfidence: { type: Number }, // 0-100
      referenceId: String
    },
    notes: String
  },
  result: { type: String, enum: ['Pass','Fail','Conditional'], required: true },
  failReasons: [String],   // e.g., ["MoistureHigh","PesticideAboveThreshold"]
  certificateUrl: String,  // path to PDF or uploaded report
  certificateId: String,   // unique certificate identifier
  txRef: String,
  qrCode: { type: String }             // blockchain transaction id / chaincode tx id
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);

