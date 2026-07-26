const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/**
 * Fetch profile, repos, languages, and achievements for a username.
 */
export async function fetchProfile(username) {
  const res = await fetch(`${API_BASE}/api/github/${username}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, ...data.error };
  }
  return res.json();
}

/**
 * Fetch contribution calendar and streaks for a username.
 */
export async function fetchContributions(username) {
  const res = await fetch(`${API_BASE}/api/github/${username}/contributions`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, ...data.error };
  }
  return res.json();
}

/**
 * Fetch AI-generated portfolio summary.
 */
export async function fetchAISummary(username) {
  const res = await fetch(`${API_BASE}/api/ai/summary?username=${username}`);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, ...data.error };
  }
  return res.json();
}

/**
 * Force-regenerate AI summary.
 */
export async function regenerateAISummary(username) {
  const res = await fetch(`${API_BASE}/api/ai/summary/regenerate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw { status: res.status, ...data.error };
  }
  return res.json();
}
