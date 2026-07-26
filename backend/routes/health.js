const express = require("express");
const { connectDB } = require("../lib/db");
const { checkRateLimit } = require("../lib/github");

const router = express.Router();

/**
 * GET /api/health
 * Service health check: DB connectivity + GitHub API status.
 */
router.get("/", async (req, res) => {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {},
  };

  // Check MongoDB
  try {
    await connectDB();
    health.services.mongodb = { status: "connected" };
  } catch (err) {
    health.services.mongodb = { status: "error", message: err.message };
    health.status = "degraded";
  }

  // Check GitHub API rate limit
  try {
    const rateLimit = await checkRateLimit();
    health.services.github = {
      status: rateLimit.remaining > 0 ? "ok" : "rate_limited",
      ...rateLimit,
    };
  } catch (err) {
    health.services.github = { status: "error", message: err.message };
    health.status = "degraded";
  }

  const statusCode = health.status === "ok" ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
