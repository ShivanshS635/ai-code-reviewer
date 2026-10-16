const API_BASE_URL = "https://api.github.com";

async function requestGithubApi(path, options, errorPrefix) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`${errorPrefix}: ${response.status} ${errorText}`);
  }

  return response.json();
}

async function getPullRequestFiles(owner, repo, pullNumber) {
  return requestGithubApi(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/files`,
    {},
    "GitHub API error",
  );
}

async function postPullRequestReview(owner, repo, pullNumber, reviewBody) {
  return requestGithubApi(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/reviews`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body: reviewBody,
        event: "COMMENT",
      }),
    },
    "GitHub review error",
  );
}

async function postInlineComment(
  owner,
  repo,
  pullNumber,
  commitSha,
  body,
  path,
  line,
) {
  return requestGithubApi(
    `/repos/${owner}/${repo}/pulls/${pullNumber}/comments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        body,
        commit_id: commitSha,
        path,
        line,
        side: "RIGHT",
      }),
    },
    "GitHub inline comment error",
  );
}

module.exports = {
  getPullRequestFiles,
  postInlineComment,
  postPullRequestReview,
};
