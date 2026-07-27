# GitHub Developer Dashboard

A full-stack web application that lets you enter any public GitHub username and instantly view a rich, visual summary of their activity, skills, and achievements — with an AI-generated portfolio summary.

## Features

- 🔍 **Username Search** — instant lookup with validation and recent search history
- 📊 **Contribution Heatmap** — GitHub-style 52-week calendar with hover tooltips
- 🔥 **Streak Stats** — current and longest contribution streaks
- 🏆 **Achievement Badges** — 8 badges (Century Club, Polyglot, Star Collector, etc.)
- 💻 **Language Breakdown** — donut chart with GitHub-consistent colors
- 📦 **Repository Insights** — sortable grid (stars / recent / forks)
- ✨ **AI Summary** — OpenAI & Smart Analytics powered developer summary
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
| AI | OpenAI API & Smart Analytics Fallback Engine |
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

## Setup & Local Development

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- GitHub Personal Access Token
- OpenAI API Key

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in GITHUB_TOKEN, OPENAI_API_KEY, MONGODB_URI in .env
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

Visit `http://localhost:3000` or `http://localhost:3001` and enter any GitHub username!

## Deployment Guide

### Deploying Frontend (Vercel)
1. Push your repository to GitHub.
2. Go to [Vercel](https://vercel.com) and click **Add New Project**.
3. Import your `Github-Dashboard` repository.
4. Set **Root Directory** to `frontend`.
5. Add Environment Variable:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://your-backend.onrender.com`)
6. Click **Deploy**.

### Deploying Backend (Render / Railway)
1. Connect your repository on [Render](https://render.com) or [Railway](https://railway.app).
2. Set **Root Directory** to `backend`.
3. Set Build Command: `npm install`
4. Set Start Command: `node server.js`
5. Add Environment Variables:
   - `GITHUB_TOKEN`: Your GitHub PAT
   - `OPENAI_API_KEY`: Your OpenAI Key
   - `MONGODB_URI`: Your MongoDB Atlas Connection String
   - `FRONTEND_URL`: Your deployed frontend URL (e.g. `https://your-app.vercel.app`)

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
