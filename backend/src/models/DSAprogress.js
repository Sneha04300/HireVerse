const mongoose = require("mongoose");

// ── Supported DSA topics (must match frontend TOPICS list) ──────────────────
const SUPPORTED_TOPICS = [
  "Arrays",
  "Strings",
  "Hashing",
  "Trees",
  "Graphs",
  "Dynamic Programming",
  "Linked List",
  "Stack",
  "Queue",
  "Heap",
  "Binary Search",
  "Greedy",
];

// ── Sub-schema: per-topic progress ───────────────────────────────────────────
const topicProgressSchema = new mongoose.Schema(
  {
    topicName: {
      type: String,
      enum: SUPPORTED_TOPICS,
      required: true,
    },
    progressPercentage: { type: Number, min: 0, max: 100, default: 0 },
    solvedCount:         { type: Number, min: 0, default: 0 },
    totalCount:          { type: Number, min: 0, default: 0 }, // denominator used for %
  },
  { _id: false }
);

// ── Sub-schema: one day of activity (GitHub-style heatmap cell) ─────────────
const activityDaySchema = new mongoose.Schema(
  {
    date:  { type: String, required: true }, // "YYYY-MM-DD"
    count: { type: Number, min: 0, default: 0 },
  },
  { _id: false }
);

// ── Sub-schema: AI-suggested problem ─────────────────────────────────────────
const suggestedProblemSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    difficulty:   { type: String, enum: ["Easy", "Medium", "Hard"], required: true },
    topic:        { type: String, enum: SUPPORTED_TOPICS, required: true },
    leetcodeUrl:  { type: String, default: "" },
    platform:     { type: String, default: "LeetCode" },
    addedAt:      { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const dsaProgressSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true,   // one DSA progress doc per user
      index:    true,
    },

    totalProblemsSolved: { type: Number, min: 0, default: 0 },

    currentStreak:  { type: Number, min: 0, default: 0 },
    longestStreak:  { type: Number, min: 0, default: 0 },
    lastSolvedDate: { type: String, default: null }, // "YYYY-MM-DD" — drives streak logic

    dailyAverage:        { type: Number, min: 0, default: 0 },
    targetProblemsPerDay:{ type: Number, min: 1, default: 4 },

    topicProgress: {
      type:    [topicProgressSchema],
      default: () => SUPPORTED_TOPICS.map((t) => ({ topicName: t, progressPercentage: 0, solvedCount: 0, totalCount: 0 })),
    },

    activityHeatmap: { type: [activityDaySchema], default: [] },

    weakTopics:   { type: [String], default: [] },
    strongTopics: { type: [String], default: [] },

    suggestedProblems: { type: [suggestedProblemSchema], default: [] },

    // Contest data (used by frontend ContestPerformance widget)
    contestStats: {
      participated:  { type: Number, default: 0 },
      bestRank:      { type: Number, default: 0 },
      currentRating: { type: Number, default: 0 },
      highestRating: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true, // createdAt + updatedAt
    versionKey: false,
  }
);

dsaProgressSchema.statics.SUPPORTED_TOPICS = SUPPORTED_TOPICS;

module.exports = mongoose.model("DSAProgress", dsaProgressSchema);
