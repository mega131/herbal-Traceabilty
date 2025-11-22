const Agency = require('../models/Agency');
const Batch = require('../models/Batch');
const bcrypt = require('bcryptjs');

// ----------------------
// Register Agency
exports.registerAgency = async (req, res) => {
  try {
    const { name, email, password, contactNumber, location } = req.body;

    if (!name || !email || !password || !contactNumber || !location) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingAgency = await Agency.findOne({ email });
    if (existingAgency) {
      return res.status(400).json({ message: 'Agency already registered with this email' });
    }

    const agency = new Agency({
      name,
      email,
      password,
      contactNumber,
      location
    });

    await agency.save();
    res.status(201).json({ message: 'Agency registered successfully', agency });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Available Batches for Assignment
exports.getAvailableBatches = async (req, res) => {
  try {
    const batches = await Batch.find({ 
      status: { 
        $in: [
          'Pending Collection',      // default new batches
          'pending_collection',      // fallback lowercase
          'Assigned to Agency',      // legacy status with spaces
          'assigned_to_agency',      // lowercase variant
          'collected',
          'in_transit'
        ]
      }
    })
    .populate('farmer', 'name contactNumber farmLocation')
    .sort({ createdAt: -1 })
    .limit(50);
    
    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Assign Batch to Agency
exports.assignBatch = async (req, res) => {
  try {
    const { batchId, agencyId } = req.body;

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    // Update batch status and assign to agency
    batch.status = 'assigned_to_agency';
    batch.agency = agencyId;
    batch.history.push({
      step: 'Assigned to Agency',
      date: new Date(),
      by: agency.name,
      remarks: 'Batch assigned for collection'
    });
    await batch.save();

    // Add batch to agency's batch list
    agency.batches.push(batchId);
    await agency.save();

    res.json({ message: 'Batch assigned successfully', batch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Agency's Assigned Batches
exports.getAgencyBatches = async (req, res) => {
  try {
    const { agencyId } = req.params;
    
    const agency = await Agency.findById(agencyId);
    if (!agency) {
      return res.status(404).json({ message: 'Agency not found' });
    }

    const batches = await Batch.find({ 
      agency: agencyId 
    }).populate('farmer', 'name contactNumber farmLocation');

    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Update Batch Status
exports.updateBatchStatus = async (req, res) => {
  try {
    const { batchId } = req.params;
    const { status, remarks } = req.body;

    let batch = null;
    // Try by Mongo ObjectId first
    try { batch = await Batch.findById(batchId); } catch (e) { /* ignore cast error */ }
    // Fallback to business batchId field
    if (!batch) { batch = await Batch.findOne({ batchId }); }
    if (!batch) return res.status(404).json({ message: 'Batch not found' });

    batch.status = status;
    batch.history.push({
      step: `Status updated to ${status}`,
      date: new Date(),
      by: 'Agency',
      remarks: remarks || ''
    });
    await batch.save();

    res.json({ message: 'Batch status updated successfully', batch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};