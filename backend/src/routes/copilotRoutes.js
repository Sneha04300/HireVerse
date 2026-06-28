/**
 * copilotRoutes.js
 * All routes protected by existing JWT middleware via router.use(protect).
 *
 * Mount in app.js / server.js:
 *   const copilotRoutes = require("./src/routes/copilotRoutes");
 *   app.use("/api/copilot", copilotRoutes);
 */

const express = require("express");
const router  = express.Router();
const protect = require("../middleware/authMiddleware"); // your existing JWT middleware

const {
  getDashboard,
  getChatHistory,
  postChatMessage,
  generatePlan,
  updateGoal,
  getReadiness,
} = require("../controllers/copilotController");

// Protect every route below this line
router.use(protect);

// GET  /api/copilot/dashboard — { readiness, focusAreas, weeklyGoals, insights, actionPlan }
router.get("/dashboard", getDashboard);

// GET  /api/copilot/chat — full chat history
router.get("/chat", getChatHistory);

// POST /api/copilot/chat — send a message, get an AI response
router.post("/chat", postChatMessage);

// POST /api/copilot/generate-plan — generate + persist a 30-day plan
router.post("/generate-plan", generatePlan);

// POST /api/copilot/update-goal — toggle a weekly checklist item
router.post("/update-goal", updateGoal);

// GET  /api/copilot/readiness — { overallScore, strongAreas, weakAreas, recommendation }
router.get("/readiness", getReadiness);

module.exports = router;
