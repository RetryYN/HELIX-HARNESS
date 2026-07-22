import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  logicalDatabaseDigest,
  observePrDatabaseConvergence,
} from "../src/github/pr-merge-admission-runtime";
import { type HarnessDb, openHarnessDb } from "../src/state-db";

const temporaryRoots: string[] = [];

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

describe("PR database convergence runtime", () => {
  it("U-GPAP-025: 全行の論理差分を検出し観測時刻だけを除外する", () => {
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

  it("U-GPAP-026: 独立したin-memory rebuildを比較する実測observationを返す", () => {
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
});
