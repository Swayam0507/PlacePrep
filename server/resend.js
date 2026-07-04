const { sendWelcomeEmail } = require("./utils/emailService");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const resendWelcome = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Find the real user
    const user = await User.findOne({ email: "swayamvaghani6500@gmail.com" });
    
    if (user) {
      console.log(`Sending welcome email to ${user.email}...`);
      await sendWelcomeEmail(user);
      console.log("✅ Email sent successfully!");
    } else {
      console.log("User not found.");
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
};

resendWelcome();
