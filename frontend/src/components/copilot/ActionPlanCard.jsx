import { AIAvatar } from "./ChatMessage";

const STATUS_STYLES = {
  done:     { dot: "#22c55e", line: "#22c55e", text: "text-[var(--text-tertiary)] line-through", badge: "Done" },
  current:  { dot: "var(--brand-accent)", line: "var(--border)", text: "text-[var(--text-primary)] font-semibold",   badge: "In Progress" },
  upcoming: { dot: "var(--border-focus)", line: "var(--border)", text: "text-[var(--text-muted)]",              badge: "Upcoming" },
};

const BADGE_COLORS = {
  done:     { bg: "var(--badge-green-bg)", border: "var(--badge-green-border)", color: "var(--badge-green-text)" },
  current:  { bg: "var(--badge-cyan-bg)", border: "var(--badge-cyan-border)", color: "var(--badge-cyan-text)" },
  upcoming: { bg: "var(--bg-elevated)",   border: "0.5px solid var(--border)",  color: "var(--text-secondary)" },
};

export default function ActionPlanCard({ plan }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <AIAvatar />
      <div
        className="max-w-[85%] w-full rounded-2xl rounded-tl-sm p-6 transition-transform hover:scale-[1.01]"
        style={{ background: "var(--bg-elevated)", border: "0.5px solid var(--border)" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">30-Day Plan</p>

        <div className="flex flex-col">
          {plan.map((item, i) => {
            const s = STATUS_STYLES[item.status];
            const badge = BADGE_COLORS[item.status];
            const isLast = i === plan.length - 1;

            return (
              <div key={item.week} className="flex gap-4">
                {/* Timeline rail */}
                <div className="flex flex-col items-center flex-shrink-0">
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                    style={{ background: s.dot, boxShadow: item.status === "current" ? `0 0 0 4px ${s.dot}30` : "none" }}
                  />
                  {!isLast && <span className="w-0.5 flex-1 my-1" style={{ background: s.line, minHeight: "28px" }} />}
                </div>

                {/* Content */}
                <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[var(--text-muted)] text-xs font-semibold uppercase tracking-widest">{item.week}</span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: badge.bg, border: `0.5px solid ${badge.border}`, color: badge.color }}
                    >
                      {s.badge}
                    </span>
                  </div>
                  <p className={`text-sm ${s.text}`}>{item.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
