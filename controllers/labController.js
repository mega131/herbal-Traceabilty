const LabTest = require('../models/LabTest');
const Batch = require('../models/Batch');

// ----------------------
// Create Lab Test
exports.createLabTest = async (req, res) => {
  try {
    const {
      batchId,
      labName,
      analystId,
      testDate,
      parameters,
      result,
      failReasons,
      certificateUrl,
      qrCode,
      notes,
      certificateId
    } = req.body;

    // Validate batch exists (support Mongo _id or business batchId like BATCH-XXXX)
    let batch = null;
    try { batch = await Batch.findById(batchId); } catch (e) { /* ignore cast error */ }
    if (!batch) { batch = await Batch.findOne({ batchId }); }
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    // Create lab test
    const certificateUrlGenerated = `https://certs.example.com/lab/${Date.now()}_${Math.random().toString(36).slice(2,8)}`;

    const labTest = new LabTest({
      batchId,
      labName,
      analystId,
      testDate: testDate || new Date(),
      parameters: {
        moisture: parameters.moisture,
        pesticide_ppm: parameters.pesticide_ppm || {},
        heavyMetals_ppm: parameters.heavyMetals_ppm || {},
        ashContent: parameters.ashContent,
        dnaBarcode: {
          matched: parameters.dnaBarcode?.matched || false,
          matchConfidence: parameters.dnaBarcode?.confidence || 0,
          referenceId: parameters.dnaBarcode?.referenceId || ''
        },
        notes
      },
      result,
      failReasons: failReasons || [],
      certificateUrl: certificateUrl || certificateUrlGenerated,
      qrCode: qrCode || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(certificateUrl || certificateUrlGenerated)}`,
      certificateId: certificateId || `CERT-${Date.now()}`
    });

    await labTest.save();

    // Update batch with lab test reference
    batch.labTestId = labTest._id;
    batch.status = result === 'Pass' ? 'lab_approved' : 'lab_failed';
    batch.history.push({
      step: 'Lab Testing Completed',
      date: new Date(),
      by: labName,
      remarks: `Result: ${result}`
    });
    await batch.save();

    res.status(201).json({ message: 'Lab test created successfully', labTest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Lab Tests
exports.getLabTests = async (req, res) => {
  try {
    const { labName } = req.query;
    
    let query = {};
    if (labName) {
      query.labName = labName;
    }

    const labTests = await LabTest.find(query)
      .populate('batchId', 'batchId species quantity geoTag')
      .sort({ createdAt: -1 });

    res.json({ labTests });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Lab Test by ID
exports.getLabTestById = async (req, res) => {
  try {
    const { testId } = req.params;
    
    const labTest = await LabTest.findById(testId)
      .populate('batchId', 'batchId species quantity geoTag farmer');

    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    res.json({ labTest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Update Lab Test
exports.updateLabTest = async (req, res) => {
  try {
    const { testId } = req.params;
    const updateData = req.body;

    const labTest = await LabTest.findByIdAndUpdate(
      testId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!labTest) {
      return res.status(404).json({ message: 'Lab test not found' });
    }

    // Update batch status if result changed
    if (updateData.result) {
      const batch = await Batch.findById(labTest.batchId);
      if (batch) {
        batch.status = updateData.result === 'Pass' ? 'lab_approved' : 'lab_failed';
        await batch.save();
      }
    }

    res.json({ message: 'Lab test updated successfully', labTest });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Batches Ready for Lab Testing
exports.getBatchesForTesting = async (req, res) => {
  try {
    const batches = await Batch.find({
      status: { $in: ['collected', 'received'] }
    }).populate('farmer', 'name contactNumber');

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};