const InterviewQuestion = require("../models/InterviewQuestion");

/**
 * @desc    Get interview questions (filterable by category, company)
 * @route   GET /api/interview?category=hr&company=google&limit=20
 * @access  Private
 */
const getInterviewQuestions = async (req, res) => {
  try {
    const { category, company, difficulty, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (company) filter.company = { $regex: company, $options: "i" };
    if (difficulty) filter.difficulty = difficulty;

    const questions = await InterviewQuestion.find(filter)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: questions.length, questions });
  } catch (error) {
    console.error("Get Interview Questions Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch interview questions." });
  }
};

/**
 * @desc    Get all unique companies in interview questions
 * @route   GET /api/interview/companies
 * @access  Private
 */
const getInterviewCompanies = async (req, res) => {
  try {
    const companies = await InterviewQuestion.distinct("company");
    res.status(200).json({
      success: true,
      companies: companies.filter((c) => c && c.length > 0),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch companies." });
  }
};

/**
 * @desc    Add interview question (admin)
 * @route   POST /api/interview
 * @access  Private/Admin
 */
const addInterviewQuestion = async (req, res) => {
  try {
    const question = await InterviewQuestion.create(req.body);
    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error("Add Interview Question Error:", error);
    res.status(500).json({ success: false, message: "Failed to add question." });
  }
};

/**
 * @desc    Bulk add interview questions (admin)
 * @route   POST /api/interview/bulk
 * @access  Private/Admin
 */
const bulkAddInterviewQuestions = async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ success: false, message: "questions array is required." });
    }
    const inserted = await InterviewQuestion.insertMany(questions, { ordered: false });
    res.status(201).json({ success: true, count: inserted.length, message: `${inserted.length} questions added.` });
  } catch (error) {
    console.error("Bulk Add Error:", error);
    res.status(500).json({ success: false, message: "Failed to bulk add questions." });
  }
};

/**
 * @desc    Delete interview question (admin)
 * @route   DELETE /api/interview/:id
 * @access  Private/Admin
 */
const deleteInterviewQuestion = async (req, res) => {
  try {
    await InterviewQuestion.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Question deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete question." });
  }
};

module.exports = {
  getInterviewQuestions,
  getInterviewCompanies,
  addInterviewQuestion,
  bulkAddInterviewQuestions,
  deleteInterviewQuestion,
};
