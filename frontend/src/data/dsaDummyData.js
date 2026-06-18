// data/dsaDummyData.js

export const DSA_STATS = {
  problemsSolved: 320,
  weeklyGain: 12,
  currentStreak: 28,
  personalBest: 28,
  dailyAvg: 3.4,
  dailyTarget: 4,
  contestRating: 1650,
  maxRating: 1820,
};

export const TOPICS = [
  { id: "arrays",        label: "Arrays",           solved: 72, total: 80,  color: "#22c55e" },
  { id: "strings",       label: "Strings",          solved: 51, total: 60,  color: "#22c55e" },
  { id: "hashing",       label: "Hashing",          solved: 39, total: 50,  color: "#06B6D4" },
  { id: "trees",         label: "Trees",            solved: 36, total: 60,  color: "#06B6D4" },
  { id: "graphs",        label: "Graphs",           solved: 20, total: 50,  color: "#eab308" },
  { id: "dp",            label: "Dynamic Programming", solved: 12, total: 48, color: "#eab308" },
  { id: "greedy",        label: "Greedy",           solved: 28, total: 40,  color: "#22c55e" },
  { id: "binary-search", label: "Binary Search",    solved: 22, total: 30,  color: "#06B6D4" },
  { id: "linked-list",   label: "Linked List",      solved: 18, total: 30,  color: "#a78bfa" },
  { id: "stack-queue",   label: "Stack & Queue",    solved: 16, total: 25,  color: "#a78bfa" },
  { id: "heap",          label: "Heap",             solved: 10, total: 20,  color: "#f97316" },
  { id: "recursion",     label: "Recursion",        solved: 14, total: 25,  color: "#a78bfa" },
  { id: "backtracking",  label: "Backtracking",     solved:  8, total: 20,  color: "#ef4444" },
];

// 90-day activity heatmap: 0=none, 1=light, 2=medium, 3=strong, 4=intense
export const HEATMAP_DATA = (() => {
  const seed = [0,0,1,2,1,0,0,3,2,1,0,1,2,3,4,2,1,0,0,2,3,2,1,1,0,0,
                1,2,3,4,3,2,1,0,0,1,2,1,0,0,2,3,2,1,2,3,4,3,2,1,0,0,
                1,2,3,2,1,0,0,1,2,3,4,3,2,1,0,0,2,1,0,1,2,3,2,1,0,0,
                2,3,4,3,2,1,0,0,1,2,3,2,1];
  return seed.map((intensity, i) => ({
    date: new Date(Date.now() - (89 - i) * 86400000).toISOString().slice(0, 10),
    intensity,
    count: [0,1,3,6,10][intensity],
  }));
})();

export const AI_INSIGHTS = {
  weakest: "Dynamic Programming",
  strongest: "Arrays",
  recommendation: "Solve 5 medium DP problems this week to lift your DSA score by ~6 pts.",
  streakNote: "Streak protects until 11:59 PM",
};

export const SUGGESTED_PROBLEMS = [
  { id: 1, name: "Coin Change",                  difficulty: "Medium", topic: "DP",     platform: "LeetCode" },
  { id: 2, name: "House Robber II",               difficulty: "Medium", topic: "DP",     platform: "LeetCode" },
  { id: 3, name: "Longest Increasing Subseq.",    difficulty: "Medium", topic: "DP",     platform: "LeetCode" },
  { id: 4, name: "Edit Distance",                 difficulty: "Hard",   topic: "DP",     platform: "LeetCode" },
  { id: 5, name: "Partition Equal Subset Sum",    difficulty: "Medium", topic: "DP",     platform: "LeetCode" },
  { id: 6, name: "Number of Islands",             difficulty: "Medium", topic: "Graphs", platform: "LeetCode" },
  { id: 7, name: "Course Schedule II",            difficulty: "Medium", topic: "Graphs", platform: "LeetCode" },
];

export const STRUGGLE_ANALYSIS = {
  mostFailed: "Dynamic Programming",
  avgAttempts: 3.2,
  weakPatterns: ["Memoisation vs Tabulation", "State transition design", "Bitmask DP"],
  mostRetried: [
    { name: "Regular Expression Matching", attempts: 6 },
    { name: "Burst Balloons",              attempts: 5 },
    { name: "Word Break II",               attempts: 4 },
  ],
};

export const CONTEST_PERFORMANCE = {
  participated: 18,
  bestRank: 142,
  currentRating: 1650,
  highestRating: 1820,
  recent: [
    { name: "Weekly 398", rank: 512,  delta: +34,  date: "Jun 9" },
    { name: "Biweekly 132",rank: 280, delta: +56,  date: "Jun 1" },
    { name: "Weekly 396", rank: 820,  delta: -22,  date: "May 26" },
    { name: "Weekly 394", rank: 142,  delta: +88,  date: "May 19" },
  ],
};

export const LEETCODE = {
  username: "sneha_g26",
  easy:     { solved: 120, total: 800 },
  medium:   { solved: 165, total: 1700 },
  hard:     { solved:  35, total:  700 },
  acceptanceRate: 68.4,
  ranking: 42310,
};

export const WEEKLY_GOALS = [
  { id: 1, label: "Solve 20 Problems",          done: true  },
  { id: 2, label: "Complete 5 DP Questions",    done: false },
  { id: 3, label: "Participate in Contest",     done: false },
  { id: 4, label: "Revise Graphs",              done: true  },
  { id: 5, label: "Attempt 2 Hard Problems",    done: false },
];

export const DSA_READINESS = {
  score: 78,
  strengths: ["Arrays", "Strings", "Greedy", "Binary Search"],
  gaps:      ["Dynamic Programming", "Backtracking", "Graphs", "Heap"],
};
