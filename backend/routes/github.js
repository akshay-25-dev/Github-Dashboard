const express = require("express");
const { fetchUserProfile, fetchUserRepos, fetchLanguages } = require("../lib/github");
const { getCachedProfile, isSectionStale, upsertProfileSection } = require("../lib/db");
const { computeAchievements } = require("../lib/achievements");

const router = express.Router();

/**
 * GET /api/github/:username
 * Returns profile, repos, languages, and achievements.
 * Uses MongoDB cache with per-section staleness checks.
 */
router.get("/:username", async (req, res) => {
  const { username } = req.params;

  try {
    // Check cache
    const cached = await getCachedProfile(username);

    let profile, repos, languages, achievements;
    let fromCache = false;

    // Profile
    if (cached && !isSectionStale(cached, "profile")) {
      profile = cached.profile;
      fromCache = true;
    } else {
      try {
        profile = await fetchUserProfile(username);
        await upsertProfileSection(username, "profile", profile);
      } catch (err) {
        if (err.status === 404) {
          return res.status(404).json({
            error: {
              code: "USER_NOT_FOUND",
              message: `No GitHub user found for '${username}'.`,
            },
          });
        }
        throw err;
      }
    }

    // Repos
    if (cached && !isSectionStale(cached, "repos")) {
      repos = cached.repos;
    } else {
      const topRepos = await fetchUserRepos(username);
      repos = { topRepos };
      await upsertProfileSection(username, "repos", repos);
    }

    // Languages
    if (cached && !isSectionStale(cached, "languages")) {
      languages = cached.languages;
    } else {
      const breakdown = await fetchLanguages(username, repos.topRepos || []);
      languages = { breakdown };
      await upsertProfileSection(username, "languages", languages);
    }

    // Achievements (computed from aggregated data)
    const totalStars = (repos.topRepos || []).reduce((sum, r) => sum + r.stars, 0);
    const achievementData = {
      totalContributions: cached?.contributions?.totalContributions || 0,
      languages: languages.breakdown || [],
      totalStars,
      accountCreatedAt: profile.accountCreatedAt,
      publicRepos: profile.publicRepos,
      longestStreak: cached?.contributions?.longestStreak || 0,
    };
    const badges = computeAchievements(achievementData);
    achievements = { badges };
    await upsertProfileSection(username, "achievements", achievements);

    res.json({
      profile,
      repos,
      languages,
      achievements,
      fromCache,
    });
  } catch (err) {
    console.error(`Error fetching profile for ${username}:`, err.message);

    // If we have cached data, return it with a warning
    const cached = await getCachedProfile(username).catch(() => null);
    if (cached && cached.profile) {
      return res.json({
        profile: cached.profile,
        repos: cached.repos || { topRepos: [] },
        languages: cached.languages || { breakdown: [] },
        achievements: cached.achievements || { badges: [] },
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
        message: "Failed to fetch GitHub data. Please try again.",
      },
    });
  }
});

module.exports = router;
