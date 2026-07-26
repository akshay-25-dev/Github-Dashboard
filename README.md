# GitHub Developer Dashboard

A web application that lets you enter any public GitHub username and instantly view a rich, visual summary of their activity, skills, and achievements — with an AI-generated portfolio summary.

## Features

- 🔍 **Username Search** — instant lookup with validation and recent search history
- 📊 **Contribution Heatmap** — GitHub-style 52-week calendar with hover tooltips
- 🔥 **Streak Stats** — current and longest contribution streaks
- 🏆 **Achievement Badges** — 8 badges (Century Club, Polyglot, Star Collector, etc.)
- 💻 **Language Breakdown** — donut chart with GitHub-consistent colors
- 📦 **Repository Insights** — sortable grid (stars / recent / forks)
- ✨ **AI Summary** — Gemini-powered 3-5 sentence portfolio summary
- 🌙 **Dark/Light Mode** — persisted theme toggle
- ⚡ **Progressive Loading** — skeleton loaders, independent section rendering
- 🗄️ **MongoDB Caching** — TTL-based auto-expiry (1h / 6h / 24h per section)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js (React, JavaScript) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Backend | Express.js (Node.js) |
| Database | MongoDB Atlas (free M0 tier) |
| AI | Google Gemini API (free tier) |
| GitHub API | Octokit (REST) + GraphQL |

## Project Structure

```
Github_Dashboard/
├── frontend/          # Next.js React app
│   ├── app/           # Pages (landing, dashboard)
│   ├── components/    # UI components
│   └── lib/           # API client helper
├── backend/           # Express.js API server
│   ├── lib/           # Service layer (github, db, ai, achievements)
│   ├── routes/        # API route handlers
│   └── server.js      # Entry point
└── documentation/     # PRD, TRD, UI/UX, App Flow, Schema docs
```

## Setup

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free M0 tier)
- GitHub Personal Access Token
- Google Gemini API Key

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in GITHUB_TOKEN, GEMINI_API_KEY, MONGODB_URI in .env
npm install
npm run dev
```

### 2. Frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Visit `http://localhost:3000` and enter any GitHub username!

## API Endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/api/github/:username` | Profile, repos, languages, achievements |
| GET | `/api/github/:username/contributions` | Contribution calendar + streaks |
| GET | `/api/ai/summary?username=` | AI-generated portfolio summary |
| POST | `/api/ai/summary/regenerate` | Force-refresh AI summary |
| GET | `/api/health` | Service health check |

## License

MIT
