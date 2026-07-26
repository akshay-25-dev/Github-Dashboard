const { GoogleGenerativeAI } = require("@google/generative-ai");

let genAI = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set");
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

/**
 * Generate an AI portfolio summary from aggregated GitHub stats.
 * @param {object} stats - { displayName, languages, topRepos, totalContributions, currentStreak, longestStreak, achievements, accountAge }
 * @returns {object} { text, model }
 */
async function generateSummary(stats) {
  const ai = getGenAI();

  // Use a flash-class model for free tier
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

  const topLanguages = (stats.languages || [])
    .slice(0, 5)
    .map((l) => `${l.name} (${l.percent}%)`)
    .join(", ");

  const topRepos = (stats.topRepos || [])
    .slice(0, 5)
    .map((r) => `${r.name} (⭐${r.stars})`)
    .join(", ");

  const prompt = `You are writing a brief, professional portfolio summary for a GitHub developer profile. 
Write exactly 3-5 sentences. Be specific, insightful, and highlight their strengths. Do not use generic filler.

Developer: ${stats.displayName || "Unknown"}
Account age: ${stats.accountAge || "Unknown"}
Total contributions (last year): ${stats.totalContributions || 0}
Current streak: ${stats.currentStreak || 0} days
Longest streak: ${stats.longestStreak || 0} days
Top languages: ${topLanguages || "None detected"}
Notable repositories: ${topRepos || "None"}
Total stars across repos: ${stats.totalStars || 0}
Number of public repos: ${stats.publicRepos || 0}
Achievements earned: ${(stats.achievements || []).filter((a) => a.earned).map((a) => a.label).join(", ") || "None"}

Write the summary now:`;

  const result = await model.generateContent(prompt);
  const response = result.response;
  const text = response.text();

  return {
    text: text.trim(),
    model: "gemini-2.0-flash",
    generatedAt: new Date().toISOString(),
  };
}

module.exports = { generateSummary };
