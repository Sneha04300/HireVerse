const Resume = require("../models/Resume");


// Upload Resume
const uploadResume = async (req, res) => {
  try {
    const { userId, resumeUrl } = req.body;

    const resume = await Resume.create({
      userId,
      resumeUrl,
      score: Math.floor(Math.random() * 30) + 70, // dummy ATS score
    });

    res.status(201).json({
      message: "Resume uploaded successfully",
      resume,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


// Get Resume
const getResume = async (req, res) => {
  try {
    const { userId } = req.params;

    const resume = await Resume.findOne({ userId });

    if (!resume) {
      return res.status(404).json({
        message: "Resume not found",
      });
    }

    res.status(200).json(resume);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  uploadResume,
  getResume,
};