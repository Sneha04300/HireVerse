const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const {
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
} = require("../controllers/dsaController");

router.post("/", protect, createProblem);
router.get("/", protect, getAllProblems);
router.get("/dashboard", protect, getDashboard);
router.get("/coach", protect, getCoach);
router.get("/leetcode", protect, getLeetCode);
router.post("/leetcode/connect", protect, connectLeetCode);
router.get("/:id", protect, getProblem);
router.put("/:id", protect, updateProblem);
router.delete("/:id", protect, deleteProblem);
router.patch("/:id/bookmark", protect, toggleBookmark);
router.patch("/:id/revise", protect, incrementRevision);

module.exports = router;
