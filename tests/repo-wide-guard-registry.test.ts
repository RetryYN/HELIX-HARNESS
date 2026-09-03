import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { loadRepoWideGuardTests } from "../scripts/run-repo-wide-guards";

// PLAN-RECOVERY-728-repo-wide-guard-preflight

const ROOT = process.cwd();
const DISCOVERY_PATTERN = /real repo|real repository|実repo|live repository|regression fence/i;

function discoverRepoWideGuards(): string[] {
  return readdirSync(resolve(ROOT, "tests"))
    .filter((name) => name.endsWith(".test.ts"))
    .filter((name) => name !== "repo-wide-guard-registry.test.ts")
    .filter((name) => DISCOVERY_PATTERN.test(readFileSync(resolve(ROOT, "tests", name), "utf8")))
    .map((name) => `tests/${name}`)
    .sort();
}

describe("repo-wide guard registry", () => {
  it("U-REPOGUARD-001: registryが実repo走査guardのexact setを保持する", () => {
    expect(loadRepoWideGuardTests(ROOT)).toEqual(discoverRepoWideGuards());
  });

  it("U-REPOGUARD-002: reviewとCIが同じ単一entrypointを使用する", () => {
    const packageJson = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8")) as {
      scripts: Record<string, string>;
    };
    const workflow = readFileSync(resolve(ROOT, ".github/workflows/harness-check.yml"), "utf8");
    expect(packageJson.scripts["test:repo-guards"]).toBe("tsx scripts/run-repo-wide-guards.ts");
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
});
