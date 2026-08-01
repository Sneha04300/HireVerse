import { useMemo } from "react";

const COMPANY_TOPICS = {
  Amazon: ["Arrays", "Strings", "Trees", "Graphs", "DP", "Greedy"],
  Google: ["Arrays", "Strings", "Hashing", "Trees", "Graphs", "DP", "Binary Search"],
  Microsoft: ["Arrays", "Linked List", "Trees", "DP", "Greedy"],
  Adobe: ["Arrays", "Strings", "Trees", "DP", "Heap"],
  Flipkart: ["Arrays", "Hashing", "DP", "Greedy"],
  Atlassian: ["Arrays", "Strings", "Trees", "Graphs", "DP"],
};

const COMPANY_COLORS = {
  Amazon: "#ff9900",
  Google: "#4285f4",
  Microsoft: "#00a4ef",
  Adobe: "#eb0000",
  Flipkart: "#2874f0",
  Atlassian: "#0052cc",
};

export default function CompanyReadiness({ data }) {
  const scores = useMemo(() => {
    if (!data) return [];

    const topicProgress = data.topicProgress || [];
    const topicMap = {};
    for (const t of topicProgress) {
      topicMap[t.topic] = t.percentage;
    }

    const easy = data.difficulty?.easy || 0;
    const medium = data.difficulty?.medium || 0;
    const hard = data.difficulty?.hard || 0;
    const total = easy + medium + hard || 1;
    const diffScore = (medium * 2 + hard * 3) / total; // 0–3 range

    const contestRating = data.overview?.contestRating || 1500;
    const ratingFactor = Math.min(1, contestRating / 3000);

    const readinessScore = data.readiness?.score || 0;

    return Object.entries(COMPANY_TOPICS).map(([company, topics]) => {
      let topicSum = 0;
      let topicCount = 0;
      for (const t of topics) {
        if (topicMap[t] !== undefined) {
          topicSum += topicMap[t];
          topicCount++;
        }
      }
      const topicAvg = topicCount > 0 ? topicSum / topicCount : 0;

      // Weighted score: topic mastery (55%), difficulty (20%), contest (10%), readiness (15%)
      const score = Math.min(100, Math.round(
        topicAvg * 0.55 +
        Math.min(100, diffScore * 33) * 0.20 +
        ratingFactor * 100 * 0.10 +
        readinessScore * 0.15
      ));

      return { company, score, color: COMPANY_COLORS[company] };
    });
  }, [data]);

  if (!data) return null;

  return (
    <div className="dsa-card p-4 flex flex-col gap-3">
      <p className="section-label text-[var(--text-muted)]">Company Readiness</p>
      <div className="flex flex-col gap-2">
        {scores.map((c) => (
          <div key={c.company} className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[13px] font-medium text-[var(--text-primary)]">{c.company}</span>
              <span className="text-xs font-bold" style={{ color: c.color }}>{c.score}%</span>
            </div>
            <div className="h-1 rounded-full" style={{ background: "var(--border)" }}>
              <div
                className="h-1 rounded-full transition-all duration-700"
                style={{ width: `${c.score}%`, background: c.color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
