const {
  getPullRequestFiles,
  postInlineComment,
  postPullRequestReview,
} = require("./githubService");
const { reviewCode } = require("./aiReviewService");
const { reviewedCommits } = require("../state/reviewState");
const { isLineInDiff } = require("../utils/isLineInDiff");

async function processPullRequest(payload, commitSha) {
  const pr = payload.pull_request;
  const repository = payload.repository;

  const owner = repository.owner.login;
  const repo = repository.name;

  console.log("\n==============================");
  console.log("Processing Pull Request");
  console.log("==============================");
  console.log("Repository:", repository.full_name);
  console.log("PR Number:", pr.number);
  console.log("PR Title:", pr.title);
  console.log("PR URL:", pr.html_url);
  console.log("Commit:", commitSha);

  const files = await getPullRequestFiles(
    owner,
    repo,
    pr.number,
  );

  console.log("Changed files:", files.length);

  const allFindings = [];
  const summaries = [];

  for (const file of files) {
    console.log("------------------------------");
    console.log("File:", file.filename);
    console.log("Status:", file.status);
    console.log("Changes:", file.changes);

    if (!file.patch) {
      console.log("No patch available. Skipping AI review.");
      continue;
    }

    console.log("Patch:");
    console.log(file.patch);

    const review = await reviewCode(
      file.patch,
      file.filename,
    );

    console.log("AI REVIEW:");
    console.log(JSON.stringify(review, null, 2));

    summaries.push(
      `**${file.filename}:** ${review.summary}`,
    );

    for (const finding of review.findings) {
      if (
        !finding ||
        !Number.isInteger(finding.line) ||
        typeof finding.issue !== "string" ||
        typeof finding.suggestion !== "string"
      ) {
        console.log("Skipping malformed AI finding.");
        continue;
      }

      if (!isLineInDiff(file.patch, finding.line)) {
        console.log(
          `Skipping finding on ${file.filename}:${finding.line} — line is not an added line in the diff.`,
        );

        continue;
      }

      allFindings.push({
        severity: ["high", "medium", "low"].includes(
          finding.severity,
        )
          ? finding.severity
          : "medium",
        file: file.filename,
        line: finding.line,
        issue: finding.issue,
        suggestion: finding.suggestion,
      });
    }
  }

  const summaryText =
    summaries.length > 0
      ? summaries.join("\n\n")
      : "No reviewable file changes were available.";

  const reviewBody = `
## 🤖 AI Code Review

${summaryText}

${
  allFindings.length > 0
    ? `Found ${allFindings.length} actionable issue(s). See the inline comments on the changed lines.`
    : "No actionable issues found."
}
`;

  await postPullRequestReview(
    owner,
    repo,
    pr.number,
    reviewBody,
  );

  console.log("General review posted.");

  for (const finding of allFindings) {
    const commentBody = `🤖 **AI Code Review — ${finding.severity.toUpperCase()}**

${finding.issue}

**Suggestion:** ${finding.suggestion}`;

    try {
      await postInlineComment(
        owner,
        repo,
        pr.number,
        commitSha,
        commentBody,
        finding.file,
        finding.line,
      );

      console.log(
        `Inline comment posted: ${finding.file}:${finding.line}`,
      );
    } catch (error) {
      console.error(
        `Failed to post inline comment on ${finding.file}:${finding.line}:`,
        error.message,
      );
    }
  }

  reviewedCommits.add(commitSha);

  console.log("Review completed for commit:", commitSha);
}

module.exports = { processPullRequest };
