const mongoose = require("mongoose");

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },
    notes: {
      type: String,
      default: "",
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("Bookmark", bookmarkSchema);
