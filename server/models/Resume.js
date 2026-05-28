const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    education: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    parsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick user lookups
resumeSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Resume", resumeSchema);
