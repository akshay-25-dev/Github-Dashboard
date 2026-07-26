# Technical Requirements Document (TRD)
## GitHub Developer Dashboard

**Version:** 1.0
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
| Database / Cache | Redis (Upstash) or Supabase (Postgres) | Cache API responses and AI summaries to avoid rate limits & repeat cost |
| AI Summary | Claude API (Anthropic) or OpenAI API | Generates the natural-language portfolio summary |
| Deployment | Vercel | Free tier, native Next.js support |
| Version Control | Git + GitHub | Also doubles as your own dashboard's test data |

> These are recommendations for a solo/portfolio build. Swap any layer (e.g., Express instead of Next.js API routes, Postgres instead of Redis) without changing the overall architecture.

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
                            │ GitHub REST API │    │ GitHub GraphQL   │   │  AI Summary API    │
                            │ (repos, user)   │    │ (contributions)  │   │  (Claude/OpenAI)   │
                            └────────────────┘    └──────────────────┘   └───────────────────┘
                                     │
                                     ▼
                            ┌────────────────────┐
                            │  Cache Layer        │
                            │  (Redis / Postgres) │
                            └────────────────────┘
```

The frontend never calls GitHub or the AI API directly — all external calls are proxied through Next.js API routes (a Backend-for-Frontend layer). This keeps API tokens server-side and lets you cache responses.

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
- Server-side cache (see §5) absorbs repeat lookups so real GitHub calls only happen on cache miss/expiry.
- Show a friendly "rate limit reached, try again in X minutes" UI state if exhausted.

## 4. AI Summary Integration

- On dashboard load (cache miss), send an aggregated JSON payload (languages, top repos, contribution stats — **not raw code**) to the LLM with a prompt requesting a 3–5 sentence portfolio summary.
- Response is cached per username for 24 hours to control cost and latency.
- Store the model name/version alongside the cached summary for transparency.
- Handle failures gracefully — dashboard should still render fully if the AI call fails; summary section shows a retry option instead.

## 5. Caching Strategy

| Data | TTL | Storage |
|---|---|---|
| User profile + repos | 1 hour | Redis / DB |
| Language breakdown | 1 hour | Redis / DB |
| Contribution calendar | 6 hours | Redis / DB |
| AI summary | 24 hours | Redis / DB |

- Cache key pattern: `github:{username}:{resource}`
- On new/expired cache, fetch fresh data from GitHub, recompute derived stats (streaks, achievements), store, and serve.

## 6. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Dashboard interactive within 3s on cache hit; < 6s on cold cache |
| Reliability | Graceful degradation if GitHub or AI API is down (partial dashboard still renders) |
| Security | No tokens/secrets exposed client-side; all external calls proxied server-side |
| Scalability | Stateless API routes; cache layer absorbs read load |
| Accessibility | Charts have text alternatives (e.g., data table toggle); color contrast meets WCAG AA |
| Responsiveness | Fully usable on mobile (375px) through desktop (1440px+) |

## 7. Error Handling

| Scenario | Behavior |
|---|---|
| Username not found | Show inline "No GitHub user found for '{username}'" message |
| GitHub rate limit hit | Show retry-after message; fall back to cached data if available |
| GraphQL/contribution fetch fails | Render rest of dashboard; show placeholder for heatmap |
| AI summary fails | Render rest of dashboard; show "Summary unavailable — retry" button |
| Network/API timeout | Timeout at 10s per external call; show error toast |

## 8. Deployment

- Hosted on **Vercel** (frontend + API routes together).
- Environment variables: `GITHUB_TOKEN`, `AI_API_KEY`, `REDIS_URL` (or DB connection string) — set in Vercel project settings, never committed.
- CI: GitHub Actions to run lint/type-check on push (optional but strong resume signal).

## 9. Project Structure (suggested)

```
/app or /pages
  /api
    /github
      [username].ts        -- aggregated profile+repo+language data
      contributions.ts     -- GraphQL contribution calendar
    /ai
      summary.ts           -- AI summary generation
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
  cache.ts                 -- Redis/DB cache helpers
  ai.ts                    -- LLM client wrapper
  achievements.ts          -- badge/streak calculation logic
```

## 10. Key Libraries

- `octokit` — official GitHub REST client
- `graphql-request` — lightweight GraphQL client for contribution data
- `recharts` — charts
- `react-calendar-heatmap` (or custom SVG) — heatmap
- `@anthropic-ai/sdk` or `openai` — AI summary
- `ioredis` (if using Redis)

---
*Next document: [UI/UX Design](./03-UIUX-Design.md)*
