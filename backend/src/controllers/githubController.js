const GithubReport = require("../models/GithubReport");

const analyzeGithub = async (req, res) => {
  try {
    const { userId } = req.body;

    const report = await GithubReport.create({
      userId,

      repositories: 15,
      commits: 480,
      stars: 42,
      githubScore: 78,

      skills: [
        "React",
        "Node.js",
        "Java",
        "TypeScript",
        "Python",
      ],

      strengths: [
        "Good project diversity",
        "Consistent commit history",
        "Clean repository naming",
      ],

      weaknesses: [
        "Weak documentation",
        "Missing tests",
        "No CI/CD configured",
      ],
    });

    res.status(201).json({
      message: "GitHub analysis generated",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getGithubReport = async (req, res) => {
  try {
    const report = await GithubReport.findOne({
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
  analyzeGithub,
  getGithubReport,
};