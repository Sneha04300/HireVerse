import { AIAvatar } from "./ChatMessage";

const CHIP_COLORS = {
  amber:  { bg: "var(--badge-yellow-bg)",  border: "var(--badge-yellow-border)",  text: "var(--badge-yellow-text)" },
  cyan:   { bg: "var(--badge-cyan-bg)",  border: "var(--badge-cyan-border)",  text: "var(--badge-cyan-text)" },
  pink:   { bg: "var(--badge-red-bg)", border: "var(--badge-red-border)", text: "var(--badge-red-text)" },
  violet: { bg: "var(--badge-purple-bg)",border: "var(--badge-purple-border)",text: "var(--badge-purple-text)" },
};

function scoreColor(score) {
  if (score >= 85) return "#22c55e";
  if (score >= 70) return "var(--brand-accent)";
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
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] self-start">
        Placement Readiness
      </p>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="sidebarRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--ring-gradient-from)" />
              <stop offset="100%" stopColor="var(--ring-gradient-to)" />
            </linearGradient>
          </defs>
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="var(--ring-track)" strokeWidth={stroke} />
          <circle
            cx={size/2} cy={size/2} r={radius} fill="none"
            stroke="url(#sidebarRingGrad)" strokeWidth={stroke}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.2s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[var(--text-primary)] text-3xl font-extrabold leading-none">{score}%</span>
        </div>
      </div>
      <p className="text-[var(--text-muted)] text-xs">{label}</p>
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
        style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
          {data.company} Readiness
        </p>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-[var(--text-primary)] text-5xl font-extrabold leading-none">{data.score}%</span>
          <span className="text-[var(--text-muted)] text-sm">Estimated time: {data.estimatedTime}</span>
        </div>

        <div className="h-2 rounded-full mb-5" style={{ background: "var(--border)" }}>
          <div
            className="h-2 rounded-full transition-all duration-1000" style={{ width: `${data.score}%`, background: `linear-gradient(90deg,var(--brand-secondary),${color})` }}
          />
        </div>

        <p className="text-[var(--text-muted)] text-xs uppercase tracking-widest font-semibold mb-2.5">Focus Areas</p>
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
