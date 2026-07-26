"use client";

export default function ErrorBanner({ type = "generic", message, onRetry, username }) {
  if (type === "not-found") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center animate-fade-in">
        {/* Illustration */}
        <div className="w-24 h-24 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center mb-6">
          <svg className="w-12 h-12 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          User Not Found
        </h2>
        <p className="text-[var(--color-text-secondary)] max-w-md mb-6">
          We couldn&apos;t find a GitHub user named <span className="font-mono font-semibold text-[var(--color-accent-red)]">&apos;{username}&apos;</span>. Double-check the spelling and try again.
        </p>
        <a
          href="/"
          className="px-6 py-2.5 rounded-lg font-semibold text-sm
                     bg-[var(--color-accent-indigo)] text-white
                     hover:bg-[var(--color-accent-indigo-hover)] hover:shadow-[var(--shadow-glow-indigo)]
                     transition-all duration-200"
        >
          ← Back to Search
        </a>
      </div>
    );
  }

  if (type === "rate-limit") {
    return (
      <div className="w-full px-4 py-3 rounded-xl bg-[var(--color-accent-amber)]/10 border border-[var(--color-accent-amber)]/25 flex items-center gap-3 animate-fade-in">
        <svg className="w-5 h-5 text-[var(--color-accent-amber)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-sm text-[var(--color-accent-amber)]">
          {message || "GitHub API rate limit reached — showing cached data."}
        </p>
      </div>
    );
  }

  // Generic inline error
  return (
    <div className="card p-5 text-center animate-fade-in">
      <svg className="w-8 h-8 mx-auto text-[var(--color-accent-red)] mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-sm text-[var(--color-text-secondary)] mb-3">
        {message || "Something went wrong. Please try again."}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-xs font-medium
                     bg-[var(--color-accent-indigo)] text-white
                     hover:bg-[var(--color-accent-indigo-hover)]
                     transition-all duration-200 cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
}
