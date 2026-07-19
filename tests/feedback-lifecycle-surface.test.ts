import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  type FeedbackLifecycleDeps,
  type FeedbackLifecycleEventV1,
  type FeedbackSourceLike,
  feedbackSourceIdentity,
  resolveFeedbackLifecycle,
} from "../src/feedback/lifecycle";
import { autoAckTelemetry, selectFeedbackWithLifecycle } from "../src/feedback/lifecycle-surface";
import { selectTakeoverFeedback } from "../src/feedback/surface";
import { defaultHarnessDbPath, openHarnessDb, upsertRow } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

const NOW = "2026-07-11T12:00:00.000Z";

function source(overrides: Partial<FeedbackSourceLike> = {}): FeedbackSourceLike {
  return {
    sourceTable: "quality_signals",
    sourceId: "signal-1",
    status: "warn",
    severity: "info",
    metric: "skill_firing_rate",
    subject: "PLAN-X",
    ...overrides,
  };
}

function observed(
  item: FeedbackSourceLike,
  occurredAt: string,
  overrides: Partial<FeedbackLifecycleEventV1> = {},
): FeedbackLifecycleEventV1 {
  const identity = feedbackSourceIdentity(item);
  return {
    schemaVersion: 1,
    eventId: `event-${item.sourceId}`,
    operationId: `observe-${item.sourceId}`,
    sourceTable: identity.sourceTable,
    sourceId: identity.sourceId,
    activityEpoch: 1,
    policyEpoch: 1,
    sourceGeneration: "1.1",
    sourcePayloadDigest: identity.payloadDigest,
    sourceBucket: identity.bucket,
    action: "observed",
    fromState: null,
    toState: "open",
    actor: "system",
    reason: "source_active",
    policyVersion: "feedback-lifecycle.v1",
    sessionId: null,
    occurredAt,
    ...overrides,
  };
}

function depsFor(events: unknown[]): {
  deps: FeedbackLifecycleDeps;
  appended: FeedbackLifecycleEventV1[];
} {
  const appended: FeedbackLifecycleEventV1[] = [];
  return {
    appended,
    deps: {
      now: () => NOW,
      readEvents: () => [...events, ...appended],
      withLock: (_owner, fn) => fn(1),
      appendEvent: (event) => appended.push(event),
    },
  };
}

