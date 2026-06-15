const express = require("express");

const {
  updateDSA,
  getDSA,
} = require("../controllers/dsaController");

const router = express.Router();

router.post("/update", updateDSA);

router.get("/:userId", getDSA);

module.exports = router;