const crypto = require("crypto");

function verifyGithubWebhook(req, res, next) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret) {
    console.error("GITHUB_WEBHOOK_SECRET is not configured.");

    return res.status(500).json({
      error: "Webhook secret is not configured",
    });
  }

  if (!req.rawBody) {
    return res.status(400).json({
      error: "Missing raw request body",
    });
  }

  const signature = req.headers["x-hub-signature-256"];
  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

  const received = Buffer.from(signature || "", "utf8");
  const expected = Buffer.from(expectedSignature, "utf8");

  if (
    !signature ||
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return res.status(401).json({
      error: "Invalid webhook signature",
    });
  }

  next();
}

module.exports = verifyGithubWebhook;
