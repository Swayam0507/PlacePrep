const express = require("express");
const router = express.Router();
const { toggleBookmark, getBookmarks, checkBookmarks } = require("../controllers/bookmarkController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getBookmarks);
router.post("/check", protect, checkBookmarks);
router.post("/:questionId", protect, toggleBookmark);

module.exports = router;
