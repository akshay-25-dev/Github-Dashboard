# Technical Requirements Document (TRD)
## GitHub Developer Dashboard

**Version:** 1.1 (Updated — MongoDB Atlas + Gemini API)
**Status:** Draft for Review

---

## 1. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Frontend Framework | Next.js (React) | SSR/API routes in one project, easy Vercel deploy, resume-friendly |
| Styling | Tailwind CSS | Fast to build clean, responsive UI |
| Charts | Recharts (or Chart.js) | Simple declarative charts for language breakdown, activity |
| Heatmap | Custom SVG grid or `react-calendar-heatmap` | GitHub-style contribution grid |
| Backend | Next.js API routes (Node.js) | Avoids running a separate server; keeps project simple to deploy |
| Auth (to GitHub) | GitHub OAuth App (or Personal Access Token for MVP) | Needed for higher rate limits + GraphQL contribution data |
| Database / Cache | **MongoDB Atlas** (free M0 tier) | Document-shaped data (nested profile/repos/languages) maps naturally to Mongo; TTL indexes give free automatic cache expiry — no separate Redis needed |
| AI Summary | **Google Gemini API** (free tier) | No-cost usage for a portfolio project, generous free-tier limits, good enough quality for a short summary |
| Deployment | Vercel | Free tier, native Next.js support |
| Version Control | Git + GitHub | Also doubles as your own dashboard's test data |

> Swap any layer without changing the overall architecture — the service layer isolates GitHub, DB, and AI calls behind their own modules (see §9).

## 2. Architecture Overview

```
┌─────────────┐      ┌──────────────────┐      ┌────────────────────┐
│   Browser   │ ───▶ │  Next.js Frontend │ ───▶ │  Next.js API Routes │
│ (React SPA) │ ◀─── │   (Dashboard UI)  │ ◀─── │   (BFF / Service)   │
└─────────────┘      └──────────────────┘      └─────────┬──────────┘
                                                            │
                                     ┌──────────────────────┼───────────────────────┐
                                     ▼                      ▼                       ▼
                            ┌────────────────┐    ┌──────────────────┐   ┌───────────────────┐
                            │ GitHub REST API │    │ GitHub GraphQL   │   │  Gemini API         │
                            │ (repos, user)   │    │ (contributions)  │   │  (AI summary)       │
                            └────────────────┘    └──────────────────┘   └───────────────────┘
                                     │
                                     ▼
                            ┌────────────────────┐
                            │  MongoDB Atlas       │
                            │  (cache collection,  │
                            │   TTL auto-expiry)   │
                            └────────────────────┘
```

The frontend never calls GitHub or Gemini directly — all external calls are proxied through Next.js API routes (a Backend-for-Frontend layer). This keeps API keys server-side and lets MongoDB absorb repeat lookups.

## 3. GitHub API Integration

### 3.1 Authentication
- Use a **GitHub Personal Access Token (fine-grained, public-repo read-only)** stored as a server-side environment variable for MVP.
- Optional v2: implement **GitHub OAuth App** flow so the app authenticates as the visiting user (higher, per-user rate limits; needed if you want to support "log in with GitHub" later).

### 3.2 Endpoints Used

| Data | API | Endpoint / Query |
|---|---|---|
| User profile | REST | `GET /users/{username}` |
| Repositories | REST | `GET /users/{username}/repos?sort=updated&per_page=100` |
| Repo languages | REST | `GET /repos/{owner}/{repo}/languages` |
| Contribution calendar | **GraphQL** | `user(login:) { contributionsCollection { contributionCalendar { weeks { contributionDays { date, contributionCount } } } } }` |
| Rate limit status | REST | `GET /rate_limit` |

> Contribution history is **only** available via GraphQL — REST has no equivalent endpoint. This is the one call that requires an authenticated token even for public data.

### 3.3 Rate Limiting Strategy
- Authenticated requests: 5,000/hr (REST), separate points-based limit for GraphQL.
- MongoDB cache (see §5) absorbs repeat lookups so real GitHub calls only happen on cache miss/expiry.
- Show a friendly "rate limit reached, try again in X minutes" UI state if exhausted.

## 4. AI Summary Integration — Google Gemini API

