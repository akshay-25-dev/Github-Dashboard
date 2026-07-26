const express = require("express");
const { generateSummary } = require("../lib/ai");
const { getCachedProfile, isSectionStale, upsertProfileSection } = require("../lib/db");

const router = express.Router();

/**
 * GET /api/ai/summary?username=xxx
 * Returns cached or freshly generated AI summary.
 * 24-hour cache TTL.
 */
router.get("/summary", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      error: { code: "BAD_REQUEST", message: "username query parameter is required." },
    });
  }

  try {
    // Check cache
    const cached = await getCachedProfile(username);

    if (cached && !isSectionStale(cached, "aiSummary")) {
      return res.json({
        aiSummary: cached.aiSummary,
        fromCache: true,
      });
    }

    // Need profile data to generate summary
    if (!cached || !cached.profile) {
      return res.status(404).json({
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Profile data not available. Fetch the profile first.",
        },
      });
    }

    // Build stats object for the AI
    const totalStars = (cached.repos?.topRepos || []).reduce(
      (sum, r) => sum + r.stars,
      0
    );

    const accountAge = cached.profile.accountCreatedAt
      ? `${Math.floor(
          (new Date() - new Date(cached.profile.accountCreatedAt)) /
            (1000 * 60 * 60 * 24 * 365)
        )} years`
      : "Unknown";

    const stats = {
      displayName: cached.profile.displayName,
      languages: cached.languages?.breakdown || [],
      topRepos: cached.repos?.topRepos || [],
      totalContributions: cached.contributions?.totalContributions || 0,
      currentStreak: cached.contributions?.currentStreak || 0,
      longestStreak: cached.contributions?.longestStreak || 0,
      achievements: cached.achievements?.badges || [],
      totalStars,
      publicRepos: cached.profile.publicRepos,
      accountAge,
    };

    const aiSummary = await generateSummary(stats);
    await upsertProfileSection(username, "aiSummary", aiSummary);

    res.json({ aiSummary, fromCache: false });
  } catch (err) {
    console.error(`Error generating AI summary for ${username}:`, err.message);

    // Fallback to cached summary if available
    const cached = await getCachedProfile(username).catch(() => null);
    if (cached && cached.aiSummary) {
      return res.json({
        aiSummary: cached.aiSummary,
        fromCache: true,
        warning: "Showing cached summary — AI service may be unavailable.",
      });
    }

    res.status(500).json({
      error: {
        code: "AI_ERROR",
        message: "Failed to generate AI summary. Please try again later.",
      },
    });
  }
});

/**
 * POST /api/ai/summary/regenerate
 * Force-refresh AI summary, bypassing cache.
 * Body: { username }
 */
router.post("/summary/regenerate", async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json({
      error: { code: "BAD_REQUEST", message: "username is required in request body." },
    });
  }

  try {
    const cached = await getCachedProfile(username);

    if (!cached || !cached.profile) {
      return res.status(404).json({
        error: {
          code: "PROFILE_NOT_FOUND",
          message: "Profile data not available. Fetch the profile first.",
        },
      });
    }

    const totalStars = (cached.repos?.topRepos || []).reduce(
      (sum, r) => sum + r.stars,
      0
    );

    const accountAge = cached.profile.accountCreatedAt
      ? `${Math.floor(
          (new Date() - new Date(cached.profile.accountCreatedAt)) /
            (1000 * 60 * 60 * 24 * 365)
        )} years`
      : "Unknown";

    const stats = {
      displayName: cached.profile.displayName,
      languages: cached.languages?.breakdown || [],
      topRepos: cached.repos?.topRepos || [],
      totalContributions: cached.contributions?.totalContributions || 0,
      currentStreak: cached.contributions?.currentStreak || 0,
      longestStreak: cached.contributions?.longestStreak || 0,
      achievements: cached.achievements?.badges || [],
      totalStars,
      publicRepos: cached.profile.publicRepos,
      accountAge,
    };

    const aiSummary = await generateSummary(stats);
    await upsertProfileSection(username, "aiSummary", aiSummary);

    res.json({ aiSummary, fromCache: false });
  } catch (err) {
    console.error(`Error regenerating AI summary for ${username}:`, err.message);
    res.status(500).json({
      error: {
        code: "AI_ERROR",
        message: "Failed to regenerate AI summary. Please try again later.",
      },
    });
  }
});

module.exports = router;
