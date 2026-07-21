import { useEffect, useState } from "react";

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

  const getScoreColor = () => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  return (
    <div className="flex flex-col items-center mb-2">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <circle
          cx="90" cy="90" r={radius}
          fill="none" stroke={getScoreColor()}
          strokeWidth="10" strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
        />
        <text x="90" y="85" textAnchor="middle" fill="white" fontSize="28" fontWeight="700" fontFamily="sans-serif">
          {score}%
        </text>
        <text x="90" y="105" textAnchor="middle" fill="#6b7280" fontSize="11" fontWeight="600" letterSpacing="2" fontFamily="sans-serif">
          OVERALL
        </text>
      </svg>
    </div>
  );
}

function SkillBar({ name, score }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => setWidth(score), 400);
    return () => clearTimeout(timer);
  }, [score]);

  const getBarColor = () => {
    if (score >= 80) return "from-green-500 to-emerald-400";
    if (score >= 60) return "from-yellow-500 to-amber-400";
    return "from-red-500 to-rose-400";
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-gray-300">{name}</span>
        <span className="text-sm font-semibold text-white">{score}</span>
      </div>
      <div className="h-2 rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${getBarColor()} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

function CardList({ items, variant }) {
  const colorMap = {
    green: {
      border: "border-green-500/30",
      bg: "bg-green-500/8",
      text: "text-green-300",
      icon: "text-green-400",
      svg: (
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    red: {
      border: "border-red-500/30",
      bg: "bg-red-500/8",
      text: "text-red-300",
      icon: "text-red-400",
      svg: (
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    blue: {
      border: "border-blue-500/30",
      bg: "bg-blue-500/8",
      text: "text-blue-300",
      icon: "text-blue-400",
      svg: (
        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
  };

  const c = colorMap[variant] || colorMap.blue;

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className={`flex items-start gap-2.5 rounded-xl border ${c.border} ${c.bg} p-3`}>
          <span className={c.icon}>{c.svg}</span>
          <p className={`text-sm leading-relaxed ${c.text}`}>{item}</p>
        </div>
      ))}
    </div>
  );
}

export default function InterviewReport({ report, elapsed, onRetake, fullWidth }) {
  if (!report) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-5 shadow-xl h-full">
        <p className="text-xs font-semibold tracking-widest text-gray-400 mb-4">LAST INTERVIEW REPORT</p>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 text-sm">Complete an interview to see your report</p>
        </div>
      </div>
    );
  }

  const skills = [
    { name: "Communication", score: report.communication },
    { name: "Technical Knowledge", score: report.technicalKnowledge },
    { name: "Confidence", score: report.confidence },
    { name: "Problem Solving", score: report.problemSolving },
  ];

  const decisionColor = () => {
    const d = report.hiringDecision;
    if (d === "Strongly Recommended" || d === "Recommended") return "text-green-400 border-green-500/50 bg-green-500/10";
    if (d === "Consider") return "text-yellow-400 border-yellow-500/50 bg-yellow-500/10";
    return "text-red-400 border-red-500/50 bg-red-500/10";
  };

  return (
    <div className={fullWidth ? "" : "rounded-2xl border border-white/10 bg-[#0d0f1a]/80 backdrop-blur-sm p-5 shadow-xl h-full"}>
      {!fullWidth && <p className="text-xs font-semibold tracking-widest text-gray-400 mb-4">LAST INTERVIEW REPORT</p>}

      <div className="space-y-6">
        {/* Score ring */}
        <ScoreRing score={report.overallScore} />

        {/* Skill bars */}
        <div>
          <p className="text-xs font-semibold tracking-widest text-gray-400 mb-3">SKILL BREAKDOWN</p>
          {skills.map((skill) => (
            <SkillBar key={skill.name} name={skill.name} score={skill.score} />
          ))}
        </div>

        {/* Strengths */}
        {report.strengths?.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-green-400 mb-3">STRENGTHS</p>
            <CardList items={report.strengths} variant="green" />
          </div>
        )}

        {/* Weaknesses */}
        {report.weaknesses?.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-red-400 mb-3">AREAS FOR IMPROVEMENT</p>
            <CardList items={report.weaknesses} variant="red" />
          </div>
        )}

        {/* Recommendations */}
        {report.recommendations?.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-widest text-blue-400 mb-3">RECOMMENDATIONS</p>
            <CardList items={report.recommendations} variant="blue" />
          </div>
        )}

        {/* Summary */}
        {report.summary && (
          <div className="rounded-xl border border-white/10 bg-[#0a0c18]/80 p-4">
            <p className="text-xs font-semibold tracking-widest text-gray-400 mb-2">SUMMARY</p>
            <p className="text-sm text-gray-300 leading-relaxed">{report.summary}</p>
          </div>
        )}

        {/* Hiring decision */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-gray-400 mb-1">HIRING DECISION</p>
            <span className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-semibold ${decisionColor()}`}>
              {report.hiringDecision}
            </span>
          </div>
          {report.difficultyLevel && (
            <span className="text-xs text-gray-500">
              Difficulty: <span className="text-gray-300 font-semibold">{report.difficultyLevel}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
