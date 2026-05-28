const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  }
);

const forumPostSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Post title is required"],
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: [true, "Post content is required"],
      maxlength: 5000,
    },
    category: {
      type: String,
      enum: ["placement-tips", "company-reviews", "doubt-clearing", "resources", "general"],
      default: "general",
    },
    tags: [{ type: String, trim: true }],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    replies: [replySchema],
    isPinned: {
      type: Boolean,
      default: false,
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

forumPostSchema.index({ category: 1, createdAt: -1 });
forumPostSchema.index({ userId: 1 });

module.exports = mongoose.model("ForumPost", forumPostSchema);
