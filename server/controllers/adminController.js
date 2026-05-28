const User = require("../models/User");
const Question = require("../models/Question");
const TestAttempt = require("../models/TestAttempt");
const Resume = require("../models/Resume");

/**
 * @desc    Get all users (with pagination, search, filters)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role = "",
      sort = "-createdAt",
    } = req.query;

    const filter = {};

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by role
    if (role && ["student", "admin"].includes(role)) {
      filter.role = role;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      User.countDocuments(filter),
    ]);

    // Enrich with test stats
    const enrichedUsers = await Promise.all(
      users.map(async (user) => {
        const testCount = await TestAttempt.countDocuments({ userId: user._id });
        const avgResult = await TestAttempt.aggregate([
          { $match: { userId: user._id } },
          { $group: { _id: null, avgScore: { $avg: "$percentage" } } },
        ]);

        return {
          ...user,
          totalTests: testCount,
          avgScore: avgResult.length > 0 ? Math.round(avgResult[0].avgScore) : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      users: enrichedUsers,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Get All Users Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch users." });
  }
};

/**
 * @desc    Update user role/details
 * @route   PUT /api/admin/users/:id
 * @access  Private/Admin
 */
const updateUser = async (req, res) => {
  try {
    const { role, branch, semester } = req.body;

    const updateData = {};
    if (role && ["student", "admin"].includes(role)) updateData.role = role;
    if (branch !== undefined) updateData.branch = branch;
    if (semester !== undefined) updateData.semester = semester;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ success: false, message: "Failed to update user." });
  }
};

/**
 * @desc    Delete user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account from admin panel.",
      });
    }

    // Delete related data
    await Promise.all([
      TestAttempt.deleteMany({ userId: user._id }),
      Resume.deleteMany({ userId: user._id }),
    ]);

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "User and related data deleted successfully.",
    });
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).json({ success: false, message: "Failed to delete user." });
  }
};

/**
 * @desc    Get platform-wide analytics
 * @route   GET /api/admin/analytics
 * @access  Private/Admin
 */
const getAdminAnalytics = async (req, res) => {
  try {
    // Overall counts
    const [totalUsers, totalStudents, totalAdmins, totalQuestions, totalTests] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ role: "student" }),
        User.countDocuments({ role: "admin" }),
        Question.countDocuments(),
        TestAttempt.countDocuments(),
      ]);

    // Average score across all tests
    const avgScoreResult = await TestAttempt.aggregate([
      { $group: { _id: null, avgScore: { $avg: "$percentage" } } },
    ]);
    const avgScore = avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0;

    // Category performance
    const categoryPerformance = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$category",
          avgScore: { $avg: "$percentage" },
          totalAttempts: { $sum: 1 },
          bestScore: { $max: "$percentage" },
          worstScore: { $min: "$percentage" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Difficulty distribution
    const difficultyStats = await Question.aggregate([
      { $group: { _id: "$difficulty", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Category distribution
    const categoryDistribution = await Question.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Recent test activity (last 30 days)
    const recentTests = await TestAttempt.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Top performers
    const topPerformers = await TestAttempt.aggregate([
      {
        $group: {
          _id: "$userId",
          avgScore: { $avg: "$percentage" },
          totalTests: { $sum: 1 },
        },
      },
      { $match: { totalTests: { $gte: 2 } } },
      { $sort: { avgScore: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          name: "$user.name",
          email: "$user.email",
          avgScore: { $round: ["$avgScore", 1] },
          totalTests: 1,
        },
      },
    ]);

    // Score distribution (buckets)
    const scoreDistribution = await TestAttempt.aggregate([
      {
        $bucket: {
          groupBy: "$percentage",
          boundaries: [0, 20, 40, 60, 80, 101],
          default: "other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        overview: {
          totalUsers,
          totalStudents,
          totalAdmins,
          totalQuestions,
          totalTests,
          avgScore,
        },
        categoryPerformance: categoryPerformance.map((c) => ({
          category: c._id,
          avgScore: Math.round(c.avgScore),
          totalAttempts: c.totalAttempts,
          bestScore: c.bestScore,
          worstScore: c.worstScore,
        })),
        difficultyStats: difficultyStats.map((d) => ({
          difficulty: d._id,
          count: d.count,
        })),
        categoryDistribution: categoryDistribution.map((c) => ({
          category: c._id,
          count: c.count,
        })),
        recentRegistrations,
        recentTests: recentTests.map((t) => ({
          date: t._id,
          count: t.count,
          avgScore: Math.round(t.avgScore),
        })),
        topPerformers,
        scoreDistribution: scoreDistribution.map((s) => ({
          range:
            s._id === "other"
              ? "Other"
              : `${s._id}-${s._id + 19}%`,
          count: s.count,
        })),
      },
    });
  } catch (error) {
    console.error("Admin Analytics Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin analytics.",
    });
  }
};

/**
 * @desc    Export reports as CSV
 * @route   GET /api/admin/export
 * @access  Private/Admin
 */
const exportReports = async (req, res) => {
  try {
    const { type = "users" } = req.query;

    if (type === "users") {
      const users = await User.find().select("-password").lean();
      const testStats = await TestAttempt.aggregate([
        {
          $group: {
            _id: "$userId",
            totalTests: { $sum: 1 },
            avgScore: { $avg: "$percentage" },
          },
        },
      ]);

      const statsMap = {};
      testStats.forEach((s) => {
        statsMap[s._id.toString()] = s;
      });

      const csvHeader = "Name,Email,Role,Branch,Semester,CGPA,Total Tests,Avg Score,Registered\n";
      const csvRows = users.map((u) => {
        const stats = statsMap[u._id.toString()] || { totalTests: 0, avgScore: 0 };
        return `"${u.name}","${u.email}","${u.role}","${u.branch || ""}",${u.semester || ""},${u.cgpa || ""},${stats.totalTests},${Math.round(stats.avgScore || 0)},${u.createdAt?.toISOString() || ""}`;
      });

      const csv = csvHeader + csvRows.join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=users_report_${Date.now()}.csv`);
      return res.status(200).send(csv);
    }

    if (type === "tests") {
      const tests = await TestAttempt.find()
        .populate("userId", "name email")
        .sort("-createdAt")
        .lean();

      const csvHeader = "Student,Email,Category,Score,Total,Percentage,Difficulty,Date\n";
      const csvRows = tests.map((t) => {
        return `"${t.userId?.name || "Unknown"}","${t.userId?.email || ""}","${t.category}",${t.score},${t.totalQuestions},${t.percentage},"${t.difficulty || ""}","${t.createdAt?.toISOString() || ""}"`;
      });

      const csv = csvHeader + csvRows.join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=tests_report_${Date.now()}.csv`);
      return res.status(200).send(csv);
    }

    res.status(400).json({
      success: false,
      message: "Invalid export type. Use 'users' or 'tests'.",
    });
  } catch (error) {
    console.error("Export Error:", error);
    res.status(500).json({ success: false, message: "Failed to export report." });
  }
};

module.exports = {
  getAllUsers,
  updateUser,
  deleteUser,
  getAdminAnalytics,
  exportReports,
};
