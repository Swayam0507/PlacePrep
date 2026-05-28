const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  submitTest,
  getTestHistory,
  getTestAttempt,
} = require("../controllers/testController");

router.use(protect);

router.post("/submit", submitTest);
router.get("/history", getTestHistory);
router.get("/attempt/:id", getTestAttempt);

module.exports = router;
