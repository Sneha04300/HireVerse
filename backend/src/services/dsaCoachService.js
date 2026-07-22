const DSAInsight = require("../models/DSAInsight");
const DSAProgress = require("../models/DSAProgress");
const { calculateDashboard } = require("./dsaAnalyticsService");
const { generateResponse } = require("./groqService");

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

function buildContext(dashboard, recentProblems) {
  const topicBreakdown = dashboard.topicProgress
    .map((t) => `${t.topic}: ${t.solved}/${t.total} solved (${t.percentage}%)`)
    .join("\n");

  const recentTitles = recentProblems
    .slice(0, 10)
    .map((p) => `[${p.difficulty}] ${p.title} (${p.topic.join(", ")})`)
    .join("\n");

  return {
    totalSolved: dashboard.overview.totalSolved,
    currentStreak: dashboard.overview.currentStreak,
    dailyAverage: dashboard.overview.dailyAverage,
    contestRating: dashboard.overview.contestRating,
    readinessScore: dashboard.readiness.score,
    strongestTopics: dashboard.readiness.strongestTopics.join(", "),
    weakestTopics: dashboard.readiness.weakestTopics.join(", "),
    easyCount: dashboard.difficulty.easy,
    mediumCount: dashboard.difficulty.medium,
    hardCount: dashboard.difficulty.hard,
    totalBookmarks: dashboard.revision.totalBookmarks,
    totalRevisions: dashboard.revision.totalRevisions,
    solvedThisWeek: dashboard.weeklyProgress.solvedThisWeek,
    solvedLastWeek: dashboard.weeklyProgress.solvedLastWeek,
    improvementPercentage: dashboard.weeklyProgress.improvementPercentage,
    solvedThisMonth: dashboard.monthlyProgress.solvedThisMonth,
    solvedLastMonth: dashboard.monthlyProgress.solvedLastMonth,
    topicBreakdown,
    recentTitles: recentTitles || "No problems logged yet.",
  };
}

function buildBeginnerRoadmap() {
  return {
    summary: "You haven't tracked any DSA problems yet. Every expert was once a beginner — start small, stay consistent, and build momentum one problem at a time.",
    strengths: ["You're taking the first step — that's the most important one"],
    weaknesses: ["No structured practice yet", "No topic familiarity established"],
    recommendations: [
      {
        title: "Solve your first problem today",
        reason: "Building momentum is more important than picking the perfect problem.",
        impact: "Getting the first solve builds confidence and starts your streak.",
        priority: "High",
      },
      {
        title: "Pick one topic and stick with it for a week",
        reason: "Focused practice on Arrays or Strings builds foundational patterns faster than jumping between topics.",
        impact: "Topic familiarity grows quickly with 5–7 problems in one area.",
        priority: "High",
      },
      {
        title: "Set a daily goal of 1–2 problems",
        reason: "Small daily habits compound. Consistency beats intensity.",
        impact: "After 30 days you will have solved 30–60 problems.",
        priority: "Medium",
      },
    ],
    weeklyPlan: [
      { day: "Monday", task: "Solve 2 easy Array problems" },
      { day: "Tuesday", task: "Solve 2 easy String problems" },
      { day: "Wednesday", task: "Revise Monday + Tuesday problems" },
      { day: "Thursday", task: "Solve 1 medium Array problem" },
      { day: "Friday", task: "Solve 1 medium String problem" },
      { day: "Saturday", task: "Attempt 1 problem from a new topic" },
      { day: "Sunday", task: "Rest or revise any weak area" },
    ],
    estimatedReadinessIncrease: "30–40% after 30 days of consistent practice",
    interviewPrediction: "With 60+ problems across 4+ topics, you will be ready for entry-level coding interviews.",
    motivationalTip: "The best time to start was yesterday. The next best time is right now. One problem today changes everything.",
  };
}

