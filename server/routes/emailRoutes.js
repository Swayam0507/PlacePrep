const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  sendTestResultEmail,
  sendPlacementReadiness,
} = require("../controllers/emailController");

router.post("/test-result", protect, sendTestResultEmail);
router.post("/placement-readiness", protect, sendPlacementReadiness);

module.exports = router;
