const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
      enum: ["quantitative", "logical", "technical"],
      index: true,
    },
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => v.length === 4,
        message: "Each question must have exactly 4 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    explanation: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", questionSchema);
