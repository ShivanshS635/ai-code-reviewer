const express = require("express");
const verifyGithubWebhook = require("../middleware/verifyGithubWebhook");
const { handleGithubWebhook } = require("../controllers/webhookController");

const router = express.Router();

router.post("/github", verifyGithubWebhook, handleGithubWebhook);

module.exports = router;
