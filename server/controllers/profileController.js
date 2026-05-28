const User = require("../models/User");
const TestAttempt = require("../models/TestAttempt");
const Resume = require("../models/Resume");

/**
 * @desc    Update user profile
 * @route   PUT /api/profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const { name, branch, semester, cgpa, bio, phone, linkedin, github, skills } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (branch !== undefined) updateData.branch = branch;
    if (semester) updateData.semester = semester;
    if (cgpa !== undefined) updateData.cgpa = cgpa;
    if (bio !== undefined) updateData.bio = bio;
    if (phone !== undefined) updateData.phone = phone;
    if (linkedin !== undefined) updateData.linkedin = linkedin;
    if (github !== undefined) updateData.github = github;
    if (skills) updateData.skills = skills;

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        cgpa: user.cgpa,
        bio: user.bio,
        phone: user.phone,
        linkedin: user.linkedin,
        github: user.github,
        skills: user.skills,
        theme: user.theme,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
};

/**
 * @desc    Get full profile with stats
 * @route   GET /api/profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const totalTests = await TestAttempt.countDocuments({ userId: req.user._id });
    const resumeCount = await Resume.countDocuments({ userId: req.user._id });

    const avgScoreResult = await TestAttempt.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: null, avgScore: { $avg: "$percentage" } } },
    ]);

    res.status(200).json({
      success: true,
      profile: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branch: user.branch,
        semester: user.semester,
        cgpa: user.cgpa,
        bio: user.bio,
        phone: user.phone,
        linkedin: user.linkedin,
        github: user.github,
        skills: user.skills,
        theme: user.theme,
        streak: user.streak,
        badges: user.badges,
        createdAt: user.createdAt,
        stats: {
          totalTests,
          resumeCount,
          avgScore: avgScoreResult.length > 0 ? Math.round(avgScoreResult[0].avgScore) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile.",
    });
  }
};

/**
 * @desc    Toggle theme preference
 * @route   PUT /api/profile/theme
 * @access  Private
 */
const toggleTheme = async (req, res) => {
  try {
    const { theme } = req.body;
    if (!["dark", "light"].includes(theme)) {
      return res.status(400).json({ success: false, message: "Invalid theme." });
    }
    await User.findByIdAndUpdate(req.user._id, { theme });
    res.status(200).json({ success: true, theme });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update theme." });
  }
};

module.exports = { updateProfile, getProfile, toggleTheme };
