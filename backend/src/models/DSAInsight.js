const mongoose = require("mongoose");

const dsaInsightSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    summary: { type: String, default: "" },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: [
      {
        title: { type: String, default: "" },
        reason: { type: String, default: "" },
        impact: { type: String, default: "" },
        priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
      },
    ],
    weeklyPlan: [
      {
        day: { type: String, default: "" },
        task: { type: String, default: "" },
      },
    ],
    estimatedReadinessIncrease: { type: String, default: "" },
    interviewPrediction: { type: String, default: "" },
    motivationalTip: { type: String, default: "" },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DSAInsight", dsaInsightSchema);
