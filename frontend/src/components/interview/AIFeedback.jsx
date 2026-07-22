export default function AIFeedback({ feedback, decision }) {
  return (
    <div className="mt-4 space-y-3">
      {/* Feedback card */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-base)]/80 p-4">
        <p className="text-xs font-semibold tracking-widest text-[var(--text-tertiary)] mb-3">
          AI FEEDBACK
        </p>
        <ul className="space-y-1.5">
          {feedback.map((item, i) => (
            <li key={i} className="text-sm text-[var(--text-secondary)] leading-relaxed">
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Decision badge */}
      <div>
        <span className="inline-flex items-center px-4 py-2 rounded-full border border-green-500/50 bg-green-500/10 text-green-400 text-sm font-semibold">
          {decision}
        </span>
      </div>
    </div>
  );
}