const generateDSAInsights = async (userId) => {
  const existing = await DSAInsight.findOne({ userId });
  if (existing && Date.now() - existing.generatedAt.getTime() < CACHE_TTL_MS) {
    return existing;
  }

  const dashboard = await calculateDashboard(userId);

  if (dashboard.overview.totalSolved === 0) {
    const beginner = buildBeginnerRoadmap();
    const doc = await DSAInsight.findOneAndUpdate(
      { userId },
      { ...beginner, userId, generatedAt: new Date() },
      { upsert: true, new: true }
    );
    return doc;
  }

  const recentProblems = await DSAProgress.find({ userId, status: "Solved" })
    .sort({ solvedAt: -1 })
    .limit(10)
    .lean();

  const ctx = buildContext(dashboard, recentProblems);

  const system = `You are a senior DSA coach and coding interview mentor.

Your job is to analyze the user's DSA practice data and generate personalised coaching insights.

CRITICAL RULES:
- NEVER hallucinate data. Only use the exact analytics provided in the context.
- If the data shows a low number of solved problems, acknowledge it honestly.
- Be encouraging but factual.
- Return ONLY valid JSON. No markdown, no code fences, no explanations.
- Do NOT fabricate problem titles, topics, or metrics.
- If a metric is zero, say so — do not invent positive values.`;

  const user = `Return ONLY valid JSON. No markdown, no code fences.

Analyse this DSA practice data and generate coaching insights:

TOTAL SOLVED: ${ctx.totalSolved}
CURRENT STREAK: ${ctx.currentStreak} days
DAILY AVERAGE: ${ctx.dailyAverage}
CONTEST RATING: ${ctx.contestRating}
READINESS SCORE: ${ctx.readinessScore}%
STRONGEST TOPICS: ${ctx.strongestTopics}
WEAKEST TOPICS: ${ctx.weakestTopics}
EASY / MEDIUM / HARD: ${ctx.easyCount} / ${ctx.mediumCount} / ${ctx.hardCount}
BOOKMARKS: ${ctx.totalBookmarks}
TOTAL REVISIONS: ${ctx.totalRevisions}
SOLVED THIS WEEK: ${ctx.solvedThisWeek}
SOLVED LAST WEEK: ${ctx.solvedLastWeek}
IMPROVEMENT: ${ctx.improvementPercentage}%
SOLVED THIS MONTH: ${ctx.solvedThisMonth}
SOLVED LAST MONTH: ${ctx.solvedLastMonth}

TOPIC BREAKDOWN:
${ctx.topicBreakdown}

RECENT PROBLEMS:
${ctx.recentTitles}

Return EXACTLY this JSON structure:
{
  "summary": "2-3 sentence personalised assessment of current progress and readiness.",
  "strengths": ["3-4 specific strengths based on actual data"],
  "weaknesses": ["2-3 specific areas for improvement based on actual data"],
  "recommendations": [
    {
      "title": "Action title",
      "reason": "Why this matters for the user specifically",
      "impact": "Expected outcome",
      "priority": "High|Medium|Low"
    }
  ],
  "weeklyPlan": [
    { "day": "Monday", "task": "Specific actionable task" },
    { "day": "Tuesday", "task": "Specific actionable task" },
    { "day": "Wednesday", "task": "Specific actionable task" },
    { "day": "Thursday", "task": "Specific actionable task" },
    { "day": "Friday", "task": "Specific actionable task" },
    { "day": "Saturday", "task": "Specific actionable task" },
    { "day": "Sunday", "task": "Specific actionable task" }
  ],
  "estimatedReadinessIncrease": "Realistic estimate based on current trajectory",
  "interviewPrediction": "Honest assessment of interview readiness",
  "motivationalTip": "One sentence motivational message"
}`;

  const llmResponse = await generateResponse(system, user, {
    maxTokens: 2000,
    temperature: 0.3,
  });

  const jsonMatch = llmResponse.trim().match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Groq did not return valid JSON for DSA coach.");

  const parsed = JSON.parse(jsonMatch[0]);

  const saved = await DSAInsight.findOneAndUpdate(
    { userId },
    {
      userId,
      summary: typeof parsed.summary === "string" ? parsed.summary : "",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      weeklyPlan: Array.isArray(parsed.weeklyPlan) ? parsed.weeklyPlan : [],
      estimatedReadinessIncrease: typeof parsed.estimatedReadinessIncrease === "string" ? parsed.estimatedReadinessIncrease : "",
      interviewPrediction: typeof parsed.interviewPrediction === "string" ? parsed.interviewPrediction : "",
      motivationalTip: typeof parsed.motivationalTip === "string" ? parsed.motivationalTip : "",
      generatedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return saved;
};

module.exports = { generateDSAInsights };
