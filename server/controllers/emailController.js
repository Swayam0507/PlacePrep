const nodemailer = require("nodemailer");
const User = require("../models/User");
const TestAttempt = require("../models/TestAttempt");

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
 * @desc    Send test result email to user
 * @route   POST /api/email/test-result
 * @access  Private
 */
const sendTestResultEmail = async (req, res) => {
  try {
    const userId = req.user._id;
    const { testAttemptId } = req.body;

    // Dynamically resolve client URL from request origin
    const origin = req.headers.origin || req.headers.referer;
    const clientUrl = origin ? origin.replace(/\/+$/, '') : (process.env.CLIENT_URL || 'http://localhost:5173');

    if (!testAttemptId) {
      return res.status(400).json({
        success: false,
        message: "testAttemptId is required.",
      });
    }

    // Fetch user and test attempt
    const user = await User.findById(userId);
    const attempt = await TestAttempt.findById(testAttemptId).populate({
      path: "answers.questionId",
      select: "question category",
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Test attempt not found.",
      });
    }

    // Build email HTML
    const scoreColor =
      attempt.percentage >= 70 ? "#10b981" : attempt.percentage >= 40 ? "#f59e0b" : "#ef4444";
    const gradeEmoji =
      attempt.percentage >= 80 ? "🌟" : attempt.percentage >= 60 ? "👍" : attempt.percentage >= 40 ? "💪" : "📚";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 30px; }
          .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .header p { color: #c7d2fe; margin: 10px 0 0; }
          .body { background: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; }
          .score-card { background: #0f172a; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
          .score { font-size: 48px; font-weight: bold; color: ${scoreColor}; }
          .score-label { color: #94a3b8; font-size: 14px; margin-top: 5px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-value { font-size: 20px; font-weight: bold; color: #f8fafc; }
          .stat-label { font-size: 12px; color: #94a3b8; margin-top: 4px; }
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
              <a href="${clientUrl}/test-history" class="btn">
                View Full History →
              </a>
            </div>

            <div class="footer">
              <p>This is an automated email from Smart Placement Platform.</p>
              <p>© ${new Date().getFullYear()} PlaceEdge. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: `"PlaceEdge" <${process.env.EMAIL_USER || "noreply@PlaceEdge.com"}>`,
      to: user.email,
      subject: `📋 Your ${attempt.category} Test Result — ${attempt.percentage}%`,
      html: emailHtml,
    });

    // If using Ethereal, provide preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.status(200).json({
      success: true,
      message: "Test result email sent successfully.",
      messageId: info.messageId,
      previewUrl: previewUrl || null,
    });
  } catch (error) {
    console.error("Send Test Result Email Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test result email.",
    });
  }
};

/**
 * @desc    Send placement readiness notification
 * @route   POST /api/email/placement-readiness
 * @access  Private
 */
const sendPlacementReadiness = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Dynamically resolve client URL from request origin
    const origin = req.headers.origin || req.headers.referer;
    const clientUrl = origin ? origin.replace(/\/+$/, '') : (process.env.CLIENT_URL || 'http://localhost:5173');

    // Compute analytics
    const attempts = await TestAttempt.find({ userId }).lean();
    const totalTests = attempts.length;
    const avgScore = totalTests > 0
      ? Math.round(attempts.reduce((sum, a) => sum + a.percentage, 0) / totalTests)
      : 0;

    // Category breakdown
    const categoryMap = {};
    attempts.forEach((a) => {
      if (!categoryMap[a.category]) {
        categoryMap[a.category] = { total: 0, sum: 0 };
      }
      categoryMap[a.category].total++;
      categoryMap[a.category].sum += a.percentage;
    });

    const categoryRows = Object.entries(categoryMap)
      .map(([cat, stats]) => {
        const avg = Math.round(stats.sum / stats.total);
        const color = avg >= 70 ? "#10b981" : avg >= 40 ? "#f59e0b" : "#ef4444";
        return `
          <tr>
            <td style="padding: 10px; color: #e2e8f0; text-transform: capitalize;">${cat}</td>
            <td style="padding: 10px; color: ${color}; font-weight: bold;">${avg}%</td>
            <td style="padding: 10px; color: #94a3b8;">${stats.total} tests</td>
          </tr>
        `;
      })
      .join("");

    // Readiness level
    let readinessLevel, readinessColor, readinessEmoji;
    if (avgScore >= 75) {
      readinessLevel = "Placement Ready";
      readinessColor = "#10b981";
      readinessEmoji = "🚀";
    } else if (avgScore >= 50) {
      readinessLevel = "Almost There";
      readinessColor = "#f59e0b";
      readinessEmoji = "⚡";
    } else {
      readinessLevel = "Needs Improvement";
      readinessColor = "#ef4444";
      readinessEmoji = "📚";
    }

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; padding: 30px; }
          .header { background: linear-gradient(135deg, #059669, #10b981); padding: 30px; border-radius: 16px 16px 0 0; text-align: center; }
          .header h1 { color: #fff; margin: 0; font-size: 24px; }
          .body { background: #1e293b; padding: 30px; border-radius: 0 0 16px 16px; }
          .readiness { background: #0f172a; border-radius: 12px; padding: 25px; text-align: center; margin: 20px 0; }
          .readiness-badge { font-size: 32px; font-weight: bold; color: ${readinessColor}; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; }
          th { text-align: left; padding: 10px; color: #64748b; border-bottom: 1px solid #334155; font-size: 12px; text-transform: uppercase; }
          td { border-bottom: 1px solid #1e293b; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
          .btn { display: inline-block; background: linear-gradient(135deg, #059669, #10b981); color: #fff; padding: 12px 30px; border-radius: 8px; text-decoration: none; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${readinessEmoji} Placement Readiness Report</h1>
          </div>
          <div class="body">
            <p>Hi <strong>${user.name}</strong>,</p>
            <p>Here's your placement readiness assessment based on your performance:</p>

            <div class="readiness">
              <div style="font-size: 48px;">${readinessEmoji}</div>
              <div class="readiness-badge">${readinessLevel}</div>
              <div style="font-size: 36px; font-weight: bold; color: ${readinessColor}; margin-top: 10px;">
                ${avgScore}%
              </div>
              <div style="color: #94a3b8; margin-top: 5px;">Average Score across ${totalTests} tests</div>
            </div>

            ${totalTests > 0 ? `
              <h3 style="color: #f8fafc; margin-top: 25px;">📊 Category Breakdown</h3>
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Avg Score</th>
                    <th>Tests Taken</th>
                  </tr>
                </thead>
                <tbody>${categoryRows}</tbody>
              </table>
            ` : `
              <p style="color: #94a3b8; text-align: center;">No test attempts yet. Take some tests to get your readiness report!</p>
            `}

            <div style="text-align: center;">
              <a href="${clientUrl}/dashboard" class="btn">
                View Dashboard →
              </a>
            </div>

            <div class="footer">
              <p>This is an automated email from Smart Placement Platform.</p>
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
      subject: `${readinessEmoji} Your Placement Readiness: ${readinessLevel} (${avgScore}%)`,
      html: emailHtml,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.status(200).json({
      success: true,
      message: "Placement readiness email sent successfully.",
      messageId: info.messageId,
      previewUrl: previewUrl || null,
      readiness: { level: readinessLevel, score: avgScore },
    });
  } catch (error) {
    console.error("Send Placement Readiness Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send placement readiness email.",
    });
  }
};

module.exports = { sendTestResultEmail, sendPlacementReadiness };
