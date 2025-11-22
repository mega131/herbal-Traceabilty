// backend/utils/agencySendBatch.js
const mongoose = require("mongoose");
const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");
const Batch = require("../models/Batch");
const Agency = require("../models/Agency");

// Load env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const LAB_API_URL = "http://localhost:5000/api/lab/test"; // Update if your lab server runs elsewhere

const sendBatchesToLab = async () => {
  try {
    // Fetch your agency (example: by email or name)
    const agency = await Agency.findOne({ name: "Green Supply Agency" }).populate("batches");
    if (!agency) return console.error("Agency not found");

    console.log(`Found ${agency.batches.length} batches to send`);

    for (const batch of agency.batches) {
      console.log(`\nSending batch ${batch.batchId} to Lab...`);

      // Prepare dummy lab parameters for testing
      const labPayload = {
        batchId: batch._id.toString(),
        labName: "Herbal Lab",
        analystId: "A001",
        parameters: {
          moisture: 10, // example
          pesticide_ppm: { DDT: 0.02, Atrazine: 0.01 },
          ashContent: 5
        }
      };

      // Send POST request to lab
      const response = await axios.post(LAB_API_URL, labPayload);
      console.log("Lab Response:", response.data);

      // Optional: Update batch with lab test info
      batch.labTestId = response.data.labTest._id;
      batch.status = response.data.labTest.result === "Pass" ? "APPROVED" : "REJECTED";
      await batch.save();

      console.log(`✅ Batch ${batch.batchId} processed. QR Code: ${response.data.qrFile}`);
    }

    console.log("\nAll batches processed successfully!");
    process.exit(0);

  } catch (err) {
    console.error("Error sending batches:", err.response ? err.response.data : err.message);
    process.exit(1);
  }
};

sendBatchesToLab();