describe("feedback lifecycle surface (PLAN-L7-412)", () => {
  it("U-FLIFE-006: 24h境界でtelemetryだけをackし、gate・future clockを維持する", () => {
    const ttl = source();
    const before = source({ sourceId: "before" });
    const gate = source({ sourceId: "gate", severity: "error", bucket: "gate" });
    const future = source({ sourceId: "future" });
    const events = [
      observed(ttl, "2026-07-10T12:00:00.000Z"),
      observed(before, "2026-07-10T12:00:00.001Z"),
      observed(gate, "2026-07-01T00:00:00.000Z"),
      observed(future, "2026-07-12T00:00:00.000Z"),
    ];
    const { deps, appended } = depsFor(events);
    const result = autoAckTelemetry({ operationId: "ttl-sweep-1", now: NOW }, deps);
    expect(result.ok).toBe(true);
    expect(appended.map((event) => event.sourceId)).toEqual(["signal-1"]);
    expect(appended[0]).toMatchObject({ action: "ack", reason: "telemetry_ttl_24h" });
    expect(result.diagnostics).toContain("clock_invalid:quality_signals:future");
    expect(autoAckTelemetry({ operationId: "ttl-sweep-1", now: NOW }, deps).appended).toEqual([]);
  });

  it("U-FLIFE-006: multi-item TTL sweepはpartial append失敗後のretryで不足分へ収束する", () => {
    const first = source({ sourceId: "first" });
    const second = source({ sourceId: "second" });
    const persisted: unknown[] = [
      observed(first, "2026-07-10T00:00:00.000Z"),
      observed(second, "2026-07-10T00:00:00.000Z"),
    ];
    let writes = 0;
    let failSecond = true;
    const deps: FeedbackLifecycleDeps = {
      now: () => NOW,
      readEvents: () => persisted,
      withLock: (_owner, fn) => fn(1),
      appendEvent: (event) => {
        writes += 1;
        if (failSecond && writes === 2) throw new Error("simulated_partial_sweep");
        persisted.push(event);
      },
    };
    expect(autoAckTelemetry({ operationId: "ttl-partial", now: NOW }, deps).ok).toBe(false);
    failSecond = false;
    const recovered = autoAckTelemetry({ operationId: "ttl-partial", now: NOW }, deps);
    expect(recovered.ok).toBe(true);
    expect(recovered.appended.map((event) => event.sourceId)).toEqual(["second"]);
    expect(
      resolveFeedbackLifecycle(persisted, NOW).projections.filter((row) => row.state === "ack"),
    ).toHaveLength(2);
  });

  it("U-FLIFE-007: feedback_events aliasと直読sourceを同じcanonical lifecycleでfilterする", () => {
    const direct = source({ sourceTable: "findings", sourceId: "finding-1", severity: "warn" });
    const alias = source({
      sourceTable: "feedback_events",
      sourceId: "event-99",
      source_table: "findings",
      source_id: "finding-1",
      severity: "warn",
    });
    const open = observed(direct, "2026-07-10T00:00:00.000Z");
    const ack: FeedbackLifecycleEventV1 = {
      ...open,
      eventId: "ack-finding-1",
      operationId: "ack-finding-1",
      action: "ack",
      fromState: "open",
      toState: "ack",
      actor: "human",
      reason: "reviewed",
      occurredAt: NOW,
    };
    const result = selectFeedbackWithLifecycle({
      sources: [direct, alias],
      lifecycleEvents: [open, ack],
      sessionId: "session-a",
      budget: 10,
    });
    expect(result.items).toEqual([]);
    expect(result.breadcrumb.hiddenByLifecycle.actionable).toBe(2);
  });

  it("U-FLIFE-008: lifecycle unavailable・damaged・digest mismatchで未解決を隠さない", () => {
    const item = source({ severity: "warn", bucket: "actionable" });
    const unavailable = selectFeedbackWithLifecycle({
      sources: [item],
      lifecycleUnavailable: true,
      sessionId: "s",
      budget: 10,
    });
    expect(unavailable.items).toHaveLength(1);
    expect(unavailable.diagnostics).toContain("lifecycle_unavailable_fail_open");

    const damaged = selectFeedbackWithLifecycle({
      sources: [item],
      lifecycleEvents: ["{broken"],
      sessionId: "s",
      budget: 10,
    });
    expect(damaged.items).toHaveLength(1);
    expect(damaged.breadcrumb.damaged).toBe(1);

    const stale = observed(item, "2026-07-10T00:00:00.000Z", {
      sourcePayloadDigest: "a".repeat(64),
      action: "ack",
      fromState: "open",
      toState: "ack",
    });
    const mismatch = selectFeedbackWithLifecycle({
      sources: [item],
      lifecycleEvents: [stale],
      sessionId: "s",
      budget: 10,
    });
    expect(mismatch.items).toHaveLength(1);
  });

  it("U-FLIFE-009: fingerprint dedupeは最高urgencyと全identity traceを保ち理由別breadcrumbを返す", () => {
    const actionable = {
      ...source({ sourceId: "a", severity: "warn", bucket: "actionable" }),
      fingerprint: "fp",
    };
    const gate = {
      ...source({ sourceTable: "findings", sourceId: "g", severity: "error", bucket: "gate" }),
      fingerprint: "fp",
    };
    const budgeted = {
      ...source({ sourceId: "b", severity: "warn", bucket: "actionable" }),
      fingerprint: "other",
    };
    const result = selectFeedbackWithLifecycle({
      sources: [actionable, gate, budgeted],
      lifecycleEvents: [],
      sessionId: "s",
      budget: 1,
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.bucket).toBe("gate");
    expect(result.items[0]?.sourceIdentities).toEqual(["findings:g", "quality_signals:a"]);
    expect(result.breadcrumb.hiddenByBudget.actionable).toBe(1);
  });

  it("U-FLIFE-010: surface receiptは同一sessionだけ抑止し次sessionでは再表示する", () => {
    const item = source({ severity: "warn", bucket: "actionable" });
    const open = observed(item, "2026-07-10T00:00:00.000Z");
    const receipt: FeedbackLifecycleEventV1 = {
      ...open,
      eventId: "surface-session-a",
      operationId: "surface-session-a",
      action: "surface",
      fromState: "open",
      toState: "open",
      sessionId: "session-a",
      reason: "session_surface",
      occurredAt: NOW,
    };
    const same = selectFeedbackWithLifecycle({
      sources: [item],
      lifecycleEvents: [open, receipt],
      sessionId: "session-a",
      budget: 10,
    });
    const next = selectFeedbackWithLifecycle({
      sources: [item],
      lifecycleEvents: [open, receipt],
      sessionId: "session-b",
      budget: 10,
    });
    expect(same.items).toEqual([]);
    expect(same.breadcrumb.hiddenBySessionReceipt.actionable).toBe(1);
    expect(next.items).toHaveLength(1);
  });

  it("U-FLIFE-007: 実SessionStart readerもfeedback_lifecycle projectionを迂回しない", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const item = source({ sourceTable: "findings", sourceId: "finding-live", severity: "warn" });
      const identity = feedbackSourceIdentity(item);
      upsertRow(db, {
        table: "findings",
        primaryKey: "finding_id",
        row: {
          finding_id: "finding-live",
          kind: "missing-test",
          severity: "warn",
          subject_id: "PLAN-X",
          source: "test",
          status: "open",
          evidence_path: "",
        },
      });
      upsertRow(db, {
        table: "feedback_lifecycle",
        primaryKey: "lifecycle_key",
        row: {
          lifecycle_key: "findings:finding-live@1.1",
          source_table: "findings",
          source_id: "finding-live",
          source_generation: "1.1",
          activity_epoch: 1,
          policy_epoch: 1,
          state: "ack",
          bucket: "actionable",
          payload_digest: identity.payloadDigest,
          first_observed_at: "2026-07-10T00:00:00.000Z",
          last_transition_at: NOW,
          last_event_id: "ack-live",
          surfaced_sessions: "",
        },
      });
      // test fixtureと実readerのcanonical payloadを一致させる。
      const actual = feedbackSourceIdentity({
        sourceTable: "findings",
        sourceId: "finding-live",
        status: "open",
        severity: "warn",
        kind: "missing-test",
        subject: "PLAN-X",
      });
      db.prepare("UPDATE feedback_lifecycle SET payload_digest = ? WHERE lifecycle_key = ?").run(
        actual.payloadDigest,
        "findings:finding-live@1.1",
      );
      upsertRow(db, {
        table: "feedback_lifecycle_health",
        primaryKey: "health_id",
        row: {
          health_id: "feedback-lifecycle",
          damaged_count: 0,
          checkpoint_byte_offset: 1,
          checkpoint_event_id: "ack-live",
          projected_at: NOW,
        },
      });
      const hidden = selectTakeoverFeedback(db);
      expect(hidden.total).toBe(0);
      expect(hidden.lifecycleHidden?.actionable).toBe(1);
      db.prepare(
        "UPDATE feedback_lifecycle SET state = 'open', surfaced_sessions = 'session-a' WHERE lifecycle_key = 'findings:finding-live@1.1'",
      ).run();
      const sameSession = selectTakeoverFeedback(db, { sessionId: "session-a" });
      expect(sameSession.total).toBe(0);
      expect(sameSession.sessionReceiptHidden?.actionable).toBe(1);
      expect(selectTakeoverFeedback(db, { sessionId: "session-b" }).total).toBe(1);
      db.prepare(
        "UPDATE feedback_lifecycle SET state = 'ack', surfaced_sessions = '' WHERE lifecycle_key = 'findings:finding-live@1.1'",
      ).run();
      db.prepare(
        "UPDATE feedback_lifecycle_health SET damaged_count = 1 WHERE health_id = 'feedback-lifecycle'",
      ).run();
      expect(selectTakeoverFeedback(db).total).toBe(1);
    } finally {
      db.close();
    }
  });

  it("U-FLIFE-007: production feedback CLIがreconcile→journal→projection→ack filterを通る", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-flife-cli-"));
    const cli = join(process.cwd(), "src", "cli.ts");
    const db = openHarnessDb(defaultHarnessDbPath(root), { repoRoot: root });
    try {
      migrate(db);
      upsertRow(db, {
        table: "findings",
        primaryKey: "finding_id",
        row: {
          finding_id: "finding-cli",
          kind: "missing-test",
          severity: "warn",
          subject_id: "PLAN-X",
          source: "test",
          status: "open",
          evidence_path: "",
        },
      });
    } finally {
      db.close();
    }
    try {
      const first = spawnSync("npx", ["--no-install", "tsx", cli, "feedback", "list", "--json"], {
        cwd: root,
        encoding: "utf8",
      });
      expect(first.status, first.stderr).toBe(0);
      expect(JSON.parse(first.stdout).total).toBe(1);
      const ack = spawnSync(
        "node",
        [cli, "feedback", "ack", "findings", "finding-cli", "1.1", "--reason", "reviewed"],
        { cwd: root, encoding: "utf8" },
      );
      expect(ack.status, ack.stderr).toBe(0);
      const second = spawnSync("npx", ["--no-install", "tsx", cli, "feedback", "list", "--json"], {
        cwd: root,
        encoding: "utf8",
      });
      expect(second.status, second.stderr).toBe(0);
      expect(JSON.parse(second.stdout).total).toBe(0);
      const update = openHarnessDb(defaultHarnessDbPath(root), { repoRoot: root });
      try {
        upsertRow(update, {
          table: "feedback_events",
          primaryKey: "feedback_event_id",
          row: {
            feedback_event_id: "feedback:artifact-only",
            finding_id: "",
            plan_id: "PLAN-X",
            source_table: "artifact_progress",
            source_id: "docs/x.md",
            source_color: "yellow",
            signal_type: "artifact_progress_yellow",
            severity: "info",
            status: "open",
            next_action: "run linked tests",
            created_at: NOW,
          },
        });
      } finally {
        update.close();
      }
      const fallback = spawnSync(
        "npx",
        ["--no-install", "tsx", cli, "feedback", "list", "--json"],
        {
          cwd: root,
          encoding: "utf8",
        },
      );
      expect(fallback.status, fallback.stderr).toBe(0);
      expect(JSON.parse(fallback.stdout).total).toBe(1);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });
});
