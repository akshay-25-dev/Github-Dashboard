"use client";

export default function StreakStats({ contributions }) {
  if (!contributions) return null;

  const stats = [
    {
      label: "Current Streak",
      value: contributions.currentStreak || 0,
      unit: "days",
      icon: "🔥",
      color: "var(--color-accent-amber)",
    },
    {
      label: "Longest Streak",
      value: contributions.longestStreak || 0,
      unit: "days",
      icon: "🏆",
      color: "var(--color-accent-teal)",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 animate-fade-in-up stagger-3">
      {stats.map((stat) => (
        <div key={stat.label} className="card p-5 text-center">
          <span className="text-2xl">{stat.icon}</span>
          <div
            className="text-3xl font-bold mt-2"
            style={{ color: stat.color, fontVariantNumeric: "tabular-nums" }}
          >
            {stat.value}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] mt-0.5">{stat.unit}</div>
          <div className="text-sm font-medium text-[var(--color-text-secondary)] mt-1">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
