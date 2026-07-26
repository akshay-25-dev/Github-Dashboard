const { MongoClient } = require("mongodb");

let client = null;
let db = null;

/**
 * Get (or create) a MongoDB connection.
 * Uses connection pooling — safe for repeated calls.
 */
async function connectDB() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI environment variable is not set");
  }

  client = new MongoClient(uri);
  await client.connect();
  db = client.db("github_dashboard");

  // Ensure indexes exist
  const profiles = db.collection("github_profiles");
  await profiles.createIndex({ username: 1 }, { unique: true });
  await profiles.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 });

  console.log("✅ Connected to MongoDB Atlas");
  return db;
}

/**
 * Get cached profile document for a username.
 * @param {string} username
 * @returns {object|null}
 */
async function getCachedProfile(username) {
  const database = await connectDB();
  const collection = database.collection("github_profiles");
  return collection.findOne({ username: username.toLowerCase() });
}

/**
 * Check if a specific section of the cached document is stale.
 * @param {object} doc - The cached document
 * @param {string} section - Section name: "profile", "repos", "languages", "achievements", "contributions", "aiSummary"
 * @returns {boolean} true if stale or missing
 */
function isSectionStale(doc, section) {
  if (!doc || !doc[section] || !doc[section].cachedAt) return true;

  const cachedAt = new Date(doc[section].cachedAt);
  const now = new Date();
  const ageMs = now - cachedAt;

  // TTLs from the Backend Schema doc
  const ttls = {
    profile: 1 * 60 * 60 * 1000,       // 1 hour
    repos: 1 * 60 * 60 * 1000,          // 1 hour
    languages: 1 * 60 * 60 * 1000,      // 1 hour
    achievements: 1 * 60 * 60 * 1000,   // 1 hour
    contributions: 6 * 60 * 60 * 1000,  // 6 hours
    aiSummary: 24 * 60 * 60 * 1000,     // 24 hours
  };

  return ageMs > (ttls[section] || 60 * 60 * 1000);
}

/**
 * Upsert a specific section of a profile document.
 * @param {string} username
 * @param {string} section
 * @param {object} data
 */
async function upsertProfileSection(username, section, data) {
  const database = await connectDB();
  const collection = database.collection("github_profiles");

  const now = new Date();
  const updateData = {
    [section]: { ...data, cachedAt: now.toISOString() },
  };

  // Set expireAt to 24 hours from now (longest TTL section)
  const expireAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  await collection.updateOne(
    { username: username.toLowerCase() },
    {
      $set: { ...updateData, expireAt },
      $setOnInsert: { username: username.toLowerCase() },
    },
    { upsert: true }
  );
}

/**
 * Close the MongoDB connection (for graceful shutdown).
 */
async function closeDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

module.exports = {
  connectDB,
  getCachedProfile,
  isSectionStale,
  upsertProfileSection,
  closeDB,
};
