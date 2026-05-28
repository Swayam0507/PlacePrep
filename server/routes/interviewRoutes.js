const express = require("express");
const router = express.Router();
const {
  getInterviewQuestions, getInterviewCompanies,
  addInterviewQuestion, bulkAddInterviewQuestions, deleteInterviewQuestion,
} = require("../controllers/interviewController");
const { protect, authorize } = require("../middleware/auth");

router.get("/", protect, getInterviewQuestions);
router.get("/companies", protect, getInterviewCompanies);
router.post("/", protect, authorize("admin"), addInterviewQuestion);
router.post("/bulk", protect, authorize("admin"), bulkAddInterviewQuestions);
router.delete("/:id", protect, authorize("admin"), deleteInterviewQuestion);

module.exports = router;
