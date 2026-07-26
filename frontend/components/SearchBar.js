"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function SearchBar({ variant = "landing", defaultValue = "" }) {
  const [query, setQuery] = useState(defaultValue);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecent, setShowRecent] = useState(false);
  const router = useRouter();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        inputRef.current &&
        !inputRef.current.contains(e.target)
      ) {
        setShowRecent(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const validateUsername = useCallback((name) => {
    const pattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/;
    return pattern.test(name);
  }, []);

  const saveToRecent = useCallback(
    (username) => {
      const updated = [username, ...recentSearches.filter((s) => s !== username)].slice(0, 8);
      setRecentSearches(updated);
      localStorage.setItem("recentSearches", JSON.stringify(updated));
    },
    [recentSearches]
  );

  const handleSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault();
      const trimmed = query.trim();
      if (!trimmed) {
        setError("Please enter a username");
        return;
      }
      if (!validateUsername(trimmed)) {
        setError("Invalid GitHub username format");
        return;
      }
      setError("");
      setShowRecent(false);
      saveToRecent(trimmed);
      router.push(`/dashboard/${trimmed}`);
    },
    [query, validateUsername, saveToRecent, router]
  );

  const handleSelectRecent = (username) => {
    setQuery(username);
    setShowRecent(false);
    setError("");
    saveToRecent(username);
    router.push(`/dashboard/${username}`);
  };

  const clearRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
    setShowRecent(false);
  };

  const isLanding = variant === "landing";

  return (
    <div className={`relative ${isLanding ? "w-full max-w-xl" : "w-full max-w-md"}`}>
      <form onSubmit={handleSubmit} className="relative">
        <div
          className={`flex items-center gap-2 rounded-xl border transition-all duration-200
            ${isLanding
              ? "bg-[var(--color-bg-surface)] border-[var(--color-border)] px-5 py-4 shadow-[var(--shadow-glow-indigo)] focus-within:border-[var(--color-accent-indigo)] focus-within:shadow-[0_0_30px_rgba(99,102,241,0.25)]"
              : "bg-[var(--color-bg-surface)] border-[var(--color-border)] px-3 py-2 focus-within:border-[var(--color-accent-indigo)]"
            }`}
        >
          <svg
            className={`flex-shrink-0 text-[var(--color-text-muted)] ${isLanding ? "w-6 h-6" : "w-5 h-5"}`}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setError("");
            }}
            onFocus={() => recentSearches.length > 0 && setShowRecent(true)}
            placeholder="Enter a GitHub username"
            className={`flex-1 bg-transparent outline-none text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)]
              ${isLanding ? "text-lg" : "text-sm"}`}
            autoComplete="off"
            spellCheck={false}
          />
          <button
            id="search-submit"
            type="submit"
            className={`flex-shrink-0 rounded-lg font-semibold transition-all duration-200 cursor-pointer
              bg-[var(--color-accent-indigo)] text-white
              hover:bg-[var(--color-accent-indigo-hover)] hover:shadow-[var(--shadow-glow-indigo)]
              active:scale-95
              ${isLanding ? "px-6 py-2.5 text-sm" : "px-4 py-1.5 text-xs"}`}
          >
            {isLanding ? "View Dashboard" : "Go"}
          </button>
        </div>
      </form>

      {error && (
        <p className="mt-2 text-sm text-[var(--color-accent-red)] animate-fade-in">{error}</p>
      )}

      {showRecent && recentSearches.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 mt-2 w-full rounded-xl border border-[var(--color-border)]
                     bg-[var(--color-bg-surface)] shadow-[var(--shadow-card-hover)] animate-fade-in overflow-hidden"
        >
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--color-border)]">
            <span className="text-xs font-medium text-[var(--color-text-secondary)]">
              Recent Searches
            </span>
            <button
              onClick={clearRecent}
              className="text-xs text-[var(--color-text-muted)] hover:text-[var(--color-accent-red)] transition-colors cursor-pointer"
            >
              Clear all
            </button>
          </div>
          {recentSearches.map((username) => (
            <button
              key={username}
              onClick={() => handleSelectRecent(username)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left
                         text-[var(--color-text-primary)] hover:bg-[var(--color-bg-hover)]
                         transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-mono text-sm">{username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
