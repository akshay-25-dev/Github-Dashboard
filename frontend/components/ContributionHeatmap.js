"use client";

import { useState, useMemo } from "react";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

function getHeatmapColor(count) {
  if (count === 0) return "var(--color-heatmap-0)";
  if (count <= 3) return "var(--color-heatmap-1)";
  if (count <= 6) return "var(--color-heatmap-2)";
  if (count <= 9) return "var(--color-heatmap-3)";
  return "var(--color-heatmap-4)";
}

function formatDate(dateStr) {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ContributionHeatmap({ contributions }) {
  const [tooltip, setTooltip] = useState(null);

  const { weeks, monthPositions } = useMemo(() => {
    if (!contributions?.calendar || contributions.calendar.length === 0) {
      return { weeks: [], monthPositions: [] };
    }

    // Group calendar days into weeks (columns)
    const calendar = contributions.calendar;
    const weeksList = [];
    let currentWeek = [];

    for (let i = 0; i < calendar.length; i++) {
      const dayOfWeek = new Date(calendar[i].date + "T00:00:00").getDay();
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeksList.push(currentWeek);
        currentWeek = [];
      }
      currentWeek.push(calendar[i]);
    }
    if (currentWeek.length > 0) {
      weeksList.push(currentWeek);
    }

    // Compute month label positions
    const positions = [];
    let lastMonth = -1;
    for (let wi = 0; wi < weeksList.length; wi++) {
      const firstDay = weeksList[wi][0];
      const month = new Date(firstDay.date + "T00:00:00").getMonth();
      if (month !== lastMonth) {
        positions.push({ month, weekIndex: wi });
        lastMonth = month;
      }
    }

    return { weeks: weeksList, monthPositions: positions };
  }, [contributions]);

  if (!contributions || !contributions.calendar) return null;

  const cellSize = 13;
  const cellGap = 3;
  const leftPad = 32;
  const topPad = 20;
  const svgWidth = leftPad + weeks.length * (cellSize + cellGap) + 16;
  const svgHeight = topPad + 7 * (cellSize + cellGap) + 8;

  return (
    <div className="card p-6 animate-fade-in-up stagger-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
          {contributions.totalContributions?.toLocaleString()} contributions in the last year
        </h3>
      </div>

      <div className="overflow-x-auto pb-2 -mx-2 px-2">
        <div className="relative" style={{ minWidth: svgWidth }}>
          <svg width={svgWidth} height={svgHeight} className="block">
            {/* Month labels */}
            {monthPositions.map((pos, i) => (
              <text
                key={i}
                x={leftPad + pos.weekIndex * (cellSize + cellGap)}
                y={12}
                className="text-[10px] fill-[var(--color-text-muted)]"
              >
                {MONTH_LABELS[pos.month]}
              </text>
            ))}

            {/* Day labels */}
            {DAY_LABELS.map((label, i) => (
              label && (
                <text
                  key={i}
                  x={0}
                  y={topPad + i * (cellSize + cellGap) + cellSize - 2}
                  className="text-[10px] fill-[var(--color-text-muted)]"
                >
                  {label}
                </text>
              )
            ))}

            {/* Cells */}
            {weeks.map((week, wi) =>
              week.map((day) => {
                const dayOfWeek = new Date(day.date + "T00:00:00").getDay();
                const x = leftPad + wi * (cellSize + cellGap);
                const y = topPad + dayOfWeek * (cellSize + cellGap);

                return (
                  <rect
                    key={day.date}
                    x={x}
                    y={y}
                    width={cellSize}
                    height={cellSize}
                    rx={2}
                    fill={getHeatmapColor(day.count)}
                    className="transition-all duration-150 cursor-pointer hover:stroke-[var(--color-text-secondary)] hover:stroke-1"
                    style={{ transform: "scale(1)", transformOrigin: `${x + cellSize / 2}px ${y + cellSize / 2}px` }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.3)";
                      setTooltip({
                        x: x + cellSize / 2,
                        y: y - 8,
                        text: `${day.count} contribution${day.count !== 1 ? "s" : ""} on ${formatDate(day.date)}`,
                      });
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      setTooltip(null);
                    }}
                  />
                );
              })
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div
              className="heatmap-tooltip"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              <span className="text-[var(--color-text-primary)]">{tooltip.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-1.5 mt-3 text-xs text-[var(--color-text-muted)]">
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: `var(--color-heatmap-${level})` }}
          />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
