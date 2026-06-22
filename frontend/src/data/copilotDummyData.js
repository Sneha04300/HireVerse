// data/copilotDummyData.js

export const CHAT_HISTORY = [
  {
    id: 1,
    role: "user",
    text: "Can I crack Amazon in 4 months?",
  },
  {
    id: 2,
    role: "ai",
    text: "Based on your profile, your Amazon readiness is 72%. Realistic in 4 months if you focus on the right things — here's a quick plan.",
  },
  {
    id: 3,
    role: "ai-card",
    cardType: "readiness",
  },
  {
    id: 4,
    role: "ai-card",
    cardType: "plan",
  },
];

export const AMAZON_READINESS = {
  company: "Amazon",
  score: 72,
  estimatedTime: "4 months",
  focusAreas: [
    { label: "Dynamic Programming", color: "amber" },
    { label: "System Design",       color: "cyan" },
    { label: "Communication",       color: "pink" },
    { label: "Projects",            color: "violet" },
  ],
};

export const THIRTY_DAY_PLAN = [
  {
    week: "Week 1",
    title: "Complete Arrays + Strings",
    status: "done",
  },
  {
    week: "Week 2",
    title: "Finish Hashing + Sliding Window",
    status: "done",
  },
  {
    week: "Week 3",
    title: "Dynamic Programming",
    status: "current",
  },
  {
    week: "Week 4",
    title: "Mock Interviews + Revision",
    status: "upcoming",
  },
];

export const SUGGESTED_PROMPTS = [
  "Build me a 30-day Amazon prep plan",
  "Review my last mock interview",
  "Compare my profile vs Google bar",
  "What should I learn next week?",
];

export const PLACEMENT_READINESS = {
  score: 78,
  label: "Current Readiness",
};

export const FOCUS_AREAS = [
  { id: "dsa",     label: "DSA",           progress: 70, color: "#06B6D4" },
  { id: "proj",    label: "Projects",      progress: 88, color: "#22c55e" },
  { id: "resume",  label: "Resume",        progress: 84, color: "#22c55e" },
  { id: "comms",   label: "Communication", progress: 60, color: "#eab308" },
  { id: "sysd",    label: "System Design", progress: 45, color: "#ef4444" },
];

export const WEEKLY_CHECKLIST = [
  { id: 1, label: "Solve 20 DSA Problems",      done: true  },
  { id: 2, label: "Improve Resume Score",        done: true  },
  { id: 3, label: "Complete 1 Mock Interview",   done: true  },
  { id: 4, label: "Push 5 GitHub Commits",       done: false },
];

export const AI_INSIGHTS = [
  {
    id: 1,
    type: "positive",
    text: "Your DSA score improved 8% this month.",
  },
  {
    id: 2,
    type: "warning",
    text: "Your weakest area remains Communication.",
  },
  {
    id: 3,
    type: "positive",
    text: "Resume score increased after last scan.",
  },
];
