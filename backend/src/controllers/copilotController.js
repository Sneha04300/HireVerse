/**
 * copilotController.js
 * Handles HTTP layer for Career Copilot — validates input, delegates to
 * service, returns frontend-ready responses matching CareerCopilotPage.jsx.
 */

const copilotService = require("../services/copilotService");

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/copilot/dashboard
// Returns { readiness, focusAreas, weeklyGoals, insights, actionPlan }
// ─────────────────────────────────────────────────────────────────────────────
const getDashboard = async (req, res) => {
  try {
    const doc = await copilotService.getOrCreateProfile(req.user._id);
    return res.status(200).json({ success: true, data: copilotService.buildDashboardResponse(doc) });
  } catch (err) {
    console.error("[getDashboard]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/copilot/chat
// Returns the full chat history for the logged-in user.
// ─────────────────────────────────────────────────────────────────────────────
const getChatHistory = async (req, res) => {
  try {
    const doc = await copilotService.getOrCreateProfile(req.user._id);
    return res.status(200).json({ success: true, data: { chatHistory: doc.chatHistory } });
  } catch (err) {
    console.error("[getChatHistory]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch chat history.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/copilot/chat
// Body: { message: "Can I crack Amazon in 4 months?" }
// Creates user + assistant messages, stores both, returns updated conversation.
// ─────────────────────────────────────────────────────────────────────────────
const postChatMessage = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: "message is required." });
    }

    const doc = await copilotService.handleChatMessage(req.user._id, message.trim());

    // Return the last 2 entries (user + assistant) plus the full thread
    const lastTwo = doc.chatHistory.slice(-2);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: {
        userMessage:      lastTwo[0],
        assistantMessage: lastTwo[1],
        chatHistory:      doc.chatHistory,
      },
    });
  } catch (err) {
    console.error("[postChatMessage]", err);
    return res.status(500).json({ success: false, message: "Failed to process message.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/copilot/generate-plan
// Body: { company: "Amazon" }
// Generates and persists a 30-day plan for the given company.
// ─────────────────────────────────────────────────────────────────────────────
const generatePlan = async (req, res) => {
  try {
    const { company } = req.body;

    if (!company || !company.trim()) {
      return res.status(400).json({ success: false, message: "company is required." });
    }

    const doc = await copilotService.generatePlan(req.user._id, company.trim());

    return res.status(201).json({
      success: true,
      message: `30-day plan generated for ${company}.`,
      data: {
        company:    doc.readiness.companyTarget,
        actionPlan: doc.actionPlan.map((p) => ({
          week:        `Week ${p.week}`,
          title:       p.title,
          description: p.description,
          status:      p.status,
        })),
      },
    });
  } catch (err) {
    console.error("[generatePlan]", err);
    return res.status(500).json({ success: false, message: "Failed to generate plan.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/copilot/update-goal
// Body: { goalId, completed }
// Updates a single weekly checklist item.
// ─────────────────────────────────────────────────────────────────────────────
const updateGoal = async (req, res) => {
  try {
    const { goalId, completed } = req.body;

    if (!goalId || typeof completed !== "boolean") {
      return res.status(400).json({ success: false, message: "goalId and completed (boolean) are required." });
    }

    const doc = await copilotService.updateWeeklyGoal(req.user._id, goalId, completed);

    if (!doc) {
      return res.status(404).json({ success: false, message: "Goal not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Goal updated successfully.",
      data: {
        weeklyGoals: doc.weeklyGoals.map((g) => ({ id: g._id, label: g.title, done: g.completed })),
      },
    });
  } catch (err) {
    console.error("[updateGoal]", err);
    return res.status(500).json({ success: false, message: "Failed to update goal.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/copilot/readiness
// Returns { overallScore, strongAreas, weakAreas, recommendation }
// ─────────────────────────────────────────────────────────────────────────────
const getReadiness = async (req, res) => {
  try {
    const doc = await copilotService.getOrCreateProfile(req.user._id);
    copilotService.recalculateReadiness(doc);
    await doc.save();

    const { strongAreas, weakAreas } = copilotService.splitStrongWeakAreas(doc);
    const recommendation = copilotService.generateReadinessRecommendation(doc);

    return res.status(200).json({
      success: true,
      data: {
        overallScore: doc.readiness.overallScore,
        strongAreas,
        weakAreas,
        recommendation,
      },
    });
  } catch (err) {
    console.error("[getReadiness]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch readiness.", error: err.message });
  }
};

module.exports = {
  getDashboard,
  getChatHistory,
  postChatMessage,
  generatePlan,
  updateGoal,
  getReadiness,
};
