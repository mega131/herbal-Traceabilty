// backend/utils/qrcode.js
const QRCode = require("qrcode");
const fs = require("fs");
const path = require("path");

const generateQRCode = async (labTestData) => {
  try {
    // Ensure folder exists
    const dir = path.join(__dirname, "../qrcodes");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const filePath = path.join(dir, `${labTestData._id}.png`);

    // Convert the whole LabTest object to JSON string for QR
    await QRCode.toFile(filePath, JSON.stringify(labTestData, null, 2));

    console.log("QR code saved to", filePath);
    return filePath;
  } catch (err) {
    console.error("QR generation error:", err);
    throw err;
  }
};

module.exports = { generateQRCode };
