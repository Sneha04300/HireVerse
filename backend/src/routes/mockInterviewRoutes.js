const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");

const uploadsDir = path.join(__dirname, "..", "uploads");
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".webm";
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

const {
  startInterview,
  getInterview,
  submitAnswer,
  endInterview,
  getReport,
  getHistory,
  deleteInterview,
  transcribeAudio,
  speakQuestion,
} = require("../controllers/mockInterviewController");

router.post("/start", protect, startInterview);
router.get("/history", protect, getHistory);
router.post("/transcribe", protect, upload.single("audio"), transcribeAudio);
router.post("/:interviewId/speak", protect, speakQuestion);
router.get("/:interviewId", protect, getInterview);
router.post("/:interviewId/answer", protect, submitAnswer);
router.post("/:interviewId/end", protect, endInterview);
router.get("/:interviewId/report", protect, getReport);
router.delete("/:interviewId", protect, deleteInterview);

module.exports = router;
