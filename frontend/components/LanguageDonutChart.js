"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// GitHub-consistent language colors
const LANGUAGE_COLORS = {
  JavaScript: "#F1E05A",
  TypeScript: "#3178C6",
  Python: "#3572A5",
  Java: "#B07219",
  "C++": "#F34B7D",
  C: "#555555",
  "C#": "#178600",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Dart: "#00B4AB",
  Shell: "#89E051",
  HTML: "#E34C26",
  CSS: "#563D7C",
  SCSS: "#C6538C",
  Vue: "#41B883",
  Svelte: "#FF3E00",
  Lua: "#000080",
  Scala: "#C22D40",
  Haskell: "#5E5086",
  Elixir: "#6E4A7E",
  Clojure: "#DB5855",
  Jupyter: "#F37626",
  R: "#198CE7",
};

const FALLBACK_COLORS = [
  "#6366F1", "#2DD4BF", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#14B8A6", "#F97316", "#06B6D4", "#84CC16",
];

function getLanguageColor(name, index) {
  return LANGUAGE_COLORS[name] || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-[var(--color-text-primary)]">{data.name}</p>
        <p className="text-xs text-[var(--color-text-secondary)]">
          {data.percent}% · {(data.bytes / 1024).toFixed(1)} KB
        </p>
      </div>
    );
  }
  return null;
}

export default function LanguageDonutChart({ languages }) {
  if (!languages?.breakdown || languages.breakdown.length === 0) return null;

  // Top 5 + "Other" bucket
  const top5 = languages.breakdown.slice(0, 5);
  const rest = languages.breakdown.slice(5);
  const otherPercent = rest.reduce((sum, l) => sum + l.percent, 0);
  const otherBytes = rest.reduce((sum, l) => sum + l.bytes, 0);

  const chartData = [
    ...top5,
    ...(rest.length > 0
      ? [{ name: "Other", percent: Math.round(otherPercent * 10) / 10, bytes: otherBytes }]
      : []),
  ];

  return (
    <div className="card p-6 animate-fade-in-up stagger-4">
      <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
        Most Used Languages
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-6">
        {/* Donut chart */}
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                dataKey="percent"
                animationBegin={200}
                animationDuration={800}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={getLanguageColor(entry.name, index)}
                    stroke="var(--color-bg-surface)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend list */}
        <div className="flex-1 w-full space-y-2.5">
          {chartData.map((lang, index) => (
            <div key={lang.name} className="flex items-center gap-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: getLanguageColor(lang.name, index) }}
              />
              <span className="text-sm text-[var(--color-text-primary)] flex-1">
                {lang.name}
              </span>
              <span className="text-sm font-medium text-[var(--color-text-secondary)]" style={{ fontVariantNumeric: "tabular-nums" }}>
                {lang.percent}%
              </span>
              {/* Percentage bar */}
              <div className="w-24 h-1.5 rounded-full bg-[var(--color-bg-hover)] overflow-hidden hidden sm:block">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${lang.percent}%`,
                    backgroundColor: getLanguageColor(lang.name, index),
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
