const ATSReport = require("../models/ATSReport");

const generateATS = async (req, res) => {
  try {
    const { userId } = req.body;

    const score = Math.floor(Math.random() * 30) + 70;

    const report = await ATSReport.create({
      userId,
      score,
      strengths: [
        "Good project section",
        "Strong skills section",
        "Clean formatting",
      ],
      weaknesses: [
        "Missing achievements",
        "Missing keywords",
        "No certifications",
      ],
    });

    res.status(201).json({
      message: "ATS report generated",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getATSReport = async (req, res) => {
  try {
    const report = await ATSReport.findOne({
      userId: req.params.userId,
    });

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  generateATS,
  getATSReport,
};