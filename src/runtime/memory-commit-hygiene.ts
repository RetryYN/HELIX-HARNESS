export function evaluateMemoryCommitHygiene(input: {
  changed: boolean;
  mtimeMs: number | null;
  nowMs: number;
  thresholdMs: number;
}) {
  const ageMs = input.mtimeMs === null ? 0 : Math.max(0, input.nowMs - input.mtimeMs);
  return {
    changed: input.changed,
    warning: input.changed && input.mtimeMs !== null && ageMs > input.thresholdMs,
    ageMs,
    thresholdMs: input.thresholdMs,
  };
}

export function inspectMemoryCommitHygiene(
  repoRoot: string,
  nowMs = Date.now(),
  thresholdMs = 24 * 60 * 60 * 1_000,
) {
  const relativePath = ".helix/memory/harness.jsonl";
  const path = join(repoRoot, relativePath);
  if (!existsSync(path))
    return {
      path: relativePath,
      ...evaluateMemoryCommitHygiene({ changed: false, mtimeMs: null, nowMs, thresholdMs }),
    };
  let changed = false;
  try {
    const tracked = execFileSync("git", ["ls-files", "--error-unmatch", "--", relativePath], {
      cwd: repoRoot,
      stdio: "ignore",
    });
    void tracked;
    execFileSync("git", ["diff", "--quiet", "HEAD", "--", relativePath], {
      cwd: repoRoot,
      stdio: "ignore",
    });
  } catch {
    changed = true;
  }
  return {
    path: relativePath,
    ...evaluateMemoryCommitHygiene({
      changed,
      mtimeMs: statSync(path).mtimeMs,
      nowMs,
      thresholdMs,
    }),
  };
}

import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { join } from "node:path";
