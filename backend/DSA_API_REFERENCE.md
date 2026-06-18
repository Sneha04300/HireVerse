# DSA Tracker — Sample Document & API Reference

## Sample MongoDB Document

```json
{
  "_id": "665f1a2b3c4d5e6f7a8b9c0d",
  "userId": "665e0a1b2c3d4e5f6a7b8c9d",
  "totalProblemsSolved": 320,
  "currentStreak": 28,
  "longestStreak": 28,
  "lastSolvedDate": "2026-06-18",
  "dailyAverage": 3.4,
  "targetProblemsPerDay": 4,
  "topicProgress": [
    { "topicName": "Arrays",               "progressPercentage": 90, "solvedCount": 72, "totalCount": 80 },
    { "topicName": "Strings",               "progressPercentage": 85, "solvedCount": 51, "totalCount": 60 },
    { "topicName": "Hashing",                "progressPercentage": 78, "solvedCount": 39, "totalCount": 50 },
    { "topicName": "Trees",                  "progressPercentage": 60, "solvedCount": 36, "totalCount": 60 },
    { "topicName": "Graphs",                 "progressPercentage": 40, "solvedCount": 20, "totalCount": 50 },
    { "topicName": "Dynamic Programming",    "progressPercentage": 25, "solvedCount": 12, "totalCount": 48 },
    { "topicName": "Linked List",            "progressPercentage": 60, "solvedCount": 18, "totalCount": 30 },
    { "topicName": "Stack",                  "progressPercentage": 64, "solvedCount": 16, "totalCount": 25 },
    { "topicName": "Queue",                  "progressPercentage": 50, "solvedCount": 10, "totalCount": 20 },
    { "topicName": "Heap",                   "progressPercentage": 50, "solvedCount": 10, "totalCount": 20 },
    { "topicName": "Binary Search",          "progressPercentage": 73, "solvedCount": 22, "totalCount": 30 },
    { "topicName": "Greedy",                 "progressPercentage": 70, "solvedCount": 28, "totalCount": 40 }
  ],
  "activityHeatmap": [
    { "date": "2026-06-16", "count": 4 },
    { "date": "2026-06-17", "count": 2 },
    { "date": "2026-06-18", "count": 5 }
  ],
  "weakTopics":   ["Dynamic Programming", "Graphs", "Queue"],
  "strongTopics": ["Arrays", "Strings", "Hashing"],
  "suggestedProblems": [
    {
      "title": "Coin Change",
      "difficulty": "Medium",
      "topic": "Dynamic Programming",
      "leetcodeUrl": "https://leetcode.com/problems/coin-change/",
      "platform": "LeetCode",
      "addedAt": "2026-06-18T10:00:00.000Z"
    }
  ],
  "contestStats": {
    "participated": 18,
    "bestRank": 142,
    "currentRating": 1650,
    "highestRating": 1820
  },
  "createdAt": "2026-03-01T08:00:00.000Z",
  "updatedAt": "2026-06-18T10:00:00.000Z"
}
```

---

## API Reference

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/dsa/update-progress` | ✅ | Record a solved problem; updates streak, heatmap, topic %, weak/strong topics |
| GET  | `/api/dsa/dashboard` | ✅ | Full dashboard payload matching the frontend page |
| GET  | `/api/dsa/topics` | ✅ | Topic-wise progress only |
| GET  | `/api/dsa/heatmap?days=90` | ✅ | Activity heatmap, optional day range |
| GET  | `/api/dsa/suggestions` | ✅ | AI-picked suggested problems |
| POST | `/api/dsa/add-problem` | ✅ | Manually bookmark a problem |
| POST | `/api/dsa/update-streak` | ✅ | Manually trigger streak increment/reset |

### GET /api/dsa/dashboard — Response Shape

```json
{
  "success": true,
  "data": {
    "stats": {
      "problemsSolved": 320,
      "currentStreak": 28,
      "longestStreak": 28,
      "dailyAvg": 3.4,
      "dailyTarget": 4,
      "contestRating": 1650,
      "maxRating": 1820
    },
    "topics": [
      { "id": "arrays", "label": "Arrays", "solved": 72, "total": 80, "progressPercentage": 90 }
    ],
    "heatmap": [
      { "date": "2026-06-18", "count": 5 }
    ],
    "aiInsights": {
      "weakest": "Dynamic Programming",
      "strongest": "Arrays",
      "recommendation": "Your weakest topic is Dynamic Programming. Solving 5 medium Dynamic Programming problems this week would meaningfully boost your DSA score.",
      "weakTopics": ["Dynamic Programming", "Graphs", "Queue"],
      "strongTopics": ["Arrays", "Strings", "Hashing"]
    },
    "suggestedProblems": [ /* ... */ ],
    "contestStats": { "participated": 18, "bestRank": 142, "currentRating": 1650, "highestRating": 1820 },
    "updatedAt": "2026-06-18T10:00:00.000Z"
  }
}
```

This maps directly onto the frontend's `DSA_STATS`, `TOPICS`, `HEATMAP_DATA`, and `AI_INSIGHTS` shapes — swap the dummy data imports for a single `fetch("/api/dsa/dashboard")` call.

### Streak Logic Summary

- Solving a problem (`update-progress`) on a **new day** after the last solve → streak +1
- Solving on the **same day** → streak unchanged
- Solving after a **gap of 2+ days** → streak resets to 1
- Loading the dashboard with **no activity for 2+ days** → streak passively resets to 0 (`checkAndBreakStreak`)

### Weak/Strong Topic Logic

Topics are sorted by `progressPercentage`. The bottom 3 become `weakTopics`, the top 3 (reversed) become `strongTopics`. This recalculates automatically every time `update-progress` is called.
