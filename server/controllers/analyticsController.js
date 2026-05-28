const TestAttempt = require("../models/TestAttempt");
const Resume = require("../models/Resume");

/**
 * @desc    Get dashboard analytics for current user
 * @route   GET /api/analytics/dashboard
 * @access  Private
 */
const getDashboardAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. Overall stats
    const allAttempts = await TestAttempt.find({ userId }).sort({ createdAt: 1 }).lean();

    const totalTests = allAttempts.length;
    const avgScore =
      totalTests > 0
        ? Math.round(allAttempts.reduce((sum, a) => sum + a.percentage, 0) / totalTests)
        : 0;

    // 2. Category-wise performance
    const categoryStats = await TestAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$category",
          totalAttempts: { $sum: 1 },
          avgPercentage: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
          totalQuestions: { $sum: "$totalQuestions" },
          totalCorrect: { $sum: "$score" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // 3. Performance trend (last 10 tests)
    const recentAttempts = allAttempts.slice(-10).map((a) => ({
      date: a.createdAt,
      percentage: a.percentage,
      category: a.category,
      score: a.score,
      totalQuestions: a.totalQuestions,
    }));

    // 4. Weak areas — categories where avg < 50%
    const weakAreas = categoryStats
      .filter((c) => c.avgPercentage < 50)
      .map((c) => ({
        category: c._id,
        avgPercentage: Math.round(c.avgPercentage),
        attempts: c.totalAttempts,
      }));

    // 5. Strong areas — categories where avg >= 70%
    const strongAreas = categoryStats
      .filter((c) => c.avgPercentage >= 70)
      .map((c) => ({
        category: c._id,
        avgPercentage: Math.round(c.avgPercentage),
        attempts: c.totalAttempts,
      }));

    // 6. Placement readiness score (weighted average)
    let readinessScore = 0;
    if (categoryStats.length > 0) {
      const weights = {
        quantitative: 0.3,
        logical: 0.3,
        technical: 0.4,
      };

      let weightedSum = 0;
      let totalWeight = 0;

      categoryStats.forEach((cat) => {
        const w = weights[cat._id] || 0.33;
        weightedSum += cat.avgPercentage * w;
        totalWeight += w;
      });

      readinessScore = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 0;
    }

    // 7. Resume status
    const resumeCount = await Resume.countDocuments({ userId });
    const latestResume = await Resume.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    // 8. Difficulty breakdown
    const difficultyStats = await TestAttempt.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: "$difficulty",
          avgPercentage: { $avg: "$percentage" },
          count: { $sum: 1 },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalTests,
          avgScore,
          readinessScore,
          resumeCount,
          latestResume: latestResume
            ? {
                fileName: latestResume.originalName,
                skills: latestResume.skills,
                uploadDate: latestResume.createdAt,
              }
            : null,
        },
        categoryPerformance: categoryStats.map((c) => ({
          category: c._id,
          avgPercentage: Math.round(c.avgPercentage),
          bestScore: c.bestScore,
          totalAttempts: c.totalAttempts,
          accuracy: c.totalQuestions > 0
            ? Math.round((c.totalCorrect / c.totalQuestions) * 100)
            : 0,
        })),
        performanceTrend: recentAttempts,
        weakAreas,
        strongAreas,
        difficultyBreakdown: difficultyStats.map((d) => ({
          difficulty: d._id,
          avgPercentage: Math.round(d.avgPercentage),
          count: d.count,
        })),
      },
    });
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics.",
    });
  }
};

module.exports = { getDashboardAnalytics };
