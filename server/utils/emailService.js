const nodemailer = require("nodemailer");

/**
 * Create email transporter
 * Uses Ethereal (fake SMTP) for development, real SMTP for production
 */
const createTransporter = async () => {
  // If real SMTP credentials are provided, use them
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || "smtp.gmail.com",
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: process.env.EMAIL_SECURE === "true",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Fallback: create Ethereal test account (fake SMTP)
  const testAccount = await nodemailer.createTestAccount();
  console.log("📧 Using Ethereal test account:", testAccount.user);

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

/**
 * Send a welcome email to a newly registered user
 */
const sendWelcomeEmail = async (user) => {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 30px; }
          .header { background: linear-gradient(135deg, #6366f1, #06b6d4); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { background: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; line-height: 1.6; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #06b6d4); color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to PlaceEdge!</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>We are thrilled to have you join PlaceEdge! Your account has been successfully created.</p>
            <p>Here’s what you can do next:</p>
            <ul>
              <li>Take aptitude tests to gauge your skills</li>
              <li>Check out the leaderboard to see how you stack up</li>
              <li>Practice with expert-curated interview questions</li>
              <li>Track your applications and placement drives</li>
            </ul>
            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/dashboard" class="btn">
                Go to Dashboard
              </a>
            </div>
            <div class="footer">
              <p>Automated email from Smart Placement Platform.</p>
              <p>© ${new Date().getFullYear()} PlaceEdge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"PlaceEdge" <${process.env.EMAIL_USER || "noreply@PlaceEdge.com"}>`,
      to: user.email,
      subject: `Welcome to PlaceEdge, ${user.name}! 🚀`,
      html: emailHtml,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Welcome Email Preview:", previewUrl);
    
    return true;
  } catch (error) {
    console.error("Welcome Email Error:", error);
    return false;
  }
};

/**
 * Send test result email internally
 */
const sendTestResultEmailInternal = async (user, attempt) => {
  try {
    const scoreColor = attempt.percentage >= 70 ? "#10b981" : attempt.percentage >= 40 ? "#f59e0b" : "#ef4444";
    const gradeEmoji = attempt.percentage >= 80 ? "🌟" : attempt.percentage >= 60 ? "👍" : attempt.percentage >= 40 ? "💪" : "📚";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 30px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { background: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; }
          .score-card { background: #0f172a; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
          .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
          .score-label { color: #94a3b8; font-size: 14px; margin-top: 5px; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📋 Test Result Report</h1>
            <p>Smart Placement Preparation Platform</p>
          </div>
          <div class="body">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Here's your performance summary for the <strong>${attempt.category.toUpperCase()}</strong> test:</p>

            <div class="score-card">
              <div class="score">${gradeEmoji} ${attempt.percentage}%</div>
              <div class="score-label">Overall Score</div>
            </div>

            <table width="100%" cellpadding="10" style="margin: 20px 0;">
              <tr>
                <td style="text-align:center; background: #0f172a; border-radius: 8px; padding: 15px;">
                  <div style="font-size: 22px; font-weight: bold; color: #f8fafc;">${attempt.score}</div>
                  <div style="font-size: 12px; color: #94a3b8;">Correct</div>
                </td>
                <td style="text-align:center; background: #0f172a; border-radius: 8px; padding: 15px;">
                  <div style="font-size: 22px; font-weight: bold; color: #f8fafc;">${attempt.totalQuestions}</div>
                  <div style="font-size: 12px; color: #94a3b8;">Total Questions</div>
                </td>
                <td style="text-align:center; background: #0f172a; border-radius: 8px; padding: 15px;">
                  <div style="font-size: 22px; font-weight: bold; color: #f8fafc;">${attempt.difficulty || "medium"}</div>
                  <div style="font-size: 12px; color: #94a3b8;">Difficulty</div>
                </td>
              </tr>
            </table>

            <p style="color: #94a3b8;">
              ${attempt.percentage >= 70
                ? "🎉 Excellent performance! Keep up the great work."
                : attempt.percentage >= 40
                ? "💡 Good effort! Focus on your weak areas to improve further."
                : "📖 Keep practicing! Review the topics and try again."
              }
            </p>

            <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}/test-history" class="btn">
                View Full History →
              </a>
            </div>

            <div class="footer">
              <p>Automated email from Smart Placement Platform.</p>
              <p>© ${new Date().getFullYear()} PlaceEdge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"PlaceEdge" <${process.env.EMAIL_USER || "noreply@PlaceEdge.com"}>`,
      to: user.email,
      subject: `📋 Your ${attempt.category} Test Result — ${attempt.percentage}%`,
      html: emailHtml,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Test Result Email Preview:", previewUrl);

    return true;
  } catch (error) {
    console.error("Test Result Email Error:", error);
    return false;
  }
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  try {
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 30px; }
          .header { background: linear-gradient(135deg, #ef4444, #f59e0b); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { background: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; line-height: 1.6; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #ef4444, #f59e0b); color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔒 Password Reset Request</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>You requested a password reset for your PlaceEdge account.</p>
            <p>Please click the button below to set a new password. This link is valid for 10 minutes.</p>
            <div style="text-align: center;">
              <a href="${resetUrl}" class="btn">
                Reset Password
              </a>
            </div>
            <p style="margin-top: 25px; font-size: 0.9em; color: #94a3b8;">If you did not request this reset, you can safely ignore this email.</p>
            <div class="footer">
              <p>Automated email from Smart Placement Platform.</p>
              <p>© ${new Date().getFullYear()} PlaceEdge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"PlaceEdge Support" <${process.env.EMAIL_USER || "noreply@PlaceEdge.com"}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: emailHtml,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log("📧 Password Reset Email Preview:", previewUrl);

    return true;
  } catch (error) {
    console.error("Password Reset Email Error:", error);
    return false;
  }
};

module.exports = { sendWelcomeEmail, sendTestResultEmailInternal, sendPasswordResetEmail };
