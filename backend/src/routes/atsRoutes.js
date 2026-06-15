const express = require("express");

const {
  generateATS,
  getATSReport,
} = require("../controllers/atsController");

const router = express.Router();

router.post("/check", generateATS);

router.get("/:userId", getATSReport);

module.exports = router;