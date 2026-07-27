const OpenAI = require("openai");

let openai = null;

const MODELS = [
  "gpt-4o-mini",
  "gpt-3.5-turbo",
  "gpt-4o",
];

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  if (!openai) {
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

/**
 * Smart rule-based summary fallback when AI APIs are rate limited or unavailable.
 */
function generateFallbackSummary(stats) {
  const name = stats.displayName || "This developer";
  const topLangs = (stats.languages || []).slice(0, 3).map((l) => l.name);
  const langText = topLangs.length > 0 ? topLangs.join(", ") : "various software technologies";
  const reposCount = stats.publicRepos || 0;
  const starsCount = stats.totalStars || 0;
  const contribs = stats.totalContributions || 0;
  const streak = stats.longestStreak || 0;
  const age = stats.accountAge || "several years";

  const sentences = [];

  // Sentence 1: General profile focus & languages
  sentences.push(
    `${name} is an active developer on GitHub specializing primarily in ${langText}.`
  );

  // Sentence 2: Repos and community impact
  if (starsCount > 0) {
    sentences.push(
      `They maintain ${reposCount} public repositories, earning a total of ${starsCount} star${starsCount === 1 ? "" : "s"} from the open-source community.`
    );
  } else if (reposCount > 0) {
    sentences.push(
      `They have published ${reposCount} public ${reposCount === 1 ? "repository" : "repositories"}, demonstrating consistent software craftsmanship.`
    );
  } else {
    sentences.push(
      `They maintain a focused public profile dedicated to software creation and open-source learning.`
    );
  }

  // Sentence 3: Activity & streaks
  if (contribs > 0) {
    sentences.push(
      `Over the past year, they accumulated ${contribs} contribution${contribs === 1 ? "" : "s"}${streak > 0 ? `, achieving a peak continuous activity streak of ${streak} days` : ""}.`
    );
  } else {
    sentences.push(
      `They have been building software on GitHub for ${age}.`
    );
  }

  return {
    text: sentences.join(" "),
    model: "smart-analytics-engine",
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Generate an AI portfolio summary from aggregated GitHub stats.
 * Uses OpenAI with fallbacks, and gracefully falls back to smart analytics if API quota is exhausted.
 * @param {object} stats
 * @returns {object} { text, model, generatedAt }
 */
async function generateSummary(stats) {
  const client = getOpenAI();

  if (client) {
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

    for (const modelName of MODELS) {
      try {
        console.log(`Trying OpenAI model: ${modelName}`);
        const completion = await client.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: "You are a professional tech recruiter and developer portfolio analyst." },
            { role: "user", content: prompt },
          ],
          max_tokens: 250,
          temperature: 0.7,
        });

        const text = completion.choices[0]?.message?.content?.trim();
        if (text) {
          console.log(`✅ AI summary generated successfully with ${modelName}`);
          return {
            text,
            model: modelName,
            generatedAt: new Date().toISOString(),
          };
        }
      } catch (err) {
        console.warn(`⚠️ OpenAI model ${modelName} notice: ${err.message?.substring(0, 100)}`);
        if (err.status === 429 || (err.message && err.message.includes("429"))) {
          continue;
        }
        if (err.status === 404 || (err.message && err.message.includes("404"))) {
          continue;
        }
      }
    }
  }

  // Fallback if OpenAI key is missing, invalid, or quota exceeded
  console.log("ℹ️ Using Smart Analytics Engine summary fallback");
  return generateFallbackSummary(stats);
}

module.exports = { generateSummary };
