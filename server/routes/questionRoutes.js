const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const {
  getQuestions,
  getAllQuestions,
  getCategories,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/questionController");

// Public (protected) routes
router.get("/", protect, getQuestions);
router.get("/categories", protect, getCategories);

// Admin-only routes
router.get("/all", protect, authorize("admin"), getAllQuestions);
router.post("/", protect, authorize("admin"), addQuestion);
router.put("/:id", protect, authorize("admin"), updateQuestion);
router.delete("/:id", protect, authorize("admin"), deleteQuestion);

module.exports = router;
