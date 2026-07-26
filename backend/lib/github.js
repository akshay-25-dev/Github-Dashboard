const { Octokit } = require("octokit");
const { GraphqlResponseError } = require("@octokit/graphql");

let octokit = null;

function getOctokit() {
  if (!octokit) {
    octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN || undefined,
    });
  }
  return octokit;
}

/**
 * Fetch a GitHub user's profile.
 * @param {string} username
 * @returns {object} Shaped profile data
 */
async function fetchUserProfile(username) {
  const kit = getOctokit();
  const { data } = await kit.rest.users.getByUsername({ username });

  return {
    displayName: data.name || data.login,
    avatarUrl: data.avatar_url,
    bio: data.bio || "",
    followers: data.followers,
    following: data.following,
    publicRepos: data.public_repos,
    accountCreatedAt: data.created_at,
    location: data.location || "",
    blog: data.blog || "",
    company: data.company || "",
    htmlUrl: data.html_url,
  };
}

/**
 * Fetch all public repos for a user (paginated, up to 100).
 * @param {string} username
 * @returns {Array} Shaped repo list sorted by stars descending
 */
async function fetchUserRepos(username) {
  const kit = getOctokit();
  const { data } = await kit.rest.repos.listForUser({
    username,
    sort: "updated",
    per_page: 100,
    type: "owner",
  });

  const repos = data
    .filter((r) => !r.fork)
    .map((r) => ({
      name: r.name,
      description: r.description || "",
      language: r.language || "N/A",
      stars: r.stargazers_count,
      forks: r.forks_count,
      updatedAt: r.updated_at,
      url: r.html_url,
    }))
    .sort((a, b) => b.stars - a.stars);

  return repos;
}

/**
 * Fetch aggregated language breakdown across all repos (by bytes).
 * @param {string} username
 * @param {Array} repos - List of repo objects (needs .name)
 * @returns {Array} Sorted language breakdown with percentages
 */
async function fetchLanguages(username, repos) {
  const kit = getOctokit();
  const languageTotals = {};

  // Fetch languages for top 30 repos to avoid rate limit issues
  const reposToCheck = repos.slice(0, 30);

  const results = await Promise.allSettled(
    reposToCheck.map((repo) =>
      kit.rest.repos.listLanguages({ owner: username, repo: repo.name })
    )
  );

  for (const result of results) {
    if (result.status === "fulfilled") {
      const langs = result.value.data;
      for (const [lang, bytes] of Object.entries(langs)) {
        languageTotals[lang] = (languageTotals[lang] || 0) + bytes;
      }
    }
  }

  const totalBytes = Object.values(languageTotals).reduce((sum, b) => sum + b, 0);
  if (totalBytes === 0) return [];

  const breakdown = Object.entries(languageTotals)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percent: Math.round((bytes / totalBytes) * 1000) / 10,
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return breakdown;
}

/**
 * Fetch contribution calendar via GitHub GraphQL API.
 * @param {string} username
 * @returns {object} { totalContributions, calendar: [{date, count}] }
 */
async function fetchContributions(username) {
  const kit = getOctokit();

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          }
        }
      }
    }
  `;

  const result = await kit.graphql(query, { username });

  const calendar =
    result.user.contributionsCollection.contributionCalendar;

  const days = calendar.weeks.flatMap((week) =>
    week.contributionDays.map((day) => ({
      date: day.date,
      count: day.contributionCount,
    }))
  );

  return {
    totalContributions: calendar.totalContributions,
    calendar: days,
  };
}

/**
 * Check current GitHub API rate limit status.
 * @returns {object} { remaining, limit, resetAt }
 */
async function checkRateLimit() {
  const kit = getOctokit();
  const { data } = await kit.rest.rateLimit.get();
  return {
    remaining: data.rate.remaining,
    limit: data.rate.limit,
    resetAt: new Date(data.rate.reset * 1000).toISOString(),
  };
}

module.exports = {
  fetchUserProfile,
  fetchUserRepos,
  fetchLanguages,
  fetchContributions,
  checkRateLimit,
};
