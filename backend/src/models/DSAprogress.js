const mongoose = require("mongoose");

const dsaProblemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Problem title is required."],
      trim: true,
    },
    platform: {
      type: String,
      enum: ["LeetCode", "GFG", "CodeStudio", "HackerRank", "Other"],
      default: "LeetCode",
    },
    problemUrl: {
      type: String,
      default: "",
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      required: [true, "Difficulty is required."],
    },
    topic: {
      type: [String],
      default: [],
    },
    companies: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ["Solved", "Attempted", "Revising"],
      default: "Solved",
    },
    timeTaken: {
      type: Number,
      default: 0,
      min: 0,
    },
    attempts: {
      type: Number,
      default: 1,
      min: 1,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    bookmarked: {
      type: Boolean,
      default: false,
    },
    revisionCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    solvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

dsaProblemSchema.index({ userId: 1, title: 1 });
dsaProblemSchema.index({ userId: 1, status: 1 });
dsaProblemSchema.index({ userId: 1, difficulty: 1 });

module.exports = mongoose.model("DSAProgress", dsaProblemSchema);
