//server.js
const dotenv = require("dotenv");
const path = require("path");
const express = require("express");
const connectDB = require("./config/db");

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, ".env") });
console.log("Mongo URI:", process.env.MONGO_URI);

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

const cors = require('cors');
app.use(cors({
    origin: [
      'https://ai-herb-tracker.onrender.com',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5500',
      'http://127.0.0.1:5500'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
// Middleware to parse JSON requests
app.use(express.json());

// ----------------------
// Test Route
// ----------------------
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ----------------------
// API Routes
// ----------------------
app.use("/api/processor", require("./routes/processorRoutes")); 
app.use("/api/farmer", require("./routes/farmerRoutes"));
app.use("/api/lab", require("./routes/labRoutes")); 
app.use("/api/agency", require("./routes/agencyRoutes")); 
app.use("/api/batch", require("./routes/batchRoutes"));
app.use("/api/blockchain", require("./routes/blockchainRoutes"));

// ----------------------
// Start Server
// ----------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

