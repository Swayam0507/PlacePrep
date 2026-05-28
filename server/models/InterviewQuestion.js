const mongoose = require("mongoose");

const interviewQuestionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["hr", "technical", "behavioral", "company-specific"],
      index: true,
    },
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    sampleAnswer: {
      type: String,
      default: "",
    },
    tips: [{ type: String }],
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    company: {
      type: String,
      default: "",
      trim: true,
    },
    tags: [{ type: String, trim: true }],
  },
  {
    timestamps: true,
  }
);

interviewQuestionSchema.index({ category: 1, difficulty: 1 });
interviewQuestionSchema.index({ company: 1 });

module.exports = mongoose.model("InterviewQuestion", interviewQuestionSchema);
