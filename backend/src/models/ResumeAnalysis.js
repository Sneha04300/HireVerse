const mongoose = require("mongoose");

const extractedDataSchema = new mongoose.Schema(
  {
    name:       { type: String, default: "" },
    email:      { type: String, default: "" },
    phone:      { type: String, default: "" },
    linkedin:   { type: String, default: "" },
    github:     { type: String, default: "" },
    skills:     { type: [String], default: [] },
    education:  [
      {
        institution: String,
        degree:      String,
        year:        String,
        cgpa:        String,
      },
    ],
    experience: [
      {
        company:     String,
        role:        String,
        duration:    String,
        description: [String],
      },
    ],
    projects: [
      {
        title:       String,
        description: String,
        tech:        [String],
        link:        String,
      },
    ],
    certifications: [String],
  },
  { _id: false }
);

const sectionScoreSchema = new mongoose.Schema(
  {
    formatting:  { type: Number, default: 0 },
    keywords:    { type: Number, default: 0 },
    experience:  { type: Number, default: 0 },
    skills:      { type: Number, default: 0 },
    projects:    { type: Number, default: 0 },
    education:   { type: Number, default: 0 },
  },
  { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    userId: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      "User",
      required: true,
      index:    true,
    },
    fileName: { type: String, required: true },
    fileUrl:  { type: String, required: true },
    fileSize: { type: Number },                     // bytes
    mimeType: { type: String, default: "application/pdf" },

    atsScore:        { type: Number, min: 0, max: 100, default: 0 },
    sectionScores:   { type: sectionScoreSchema, default: () => ({}) },

    strengths:       { type: [String], default: [] },
    weaknesses:      { type: [String], default: [] },
    suggestions:     { type: [String], default: [] },
    missingKeywords: { type: [String], default: [] },

    extractedData:   { type: extractedDataSchema, default: () => ({}) },

    status: {
      type:    String,
      enum:    ["pending", "analyzed", "failed"],
      default: "pending",
    },
    errorMessage: { type: String },
  },
  {
    timestamps: true,               // createdAt + updatedAt
    versionKey: false,
  }
);

// Always return newest first
resumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("ResumeAnalysis", resumeAnalysisSchema);
