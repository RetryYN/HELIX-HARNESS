import { randomUUID } from "node:crypto";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  analyzeDriveDbRegistration,
  type DriveDbRegistrationStats,
  driveDbRegistrationMessages,
  REQUIRED_DRIVE_MODELS,
} from "../src/lint/drive-db-registration";
import { loadReviewPlans } from "../src/lint/review-evidence";
import {
  collectCurrentPlanRegistryFingerprint,
  collectDriveDbRegistrationStats,
  driveDbStatsMatchCurrentPlanRegistry,
  loadOrBuildDriveDbRegistrationStats,
  refreshPersistedDriveDbRegistrationStats,
} from "../src/state-db/drive-registration";
import { openHarnessDb, upsertRow } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

const compliant: DriveDbRegistrationStats = {
  planCount: 10,
  expectedPlanCount: 10,
  planRegistryFingerprint: "sha256:current",
  expectedPlanRegistryFingerprint: "sha256:current",
  driveRuns: 10,
  plansWithoutDriveRun: 0,
  workflowRuns: 2,
  workflowOrphans: 0,
  modelRuns: 4,
  modelOrphans: 0,
  skillRecommendations: 10,
  skillRecommendationOrphans: 0,
  skillInvocations: 5,
  skillInvocationOrphans: 0,
  registeredHookEvents: 3,
  hookOrphans: 99,
  modes: REQUIRED_DRIVE_MODELS,
};

