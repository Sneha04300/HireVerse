const IconArrow = () => (
  <svg className="w-3.5 h-3.5 text-gray-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
  </svg>
);

export default function SuggestedPrompts({ prompts, onSelect }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500 mb-4">Suggested Prompts</p>
      <div className="flex flex-col gap-2.5">
        {prompts.map((p) => (
          <button
            key={p}
            onClick={() => onSelect(p)}
            className="group w-full flex items-center justify-between gap-3 text-left px-4 py-3 rounded-xl text-sm text-gray-200 transition-all hover:scale-[1.01]"
            style={{ background: "#111827", border: "0.5px solid #1e2535" }}
          >
            <span>{p}</span>
            <IconArrow />
          </button>
        ))}
      </div>
    </div>
  );
}
