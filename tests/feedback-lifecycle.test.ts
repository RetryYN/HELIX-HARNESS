import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { nodeFeedbackLifecycleDeps } from "../src/feedback/lifecycle-node";
import {
  decodeFeedbackLifecycleEvent,
  type FeedbackLifecycleDeps,
  type FeedbackLifecycleEventV1,
  type FeedbackSourceLike,
  feedbackSourceIdentity,
  reconcileFeedbackLifecycle,
  resolveFeedbackLifecycle,
} from "../src/policy/feedback-lifecycle";
import { openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";
import { projectFeedbackLifecycle } from "../src/state-db/projection-writer";

const roots: string[] = [];
const NOW = "2026-07-11T00:00:00.000Z";

function root(): string {
  const value = mkdtempSync(join(tmpdir(), "helix-flife-"));
  roots.push(value);
  return value;
}

function finding(overrides: Partial<FeedbackSourceLike> = {}): FeedbackSourceLike {
  return {
    sourceTable: "findings",
    sourceId: "finding-1",
    status: "open",
    severity: "warn",
    kind: "missing-test",
    subject: "PLAN-X",
    ...overrides,
  };
}

function event(overrides: Partial<FeedbackLifecycleEventV1> = {}): FeedbackLifecycleEventV1 {
  const identity = feedbackSourceIdentity(finding());
  return {
    schemaVersion: 1,
    eventId: "event-1",
    operationId: "op-1",
    sourceTable: "findings",
    sourceId: "finding-1",
    activityEpoch: 1,
    policyEpoch: 1,
    sourceGeneration: "1.1",
    sourcePayloadDigest: identity.payloadDigest,
    sourceBucket: "actionable",
    action: "observed",
    fromState: null,
    toState: "open",
    actor: "system",
    reason: "source_active",
    policyVersion: "feedback-lifecycle.v1",
    sessionId: null,
    occurredAt: NOW,
    ...overrides,
  };
}

afterEach(() => {
  for (const value of roots.splice(0)) rmSync(value, { recursive: true, force: true });
});

describe("feedback lifecycle journal", () => {
  it("U-FLIFE-001: strict codec・UTC・version・状態遷移をfail-closeし、破損をdiagnostic化する", () => {
    expect(decodeFeedbackLifecycleEvent(event()).ok).toBe(true);
    expect(decodeFeedbackLifecycleEvent(event({ schemaVersion: 2 as 1 })).ok).toBe(false);
    expect(
      decodeFeedbackLifecycleEvent(event({ occurredAt: "2026-07-11T09:00:00+09:00" })).ok,
    ).toBe(false);
    expect(
      decodeFeedbackLifecycleEvent(event({ action: "close", fromState: null, toState: "closed" }))
        .ok,
    ).toBe(false);
    expect(
      decodeFeedbackLifecycleEvent(
        event({ action: "surface", fromState: "open", toState: "open", sessionId: "session-1" }),
      ).ok,
    ).toBe(true);
    const resolved = resolveFeedbackLifecycle([event(), "{broken"], NOW);
    expect(resolved.active.get("findings:finding-1")?.state).toBe("open");
    expect(resolved.damaged).toEqual([{ index: 1, reason: "parse_error" }]);
  });

  it("U-FLIFE-002: operation replayは追記ゼロ、異intentは拒否し、SQLite lockで直列化する", () => {
    const repo = root();
    const deps = nodeFeedbackLifecycleDeps(repo, () => NOW);
    const input = { sources: [finding()], mode: "partial" as const, operationId: "op-replay" };
    const first = reconcileFeedbackLifecycle(input, deps);
    const replay = reconcileFeedbackLifecycle(input, deps);
    const conflict = reconcileFeedbackLifecycle(
      { ...input, sources: [finding({ sourceId: "finding-other" })] },
      deps,
    );
    expect(first.ok).toBe(true);
    expect(first.appended).toHaveLength(1);
    expect(replay).toMatchObject({ ok: true, appended: [], diagnostics: ["idempotent_replay"] });
    expect(conflict).toMatchObject({ ok: false, reason: "operation_intent_conflict" });
    const lines = readFileSync(join(repo, ".helix/logs/feedback-lifecycle.jsonl"), "utf8")
      .trim()
      .split("\n");
    expect(lines).toHaveLength(1);
  });

  it("U-FLIFE-003: append後のcommit不明をoperationId再読で回収し、journalからstateを再構築する", () => {
    const rows: unknown[] = [];
    const base = nodeFeedbackLifecycleDeps(root(), () => NOW);
    const deps: FeedbackLifecycleDeps = {
      ...base,
      readEvents: () => rows,
      appendEvent: (value) => {
        rows.push(JSON.stringify(value));
        throw new Error("simulated_commit_unknown");
      },
    };
    const result = reconcileFeedbackLifecycle(
      { sources: [finding()], mode: "partial", operationId: "op-crash" },
      deps,
    );
    expect(result).toMatchObject({
      ok: true,
      recovered: true,
      diagnostics: ["coordination_commit_unknown_recovered"],
    });
    expect(resolveFeedbackLifecycle(rows, NOW).active.get("findings:finding-1")?.state).toBe(
      "open",
    );

    const multiRows: unknown[] = [];
    let failSecond = false;
    let operationAppendCount = 0;
    const multiDeps: FeedbackLifecycleDeps = {
      ...base,
      readEvents: () => multiRows,
      appendEvent: (value) => {
        operationAppendCount += 1;
        if (failSecond && operationAppendCount === 2) throw new Error("second_append_failed");
        multiRows.push(JSON.stringify(value));
      },
    };
    expect(
      reconcileFeedbackLifecycle(
        { sources: [finding()], mode: "partial", operationId: "op-multi-base" },
        multiDeps,
      ).ok,
    ).toBe(true);
    failSecond = true;
    operationAppendCount = 0;
    const interrupted = reconcileFeedbackLifecycle(
      {
        sources: [finding({ severity: "error" })],
        mode: "partial",
        operationId: "op-multi-escalate",
      },
      multiDeps,
    );
    expect(interrupted).toMatchObject({ ok: false, reason: "second_append_failed" });
    expect(resolveFeedbackLifecycle(multiRows, NOW).active.get("findings:finding-1")?.state).toBe(
      "superseded",
    );
    failSecond = false;
    operationAppendCount = 0;
    const recovered = reconcileFeedbackLifecycle(
      {
        sources: [finding({ severity: "error" })],
        mode: "partial",
        operationId: "op-multi-escalate",
      },
      multiDeps,
    );
    expect(recovered).toMatchObject({
      ok: true,
      recovered: true,
      diagnostics: ["partial_operation_recovered"],
    });
    expect(recovered.appended).toHaveLength(1);
    expect(resolveFeedbackLifecycle(multiRows, NOW).active.get("findings:finding-1")).toMatchObject(
      { state: "open", sourceGeneration: "1.2" },
    );
  });

  it("U-FLIFE-004: 同一generationのterminalは再投影してもopenへ復活しない", () => {
    const repo = root();
    const deps = nodeFeedbackLifecycleDeps(repo, () => NOW);
    reconcileFeedbackLifecycle(
      { sources: [finding()], mode: "partial", operationId: "op-observe" },
      deps,
    );
    const closed = reconcileFeedbackLifecycle(
      {
        sources: [],
        mode: "full",
        completeTables: ["findings"],
        operationId: "op-close",
      },
      deps,
    );
    const duplicateProjection = reconcileFeedbackLifecycle(
      { sources: [finding()], mode: "partial", operationId: "op-reproject" },
      deps,
    );
    expect(closed.appended[0]?.toState).toBe("closed");
    expect(duplicateProjection.appended[0]).toMatchObject({
      action: "observed",
      sourceGeneration: "2.1",
      toState: "open",
    });
    const view = resolveFeedbackLifecycle(deps.readEvents(), NOW);
    expect(view.projections.find((row) => row.sourceGeneration === "1.1")?.state).toBe("closed");
  });

  it("U-FLIFE-005: active再投影とpayload driftは世代/firstSeenを固定し、authoritative再activeだけ世代を進める", () => {
    const repo = root();
    let now = NOW;
    const deps = nodeFeedbackLifecycleDeps(repo, () => now);
    reconcileFeedbackLifecycle(
      { sources: [finding()], mode: "partial", operationId: "op-generation-1" },
      deps,
    );
    now = "2026-07-11T01:00:00.000Z";
    const repeated = reconcileFeedbackLifecycle(
      {
        sources: [finding({ severity: "error" })],
        mode: "partial",
        operationId: "op-payload-drift",
      },
      deps,
    );
    expect(repeated.appended[1]).toMatchObject({ sourceGeneration: "1.2", sourceBucket: "gate" });
    const view = resolveFeedbackLifecycle(deps.readEvents(), now);
    expect(view.projections.find((row) => row.sourceGeneration === "1.1")?.firstObservedAt).toBe(
      NOW,
    );
    expect(view.active.get("findings:finding-1")?.sourceGeneration).toBe("1.2");
  });

  it("U-FLIFE-005: direct sourceとfeedback aliasはreconcile前に同identityへ束ねる", () => {
    const repo = root();
    const deps = nodeFeedbackLifecycleDeps(repo, () => NOW);
    const direct = finding();
    const alias: FeedbackSourceLike = {
      ...finding(),
      sourceTable: "feedback_events",
      sourceId: "feedback-1",
      source_table: "findings",
      source_id: "finding-1",
    };
    const result = reconcileFeedbackLifecycle(
      { sources: [direct, alias], mode: "partial", operationId: "op-alias" },
      deps,
    );
    expect(result.ok).toBe(true);
    expect(result.appended).toHaveLength(1);
    expect(resolveFeedbackLifecycle(deps.readEvents(), NOW).damaged).toEqual([]);
  });

  it("U-FLIFE-003: append-only journalからharness.db projectionを再構築する", () => {
    const repo = root();
    mkdirSync(join(repo, ".helix", "logs"), { recursive: true });
    writeFileSync(
      join(repo, ".helix", "logs", "feedback-lifecycle.jsonl"),
      `${JSON.stringify(event())}\n`,
      "utf8",
    );
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      projectFeedbackLifecycle(repo, db);
      expect(
        db
          .prepare(
            "SELECT source_table, source_id, source_generation, state FROM feedback_lifecycle",
          )
          .get(),
      ).toEqual({
        source_table: "findings",
        source_id: "finding-1",
        source_generation: "1.1",
        state: "open",
      });
    } finally {
      db.close();
    }
  });
});
