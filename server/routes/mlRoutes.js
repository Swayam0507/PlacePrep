const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { predictPlacement } = require("../controllers/mlController");

router.post("/predict", protect, predictPlacement);

module.exports = router;
