/**
 * Wipe all data from the MongoDB database
 * Run: node utils/wipeDatabase.js
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const dns = require("dns");
const path = require("path");

// Load env from server directory
dotenv.config({ path: path.join(__dirname, "..", ".env") });

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const wipeDatabase = async () => {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const db = mongoose.connection.db;

    // Get all collection names
    const collections = await db.listCollections().toArray();
    console.log(`\n📋 Found ${collections.length} collections:`);
    collections.forEach((c) => console.log(`   - ${c.name}`));

    // Drop all collections
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`   🗑️  Dropped: ${collection.name}`);
    }

    console.log("\n✅ All data has been wiped from the database!");
    console.log("ℹ️  The admin account will be re-created when the server starts.\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error wiping database:", error.message);
    process.exit(1);
  }
};

wipeDatabase();
