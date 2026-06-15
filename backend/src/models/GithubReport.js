const mongoose = require("mongoose");

const githubReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    repositories: Number,
    commits: Number,
    stars: Number,
    githubScore: Number,

    skills: [String],

    strengths: [String],

    weaknesses: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("GithubReport", githubReportSchema);