import { useState } from "react";
import { useNavigate } from "react-router-dom";

const TYPES = ["Technical", "HR", "Mixed"];
const DIFFICULTIES = ["Easy", "Medium", "Hard"];

export default function InterviewSetup({ onStart, pageState, onRetake }) {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState("Technical");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");

  const handleStartInterview = () => {
    onStart({
      type: selectedType,
      difficulty: selectedDifficulty,
    });
  };

  if (pageState === "completed") {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm p-6 shadow-xl">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onRetake}
            className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:opacity-90 transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Retake Interview
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-[var(--border-light)] bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm p-6 shadow-xl">
      <div className="flex flex-wrap gap-10">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[var(--text-tertiary)] mb-3">
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
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] border border-[var(--border)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold tracking-widest text-[var(--text-tertiary)] mb-3">
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
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-hover)] hover:bg-[var(--bg-elevated)] border border-[var(--border)]"
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
