import { spawn } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

const tsxCli = join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");

import { validateMemoryEntry } from "../src/memory/memory-v2";
import {
  appendContinuationEventFile,
  appendDeliveryJournalFile,
  buildContinuationEvent,
  buildDeliveryEvent,
  buildDeliveryJournalEvent,
  type ContinuationEvent,
  parseContinuationEventLog,
  parseDeliveryJournal,
  planCompletionContinuationPaths,
  planLegacyNoteMigration,
  projectContinuationEvent,
  projectDeliveryEvent,
  queryContinuationIntegration,
  rebuildContinuationProjection,
  rebuildDeliveryReceipts,
  resolveContinuationPrecedence,
  writeContinuationEvent,
  writeDeliveryEvent,
  writePlanCompletionContinuation,
} from "../src/runtime/continuation";
import { type HarnessDb, openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

const dbs: HarnessDb[] = [];
function runBun(script: string, env: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [tsxCli, "-e", script], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += String(chunk)));
    child.stderr.on("data", (chunk) => (stderr += String(chunk)));
    child.on("error", reject);
    child.on("close", (code) =>
      code === 0 ? resolve(stdout.trim()) : reject(new Error(`child failed ${code}: ${stderr}`)),
    );
  });
}
function db(): HarnessDb {
  const value = openHarnessDb(":memory:");
  migrate(value);
  dbs.push(value);
  return value;
}
afterEach(() => {
  for (const value of dbs.splice(0)) value.close();
});

function event(overrides: Partial<ContinuationEvent> = {}): ContinuationEvent {
  return {
    ...buildContinuationEvent({
      eventId: "evt-1",
      operationId: "complete:session-1:1",
      sessionId: "session-1",
      eventSeq: 1,
      recordedAt: "2026-07-11T00:00:00Z",
      payload: {
        planId: "PLAN-L7-416",
        eventKind: "plan_complete",
        nextAction: "review",
        memoryRef: "memory:takeover:next",
      },
    }),
    ...overrides,
  };
}

