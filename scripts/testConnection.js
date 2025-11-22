require("dotenv").config();
const mongoose = require("mongoose");

const Farmer = require("../models/Farmer");
const Batch = require("../models/Batch");
const Agency = require("../models/Agency");
const LabTest = require("../models/LabTest");
const Processor = require("../models/Processor");

const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  // No need for useNewUrlParser or useUnifiedTopology with latest drivers
});

mongoose.connection.once("open", () => {
  console.log("✅ MongoDB Connected\n");
});

mongoose.connection.on("error", (err) => {
  console.error("❌ MongoDB connection error:", err);
});

const testSupplyChain = async () => {
  try {
    // 1️⃣ Fetch all batches with farmer and agency populated
    const batches = await Batch.find()
      .populate("farmer")   // Populate farmer reference
      .populate("agency");  // Populate agency reference (if exists)

    console.log("🔹 All Batches with Farmer & Agency:");
    console.log(JSON.stringify(batches, null, 2));

    // 2️⃣ Fetch lab tests for all batches
    const labTests = await LabTest.find()
      .populate({
        path: "batchId",
        populate: { path: "farmer agency" } // Nested population
      });

    console.log("\n🔹 All Lab Tests with Batch info:");
    console.log(JSON.stringify(labTests, null, 2));

    // 3️⃣ Fetch processors with batches and lab tests populated
    const processors = await Processor.find()
      .populate({
        path: "batches",
        populate: { path: "farmer agency" }
      })
      .populate({
        path: "labTestId",
        populate: { path: "batchId" }
      });

    console.log("\n🔹 All Processors with Batch & Lab Test:");
    console.log(JSON.stringify(processors, null, 2));

    console.log("\n✅ Supply chain test completed!");
  } catch (err) {
    console.error("❌ Error testing supply chain:", err);
  } finally {
    mongoose.disconnect();
  }
};

// Run the test
testSupplyChain();
