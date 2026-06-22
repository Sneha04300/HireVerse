import { AIAvatar } from "./ChatMessage";

const CHIP_COLORS = {
  amber:  { bg: "rgba(234,179,8,0.15)",  border: "rgba(234,179,8,0.35)",  text: "#eab308" },
  cyan:   { bg: "rgba(6,182,212,0.15)",  border: "rgba(6,182,212,0.35)",  text: "#06B6D4" },
  pink:   { bg: "rgba(236,72,153,0.15)", border: "rgba(236,72,153,0.35)", text: "#ec4899" },
  violet: { bg: "rgba(167,139,250,0.15)",border: "rgba(167,139,250,0.35)",text: "#a78bfa" },
};

function scoreColor(score) {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "#06B6D4";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

// ── Sidebar variant: "Placement Readiness" circular ring card ───────────────
export function ReadinessRingCard({ score, label }) {
  const size = 140, stroke = 12;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  return (
    <div
      className="rounded-2xl p-6 flex flex-col items-center gap-3 transition-transform hover:scale-[1.01]"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 self-start">
        Placement Readiness
      </p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="sidebarRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#1e2535" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="url(#sidebarRingGrad)" strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white text-3xl font-extrabold leading-none">{score}%</span>
        </div>
      </div>
      <p className="text-gray-500 text-xs">{label}</p>
    </div>
  );
}

// ── Chat variant: "AMAZON READINESS" card inside the conversation ──────────
export default function ReadinessCard({ data }) {
  const color = scoreColor(data.score);

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <AIAvatar />
      <div
        className="max-w-[85%] w-full rounded-2xl rounded-tl-sm p-6 transition-transform hover:scale-[1.01]"
        style={{ background: "#111827", border: "0.5px solid #1e2535" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">
          {data.company} Readiness
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-white text-5xl font-extrabold leading-none">{data.score}%</span>
          <span className="text-gray-500 text-sm">Estimated time: {data.estimatedTime}</span>
        </div>

        <div className="h-2 rounded-full mb-5" style={{ background: "#1e2535" }}>
          <div
            className="h-2 rounded-full transition-all duration-1000"
            style={{ width: `${data.score}%`, background: `linear-gradient(90deg,#7C3AED,${color})` }}
          />
        </div>

        <p className="text-gray-500 text-xs uppercase tracking-widest font-semibold mb-2.5">Focus Areas</p>
        <div className="flex flex-wrap gap-2">
          {data.focusAreas.map((f) => {
            const c = CHIP_COLORS[f.color];
            return (
              <span
                key={f.label}
                className="text-xs font-semibold px-3 py-1.5 rounded-full transition-transform hover:scale-105"
                style={{ background: c.bg, border: `0.5px solid ${c.border}`, color: c.text }}
              >
                {f.label}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
