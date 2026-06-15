const LeetcodeReport = require("../models/LeetcodeReport");

const analyzeLeetcode = async (req, res) => {
  try {
    const { userId } = req.body;

    const report = await LeetcodeReport.create({
      userId,

      solved: 340,
      easy: 120,
      medium: 180,
      hard: 40,

      contestRating: 1580,

      strongTopics: [
        "Arrays",
        "Strings",
        "Hashing",
      ],

      weakTopics: [
        "Graphs",
        "DP",
      ],

      topicStrength: {
        arrays: 92,
        strings: 88,
        trees: 70,
        graphs: 38,
        dp: 30,
        backtracking: 55,
      },
    });

    res.status(201).json({
      message: "Leetcode analysis generated",
      report,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getLeetcodeReport = async (req, res) => {
  try {
    const report = await LeetcodeReport.findOne({
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
  analyzeLeetcode,
  getLeetcodeReport,
};