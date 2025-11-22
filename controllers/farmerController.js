const Farmer = require('../models/Farmer');
const Batch = require('../models/Batch');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { isWithinCultivationZone } = require('../utils/geofence');
const { SPECIES_LIMITS, getCurrentSeason } = require('../utils/limits');

// ----------------------
// Register Farmer
exports.registerFarmer = async (req, res) => {
  try {
    const { name, email, password, location, contact } = req.body;

    if (!name || !email || !password || !location || !contact) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingFarmer = await Farmer.findOne({ email });
    if (existingFarmer) {
      return res.status(400).json({ message: 'Farmer already registered with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Map to schema fields
    const farmLocation = typeof location === 'string' ? { address: location } : location;

    const farmer = new Farmer({
      name,
      email,
      password: hashedPassword,
      contactNumber: contact,
      farmLocation,
      totalHarvested: 0,
      seasonalHarvest: {}
    });

    await farmer.save();
    res.status(201).json({ message: 'Farmer registered successfully', farmer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Add Batch
exports.addBatch = async (req, res) => {
  try {
    const { farmerId, email, species, quantity, latitude, longitude, photos, qualityScore, useAutoGPS } = req.body;

    let farmer = null;
    if (farmerId) {
      farmer = await Farmer.findById(farmerId);
    } else if (email) {
      farmer = await Farmer.findOne({ email });
    }
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    let lat = latitude, lng = longitude;
    if (useAutoGPS) { lat = 12.9716; lng = 77.5946; } // fallback GPS

    if (!isWithinCultivationZone(lat, lng)) {
      return res.status(400).json({ message: 'Batch must be within Karnataka Ashwagandha zones' });
    }

    const season = getCurrentSeason();
    const speciesLimit = SPECIES_LIMITS[species];

    if (!farmer.seasonalHarvest) farmer.seasonalHarvest = {};
    if (!farmer.seasonalHarvest[species]) farmer.seasonalHarvest[species] = {};
    const harvestedThisSeason = farmer.seasonalHarvest[species][season] || 0;

    if (harvestedThisSeason + quantity > speciesLimit) {
      return res.status(400).json({ message: `Seasonal harvest limit exceeded for ${species} (${speciesLimit} max)` });
    }

    // ✅ Save batch in Batch collection
    const batch = await Batch.create({
      batchId: `BATCH-${uuidv4().split('-')[0].toUpperCase()}`,
      farmer: farmer._id,
      species,
      quantity,
      geoTag: { latitude: lat, longitude: lng },
      photos: photos || [],
      qualityScore: qualityScore || null
    });

    farmer.totalHarvested += quantity;
    farmer.seasonalHarvest[species][season] = harvestedThisSeason + quantity;
    await farmer.save();

    res.status(201).json({ message: 'Batch added successfully', batch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Farmer's Batches
exports.getFarmerBatches = async (req, res) => {
  try {
    const { farmerId } = req.params;

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    const batches = await Batch.find({ farmer: farmerId }).sort({ createdAt: -1 });
    res.json({ batches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Get Farmer by Email
exports.getFarmerByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: 'email is required' });
    const farmer = await Farmer.findOne({ email });
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });
    res.json({ farmer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ----------------------
// Update Farmer Location
exports.addLocation = async (req, res) => {
  try {
    const { farmerId, latitude, longitude, address } = req.body;

    const farmer = await Farmer.findById(farmerId);
    if (!farmer) return res.status(404).json({ message: 'Farmer not found' });

    farmer.location = { latitude, longitude, address };
    await farmer.save();

    res.status(200).json({ message: 'Location updated successfully', location: farmer.location });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
