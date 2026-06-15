const mongoose = require("mongoose");

const dsaProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemsSolved: Number,

    streak: Number,

    dailyAverage: Number,

    topicProgress: {
      arrays: Number,
      strings: Number,
      hashing: Number,
      trees: Number,
      graphs: Number,
      dp: Number,
    },

    suggestedProblems: [String],

    aiInsight: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "DSAProgress",
  dsaProgressSchema
);