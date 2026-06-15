const express = require("express");

const {
  analyzeLeetcode,
  getLeetcodeReport,
} = require("../controllers/leetcodeController");

const router = express.Router();

router.post("/analyze", analyzeLeetcode);

router.get("/:userId", getLeetcodeReport);

module.exports = router;