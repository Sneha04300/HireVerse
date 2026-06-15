const mongoose = require("mongoose");

const resumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  score: Number,

  strengths: [String],

  weaknesses: [String],

  suggestions: [String],
});

module.exports = mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);