describe("PLAN-L7-416 Sprint 2 event-first continuation", () => {
  it("IT-CONT-03: PLAN complete adapterはcanonical pathへevent-firstで公開後のみactive planをclearする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-plan-complete-"));
    const clears: string[] = [];
    const input = {
      repoRoot: root,
      sessionId: "session-complete-1",
      operationId: "plan-complete:PLAN-L7-416:commit-abc",
      completedPlanId: "PLAN-L7-416",
      nextAction: "review",
      memoryRef: null,
      recordedAt: "2026-07-11T01:00:00Z",
    };
    try {
      const paths = planCompletionContinuationPaths(root);
      expect(paths).toEqual({
        journal: join(root, ".helix", "audit", "continuation-events.jsonl"),
        checkpoint: join(root, ".helix", "state", "continuation-checkpoint.json"),
        database: join(root, ".helix", "harness.db"),
      });
      const first = writePlanCompletionContinuation(input, {
        clearActivePlan: () => clears.push("clear"),
      });
      expect(first).toMatchObject({
        ok: true,
        projected: true,
        published: true,
      });
      expect(clears).toEqual(["clear"]);
      expect(parseContinuationEventLog(readFileSync(paths.journal, "utf8"))).toEqual([first.event]);
      expect(JSON.parse(readFileSync(paths.checkpoint, "utf8"))).toMatchObject({
        schemaVersion: 1,
        eventId: first.event.eventId,
        eventSeq: first.event.eventSeq,
        payloadHash: first.event.payloadHash,
      });

      const replay = writePlanCompletionContinuation(input, {
        clearActivePlan: () => clears.push("clear"),
      });
      expect(replay.event).toEqual(first.event);
      expect(parseContinuationEventLog(readFileSync(paths.journal, "utf8"))).toHaveLength(1);
      expect(clears).toEqual(["clear", "clear"]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("IT-CONT-04: checkpoint publish失敗時はactive planをclearしない", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-plan-complete-fail-"));
    const clears: string[] = [];
    try {
      mkdirSync(join(root, ".helix"), { recursive: true });
      writeFileSync(join(root, ".helix", "state"), "checkpoint parent collision");
      const result = writePlanCompletionContinuation(
        {
          repoRoot: root,
          sessionId: "session-complete-fail",
          operationId: "plan-complete:PLAN-L7-416:commit-fail",
          completedPlanId: "PLAN-L7-416",
          nextAction: null,
          memoryRef: null,
          recordedAt: "2026-07-11T01:01:00Z",
        },
        { clearActivePlan: () => clears.push("clear") },
      );
      expect(result).toMatchObject({
        ok: false,
        projected: true,
        published: false,
        findings: ["checkpoint_publish_failed"],
      });
      expect(clears).toEqual([]);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("IT-CONT-02: continuation semantic keysのUNIQUE indexを実migrationが作成する", () => {
    const database = db();
    const indexes = database.prepare("PRAGMA index_list(session_events)").all();
    const uniqueNames = indexes
      .filter((row) => Number(row.unique) === 1)
      .map((row) => String(row.name));
    expect(uniqueNames).toEqual(
      expect.arrayContaining([
        "idx_session_events_session_seq",
        "idx_session_events_operation",
        "idx_session_events_event_id",
      ]),
    );
  });
  it("IT-CONT-02: canonical JSONL writerはfsync境界でoperation replayをdedupeする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-continuation-"));
    const path = join(root, "session-log.jsonl");
    const coordinationDb = db();
    try {
      expect(appendContinuationEventFile(path, event(), coordinationDb)).toMatchObject({
        appended: true,
      });
      const firstEnd = readFileSync(path).byteLength;
      const second = event({
        eventId: "evt-2",
        operationId: "complete:session-1:2",
        eventSeq: 2,
      });
      expect(appendContinuationEventFile(path, second, coordinationDb)).toMatchObject({
        appended: true,
      });
      expect(appendContinuationEventFile(path, event(), coordinationDb)).toEqual({
        appended: false,
        byteOffset: firstEnd,
      });
      expect(parseContinuationEventLog(readFileSync(path, "utf8"))).toHaveLength(2);
      expect(() =>
        appendContinuationEventFile(
          path,
          buildContinuationEvent({
            eventId: "evt-intent-conflict",
            operationId: event().operationId,
            sessionId: "session-1",
            eventSeq: 3,
            recordedAt: "2026-07-11T00:03:00Z",
            payload: {
              planId: "PLAN-L7-416",
              eventKind: "plan_complete",
              nextAction: "conflicting action",
              memoryRef: null,
            },
          }),
          coordinationDb,
        ),
      ).toThrow(/operation intent conflict/);
      expect(() =>
        appendContinuationEventFile(
          path,
          event({ payloadHash: `sha256:${"9".repeat(64)}` }),
          coordinationDb,
        ),
      ).toThrow(/hash mismatch/);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("IT-CONT-02: 2 SQLite connectionのfenceでparallel replayを1 logical appendへ収束する", () => {
    const root = join(mkdtempSync(join(tmpdir(), "helix-continuation-race-")), ".helix");
    mkdirSync(root, { recursive: true });
    const dbPath = join(root, "harness.db");
    const journal = join(root, "session-log.jsonl");
    const first = openHarnessDb(dbPath, { repoRoot: dirname(root) });
    const second = openHarnessDb(dbPath, { repoRoot: dirname(root) });
    migrate(first);
    migrate(second);
    dbs.push(first, second);
    try {
      expect(appendContinuationEventFile(journal, event(), first)).toMatchObject({
        appended: true,
      });
      expect(appendContinuationEventFile(journal, event(), second)).toMatchObject({
        appended: false,
      });
      expect(parseContinuationEventLog(readFileSync(journal, "utf8"))).toHaveLength(1);
    } finally {
      first.close();
      second.close();
      dbs.splice(dbs.indexOf(first), 1);
      dbs.splice(dbs.indexOf(second), 1);
      rmSync(dirname(root), { recursive: true, force: true });
    }
  });

  it("IT-CONT-02: 2 processが同intentを同時appendしても1 eventへ収束する", async () => {
    const root = join(mkdtempSync(join(tmpdir(), "helix-continuation-process-race-")), ".helix");
    mkdirSync(root, { recursive: true });
    const dbPath = join(root, "harness.db");
    const journal = join(root, "session-log.jsonl");
    const setup = openHarnessDb(dbPath, { repoRoot: dirname(root) });
    migrate(setup);
    setup.close();
    const script = [
      'import { openHarnessDb } from "./src/state-db/index.ts";',
      'import { appendContinuationEventFile } from "./src/runtime/continuation.ts";',
      "const db=openHarnessDb(process.env.TEST_DB,{repoRoot:process.env.TEST_REPO_ROOT});",
      "try { console.log(JSON.stringify(appendContinuationEventFile(process.env.TEST_JOURNAL, JSON.parse(process.env.TEST_EVENT), db))); } finally { db.close(); }",
    ].join("");
    try {
      const outputs = await Promise.all([
        runBun(script, {
          TEST_DB: dbPath,
          TEST_REPO_ROOT: dirname(root),
          TEST_JOURNAL: journal,
          TEST_EVENT: JSON.stringify(event()),
        }),
        runBun(script, {
          TEST_DB: dbPath,
          TEST_REPO_ROOT: dirname(root),
          TEST_JOURNAL: journal,
          TEST_EVENT: JSON.stringify(event()),
        }),
      ]);
      expect(outputs.map((value) => JSON.parse(value).appended).sort()).toEqual([false, true]);
      expect(parseContinuationEventLog(readFileSync(journal, "utf8"))).toHaveLength(1);
    } finally {
      rmSync(dirname(root), { recursive: true, force: true });
    }
  });
  it("U-HRET-007: append失敗時はprojection/checkpoint/memoryを一切公開しない", () => {
    const calls: string[] = [];
    const result = writeContinuationEvent(event(), {
      appendEvent: () => {
        calls.push("append");
        throw new Error("disk full");
      },
      projectEvent: () => {
        calls.push("project");
        return "inserted";
      },
      publishCheckpoint: () => calls.push("publish"),
      writeMemoryBreadcrumb: () => calls.push("memory"),
    });
    expect(result).toMatchObject({
      ok: false,
      published: false,
      projected: false,
      findings: ["event_append_failed"],
    });
    expect(calls).toEqual(["append"]);
  });

  it("U-HRET-007: checkpointはevent sequence/hash/byte offsetへ束縛する", () => {
    const checkpoints: unknown[] = [];
    const result = writeContinuationEvent(event(), {
      appendEvent: () => ({ byteOffset: 4096, appended: true }),
      projectEvent: () => "inserted",
      publishCheckpoint: (checkpoint) => checkpoints.push(checkpoint),
    });
    expect(result.ok).toBe(true);
    expect(checkpoints).toEqual([
      expect.objectContaining({
        eventId: "evt-1",
        eventSeq: 1,
        byteOffset: 4096,
      }),
    ]);
  });

  it("IT-CONT-02: append後projection前crashはreplayし、projection後memory前crashはDBを正とする", () => {
    const database = db();
    const log: ContinuationEvent[] = [];
    const checkpoints: string[] = [];
    const first = writeContinuationEvent(event(), {
      appendEvent: (value) => {
        log.push(value);
        return { byteOffset: 128, appended: true };
      },
      projectEvent: () => {
        throw new Error("simulated crash window");
      },
      publishCheckpoint: () => checkpoints.push("unexpected"),
    });
    expect(first).toMatchObject({
      ok: false,
      projected: false,
      published: false,
    });
    expect(rebuildContinuationProjection(database, log)).toEqual({
      inserted: 1,
      deduped: 0,
    });

    const replay = writeContinuationEvent(event(), {
      appendEvent: () => ({ byteOffset: 128, appended: false }),
      projectEvent: (value) => projectContinuationEvent(database, value),
      publishCheckpoint: (value) => checkpoints.push(value.eventId),
      writeMemoryBreadcrumb: () => {
        throw new Error("memory unavailable");
      },
    });
    expect(replay).toMatchObject({
      ok: true,
      projected: true,
      published: true,
      memoryWritten: false,
      findings: ["memory_breadcrumb_failed"],
    });
    expect(checkpoints).toEqual(["evt-1"]);
    expect(database.prepare("SELECT COUNT(*) AS n FROM session_events").get()).toMatchObject({
      n: 1,
    });
  });

  it("IT-CONT-02: DB消失から全rebuildでき、同sequence同payloadをdedupeし異payloadをfail-closeする", () => {
    const original = event();
    const database = db();
    expect(rebuildContinuationProjection(database, [original, original])).toEqual({
      inserted: 1,
      deduped: 1,
    });
    const conflict = buildContinuationEvent({
      eventId: "evt-conflict",
      operationId: "complete:session-1:1-conflict",
      sessionId: original.sessionId,
      eventSeq: original.eventSeq,
      recordedAt: "2026-07-11T00:01:00Z",
      payload: {
        planId: "PLAN-L7-416",
        eventKind: "plan_complete",
        nextAction: "different",
        memoryRef: null,
      },
    });
    expect(() => projectContinuationEvent(database, conflict)).toThrow(/sequence_payload_conflict/);
    const operationConflict = buildContinuationEvent({
      eventId: "evt-operation-conflict",
      operationId: original.operationId,
      sessionId: original.sessionId,
      eventSeq: 2,
      recordedAt: "2026-07-11T00:02:00Z",
      payload: {
        planId: original.planId,
        eventKind: original.eventKind,
        nextAction: "different",
        memoryRef: original.memoryRef,
      },
    });
    expect(() => projectContinuationEvent(database, operationConflict)).toThrow(/operation intent/);
    expect(() =>
      projectContinuationEvent(
        database,
        buildContinuationEvent({
          eventId: original.eventId,
          operationId: "different-operation",
          sessionId: original.sessionId,
          eventSeq: 3,
          recordedAt: "2026-07-11T00:03:00Z",
          payload: {
            planId: null,
            eventKind: "checkpoint",
            nextAction: null,
            memoryRef: null,
          },
        }),
      ),
    ).toThrow(/event id conflict/);
    expect(() =>
      projectContinuationEvent(
        database,
        buildContinuationEvent({
          eventId: "evt-regression",
          operationId: "operation-regression",
          sessionId: original.sessionId,
          eventSeq: 0,
          recordedAt: "2026-07-11T00:04:00Z",
          payload: {
            planId: null,
            eventKind: "checkpoint",
            nextAction: null,
            memoryRef: null,
          },
        }),
      ),
    ).toThrow(/sequence regression/);
  });

  it("IT-CONT-02: event logはpayload hash不一致・truncated JSONをsilent skipしない", () => {
    const valid = event();
    expect(parseContinuationEventLog(`${JSON.stringify(valid)}\n`)).toEqual([valid]);
    expect(() =>
      parseContinuationEventLog(`${JSON.stringify({ ...valid, nextAction: "tampered" })}\n`),
    ).toThrow(/hash mismatch/);
    expect(() => parseContinuationEventLog('{"eventId":')).toThrow();
    expect(() =>
      buildContinuationEvent({
        eventId: "evt-offset",
        operationId: "op-offset",
        sessionId: "session-1",
        eventSeq: 2,
        recordedAt: "2026-07-11T09:00:00+09:00",
        payload: {
          planId: null,
          eventKind: "checkpoint",
          nextAction: null,
          memoryRef: null,
        },
      }),
    ).toThrow(/timestamp/);
  });

  it("U-HRET-006 / IT-CONT-01: DB precedenceを維持しmemory競合をfinding化する", () => {
    const dbView = {
      planId: "PLAN-L7-416",
      nextAction: "review",
      sourceEventSeq: 4,
    };
    const memory = {
      planId: "PLAN-OLD",
      nextAction: "legacy",
      sourceEventSeq: 3,
    };
    expect(resolveContinuationPrecedence({ db: dbView, memory })).toEqual({
      value: dbView,
      findings: ["db_memory_conflict"],
    });
    expect(resolveContinuationPrecedence({ db: null, memory })).toEqual({
      value: null,
      findings: ["db_projection_missing"],
    });
  });

  it("IT-CONT-01: real SQLite queryをmemory/feedbackへprovenance付きjoinする", () => {
    const database = db();
    projectContinuationEvent(database, event());
    database
      .prepare(
        "INSERT INTO feedback_events (feedback_event_id, finding_id, plan_id, source_table, source_id, source_color, signal_type, severity, status, next_action, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "feedback-1",
        "finding-1",
        "PLAN-L7-416",
        "findings",
        "finding-1",
        "red",
        "gate",
        "high",
        "open",
        "review",
        "2026-07-11T00:00:00Z",
      );
    database
      .prepare(
        "INSERT INTO feedback_events (feedback_event_id, finding_id, plan_id, source_table, source_id, source_color, signal_type, severity, status, next_action, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "feedback-closed",
        "finding-closed",
        "PLAN-L7-416",
        "findings",
        "finding-closed",
        "red",
        "gate",
        "high",
        "open",
        "ignore",
        "2026-07-11T00:00:01Z",
      );
    database
      .prepare(
        "INSERT INTO feedback_lifecycle (lifecycle_key, source_table, source_id, source_generation, activity_epoch, policy_epoch, state, bucket, payload_digest, first_observed_at, last_transition_at, last_event_id, actor, reason, policy_version, surfaced_sessions) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      )
      .run(
        "findings:finding-closed",
        "findings",
        "finding-closed",
        "generation-1",
        1,
        1,
        "ack",
        "gate",
        `sha256:${"1".repeat(64)}`,
        "2026-07-11T00:00:00Z",
        "2026-07-11T00:00:01Z",
        "lifecycle-1",
        "system",
        "acknowledged",
        "v1",
        "",
      );
    const joined = queryContinuationIntegration({
      db: database,
      sessionId: "session-1",
      now: "2026-07-11T00:00:00Z",
      memoryEvents: [
        {
          schemaVersion: 2,
          id: "memory-1",
          layer: "takeover",
          key: "continuation:session-1",
          body: JSON.stringify({
            planId: "PLAN-OLD",
            nextAction: "legacy",
            sourceEventSeq: 0,
          }),
          type: "state",
          provenance: {
            planId: "PLAN-L7-416",
            sessionId: "session-1",
            runtime: "codex",
            origin: "continuation-test",
          },
          lifecycle: {
            state: "active",
            expiresAt: "2026-07-12T00:00:00Z",
            consumedAt: null,
            consumedBy: null,
          },
          links: [],
          supersedes: null,
          createdAt: "2026-07-11T00:00:00Z",
        },
      ],
    });
    expect(joined).toMatchObject({
      continuation: {
        planId: "PLAN-L7-416",
        nextAction: "review",
        sourceEventSeq: 1,
        memoryRef: "memory:takeover:next",
        provenance: "harness.db:session_events",
      },
      feedback: [{ feedbackEventId: "feedback-1", status: "open" }],
      findings: ["db_memory_conflict"],
    });
  });

  it("U-HRET-003: legacy noteはprovenance/TTL/source link付き最大1件だけを移管する", () => {
    const valid = {
      sourceDigest: `sha256:${"e".repeat(64)}`,
      body: "次はcontinuation projectionを検証する",
      recordedAt: "2026-07-11T00:00:00Z",
      expiresAt: "2026-07-17T00:00:00Z",
    };
    const result = planLegacyNoteMigration(
      [
        {
          ...valid,
          sourceDigest: "broken",
          body: "token=secret",
          expiresAt: null,
        },
        valid,
        {
          ...valid,
          sourceDigest: `sha256:${"f".repeat(64)}`,
          body: "second valid note",
        },
      ],
      {
        now: "2026-07-11T00:00:00Z",
        isSecret: (value) => value.includes("token="),
        isPii: (value) => value.includes("@example.com"),
      },
    );
    expect(result.migration).toMatchObject({
      operationId: `handover-retirement:${valid.sourceDigest}`,
      layer: "takeover",
      type: "state",
      provenance: { origin: "legacy-current-note", runtime: "system" },
      links: [`harness:source-digest-${valid.sourceDigest.slice("sha256:".length)}`],
    });
    if (!result.migration) throw new Error("expected migration");
    expect(validateMemoryEntry(result.migration, "2026-07-11T00:00:00Z", () => false)).toEqual({
      ok: true,
    });
  });

  it("U-HRET-003: secret/PII/期限不明/7日超過noteは書かずdiagnosticへ送る", () => {
    const base = {
      sourceDigest: `sha256:${"a".repeat(64)}`,
      recordedAt: "2026-07-11T00:00:00Z",
    };
    const result = planLegacyNoteMigration(
      [
        { ...base, body: "token=abc", expiresAt: "2026-07-12T00:00:00Z" },
        {
          ...base,
          body: "person@example.com",
          expiresAt: "2026-07-12T00:00:00Z",
        },
        { ...base, body: "missing", expiresAt: null },
        { ...base, body: "too long", expiresAt: "2026-07-19T00:00:00Z" },
      ],
      {
        now: "2026-07-11T00:00:00Z",
        isSecret: (value) => value.includes("token="),
        isPii: (value) => value.includes("@"),
      },
    );
    expect(result.migration).toBeNull();
    expect(result.diagnostics.length).toBe(4);
  });

  it("U-HRET-005: stable deliveryId、状態遷移、dedupe、異digest conflictを強制する", () => {
    const database = db();
    const base = {
      entryId: "entry-1",
      consumerId: "codex-session-start",
      payloadDigest: `sha256:${"a".repeat(64)}`,
      recordedAt: "2026-07-11T00:00:00Z",
      retentionUntil: "2026-07-18T00:00:00Z",
      sourceRetentionUntil: "2026-07-18T00:00:00Z",
    } as const;
    const pending = buildDeliveryEvent({ ...base, status: "pending" });
    expect(pending.deliveryId).toBe("entry-1:codex-session-start");
    expect(projectDeliveryEvent(database, pending)).toBe("inserted");
    expect(projectDeliveryEvent(database, pending)).toBe("deduped");
    expect(
      projectDeliveryEvent(database, buildDeliveryEvent({ ...base, status: "delivered" })),
    ).toBe("updated");
    expect(
      projectDeliveryEvent(database, buildDeliveryEvent({ ...base, status: "acknowledged" })),
    ).toBe("updated");
    expect(() =>
      projectDeliveryEvent(
        database,
        buildDeliveryEvent({
          ...base,
          status: "expired",
          recordedAt: "2026-07-11T00:01:00Z",
        }),
      ),
    ).toThrow(/transition_invalid/);
    expect(() =>
      projectDeliveryEvent(
        database,
        buildDeliveryEvent({
          ...base,
          payloadDigest: `sha256:${"b".repeat(64)}`,
          status: "acknowledged",
        }),
      ),
    ).toThrow(/payload_conflict/);
    expect(() =>
      buildDeliveryEvent({
        ...base,
        status: "pending",
        sourceRetentionUntil: "2026-07-19T00:00:00Z",
      }),
    ).toThrow(/retention/);
    expect(() => buildDeliveryEvent({ ...base, entryId: "a:b", status: "pending" })).toThrow(
      /identity/,
    );
    expect(() =>
      buildDeliveryEvent({
        ...base,
        status: "pending",
        recordedAt: "2026-07-11T09:00:00+09:00",
      }),
    ).toThrow(/timestamp/);
  });

  it("U-HRET-005: consumer Aのterminal receiptはconsumer Bを抑止しない", () => {
    const database = db();
    const common = {
      entryId: "entry-shared",
      payloadDigest: `sha256:${"6".repeat(64)}`,
      recordedAt: "2026-07-11T00:00:00Z",
      retentionUntil: "2026-07-18T00:00:00Z",
      sourceRetentionUntil: "2026-07-18T00:00:00Z",
    };
    for (const consumerId of ["consumer-a", "consumer-b"]) {
      projectDeliveryEvent(
        database,
        buildDeliveryEvent({ ...common, consumerId, status: "pending" }),
      );
      projectDeliveryEvent(
        database,
        buildDeliveryEvent({ ...common, consumerId, status: "delivered" }),
      );
    }
    projectDeliveryEvent(
      database,
      buildDeliveryEvent({
        ...common,
        consumerId: "consumer-a",
        status: "acknowledged",
      }),
    );
    expect(
      database
        .prepare("SELECT consumer_id, status FROM delivery_receipts ORDER BY consumer_id")
        .all(),
    ).toEqual([
      expect.objectContaining({
        consumer_id: "consumer-a",
        status: "acknowledged",
      }),
      expect.objectContaining({
        consumer_id: "consumer-b",
        status: "delivered",
      }),
    ]);
  });

  it("U-HRET-005: acknowledged/expiredの2 process terminal競合は一方だけへCAS収束する", async () => {
    const root = join(mkdtempSync(join(tmpdir(), "helix-delivery-terminal-race-")), ".helix");
    mkdirSync(root, { recursive: true });
    const dbPath = join(root, "harness.db");
    const setup = openHarnessDb(dbPath, { repoRoot: dirname(root) });
    migrate(setup);
    const common = {
      entryId: "entry-terminal",
      consumerId: "consumer-race",
      payloadDigest: `sha256:${"5".repeat(64)}`,
      recordedAt: "2026-07-11T00:00:00Z",
      retentionUntil: "2026-07-18T00:00:00Z",
      sourceRetentionUntil: "2026-07-18T00:00:00Z",
    };
    projectDeliveryEvent(setup, buildDeliveryEvent({ ...common, status: "pending" }));
    projectDeliveryEvent(setup, buildDeliveryEvent({ ...common, status: "delivered" }));
    setup.close();
    const script = [
      'import { openHarnessDb } from "./src/state-db/index.ts";',
      'import { projectDeliveryEvent } from "./src/runtime/continuation.ts";',
      "const db=openHarnessDb(process.env.TEST_DB,{repoRoot:process.env.TEST_REPO_ROOT});",
      "try { try { console.log(projectDeliveryEvent(db, JSON.parse(process.env.TEST_DELIVERY))); } catch (error) { console.log('error:' + error.message); } } finally { db.close(); }",
    ].join("");
    try {
      const [ack, expired] = await Promise.all([
        runBun(script, {
          TEST_DB: dbPath,
          TEST_REPO_ROOT: dirname(root),
          TEST_DELIVERY: JSON.stringify(
            buildDeliveryEvent({
              ...common,
              status: "acknowledged",
              recordedAt: "2026-07-11T00:01:00Z",
            }),
          ),
        }),
        runBun(script, {
          TEST_DB: dbPath,
          TEST_REPO_ROOT: dirname(root),
          TEST_DELIVERY: JSON.stringify(
            buildDeliveryEvent({
              ...common,
              status: "expired",
              recordedAt: "2026-07-11T00:01:00Z",
            }),
          ),
        }),
      ]);
      expect([ack, expired].filter((value) => value === "updated")).toHaveLength(1);
      expect([ack, expired].filter((value) => value.startsWith("error:"))).toHaveLength(1);
      const verify = openHarnessDb(dbPath, { repoRoot: dirname(root) });
      const row = verify
        .prepare("SELECT status FROM delivery_receipts WHERE delivery_id = ?")
        .get("entry-terminal:consumer-race");
      verify.close();
      expect(["acknowledged", "expired"]).toContain(row?.status);
    } finally {
      rmSync(dirname(root), { recursive: true, force: true });
    }
  });

  it("U-HRET-005: append-only delivery eventsからreceiptを再構築する", () => {
    const base = {
      entryId: "entry-2",
      consumerId: "claude-session-start",
      payloadDigest: `sha256:${"c".repeat(64)}`,
      recordedAt: "2026-07-11T00:00:00Z",
      retentionUntil: "2026-07-18T00:00:00Z",
      sourceRetentionUntil: "2026-07-18T00:00:00Z",
    } as const;
    const events = [
      buildDeliveryEvent({ ...base, status: "pending" }),
      buildDeliveryEvent({
        ...base,
        status: "delivered",
        recordedAt: "2026-07-11T00:01:00Z",
      }),
      buildDeliveryEvent({
        ...base,
        status: "expired",
        recordedAt: "2026-07-18T00:00:00Z",
      }),
    ];
    const database = db();
    expect(rebuildDeliveryReceipts(database, events)).toEqual({
      inserted: 1,
      updated: 2,
      deduped: 0,
    });
    expect(
      database
        .prepare("SELECT status FROM delivery_receipts WHERE delivery_id = ?")
        .get(events[0].deliveryId),
    ).toMatchObject({ status: "expired" });
  });

  it("U-HRET-005: durable delivery JSONLをstrict parseしDB消失からreceipt再構築する", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-delivery-"));
    const path = join(root, "delivery.jsonl");
    const coordinationDb = db();
    const pending = buildDeliveryJournalEvent({
      eventId: "delivery-event-1",
      operationId: "delivery:entry-4:codex:pending",
      delivery: buildDeliveryEvent({
        entryId: "entry-4",
        consumerId: "codex-runtime",
        payloadDigest: `sha256:${"8".repeat(64)}`,
        status: "pending",
        recordedAt: "2026-07-11T00:00:00Z",
        retentionUntil: "2026-07-18T00:00:00Z",
        sourceRetentionUntil: "2026-07-18T00:00:00Z",
      }),
    });
    try {
      expect(appendDeliveryJournalFile(path, pending, coordinationDb)).toEqual({
        appended: true,
      });
      expect(appendDeliveryJournalFile(path, pending, coordinationDb)).toEqual({
        appended: false,
      });
      const parsed = parseDeliveryJournal(readFileSync(path, "utf8"));
      expect(parsed).toHaveLength(1);
      expect(rebuildDeliveryReceipts(db(), parsed)).toEqual({
        inserted: 1,
        updated: 0,
        deduped: 0,
      });
      expect(() =>
        parseDeliveryJournal(
          `${JSON.stringify({ ...pending, payloadDigest: `sha256:${"7".repeat(64)}` })}\n`,
        ),
      ).toThrow(/hash mismatch/);
      expect(() => parseDeliveryJournal('{"schemaVersion":1')).toThrow();
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it("U-HRET-005: delivery append失敗はreceipt非公開、append後projection失敗はrebuild可能", () => {
    const pending = buildDeliveryEvent({
      entryId: "entry-3",
      consumerId: "codex-runtime",
      payloadDigest: `sha256:${"d".repeat(64)}`,
      status: "pending",
      recordedAt: "2026-07-11T00:00:00Z",
      retentionUntil: "2026-07-18T00:00:00Z",
      sourceRetentionUntil: "2026-07-18T00:00:00Z",
    });
    expect(
      writeDeliveryEvent(pending, {
        appendEvent: () => {
          throw new Error("disk full");
        },
        projectEvent: () => "inserted",
      }),
    ).toMatchObject({ ok: false, appended: false, projected: false });
    const journal: (typeof pending)[] = [];
    const failedProjection = writeDeliveryEvent(pending, {
      appendEvent: (value) => {
        journal.push(value);
        return { appended: true };
      },
      projectEvent: () => {
        throw new Error("db unavailable");
      },
    });
    expect(failedProjection).toMatchObject({
      ok: false,
      appended: true,
      projected: false,
    });
    expect(rebuildDeliveryReceipts(db(), journal)).toEqual({
      inserted: 1,
      updated: 0,
      deduped: 0,
    });
  });
});
