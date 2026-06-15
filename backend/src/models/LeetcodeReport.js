const mongoose = require("mongoose");

const leetcodeReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    solved: Number,
    easy: Number,
    medium: Number,
    hard: Number,

    contestRating: Number,

    strongTopics: [String],
    weakTopics: [String],

    topicStrength: {
      arrays: Number,
      strings: Number,
      trees: Number,
      graphs: Number,
      dp: Number,
      backtracking: Number,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "LeetcodeReport",
  leetcodeReportSchema
);