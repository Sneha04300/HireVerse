const mongoose = require("mongoose");

// ── Enums ─────────────────────────────────────────────────────────────────────
const INTERVIEW_TYPES      = ["Technical", "HR", "Mixed"];
const DIFFICULTY_LEVELS    = ["Easy", "Medium", "Hard"];
const INTERVIEW_STATUSES   = ["started", "in_progress", "completed", "abandoned"];
const TRANSCRIPT_SPEAKERS  = ["AI", "User"];
const VERDICTS = ["Strong Hire", "Likely Shortlist", "Average Candidate", "Needs Improvement"];

// ── Sub-schema: one question + the user's answer + its score ────────────────
const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer:   { type: String, default: "" },
    score:    { type: Number, min: 0, max: 100, default: null },
  },
  { _id: false }
);

// ── Sub-schema: one transcript line ──────────────────────────────────────────
const transcriptLineSchema = new mongoose.Schema(
  {
    speaker:   { type: String, enum: TRANSCRIPT_SPEAKERS, required: true },
    text:      { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ── Sub-schema: final report ─────────────────────────────────────────────────
const reportSchema = new mongoose.Schema(
  {
    overallScore:   { type: Number, min: 0, max: 100, default: null },
    communication:  { type: Number, min: 0, max: 100, default: null },
    confidence:     { type: Number, min: 0, max: 100, default: null },
    technical:      { type: Number, min: 0, max: 100, default: null },
    problemSolving: { type: Number, min: 0, max: 100, default: null },
    feedback:       { type: [String], default: [] },
    verdict:        { type: String, enum: VERDICTS, default: null },
  },
  { _id: false }
);

// ── Main schema ───────────────────────────────────────────────────────────────
const mockInterviewSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },

    type:       { type: String, enum: INTERVIEW_TYPES,   required: true },
    difficulty: { type: String, enum: DIFFICULTY_LEVELS, required: true },
    status:     { type: String, enum: INTERVIEW_STATUSES, default: "started" },

    startedAt: { type: Date, default: Date.now },
    endedAt:   { type: Date, default: null },
    duration:  { type: Number, default: 0 }, // seconds

    currentQuestionIndex: { type: Number, default: 0 },

    questions:  { type: [questionSchema],       default: [] },
    transcript: { type: [transcriptLineSchema], default: [] },
    report:     { type: reportSchema,           default: () => ({}) },
  },
  {
    timestamps: true, // createdAt + updatedAt
    versionKey: false,
  }
);

mockInterviewSchema.index({ userId: 1, createdAt: -1 });

mockInterviewSchema.statics.INTERVIEW_TYPES   = INTERVIEW_TYPES;
mockInterviewSchema.statics.DIFFICULTY_LEVELS = DIFFICULTY_LEVELS;
mockInterviewSchema.statics.VERDICTS          = VERDICTS;

module.exports = mongoose.model("MockInterview", mockInterviewSchema);
