export default function FocusAreas({ areas }) {
  return (
    <div
      className="rounded-2xl p-6 flex flex-col gap-4 transition-transform hover:scale-[1.01]"
      style={{ background: "#0d1117", border: "0.5px solid #1e2535" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">Focus Areas</p>

      <div className="flex flex-col gap-3.5">
        {areas.map((a) => (
          <div key={a.id} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">{a.label}</span>
              <span className="text-white text-sm font-bold">{a.progress}%</span>
            </div>
            <div className="h-1.5 rounded-full" style={{ background: "#1e2535" }}>
              <div
                className="h-1.5 rounded-full transition-all duration-700"
                style={{ width: `${a.progress}%`, background: a.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
