import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";
import {
  discoverRepoWideGuardTests,
  loadRepoWideGuardTests,
  REPO_WIDE_GUARD_MARKER,
} from "../src/runtime/repo-wide-guard-runner";

// PLAN-RECOVERY-728-repo-wide-guard-preflight

const ROOT = process.cwd();

describe("repo-wide guard registry", () => {
  it("U-REPOGUARD-001: 明示markerとregistry projectionのexact setを保持する", () => {
    expect(loadRepoWideGuardTests(ROOT)).toEqual(discoverRepoWideGuardTests(ROOT));
  });

  it("U-REPOGUARD-005: markerとregistryの差分をfail-closeする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-repo-wide-guard-marker-"));
    try {
      mkdirSync(resolve(root, "config"), { recursive: true });
      mkdirSync(resolve(root, "tests"), { recursive: true });
      const registry = JSON.stringify({
        schema_version: "helix-repo-wide-guard-tests.v1",
        tests: ["tests/example.test.ts"],
      });
      writeFileSync(resolve(root, "config/repo-wide-guard-tests.v1.json"), registry);
      writeFileSync(
        resolve(root, "tests/example.test.ts"),
        `${REPO_WIDE_GUARD_MARKER}\nexport {};\n`,
      );
      expect(loadRepoWideGuardTests(root)).toEqual(["tests/example.test.ts"]);

      writeFileSync(
        resolve(root, "tests/unregistered.test.ts"),
        `${REPO_WIDE_GUARD_MARKER}\nexport {};\n`,
      );
      expect(() => loadRepoWideGuardTests(root)).toThrow("repo_wide_guard_membership_mismatch");

      rmSync(resolve(root, "tests/unregistered.test.ts"));
      writeFileSync(resolve(root, "tests/example.test.ts"), "export {};\n");
      expect(() => loadRepoWideGuardTests(root)).toThrow("repo_wide_guard_membership_mismatch");
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-REPOGUARD-002: reviewとCIが同じ単一entrypointを使用する", () => {
    const packageJson = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const workflow = readFileSync(resolve(ROOT, ".github/workflows/harness-check.yml"), "utf8");
    expect(packageJson.scripts["test:repo-guards"]).toBe(
      "tsx src/runtime/repo-wide-guard-runner.ts",
    );
    expect(workflow).toContain("run: npm run test:repo-guards");
  });

  it("U-REPOGUARD-003: repo-wide guardはfull shardより前にpreflightで実行する", () => {
    const workflow = readFileSync(resolve(ROOT, ".github/workflows/harness-check.yml"), "utf8");
    const preflightStart = workflow.indexOf("  full-regression-preflight:");
    const bulkStart = workflow.indexOf("  full-regression-bulk-1:", preflightStart);
    expect(preflightStart).toBeGreaterThanOrEqual(0);
    expect(bulkStart).toBeGreaterThan(preflightStart);

    const preflight = workflow.slice(preflightStart, bulkStart);
    const installIndex = preflight.indexOf("run: npm ci");
    const guardIndex = preflight.indexOf("run: npm run test:repo-guards");
    const isolationIndex = preflight.indexOf("install required Linux isolation backend");
    expect(installIndex).toBeGreaterThanOrEqual(0);
    expect(guardIndex).toBeGreaterThan(installIndex);
    expect(isolationIndex).toBeGreaterThan(guardIndex);
  });

  it("U-REPOGUARD-004: runnerはregistryのexact setをfast projectへ渡す", () => {
    const runner = readFileSync(resolve(ROOT, "src/runtime/repo-wide-guard-runner.ts"), "utf8");
    expect(runner).toContain("loadRepoWideGuardTests");
    expect(runner).toContain('["--no-install", "vitest", "run", "--project", "fast", ...tests]');
    expect(runner).not.toContain("tests/**/*.test.ts");
  });
});
