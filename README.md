# AI Code Reviewer

The application is organized as a modular Express app. Its routes, request
validation, GitHub/Gemini integrations, and pull-request workflow are kept in
separate modules while still running as one service.

## Project structure

```text
src/
  app.js
  server.js
  controllers/
    webhookController.js
  middleware/
    verifyGithubWebhook.js
  routes/
    healthRoutes.js
    webhookRoutes.js
  services/
    aiReviewService.js
    githubService.js
    pullRequestReviewService.js
  state/
    reviewState.js
  utils/
    isLineInDiff.js
test/
  isLineInDiff.test.js
```

## Configuration

Set these environment variables before starting the server:

- `GEMINI_API_KEY` — API key used for AI code reviews.
- `GITHUB_TOKEN` — token used to read pull requests and post reviews.
- `GITHUB_WEBHOOK_SECRET` — secret configured for the GitHub webhook.
- `PORT` — optional server port; defaults to `3000`.

## Run

```sh
npm install
npm run dev
```

The server exposes `GET /`, `GET /health`, and `POST /webhooks/github`.
Run the unit tests with `npm test`.
