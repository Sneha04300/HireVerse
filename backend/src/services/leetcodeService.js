const LeetCodeProfile = require("../models/LeetCodeProfile");

const GRAPHQL_URL = "https://leetcode.com/graphql";
const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

async function gql(query, variables) {
  const res = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
    signal: AbortSignal.timeout(15000),
  });
  return res.json();
}

const PROFILE_QUERY = `
query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      userAvatar
      reputation
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
      }
      totalSubmissionNum {
        difficulty
        count
      }
    }
    badges {
      displayName
      icon
    }
    submissionCalendar
  }
  allQuestionsCount {
    difficulty
    count
  }
}
`;

const CONTEST_QUERY = `
query userContest($username: String!) {
  userContestRanking(username: $username) {
    attendedContestsCount
    rating
    globalRanking
  }
  userContestRankingHistory(username: $username) {
    attended
    rating
    ranking
    contest {
      title
    }
  }
}
`;

async function fetchFromLeetCode(username) {
  const [profileRes, contestRes] = await Promise.all([
    gql(PROFILE_QUERY, { username }),
    gql(CONTEST_QUERY, { username }),
  ]);

  const matchedUser = profileRes?.data?.matchedUser;
  const allQs = profileRes?.data?.allQuestionsCount || [];

  if (!matchedUser) {
    throw new Error("LeetCode user not found");
  }

  const acArr = matchedUser.submitStats?.acSubmissionNum || [];
  const totalArr = matchedUser.submitStats?.totalSubmissionNum || [];

  const getCount = (arr, diff) => (arr.find((x) => x.difficulty === diff) || {}).count || 0;
  const easySolved = getCount(acArr, "Easy");
  const mediumSolved = getCount(acArr, "Medium");
  const hardSolved = getCount(acArr, "Hard");
  const totalSubmissions = getCount(totalArr, "All");
  const totalAccepted = getCount(acArr, "All");

  const problemsSolved = easySolved + mediumSolved + hardSolved;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((totalAccepted / totalSubmissions) * 1000) / 10 : 0;

  const totalEasy = getCount(allQs, "Easy");
  const totalMedium = getCount(allQs, "Medium");
  const totalHard = getCount(allQs, "Hard");

  const submissionCalendar = matchedUser.submissionCalendar;
  const heatmap = [];
  if (submissionCalendar) {
    try {
      const cal = JSON.parse(submissionCalendar);
      const now = Math.floor(Date.now() / 1000);
      const ninetyDaysAgo = now - 90 * 86400;
      const entries = Object.entries(cal)
        .map(([ts, count]) => ({ ts: Number(ts), count }))
        .filter((e) => e.ts >= ninetyDaysAgo)
        .sort((a, b) => a.ts - b.ts);
      heatmap.push(...entries.map((e) => [e.ts, e.count]));
    } catch {
      // ignore invalid calendar
    }
  }

  const badges = (matchedUser.badges || [])
    .filter((b) => b.displayName)
    .map((b) => ({ name: b.displayName, icon: b.icon || "" }))
    .slice(0, 5);

  // Contest data
  const ranking = contestRes?.data?.userContestRanking;
  const history = contestRes?.data?.userContestRankingHistory || [];

  const recentContests = history
    .filter((c) => c.attended)
    .slice(-5)
    .reverse()
    .map((c) => ({
      title: c.contest?.title || "",
      rating: Math.round(c.rating),
      rank: c.ranking,
      date: "",
    }));

  return {
    username,
    avatar: matchedUser.profile?.userAvatar || "",
    problemsSolved,
    easySolved,
    mediumSolved,
    hardSolved,
    totalEasy,
    totalMedium,
    totalHard,
    acceptanceRate,
    ranking: ranking?.globalRanking || 0,
    contestRating: Math.round(ranking?.rating || 0),
    attendedContestsCount: ranking?.attendedContestsCount || 0,
    badges,
    submissionHeatmap: heatmap,
    recentContests,
  };
}

const getLeetCodeProfile = async (userId) => {
  const cached = await LeetCodeProfile.findOne({ userId });
  if (cached && Date.now() - cached.lastSync.getTime() < CACHE_TTL_MS) {
    return cached;
  }

  if (!cached) return null;

  // Fetch fresh data
  try {
    const data = await fetchFromLeetCode(cached.username);
    const updated = await LeetCodeProfile.findOneAndUpdate(
      { userId },
      { ...data, lastSync: new Date() },
      { new: true }
    );
    return updated;
  } catch {
    // Return stale cache if fetch fails
    return cached;
  }
};

const connectLeetCode = async (userId, username) => {
  const data = await fetchFromLeetCode(username);
  const profile = await LeetCodeProfile.findOneAndUpdate(
    { userId },
    { ...data, userId, lastSync: new Date() },
    { upsert: true, new: true }
  );
  return profile;
};

module.exports = { getLeetCodeProfile, connectLeetCode, fetchFromLeetCode };
