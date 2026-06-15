const DSAProgress = require("../models/DSAProgress");

const updateDSA = async (req, res) => {
  try {
    const { userId } = req.body;

    const progress = await DSAProgress.create({
      userId,

      problemsSolved: 320,

      streak: 28,

      dailyAverage: 3.4,

      topicProgress: {
        arrays: 90,
        strings: 85,
        hashing: 78,
        trees: 60,
        graphs: 40,
        dp: 25,
      },

      aiInsight:
        "Your weakest topic is Dynamic Programming. Solving 5 medium DP problems can improve your score significantly.",

      suggestedProblems: [
        "Coin Change",
        "House Robber II",
        "Longest Increasing Subsequence",
        "Edit Distance",
        "Partition Equal Subset Sum",
      ],
    });

    res.status(201).json({
      message: "DSA Progress Generated",
      progress,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

const getDSA = async (req, res) => {
  try {
    const progress = await DSAProgress.findOne({
      userId: req.params.userId,
    });

    if (!progress) {
      return res.status(404).json({
        message: "DSA progress not found",
      });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

module.exports = {
  updateDSA,
  getDSA,
};