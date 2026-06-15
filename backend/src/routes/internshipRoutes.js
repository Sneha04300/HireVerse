const express = require("express");

const {
seedInternships,
getInternships
} = require("../controllers/internshipController");

const router = express.Router();

router.post("/seed",seedInternships);

router.get("/:userId",getInternships);

module.exports = router;