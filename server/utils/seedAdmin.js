/**
 * Seed Admin User
 * Run: node utils/seedAdmin.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const ADMIN_DATA = {
  name: "Dr. Rajesh Kumar",
  email: "admin@placeprep.com",
  password: "Admin@2026",
  role: "admin",
  branch: "Training & Placement Cell",
  semester: 1,
  cgpa: 10,
  bio: "Head of Training & Placement Cell. 15+ years of experience in campus recruitment and student career development.",
  phone: "+91 98765 43210",
  skills: ["Student Mentoring", "Industry Relations", "Recruitment Strategy", "Career Counseling"],
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB");

    // Remove old admin accounts
    await User.deleteMany({ role: "admin" });
    console.log("🗑️  Removed old admin accounts");

    // Create fresh admin
    const admin = await User.create(ADMIN_DATA);
    console.log("✅ Admin user created successfully:");
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Password: Admin@2026`);
    console.log(`   Role: ${admin.role}`);

    await mongoose.connection.close();
    console.log("\n📦 Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
