const Processor = require('../models/Processor');
const Batch = require('../models/Batch');
const LabTest = require('../models/LabTest');

// ----------------------
// Create Processing Record
exports.createProcessingRecord = async (req, res) => {
  try {
    const {
      batchIds,
      labTestId,
      herbName,
      partUsed,
      quantityProcessed,
      dryingMethod,
      extractionMethod,
      productName,
      formulationType,
      expiryDate
    } = req.body;

    // Validate batches exist
    const batches = await Batch.find({ _id: { $in: batchIds } });
    if (batches.length !== batchIds.length) {
      return res.status(400).json({ message: 'One or more batches not found' });
    }

    // Validate lab test if provided
    if (labTestId) {
      const labTest = await LabTest.findById(labTestId);
      if (!labTest) {
        return res.status(400).json({ message: 'Lab test not found' });
      }
    }

    // Generate final product batch ID
    const finalProductBatchId = `PRODUCT-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    // Create processing record
    const processor = new Processor({
      batches: batchIds,
      labTestId,
      finalProductBatchId,
      herbName,
      partUsed,
      quantityProcessed,
      dryingMethod,
      extractionMethod,
      productName,
      formulationType,
      expiryDate: expiryDate ? new Date(expiryDate) : null
    });

    await processor.save();

    // Update batch statuses
    await Batch.updateMany(
      { _id: { $in: batchIds } },
      { 
        $set: { 
          status: 'processed',
          processorId: processor._id
        },
        $push: {
          history: {
            step: 'Processing Completed',
            date: new Date(),
            by: 'Manufacturer',
            remarks: `Final product: ${productName}`
          }
        }
      }
    );

    res.status(201).json({ message: 'Processing record created successfully', processor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Processing Records
exports.getProcessingRecords = async (req, res) => {
  try {
    const processors = await Processor.find()
      .populate('batches', 'batchId species quantity')
      .populate('labTestId', 'result testDate')
      .sort({ createdAt: -1 });

    res.json({ processors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Processing Record by ID
exports.getProcessingRecordById = async (req, res) => {
  try {
    const { processorId } = req.params;
    
    const processor = await Processor.findById(processorId)
      .populate('batches', 'batchId species quantity geoTag farmer')
      .populate('labTestId', 'result testDate parameters');

    if (!processor) {
      return res.status(404).json({ message: 'Processing record not found' });
    }

    res.json({ processor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Update Processing Record
exports.updateProcessingRecord = async (req, res) => {
  try {
    const { processorId } = req.params;
    const updateData = req.body;

    const processor = await Processor.findByIdAndUpdate(
      processorId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!processor) {
      return res.status(404).json({ message: 'Processing record not found' });
    }

    res.json({ message: 'Processing record updated successfully', processor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Batches Ready for Processing
exports.getBatchesForProcessing = async (req, res) => {
  try {
    const batches = await Batch.find({
      status: 'lab_approved'
    }).populate('farmer', 'name contactNumber');

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Generate QR Code for Final Product
exports.generateProductQR = async (req, res) => {
  try {
    const { processorId } = req.params;
    
    const processor = await Processor.findById(processorId)
      .populate('batches', 'batchId species quantity geoTag')
      .populate('labTestId', 'result testDate');

    if (!processor) {
      return res.status(404).json({ message: 'Processing record not found' });
    }

    // Generate QR code data
    const qrData = {
      productBatchId: processor.finalProductBatchId,
      herbName: processor.herbName,
      formulationType: processor.formulationType,
      manufactureDate: processor.manufactureDate,
      expiryDate: processor.expiryDate,
      batches: processor.batches.map(b => ({
        batchId: b.batchId,
        species: b.species,
        quantity: b.quantity,
        geoTag: b.geoTag
      })),
      labTest: processor.labTestId ? {
        result: processor.labTestId.result,
        testDate: processor.labTestId.testDate
      } : null
    };

    // Instead of raw JSON, encode as data URL to render as image or use URL target
    const qrTargetUrl = `http://localhost:5173/verify?product=${encodeURIComponent(processor.finalProductBatchId)}`;
    processor.qrCodeDataUrl = qrTargetUrl;
    await processor.save();

    res.json({ 
      message: 'QR code generated successfully', 
      qrData,
      qrUrl: qrTargetUrl,
      processorId: processor._id 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};