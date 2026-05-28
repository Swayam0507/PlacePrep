const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    branch: {
      type: String,
      trim: true,
      default: "",
    },
    semester: {
      type: Number,
      min: 1,
      max: 8,
      default: 1,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    // Profile enhancements
    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    phone: {
      type: String,
      default: "",
    },
    linkedin: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    skills: {
      type: [String],
      default: [],
    },
    // Theme preference
    theme: {
      type: String,
      enum: ["dark", "light"],
      default: "dark",
    },
    // Streak tracking
    streak: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastActiveDate: { type: Date },
    },
    // Badges/achievements
    badges: [
      {
        name: String,
        icon: String,
        earnedAt: { type: Date, default: Date.now },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // Set expire (10 minutes)
  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
