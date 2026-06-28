/**
 * copilotService.js
 * Core business logic for Career Copilot — keyword-based AI response engine,
 * 30-day plan generation, readiness calculation, and dashboard response shaping.
 *
 * NOTE: The "AI engine" below is a deterministic keyword-matcher, NOT a real
 * LLM call. Swap `generateAIResponse()` for an actual API call (OpenAI,
 * Anthropic, etc.) when ready — its signature (doc, userMessage) => string
 * is designed to be a drop-in replacement point.
 */

const CareerCopilot = require("../models/CareerCopilot");

// ─────────────────────────────────────────────────────────────────────────────
// Default seed data for a brand-new copilot profile
// ─────────────────────────────────────────────────────────────────────────────
const DEFAULT_FOCUS_AREAS = [
  { name: "DSA",            progress: 70 },
  { name: "Projects",       progress: 88 },
  { name: "Resume",         progress: 84 },
  { name: "Communication",  progress: 60 },
  { name: "System Design",  progress: 45 },
];

const DEFAULT_WEEKLY_GOALS = [
  { title: "Solve 20 DSA Problems",     completed: true },
  { title: "Improve Resume Score",       completed: true },
  { title: "Complete 1 Mock Interview",  completed: true },
  { title: "Push 5 GitHub Commits",      completed: false },
];

const DEFAULT_INSIGHTS = [
  "Your DSA score improved 8% this month.",
  "Your weakest area remains Communication.",
  "Resume score increased after last scan.",
];

const DEFAULT_READINESS = {
  overallScore:    72,
  companyTarget:   "Amazon",
  estimatedMonths: 4,
};

