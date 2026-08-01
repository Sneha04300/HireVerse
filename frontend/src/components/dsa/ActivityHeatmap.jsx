import { useMemo } from "react";

const LEVELS = [
  { max: 0, className: "bg-[var(--heatmap-0)]" },
  { max: 1, className: "bg-[var(--heatmap-1)]" },
  { max: 3, className: "bg-[var(--heatmap-2)]" },
  { max: 6, className: "bg-[var(--heatmap-3)]" },
  { max: Infinity, className: "bg-[var(--heatmap-4)]" },
];

const CELL = 10;
const GAP = 3;
const PITCH = CELL + GAP;

function getLevel(count) {
  for (const l of LEVELS) {
    if (count <= l.max) return l.className;
  }
  return LEVELS[0].className;
}

function getTooltip(day) {
  if (!day) return "";
  const d = new Date(day.date);
  const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  return `${day.count} problem${day.count !== 1 ? "s" : ""} solved on ${label}`;
}

export default function ActivityHeatmap({ data }) {
  const weeks = useMemo(() => {
    if (!data || data.length === 0) return [];
    const groups = [];
    for (let i = 0; i < data.length; i += 7) {
      groups.push(data.slice(i, i + 7));
    }
    return groups;
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels = [];
    let prev = "";
    weeks.forEach((week, wi) => {
      const d = new Date(week[0].date);
      const label = d.toLocaleDateString("en-US", { month: "short" });
      if (wi === 0 || label !== prev) labels.push({ wi, label });
      prev = label;
    });
    return labels;
  }, [weeks]);

  if (!data || data.length === 0) {
    return (
      <div className="dsa-card p-4 flex flex-col gap-3">
        <p className="section-label text-[var(--text-muted)]">Activity</p>
        <p className="text-[13px] text-[var(--text-muted)]">No activity data yet.</p>
      </div>
    );
  }

  const totalActive = data.filter((d) => d.count > 0).length;
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="dsa-card p-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <p className="section-label text-[var(--text-muted)]">Activity</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-[var(--text-muted)]">Less</span>
          {LEVELS.map((_, i) => (
            <span key={i} className={`w-2 h-2 rounded-[2px] ${getLevel(i > 0 ? LEVELS[i - 1]?.max || 0 : 0)}`}
              style={i === 0 ? { background: "var(--heatmap-0)" } : undefined}
            />
          ))}
          <span className="text-[9px] text-[var(--text-muted)]">More</span>
        </div>
      </div>

      <div className="relative h-4">
        {monthLabels.map(({ wi, label }) => (
          <span
            key={wi}
            className="absolute top-0 text-[9px] font-medium text-[var(--text-muted)] whitespace-nowrap"
            style={{ left: `${wi * PITCH}px` }}
          >
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-[3px] overflow-x-auto pb-0.5">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day, di) => (
              <div
                key={di}
                title={getTooltip(day)}
                className={`w-[10px] h-[10px] rounded-[2px] cursor-pointer transition-transform hover:scale-125 ${getLevel(day.count)}`}
              />
            ))}
          </div>
        ))}
      </div>

      <p className="text-[10px] text-[var(--text-muted)]">
        {totalActive} active day{totalActive !== 1 ? "s" : ""} in the last 90 days &middot; max {maxCount} problem{maxCount !== 1 ? "s" : ""} in a day
      </p>
    </div>
  );
}
