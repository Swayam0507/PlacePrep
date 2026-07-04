const mongoose = require("mongoose");

// Force Node.js to use Google DNS to bypass mobile hotspot restrictions
// Wrapped in try/catch for serverless environments (Vercel) where this may not be supported
try {
  const dns = require("dns");
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  // Ignore DNS override failures in serverless environments
}

let cachedConnection = null;

const connectDB = async () => {
  // Reuse existing connection if available (important for serverless)
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    cachedConnection = conn;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Don't process.exit in serverless — just throw
    if (process.env.VERCEL) {
      throw error;
    }
    process.exit(1);
  }
};

module.exports = connectDB;
