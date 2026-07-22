const mongoose = require("mongoose");

const badgeSchema = new mongoose.Schema({
  name: String,
  icon: String,
}, { _id: false });

const contestSchema = new mongoose.Schema({
  title: String,
  rating: Number,
  rank: Number,
  date: String,
}, { _id: false });

const leetCodeProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
    index: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
  },
  avatar: { type: String, default: "" },
  problemsSolved: { type: Number, default: 0 },
  easySolved: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  totalEasy: { type: Number, default: 0 },
  totalMedium: { type: Number, default: 0 },
  totalHard: { type: Number, default: 0 },
  acceptanceRate: { type: Number, default: 0 },
  ranking: { type: Number, default: 0 },
  contestRating: { type: Number, default: 0 },
  attendedContestsCount: { type: Number, default: 0 },
  badges: { type: [badgeSchema], default: [] },
  submissionHeatmap: { type: [[Number]], default: [] },
  recentContests: { type: [contestSchema], default: [] },
  lastSync: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("LeetCodeProfile", leetCodeProfileSchema);
