const { processingCommits, reviewedCommits } = require("../state/reviewState");
const { processPullRequest } = require("../services/pullRequestReviewService");

function handleGithubWebhook(req, res) {
  const event = req.headers["x-github-event"];

  console.log("\n==============================");
  console.log("GitHub Event:", event);
  console.log("==============================");

  if (event !== "pull_request") {
    return res.status(200).json({
      message: `Ignored event: ${event}`,
    });
  }

  const payload = req.body;
  const action = payload.action;

  if (action !== "opened" && action !== "synchronize") {
    return res.status(200).json({
      message: `Ignored pull_request action: ${action}`,
    });
  }

  const commitSha = payload.pull_request?.head?.sha;

  if (!commitSha) {
    return res.status(400).json({
      error: "Missing pull request commit SHA",
    });
  }

  if (reviewedCommits.has(commitSha)) {
    console.log(`Commit ${commitSha} already reviewed. Skipping.`);

    return res.status(200).json({
      message: "Commit already reviewed",
    });
  }

  if (processingCommits.has(commitSha)) {
    console.log(`Commit ${commitSha} is already being processed.`);

    return res.status(200).json({
      message: "Commit is already being processed",
    });
  }

  processingCommits.add(commitSha);

  res.status(200).json({
    message: "Webhook received",
  });

  processPullRequest(payload, commitSha)
    .catch((error) => {
      console.error(
        "Failed to review pull request:",
        error.message,
      );
    })
    .finally(() => {
      processingCommits.delete(commitSha);
    });
}

module.exports = { handleGithubWebhook };
