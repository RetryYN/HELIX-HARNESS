import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// PLAN-L7-434-closure-evidence-materialization / U-CMAT-003
const repoRoot = process.cwd();
const cliPath = join(repoRoot, "src", "cli.ts");

function run(args: string[], cwd = repoRoot) {
  return spawnSync(
    "npx",
    [
      "--prefix",
      process.cwd(),
      "--no-install",
      "tsx",
      cliPath,
      "closure",
      "authority-materialize",
      ...args,
    ],
    {
      cwd,
      encoding: "utf8",
      env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
    },
  );
}

describe("closure authority-materialize CLI", () => {
  it("requires exactly one execution mode before touching persistent state", () => {
    const neither = run(["--from-db", "--json"]);
    expect(neither.status).toBe(2);
    expect(neither.stderr).toContain("exactly one of --dry-run or --execute");

    const both = run(["--from-db", "--dry-run", "--execute", "--json"]);
    expect(both.status).toBe(2);
    expect(both.stderr).toContain("exactly one of --dry-run or --execute");
  });

  it("requires persistent DB and rejects authority path overrides", () => {
    const memory = run(["--dry-run", "--json"]);
    expect(memory.status).toBe(2);
    expect(memory.stderr).toContain("--from-db is required");

    const override = run([
      "--dry-run",
      "--from-db",
      "--authority-registry",
      "tmp/attacker.yaml",
      "--json",
    ]);
    expect(override.status).toBe(2);
    expect(override.stderr).toContain("must be docs/governance/closure-authority-registry.yaml");
  });

  it("parses batch and concurrency as canonical bounded integers", () => {
    for (const [flag, value] of [
      ["--batch-size", "1x"],
      ["--batch-size", "101"],
      ["--concurrency", "0"],
      ["--concurrency", "5"],
    ]) {
      const result = run(["--dry-run", "--from-db", flag, value, "--json"]);
      expect(result.status).toBe(2);
      expect(result.stderr).toContain("--batch-size must be 1..100");
    }
  });

  it("dry-run fail-closes a clean current-main fixture with unresolved N without changing DB or starting runners", () => {
    const fixtureRoot = mkdtempSync(join(tmpdir(), "helix-authority-cli-"));
    const fixture = join(fixtureRoot, "repo");
    execFileSync("git", ["clone", "--shared", "--quiet", repoRoot, fixture]);
    execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: fixture });
    execFileSync("git", ["config", "user.name", "HELIX fixture"], { cwd: fixture });
    mkdirSync(join(fixture, "docs", "governance"), { recursive: true });
    writeFileSync(
      join(fixture, "docs", "governance", "closure-authority-registry.yaml"),
      "schema_version: closure-authority-registry.v1\nauthorities: []\n",
    );
    execFileSync("git", ["add", "docs/governance/closure-authority-registry.yaml"], {
      cwd: fixture,
    });
    execFileSync(
      "git",
      ["commit", "--quiet", "--allow-empty", "-m", "test: add empty authority registry"],
      {
        cwd: fixture,
      },
    );
    execFileSync("git", ["update-ref", "refs/remotes/origin/main", "HEAD"], { cwd: fixture });
    const rebuild = spawnSync(
      "npx",
      ["--prefix", process.cwd(), "--no-install", "tsx", cliPath, "db", "rebuild"],
      {
        cwd: fixture,
        encoding: "utf8",
        env: { ...process.env, HELIX_SKIP_UPDATE_CHECK: "1" },
      },
    );
    expect(rebuild.status, rebuild.stderr).toBe(0);
    const dbPath = join(fixture, ".helix", "harness.db");
    const digest = () => createHash("sha256").update(readFileSync(dbPath)).digest("hex");
    const before = digest();
    const result = run(["--dry-run", "--from-db", "--json"], fixture);
    expect(result.status, result.stderr).toBe(2);
    const payload = JSON.parse(result.stdout) as {
      status: string;
      executed: boolean;
      classifications: unknown[];
    };
    expect(payload.status).toBe("target_blocked");
    expect(payload.executed).toBe(false);
    expect(payload.classifications.length).toBeGreaterThan(0);
    expect(result.stdout).toContain("N=0 precondition failed");
    expect(digest()).toBe(before);
  }, 60_000);
});
