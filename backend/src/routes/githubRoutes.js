const express = require("express");

const {
  analyzeGithub,
  getGithubReport,
} = require("../controllers/githubController");

const router = express.Router();

router.post("/analyze", analyzeGithub);

router.get("/:userId", getGithubReport);

module.exports = router;