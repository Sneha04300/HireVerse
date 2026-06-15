const express = require("express");

const {
  startInterview,
  getInterviewReport,
} = require("../controllers/interviewController");

const router = express.Router();

router.post("/start", startInterview);

router.get("/:userId", getInterviewReport);

module.exports = router;