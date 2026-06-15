const express = require("express");

const router = express.Router();

const { addXP } = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.post("/add-xp", protect, addXP);

module.exports = router;