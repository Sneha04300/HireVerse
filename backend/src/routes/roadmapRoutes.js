const express = require("express");

const {
createRoadmap,
getRoadmap
} = require("../controllers/roadmapController");

const router = express.Router();

router.post("/create",createRoadmap);

router.get("/:userId",getRoadmap);

module.exports = router;