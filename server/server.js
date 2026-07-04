const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Load environment variables
dotenv.config();

// Seed admin account (called after DB connects)
const seedAdmin = async () => {
  try {
    const User = require("./models/User");
    const existingAdmin = await User.findOne({ email: "admin@PlaceEdge.com" });
    if (!existingAdmin) {
      await User.create({
        name: "Dr. Rajesh Kumar",
        email: "admin@PlaceEdge.com",
        password: "Admin@2026",
        role: "admin",
        branch: "Training & Placement Cell",
        semester: 1,
        cgpa: 10,
        bio: "Head of Training & Placement Cell. 15+ years of experience in campus recruitment and student career development.",
        phone: "+91 98765 43210",
        skills: ["Student Mentoring", "Industry Relations", "Recruitment Strategy", "Career Counseling"],
      });
      console.log("✅ Admin account seeded: admin@PlaceEdge.com / Admin@2026");
    }
  } catch (err) {
    // Admin may already exist or DB not ready yet — ignore
  }
};

// Connect to MongoDB and seed admin (for local dev, starts immediately)
let dbReady = connectDB().then(async () => {
  await seedAdmin();
});

const app = express();

// Enable trust proxy for secure cookies behind reverse proxies (like Vercel)
app.set("trust proxy", 1);

// --------------- Middleware ---------------

// Ensure DB connection is ready before handling any request
// This is critical for serverless environments (Vercel) where the
// connection may not be established before the first request arrives
app.use(async (req, res, next) => {
  try {
    await dbReady;
    next();
  } catch (err) {
    console.error("DB connection failed first try:", err.message);
    // Try reconnecting
    try {
      dbReady = connectDB();
      await dbReady;
      next();
    } catch (retryErr) {
      console.error("DB connection retry failed:", retryErr.message);
      res.status(500).json({
        success: false,
        message: "Database connection failed. Please try again.",
        error: retryErr.message,
        stack: retryErr.stack
      });
    }
  }
});

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "https://place-prep-five.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow specific origins or any Vercel preview deployment
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
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

