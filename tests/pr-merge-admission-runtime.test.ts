import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  collectContextualPrReviewPacket,
  collectPrDatabaseConvergenceProbe,
  logicalDatabaseDigest,
  observePrDatabaseConvergence,
} from "../src/github/pr-merge-admission-runtime";
import { type HarnessDb, openHarnessDb } from "../src/state-db";

const temporaryRoots: string[] = [];
const planPath = "docs/plans/PLAN-L3-21-contextual-pr-review-db-convergence.md";
const contextPaths = [
  "docs/design/helix/L0-charter/helix-charter_v0.1.md",
  "docs/design/helix/L2-screen/screen-mock-boundary.md",
  "docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md",
  "docs/design/helix/L4-basic-design/infinity-loop-platform-basic-design.md",
  planPath,
  "docs/design/helix/L5-detail/github-pr-audit-promotion.md",
  "docs/design/helix/L6-function-design/github-pr-audit-promotion.md",
  "docs/test-design/helix/L5-github-pr-audit-promotion-integration-test-design.md",
  "docs/test-design/helix/L6-github-pr-audit-promotion-unit-test-design.md",
  "docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md",
];

afterEach(() => {
  for (const root of temporaryRoots.splice(0)) rmSync(root, { recursive: true, force: true });
});

function database(): HarnessDb {
  const db = openHarnessDb(":memory:");
  db.exec(
    "CREATE TABLE feedback_lifecycle_health (id TEXT PRIMARY KEY, status TEXT, projected_at TEXT)",
  );
  return db;
}

function gitFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-pr-git-fixture-"));
  temporaryRoots.push(root);
  execFileSync("git", ["init", "-q", root]);
  execFileSync("git", ["-C", root, "config", "user.name", "HELIX Test"]);
  execFileSync("git", ["-C", root, "config", "user.email", "helix-test@example.invalid"]);
  for (const path of contextPaths) {
    mkdirSync(join(root, path, ".."), { recursive: true });
    writeFileSync(join(root, path), `${path}\n`, "utf8");
  }
  execFileSync("git", ["-C", root, "add", ...contextPaths]);
  execFileSync("git", ["-C", root, "commit", "-qm", "fixture base"]);
  execFileSync("git", ["-C", root, "branch", "base"]);
  writeFileSync(join(root, planPath), "updated plan\n", "utf8");
  execFileSync("git", ["-C", root, "add", planPath]);
  execFileSync("git", ["-C", root, "commit", "-qm", "fixture head"]);
  return root;
}

describe("PR database convergence runtime", () => {
  it("U-GPAP-020-RUNTIME-01: 全行の論理差分を検出し観測時刻だけを除外する", () => {
    const first = database();
    const second = database();
    try {
      first
        .prepare("INSERT INTO feedback_lifecycle_health VALUES (?, ?, ?)")
        .run("one", "active", "time-a");
      second
        .prepare("INSERT INTO feedback_lifecycle_health VALUES (?, ?, ?)")
        .run("one", "active", "time-b");
      expect(logicalDatabaseDigest(first)).toBe(logicalDatabaseDigest(second));

      second
        .prepare("UPDATE feedback_lifecycle_health SET status = ? WHERE id = ?")
        .run("stale", "one");
      expect(logicalDatabaseDigest(first)).not.toBe(logicalDatabaseDigest(second));
    } finally {
      first.close();
      second.close();
    }
  });

  it("U-GPAP-021-RUNTIME-01: 独立したin-memory rebuildを比較する実測observationを返す", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "helix-pr-db-observation-"));
    temporaryRoots.push(repoRoot);
    const observation = observePrDatabaseConvergence({
      repoRoot,
      sourceHead: "a".repeat(40),
      eventHeadDigest: `sha256:${"b".repeat(64)}`,
    });
    expect(observation).toMatchObject({
      source_head: "a".repeat(40),
      event_head_digest: `sha256:${"b".repeat(64)}`,
      stale_count: 0,
      orphan_count: 0,
      rebuild_finding_count: 0,
    });
    expect(observation.projection_digest).toBe(observation.replay_projection_digest);
    expect(observation.checkpoint_digest).toBe(observation.replay_checkpoint_digest);
    expect(observation.schema_revision).toBeGreaterThan(0);
  });

  it("U-GPAP-018-RUNTIME-01: tracked HEADから8種contextとdiffを決定的に採取する", () => {
    const repoRoot = gitFixture();
    const input = {
      repoRoot,
      repositoryId: "RetryYN/HELIX-HARNESS",
      prNumber: 90,
      baseRef: "base",
      authorIdentity: "worker",
      authorSessionId: "worker-session",
      workerContextDigest: `sha256:${"c".repeat(64)}` as const,
    };
    const first = collectContextualPrReviewPacket(input);
    const second = collectContextualPrReviewPacket(input);
    expect(first).toEqual(second);
    expect(first).toMatchObject({ ok: true });
    if (first.ok) {
      expect(first.value.materials.map((material) => material.kind).sort()).toEqual([
        "authority_l0",
        "basic_design_l4",
        "diff",
        "issue_plan",
        "prototype_l2",
        "requirements_l3",
        "security_blast_radius",
        "trace_consumers",
      ]);
      expect(JSON.stringify(first.value)).not.toContain("updated plan");
    }
  });

  it("U-GPAP-020-RUNTIME-02: probeをtracked HEAD/treeとrebuild policyへ束縛する", () => {
    const repoRoot = gitFixture();
    const first = collectPrDatabaseConvergenceProbe({
      repoRoot,
      repositoryId: "RetryYN/HELIX-HARNESS",
      prNumber: 90,
      expectedSchemaRevision: 36,
    });
    const second = collectPrDatabaseConvergenceProbe({
      repoRoot,
      repositoryId: "RetryYN/HELIX-HARNESS",
      prNumber: 90,
      expectedSchemaRevision: 36,
    });
    expect(first).toEqual(second);
    expect(first).toMatchObject({ ok: true });
  });
});
