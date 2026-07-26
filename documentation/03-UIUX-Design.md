# UI/UX Design Document
## GitHub Developer Dashboard

**Version:** 1.0
**Status:** Draft for Review

---

## 1. Design Principles

1. **Data-first, clutter-free** — every element earns its space; no decorative noise competing with the stats.
2. **Instant legibility** — a recruiter should understand the profile in a 10-second glance.
3. **GitHub-familiar, not GitHub-cloned** — echo GitHub's visual language (heatmap style, dark mode friendliness) but with a distinct, more polished identity.
4. **Progressive loading** — sections render independently as their data arrives, never one big blocking spinner.
5. **Responsive by default** — same information hierarchy from mobile to widescreen, just reflowed.

## 2. Visual Style

### 2.1 Color Palette

| Role | Color | Hex |
|---|---|---|
| Background (dark mode default) | Near-black slate | `#0D1117` |
| Surface / cards | Elevated slate | `#161B22` |
| Primary accent | Electric indigo | `#6366F1` |
| Secondary accent | Teal | `#2DD4BF` |
| Text primary | Off-white | `#E6EDF3` |
| Text secondary | Muted gray | `#8B949E` |
| Heatmap scale | Green scale (GitHub-familiar) | `#161B22 → #0E4429 → #006D32 → #26A641 → #39D353` |
| Success / streak | Amber | `#F59E0B` |
| Error | Red | `#F85149` |

A light mode variant follows the same accent colors on a white/`#F6F8FA` surface — toggle in the header.

### 2.2 Typography

- **Headings:** Inter or Geist Sans, semi-bold — clean, modern, highly legible at small sizes.
- **Body:** Inter, regular, 14–16px.
- **Numeric stats (big numbers):** Tabular figures, bold, slightly larger (24–32px) to draw the eye.
- **Monospace accents** (e.g., username, repo names): JetBrains Mono or system monospace — reinforces "developer tool" feel.

### 2.3 Spacing & Layout Grid

- 12-column responsive grid, 24px gutters on desktop, 16px on mobile.
- Card-based layout: each feature (heatmap, languages, repos, achievements, AI summary) lives in its own rounded card (`radius: 12px`, subtle border, soft shadow on hover).

## 3. Screens

### 3.1 Landing / Search Screen
- Centered layout, minimal.
- App name/logo top-left or centered above search.
- Large search input: "Enter a GitHub username" with a GitHub-mark icon prefix.
- CTA button: "View Dashboard."
- Below the fold: 3–4 example usernames as quick-launch chips (e.g., "Try: torvalds, gaearon").
- Recent searches (if any) shown as a small list below the search bar.

### 3.2 Loading State
- Skeleton cards matching the dashboard layout (not a full-page spinner) — heatmap, chart, and list skeletons pulse in place while data streams in.
- Each card independently swaps from skeleton → content as its data resolves.

### 3.3 Dashboard Screen (Main)

**Header**
- Avatar, display name, `@username`, bio, follower/following count, "View on GitHub ↗" link.
- Search bar remains accessible (sticky top) to look up another user without going back.

**Section 1 — Contribution Heatmap**
- Full-width card. GitHub-style 52-week × 7-day grid.
- Header row: "X contributions in the last year."
- Hover tooltip per cell: date + count.
- Legend: Less → More intensity scale.

**Section 2 — Streaks & Achievements**
- Two stat tiles: "Current Streak: N days" / "Longest Streak: N days," each with a small flame/trophy icon.
- Achievement badges displayed as a horizontal row of pill/badge components (icon + label), earned badges in full color, unearned ones grayed out with a tooltip explaining how to earn them.

**Section 3 — Most-Used Languages**
- Donut chart (left) + ranked list with percentages (right) on desktop; stacked vertically on mobile.
- Each language has a consistent color mapping (reuse GitHub's language colors where possible, e.g., JS yellow, Python blue, TS blue).

**Section 4 — Repository Insights**
- Grid of repo cards (2–3 columns desktop, 1 column mobile).
- Each card: repo name, description (truncated), language dot + name, ⭐ stars, 🍴 forks, last updated ("2 days ago").
- Sort control top-right: "Most Stars / Recently Updated / Most Forks."

**Section 5 — AI-Generated Portfolio Summary**
- Distinct card style (subtle gradient border or accent background) to signal it's AI-generated.
- Small "✨ AI Summary" label/badge.
- 3–5 sentence paragraph.
- "Regenerate" icon button (with rate-limit awareness — disabled with tooltip if on cooldown).

**Footer**
- Data source disclaimer ("Data from GitHub's public API, refreshed hourly"), link to source repo, your name/portfolio link.

### 3.4 Error States
- **User not found:** Illustration + "We couldn't find a GitHub user named '{username}'. Double check the spelling." + back-to-search CTA.
- **Rate limit reached:** Inline banner at top of dashboard: "GitHub API limit reached — showing cached data from [time]" (if cache available) or a full-screen retry state (if not).
- **Partial failure** (e.g., AI summary only): the rest of the dashboard renders normally; only the failed card shows its own inline error + retry.

## 4. Component Inventory

| Component | Purpose |
|---|---|
| `SearchBar` | Username input + submit, used on landing and sticky header |
| `ProfileHeader` | Avatar, name, bio, stats |
| `ContributionHeatmap` | SVG/grid calendar with tooltips |
| `StreakStat` | Single stat tile with icon |
| `AchievementBadge` | Icon + label, earned/unearned states |
| `LanguageDonutChart` | Chart + legend list |
| `RepoCard` | Single repository summary |
| `RepoGrid` | Layout + sort control for repo cards |
| `AISummaryCard` | AI text block with regenerate action |
| `SkeletonCard` | Generic loading placeholder matching card shapes |
| `ErrorBanner` | Inline dismissible error/notice |

## 5. Interaction & Motion

- Cards fade/slide in (150–200ms) as their data resolves — reinforces progressive loading without feeling janky.
- Heatmap cell hover: scale 1.15 + tooltip fade-in.
- Badge hover (unearned): tooltip explaining criteria.
- Theme toggle (dark/light): instant, no flash-of-unstyled-content (persist preference locally).

## 6. Responsive Behavior

| Breakpoint | Layout change |
|---|---|
| ≥1280px | Full multi-column grid, donut+list side by side |
| 768–1279px | 2-column repo grid, stacked language section |
| <768px | Single column throughout, heatmap scrolls horizontally within its card, sticky search collapses to icon-only until tapped |

## 7. Accessibility Notes

- All charts paired with a "view as table" toggle for screen reader users.
- Color is never the only signal (e.g., achievement earned/unearned also differs by icon opacity + a checkmark).
- Minimum tap target 44×44px on mobile controls.
- Focus states visible and consistent with the indigo accent color.

---
*Next document: [App Flow](./04-AppFlow.md)*
