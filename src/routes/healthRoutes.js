const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    message: "AI Code Reviewer API is running",
  });
});

router.get("/health", (req, res) => {
  res.json({
    status: "ok",
  });
});

module.exports = router;
