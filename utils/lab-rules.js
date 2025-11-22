// lab-rules.js
module.exports = {
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
