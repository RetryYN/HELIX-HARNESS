import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const REGISTRY_PATH = "config/repo-wide-guard-tests.v1.json";

interface RepoWideGuardRegistry {
  schema_version: "helix-repo-wide-guard-tests.v1";
  tests: string[];
}

export function loadRepoWideGuardTests(root = process.cwd()): string[] {
  const registry = JSON.parse(
    readFileSync(resolve(root, REGISTRY_PATH), "utf8"),
  ) as Partial<RepoWideGuardRegistry>;
  if (
    registry.schema_version !== "helix-repo-wide-guard-tests.v1" ||
    !Array.isArray(registry.tests) ||
    registry.tests.length === 0
  ) {
    throw new Error("repo_wide_guard_registry_invalid");
  }
  const tests = registry.tests;
  if (
    new Set(tests).size !== tests.length ||
    tests.some((path) => !/^tests\/[a-z0-9-]+\.test\.ts$/.test(path))
  ) {
    throw new Error("repo_wide_guard_registry_invalid");
  }
  for (const testPath of tests) {
    if (!existsSync(resolve(root, testPath))) {
      throw new Error(`repo_wide_guard_test_missing:${testPath}`);
    }
  }
  return [...tests].sort();
}

function main(): void {
  const tests = loadRepoWideGuardTests();
  const npx = process.platform === "win32" ? "npx.cmd" : "npx";
  const result = spawnSync(npx, ["--no-install", "vitest", "run", "--project", "fast", ...tests], {
    cwd: process.cwd(),
    stdio: "inherit",
    env: process.env,
  });
  process.exit(result.status ?? 1);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
