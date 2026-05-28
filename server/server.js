const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// --------------- Middleware ---------------

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

const path = require("path");

// --------------- Routes ---------------

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Smart Placement Platform API is running",
    timestamp: new Date().toISOString(),
  });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Auth routes
app.use("/api/auth", require("./routes/authRoutes"));

// Profile routes
app.use("/api/profile", require("./routes/profileRoutes"));

// Resume routes
app.use("/api/resume", require("./routes/resumeRoutes"));

// Question routes
app.use("/api/questions", require("./routes/questionRoutes"));

// Test routes
app.use("/api/test", require("./routes/testRoutes"));

// Analytics routes
app.use("/api/analytics", require("./routes/analyticsRoutes"));

// ML prediction routes
app.use("/api/ml", require("./routes/mlRoutes"));

// Job recommendation routes
app.use("/api/jobs", require("./routes/jobRoutes"));

// Email notification routes
app.use("/api/email", require("./routes/emailRoutes"));

// Admin routes
app.use("/api/admin", require("./routes/adminRoutes"));

// Bookmark routes
app.use("/api/bookmarks", require("./routes/bookmarkRoutes"));

// Forum routes
app.use("/api/forum", require("./routes/forumRoutes"));

// Company routes
app.use("/api/companies", require("./routes/companyRoutes"));

// Interview prep routes
app.use("/api/interview", require("./routes/interviewRoutes"));

// Feature routes (leaderboard, certificates, resume scoring, bulk import)
app.use("/api/features", require("./routes/featureRoutes"));

// --------------- Error Handling ---------------

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// --------------- Start Server ---------------

const PORT = process.env.PORT || 5000;

// Only listen automatically if we're not running on Vercel
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔗 Client URL: ${process.env.CLIENT_URL || "http://localhost:5173"}\n`);
  });
}

// Export the Express API
module.exports = app;
