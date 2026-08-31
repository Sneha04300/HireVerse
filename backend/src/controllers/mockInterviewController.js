const fs = require("fs");
const MockInterview = require("../models/MockInterview");
const mockInterviewService = require("../services/mockInterviewService");
const groqService = require("../services/groqService");
const whisperService = require("../services/whisperService");
const piperService = require("../services/piperService");
const { QUESTIONS_PER_INTERVIEW } = mockInterviewService;

const findOwnedInterview = async (interviewId, userId) => {
  const doc = await MockInterview.findById(interviewId);
  if (!doc) return { doc: null, error: { status: 404, message: "Interview not found." } };
  if (doc.userId.toString() !== userId.toString()) {
    return { doc: null, error: { status: 403, message: "Access denied." } };
  }
  return { doc, error: null };
};

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
    const question = doc.questions[0].question;

    console.log("[Interview] Question Generated");

    let audioUrl = null;
    try {
      const speechResult = await piperService.generateSpeech(question);
      audioUrl = speechResult.url;
      console.log("[Interview] Speech Generated");
    } catch (piperErr) {
      console.error("[Piper] Error:", piperErr.message);
    }

    return res.status(201).json({
      success: true,
      message: "Interview started successfully.",
      data: {
        interviewId: doc._id,
        question,
        questionNumber: 1,
        audioUrl,
      },
    });
  } catch (err) {
    console.error("[Groq] Error:", err.message);
    return res.status(500).json({ success: false, message: "Failed to start interview.", error: err.message });
  }
};

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
        interviewId: doc._id,
        type: doc.type,
        difficulty: doc.difficulty,
        status: doc.status,
        currentQuestion: doc.currentQuestionIndex < doc.questions.length
          ? doc.questions[doc.currentQuestionIndex].question
          : null,
        currentQuestionIndex: doc.currentQuestionIndex,
        totalQuestions: QUESTIONS_PER_INTERVIEW,
        transcript: doc.transcript,
        elapsed,
        report: doc.status === "completed" ? doc.report : null,
      },
    });
  } catch (err) {
    console.error("[getInterview]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch interview.", error: err.message });
  }
};

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

    const { doc: updated, nextQuestion, nextQuestionNumber, report, questionGenerationFailed } = await mockInterviewService.submitAnswer(doc, answer);

    let audioUrl = null;
    if (nextQuestion) {
      try {
        const speechResult = await piperService.generateSpeech(nextQuestion);
        audioUrl = speechResult.url;
        console.log("[Interview] Next question speech generated");
      } catch (piperErr) {
        console.error("[Piper] Error generating next question speech:", piperErr.message);
      }
    }

    if (questionGenerationFailed) {
      return res.status(200).json({
        success: true,
        message: "Answer submitted, but the next question could not be generated. Please try again.",
        data: {
          interviewId: updated._id,
          status: updated.status,
          nextQuestion: null,
          nextQuestionNumber: null,
          audioUrl: null,
          report: null,
          questionGenerationFailed: true,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Answer submitted successfully.",
      data: {
        interviewId: updated._id,
        status: updated.status,
        nextQuestion,
        nextQuestionNumber,
        audioUrl,
        report,
      },
    });
  } catch (err) {
    console.error("[submitAnswer]", err);
    return res.status(500).json({ success: false, message: "Failed to submit answer.", error: err.message });
  }
};

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
        status: updated.status,
        duration: updated.duration,
        report: updated.report,
      },
    });
  } catch (err) {
    console.error("[endInterview]", err);
    return res.status(500).json({ success: false, message: "Failed to end interview.", error: err.message });
  }
};

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

const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [history, total] = await Promise.all([
      MockInterview.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-transcript -questions")
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

const transcribeAudio = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Audio file is required." });
    }

    console.log("[Whisper] Audio uploaded");
    console.log("[transcribeAudio] req.file:", {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
    });

    const transcript = await whisperService.transcribeAudio(req.file.path);

    fs.unlink(req.file.path, (err) => {
      if (err) console.error("[transcribeAudio] Failed to delete temp file:", err.message);
    });

    console.log("[Whisper] Transcript received");

    return res.status(200).json({ success: true, transcript });
  } catch (err) {
    console.error("[transcribeAudio]", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Unable to transcribe audio.",
    });
  }
};

const speakQuestion = async (req, res) => {
  try {
    const { interviewId } = req.params;
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "text is required." });
    }

    const { doc, error } = await findOwnedInterview(interviewId, req.user._id);
    if (error) return res.status(error.status).json({ success: false, message: error.message });

    const result = await piperService.speak(text);

    return res.status(200).json({
      success: true,
      data: {
        url: result.url,
        filename: result.filename,
      },
    });
  } catch (err) {
    console.error("[speakQuestion]", err);
    return res.status(500).json({ success: false, message: "Failed to generate speech.", error: err.message });
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
  transcribeAudio,
  speakQuestion,
};
