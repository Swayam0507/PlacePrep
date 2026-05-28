const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    industry: {
      type: String,
      default: "IT/Software",
    },
    website: {
      type: String,
      default: "",
    },
    package: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    eligibility: {
      minCGPA: { type: Number, default: 0 },
      branches: [{ type: String }],
      maxBacklogs: { type: Number, default: 0 },
    },
    visitDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
    },
    roles: [{ type: String }],
    description: {
      type: String,
      default: "",
    },
    selectionProcess: [{ type: String }],
    studentsPlaced: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

companySchema.index({ status: 1, visitDate: -1 });

module.exports = mongoose.model("Company", companySchema);
