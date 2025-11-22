
// blockchain/adapter-eth.js
// Mock blockchain adapter (for testing without real Ethereum/Hardhat)

module.exports = {
  async recordLabResult(batchId, result) {
    console.log("📦 Mock blockchain: Recording lab result...");
    console.log("Batch:", batchId);
    console.log("Result:", result);

    // pretend blockchain returns a transaction hash
    return {
      txHash: "0x" + Math.random().toString(16).substring(2, 10),
      status: "success",
    };
  },
};
