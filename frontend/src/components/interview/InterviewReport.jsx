import { useEffect, useState } from "react";
import SkillBreakdown from "./SkillBreakdown";
import AIFeedback from "./AIFeedback";

function ScoreRing({ score }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const [offset, setOffset] = useState(circumference);

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference - (score / 100) * circumference);
    }, 200);
    return () => clearTimeout(timer);
  }, [score, circumference]);

  return (
    <div className="flex flex-col items-center mb-2">
      <svg width="180" height="180" viewBox="0 0 180 180">
        {/* Background ring */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="10"
        />
        {/* Gradient definition */}
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
        {/* Score arc */}
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        {/* Score text */}
        <text
          x="90"
          y="85"
          textAnchor="middle"
          fill="white"
          fontSize="28"
          fontWeight="700"
          fontFamily="sans-serif"
        >
          {score}%
        </text>
        <text
          x="90"
          y="105"
          textAnchor="middle"
          fill="#6b7280"
          fontSize="11"
          fontWeight="600"
          letterSpacing="2"
          fontFamily="sans-serif"
        >
          OVERALL
        </text>
      </svg>
    </div>
  );
}

export default function InterviewReport({ report }) {
  const hasData = !!report;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-5 shadow-xl h-full">
      <p className="text-xs font-semibold tracking-widest text-gray-400 mb-4">
        LAST INTERVIEW REPORT
      </p>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">Complete an interview to see your report</p>
        </div>
      ) : (
        <>
          <ScoreRing score={report.overallScore} />
          <SkillBreakdown skills={report.skills} />
          <AIFeedback feedback={report.feedback} decision={report.decision} />
        </>
      )}
    </div>
  );
}
