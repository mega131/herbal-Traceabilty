require("dotenv").config();
const mongoose = require("mongoose");
const { generateQRCode, readQRCode } = require("../utils/qrcode");
const Batch = require("../models/Batch");
const LabTest = require("../models/LabTest");
const Processor = require("../models/Processor");

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI);
mongoose.connection.once("open", () => console.log("✅ MongoDB Connected"));

// Pipeline function
const runPipeline = async () => {
  try {
    // Fetch all batches approved by Lab
    const labTests = await LabTest.find({ result: "Pass" }).populate("batchId");
    if (!labTests.length) {
      console.log("No approved batches for processing");
      mongoose.disconnect();
      return;
    }

    for (const labTest of labTests) {
      const batch = labTest.batchId;

      console.log(`\nProcessing batch ${batch.batchId} for Processor...`);

      // Here, simulate scanning QR code sent by Lab
      const labData = await readQRCode(labTest.qrCode);

      const processorDoc = new Processor({
        batchId: batch._id,
        labTestId: labTest._id,
        herbName: labData.herbName || batch.species,
        partUsed: "Root",
        quantityProcessed: batch.quantity,
        dryingMethod: "Sun",
        extractionMethod: "Water",
        productName: `${batch.species} Powder`,
        formulationType: "Powder",
        finalLabCheck: labTest.result,
        labTestQRCode: labTest.qrCode
      });

      // Generate processor QR (optional)
      processorDoc.processorQRCode = await generateQRCode({
        processorId: processorDoc._id,
        batchId: batch._id,
        productName: processorDoc.productName
      });

      await processorDoc.save();

      console.log(`✅ Processor created for batch ${batch.batchId}. QR stored for traceability`);
    }

    console.log("\n✅ Processor pipeline complete");
    mongoose.disconnect();

  } catch (err) {
    console.error("Pipeline error:", err.message);
    mongoose.disconnect();
  }
};

runPipeline();
