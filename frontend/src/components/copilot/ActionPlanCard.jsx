import { AIAvatar } from "./ChatMessage";

const STATUS_STYLES = {
  done:     { dot: "#22c55e", line: "#22c55e", text: "text-gray-400 line-through", badge: "Done" },
  current:  { dot: "#06B6D4", line: "#1e2535", text: "text-white font-semibold",   badge: "In Progress" },
  upcoming: { dot: "#2a3550", line: "#1e2535", text: "text-gray-500",              badge: "Upcoming" },
};

const BADGE_COLORS = {
  done:     { bg: "rgba(34,197,94,0.12)", border: "rgba(34,197,94,0.3)", color: "#22c55e" },
  current:  { bg: "rgba(6,182,212,0.12)", border: "rgba(6,182,212,0.3)", color: "#06B6D4" },
  upcoming: { bg: "rgba(75,85,99,0.2)",   border: "rgba(75,85,99,0.4)",  color: "#9ca3af" },
};

export default function ActionPlanCard({ plan }) {
  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <AIAvatar />
      <div
        className="max-w-[85%] w-full rounded-2xl rounded-tl-sm p-6 transition-transform hover:scale-[1.01]"
        style={{ background: "#111827", border: "0.5px solid #1e2535" }}
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-4">30-Day Plan</p>

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
                    <span className="text-gray-500 text-xs font-semibold uppercase tracking-widest">{item.week}</span>
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