- On dashboard load (cache miss), send an aggregated JSON payload (languages, top repos, contribution stats — **not raw code**) to Gemini with a prompt requesting a 3–5 sentence portfolio summary.
- Use the free-tier model (e.g., Gemini 2.x Flash-class model — check current free-tier model availability at build time, as Google updates these) via the `@google/generative-ai` SDK.
- Response is cached in MongoDB per username for 24 hours to stay comfortably within free-tier **requests-per-minute and requests-per-day** limits.
- Store the model name/version alongside the cached summary for transparency.
- Handle failures gracefully — dashboard should still render fully if the AI call fails; summary section shows a retry option instead.
- Because the free tier is rate-limited, add a basic in-app cooldown on the "Regenerate" button (e.g., 1 regeneration per user per few minutes) so a burst of clicks can't exhaust the daily quota.

## 5. Caching Strategy — MongoDB TTL Indexes

Instead of a separate Redis layer, MongoDB itself handles cache expiry natively via a **TTL index**: MongoDB automatically deletes a document once a timestamp field passes a configured age. This removes the need for a second data store.

| Data | TTL | Storage |
|---|---|---|
| User profile + repos + languages + achievements | 1 hour | MongoDB (`github_profiles` collection) |
| Contribution calendar + streaks | 6 hours | Same document (nested field) or separate `contributions` collection |
| AI summary | 24 hours | Same document (nested field) or separate `ai_summaries` collection |

- Recommended approach: **one document per username** in a single collection, with nested sub-objects for repos/languages/achievements/contributions/AI summary, each carrying its own `cachedAt` timestamp so sections can expire independently even though they live in one document (see Backend Schema doc for the exact structure).
- On a read, the API route checks `cachedAt` age itself (not just the TTL index, since TTL deletion runs in the background every ~60s and isn't instant) — if stale, refetch that section from GitHub/Gemini and update just that nested field.

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Dashboard interactive within 3s on cache hit; < 6s on cold cache |
| Reliability | Graceful degradation if GitHub or Gemini API is down (partial dashboard still renders) |
| Security | No tokens/keys exposed client-side; all external calls proxied server-side |
| Scalability | Stateless API routes; MongoDB Atlas free tier handles read/write load for a portfolio-scale project |
| Accessibility | Charts have text alternatives (e.g., data table toggle); color contrast meets WCAG AA |
| Responsiveness | Fully usable on mobile (375px) through desktop (1440px+) |

## 7. Error Handling

| Scenario | Behavior |
|---|---|
| Username not found | Show inline "No GitHub user found for '{username}'" message |
| GitHub rate limit hit | Show retry-after message; fall back to cached data if available |
| GraphQL/contribution fetch fails | Render rest of dashboard; show placeholder for heatmap |
| Gemini API fails or rate-limited | Render rest of dashboard; show "Summary unavailable — retry" button |
| Network/API timeout | Timeout at 10s per external call; show error toast |

## 8. Deployment

- Hosted on **Vercel** (frontend + API routes together).
- Environment variables: `GITHUB_TOKEN`, `GEMINI_API_KEY`, `MONGODB_URI` — set in Vercel project settings, never committed.
- MongoDB Atlas: free M0 cluster, IP access list set to allow Vercel's outbound IPs (or `0.0.0.0/0` for simplicity in a portfolio project, with a strong DB user password).
- CI: GitHub Actions to run lint/type-check on push (optional but strong resume signal).

## 9. Project Structure (suggested)

```
/app or /pages
  /api
    /github
      [username].ts        -- aggregated profile+repo+language data
      contributions.ts     -- GraphQL contribution calendar
    /ai
      summary.ts           -- Gemini summary generation
  /dashboard/[username]
    page.tsx
/components
  Heatmap.tsx
  LanguageChart.tsx
  RepoList.tsx
  StreakBadges.tsx
  AISummaryCard.tsx
/lib
  github.ts                -- GitHub API client
  db.ts                    -- MongoDB connection + cache read/write helpers
  ai.ts                    -- Gemini client wrapper
  achievements.ts          -- badge/streak calculation logic
```

## 10. Key Libraries

- `octokit` — official GitHub REST client
- `graphql-request` — lightweight GraphQL client for contribution data
- `recharts` — charts
- `react-calendar-heatmap` (or custom SVG) — heatmap
- `@google/generative-ai` — official Gemini SDK
- `mongodb` (official Node driver) or `mongoose` (if you prefer schema modeling) — MongoDB Atlas access

---
*Next document: [UI/UX Design](./03-UIUX-Design.md)*
