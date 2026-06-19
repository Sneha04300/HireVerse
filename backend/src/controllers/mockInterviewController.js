/**
 * mockInterviewController.js
 * Handles HTTP layer for AI Mock Interview — validates input, delegates to
 * service, returns frontend-ready responses matching MockInterviewPage.jsx.
 */

const MockInterview        = require("../models/MockInterview");
const mockInterviewService = require("../services/mockInterviewService");

// ── Helper: fetch interview + ownership check ────────────────────────────────
const findOwnedInterview = async (interviewId, userId) => {
  const doc = await MockInterview.findById(interviewId);
  if (!doc) return { doc: null, error: { status: 404, message: "Interview not found." } };
  if (doc.userId.toString() !== userId.toString()) {
    return { doc: null, error: { status: 403, message: "Access denied." } };
  }
  return { doc, error: null };
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mock/start
// Body: { type: "Technical" | "HR" | "Mixed", difficulty: "Easy" | "Medium" | "Hard" }
// ─────────────────────────────────────────────────────────────────────────────
const startInterview = async (req, res) => {
  try {
    const { type, difficulty } = req.body;

    if (!type || !difficulty) {
      return res.status(400).json({ success: false, message: "type and difficulty are required." });
    }
    if (!MockInterview.INTERVIEW_TYPES.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Must be one of: ${MockInterview.INTERVIEW_TYPES.join(", ")}`,
      });
    }
    if (!MockInterview.DIFFICULTY_LEVELS.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: `Invalid difficulty. Must be one of: ${MockInterview.DIFFICULTY_LEVELS.join(", ")}`,
      });
    }

    const doc = await mockInterviewService.startInterview(req.user._id, { type, difficulty });

    return res.status(201).json({
      success: true,
      message: "Interview started successfully.",
      data: {
        interviewId:     doc._id,
        currentQuestion: doc.questions[doc.currentQuestionIndex].question,
        totalQuestions:  doc.questions.length,
        status:          doc.status,
      },
    });
  } catch (err) {
    console.error("[startInterview]", err);
    return res.status(500).json({ success: false, message: "Failed to start interview.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mock/:interviewId
// Returns current question, transcript, elapsed time, status.
// ─────────────────────────────────────────────────────────────────────────────
const getInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { doc, error } = await findOwnedInterview(interviewId, req.user._id);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const elapsed = doc.status === "completed"
      ? doc.duration
      : Math.max(0, Math.round((Date.now() - doc.startedAt.getTime()) / 1000));

    return res.status(200).json({
      success: true,
      data: {
        interviewId:          doc._id,
        type:                  doc.type,
        difficulty:            doc.difficulty,
        status:                doc.status,
        currentQuestion:       doc.currentQuestionIndex < doc.questions.length
          ? doc.questions[doc.currentQuestionIndex].question
          : null,
        currentQuestionIndex: doc.currentQuestionIndex,
        totalQuestions:        doc.questions.length,
        transcript:            doc.transcript,
        elapsed,
      },
    });
  } catch (err) {
    console.error("[getInterview]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch interview.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mock/:interviewId/answer
// Body: { answer: "User answer text" }
// ─────────────────────────────────────────────────────────────────────────────
const submitAnswer = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { answer } = req.body;

    if (!answer || !answer.trim()) {
      return res.status(400).json({ success: false, message: "answer is required." });
    }

    const { doc, error } = await findOwnedInterview(interviewId, req.user._id);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    if (doc.status === "completed") {
      return res.status(400).json({ success: false, message: "This interview has already ended." });
    }

    const { doc: updated, isLastQuestion } = await mockInterviewService.submitAnswer(doc, answer);

    return res.status(200).json({
      success: true,
      message: "Answer submitted successfully.",
      data: {
        interviewId:          updated._id,
        nextQuestion:          isLastQuestion ? null : updated.questions[updated.currentQuestionIndex].question,
        currentQuestionIndex: updated.currentQuestionIndex,
        totalQuestions:        updated.questions.length,
        isLastQuestion,
        status:                updated.status,
      },
    });
  } catch (err) {
    console.error("[submitAnswer]", err);
    return res.status(500).json({ success: false, message: "Failed to submit answer.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/mock/:interviewId/end
// Finalizes interview, calculates report, saves to history.
// ─────────────────────────────────────────────────────────────────────────────
const endInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { doc, error } = await findOwnedInterview(interviewId, req.user._id);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    if (doc.status === "completed") {
      return res.status(200).json({
        success: true,
        message: "Interview was already ended.",
        data: { interviewId: doc._id, report: doc.report, status: doc.status },
      });
    }

    const updated = await mockInterviewService.endInterview(doc);

    return res.status(200).json({
      success: true,
      message: "Interview ended successfully.",
      data: {
        interviewId: updated._id,
        status:      updated.status,
        duration:    updated.duration,
        report:      updated.report,
      },
    });
  } catch (err) {
    console.error("[endInterview]", err);
    return res.status(500).json({ success: false, message: "Failed to end interview.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mock/:interviewId/report
// ─────────────────────────────────────────────────────────────────────────────
const getReport = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { doc, error } = await findOwnedInterview(interviewId, req.user._id);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    if (doc.status !== "completed") {
      return res.status(400).json({
        success: false,
        message: "Report is only available after the interview has ended. Call /end first.",
      });
    }

    return res.status(200).json({ success: true, data: doc.report });
  } catch (err) {
    console.error("[getReport]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch report.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/mock/history
// Returns all previous interviews for the logged-in user, newest first.
// ─────────────────────────────────────────────────────────────────────────────
const getHistory = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [history, total] = await Promise.all([
      MockInterview.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-transcript -questions") // lighter payload for list view
        .lean(),
      MockInterview.countDocuments({ userId: req.user._id }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error("[getHistory]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch history.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/mock/:interviewId
// ─────────────────────────────────────────────────────────────────────────────
const deleteInterview = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { doc, error } = await findOwnedInterview(interviewId, req.user._id);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    await doc.deleteOne();

    return res.status(200).json({ success: true, message: "Interview deleted successfully." });
  } catch (err) {
    console.error("[deleteInterview]", err);
    return res.status(500).json({ success: false, message: "Failed to delete interview.", error: err.message });
  }
};

module.exports = {
  startInterview,
  getInterview,
  submitAnswer,
  endInterview,
  getReport,
  getHistory,
  deleteInterview,
};
