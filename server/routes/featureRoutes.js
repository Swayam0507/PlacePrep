const express = require("express");
const router = express.Router();
const {
  getLeaderboard, getPeerComparison, getCertificates,
  checkAndAwardCertificates, getResumeScore, bulkImportQuestions,
} = require("../controllers/featureController");
const { protect, authorize } = require("../middleware/auth");

// Leaderboard
router.get("/leaderboard", protect, getLeaderboard);
router.get("/leaderboard/compare", protect, getPeerComparison);

// Certificates
router.get("/certificates", protect, getCertificates);
router.post("/certificates/check", protect, checkAndAwardCertificates);

// Resume scoring
router.post("/resume-score", protect, getResumeScore);

// Bulk question import (admin)
router.post("/questions/bulk", protect, authorize("admin"), bulkImportQuestions);

module.exports = router;
