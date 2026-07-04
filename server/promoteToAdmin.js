const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

// Load env vars
dotenv.config();

const promoteUser = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected");

    // Replace this email with your actual registered email
    const targetEmail = "YOUR_EMAIL_HERE@example.com"; 
    
    // Find the user and update their role
    const user = await User.findOneAndUpdate(
      { email: targetEmail },
      { role: "admin" },
      { new: true }
    );

    if (user) {
      console.log(`🎉 Success! The user ${user.email} is now an ADMIN.`);
    } else {
      console.log(`❌ User with email ${targetEmail} not found. Did you register first?`);
    }

    process.exit(0);
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

promoteUser();
