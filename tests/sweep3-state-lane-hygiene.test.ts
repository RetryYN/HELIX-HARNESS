import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, utimesSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { loadCodexHookTrust } from "../src/lint/codex-hook-trust";
import { classifyLane, parseWorktreePorcelain } from "../src/runtime/lane-hygiene";
import {
  evaluateMemoryCommitHygiene,
  inspectMemoryCommitHygiene,
} from "../src/runtime/memory-commit-hygiene";
import { openHarnessDb } from "../src/state-db/index";
import {
  compactHarnessDb,
  databaseFreelist,
  findTmpGcCandidates,
  vacuumHarnessDb,
} from "../src/state-db/state-hygiene";

describe("PLAN-L7-432 state/lane hygiene", () => {
  it("U-S3HY-001 classifies equivalent, unique and mixed commits", () => {
    expect(classifyLane(["- a", "- b"])).toBe("landed");
    expect(classifyLane(["+ a"])).toBe("in-flight");
    expect(classifyLane(["- a", "+ b"])).toBe("diverged");
    expect(classifyLane([])).toBe("landed");
    expect(classifyLane([], false, true)).toBe("unknown");
    expect(classifyLane([], true, false)).toBe("unknown");
  });
  it("U-S3HY-002 reports stale worktrees without deletion", () => {
    const rows = parseWorktreePorcelain(
      "worktree /repo\nHEAD a\nbranch refs/heads/main\n\nworktree /tmp/old\nHEAD b\ndetached\n\nworktree /gone\nHEAD c\nprunable missing\n",
    );
    expect(rows.map((r) => [r.path, r.prunable])).toEqual([
      ["/repo", false],
      ["/tmp/old", true],
      ["/gone", true],
    ]);
  });
  it("U-S3HY-003 selects only expired tmp children", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-gc-"));
    mkdirSync(join(root, "probe-old"));
    writeFileSync(join(root, "new"), "x");
    mkdirSync(join(root, "probe-protected", "nested-audit"), { recursive: true });
    utimesSync(join(root, "probe-old"), new Date(0), new Date(0));
    utimesSync(join(root, "probe-protected"), new Date(0), new Date(0));
    expect(
      findTmpGcCandidates({ root, nowMs: 100_000, maxAgeMs: 50_000 }).map((v) => v.path),
    ).toEqual(["probe-old"]);
  });
  it("U-S3HY-004 warns only for old uncommitted memory", () => {
    expect(
      evaluateMemoryCommitHygiene({ changed: true, mtimeMs: 0, nowMs: 100, thresholdMs: 50 })
        .warning,
    ).toBe(true);
    expect(
      evaluateMemoryCommitHygiene({ changed: false, mtimeMs: 0, nowMs: 100, thresholdMs: 50 })
        .warning,
    ).toBe(false);
    const root = mkdtempSync(join(tmpdir(), "helix-memory-hygiene-"));
    execFileSync("git", ["init"], { cwd: root, stdio: "ignore" });
    mkdirSync(join(root, ".helix", "memory"), { recursive: true });
    const memoryPath = join(root, ".helix", "memory", "harness.jsonl");
    writeFileSync(memoryPath, "{}\n");
    utimesSync(memoryPath, new Date(0), new Date(0));
    expect(inspectMemoryCommitHygiene(root, 100, 50)).toMatchObject({
      changed: true,
      warning: true,
    });
    rmSync(root, { recursive: true, force: true });
  });
  it("U-S3HY-005 fail-closes hook trust mismatch and skips unavailable config", () => {
    const response = (trustStatus: string) =>
      `${JSON.stringify({ id: 2, result: { data: [{ cwd: "/repo", hooks: [{ key: "/repo/.codex/hooks.json:pre_tool_use:0:0", source: "project", isManaged: false, currentHash: "sha256:a", trustStatus }] }] } })}\n`;
    expect(
      loadCodexHookTrust("/repo", () => ({ status: 0, stdout: response("trusted") })),
    ).toMatchObject({ status: "trusted", ok: true, checked: 1 });
    expect(
      loadCodexHookTrust("/repo", () => ({ status: 0, stdout: response("untrusted") })),
    ).toMatchObject({ status: "mismatch", ok: false });
    expect(
      loadCodexHookTrust("/repo", () => ({
        status: 127,
        stdout: "",
        error: "not found",
        unavailableReason: "ci",
      })),
    ).toMatchObject({
      status: "config-unavailable",
      ok: true,
    });
    for (const stdout of [
      "not-json\n",
      "{}\n",
      `${JSON.stringify({ id: 2, result: { data: [] } })}\n`,
      `${JSON.stringify({ id: 2, result: { data: [{ cwd: "/repo", hooks: [] }] } })}\n`,
    ])
      expect(loadCodexHookTrust("/repo", () => ({ status: 0, stdout }))).toMatchObject({
        ok: false,
        status: "error",
      });
    expect(
      loadCodexHookTrust("/repo", () => ({ status: 9, stdout: response("trusted") })),
    ).toMatchObject({ ok: false, status: "error" });
  });
  it("U-S3HY-007 compact is dry-run by default and rejects concurrent execution", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-compact-"));
    mkdirSync(join(root, ".helix", "state"), { recursive: true });
    const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
    db.close();
    expect(compactHarnessDb({ repoRoot: root })).toMatchObject({
      ok: true,
      executed: false,
      reason: "dry-run",
    });
    const occupiedBackup = join(root, ".helix", "occupied.sqlite");
    writeFileSync(occupiedBackup, "occupied");
    expect(
      compactHarnessDb({ repoRoot: root, execute: true, backupPath: occupiedBackup }),
    ).toMatchObject({ ok: false, reason: "backup-path-exists" });
    writeFileSync(join(root, ".helix", "state", "db-compact.lock"), "busy");
    expect(compactHarnessDb({ repoRoot: root, execute: true })).toMatchObject({
      ok: false,
      reason: "concurrent-runtime-or-compact",
    });
    rmSync(root, { recursive: true, force: true });
  });
  it("U-S3HY-008 VACUUM failure leaves original rows unchanged and returns manual recovery", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-compact-recovery-"));
    mkdirSync(join(root, ".helix", "state"), { recursive: true });
    const dbPath = join(root, ".helix", "harness.db");
    const db = openHarnessDb(dbPath, { repoRoot: root });
    db.exec("CREATE TABLE preserved(value TEXT); INSERT INTO preserved VALUES ('before')");
    db.close();
    const result = compactHarnessDb({
      repoRoot: root,
      execute: true,
      vacuum: () => {
        throw new Error("fixture failure");
      },
    });
    expect(result).toMatchObject({ ok: false, reason: "compact-failed-manual-recovery-required" });
    const restored = openHarnessDb(dbPath, { repoRoot: root });
    expect(restored.prepare("SELECT value FROM preserved").get()?.value).toBe("before");
    restored.close();
    rmSync(root, { recursive: true, force: true });
  });
  it("U-S3HY-011 creates a missing state directory before acquiring the compact lock", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-compact-fresh-"));
    mkdirSync(join(root, ".helix"), { recursive: true });
    const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
    db.close();
    expect(compactHarnessDb({ repoRoot: root, execute: true })).toMatchObject({
      ok: true,
      reason: "compacted",
    });
    rmSync(root, { recursive: true, force: true });
  });
  it("U-S3HY-009 VACUUM INTO backup contains the latest WAL row", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-compact-wal-"));
    mkdirSync(join(root, ".helix", "state"), { recursive: true });
    const dbPath = join(root, ".helix", "harness.db");
    const db = openHarnessDb(dbPath, { repoRoot: root });
    db.exec("CREATE TABLE latest(value TEXT); INSERT INTO latest VALUES ('wal-latest')");
    db.close();
    const result = compactHarnessDb({ repoRoot: root, execute: true });
    expect(result).toMatchObject({ ok: true, reason: "compacted" });
    const backup = openHarnessDb(String(result.backupPath), { repoRoot: root });
    expect(backup.prepare("SELECT value FROM latest").get()?.value).toBe("wal-latest");
    backup.close();
    rmSync(root, { recursive: true, force: true });
  });
  it("U-S3HY-010 foreign writer is rejected by SQLite lock authority", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-compact-writer-"));
    mkdirSync(join(root, ".helix", "state"), { recursive: true });
    const dbPath = join(root, ".helix", "harness.db");
    const writer = openHarnessDb(dbPath, { repoRoot: root });
    writer.exec(
      "CREATE TABLE held(value TEXT); BEGIN IMMEDIATE; INSERT INTO held VALUES ('uncommitted')",
    );
    const result = compactHarnessDb({ repoRoot: root, execute: true });
    expect(result).toMatchObject({ ok: false, reason: "compact-failed-manual-recovery-required" });
    writer.exec("ROLLBACK");
    writer.close();
    rmSync(root, { recursive: true, force: true });
  }, 10_000);
  it("U-S3HY-006 VACUUM removes freelist pages in an isolated persistent fixture", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-vacuum-"));
    mkdirSync(join(root, ".helix"));
    const db = openHarnessDb(join(root, ".helix", "harness.db"), { repoRoot: root });
    try {
      db.exec("CREATE TABLE bulk(value TEXT)");
      db.exec("BEGIN");
      const insert = db.prepare("INSERT INTO bulk(value) VALUES (?)");
      for (let index = 0; index < 2_000; index += 1) insert.run("x".repeat(1_000));
      db.exec("COMMIT");
      db.exec("DROP TABLE bulk");
      const before = databaseFreelist(db);
      const after = vacuumHarnessDb(db);
      expect(before.freelistCount).toBeGreaterThan(0);
      expect(after.freelistCount).toBe(0);
      expect(after.pageCount).toBeLessThan(before.pageCount);
    } finally {
      db.close();
      rmSync(root, { recursive: true, force: true });
    }
  });
});
