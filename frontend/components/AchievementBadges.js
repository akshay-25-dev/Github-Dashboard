"use client";

export default function AchievementBadges({ achievements }) {
  if (!achievements?.badges) return null;

  return (
    <div className="card p-6 animate-fade-in-up stagger-3">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Achievements
      </h3>
      <div className="flex flex-wrap gap-3">
        {achievements.badges.map((badge) => (
          <div
            key={badge.id}
            className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all duration-200
              ${badge.earned
                ? "bg-[var(--color-bg-elevated)] border-[var(--color-border-hover)] text-[var(--color-text-primary)]"
                : "bg-[var(--color-bg-primary)] border-[var(--color-border)] text-[var(--color-text-muted)] opacity-50"
              }`}
            title={badge.description}
          >
            <span className={`text-lg ${badge.earned ? "" : "grayscale"}`}>
              {badge.icon}
            </span>
            <span className="text-sm font-medium">{badge.label}</span>
            {badge.earned && (
              <svg className="w-4 h-4 text-[var(--color-accent-teal)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}

            {/* Tooltip for unearned badges */}
            {!badge.earned && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg
                              bg-[var(--color-bg-elevated)] border border-[var(--color-border)]
                              text-xs text-[var(--color-text-secondary)] whitespace-nowrap
                              opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none
                              shadow-[var(--shadow-card-hover)]">
                {badge.description}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
