/**
 * resumeRoutes.js
 * All routes are protected by the existing JWT middleware.
 *
 * Mount in app.js / server.js:
 *   const resumeRoutes = require("./routes/resumeRoutes");
 *   app.use("/api/resume", resumeRoutes);
 */

const express    = require("express");
const router     = express.Router();
const { upload } = require("../config/multerConfig");
const { protect } = require("../middleware/authMiddleware"); // your existing JWT middleware
const {
  uploadResume,
  analyzeResume,
  getResumeHistory,
  getLatestResume,
  deleteResume,
} = require("../controllers/resumeController");

// ── Multer error handler wrapper ─────────────────────────────────────────────
const multerUpload = (field) => (req, res, next) => {
  upload.single(field)(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

// ── Routes ────────────────────────────────────────────────────────────────────

// POST /api/resume/upload  — upload file, save metadata, no analysis
router.post("/upload", protect, multerUpload("resume"), uploadResume);

// POST /api/resume/analyze — upload + analyze in one step (OR body: { resumeId })
router.post("/analyze", protect, multerUpload("resume"), analyzeResume);

// GET  /api/resume/history/:userId — paginated history list
router.get("/history/:userId", protect, getResumeHistory);

// GET  /api/resume/latest/:userId  — single latest analyzed resume
router.get("/latest/:userId", protect, getLatestResume);

// DELETE /api/resume/:id — delete analysis + file
router.delete("/:id", protect, deleteResume);

module.exports = router;
