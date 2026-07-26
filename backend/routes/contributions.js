const express = require("express");
const { fetchContributions } = require("../lib/github");
const { getCachedProfile, isSectionStale, upsertProfileSection } = require("../lib/db");
const { computeStreaks } = require("../lib/achievements");

const router = express.Router();

/**
 * GET /api/github/:username/contributions
 * Returns contribution calendar, streaks, and total contributions.
 * Uses 6-hour cache TTL.
 */
router.get("/:username/contributions", async (req, res) => {
  const { username } = req.params;

  try {
    // Check cache
    const cached = await getCachedProfile(username);

    if (cached && !isSectionStale(cached, "contributions")) {
      return res.json({
        contributions: cached.contributions,
        fromCache: true,
      });
    }

    // Fetch from GitHub GraphQL
    const { totalContributions, calendar } = await fetchContributions(username);

    // Compute streaks
    const { currentStreak, longestStreak } = computeStreaks(calendar);

    const contributions = {
      totalContributions,
      currentStreak,
      longestStreak,
      calendar,
    };

    // Cache it
    await upsertProfileSection(username, "contributions", contributions);

    // Also update achievements now that we have contribution data
    if (cached && cached.achievements) {
      const { computeAchievements } = require("../lib/achievements");
      const totalStars = (cached.repos?.topRepos || []).reduce(
        (sum, r) => sum + r.stars,
        0
      );
      const badges = computeAchievements({
        totalContributions,
        languages: cached.languages?.breakdown || [],
        totalStars,
        accountCreatedAt: cached.profile?.accountCreatedAt,
        publicRepos: cached.profile?.publicRepos || 0,
        longestStreak,
      });
      await upsertProfileSection(username, "achievements", { badges });
    }

    res.json({ contributions, fromCache: false });
  } catch (err) {
    console.error(`Error fetching contributions for ${username}:`, err.message);

    // Fallback to cached data
    const cached = await getCachedProfile(username).catch(() => null);
    if (cached && cached.contributions) {
      return res.json({
        contributions: cached.contributions,
        fromCache: true,
        warning: "Showing cached data — GitHub API may be rate-limited.",
      });
    }

    if (err.status === 403) {
      return res.status(429).json({
        error: {
          code: "RATE_LIMITED",
          message: "GitHub API rate limit reached. Please try again later.",
        },
      });
    }

    res.status(500).json({
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to fetch contribution data. Please try again.",
      },
    });
  }
});

module.exports = router;
