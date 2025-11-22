// backend/models/Agency.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const agencySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed password
  contactNumber: { type: String },
  location: { latitude: Number, longitude: Number },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: "Batch" }],
}, { timestamps: true });

// Hash password
agencySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
agencySchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Agency", agencySchema);