// ─────────────────────────────────────────────────────────────────────────────
// 30-day plan templates per company (extendable)
// ─────────────────────────────────────────────────────────────────────────────
const PLAN_TEMPLATES = {
  Amazon: [
    { week: 1, title: "Complete Arrays + Strings",         description: "Master two-pointer, sliding window, and prefix-sum patterns." },
    { week: 2, title: "Finish Hashing + Sliding Window",    description: "Drill hashmap-based problems and frequency-counting patterns." },
    { week: 3, title: "Dynamic Programming",                description: "Cover 1D/2D DP, knapsack variants, and memoization vs tabulation." },
    { week: 4, title: "Mock Interviews + Revision",         description: "Run 3-4 mock interviews and revise weak topics flagged by AI Insights." },
  ],
  Google: [
    { week: 1, title: "Graphs + Trees Deep Dive",           description: "BFS/DFS, topological sort, and balanced tree operations." },
    { week: 2, title: "System Design Fundamentals",         description: "Load balancing, caching, sharding, and CAP theorem." },
    { week: 3, title: "Advanced DP + Greedy",                description: "Interval DP, bitmask DP, and greedy proof techniques." },
    { week: 4, title: "Mock Interviews + Behavioral Prep",  description: "Googleyness behavioral prep plus 4 technical mock rounds." },
  ],
  Default: [
    { week: 1, title: "Strengthen Core Data Structures",    description: "Arrays, strings, linked lists, and stacks/queues." },
    { week: 2, title: "Hashing + Searching",                 description: "Hashmaps, binary search, and two-pointer techniques." },
    { week: 3, title: "Dynamic Programming + Graphs",        description: "Core DP patterns and graph traversal algorithms." },
    { week: 4, title: "Mock Interviews + Resume Polish",     description: "Run mock interviews and tighten resume bullet points." },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Get or create a user's copilot profile
// ─────────────────────────────────────────────────────────────────────────────
const getOrCreateProfile = async (userId) => {
  let doc = await CareerCopilot.findOne({ userId });
  if (!doc) {
    doc = await CareerCopilot.create({
      userId,
      readiness:   DEFAULT_READINESS,
      focusAreas:  DEFAULT_FOCUS_AREAS,
      weeklyGoals: DEFAULT_WEEKLY_GOALS,
      insights:    DEFAULT_INSIGHTS,
      actionPlan:  buildPlanFromTemplate(DEFAULT_READINESS.companyTarget),
      chatHistory: [],
    });
  }
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Build a 30-day plan from template, marking week statuses
// ─────────────────────────────────────────────────────────────────────────────
function buildPlanFromTemplate(company, currentWeek = 3) {
  const template = PLAN_TEMPLATES[company] || PLAN_TEMPLATES.Default;

  return template.map((item) => ({
    ...item,
    status: item.week < currentWeek ? "done" : item.week === currentWeek ? "current" : "upcoming",
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Keyword-based AI response engine
// ─────────────────────────────────────────────────────────────────────────────
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

const generateAIResponse = (doc, userMessage) => {
  const text = userMessage.toLowerCase();

  const strongest = [...doc.focusAreas].sort((a, b) => b.progress - a.progress)[0];
  const weakest    = [...doc.focusAreas].sort((a, b) => a.progress - b.progress)[0];
  const company     = doc.readiness.companyTarget || "your target company";
  const score        = doc.readiness.overallScore || 0;

  // Pattern: "crack <company>" or "<company> in X months"
  const crackMatch = text.match(/crack\s+(\w+)/i) || text.match(/(\w+)\s+(?:bar|interview)/i);
  if (crackMatch && /crack|months?|weeks?/.test(text)) {
    const targetCompany = capitalize(crackMatch[1]);
    const chips = doc.focusAreas
      .filter((f) => f.progress < 75)
      .map((f) => f.name)
      .join(", ") || "Projects, Communication";
    return `Based on your profile, your ${targetCompany} readiness is ${score}%. Realistic in ${doc.readiness.estimatedMonths} months if you focus on the right things — prioritize ${chips}.`;
  }

  // Pattern: "next week" / "what should i learn"
  if (/next week|what should i (learn|focus|do)/.test(text)) {
    return `Spend next week strengthening ${weakest.name} and running 1-2 Mock Interviews — that's currently your highest-leverage move.`;
  }

  // Pattern: "review my profile" / "review my resume" / "how am i doing"
  if (/review my profile|how am i doing|my progress/.test(text)) {
    return `Your strongest area is ${strongest.name} (${strongest.progress}%). Your weakest area is ${weakest.name} (${weakest.progress}%). Keep compounding on ${strongest.name} while closing the ${weakest.name} gap.`;
  }

  // Pattern: "mock interview"
  if (/mock interview/.test(text)) {
    return `Your last mock interview trends show steady improvement. Aim for 2 mock interviews this week — focus on structuring answers with the STAR method to lift your Communication score.`;
  }

  // Pattern: "compare" / "bar" / "vs"
  if (/compare|vs\.?\s|bar\b/.test(text)) {
    return `Compared to a typical ${company} bar, you're tracking close on DSA and Projects but trailing on System Design and Communication. Closing that gap is the fastest path to a stronger readiness score.`;
  }

  // Pattern: "30-day plan" / "prep plan" / "plan"
  if (/30.?day|prep plan|study plan|\bplan\b/.test(text)) {
    return `Here's a focused plan: Week 1-2 lock in core DSA patterns, Week 3 go deep on ${weakest.name}, Week 4 run mock interviews and revise. I've generated the full breakdown below.`;
  }

  // Pattern: "github" / "commits"
  if (/github|commit/.test(text)) {
    return `Your GitHub activity has been steady. Pushing small, frequent commits with clear messages helps signal consistency to recruiters — aim for 5+ commits this week.`;
  }

  // Fallback — generic but still personalized
  return `Based on your current profile, your overall placement readiness is ${score}%. Your strongest area is ${strongest.name} and your biggest opportunity is ${weakest.name}. Ask me about a specific company, your weekly plan, or your last mock interview for more detail.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Recalculate readiness (lightweight heuristic from focus areas)
// ─────────────────────────────────────────────────────────────────────────────
const recalculateReadiness = (doc) => {
  if (!doc.focusAreas.length) return doc;
  const avg = doc.focusAreas.reduce((sum, f) => sum + f.progress, 0) / doc.focusAreas.length;
  doc.readiness.overallScore = Math.round(avg);
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Strong/weak area split (used by /readiness endpoint)
// ─────────────────────────────────────────────────────────────────────────────
const splitStrongWeakAreas = (doc) => {
  const sorted = [...doc.focusAreas].sort((a, b) => b.progress - a.progress);
  const strongAreas = sorted.filter((f) => f.progress >= 75).map((f) => f.name);
  const weakAreas    = sorted.filter((f) => f.progress < 65).map((f) => f.name);

  return {
    strongAreas: strongAreas.length ? strongAreas : [sorted[0]?.name].filter(Boolean),
    weakAreas:    weakAreas.length ? weakAreas : [sorted[sorted.length - 1]?.name].filter(Boolean),
  };
};

const generateReadinessRecommendation = (doc) => {
  const { weakAreas } = splitStrongWeakAreas(doc);
  const target = doc.readiness.companyTarget || "your target company";
  if (!weakAreas.length) return `You're well-rounded for ${target}. Keep up consistent practice.`;
  return `Focus on ${weakAreas.join(" and ")} to materially improve your ${target} readiness over the next few weeks.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Master pipeline: handle an incoming chat message
// ─────────────────────────────────────────────────────────────────────────────
const handleChatMessage = async (userId, userMessage) => {
  const doc = await getOrCreateProfile(userId);

  doc.chatHistory.push({ role: "user", message: userMessage, timestamp: new Date() });

  const aiText = generateAIResponse(doc, userMessage);
  doc.chatHistory.push({ role: "assistant", message: aiText, timestamp: new Date() });

  await doc.save();
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. Master pipeline: generate + persist a 30-day plan for a company
// ─────────────────────────────────────────────────────────────────────────────
const generatePlan = async (userId, company) => {
  const doc = await getOrCreateProfile(userId);

  doc.readiness.companyTarget = company;
  doc.actionPlan = buildPlanFromTemplate(company);

  await doc.save();
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Update a single weekly goal's completed state
// ─────────────────────────────────────────────────────────────────────────────
const updateWeeklyGoal = async (userId, goalId, completed) => {
  const doc = await getOrCreateProfile(userId);

  const goal = doc.weeklyGoals.id(goalId);
  if (!goal) return null;

  goal.completed = completed;
  await doc.save();
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Dashboard response shaper — matches frontend copilotDummyData shape
// ─────────────────────────────────────────────────────────────────────────────
const CHIP_COLOR_CYCLE = ["amber", "cyan", "pink", "violet"];

const pickChipColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 1000;
  return CHIP_COLOR_CYCLE[hash % CHIP_COLOR_CYCLE.length];
};

const pickHexColor = (progress) => {
  if (progress >= 85) return "#22c55e";
  if (progress >= 70) return "#06B6D4";
  if (progress >= 50) return "#eab308";
  return "#ef4444";
};

const buildDashboardResponse = (doc) => {
  return {
    readiness: {
      score:         doc.readiness.overallScore,
      company:       doc.readiness.companyTarget,
      estimatedTime: `${doc.readiness.estimatedMonths} months`,
      focusAreas:    doc.focusAreas.slice(0, 4).map((f) => ({ label: f.name, color: pickChipColor(f.name) })),
    },
    focusAreas: doc.focusAreas.map((f) => ({
      id:       f.name.toLowerCase().replace(/\s+/g, "-"),
      label:    f.name,
      progress: f.progress,
      color:    pickHexColor(f.progress),
    })),
    weeklyGoals: doc.weeklyGoals.map((g) => ({
      id:    g._id,
      label: g.title,
      done:  g.completed,
    })),
    insights: doc.insights.map((text, i) => ({
      id:   i + 1,
      type: /weak|gap|below|lower/i.test(text) ? "warning" : "positive",
      text,
    })),
    actionPlan: doc.actionPlan.map((p) => ({
      week:   `Week ${p.week}`,
      title:  p.title,
      status: p.status,
    })),
    updatedAt: doc.updatedAt,
  };
};

module.exports = {
  getOrCreateProfile,
  buildPlanFromTemplate,
  generateAIResponse,
  recalculateReadiness,
  splitStrongWeakAreas,
  generateReadinessRecommendation,
  handleChatMessage,
  generatePlan,
  updateWeeklyGoal,
  buildDashboardResponse,
  PLAN_TEMPLATES,
};
