import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  requireSafeGitRemoteUrl,
  requireSafeGitRevisionRange,
} from "../src/runtime/git-argument-boundary";
import { ensureCliBundle } from "./tools/cli-bundle";

const CLI_BUNDLE_PATH = ensureCliBundle(process.cwd());

describe("git argument boundary", () => {
  it.each([
    "https://github.com/RetryYN/HELIX-HARNESS-DevOS.git",
    "ssh://git@github.com/RetryYN/HELIX-HARNESS-DevOS.git",
    "git@github.com:RetryYN/HELIX-HARNESS-DevOS.git",
  ])("accepts an allowlisted remote identity: %s", (remote) => {
    expect(requireSafeGitRemoteUrl(remote)).toBe(remote);
  });

  it.each([
    "ext::sh -c 'touch /tmp/pwned'",
    "EXT::sh -c 'touch /tmp/pwned'",
    "--upload-pack=/tmp/pwn",
    "file:///tmp/repo",
    "https://user:secret@example.com/repo.git",
    "https://user@example.com/repo.git",
    "https://example.com/repo.git?upload-pack=/tmp/pwn",
  ])("rejects an unsafe remote before process execution: %s", (remote) => {
    expect(() => requireSafeGitRemoteUrl(remote)).toThrow("unsafe_git_remote_url");
  });

  it.each(["HEAD", "HEAD~1..HEAD", "origin/main...feature/topic", "refs/tags/v1.2.3"])(
    "accepts a bounded revision range: %s",
    (range) => {
      expect(requireSafeGitRevisionRange(range)).toBe(range);
    },
  );

  it.each(["--output=/tmp/x", "HEAD --output=/tmp/x", "HEAD..", "HEAD@{1}", ""])(
    "rejects an option-shaped or malformed revision before process execution: %s",
    (range) => {
      expect(() => requireSafeGitRevisionRange(range)).toThrow("unsafe_git_revision_range");
    },
  );

  it("rejects ext:: and --output before either side effect can occur", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-git-argument-boundary-"));
    const remoteMarker = join(root, "remote-marker");
    const rangeMarker = join(root, "range-marker");
    try {
      const remote = spawnSync(
        process.execPath,
        [
          CLI_BUNDLE_PATH,
          "version-up",
          "dry-run",
          "--current",
          "v0.1.0",
          "--target",
          "v0.1.1",
          "--release-remote",
          `ext::sh -c 'touch ${remoteMarker}'`,
          "--json",
        ],
        { encoding: "utf8" },
      );
      const range = spawnSync(
        process.execPath,
        [CLI_BUNDLE_PATH, "guard", "commitlint", `--range=--output=${rangeMarker}`],
        { encoding: "utf8" },
      );

      expect(remote.status).not.toBe(0);
      expect(range.status).not.toBe(0);
      expect(existsSync(remoteMarker)).toBe(false);
      expect(existsSync(rangeMarker)).toBe(false);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
