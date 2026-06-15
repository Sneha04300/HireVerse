const express = require("express");
const app = express();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const profileRoutes = require("./routes/profileRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const atsRoutes = require("./routes/atsRoutes");
const githubRoutes = require("./routes/githubRoutes");
const leetcodeRoutes = require("./routes/leetcodeRoutes");
const dsaRoutes = require("./routes/dsaRoutes");
const interviewRoutes = require("./routes/interviewRoutes");
const roadmapRoutes = require("./routes/roadmapRoutes");
const weeklyPlanRoutes = require("./routes/weeklyPlanRoutes");
const internshipRoutes = require("./routes/internshipRoutes");


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/interview", interviewRoutes);
app.use("/api/roadmap",roadmapRoutes);
app.use("/api/weekly-plan",weeklyPlanRoutes);
app.use("/api/internship", internshipRoutes);



app.get("/", (req, res) => {
  res.send("HireVerse API Running");
});

module.exports = app;
