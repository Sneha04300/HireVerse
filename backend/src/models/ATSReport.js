const mongoose = require("mongoose");

const atsReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    score: {
      type: Number,
      required: true,
    },

    strengths: [String],

    weaknesses: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ATSReport", atsReportSchema);