const rules = require('./lab-rules');

function evaluateLabTest(parameters) {
  const failReasons = [];

  if (parameters.moisture != null && parameters.moisture > rules.moistureMaxPercent) {
    failReasons.push('MoistureHigh');
  }

  if (parameters.pesticide_ppm) {
    for (const [pest, value] of Object.entries(parameters.pesticide_ppm)) {
      const limit = rules.pesticideLimitsPpm[pest];
      if (limit != null && value > limit) {
        failReasons.push(`Pesticide_${pest}_AboveLimit`);
      }
    }
  }

  if (parameters.heavyMetals_ppm) {
    for (const [metal, value] of Object.entries(parameters.heavyMetals_ppm)) {
      const limit = rules.heavyMetalLimitsPpm[metal];
      if (limit != null && value > limit) {
        failReasons.push(`HeavyMetal_${metal}_AboveLimit`);
      }
    }
  }

  if (parameters.dnaBarcode) {
    if (!parameters.dnaBarcode.matched || (parameters.dnaBarcode.matchConfidence < rules.dnaMatchConfidenceMin)) {
      failReasons.push('DNAMismatchOrLowConfidence');
    }
  }

  let result = 'Pass';
  if (failReasons.length > 0) result = 'Fail';

  return { result, failReasons };
}

module.exports = { evaluateLabTest };
