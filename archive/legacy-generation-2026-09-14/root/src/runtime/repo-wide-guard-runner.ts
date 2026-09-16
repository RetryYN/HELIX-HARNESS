import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const REGISTRY_PATH = "config/repo-wide-guard-tests.v1.json";
const REGISTRY_TEST_PATH = "tests/repo-wide-guard-registry.test.ts";
export const REPO_WIDE_GUARD_MARKER = "// @helix-repo-wide-guard";

interface RepoWideGuardRegistry {
  schema_version: "helix-repo-wide-guard-tests.v1";
  tests: string[];
}

export function discoverRepoWideGuardTests(root = process.cwd()): string[] {
  const testsRoot = resolve(root, "tests");
  if (!existsSync(testsRoot)) {
    throw new Error("repo_wide_guard_tests_directory_missing");
  }
  return readdirSync(testsRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".test.ts"))
    .map((entry) => `tests/${entry.name}`)
    .filter((testPath) => testPath !== REGISTRY_TEST_PATH)
    .filter((testPath) => {
      const firstLine = readFileSync(resolve(root, testPath), "utf8").split(/\r?\n/u)[0]?.trim();
      return firstLine === REPO_WIDE_GUARD_MARKER;
    })
    .sort();
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
  const configured = [...tests].sort();
  const declared = discoverRepoWideGuardTests(root);
  const configuredSet = new Set(configured);
  const declaredSet = new Set(declared);
  const missingFromRegistry = declared.filter((testPath) => !configuredSet.has(testPath));
  const staleRegistryEntries = configured.filter((testPath) => !declaredSet.has(testPath));
  if (missingFromRegistry.length > 0 || staleRegistryEntries.length > 0) {
    throw new Error(
      [
        "repo_wide_guard_membership_mismatch",
        `missing_from_registry=${missingFromRegistry.join(",") || "none"}`,
        `stale_registry_entries=${staleRegistryEntries.join(",") || "none"}`,
      ].join(":"),
    );
  }
  return configured;
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
