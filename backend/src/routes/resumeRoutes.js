const express = require("express");

const {
  uploadResume,
  getResume,
} = require("../controllers/resumeController");

const router = express.Router();

router.post("/upload", uploadResume);

router.get("/:userId", getResume);

module.exports = router;