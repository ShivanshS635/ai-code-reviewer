const test = require("node:test");
const assert = require("node:assert/strict");
const { isLineInDiff } = require("../src/utils/isLineInDiff");

test("identifies added lines in a unified diff", () => {
  const patch = [
    "@@ -1,3 +1,4 @@",
    " context",
    "-removed",
    "+added",
    " context",
  ].join("\n");

  assert.equal(isLineInDiff(patch, 2), true);
  assert.equal(isLineInDiff(patch, 1), false);
  assert.equal(isLineInDiff(patch, 3), false);
});

test("tracks line numbers across multiple hunks", () => {
  const patch = [
    "@@ -1,2 +1,2 @@",
    " context",
    "+first addition",
    "@@ -10,2 +10,3 @@",
    "+second addition",
    " context",
  ].join("\n");

  assert.equal(isLineInDiff(patch, 2), true);
  assert.equal(isLineInDiff(patch, 10), true);
});

test("rejects invalid lines and patches without additions", () => {
  assert.equal(isLineInDiff("", 1), false);
  assert.equal(isLineInDiff("+added", 0), false);
  assert.equal(isLineInDiff("+added", 1), false);
});
