/**
 * dsaController.js
 * Handles HTTP layer for DSA Tracker — validates input, delegates to service,
 * returns frontend-ready responses.
 */

const DSAProgress = require("../models/DSAProgress");
const dsaService   = require("../services/dsaService");

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/dsa/update-progress
// Body: { topicName, count?, difficulty? }
// Records that the user solved `count` problems in `topicName` today.
// Updates: totalProblemsSolved, streak, heatmap, topic %, weak/strong topics.
// ─────────────────────────────────────────────────────────────────────────────
const updateProgress = async (req, res) => {
  try {
    const { topicName, count = 1, difficulty = "Medium" } = req.body;

    if (!topicName) {
      return res.status(400).json({ success: false, message: "topicName is required." });
    }

    if (!DSAProgress.SUPPORTED_TOPICS.includes(topicName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid topicName. Must be one of: ${DSAProgress.SUPPORTED_TOPICS.join(", ")}`,
      });
    }

    const doc = await dsaService.recordProblemSolved(req.user._id, { topicName, count, difficulty });

    return res.status(200).json({
      success: true,
      message: "Progress updated successfully.",
      data: dsaService.buildDashboardResponse(doc),
    });
  } catch (err) {
    console.error("[updateProgress]", err);
    return res.status(500).json({ success: false, message: "Failed to update progress.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dsa/dashboard
// Returns the full dashboard payload — stats, topics, heatmap, AI insights,
// suggested problems, contest stats. Matches the frontend page 1:1.
// ─────────────────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    let doc = await dsaService.getOrCreateProgress(req.user._id);

    // Passive streak check — breaks streak if user missed a day, even if
    // they haven't solved anything yet today.
    doc = dsaService.checkAndBreakStreak(doc);
    await doc.save();

    return res.status(200).json({
      success: true,
      data: dsaService.buildDashboardResponse(doc),
    });
  } catch (err) {
    console.error("[getDashboard]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dsa/topics
// Returns just the topic-progress breakdown (lighter payload than dashboard).
// ─────────────────────────────────────────────────────────────────────────────
const getTopics = async (req, res) => {
  try {
    const doc = await dsaService.getOrCreateProgress(req.user._id);

    const topics = doc.topicProgress.map((t) => ({
      id:     t.topicName.toLowerCase().replace(/\s+/g, "-"),
      label:  t.topicName,
      solved: t.solvedCount,
      total:  t.totalCount || Math.max(t.solvedCount, 1),
      progressPercentage: t.progressPercentage,
    }));

    return res.status(200).json({ success: true, data: { topics } });
  } catch (err) {
    console.error("[getTopics]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch topics.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dsa/heatmap
// Returns the 90-day activity heatmap (GitHub contribution graph style).
// Optional query: ?days=30 to limit range.
// ─────────────────────────────────────────────────────────────────────────────
const getHeatmap = async (req, res) => {
  try {
    const doc  = await dsaService.getOrCreateProgress(req.user._id);
    const days = parseInt(req.query.days) || 90;
    const cutoff = new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);

    const heatmap = doc.activityHeatmap.filter((d) => d.date >= cutoff);

    return res.status(200).json({
      success: true,
      data: {
        heatmap,
        totalActiveDays: heatmap.filter((d) => d.count > 0).length,
        totalSubmissions: heatmap.reduce((sum, d) => sum + d.count, 0),
      },
    });
  } catch (err) {
    console.error("[getHeatmap]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch heatmap.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/dsa/suggestions
// Returns AI-picked suggested problems based on weakest topics.
// ─────────────────────────────────────────────────────────────────────────────
const getSuggestions = async (req, res) => {
  try {
    let doc = await dsaService.getOrCreateProgress(req.user._id);

    // Regenerate on-demand if empty (e.g. brand new user)
    if (!doc.suggestedProblems.length) {
      doc = dsaService.recalculateTopicStrengths(doc);
      doc = dsaService.regenerateSuggestedProblems(doc);
      await doc.save();
    }

    return res.status(200).json({
      success: true,
      data: {
        suggestedProblems: doc.suggestedProblems,
        basedOnWeakTopics: doc.weakTopics,
      },
    });
  } catch (err) {
    console.error("[getSuggestions]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch suggestions.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/dsa/add-problem
// Body: { title, difficulty, topic, leetcodeUrl }
// Manually adds a problem to the suggested-problems list (e.g. user bookmarks
// a problem they want to revisit).
// ─────────────────────────────────────────────────────────────────────────────
const addProblem = async (req, res) => {
  try {
    const { title, difficulty, topic, leetcodeUrl = "" } = req.body;

    if (!title || !difficulty || !topic) {
      return res.status(400).json({ success: false, message: "title, difficulty, and topic are required." });
    }

    if (!["Easy", "Medium", "Hard"].includes(difficulty)) {
      return res.status(400).json({ success: false, message: "difficulty must be Easy, Medium, or Hard." });
    }

    if (!DSAProgress.SUPPORTED_TOPICS.includes(topic)) {
      return res.status(400).json({
        success: false,
        message: `Invalid topic. Must be one of: ${DSAProgress.SUPPORTED_TOPICS.join(", ")}`,
      });
    }

    const doc = await dsaService.getOrCreateProgress(req.user._id);

    doc.suggestedProblems.unshift({
      title,
      difficulty,
      topic,
      leetcodeUrl,
      platform: "LeetCode",
      addedAt:  new Date(),
    });

    // Cap list size
    doc.suggestedProblems = doc.suggestedProblems.slice(0, 20);

    await doc.save();

    return res.status(201).json({
      success: true,
      message: "Problem added successfully.",
      data: { suggestedProblems: doc.suggestedProblems },
    });
  } catch (err) {
    console.error("[addProblem]", err);
    return res.status(500).json({ success: false, message: "Failed to add problem.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/dsa/update-streak
// Body: { action: "increment" | "reset" } (optional, defaults to "increment")
// Manually triggers streak logic — useful for a "Mark today as solved" button
// that isn't tied to a specific topic.
// ─────────────────────────────────────────────────────────────────────────────
const updateStreak = async (req, res) => {
  try {
    const { action = "increment" } = req.body;
    let doc = await dsaService.getOrCreateProgress(req.user._id);

    if (action === "reset") {
      doc.currentStreak  = 0;
      doc.lastSolvedDate = null;
    } else {
      doc = dsaService.applyStreakLogic(doc);
      doc = dsaService.incrementHeatmapDay(doc, 0); // ensure today's cell exists even with 0 problems
    }

    await doc.save();

    return res.status(200).json({
      success: true,
      message: "Streak updated successfully.",
      data: {
        currentStreak: doc.currentStreak,
        longestStreak: doc.longestStreak,
        lastSolvedDate: doc.lastSolvedDate,
      },
    });
  } catch (err) {
    console.error("[updateStreak]", err);
    return res.status(500).json({ success: false, message: "Failed to update streak.", error: err.message });
  }
};

module.exports = {
  updateProgress,
  getDashboard,
  getTopics,
  getHeatmap,
  getSuggestions,
  addProblem,
  updateStreak,
};
