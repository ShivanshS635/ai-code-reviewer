const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function reviewCode(patch, filename) {
  const prompt = `
You are an expert software engineer performing a code review.

Review this GitHub code change.

Focus only on:
- Bugs
- Security vulnerabilities
- Performance problems
- Incorrect behavior
- Maintainability problems

Do not complain about harmless style choices.

Return ONLY valid JSON.
Do not use markdown or code fences.

Use exactly this structure:

{
  "summary": "short overall review",
  "findings": [
    {
      "severity": "high|medium|low",
      "file": "${filename}",
      "line": 1,
      "issue": "short explanation",
      "suggestion": "how to fix it"
    }
  ]
}

Rules:
- "line" must be the line number in the changed file.
- Only report real issues.
- Only report issues on added or changed lines.
- If there are no meaningful issues, return an empty findings array.
- Keep findings concise.

File:
${filename}

Code change:
${patch}
`;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const interaction = await ai.interactions.create({
        model: "gemini-3.6-flash",
        input: prompt,
        generation_config: {
          thinking_level: "low",
        },
      });

      const output = interaction.output_text?.trim();

      if (!output) {
        throw new Error("Gemini returned an empty response");
      }

      const review = JSON.parse(output);

      if (
        typeof review.summary !== "string" ||
        !Array.isArray(review.findings)
      ) {
        throw new Error("Gemini returned an invalid review structure");
      }

      return review;
    } catch (error) {
      console.error(
        `Gemini attempt ${attempt} failed: ${error.message}`,
      );

      if (
        error.message.includes("429") ||
        error.message.toLowerCase().includes("quota")
      ) {
        throw error;
      }

      if (attempt === 3) {
        throw error;
      }

      const delay = 2000 * Math.pow(2, attempt - 1);

      console.log(
        `Retrying Gemini in ${delay / 1000} seconds...`,
      );

      await new Promise((resolve) => {
        setTimeout(resolve, delay);
      });
    }
  }
}

module.exports = { reviewCode };
