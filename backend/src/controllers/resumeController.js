/**
 * resumeController.js
 * Handles HTTP layer — validates input, delegates to service, returns responses.
 */

const path           = require("path");
const fs             = require("fs");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const resumeService  = require("../services/resumeService");

// Helper to safely delete files without throwing errors if they don't exist
const safeDelete = (filePath) => {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
};

// POST /api/resume/upload
// Upload a resume file and store its metadata (no analysis yet).

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded." });
    }

    const { filename, path: filePath, size, mimetype } = req.file;

    // Build a URL path the frontend can reference
    const fileUrl = `/uploads/${filename}`;

    const doc = await ResumeAnalysis.create({
      userId:   req.user._id,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: size,
      mimeType: mimetype,
      status:   "pending",
    });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully.",
      data: {
        resumeId: doc._id,
        fileName: doc.fileName,
        fileUrl:  doc.fileUrl,
        status:   doc.status,
      },
    });
  } catch (err) {
    console.error("[uploadResume]", err);
    return res.status(500).json({ success: false, message: "Upload failed.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/resume/analyze
// Body: { resumeId }  — analyzes an already-uploaded resume.
// OR accepts a fresh file upload (multipart) and analyzes inline.
// ─────────────────────────────────────────────────────────────────────────────
const analyzeResume = async (req, res) => {
  let tempFilePath = null;

  try {
    let resumeDoc;

    // ── Case A: file uploaded directly with this request ────────────────────
    if (req.file) {
      tempFilePath = req.file.path;
      const fileUrl = `/uploads/${req.file.filename}`;

      resumeDoc = await ResumeAnalysis.create({
        userId:   req.user._id,
        fileName: req.file.originalname,
        fileUrl,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        status:   "pending",
      });
    }

    // ── Case B: reference an already-uploaded resume by ID ──────────────────
    else if (req.body.resumeId) {
      resumeDoc = await ResumeAnalysis.findById(req.body.resumeId);
      if (!resumeDoc) {
        return res.status(404).json({ success: false, message: "Resume not found." });
      }
      if (resumeDoc.userId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: "Access denied." });
      }
      // Resolve disk path from stored URL
      tempFilePath = path.join(__dirname, "../../", resumeDoc.fileUrl);
    }

    else {
      return res.status(400).json({
        success: false,
        message: "Provide either a file upload or a resumeId.",
      });
    }

    // ── Run AI-powered analysis ──────────────────────────────────────────────
    const result = await resumeService.analyzeResumeWithAI(tempFilePath);

    // ── Persist results (store raw numbers in DB, return enriched format) ─────
    resumeDoc.atsScore        = result.atsScore;
    resumeDoc.sectionScores   = result.sectionScoresRaw;
    resumeDoc.strengths       = result.strengths;
    resumeDoc.weaknesses      = result.weaknesses;
    resumeDoc.suggestions     = result.suggestions;
    resumeDoc.missingKeywords = result.missingKeywords;
    resumeDoc.extractedData   = result.extractedData;
    resumeDoc.status          = "analyzed";
    await resumeDoc.save();

    return res.status(200).json({
      success: true,
      message: "Resume analyzed successfully.",
      data: {
        resumeId:        resumeDoc._id,
        fileName:        resumeDoc.fileName,
        atsScore:        result.atsScore,
        sectionScores:   result.sectionScores,
        strengths:       result.strengths,
        weaknesses:      result.weaknesses,
        suggestions:     result.suggestions,
        missingKeywords: result.missingKeywords,
        extractedData:   result.extractedData,
        resumeRank:      result.resumeRank,
        topPercentile:   result.topPercentile,
        analyzedAt:      resumeDoc.updatedAt,
      },
    });
  } catch (err) {
    console.error("[analyzeResume]", err);

    // Mark as failed if doc was created
    if (req.body?.resumeId) {
      await ResumeAnalysis.findByIdAndUpdate(req.body.resumeId, {
        status: "failed",
        errorMessage: err.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Analysis failed.",
      error: err.message,
    });
  }
};


// GET /api/resume/history/:userId
// Returns all resume analyses for a user, newest first.

const getResumeHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only access their own history (or admin can access all)
    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip  = (page - 1) * limit;

    const [history, total] = await Promise.all([
      ResumeAnalysis.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-extractedData")      // lighter payload for list view
        .lean(),
      ResumeAnalysis.countDocuments({ userId }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        history,
        pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    console.error("[getResumeHistory]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch history.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/resume/latest/:userId
// Returns the most recent analyzed resume for a user.
// ─────────────────────────────────────────────────────────────────────────────
const getLatestResume = async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user._id.toString() !== userId && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const latest = await ResumeAnalysis.findOne({ userId, status: "analyzed" })
      .sort({ createdAt: -1 })
      .lean();

    if (!latest) {
      return res.status(404).json({ success: false, message: "No analyzed resume found." });
    }

    return res.status(200).json({ success: true, data: latest });
  } catch (err) {
    console.error("[getLatestResume]", err);
    return res.status(500).json({ success: false, message: "Failed to fetch latest resume.", error: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/resume/:id
// Deletes a resume analysis and its file from disk.
// ─────────────────────────────────────────────────────────────────────────────
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = await ResumeAnalysis.findById(id);
    if (!doc) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    if (doc.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    // Delete file from disk
    const filePath = path.join(__dirname, "../../", doc.fileUrl);
    safeDelete(filePath);

    await doc.deleteOne();

    return res.status(200).json({ success: true, message: "Resume deleted successfully." });
  } catch (err) {
    console.error("[deleteResume]", err);
    return res.status(500).json({ success: false, message: "Failed to delete resume.", error: err.message });
  }
};

module.exports = {
  uploadResume,
  analyzeResume,
  getResumeHistory,
  getLatestResume,
  deleteResume,
};
