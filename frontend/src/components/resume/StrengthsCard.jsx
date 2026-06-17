const IconCheck = () => (
  <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = () => (
  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function StrengthsCard({ strengths, weaknesses }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Strengths */}
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Strengths</h3>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "rgba(34,197,94,0.15)", border: "0.5px solid rgba(34,197,94,0.35)", color: "#22c55e" }}
          >
            {strengths.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {strengths.map((s) => (
            <div key={s} className="flex items-start gap-2.5">
              <IconCheck />
              <span className="text-gray-300 text-sm leading-snug">{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weaknesses */}
      <div className="rounded-2xl p-5 flex flex-col gap-4" style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-white font-bold text-base">Weaknesses</h3>
          <span
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: "rgba(239,68,68,0.15)", border: "0.5px solid rgba(239,68,68,0.35)", color: "#ef4444" }}
          >
            {weaknesses.length}
          </span>
        </div>
        <div className="flex flex-col gap-3">
          {weaknesses.map((w) => (
            <div key={w} className="flex items-start gap-2.5">
              <IconX />
              <span className="text-gray-300 text-sm leading-snug">{w}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
