/**
 * dsaService.js
 * Core business logic for DSA progress: streak tracking, topic analysis,
 * recommendation generation, and heatmap maintenance.
 */

const DSAProgress = require("../models/DSAProgress");

const TOPIC_PROBLEM_BANK = {
  Arrays: [
    { title: "Two Sum",            difficulty: "Easy",   url: "https://leetcode.com/problems/two-sum/" },
    { title: "3Sum",                difficulty: "Medium", url: "https://leetcode.com/problems/3sum/" },
  ],
  Strings: [
    { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  ],
  Hashing: [
    { title: "Group Anagrams",     difficulty: "Medium", url: "https://leetcode.com/problems/group-anagrams/" },
  ],
  Trees: [
    { title: "Binary Tree Level Order Traversal", difficulty: "Medium", url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  ],
  Graphs: [
    { title: "Number of Islands", difficulty: "Medium", url: "https://leetcode.com/problems/number-of-islands/" },
    { title: "Course Schedule II", difficulty: "Medium", url: "https://leetcode.com/problems/course-schedule-ii/" },
  ],
  "Dynamic Programming": [
    { title: "Coin Change",                     difficulty: "Medium", url: "https://leetcode.com/problems/coin-change/" },
    { title: "House Robber II",                 difficulty: "Medium", url: "https://leetcode.com/problems/house-robber-ii/" },
    { title: "Longest Increasing Subsequence",  difficulty: "Medium", url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
    { title: "Edit Distance",                   difficulty: "Hard",   url: "https://leetcode.com/problems/edit-distance/" },
    { title: "Partition Equal Subset Sum",      difficulty: "Medium", url: "https://leetcode.com/problems/partition-equal-subset-sum/" },
  ],
  "Linked List": [
    { title: "Reverse Linked List II", difficulty: "Medium", url: "https://leetcode.com/problems/reverse-linked-list-ii/" },
  ],
  Stack: [
    { title: "Daily Temperatures", difficulty: "Medium", url: "https://leetcode.com/problems/daily-temperatures/" },
  ],
  Queue: [
    { title: "Sliding Window Maximum", difficulty: "Hard", url: "https://leetcode.com/problems/sliding-window-maximum/" },
  ],
  Heap: [
    { title: "Kth Largest Element in an Array", difficulty: "Medium", url: "https://leetcode.com/problems/kth-largest-element-in-an-array/" },
  ],
  "Binary Search": [
    { title: "Search in Rotated Sorted Array", difficulty: "Medium", url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  ],
  Greedy: [
    { title: "Jump Game", difficulty: "Medium", url: "https://leetcode.com/problems/jump-game/" },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Date helpers (UTC date strings, "YYYY-MM-DD")
// ─────────────────────────────────────────────────────────────────────────────
const todayStr   = () => new Date().toISOString().slice(0, 10);
const daysAgoStr = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);

const dayDiff = (a, b) => {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2 - d1) / 86400000);
};

// ─────────────────────────────────────────────────────────────────────────────
// 1. Get or create a user's DSA progress doc
// ─────────────────────────────────────────────────────────────────────────────
const getOrCreateProgress = async (userId) => {
  let doc = await DSAProgress.findOne({ userId });
  if (!doc) {
    doc = await DSAProgress.create({ userId });
  }
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 2. Streak calculation
// Call whenever a problem is solved (today). Handles same-day, consecutive-day,
// and broken-streak cases.
// ─────────────────────────────────────────────────────────────────────────────
const applyStreakLogic = (doc) => {
  const today = todayStr();

  if (!doc.lastSolvedDate) {
    doc.currentStreak = 1;
  } else {
    const diff = dayDiff(doc.lastSolvedDate, today);
    if (diff === 0) {
      // already solved something today — streak unchanged
    } else if (diff === 1) {
      doc.currentStreak += 1;
    } else if (diff > 1) {
      doc.currentStreak = 1; // streak broken, restart at 1
    }
    // diff < 0 (clock skew / backdated) — ignore, no-op
  }

  doc.lastSolvedDate = today;
  doc.longestStreak = Math.max(doc.longestStreak, doc.currentStreak);
  return doc;
};

// Call independently (e.g. on dashboard load) to break streaks if a day was
// missed without any new solve — keeps currentStreak accurate even with
// zero activity since the last login.
const checkAndBreakStreak = (doc) => {
  if (!doc.lastSolvedDate) return doc;
  const diff = dayDiff(doc.lastSolvedDate, todayStr());
  if (diff > 1) {
    doc.currentStreak = 0;
  }
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 3. Activity heatmap maintenance
// ─────────────────────────────────────────────────────────────────────────────
const incrementHeatmapDay = (doc, count = 1, date = todayStr()) => {
  const entry = doc.activityHeatmap.find((d) => d.date === date);
  if (entry) {
    entry.count += count;
  } else {
    doc.activityHeatmap.push({ date, count });
  }

  // Keep only the last 90 days
  const cutoff = daysAgoStr(90);
  doc.activityHeatmap = doc.activityHeatmap
    .filter((d) => d.date >= cutoff)
    .sort((a, b) => (a.date > b.date ? 1 : -1));

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 4. Daily average calculation (based on last 30 days of heatmap data)
// ─────────────────────────────────────────────────────────────────────────────
const recalculateDailyAverage = (doc) => {
  const cutoff = daysAgoStr(30);
  const recent = doc.activityHeatmap.filter((d) => d.date >= cutoff);
  const totalRecent = recent.reduce((sum, d) => sum + d.count, 0);
  const daysActive  = Math.max(recent.length, 1);
  doc.dailyAverage = Math.round((totalRecent / daysActive) * 10) / 10;
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 5. Topic progress update
// ─────────────────────────────────────────────────────────────────────────────
const updateTopicProgress = (doc, topicName, increment = 1) => {
  const topic = doc.topicProgress.find((t) => t.topicName === topicName);
  if (!topic) return doc;

  topic.solvedCount += increment;
  if (topic.totalCount > 0) {
    topic.progressPercentage = Math.min(100, Math.round((topic.solvedCount / topic.totalCount) * 100));
  } else {
    // No denominator set — derive a soft percentage capped at 100
    topic.progressPercentage = Math.min(100, topic.solvedCount * 2);
  }
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 6. Weakest / strongest topic detection
// ─────────────────────────────────────────────────────────────────────────────
const recalculateTopicStrengths = (doc) => {
  const sorted = [...doc.topicProgress].sort((a, b) => a.progressPercentage - b.progressPercentage);

  doc.weakTopics   = sorted.slice(0, 3).map((t) => t.topicName);
  doc.strongTopics = sorted.slice(-3).reverse().map((t) => t.topicName);

  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 7. AI-style recommendation generator
// ─────────────────────────────────────────────────────────────────────────────
const generateRecommendation = (doc) => {
  const weakest = doc.weakTopics[0];
  if (!weakest) return "Keep solving consistently to build topic-wise insights.";

  const topicData = doc.topicProgress.find((t) => t.topicName === weakest);
  const gap = 100 - (topicData?.progressPercentage || 0);
  const suggestedCount = gap > 60 ? 5 : gap > 30 ? 3 : 2;

  return `Your weakest topic is ${weakest}. Solving ${suggestedCount} medium ${weakest} problems this week would meaningfully boost your DSA score.`;
};

// ─────────────────────────────────────────────────────────────────────────────
// 8. Refresh suggested problems based on weakest topics
// ─────────────────────────────────────────────────────────────────────────────
const regenerateSuggestedProblems = (doc) => {
  const suggestions = [];

  for (const topic of doc.weakTopics) {
    const bank = TOPIC_PROBLEM_BANK[topic] || [];
    for (const p of bank) {
      suggestions.push({
        title:       p.title,
        difficulty:  p.difficulty,
        topic,
        leetcodeUrl: p.url,
        platform:    "LeetCode",
        addedAt:     new Date(),
      });
    }
  }

  doc.suggestedProblems = suggestions.slice(0, 8);
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 9. Master "record a solved problem" pipeline
// ─────────────────────────────────────────────────────────────────────────────
const recordProblemSolved = async (userId, { topicName, difficulty = "Medium", count = 1 }) => {
  let doc = await getOrCreateProgress(userId);

  doc.totalProblemsSolved += count;
  doc = applyStreakLogic(doc);
  doc = incrementHeatmapDay(doc, count);
  doc = recalculateDailyAverage(doc);

  if (topicName) {
    doc = updateTopicProgress(doc, topicName, count);
  }

  doc = recalculateTopicStrengths(doc);
  doc = regenerateSuggestedProblems(doc);

  await doc.save();
  return doc;
};

// ─────────────────────────────────────────────────────────────────────────────
// 10. Dashboard response shaper — matches frontend DSA Tracker expectations
// ─────────────────────────────────────────────────────────────────────────────
const buildDashboardResponse = (doc) => {
  return {
    stats: {
      problemsSolved: doc.totalProblemsSolved,
      currentStreak:  doc.currentStreak,
      longestStreak:  doc.longestStreak,
      dailyAvg:       doc.dailyAverage,
      dailyTarget:    doc.targetProblemsPerDay,
      contestRating:  doc.contestStats.currentRating,
      maxRating:      doc.contestStats.highestRating,
    },
    topics: doc.topicProgress.map((t) => ({
      id:    t.topicName.toLowerCase().replace(/\s+/g, "-"),
      label: t.topicName,
      solved: t.solvedCount,
      total:  t.totalCount || Math.max(t.solvedCount, 1),
      progressPercentage: t.progressPercentage,
    })),
    heatmap: doc.activityHeatmap,
    aiInsights: {
      weakest:        doc.weakTopics[0] || null,
      strongest:      doc.strongTopics[0] || null,
      recommendation: generateRecommendation(doc),
      weakTopics:     doc.weakTopics,
      strongTopics:   doc.strongTopics,
    },
    suggestedProblems: doc.suggestedProblems,
    contestStats: doc.contestStats,
    updatedAt: doc.updatedAt,
  };
};

module.exports = {
  getOrCreateProgress,
  applyStreakLogic,
  checkAndBreakStreak,
  incrementHeatmapDay,
  recalculateDailyAverage,
  updateTopicProgress,
  recalculateTopicStrengths,
  generateRecommendation,
  regenerateSuggestedProblems,
  recordProblemSolved,
  buildDashboardResponse,
  TOPIC_PROBLEM_BANK,
  todayStr,
};
