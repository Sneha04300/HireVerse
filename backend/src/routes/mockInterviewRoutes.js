/**
 * mockInterviewRoutes.js
 * All routes protected by existing JWT middleware.
 *
 * Mount in app.js / server.js:
 *   const mockInterviewRoutes = require("./routes/mockInterviewRoutes");
 *   app.use("/api/mock", mockInterviewRoutes);
 *
 * IMPORTANT — route order: "/history" must be registered BEFORE "/:interviewId"
 * or Express will treat "history" as an interviewId param and try to look it
 * up as a Mongo ObjectId, causing a CastError.
 */

const express = require("express");
const router  = express.Router();
const { protect } = require("../middleware/authMiddleware"); // your existing JWT middleware

const {
  startInterview,
  getInterview,
  submitAnswer,
  endInterview,
  getReport,
  getHistory,
  deleteInterview,
} = require("../controllers/mockInterviewController");

// POST /api/mock/start — create a new interview, returns first question
router.post("/start", protect, startInterview);

// GET  /api/mock/history — all previous interviews for the logged-in user
// (must come before "/:interviewId" — see note above)
router.get("/history", protect, getHistory);

// GET  /api/mock/:interviewId — current question, transcript, elapsed time, status
router.get("/:interviewId", protect, getInterview);

// POST /api/mock/:interviewId/answer — submit an answer, advance to next question
router.post("/:interviewId/answer", protect, submitAnswer);

// POST /api/mock/:interviewId/end — finalize interview, calculate report
router.post("/:interviewId/end", protect, endInterview);

// GET  /api/mock/:interviewId/report — fetch the final report
router.get("/:interviewId/report", protect, getReport);

// DELETE /api/mock/:interviewId — delete an interview
router.delete("/:interviewId", protect, deleteInterview);

module.exports = router;
