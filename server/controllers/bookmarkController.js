const Bookmark = require("../models/Bookmark");

/**
 * @desc    Toggle bookmark on a question
 * @route   POST /api/bookmarks/:questionId
 * @access  Private
 */
const toggleBookmark = async (req, res) => {
  try {
    const existing = await Bookmark.findOne({
      userId: req.user._id,
      questionId: req.params.questionId,
    });

    if (existing) {
      await Bookmark.deleteOne({ _id: existing._id });
      return res.status(200).json({ success: true, bookmarked: false, message: "Bookmark removed." });
    }

    await Bookmark.create({
      userId: req.user._id,
      questionId: req.params.questionId,
      notes: req.body.notes || "",
    });

    res.status(201).json({ success: true, bookmarked: true, message: "Question bookmarked." });
  } catch (error) {
    console.error("Toggle Bookmark Error:", error);
    res.status(500).json({ success: false, message: "Failed to toggle bookmark." });
  }
};

/**
 * @desc    Get all bookmarked questions
 * @route   GET /api/bookmarks
 * @access  Private
 */
const getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate("questionId", "category question options difficulty explanation correctAnswer")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, count: bookmarks.length, bookmarks });
  } catch (error) {
    console.error("Get Bookmarks Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch bookmarks." });
  }
};

/**
 * @desc    Check if specific questions are bookmarked
 * @route   POST /api/bookmarks/check
 * @access  Private
 */
const checkBookmarks = async (req, res) => {
  try {
    const { questionIds } = req.body;
    const bookmarks = await Bookmark.find({
      userId: req.user._id,
      questionId: { $in: questionIds },
    }).lean();
    const bookmarkedIds = bookmarks.map((b) => b.questionId.toString());
    res.status(200).json({ success: true, bookmarkedIds });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to check bookmarks." });
  }
};

module.exports = { toggleBookmark, getBookmarks, checkBookmarks };
