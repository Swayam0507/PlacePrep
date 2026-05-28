const mongoose = require("mongoose");

const testAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["quantitative", "logical", "technical", "mixed"],
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        selectedAnswer: {
          type: Number, // index of selected option
          default: -1, // -1 = unanswered
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    timeTaken: {
      type: Number, // seconds
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient history queries
testAttemptSchema.index({ userId: 1, createdAt: -1 });
testAttemptSchema.index({ userId: 1, category: 1 });

module.exports = mongoose.model("TestAttempt", testAttemptSchema);
