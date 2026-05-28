const TestAttempt = require("../models/TestAttempt");
const Question = require("../models/Question");
const { sendTestResultEmailInternal } = require("../utils/emailService");

/**
 * @desc    Submit a test attempt
 * @route   POST /api/test/submit
 * @access  Private
 */
const submitTest = async (req, res) => {
  try {
    const { category, answers, timeTaken, difficulty } = req.body;
    // answers format: [{ questionId, selectedAnswer }]

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No answers submitted.",
      });
    }

    // Fetch the correct answers for all submitted questions
    const questionIds = answers.map((a) => a.questionId);
    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    const questionMap = {};
    questions.forEach((q) => {
      questionMap[q._id.toString()] = q;
    });

    // Grade the test
    let score = 0;
    const gradedAnswers = answers.map((a) => {
      const question = questionMap[a.questionId];
      const isCorrect = question && a.selectedAnswer === question.correctAnswer;
      if (isCorrect) score++;
      return {
        questionId: a.questionId,
        selectedAnswer: a.selectedAnswer,
        isCorrect: !!isCorrect,
      };
    });

    const totalQuestions = answers.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    const attempt = await TestAttempt.create({
      userId: req.user._id,
      category: category || "mixed",
      score,
      totalQuestions,
      percentage,
      answers: gradedAnswers,
      timeTaken: timeTaken || 0,
      difficulty: difficulty || "medium",
    });

    // Build detailed results with correct answers and explanations
    const detailedResults = gradedAnswers.map((a) => {
      const q = questionMap[a.questionId];
      return {
        question: q?.question,
        options: q?.options,
        selectedAnswer: a.selectedAnswer,
        correctAnswer: q?.correctAnswer,
        isCorrect: a.isCorrect,
        explanation: q?.explanation || "",
      };
    });

    // Send test result email asynchronously
    sendTestResultEmailInternal(req.user, attempt);

    res.status(201).json({
      success: true,
      message: `Test submitted! You scored ${score}/${totalQuestions} (${percentage}%)`,
      result: {
        attemptId: attempt._id,
        score,
        totalQuestions,
        percentage,
        timeTaken: attempt.timeTaken,
        category: attempt.category,
        detailedResults,
      },
    });
  } catch (error) {
    console.error("Submit Test Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit test.",
    });
  }
};

/**
 * @desc    Get test history for current user
 * @route   GET /api/test/history?limit=20
 * @access  Private
 */
const getTestHistory = async (req, res) => {
  try {
    const { limit = 20, category } = req.query;

    const filter = { userId: req.user._id };
    if (category) filter.category = category;

    const history = await TestAttempt.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .lean();

    res.status(200).json({
      success: true,
      count: history.length,
      history,
    });
  } catch (error) {
    console.error("Get History Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test history.",
    });
  }
};

/**
 * @desc    Get a single test attempt with detailed results
 * @route   GET /api/test/attempt/:id
 * @access  Private
 */
const getTestAttempt = async (req, res) => {
  try {
    const attempt = await TestAttempt.findOne({
      _id: req.params.id,
      userId: req.user._id,
    })
      .populate("answers.questionId", "question options correctAnswer explanation")
      .lean();

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found.",
      });
    }

    res.status(200).json({
      success: true,
      attempt,
    });
  } catch (error) {
    console.error("Get Attempt Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch test attempt.",
    });
  }
};

module.exports = { submitTest, getTestHistory, getTestAttempt };
