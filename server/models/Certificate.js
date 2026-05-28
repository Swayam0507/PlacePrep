const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["test-milestone", "streak", "top-performer", "course-completion"],
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },
    metadata: {
      score: Number,
      testsCompleted: Number,
      streakDays: Number,
      rank: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Certificate", certificateSchema);
