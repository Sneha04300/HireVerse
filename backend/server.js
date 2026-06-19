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
// ... your existing route imports ...
const resumeRoutes = require("./src/routes/resumeRoutes"); // ← ADD
const dsaRoutes     = require("./src/routes/dsaRoutes");    // ← ADD
const mockRoutes    = require("./src/routes/mockInterviewRoutes"); // ← ADD

const app = express();

// ── Connect DB ────────────────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Serve uploaded files statically ──────────────────────────────────────────
// ← ADD — allows frontend to load resume files via /uploads/filename.pdf
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── API Routes ────────────────────────────────────────────────────────────────
// ... your existing routes ...
app.use("/api/resume", resumeRoutes); // ← ADD
app.use("/api/dsa", dsaRoutes);       // ← ADD
app.use("/api/mock", mockRoutes);     // ← ADD

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => res.json({ status: "ok", timestamp: new Date() }));

// ── Global error handler (must be last) ──────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 HireVerse API running on port ${PORT}`));

module.exports = app;
