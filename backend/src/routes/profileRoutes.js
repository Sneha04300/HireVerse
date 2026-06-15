const express = require("express");

const {
  createProfile,
  getProfile,
} = require("../controllers/profileController");

const router = express.Router();

router.post("/", createProfile);

router.get("/:userId", getProfile);

module.exports = router;