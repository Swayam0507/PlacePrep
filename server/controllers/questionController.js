const Question = require("../models/Question");

/**
 * @desc    Get questions by category (with optional difficulty filter)
 * @route   GET /api/questions?category=quantitative&difficulty=medium&limit=10
 * @access  Private
 */
const getQuestions = async (req, res) => {
  try {
    const { category, difficulty, limit = 10 } = req.query;

    const filter = {};
    if (category && category !== "mixed") {
      filter.category = category;
    }
    if (difficulty && difficulty !== "mixed") {
      filter.difficulty = difficulty;
    }

    // Randomly select questions
    const questions = await Question.aggregate([
      { $match: filter },
      { $sample: { size: parseInt(limit) } },
      {
        $project: {
          category: 1,
          question: 1,
          options: 1,
          difficulty: 1,
          // Don't send correctAnswer to frontend during test
        },
      },
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error("Get Questions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions.",
    });
  }
};

/**
 * @desc    Get all questions for admin (includes correctAnswer)
 * @route   GET /api/questions/all
 * @access  Private/Admin
 */
const getAllQuestions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = "",
      difficulty = "",
      search = "",
    } = req.query;

    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) {
      filter.question = { $regex: search, $options: "i" };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort("-createdAt")
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Question.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get All Questions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch questions.",
    });
  }
};

/**
 * @desc    Get all categories with question counts
 * @route   GET /api/questions/categories
 * @access  Private
 */
const getCategories = async (req, res) => {
  try {
    const categories = await Question.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          difficulties: { $addToSet: "$difficulty" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      categories: categories.map((c) => ({
        name: c._id,
        count: c.count,
        difficulties: c.difficulties,
      })),
    });
  } catch (error) {
    console.error("Get Categories Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories.",
    });
  }
};

/**
 * @desc    Add a new question (admin only)
 * @route   POST /api/questions
 * @access  Private/Admin
 */
const addQuestion = async (req, res) => {
  try {
    const { category, question, options, correctAnswer, difficulty, explanation } = req.body;

    const newQuestion = await Question.create({
      category,
      question,
      options,
      correctAnswer,
      difficulty: difficulty || "medium",
      explanation: explanation || "",
    });

    res.status(201).json({
      success: true,
      message: "Question added successfully.",
      question: newQuestion,
    });
  } catch (error) {
    console.error("Add Question Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({
      success: false,
      message: "Failed to add question.",
    });
  }
};

/**
 * @desc    Update a question
 * @route   PUT /api/questions/:id
 * @access  Private/Admin
 */
const updateQuestion = async (req, res) => {
  try {
    const { category, question, options, correctAnswer, difficulty, explanation } = req.body;

    const updateData = {};
    if (category) updateData.category = category;
    if (question) updateData.question = question;
    if (options) updateData.options = options;
    if (correctAnswer !== undefined) updateData.correctAnswer = correctAnswer;
    if (difficulty) updateData.difficulty = difficulty;
    if (explanation !== undefined) updateData.explanation = explanation;

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedQuestion) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question updated successfully.",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error("Update Question Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({
      success: false,
      message: "Failed to update question.",
    });
  }
};

/**
 * @desc    Delete a question
 * @route   DELETE /api/questions/:id
 * @access  Private/Admin
 */
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: "Question not found.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Question deleted successfully.",
    });
  } catch (error) {
    console.error("Delete Question Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete question.",
    });
  }
};

module.exports = { getQuestions, getAllQuestions, getCategories, addQuestion, updateQuestion, deleteQuestion };
