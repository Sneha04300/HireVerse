const express = require("express");

const {
createWeeklyPlan,
getWeeklyPlan
} = require("../controllers/weeklyPlanController");

const router = express.Router();

router.post("/create",createWeeklyPlan);

router.get("/:userId",getWeeklyPlan);

module.exports = router;