import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  checkForUpdate,
  DEFAULT_UPDATE_REMOTE,
  latestReleaseTag,
  normalizeRepositoryUrl,
  parseSemver,
  renderUpdateLine,
  UPDATE_CHECK_CACHE_PATH,
  UPDATE_CHECK_TTL_MS,
  type UpdateCheckDeps,
  updateCheckDisabled,
} from "../src/setup/update-check";

function depsFor(files: Record<string, string>, overrides: Partial<UpdateCheckDeps> = {}) {
  const writes: Record<string, string> = {};
  const calls: string[] = [];
  const harnessRoot = "/repo";
  const deps: UpdateCheckDeps = {
    harnessRoot,
    nowMs: () => 1_000_000,
    readText: (path) => files[path] ?? writes[path] ?? null,
    writeText: (path, content) => {
      writes[path] = content;
    },
    remoteOverride: () => null,
    listRemoteTags: (remote) => {
      calls.push(remote);
      return ["v0.1.0", "v0.1.3", "not-a-release", "v0.1.2"];
    },
    ...overrides,
  };
  return { deps, writes, calls, harnessRoot };
}

function manifest(
  version = "0.1.0",
  repository: unknown = { url: "git+https://github.com/RetryYN/HELIX-HARNESS-OS.git" },
): string {
  return JSON.stringify({ version, repository });
}

describe("update-check advisory", () => {
  it("selects the latest stable semver tag", () => {
    expect(parseSemver("v1.2.3")).toEqual([1, 2, 3]);
    expect(parseSemver("1.2.3")).toEqual([1, 2, 3]);
    expect(parseSemver("v1.2.3-rc.1")).toBeNull();
    expect(latestReleaseTag(["v0.9.9", "v1.0.0", "v1.0.0-rc.1", "v0.10.0"])).toBe("v1.0.0");
  });

  it("normalizes package repository URLs without binding to consumer origin", () => {
    expect(normalizeRepositoryUrl("git+https://example.test/repo.git")).toBe(
      "https://example.test/repo.git",
    );
    expect(normalizeRepositoryUrl({ url: "git+ssh://git@example.test/repo.git" })).toBe(
      "ssh://git@example.test/repo.git",
    );
    expect(normalizeRepositoryUrl({ directory: "packages/harness" })).toBeNull();
  });

  it("reports remote updates and writes a short-lived cache", () => {
    const { deps, writes, calls, harnessRoot } = depsFor({
      [join("/repo", "package.json")]: manifest("0.1.0"),
    });

    const result = checkForUpdate(deps);

    expect(result).toMatchObject({
      checked: true,
      localVersion: "0.1.0",
      latestVersion: "v0.1.3",
      updateAvailable: true,
      source: "remote",
    });
    expect(calls).toEqual(["https://github.com/RetryYN/HELIX-HARNESS-OS.git"]);
    expect(JSON.parse(writes[join(harnessRoot, UPDATE_CHECK_CACHE_PATH)])).toMatchObject({
      checkedAtMs: 1_000_000,
      latestVersion: "v0.1.3",
      remote: "https://github.com/RetryYN/HELIX-HARNESS-OS.git",
    });
  });

  it("uses fresh cache before touching the remote", () => {
    const { deps, calls } = depsFor(
      {
        [join("/repo", "package.json")]: manifest("0.1.0"),
        [join("/repo", UPDATE_CHECK_CACHE_PATH)]: JSON.stringify({
          checkedAtMs: 1_000_000 - UPDATE_CHECK_TTL_MS + 1,
          latestVersion: "v0.1.2",
          remote: "https://github.com/RetryYN/HELIX-HARNESS-OS.git",
        }),
      },
      {
        listRemoteTags: () => {
          throw new Error("remote must not be called");
        },
      },
    );

    expect(checkForUpdate(deps)).toMatchObject({
      checked: true,
      latestVersion: "v0.1.2",
      updateAvailable: true,
      source: "cache",
    });
    expect(calls).toEqual([]);
  });

  it("falls open when package metadata or remote tags are unavailable", () => {
    expect(checkForUpdate(depsFor({}).deps)).toMatchObject({
      checked: false,
      detail: "harness package.json unreadable",
    });
    expect(
      checkForUpdate(depsFor({ [join("/repo", "package.json")]: manifest("workspace:*") }).deps),
    ).toMatchObject({
      checked: false,
      detail: "harness package.json version is not a release version",
    });
    expect(
      checkForUpdate(
        depsFor(
          { [join("/repo", "package.json")]: manifest("0.1.0") },
          { listRemoteTags: () => null },
        ).deps,
      ),
    ).toMatchObject({
      checked: false,
      localVersion: "0.1.0",
      detail: "remote tags unreachable",
    });
  });

  it("allows explicit remote override and falls back to the distribution remote", () => {
    const overridden = depsFor(
      { [join("/repo", "package.json")]: manifest("0.1.0", null) },
      { remoteOverride: () => "https://example.test/releases.git" },
    );
    checkForUpdate(overridden.deps);
    expect(overridden.calls).toEqual(["https://example.test/releases.git"]);

    const fallback = depsFor({ [join("/repo", "package.json")]: manifest("0.1.0", null) });
    checkForUpdate(fallback.deps);
    expect(fallback.calls).toEqual([DEFAULT_UPDATE_REMOTE]);
  });

  it("renders status lines without turning advisory failure into a blocker", () => {
    expect(
      renderUpdateLine({
        checked: true,
        localVersion: "0.1.0",
        latestVersion: "v0.1.3",
        updateAvailable: true,
        source: "remote",
        detail: null,
      }),
    ).toBe(
      "update: v0.1.0 -> v0.1.3 available (review CHANGELOG and run version-up activation before adopting)",
    );
    expect(
      renderUpdateLine({
        checked: true,
        localVersion: "0.1.3",
        latestVersion: "v0.1.3",
        updateAvailable: false,
        source: "cache",
        detail: null,
      }),
    ).toBe("update: current latest=v0.1.3");
    expect(renderUpdateLine(updateCheckDisabled("VITEST_WORKER_ID"))).toBe(
      "update: check skipped (disabled by VITEST_WORKER_ID)",
    );
  });
});
