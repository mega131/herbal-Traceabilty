// limits.js - Seasonal harvest limits and utility functions

// Species-specific harvest limits (kg per season per farmer)
const SPECIES_LIMITS = {
  'Ashwagandha': 100,
  'Tulsi': 50,
  'Neem': 75
};

// Function to get current season based on month
function getCurrentSeason() {
  const month = new Date().getMonth() + 1; // 1-12
  
  if (month >= 3 && month <= 5) return 'Spring';
  if (month >= 6 && month <= 8) return 'Summer';
  if (month >= 9 && month <= 11) return 'Autumn';
  return 'Winter'; // Dec, Jan, Feb
}

// Lab testing rules
const labRules = {
  dnaTest: {
    minScore: 90, // must be at least 90% match
  },
  pesticideResidue: {
    maxLevel: 0.01, // ppm allowed
  },
  heavyMetals: {
    maxLead: 0.005,  // ppm
    maxMercury: 0.001,
  },
  moistureContent: {
    maxPercent: 12,
  },
};

module.exports = {
  SPECIES_LIMITS,
  getCurrentSeason,
  ...labRules
};
