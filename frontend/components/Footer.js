"use client";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--color-border)] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--color-text-muted)]">
        <p>
          Data from GitHub&apos;s public API, refreshed hourly. AI summaries powered by Google Gemini.
        </p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/akshay-25-dev/Github-Dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[var(--color-accent-indigo)] transition-colors"
          >
            Source Code
          </a>
          <span>·</span>
          <span>Built by Akshay</span>
        </div>
      </div>
    </footer>
  );
}
