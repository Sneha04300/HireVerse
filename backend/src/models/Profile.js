const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  college: String,
  branch: String,
  graduationYear: Number,
  cgpa: Number,

  skills: [String],

  github: String,
  leetcode: String,
  linkedin: String,

  targetCompany: String,
  targetRole: String,
});

module.exports = mongoose.model("Profile", profileSchema);