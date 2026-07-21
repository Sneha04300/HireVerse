const ResumeAnalysis = require("../models/ResumeAnalysis");
const { rewriteResume } = require("../services/resumeRewriteService");
const path = require("path");
const fs = require("fs");

const safeDelete = (filePath) => {
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath); } catch (_) {}
};

const rewriteResumeHandler = async (req, res) => {
  let tempFilePath = null;

  try {
    const { resumeId } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        success: false,
        message: "resumeId is required.",
      });
    }

    const resumeDoc = await ResumeAnalysis.findById(resumeId);
    if (!resumeDoc) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    if (resumeDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    tempFilePath = path.join(__dirname, "../../", resumeDoc.fileUrl);

    if (!fs.existsSync(tempFilePath)) {
      return res.status(404).json({ success: false, message: "Resume file not found on disk." });
    }

    const result = await rewriteResume(tempFilePath);

    return res.status(200).json({
      success: true,
      message: "Resume rewritten successfully.",
      data: result,
    });
  } catch (err) {
    console.error("[rewriteResumeHandler]", err);
    return res.status(500).json({
      success: false,
      message: "Resume rewrite failed.",
      error: err.message,
    });
  }
};

module.exports = { rewriteResume: rewriteResumeHandler };
