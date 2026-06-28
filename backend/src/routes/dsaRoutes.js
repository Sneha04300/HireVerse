/**
 * dsaRoutes.js
 * All routes protected by existing JWT middleware.
 *
 * Mount in app.js:
 *   const dsaRoutes = require("./routes/dsaRoutes");
 *   app.use("/api/dsa", dsaRoutes);
 */

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware"); // your existing JWT middleware

const {
  updateProgress,
  getDashboard,
  getTopics,
  getHeatmap,
  getSuggestions,
  addProblem,
  updateStreak,
} = require("../controllers/dsaController");

// POST /api/dsa/update-progress — record a solved problem (topic, count, difficulty)
router.post("/update-progress", protect, updateProgress);

// GET  /api/dsa/dashboard — full dashboard payload for the DSA Tracker page
router.get("/dashboard", protect, getDashboard);

// GET  /api/dsa/topics — topic-wise progress breakdown only
router.get("/topics", protect, getTopics);

// GET  /api/dsa/heatmap — 90-day activity heatmap (supports ?days=N)
router.get("/heatmap", protect, getHeatmap);

// GET  /api/dsa/suggestions — AI-picked suggested problems
router.get("/suggestions", protect, getSuggestions);

// POST /api/dsa/add-problem — manually bookmark/add a problem
router.post("/add-problem", protect, addProblem);

// POST /api/dsa/update-streak — manually trigger streak logic
router.post("/update-streak", protect, updateStreak);

module.exports = router;
