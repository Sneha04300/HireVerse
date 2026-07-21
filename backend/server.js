/**
 * server.js  (or app.js — adjust to match your existing entry point)
 *
 * This file shows exactly how to plug the resume feature into your existing
 * HireVerse backend. Only add the lines marked ← ADD if you already have
 * an existing server.js.
 */

require("dotenv").config();
const express      = require("express");
const cors         = require("cors");
const path         = require("path");
const connectDB    = require("./src/config/db");
const errorHandler = require("./src/middleware/errorHandler");

// ── Import routes ─────────────────────────────────────────────────────────────
const resumeRoutes = require("./src/routes/resumeRoutes");
const dsaRoutes     = require("./src/routes/dsaRoutes");
const mockRoutes    = require("./src/routes/mockInterviewRoutes");
const copilotRoutes = require("./src/routes/copilotRoutes");
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const profileRoutes = require("./src/routes/profileRoutes");
const atsRoutes = require("./src/routes/atsRoutes");
const githubRoutes = require("./src/routes/githubRoutes");
const leetcodeRoutes = require("./src/routes/leetcodeRoutes");
const roadmapRoutes = require("./src/routes/roadmapRoutes");
const weeklyPlanRoutes = require("./src/routes/weeklyPlanRoutes");
const internshipRoutes = require("./src/routes/internshipRoutes");

const app = express();

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
const corsOrigin = process.env.CLIENT_URL || "http://localhost:5173";
const allowedOrigins = corsOrigin.split(",").map(o => o.trim());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded files statically ──────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/audio", express.static(path.join(__dirname, "public", "audio")));

// ── API Routes ────────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ats", atsRoutes);
app.use("/api/github", githubRoutes);
app.use("/api/leetcode", leetcodeRoutes);
app.use("/api/roadmap", roadmapRoutes);
app.use("/api/weekly-plan", weeklyPlanRoutes);
app.use("/api/internship", internshipRoutes);
app.use("/api/dsa", dsaRoutes);
app.use("/api/mock", mockRoutes);
app.use("/api/copilot", copilotRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 HireVerse API running on port ${PORT}`));

module.exports = app;
