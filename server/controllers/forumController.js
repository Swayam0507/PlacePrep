const ForumPost = require("../models/ForumPost");

/**
 * @desc    Get forum posts (paginated, filterable)
 * @route   GET /api/forum?category=&search=&page=1&limit=10
 * @access  Private
 */
const getPosts = async (req, res) => {
  try {
    const { category, search, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (search) filter.title = { $regex: search, $options: "i" };

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      ForumPost.find(filter)
        .populate("userId", "name role branch")
        .populate("replies.userId", "name role")
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      ForumPost.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      posts,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: total,
      },
    });
  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch posts." });
  }
};

/**
 * @desc    Get single post
 * @route   GET /api/forum/:id
 * @access  Private
 */
const getPost = async (req, res) => {
  try {
    const post = await ForumPost.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate("userId", "name role branch")
      .populate("replies.userId", "name role")
      .lean();

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch post." });
  }
};

/**
 * @desc    Create a forum post
 * @route   POST /api/forum
 * @access  Private
 */
const createPost = async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    const post = await ForumPost.create({
      userId: req.user._id,
      title,
      content,
      category: category || "general",
      tags: tags || [],
    });

    const populated = await ForumPost.findById(post._id)
      .populate("userId", "name role branch")
      .lean();

    res.status(201).json({ success: true, message: "Post created!", post: populated });
  } catch (error) {
    console.error("Create Post Error:", error);
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join(". ") });
    }
    res.status(500).json({ success: false, message: "Failed to create post." });
  }
};

/**
 * @desc    Delete a forum post (owner or admin)
 * @route   DELETE /api/forum/:id
 * @access  Private
 */
const deletePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found." });
    }

    if (post.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await ForumPost.deleteOne({ _id: post._id });
    res.status(200).json({ success: true, message: "Post deleted." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete post." });
  }
};

/**
 * @desc    Upvote/un-upvote a post
 * @route   POST /api/forum/:id/upvote
 * @access  Private
 */
const upvotePost = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    const idx = post.upvotes.indexOf(req.user._id);
    if (idx > -1) {
      post.upvotes.splice(idx, 1);
    } else {
      post.upvotes.push(req.user._id);
    }
    await post.save();

    res.status(200).json({ success: true, upvotes: post.upvotes.length, upvoted: idx === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upvote." });
  }
};

/**
 * @desc    Add a reply to a post
 * @route   POST /api/forum/:id/reply
 * @access  Private
 */
const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Reply content is required." });
    }

    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    post.replies.push({ userId: req.user._id, content });
    await post.save();

    const updated = await ForumPost.findById(post._id)
      .populate("userId", "name role branch")
      .populate("replies.userId", "name role")
      .lean();

    res.status(201).json({ success: true, post: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to add reply." });
  }
};

/**
 * @desc    Pin/unpin a post (admin only)
 * @route   PUT /api/forum/:id/pin
 * @access  Private/Admin
 */
const togglePin = async (req, res) => {
  try {
    const post = await ForumPost.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: "Post not found." });

    post.isPinned = !post.isPinned;
    await post.save();

    res.status(200).json({ success: true, isPinned: post.isPinned });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to toggle pin." });
  }
};

module.exports = { getPosts, getPost, createPost, deletePost, upvotePost, addReply, togglePin };
