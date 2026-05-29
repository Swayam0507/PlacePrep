const TestAttempt = require("../models/TestAttempt");
const Certificate = require("../models/Certificate");
const User = require("../models/User");
const crypto = require("crypto");

/**
 * @desc    Get leaderboard
 * @route   GET /api/leaderboard?period=all&category=&branch=&limit=20
 * @access  Private
 */
const getLeaderboard = async (req, res) => {
  try {
    const { period = "all", category, branch, limit = 20 } = req.query;

    const matchStage = {};
    if (category && category !== "all") matchStage.category = category;

    // Time filter
    if (period === "weekly") {
      matchStage.createdAt = { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) };
    } else if (period === "monthly") {
      matchStage.createdAt = { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) };
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: "$userId",
          avgScore: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
          totalTests: { $sum: 1 },
          totalCorrect: { $sum: "$score" },
          totalQuestions: { $sum: "$totalQuestions" },
        },
      },
      { $sort: { avgScore: -1, totalTests: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      { $match: { "user.role": "student" } },
    ];

    // Branch filter
    if (branch) {
      pipeline.push({ $match: { "user.branch": branch } });
    }

    pipeline.push({
      $project: {
        _id: 1,
        name: "$user.name",
        branch: "$user.branch",
        semester: "$user.semester",
        avgScore: { $round: ["$avgScore", 1] },
        bestScore: 1,
        totalTests: 1,
        accuracy: {
          $round: [{ $multiply: [{ $divide: ["$totalCorrect", { $max: ["$totalQuestions", 1] }] }, 100] }, 1],
        },
      },
    });

    const leaderboard = await TestAttempt.aggregate(pipeline);

    res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error("Leaderboard Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch leaderboard." });
  }
};

/**
 * @desc    Get peer comparison stats
 * @route   GET /api/leaderboard/compare
 * @access  Private
 */
const getPeerComparison = async (req, res) => {
  try {
    const userId = req.user._id;

    // My stats
    const myStats = await TestAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          avgScore: { $avg: "$percentage" },
          totalTests: { $sum: 1 },
          bestScore: { $max: "$percentage" },
        },
      },
    ]);

    // Global average
    const globalStats = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$userId",
          avgScore: { $avg: "$percentage" },
        },
      },
      {
        $group: {
          _id: null,
          overallAvg: { $avg: "$avgScore" },
          totalStudents: { $sum: 1 },
        },
      },
    ]);

    // My rank
    const allUserScores = await TestAttempt.aggregate([
      { $group: { _id: "$userId", avgScore: { $avg: "$percentage" } } },
      { $sort: { avgScore: -1 } },
    ]);

    const myRank = allUserScores.findIndex((u) => u._id.toString() === userId.toString()) + 1;

    // Branch average
    let branchAvg = null;
    if (req.user.branch) {
      const branchUsers = await User.find({ branch: req.user.branch, role: "student" }).select("_id");
      const branchIds = branchUsers.map((u) => u._id);
      const branchStats = await TestAttempt.aggregate([
        { $match: { userId: { $in: branchIds } } },
        { $group: { _id: null, avgScore: { $avg: "$percentage" } } },
      ]);
      branchAvg = branchStats.length > 0 ? Math.round(branchStats[0].avgScore) : 0;
    }

    // Percentile
    const percentile = allUserScores.length > 0
      ? Math.round(((allUserScores.length - myRank) / allUserScores.length) * 100)
      : 0;

    res.status(200).json({
      success: true,
      comparison: {
        myAvgScore: myStats.length > 0 ? Math.round(myStats[0].avgScore) : 0,
        myTotalTests: myStats.length > 0 ? myStats[0].totalTests : 0,
        myBestScore: myStats.length > 0 ? myStats[0].bestScore : 0,
        myRank,
        percentile,
        globalAvg: globalStats.length > 0 ? Math.round(globalStats[0].overallAvg) : 0,
        totalStudents: globalStats.length > 0 ? globalStats[0].totalStudents : 0,
        branchAvg,
      },
    });
  } catch (error) {
    console.error("Peer Comparison Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch comparison." });
  }
};

/**
 * @desc    Get user's certificates
 * @route   GET /api/certificates
 * @access  Private
 */
const getCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, certificates });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch certificates." });
  }
};

/**
 * @desc    Check and award certificates based on milestones
 * @route   POST /api/certificates/check
 * @access  Private
 */
