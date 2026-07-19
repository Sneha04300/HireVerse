import { useState } from "react";

const TYPES = ["Technical", "HR", "Mixed"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function InterviewSetup({ onStart, pageState }) {
  const [selectedType, setSelectedType] = useState("Technical");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");

  const handleStartInterview = () => {
    onStart({
      type: selectedType,
      difficulty: selectedDifficulty,
    });
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-6 shadow-xl">
      <div className="flex flex-wrap gap-10">
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 mb-3">
            INTERVIEW TYPE
          </p>

          <div className="flex gap-2">
            {TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedType === type
                    ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 mb-3">
            DIFFICULTY
          </p>

          <div className="flex gap-2">
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  selectedDifficulty === diff
                    ? "bg-gradient-to-r from-purple-600 to-cyan-500 text-white shadow-lg shadow-purple-500/30"
                    : "text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10"
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          onClick={handleStartInterview}
          className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:opacity-90 transition-all duration-200"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>

          Start Interview
        </button>
      </div>
    </div>
  );
}
