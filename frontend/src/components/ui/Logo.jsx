export default function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg">
        <svg
          className="w-5 h-5 text-white"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
      <div>
        <div className="text-white font-bold text-lg leading-none tracking-tight">
          HireVerse
        </div>
        <div className="text-gray-400 text-[10px] tracking-widest uppercase font-medium mt-0.5">
          Placement OS
        </div>
      </div>
    </div>
  );
}
