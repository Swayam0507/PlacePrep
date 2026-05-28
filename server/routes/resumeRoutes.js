const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const { protect } = require("../middleware/auth");
const {
  uploadResume,
  getMyResumes,
  deleteResume,
  parseResume,
} = require("../controllers/resumeController");

// All routes are protected
router.use(protect);

router.post("/upload", upload.single("resume"), uploadResume);
router.get("/my-resumes", getMyResumes);
router.delete("/:id", deleteResume);
router.post("/:id/parse", parseResume);

module.exports = router;
