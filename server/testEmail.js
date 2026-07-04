const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const testEmailConnection = async () => {
  console.log("Testing email connection with:");
  console.log("User:", process.env.EMAIL_USER);
  console.log("Pass:", process.env.EMAIL_PASS ? "**** (Length: " + process.env.EMAIL_PASS.length + ")" : "NOT SET");

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("Verifying connection to SMTP server...");
    await transporter.verify();
    console.log("✅ Success! Your email credentials are correct.");
    process.exit(0);
  } catch (error) {
    console.log("\n❌ Failed to connect to SMTP server.");
    console.log("Error details:");
    console.log(error.message);
    
    if (error.message.includes("Application-specific password required")) {
      console.log("\n👉 THIS MEANS: You are using your normal Gmail password. Google blocks this.");
      console.log("You must go to your Google Account -> Security -> App Passwords and generate a 16-character App Password to use in your .env file.");
    }
    
    process.exit(1);
  }
};

testEmailConnection();
