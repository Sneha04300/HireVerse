const express = require('express');
const app = express();

app.use(express.json());

const authRoutes = require("./routes/authRoutes");

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("HireVerse API Running");
});

module.exports = app;
