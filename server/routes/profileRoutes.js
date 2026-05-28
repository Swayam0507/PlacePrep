const express = require("express");
const router = express.Router();
const { updateProfile, getProfile, toggleTheme } = require("../controllers/profileController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/theme", protect, toggleTheme);

module.exports = router;
