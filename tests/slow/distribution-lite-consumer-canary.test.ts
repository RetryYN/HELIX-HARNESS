import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildLiteDistributionPackage } from "../../src/setup/distribution-lite-package";
import { verifyDeterministicDistributionPackage } from "../../src/setup/distribution-package-builder";

// PLAN-L7-657-distribution-lite-consumer-canary — U-DISTCANARY-007..009

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function temp(prefix: string): string {
  const root = mkdtempSync(join(tmpdir(), prefix));
  roots.push(root);
  return root;
}

function run(cwd: string, command: string, args: string[]) {
  return spawnSync(command, args, { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}

describe("PLAN-L7-657: Lite clean Linux consumer canary", () => {
  it("U-DISTCANARY-007: checksum検証済みartifactをinstallしconsumer-safe E2Eを完走する", () => {
    const artifactRoot = temp("helix-lite-canary-artifact-");
    const consumerRoot = temp("helix-lite-canary-consumer-");
    const built = buildLiteDistributionPackage({
      repo_root: process.cwd(),
      out_dir: artifactRoot,
      profile_id: "consumer_core_v1",
    });
    expect(built.ok).toBe(true);
    if (!built.ok || !("paths" in built)) return;
    const verification = verifyDeterministicDistributionPackage({
      ...built.paths,
      expected_source_head: built.manifest.source_head,
      expected_profile_id: "consumer_core_v1",
    });
    expect(verification).toEqual({ ok: true, failures: [] });

    writeFileSync(
      join(consumerRoot, "package.json"),
      `${JSON.stringify({ name: "lite-canary", version: "0.0.0", private: true }, null, 2)}\n`,
    );
    const install = run(consumerRoot, "npm", ["install", built.paths.tarball]);
    expect(install.status, install.stderr || install.stdout).toBe(0);
    const packageRoot = join(consumerRoot, "node_modules", "helix-harness-lite");
    const build = run(packageRoot, "npm", ["run", "build"]);
    expect(build.status, build.stderr || build.stdout).toBe(0);
    const helix = join(consumerRoot, "node_modules", ".bin", "helix");
    const invoke = (args: string[]) => run(consumerRoot, helix, args);

    expect(invoke(["setup", "project", "--dry-run", "--json"]).status).toBe(0);
    expect(invoke(["setup", "project", "--json"]).status).toBe(0);
    const repeated = invoke(["setup", "project", "--json"]);
    expect(repeated.status).toBe(0);
    expect(JSON.parse(repeated.stdout)).toMatchObject({ writes: [] });
    expect(invoke(["status", "--json"]).status).toBe(0);
    expect(invoke(["codex", "--role", "se", "--task", "consumer smoke", "--json"]).status).toBe(0);
    expect(invoke(["completion", "decision-packet", "--json"]).status).toBe(0);
    expect(invoke(["completion", "review-bundle", "--json"]).status).toBe(0);
    expect(invoke(["lifecycle", "rehearsal", "--operation", "rollback", "--json"]).status).toBe(0);
    const doctor = invoke(["doctor", "--profile", "consumer", "--json"]);
    if (process.versions.node.startsWith("24.")) {
      expect(doctor.status, doctor.stderr || doctor.stdout).toBe(0);
    } else {
      expect(JSON.parse(doctor.stdout)).toMatchObject({
        ok: false,
        checks: { node_24_15: false, managed_artifacts: true },
      });
    }
  }, 30_000);

  it("U-DISTCANARY-008: archiveへdevelopment state／PLAN／excluded capabilityを混入しない", () => {
    const artifactRoot = temp("helix-lite-canary-contamination-");
    const built = buildLiteDistributionPackage({
      repo_root: process.cwd(),
      out_dir: artifactRoot,
      profile_id: "consumer_core_v1",
    });
    expect(built.ok).toBe(true);
    if (!built.ok || !("paths" in built)) return;
    const listing = run(artifactRoot, "tar", ["-tzf", built.paths.tarball]);
    expect(listing.status).toBe(0);
    expect(listing.stdout).not.toMatch(/(?:^|\/)docs\/plans\//m);
    expect(listing.stdout).not.toMatch(/(?:^|\/)\.helix\//m);
    expect(listing.stdout).not.toContain("harness.db");
    expect(listing.stdout).not.toContain("resident-lane");
    expect(listing.stdout).not.toContain("credential");
  });

  it("U-DISTCANARY-009: checksum／HEAD／profile mutationを独立failureで拒否する", () => {
    const artifactRoot = temp("helix-lite-canary-mutation-");
    const built = buildLiteDistributionPackage({
      repo_root: process.cwd(),
      out_dir: artifactRoot,
      profile_id: "consumer_core_v1",
    });
    expect(built.ok).toBe(true);
    if (!built.ok || !("paths" in built)) return;
    expect(
      verifyDeterministicDistributionPackage({
        ...built.paths,
        expected_source_head: "0".repeat(40),
        expected_profile_id: "wrong_profile",
      }),
    ).toMatchObject({
      ok: false,
      failures: ["profile_mismatch", "source_head_mismatch"],
    });
    const original = readFileSync(built.paths.checksum, "utf8");
    writeFileSync(
      built.paths.checksum,
      `${createHash("sha256").update("mutated").digest("hex")}  mutated.tar.gz\n`,
    );
    expect(
      verifyDeterministicDistributionPackage({
        ...built.paths,
        expected_source_head: built.manifest.source_head,
        expected_profile_id: "consumer_core_v1",
      }),
    ).toMatchObject({ ok: false, failures: ["checksum_drift"] });
    writeFileSync(built.paths.checksum, original);
  });
});
