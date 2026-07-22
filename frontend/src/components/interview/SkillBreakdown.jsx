import { useEffect, useState } from "react";

function SkillBar({ name, score, color, animate }) {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setWidth(score), 300);
      return () => clearTimeout(timer);
    } else {
      setWidth(score);
    }
  }, [score, animate]);

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-sm text-[var(--text-secondary)]">{name}</span>
        <span className="text-sm font-semibold text-[var(--text-primary)]">{score}</span>
      </div>
      <div className="h-1.5 rounded-full bg-[var(--bg-elevated)] overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000 ease-out`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export default function SkillBreakdown({ skills, animate = true }) {
  return (
    <div className="mt-5">
      {skills.map((skill) => (
        <SkillBar
          key={skill.name}
          name={skill.name}
          score={skill.score}
          color={skill.color}
          animate={animate}
        />
      ))}
    </div>
  );
}
