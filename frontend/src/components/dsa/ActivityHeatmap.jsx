import { useState } from "react";

const INTENSITY_COLORS = [
  "var(--heatmap-0)",                 // 0 - none
  "var(--heatmap-1)",   // 1 - light
  "var(--heatmap-2)",    // 2 - medium
  "var(--heatmap-3)",  // 3 - strong
  "var(--heatmap-4)",                 // 4 - intense
];

export default function ActivityHeatmap({ data }) {
  const [hovered, setHovered] = useState(null);

  // Group into 13 weeks x 7 days
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div
      className="rounded-2xl p-6 relative"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">Activity</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[var(--text-muted)] text-xs mr-1">Less</span>
          {INTENSITY_COLORS.map((c, i) => (
            <span key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-[var(--text-muted)] text-xs ml-1">More</span>
        </div>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                onMouseEnter={() => setHovered({ ...day, wi, di })}
                onMouseLeave={() => setHovered(null)}
                className="w-3.5 h-3.5 rounded-[3px] cursor-pointer transition-transform hover:scale-125"
                style={{ background: INTENSITY_COLORS[day.intensity] }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {hovered && (
        <div
          className="absolute z-10 px-3 py-2 rounded-lg text-xs pointer-events-none shadow-xl"
          style={{
            background: "var(--bg-tooltip)",
            border: "0.5px solid var(--border-focus)",
            top: "70px",
            left: `${24 + hovered.wi * 16}px`,
          }}
        >
          <p className="text-[var(--text-primary)] font-semibold">{hovered.count} problems solved</p>
          <p className="text-[var(--text-muted)]">{new Date(hovered.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
      )}

      <p className="text-[var(--text-muted)] text-xs mt-4">Last 90 days of submissions</p>
    </div>
  );
}
