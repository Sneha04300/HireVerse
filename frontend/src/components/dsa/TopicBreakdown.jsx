// Reuses the same topic shape from dsaDummyData but adds accuracy
const ACCURACY_MAP = {
  arrays: 92, strings: 88, hashing: 80, trees: 74, graphs: 65,
  dp: 58, greedy: 85, "binary-search": 90, "linked-list": 81,
  "stack-queue": 79, heap: 70, recursion: 76, backtracking: 60,
};

function accuracyColor(acc) {
  if (acc >= 85) return "#22c55e";
  if (acc >= 70) return "#06B6D4";
  if (acc >= 55) return "#eab308";
  return "#ef4444";
}

export default function TopicBreakdown({ topics }) {
  return (
    <div
      className="rounded-2xl p-6 overflow-x-auto"
      style={{ background: "var(--bg-card)", border: "0.5px solid var(--border)" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">Topic Breakdown</p>

      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="text-left text-[var(--text-muted)] text-xs uppercase tracking-widest">
            <th className="pb-3 font-semibold">Topic</th>
            <th className="pb-3 font-semibold text-center">Solved</th>
            <th className="pb-3 font-semibold text-center">Remaining</th>
            <th className="pb-3 font-semibold text-right">Accuracy</th>
          </tr>
        </thead>
        <tbody>
          {topics.map((t) => {
            const acc = ACCURACY_MAP[t.id] ?? 75;
            const color = accuracyColor(acc);
            return (
              <tr key={t.id} className="border-t border-[var(--border)]">
                <td className="py-3 text-[var(--text-primary)] font-medium">{t.label}</td>
                <td className="py-3 text-center text-[var(--text-primary)] font-semibold">{t.solved}</td>
                <td className="py-3 text-center text-[var(--text-muted)]">{t.total - t.solved}</td>
                <td className="py-3 text-right">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: `${color}20`, border: `0.5px solid ${color}60`, color }}
                  >
                    {acc}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
