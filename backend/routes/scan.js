const express = require("express");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const router = express.Router();

const filePath = path.join(__dirname, "..", "data", "scans.json");

function loadScans() {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath));
}

function saveScans(data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function analyzeMessage(text) {
  const keywords = {
    otp: ["otp", "verification", "code"],
    bank: ["bank", "account", "transaction", "upi"],
    lottery: ["win", "prize", "lottery", "reward"],
    threat: ["arrest", "police", "court", "urgent"],
    scam: ["click link", "free money", "password", "login"],
  };

  let score = 0;
  let category = "Normal";

  Object.keys(keywords).forEach((type) => {
    keywords[type].forEach((word) => {
      if (text.toLowerCase().includes(word)) {
        score += 15;
        category = type.toUpperCase();
      }
    });
  });

  if (text.includes("http")) score += 20;
  if (text.length < 20) score += 10;

  if (score > 100) score = 100;

  return {
    score,
    category,
    result:
      score >= 70
        ? " High Scam Risk"
        : score >= 40
        ? " Suspicious"
        : " Safe",
  };
}

router.post("/scan", (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message required" });

  const scans = loadScans();

  const analysis = analyzeMessage(message);

  const newScan = {
    id: uuidv4(),
    message,
    ...analysis,
    date: new Date().toLocaleString(),
  };

  scans.push(newScan);
  saveScans(scans);

  res.json(newScan);
});

router.get("/history", (req, res) => {
  res.json(loadScans().reverse());
});

router.delete("/delete/:id", (req, res) => {
  let scans = loadScans();
  scans = scans.filter((s) => s.id !== req.params.id);
  saveScans(scans);
  res.json({ message: "Deleted Successfully", scans });
});

module.exports = router;
