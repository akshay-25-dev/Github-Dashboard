# Backend Schema Document
## GitHub Developer Dashboard

**Version:** 1.1 (Updated — MongoDB Atlas)
**Status:** Draft for Review

---

## 1. Overview

This app is mostly a **stateless proxy/aggregator** over the GitHub API — it doesn't need a full relational data model of "users" in the traditional app sense (no signup/login required for MVP). The backend's real job is:

1. Fetching + shaping GitHub data
2. **Caching** it (this is the main persistent data store)
3. Storing AI-generated summaries
4. Optionally logging searches (for a future "trending/popular searches" feature)

**Database: MongoDB Atlas (free M0 tier).** The data is naturally document-shaped — a profile with nested repos, languages, achievements, and a contribution calendar — which fits a single MongoDB document far better than several relational tables with joins. MongoDB's **TTL index** feature also gives automatic cache expiry for free, so no separate Redis layer is needed.

---

## 2. Collection Design

### 2.1 `github_profiles` collection (primary cache)

One document per searched username. Each nested section carries its own `cachedAt` timestamp so different pieces of data can expire on their own schedules even though they live together in one document.

```json
{
  "_id": "ObjectId(...)",
  "username": "octocat",
  "profile": {
    "displayName": "The Octocat",
    "avatarUrl": "https://avatars.githubusercontent.com/u/583231",
    "bio": "GitHub mascot",
    "followers": 12000,
    "following": 9,
    "publicRepos": 8,
    "accountCreatedAt": "2011-01-25T18:44:36Z",
    "cachedAt": "2026-07-26T10:15:00Z"
  },
  "repos": {
    "topRepos": [
      {
        "name": "Hello-World",
        "description": "My first repository on GitHub!",
        "language": "N/A",
        "stars": 2800,
        "forks": 2200,
        "updatedAt": "2024-03-10T12:00:00Z",
        "url": "https://github.com/octocat/Hello-World"
      }
    ],
    "cachedAt": "2026-07-26T10:15:00Z"
  },
  "languages": {
    "breakdown": [
      { "name": "JavaScript", "percent": 42.5, "bytes": 128500 },
      { "name": "Python", "percent": 31.2, "bytes": 94300 },
      { "name": "TypeScript", "percent": 18.1, "bytes": 54700 }
    ],
    "cachedAt": "2026-07-26T10:15:00Z"
  },
  "achievements": {
    "badges": [
      { "id": "century_club", "earned": true, "label": "100+ contributions this year" },
      { "id": "polyglot", "earned": true, "label": "5+ languages used" },
      { "id": "star_collector", "earned": false, "label": "100+ total stars" }
    ],
    "cachedAt": "2026-07-26T10:15:00Z"
  },
  "contributions": {
    "totalContributions": 842,
    "currentStreak": 6,
    "longestStreak": 34,
    "calendar": [
      { "date": "2025-07-27", "count": 3 },
      { "date": "2025-07-28", "count": 0 }
    ],
    "cachedAt": "2026-07-26T10:15:00Z"
  },
  "aiSummary": {
    "text": "This developer shows consistent activity...",
    "model": "gemini-2.0-flash",
    "generatedAt": "2026-07-26T10:16:00Z"
  },
  "expireAt": "2026-07-27T10:15:00Z"
}
```

### 2.2 TTL Index

MongoDB deletes a document automatically once the `expireAt` field's timestamp is in the past (checked by a background task roughly every 60 seconds):

```javascript
db.github_profiles.createIndex(
  { expireAt: 1 },
  { expireAfterSeconds: 0 }
)
```

- `expireAt` is set to the **soonest** expiry among the document's sections (in the example above, that would be the 1-hour profile/repos/languages TTL, since it's shorter than contributions' 6h and the AI summary's 24h).
- Because the whole document expires together, on a cache miss the API route just refetches whichever sections are actually needed and re-inserts a fresh document — simpler than trying to partially expire a doc.
- Alternative (slightly more complex but avoids re-fetching everything on any single-section expiry): split into separate collections (`profiles`, `contributions`, `ai_summaries`), each with its own TTL index matching its own cache duration. Recommended only if you notice the AI summary or contributions data going stale unnecessarily often under the combined-TTL approach.

### 2.3 Indexes

```javascript
// Fast lookup by username (primary access pattern)
db.github_profiles.createIndex({ username: 1 }, { unique: true })

// TTL auto-expiry
db.github_profiles.createIndex({ expireAt: 1 }, { expireAfterSeconds: 0 })
```

---

## 3. Optional: `search_log` Collection (Future Feature)

For a future "trending searches" or analytics feature:

```json
{
  "_id": "ObjectId(...)",
  "username": "octocat",
  "searchedAt": "2026-07-26T10:15:00Z",
  "ipHash": "a1b2c3..."
}
```

```javascript
db.search_log.createIndex({ username: 1 })
db.search_log.createIndex(
  { searchedAt: 1 },
  { expireAfterSeconds: 2592000 } // auto-purge after 30 days
)
```

- IP is hashed, never stored raw, for privacy.
- Not required for MVP — only add if you want a "popular profiles today" widget.

---

## 4. API Contract Summary (Internal Endpoints)

| Method | Route | Returns |
|---|---|---|
| GET | `/api/github/{username}` | Profile, repos, languages, achievements |
| GET | `/api/github/{username}/contributions` | Contribution calendar, streaks |
| GET | `/api/ai/summary?username={username}` | AI-generated summary (cached) |
| POST | `/api/ai/summary/regenerate` | Force-refresh AI summary, bypassing cache |
| GET | `/api/health` | Service + DB connectivity check |

All routes return standard error shape on failure:
```json
{ "error": { "code": "USER_NOT_FOUND", "message": "No GitHub user found for 'xyz'." } }
```

---

## 5. Data Access Layer (`lib/db.ts`)

Suggested helper functions to keep MongoDB logic out of the API route handlers:

```javascript
// lib/db.ts (pseudocode signatures)
getCachedProfile(username): Promise<ProfileDoc | null>
upsertProfileSection(username, section, data, ttlSeconds): Promise<void>
isSectionStale(doc, section): boolean
```

This keeps the API routes simple: check cache → if stale/missing, fetch from GitHub/Gemini → write back via `upsertProfileSection` → return data.

---

## 6. Data Retention & Privacy

- No personally identifying data is stored beyond what's already public on GitHub.
- If `search_log` is implemented, IPs are hashed, never stored raw, and entries auto-purge after 30 days via TTL index.
- No GitHub OAuth tokens are stored per-user in MVP (server uses its own token); if OAuth login is added later, tokens must be encrypted at rest.
- MongoDB Atlas free tier: use a dedicated database user (not the Atlas account owner credentials) with read/write scoped only to this project's database.

---

*End of document set. Five documents total: PRD → TRD → UI/UX Design → App Flow → Backend Schema.*