const checkAndAwardCertificates = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);
    const totalTests = await TestAttempt.countDocuments({ userId });
    const avgResult = await TestAttempt.aggregate([
      { $match: { userId } },
      { $group: { _id: null, avg: { $avg: "$percentage" } } },
    ]);
    const avgScore = avgResult.length > 0 ? Math.round(avgResult[0].avg) : 0;

    const newCerts = [];

    // Milestone: 10 tests
    const milestones = [
      { count: 10, title: "Test Starter", desc: "Completed 10 aptitude tests" },
      { count: 50, title: "Test Warrior", desc: "Completed 50 aptitude tests" },
      { count: 100, title: "Test Champion", desc: "Completed 100 aptitude tests" },
    ];

    for (const m of milestones) {
      if (totalTests >= m.count) {
        const exists = await Certificate.findOne({ userId, type: "test-milestone", "metadata.testsCompleted": m.count });
        if (!exists) {
          const cert = await Certificate.create({
            userId,
            type: "test-milestone",
            title: m.title,
            description: m.desc,
            certificateId: `CERT-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
            metadata: { testsCompleted: m.count, score: avgScore },
          });
          newCerts.push(cert);
        }
      }
    }

    // Top performer: avg > 80%
    if (avgScore >= 80 && totalTests >= 5) {
      const exists = await Certificate.findOne({ userId, type: "top-performer" });
      if (!exists) {
        const cert = await Certificate.create({
          userId,
          type: "top-performer",
          title: "Top Performer",
          description: `Achieved ${avgScore}% average score across ${totalTests} tests`,
          certificateId: `CERT-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
          metadata: { score: avgScore, testsCompleted: totalTests },
        });
        newCerts.push(cert);
      }
    }

    res.status(200).json({ success: true, newCertificates: newCerts, totalCertificates: await Certificate.countDocuments({ userId }) });
  } catch (error) {
    console.error("Check Certificates Error:", error);
    res.status(500).json({ success: false, message: "Failed to check certificates." });
  }
};

/**
 * @desc    Get resume score
 * @route   POST /api/resume-score
 * @access  Private
 */
const getResumeScore = async (req, res) => {
  try {
    const { skills = [], education = "", experience = "", fileName = "" } = req.body;

    let score = 0;
    const feedback = [];

    // Skills (40 points)
    const skillCount = skills.length;
    if (skillCount >= 10) { score += 40; }
    else if (skillCount >= 7) { score += 30; feedback.push("Add more technical skills to strengthen your resume."); }
    else if (skillCount >= 4) { score += 20; feedback.push("Your skill set is limited. Consider adding more relevant skills."); }
    else { score += skillCount * 3; feedback.push("Very few skills listed. Add programming languages, frameworks, and tools."); }

    // Education (15 points)
    if (education && education.length > 20) { score += 15; }
    else if (education) { score += 8; feedback.push("Expand your education section with more details."); }
    else { feedback.push("Missing education details. Add your degree, university, and GPA."); }

    // Experience (20 points)
    if (experience && experience.length > 50) { score += 20; }
    else if (experience) { score += 10; feedback.push("Add more details about your work experience."); }
    else { feedback.push("No experience section found. Add internships or project experience."); }

    // File format (10 points)
    if (fileName.endsWith(".pdf")) { score += 10; }
    else { score += 5; feedback.push("Use PDF format for best compatibility with ATS systems."); }

    // Keywords check (15 points)
    const importantKeywords = ["project", "team", "develop", "lead", "manage", "implement", "design", "analyze"];
    const allText = `${skills.join(" ")} ${education} ${experience}`.toLowerCase();
    const keywordMatches = importantKeywords.filter((kw) => allText.includes(kw));
    score += Math.min(keywordMatches.length * 2, 15);
    if (keywordMatches.length < 3) {
      feedback.push("Use action verbs like 'developed', 'led', 'implemented' to describe achievements.");
    }

    score = Math.min(score, 100);

    let rating = "Poor";
    if (score >= 80) rating = "Excellent";
    else if (score >= 60) rating = "Good";
    else if (score >= 40) rating = "Average";
    else rating = "Needs Improvement";

    res.status(200).json({
      success: true,
      resumeScore: {
        score,
        rating,
        feedback,
        breakdown: {
          skills: Math.min(skillCount >= 10 ? 40 : skillCount * 4, 40),
          education: education ? (education.length > 20 ? 15 : 8) : 0,
          experience: experience ? (experience.length > 50 ? 20 : 10) : 0,
          format: fileName.endsWith(".pdf") ? 10 : 5,
          keywords: Math.min(keywordMatches.length * 2, 15),
        },
      },
    });
  } catch (error) {
    console.error("Resume Score Error:", error);
    res.status(500).json({ success: false, message: "Failed to calculate resume score." });
  }
};

/**
 * @desc    Bulk import aptitude questions (admin)
 * @route   POST /api/questions/bulk
 * @access  Private/Admin
 */
const bulkImportQuestions = async (req, res) => {
  try {
    const Question = require("../models/Question");
    const { questions } = req.body;

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "questions array is required." });
    }

    // Validate each question
    const valid = [];
    const errors = [];
    questions.forEach((q, i) => {
      if (!q.category || !q.question || !q.options || q.options.length !== 4 || q.correctAnswer === undefined) {
        errors.push(`Question ${i + 1}: missing required fields.`);
      } else {
        valid.push({
          category: q.category,
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          difficulty: q.difficulty || "medium",
          explanation: q.explanation || "",
        });
      }
    });

    let inserted = [];
    if (valid.length > 0) {
      inserted = await Question.insertMany(valid, { ordered: false });
    }

    res.status(201).json({
      success: true,
      message: `${inserted.length} questions imported successfully.`,
      imported: inserted.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Bulk Import Error:", error);
    res.status(500).json({ success: false, message: "Failed to import questions." });
  }
};

module.exports = {
  getLeaderboard,
  getPeerComparison,
  getCertificates,
  checkAndAwardCertificates,
  getResumeScore,
  bulkImportQuestions,
};