describe("drive DB registration lint", () => {
  it("U-DDBREG-001: accepts drive/workflow/model/skill rows with resolvable joins", () => {
    const r = analyzeDriveDbRegistration(compliant);

    expect(r.ok).toBe(true);
    expect(driveDbRegistrationMessages(r)[0]).toContain("OK");
    expect(driveDbRegistrationMessages(r)[0]).toContain("legacy_hook_orphans=99");
  });

  it("U-DDBREG-002: fails when current drive execution projection is missing or orphaned", () => {
    const r = analyzeDriveDbRegistration({
      ...compliant,
      plansWithoutDriveRun: 1,
      workflowOrphans: 1,
      modelOrphans: 1,
      skillRecommendationOrphans: 1,
      skillInvocationOrphans: 1,
      registeredHookEvents: 0,
      modes: ["Forward"],
    });

    expect(r.ok).toBe(false);
    expect(r.violations.map((v) => v.reason)).toEqual(
      expect.arrayContaining([
        "plans_without_drive_run",
        "workflow_orphans",
        "model_orphans",
        "skill_recommendation_orphans",
        "skill_invocation_orphans",
        "missing_registered_hook_events",
        "missing_required_mode",
      ]),
    );
  });

  it("U-DDBREG-007: fails when the Forward-spine plus 10 drive-model registration is incomplete", () => {
    const r = analyzeDriveDbRegistration({
      ...compliant,
      modes: REQUIRED_DRIVE_MODELS.filter((mode) => mode !== "Research"),
    });

    expect(r.ok).toBe(false);
    expect(r.violations).toContainEqual(
      expect.objectContaining({ reason: "missing_required_mode", mode: "Research" }),
    );
    expect(driveDbRegistrationMessages(r)[0]).toContain("missing_required_mode:Research");
  });

  it("U-DDBREG-005: fails when persisted harness.db plan count is stale", () => {
    const r = analyzeDriveDbRegistration({
      ...compliant,
      planCount: 9,
      expectedPlanCount: 10,
    });

    expect(r.ok).toBe(false);
    expect(r.violations).toContainEqual(
      expect.objectContaining({ reason: "stale_plan_registry", count: -1 }),
    );
    expect(driveDbRegistrationMessages(r)[0]).toContain("stale_plan_registry=-1");
  });

  it("U-DDBREG-006: fails when persisted harness.db plan content fingerprint is stale", () => {
    const r = analyzeDriveDbRegistration({
      ...compliant,
      planRegistryFingerprint: "sha256:old",
      expectedPlanRegistryFingerprint: "sha256:new",
    });

    expect(r.ok).toBe(false);
    expect(r.violations).toContainEqual(
      expect.objectContaining({ reason: "stale_plan_registry_fingerprint" }),
    );
    expect(driveDbRegistrationMessages(r)[0]).toContain("stale_plan_registry_fingerprint");
  });

  it("U-DDBREG-008: detects when persisted plan registry stats need current in-memory fallback", () => {
    expect(driveDbStatsMatchCurrentPlanRegistry(compliant)).toBe(true);
    expect(
      driveDbStatsMatchCurrentPlanRegistry({
        ...compliant,
        planRegistryFingerprint: "sha256:old",
        expectedPlanRegistryFingerprint: "sha256:new",
      }),
    ).toBe(false);
    expect(
      driveDbStatsMatchCurrentPlanRegistry({
        ...compliant,
        planCount: compliant.planCount - 1,
      }),
    ).toBe(false);
  });

  it("U-DDBREG-004: only session-scoped token rows are excluded from model orphan checks (PLAN-L7-58)", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      // session telemetry row from `helix telemetry scan` — inherently plan-less, must not count.
      upsertRow(db, {
        table: "model_runs",
        primaryKey: "run_id",
        row: {
          run_id: "tok-1",
          runtime: "claude",
          model: "claude-opus-4-8",
          role: "session",
          drive: "",
          plan_id: "",
          started_at: "",
          completed_at: "",
          evidence_path: "sess.jsonl",
        },
      });
      // genuine orphan: a worker run that points at a non-existent PLAN — must still be flagged.
      upsertRow(db, {
        table: "model_runs",
        primaryKey: "run_id",
        row: {
          run_id: "orphan-1",
          runtime: "claude",
          model: "claude-opus-4-8",
          role: "worker",
          drive: "db",
          plan_id: "PLAN-DOES-NOT-EXIST",
          started_at: "",
          completed_at: "",
          evidence_path: "",
        },
      });
      // Missing/legacy role is not a session telemetry marker, so it must still be audited.
      upsertRow(db, {
        table: "model_runs",
        primaryKey: "run_id",
        row: {
          run_id: "orphan-null-role",
          runtime: "claude",
          model: "claude-opus-4-8",
          role: null,
          drive: "",
          plan_id: "PLAN-DOES-NOT-EXIST-2",
          started_at: "",
          completed_at: "",
          evidence_path: "",
        },
      });
      const stats = collectDriveDbRegistrationStats(db);
      expect(stats.modelRuns).toBe(3);
      expect(stats.modelOrphans).toBe(2); // worker + null-role, not the session row
      expect(stats.planRegistryFingerprint).toMatch(/^sha256:/);
    } finally {
      db.close();
    }
  });

  it("U-DDBREG-003: current harness.db has automatic registration evidence", () => {
    const db = openHarnessDb(":memory:");
    try {
      rebuildHarnessDb({ repoRoot: process.cwd(), db });
      const stats = {
        ...collectDriveDbRegistrationStats(db),
        expectedPlanCount: loadReviewPlans(process.cwd()).length,
        expectedPlanRegistryFingerprint: collectCurrentPlanRegistryFingerprint(process.cwd()),
      };
      const r = analyzeDriveDbRegistration(stats);

      expect(stats).not.toBeNull();
      expect(r.ok).toBe(true);
      expect(stats?.expectedPlanCount).toBe(stats?.planCount);
      expect(stats?.expectedPlanRegistryFingerprint).toBe(stats?.planRegistryFingerprint);
      expect(stats?.driveRuns).toBeGreaterThan(0);
      expect(stats?.workflowOrphans).toBe(0);
      expect(stats?.modelOrphans).toBe(0);
      expect(stats?.skillRecommendationOrphans).toBe(0);
      expect(stats?.skillInvocationOrphans).toBe(0);
      expect(stats?.registeredHookEvents).toBeGreaterThan(0);
      expect(stats.modes).toEqual(expect.arrayContaining(REQUIRED_DRIVE_MODELS));
    } finally {
      db.close();
    }
  });

  it("PLAN-L7-350: refreshed persisted stats make the next drive registration read a fast-path hit", () => {
    const repoRoot = join(tmpdir(), `helix-drive-fast-path-${randomUUID()}`);
    try {
      mkdirSync(join(repoRoot, "docs", "plans"), { recursive: true });
      writeFileSync(
        join(repoRoot, "docs", "plans", "PLAN-L7-350-drive-fast-path.md"),
        [
          "---",
          "plan_id: PLAN-L7-350-drive-fast-path",
          "title: drive fast path fixture",
          "kind: refactor",
          "layer: L7",
          "drive: agent",
          "status: confirmed",
          "updated: 2026-07-06",
          "---",
          "",
          "fixture",
        ].join("\n"),
      );
      rebuildHarnessDb({ repoRoot });
      const refreshed = refreshPersistedDriveDbRegistrationStats(repoRoot);
      const loaded = loadOrBuildDriveDbRegistrationStats(repoRoot);

      expect(refreshed).not.toBeNull();
      expect(loaded).not.toBeNull();
      if (!refreshed) throw new Error("refreshed drive db stats must not be null");
      expect(driveDbStatsMatchCurrentPlanRegistry(refreshed)).toBe(true);
      expect(loaded).toEqual(refreshed);
    } finally {
      rmSync(repoRoot, { force: true, recursive: true });
    }
  });
});
