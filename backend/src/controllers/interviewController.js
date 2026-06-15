const Interview = require("../models/Interview");

const startInterview = async (req, res) => {
  try {
    const { userId, interviewType, difficulty } = req.body;

    const interview = await Interview.create({
      userId,
      interviewType,
      difficulty,

      communication: 72,
      confidence: 81,
      technical: 79,
      problemSolving: 80,

      overallScore: 78,

      feedback:
        "Speak more confidently in the first 30 seconds. Improve project explanations with measurable impact.",

      transcript:
        "Hi, I am Sneha, a CSE student passionate about full-stack development...",
    });

    res.status(201).json({
      message: "Interview started",
      interview,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getInterviewReport = async (req, res) => {
  try {
    const report = await Interview.findOne({
      userId: req.params.userId,
    });

    if (!report) {
      return res.status(404).json({
        message: "Interview report not found",
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
  startInterview,
  getInterviewReport,
};