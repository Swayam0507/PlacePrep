const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const autoPromote = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB.");

    // Find all users
    const users = await User.find({});
    
    if (users.length === 0) {
      console.log("❌ No users found in the database. Please register an account on the website first.");
      process.exit(0);
    }

    // Promote all existing users to admin just to be safe
    for (const user of users) {
      user.role = "admin";
      await user.save();
      console.log(`✅ Promoted user to Admin: ${user.email} (Name: ${user.name})`);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

autoPromote();
