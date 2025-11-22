// backend/models/Farmer.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const farmerSchema = new mongoose.Schema({
    farmerId: { type: String, unique: true, required: true, default: () => uuidv4() },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },
    password: { type: String, required: true },
    crops: [String],
    farmLocation: { latitude: Number, longitude: Number, address: String },
    totalHarvested: { type: Number, default: 0 },
    seasonalHarvest: { 
        type: Map,
        of: Map,
        default: {}
    }
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
