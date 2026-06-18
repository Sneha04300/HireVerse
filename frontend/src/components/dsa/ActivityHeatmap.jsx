import { useState } from "react";

const INTENSITY_COLORS = [
  "#1a1f2e",                 // 0 - none
  "rgba(124,58,237,0.35)",   // 1 - light
  "rgba(124,58,237,0.6)",    // 2 - medium
  "rgba(167,139,250,0.85)",  // 3 - strong
  "#a78bfa",                 // 4 - intense
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
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <div className="flex items-center justify-between mb-5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Activity</p>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-600 text-xs mr-1">Less</span>
          {INTENSITY_COLORS.map((c, i) => (
            <span key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: c }} />
          ))}
          <span className="text-gray-600 text-xs ml-1">More</span>
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
            background: "#1a1f2e",
            border: "0.5px solid #2a3550",
            top: "70px",
            left: `${24 + hovered.wi * 16}px`,
          }}
        >
          <p className="text-white font-semibold">{hovered.count} problems solved</p>
          <p className="text-gray-500">{new Date(hovered.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
        </div>
      )}

      <p className="text-gray-600 text-xs mt-4">Last 90 days of submissions</p>
    </div>
  );
}
