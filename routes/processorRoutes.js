// backend/routes/processorRoutes.js
const express = require('express');
const router = express.Router();
const { 
  createProcessingRecord, 
  getProcessingRecords, 
  getProcessingRecordById, 
  updateProcessingRecord, 
  getBatchesForProcessing, 
  generateProductQR 
} = require('../controllers/processorController');

// ----------------------
// POST /api/processor/record
// Create processing record
// ----------------------
router.post('/record', createProcessingRecord);

// ----------------------
// GET /api/processor/records
// Get all processing records
// ----------------------
router.get('/records', getProcessingRecords);

// ----------------------
// GET /api/processor/batches-for-processing
// Get batches ready for processing
// ----------------------
router.get('/batches-for-processing', getBatchesForProcessing);

// ----------------------
// GET /api/processor/:processorId
// Get processing record by ID
// ----------------------
router.get('/:processorId', getProcessingRecordById);

// ----------------------
// PUT /api/processor/:processorId
// Update processing record
// ----------------------
router.put('/:processorId', updateProcessingRecord);

// ----------------------
// POST /api/processor/:processorId/generate-qr
// Generate QR code for final product
// ----------------------
router.post('/:processorId/generate-qr', generateProductQR);

module.exports = router;
