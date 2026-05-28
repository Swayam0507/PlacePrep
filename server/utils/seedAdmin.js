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
  name: "Admin",
  email: "admin@placeprep.com",
  password: "Admin@123",
  role: "admin",
  branch: "Administration",
  semester: 1,
  cgpa: 10,
};

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("📦 Connected to MongoDB");

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: ADMIN_DATA.email });

    if (existingAdmin) {
      console.log("✅ Admin user already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);

      // Ensure role is admin
      if (existingAdmin.role !== "admin") {
        existingAdmin.role = "admin";
        await existingAdmin.save();
        console.log("   → Updated role to admin");
      }
    } else {
      const admin = await User.create(ADMIN_DATA);
      console.log("✅ Admin user created successfully:");
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Password: Admin@123`);
      console.log(`   Role: ${admin.role}`);
    }

    await mongoose.connection.close();
    console.log("\n📦 Database connection closed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error.message);
    process.exit(1);
  }
};

seedAdmin();
