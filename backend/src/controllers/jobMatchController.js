const path = require("path");
const fs = require("fs");
const ResumeAnalysis = require("../models/ResumeAnalysis");
const { analyzeJobMatch } = require("../services/jobDescriptionService");

const jobMatchHandler = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId) {
      return res.status(400).json({ success: false, message: "resumeId is required." });
    }

    if (!jobDescription || jobDescription.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Job description is required and must be at least 10 characters.",
      });
    }

    const resumeDoc = await ResumeAnalysis.findById(resumeId);
    if (!resumeDoc) {
      return res.status(404).json({ success: false, message: "Resume not found." });
    }

    if (resumeDoc.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied." });
    }

    const filePath = path.join(__dirname, "../../", resumeDoc.fileUrl);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: "Resume file not found on disk." });
    }

    const result = await analyzeJobMatch(filePath, jobDescription);

    return res.status(200).json({
      success: true,
      message: "Job match analysis complete.",
      data: result,
    });
  } catch (err) {
    console.error("[jobMatchHandler]", err);
    return res.status(500).json({
      success: false,
      message: "Job match analysis failed.",
      error: err.message,
    });
  }
};

module.exports = { jobMatch: jobMatchHandler };
