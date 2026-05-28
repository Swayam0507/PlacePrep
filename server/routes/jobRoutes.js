const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { recommendJobs, scrapeJobs } = require("../controllers/jobController");

router.post("/recommend", protect, recommendJobs);
router.get("/scrape", protect, scrapeJobs);

module.exports = router;
