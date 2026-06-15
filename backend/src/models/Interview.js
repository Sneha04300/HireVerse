const mongoose = require("mongoose");

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    interviewType: {
      type: String,
      enum: ["Technical", "HR", "Mixed"],
      default: "Technical",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Medium",
    },

    communication: Number,
    confidence: Number,
    technical: Number,
    problemSolving: Number,
    overallScore: Number,

    feedback: String,

    transcript: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Interview", interviewSchema);