function isLineInDiff(patch, targetLine) {
  if (
    !patch ||
    !Number.isInteger(targetLine) ||
    targetLine < 1
  ) {
    return false;
  }

  let newLine = 0;

  for (const line of patch.split("\n")) {
    if (line.startsWith("@@")) {
      const match = line.match(
        /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/,
      );

      if (match) {
        newLine = Number(match[1]);
      }

      continue;
    }

    if (line.startsWith("+++")) {
      continue;
    }

    if (line.startsWith("+")) {
      if (newLine === targetLine) {
        return true;
      }

      newLine++;
      continue;
    }

    if (line.startsWith("-")) {
      continue;
    }

    if (line.startsWith("\\")) {
      continue;
    }

    newLine++;
  }

  return false;
}

module.exports = { isLineInDiff };
