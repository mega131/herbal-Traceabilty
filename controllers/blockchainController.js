const path = require('path');

// Simple adapter stub; replace with real chain adapter as needed
let chain;
try {
  // Prefer explicit adapter if present
  chain = require(path.resolve(__dirname, '../blockchain/adapter-eth'));
} catch (e) {
  // Fallback to simple logger adapter
  chain = { addEvent: async (data) => { console.log('Blockchain event added:', data); return true; } };
}

const inMemoryLogs = [];

exports.addBlockchainEvent = async (req, res) => {
  try {
    const payload = req.body || {};
    await chain.addEvent(payload);
    const log = { id: Date.now().toString(), ...payload, createdAt: new Date().toISOString() };
    inMemoryLogs.push(log);
    res.status(201).json({ message: 'Event recorded on blockchain adapter', log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBlockchainLogs = async (_req, res) => {
  res.json({ count: inMemoryLogs.length, logs: inMemoryLogs.slice(-200) });
};



