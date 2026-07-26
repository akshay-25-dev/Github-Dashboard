"use client";

export default function ProfileHeader({ profile }) {
  if (!profile) return null;

  const accountAge = profile.accountCreatedAt
    ? Math.floor(
        (new Date() - new Date(profile.accountCreatedAt)) / (1000 * 60 * 60 * 24 * 365)
      )
    : null;

  return (
    <div className="card p-6 animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        {/* Avatar */}
        <img
          src={profile.avatarUrl}
          alt={`${profile.displayName}'s avatar`}
          className="w-24 h-24 rounded-full border-2 border-[var(--color-border)] shadow-lg"
        />

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">
            {profile.displayName}
          </h1>
          {profile.bio && (
            <p className="mt-1 text-[var(--color-text-secondary)] text-sm leading-relaxed max-w-lg">
              {profile.bio}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-3 text-sm text-[var(--color-text-secondary)]">
            {profile.company && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                {profile.company}
              </span>
            )}
            {profile.location && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </span>
            )}
            {accountAge !== null && (
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {accountAge} years on GitHub
              </span>
            )}
          </div>

          {/* Stats row */}
          <div className="flex items-center justify-center sm:justify-start gap-6 mt-4">
            <div className="text-center">
              <span className="block text-xl font-bold text-[var(--color-text-primary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {profile.publicRepos}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">Repos</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-[var(--color-text-primary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {profile.followers?.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">Followers</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-[var(--color-text-primary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {profile.following?.toLocaleString()}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">Following</span>
            </div>
          </div>
        </div>

        {/* View on GitHub link */}
        <a
          href={profile.htmlUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium
                     bg-[var(--color-bg-hover)] border border-[var(--color-border)]
                     text-[var(--color-text-secondary)]
                     hover:border-[var(--color-accent-indigo)] hover:text-[var(--color-accent-indigo)]
                     transition-all duration-200"
        >
          View on GitHub
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
