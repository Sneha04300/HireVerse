const mongoose = require("mongoose");

// ── Sub-schema: one chat turn ─────────────────────────────────────────────────
const chatMessageSchema = new mongoose.Schema(
  {
    role:      { type: String, enum: ["user", "assistant"], required: true },
    message:   { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Sub-schema: readiness snapshot ───────────────────────────────────────────
const readinessSchema = new mongoose.Schema(
  {
    overallScore:    { type: Number, min: 0, max: 100, default: 0 },
    companyTarget:   { type: String, default: "" },
    estimatedMonths: { type: Number, default: 0 },
  },
  { _id: false }
);

// ── Sub-schema: one focus area + its progress ────────────────────────────────
const focusAreaSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    progress: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false }
);

// ── Sub-schema: one weekly checklist goal ────────────────────────────────────
const weeklyGoalSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  completed: { type: Boolean, default: false },
});

// ── Sub-schema: one week of an action plan ───────────────────────────────────
const actionPlanItemSchema = new mongoose.Schema(
  {
    week:        { type: Number, required: true },
    title:       { type: String, required: true },
    description: { type: String, default: "" },
    status: {
      type:    String,
      enum:    ["done", "current", "upcoming"],
      default: "upcoming",
    },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const careerCopilotSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      unique:   true, // one copilot profile per user
      index:    true,
    },

    chatHistory: { type: [chatMessageSchema], default: [] },

    readiness: {
      type:    readinessSchema,
      default: () => ({ overallScore: 0, companyTarget: "", estimatedMonths: 0 }),
    },

    focusAreas: { type: [focusAreaSchema], default: [] },

    weeklyGoals: { type: [weeklyGoalSchema], default: [] },

    insights: { type: [String], default: [] },

    actionPlan: { type: [actionPlanItemSchema], default: [] },
  },
  {
    timestamps: true, // createdAt + updatedAt
    versionKey: false,
  }
);

module.exports = mongoose.model("CareerCopilot", careerCopilotSchema);
