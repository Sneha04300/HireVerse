const DSAProgress = require("../models/DSAProgress");

const toDateStr = (d) => {
  const date = d instanceof Date ? d : new Date(d);
  return date.toISOString().slice(0, 10);
};

const startOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (date) => {
  const mon = startOfWeek(date);
  const sun = new Date(mon);
  sun.setDate(mon.getDate() + 6);
  sun.setHours(23, 59, 59, 999);
  return sun;
};

const calculateDashboard = async (userId) => {
  const all = await DSAProgress.find({ userId }).lean();
  const solved = all.filter((p) => p.status === "Solved");
  const attempted = all.filter((p) => p.status === "Attempted");

  const totalSolved = solved.length;
  const totalProblems = all.length;

  const easyCount = all.filter((p) => p.difficulty === "Easy").length;
  const mediumCount = all.filter((p) => p.difficulty === "Medium").length;
  const hardCount = all.filter((p) => p.difficulty === "Hard").length;

  const contestRating = Math.min(3800, 1500 + easyCount * 2 + mediumCount * 5 + hardCount * 10);

  const uniqueDates = [
    ...new Set(solved.map((p) => toDateStr(p.solvedAt))),
  ].sort((a, b) => (a > b ? -1 : 1));

  let currentStreak = 0;
  if (uniqueDates.length > 0) {
    const today = toDateStr(new Date());
    const yesterday = toDateStr(new Date(Date.now() - 86400000));

    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prev = new Date(uniqueDates[i - 1]);
        prev.setDate(prev.getDate() - 1);
        const expected = toDateStr(prev);
        if (uniqueDates[i] === expected) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  const activeDays = uniqueDates.length;
  const dailyAverage = activeDays > 0 ? Math.round((totalSolved / activeDays) * 10) / 10 : 0;

  const topicMap = {};
  for (const p of all) {
    for (const t of p.topic) {
      if (!topicMap[t]) topicMap[t] = { total: 0, solved: 0 };
      topicMap[t].total++;
      if (p.status === "Solved") topicMap[t].solved++;
    }
  }

  const topicProgress = Object.entries(topicMap)
    .map(([topic, data]) => ({
      topic,
      solved: data.solved,
      total: data.total,
      percentage: data.total > 0 ? Math.round((data.solved / data.total) * 100) : 0,
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const strongestTopics = topicProgress.slice(0, 4).map((t) => t.topic);
  const weakestTopics = [...topicProgress].reverse().slice(0, 4).map((t) => t.topic);

  const readinessScore = Math.min(100, Math.round((contestRating / 3800) * 100));

  const totalBookmarks = all.filter((p) => p.bookmarked).length;
  const totalRevisions = all.reduce((sum, p) => sum + (p.revisionCount || 0), 0);

  const now = new Date();

  const thisWeekMon = startOfWeek(now);
  const thisWeekSun = endOfWeek(now);

  const lastWeekMon = new Date(thisWeekMon);
  lastWeekMon.setDate(thisWeekMon.getDate() - 7);
  const lastWeekSun = new Date(thisWeekMon);
  lastWeekSun.setDate(thisWeekMon.getDate() - 1);
  lastWeekSun.setHours(23, 59, 59, 999);

  const solvedThisWeek = solved.filter((p) => {
    const d = new Date(p.solvedAt);
    return d >= thisWeekMon && d <= thisWeekSun;
  }).length;

  const solvedLastWeek = solved.filter((p) => {
    const d = new Date(p.solvedAt);
    return d >= lastWeekMon && d <= lastWeekSun;
  }).length;

  let improvementPercentage = 0;
  if (solvedLastWeek > 0) {
    improvementPercentage = Math.round(((solvedThisWeek - solvedLastWeek) / solvedLastWeek) * 100);
  } else if (solvedThisWeek > 0) {
    improvementPercentage = 100;
  }

  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const solvedThisMonth = solved.filter((p) => {
    const d = new Date(p.solvedAt);
    return d >= thisMonthStart && d <= thisMonthEnd;
  }).length;

  const solvedLastMonth = solved.filter((p) => {
    const d = new Date(p.solvedAt);
    return d >= lastMonthStart && d <= lastMonthEnd;
  }).length;

  // Build 90-day activity heatmap
  const activityMap = {};
  for (const p of solved) {
    const ds = toDateStr(p.solvedAt);
    activityMap[ds] = (activityMap[ds] || 0) + 1;
  }
  const activity = [];
  for (let i = 89; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000);
    const ds = toDateStr(d);
    activity.push({
      date: ds,
      count: activityMap[ds] || 0,
    });
  }

  return {
    overview: {
      totalSolved,
      currentStreak,
      dailyAverage,
      contestRating,
    },
    activity,
    readiness: {
      score: readinessScore,
      strongestTopics,
      weakestTopics,
    },
    topicProgress,
    difficulty: {
      easy: easyCount,
      medium: mediumCount,
      hard: hardCount,
    },
    revision: {
      totalBookmarks,
      totalRevisions,
    },
    weeklyProgress: {
      solvedThisWeek,
      solvedLastWeek,
      improvementPercentage,
    },
    monthlyProgress: {
      solvedThisMonth,
      solvedLastMonth,
    },
  };
};

module.exports = { calculateDashboard };
