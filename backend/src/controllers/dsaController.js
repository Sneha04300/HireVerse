const dsaService = require("../services/dsaService");
const dsaAnalyticsService = require("../services/dsaAnalyticsService");
const { generateDSAInsights } = require("../services/dsaCoachService");
const leetcodeService = require("../services/leetcodeService");

const createProblem = async (req, res) => {
  try {
    const data = req.body;

    if (!data.title || !data.difficulty) {
      return res.status(400).json({ success: false, message: "title and difficulty are required." });
    }

    if (!["Easy", "Medium", "Hard"].includes(data.difficulty)) {
      return res.status(400).json({ success: false, message: "difficulty must be Easy, Medium, or Hard." });
    }

    const problem = await dsaService.createProblem(req.user._id, data);

    return res.status(201).json({
      success: true,
      message: "Problem created successfully.",
      data: problem,
    });
  } catch (err) {
    console.error("[dsaController.createProblem]", err);
    return res.status(500).json({ success: false, message: "Failed to create problem.", error: err.message });
  }
};

const getAllProblems = async (req, res) => {
  try {
    const filters = {};

    if (req.query.status) filters.status = req.query.status;
    if (req.query.difficulty) filters.difficulty = req.query.difficulty;
    if (req.query.platform) filters.platform = req.query.platform;
    if (req.query.topic) filters.topic = { $in: [req.query.topic] };
    if (req.query.bookmarked === "true") filters.bookmarked = true;

    const problems = await dsaService.getAllProblems(req.user._id, filters);

    return res.status(200).json({
      success: true,
      count: problems.length,
      data: problems,
    });
  } catch (err) {
    console.error("[dsaController.getAllProblems]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch problems.", error: err.message });
  }
};

const getProblem = async (req, res) => {
  try {
    const problem = await dsaService.getProblem(req.user._id, req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    return res.status(200).json({
      success: true,
      data: problem,
    });
  } catch (err) {
    console.error("[dsaController.getProblem]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch problem.", error: err.message });
  }
};

const updateProblem = async (req, res) => {
  try {
    const problem = await dsaService.updateProblem(req.user._id, req.params.id, req.body);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Problem updated successfully.",
      data: problem,
    });
  } catch (err) {
    console.error("[dsaController.updateProblem]", err);
    return res.status(500).json({ success: false, message: "Failed to update problem.", error: err.message });
  }
};

const deleteProblem = async (req, res) => {
  try {
    const problem = await dsaService.deleteProblem(req.user._id, req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Problem deleted successfully.",
    });
  } catch (err) {
    console.error("[dsaController.deleteProblem]", err);
    return res.status(500).json({ success: false, message: "Failed to delete problem.", error: err.message });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const problem = await dsaService.toggleBookmark(req.user._id, req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    return res.status(200).json({
      success: true,
      message: problem.bookmarked ? "Problem bookmarked." : "Bookmark removed.",
      data: problem,
    });
  } catch (err) {
    console.error("[dsaController.toggleBookmark]", err);
    return res.status(500).json({ success: false, message: "Failed to toggle bookmark.", error: err.message });
  }
};

const incrementRevision = async (req, res) => {
  try {
    const problem = await dsaService.incrementRevision(req.user._id, req.params.id);

    if (!problem) {
      return res.status(404).json({ success: false, message: "Problem not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Revision count incremented.",
      data: problem,
    });
  } catch (err) {
    console.error("[dsaController.incrementRevision]", err);
    return res.status(500).json({ success: false, message: "Failed to increment revision.", error: err.message });
  }
};

const getDashboard = async (req, res) => {
  console.log("[DIAG] GET /api/dsa/dashboard — userId:", req.user?._id);
  try {
    const dashboard = await dsaAnalyticsService.calculateDashboard(req.user._id);
    console.log("[DIAG] Dashboard computed OK — totalSolved:", dashboard.overview.totalSolved);
    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (err) {
    console.error("[DIAG] getDashboard ERROR:", err);
    console.error("[DIAG] Stack:", err.stack);
    return res.status(500).json({ success: false, message: "Failed to fetch dashboard.", error: err.message });
  }
};

const getCoach = async (req, res) => {
  try {
    const insights = await generateDSAInsights(req.user._id);

    return res.status(200).json({
      success: true,
      data: insights,
    });
  } catch (err) {
    console.error("[dsaController.getCoach]", err);
    return res.status(500).json({ success: false, message: "Failed to generate coach insights.", error: err.message });
  }
};

const getLeetCode = async (req, res) => {
  try {
    const profile = await leetcodeService.getLeetCodeProfile(req.user._id);
    if (!profile) {
      return res.status(200).json({ success: true, data: null });
    }
    return res.status(200).json({ success: true, data: profile });
  } catch (err) {
    console.error("[dsaController.getLeetCode]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch LeetCode profile.", error: err.message });
  }
};

const connectLeetCode = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || !username.trim()) {
      return res.status(400).json({ success: false, message: "Username is required." });
    }
    const profile = await leetcodeService.connectLeetCode(req.user._id, username.trim());
    return res.status(200).json({ success: true, message: "LeetCode connected.", data: profile });
  } catch (err) {
    console.error("[dsaController.connectLeetCode]", err);
    return res.status(500).json({ success: false, message: "Failed to connect LeetCode.", error: err.message });
  }
};

module.exports = {
  createProblem,
  getAllProblems,
  getProblem,
  updateProblem,
  deleteProblem,
  toggleBookmark,
  incrementRevision,
  getDashboard,
  getCoach,
  getLeetCode,
  connectLeetCode,
};
