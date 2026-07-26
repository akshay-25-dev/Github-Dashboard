/**
 * Compute streaks from a contribution calendar.
 * @param {Array} calendar - [{date, count}, ...] sorted by date ascending
 * @returns {object} { currentStreak, longestStreak }
 */
function computeStreaks(calendar) {
  if (!calendar || calendar.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Calendar should be sorted chronologically
  const sorted = [...calendar].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].count > 0) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Current streak: count backwards from today (or the last entry)
  currentStreak = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    // Skip today if it has 0 (day isn't over yet)
    const isToday =
      sorted[i].date === new Date().toISOString().split("T")[0];
    if (sorted[i].count > 0) {
      currentStreak++;
    } else if (isToday) {
      continue;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

/**
 * Compute achievement badges based on profile data.
 * @param {object} data - { totalContributions, languages, totalStars, accountCreatedAt }
 * @returns {Array} Achievement badge objects
 */
function computeAchievements(data) {
  const {
    totalContributions = 0,
    languages = [],
    totalStars = 0,
    accountCreatedAt,
    publicRepos = 0,
    longestStreak = 0,
  } = data;

  const accountAge = accountCreatedAt
    ? (new Date() - new Date(accountCreatedAt)) / (1000 * 60 * 60 * 24 * 365)
    : 0;

  const badges = [
    {
      id: "century_club",
      label: "Century Club",
      description: "100+ contributions this year",
      icon: "🔥",
      earned: totalContributions >= 100,
    },
    {
      id: "polyglot",
      label: "Polyglot",
      description: "5+ languages used",
      icon: "🌐",
      earned: languages.length >= 5,
    },
    {
      id: "early_bird",
      label: "Early Bird",
      description: "Account older than 5 years",
      icon: "🐦",
      earned: accountAge >= 5,
    },
    {
      id: "star_collector",
      label: "Star Collector",
      description: "100+ total stars across repos",
      icon: "⭐",
      earned: totalStars >= 100,
    },
    {
      id: "repo_master",
      label: "Repo Master",
      description: "20+ public repositories",
      icon: "📦",
      earned: publicRepos >= 20,
    },
    {
      id: "streak_warrior",
      label: "Streak Warrior",
      description: "30+ day contribution streak",
      icon: "⚡",
      earned: longestStreak >= 30,
    },
    {
      id: "thousand_club",
      label: "Thousand Club",
      description: "1000+ contributions this year",
      icon: "💎",
      earned: totalContributions >= 1000,
    },
    {
      id: "superstar",
      label: "Superstar",
      description: "1000+ total stars",
      icon: "🌟",
      earned: totalStars >= 1000,
    },
  ];

  return badges;
}

module.exports = { computeStreaks, computeAchievements };
