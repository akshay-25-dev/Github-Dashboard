"use client";

import { useState, useMemo } from "react";

function timeAgo(dateStr) {
  const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
  const intervals = [
    { label: "year", seconds: 31536000 },
    { label: "month", seconds: 2592000 },
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) {
      return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
  }
  return "just now";
}

// Language dot colors (subset)
const LANG_COLORS = {
  JavaScript: "#F1E05A",
  TypeScript: "#3178C6",
  Python: "#3572A5",
  Java: "#B07219",
  "C++": "#F34B7D",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Ruby: "#701516",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89E051",
  Vue: "#41B883",
  PHP: "#4F5D95",
  C: "#555555",
  "C#": "#178600",
};

function RepoCard({ repo }) {
  return (
    <a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="card p-5 flex flex-col gap-3 hover:translate-y-[-2px] transition-all duration-200 group"
    >
      {/* Repo name */}
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-[var(--color-text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
        <h4 className="font-semibold font-mono text-sm text-[var(--color-accent-indigo)] group-hover:text-[var(--color-accent-indigo-hover)] truncate">
          {repo.name}
        </h4>
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2 leading-relaxed">
          {repo.description}
        </p>
      )}

      {/* Meta row */}
      <div className="flex items-center gap-4 mt-auto text-xs text-[var(--color-text-muted)]">
        {repo.language !== "N/A" && (
          <span className="flex items-center gap-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: LANG_COLORS[repo.language] || "#8B949E" }}
            />
            {repo.language}
          </span>
        )}
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
          {repo.stars.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {repo.forks.toLocaleString()}
        </span>
        <span className="ml-auto">{timeAgo(repo.updatedAt)}</span>
      </div>
    </a>
  );
}

export default function RepoGrid({ repos }) {
  const [sortBy, setSortBy] = useState("stars");

  const sortedRepos = useMemo(() => {
    if (!repos?.topRepos) return [];
    const sorted = [...repos.topRepos];
    switch (sortBy) {
      case "stars":
        return sorted.sort((a, b) => b.stars - a.stars);
      case "forks":
        return sorted.sort((a, b) => b.forks - a.forks);
      case "updated":
        return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      default:
        return sorted;
    }
  }, [repos, sortBy]);

  if (!repos?.topRepos || repos.topRepos.length === 0) return null;

  return (
    <div className="animate-fade-in-up stagger-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Repository Insights
        </h3>
        <div className="flex items-center gap-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-lg p-0.5">
          {[
            { value: "stars", label: "⭐ Stars" },
            { value: "updated", label: "🕒 Recent" },
            { value: "forks", label: "🍴 Forks" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setSortBy(option.value)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer
                ${sortBy === option.value
                  ? "bg-[var(--color-accent-indigo)] text-white"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sortedRepos.slice(0, 12).map((repo) => (
          <RepoCard key={repo.name} repo={repo} />
        ))}
      </div>
    </div>
  );
}
