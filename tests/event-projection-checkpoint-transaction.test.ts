import { spawn } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import type { OrchestrationEventEnvelopeV1 } from "../src/runtime/event-projection-checkpoint-replay";
import {
  ingestOrchestrationEvent,
  orchestrationEventPaths,
  orchestrationProjectionDigests,
  readOrchestrationLaneProjection,
  rebuildOrchestrationProjection,
} from "../src/runtime/event-projection-checkpoint-transaction";
import { type HarnessDb, openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

const TSX_CLI = join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs");
const HEAD = "a".repeat(40);
const OTHER_HEAD = "b".repeat(40);
const dbs: HarnessDb[] = [];
const roots: string[] = [];

function root(): string {
  const value = mkdtempSync(join(tmpdir(), "helix-event-projection-transaction-"));
  roots.push(value);
  return value;
}

function db(path = ":memory:", repoRoot?: string): HarnessDb {
  const value = openHarnessDb(path, repoRoot ? { repoRoot } : undefined);
  migrate(value);
  dbs.push(value);
  return value;
}

function envelope(
  overrides: Partial<OrchestrationEventEnvelopeV1> = {},
): OrchestrationEventEnvelopeV1 {
  return {
    schema_version: "helix-orchestration-event.v1",
    event_id: "event-requested-1",
    event_type: "requested",
    occurred_at: "2026-08-19T14:30:00Z",
    plan_id: "PLAN-L7-637-event-projection-checkpoint-transaction",
    parent_lane_id: "lane-parent-1",
    lane_id: "lane-1",
    causation_id: null,
    correlation_id: "correlation-1",
    head_sha: HEAD,
    payload_digest: `sha256:${"1".repeat(64)}`,
    ...overrides,
  };
}

function pathsFor(repoRoot: string) {
  return orchestrationEventPaths(repoRoot);
}

function ingest(
  database: HarnessDb,
  repoRoot: string,
  value: OrchestrationEventEnvelopeV1,
  extra: Partial<Parameters<typeof ingestOrchestrationEvent>[0]> = {},
) {
  const paths = pathsFor(repoRoot);
  return ingestOrchestrationEvent({
    db: database,
    journalPath: paths.journal,
    checkpointPath: paths.checkpoint,
    envelope: value,
    observedAt: "2026-08-19T14:40:00Z",
    currentHeadSha: HEAD,
    ...extra,
  });
}

function runNode(script: string, env: Record<string, string>): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn("node", [TSX_CLI, "-e", script], {
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

afterEach(() => {
  for (const value of dbs.splice(0)) value.close();
  for (const value of roots.splice(0)) rmSync(value, { recursive: true, force: true });
});

describe("PLAN-L7-637 orchestration event projection transactional I/O", () => {
  it("U-EPR-IO-001: durable append後にprojectionとcheckpointを同じevent identityへ束縛する", () => {
    const repoRoot = root();
    const database = db();
    const result = ingest(database, repoRoot, envelope());

    expect(result).toMatchObject({
      ok: true,
      outcome: "appended",
      journalAppended: true,
      projectionCommitted: true,
      checkpointPublished: true,
    });
    expect(readFileSync(pathsFor(repoRoot).journal, "utf8")).toContain(
      '"event_id":"event-requested-1"',
    );
    expect(JSON.parse(readFileSync(pathsFor(repoRoot).checkpoint, "utf8"))).toMatchObject({
      schema_version: "helix-checkpoint-record.v1",
      event_boundary: { from_event_id: "event-requested-1", to_event_id: "event-requested-1" },
    });
    expect(
      database.prepare("SELECT COUNT(*) AS n FROM orchestration_event_projections").get(),
    ).toMatchObject({
      n: 1,
    });
    expect(
      readOrchestrationLaneProjection(database, "lane-1")?.projection.state.last_event_id,
    ).toBe("event-requested-1");
  });

  it("U-EPR-IO-002: lifecycle transitionとlane checkpoint scopeを順序付きで保存する", () => {
    const repoRoot = root();
    const database = db();
    const first = envelope();
    const second = envelope({
      event_id: "event-dispatched-1",
      event_type: "dispatched",
      occurred_at: "2026-08-19T14:31:00Z",
      causation_id: first.event_id,
      payload_digest: `sha256:${"2".repeat(64)}`,
    });
    expect(ingest(database, repoRoot, first).ok).toBe(true);
    const result = ingest(database, repoRoot, second);

    expect(result).toMatchObject({ ok: true, replayedEventCount: 1 });
    expect(result.ok && result.checkpoint.event_boundary).toEqual({
      from_event_id: first.event_id,
      to_event_id: second.event_id,
    });
    expect(
      database.prepare("SELECT MAX(lane_sequence) AS n FROM orchestration_event_projections").get(),
    ).toMatchObject({
      n: 2,
    });
  });

  it("U-EPR-IO-003: pure rejectはjournal、projection、checkpointを増分させない", () => {
    const repoRoot = root();
    const database = db();
    const invalid = envelope({
      event_type: "not-a-lifecycle" as OrchestrationEventEnvelopeV1["event_type"],
    });
    const stale = envelope({ head_sha: OTHER_HEAD });
    const illegal = envelope({ event_type: "dispatched", causation_id: "missing" });

    expect(ingest(database, repoRoot, invalid)).toMatchObject({
      ok: false,
      failure_code: "EVENT_ENVELOPE_INVALID",
      journalAppended: false,
      projectionCommitted: false,
    });
    expect(ingest(database, repoRoot, stale)).toMatchObject({
      ok: false,
      failure_code: "EVENT_STALE_HEAD",
      journalAppended: false,
    });
    expect(ingest(database, repoRoot, illegal)).toMatchObject({
      ok: false,
      failure_code: "EVENT_CAUSATION_UNRESOLVED",
      journalAppended: false,
    });
    expect(existsSync(pathsFor(repoRoot).journal)).toBe(false);
    expect(
      database.prepare("SELECT COUNT(*) AS n FROM orchestration_event_projections").get(),
    ).toMatchObject({
      n: 0,
    });
  });

  it("U-EPR-IO-004: 同一event再送は一件へdedupeし異digestはfail-closeする", () => {
    const repoRoot = root();
    const database = db();
    const first = envelope();
    expect(ingest(database, repoRoot, first)).toMatchObject({ ok: true, outcome: "appended" });
    expect(ingest(database, repoRoot, first)).toMatchObject({
      ok: true,
      outcome: "duplicate_absorbed",
      journalAppended: false,
      replayedEventCount: 0,
    });
    expect(
      ingest(database, repoRoot, envelope({ payload_digest: `sha256:${"9".repeat(64)}` })),
    ).toMatchObject({
      ok: false,
      failure_code: "EVENT_DUPLICATE_DIGEST_MISMATCH",
      projectionCommitted: false,
    });
    expect(
      database.prepare("SELECT COUNT(*) AS n FROM orchestration_event_projections").get(),
    ).toMatchObject({
      n: 1,
    });
  });

  it("U-EPR-IO-005: append後commit前faultはjournalを残しDB/checkpointを公開せずreplay可能にする", () => {
    const repoRoot = root();
    const database = db();
    const failed = ingest(database, repoRoot, envelope(), {
      beforeCommit: () => {
        throw new Error("simulated crash before commit");
      },
    });
    expect(failed).toMatchObject({
      ok: false,
      failure_code: "EVENT_TRANSACTION_ABORTED",
      journalAppended: true,
      projectionCommitted: false,
      checkpointPublished: false,
    });
    expect(readFileSync(pathsFor(repoRoot).journal, "utf8")).toContain("event-requested-1");
    expect(existsSync(pathsFor(repoRoot).checkpoint)).toBe(false);
    expect(
      database.prepare("SELECT COUNT(*) AS n FROM orchestration_event_projections").get(),
    ).toMatchObject({
      n: 0,
    });
    expect(ingest(database, repoRoot, envelope())).toMatchObject({
      ok: true,
      outcome: "duplicate_absorbed",
      replayedEventCount: 1,
    });
  });

  it("U-EPR-IO-006: projection write faultはjournalを保持し、再試行で一度だけ投影する", () => {
    const repoRoot = root();
    const database = db();
    database.exec(
      "CREATE TRIGGER orchestration_event_projection_test_fault BEFORE INSERT ON orchestration_event_projections BEGIN SELECT RAISE(ABORT, 'test projection fault'); END",
    );
    expect(ingest(database, repoRoot, envelope())).toMatchObject({
      ok: false,
      failure_code: "EVENT_PROJECTION_WRITE_FAILED",
      journalAppended: true,
      projectionCommitted: false,
    });
    database.exec("DROP TRIGGER orchestration_event_projection_test_fault");
    expect(ingest(database, repoRoot, envelope())).toMatchObject({
      ok: true,
      outcome: "duplicate_absorbed",
      replayedEventCount: 1,
    });
    expect(
      database.prepare("SELECT COUNT(*) AS n FROM orchestration_event_projections").get(),
    ).toMatchObject({
      n: 1,
    });
  });

  it("U-EPR-IO-007: DBを空にしてjournalからrebuildして元のdigestへ収束する", () => {
    const firstRoot = root();
    const secondRoot = root();
    const source = db();
    const first = envelope();
    const second = envelope({
      event_id: "event-dispatched-1",
      event_type: "dispatched",
      occurred_at: "2026-08-19T14:31:00Z",
      causation_id: first.event_id,
      payload_digest: `sha256:${"2".repeat(64)}`,
    });
    ingest(source, firstRoot, first);
    ingest(source, firstRoot, second);
    const sourceDigest = orchestrationProjectionDigests(source, "lane-1");
    mkdirSync(join(secondRoot, ".helix", "audit"), { recursive: true });
    writeFileSync(pathsFor(secondRoot).journal, readFileSync(pathsFor(firstRoot).journal));
    const rebuilt = rebuildOrchestrationProjection({
      db: db(),
      journalPath: pathsFor(secondRoot).journal,
      checkpointPath: pathsFor(secondRoot).checkpoint,
      observedAt: "2026-08-19T14:40:00Z",
      currentHeadSha: HEAD,
    });
    expect(rebuilt).toMatchObject({ ok: true, replayedEventCount: 2 });
    const rebuiltDigest = orchestrationProjectionDigests(dbs.at(-1) as HarnessDb, "lane-1");
    expect(rebuiltDigest).toEqual(sourceDigest);
  });

  it("U-EPR-IO-008: lane Aのcheckpointはlane Bの追記で変化しない", () => {
    const repoRoot = root();
    const database = db();
    const laneA = envelope();
    const laneB = envelope({
      event_id: "event-requested-b",
      lane_id: "lane-2",
      correlation_id: "correlation-2",
      payload_digest: `sha256:${"3".repeat(64)}`,
    });
    ingest(database, repoRoot, laneA);
    const before = orchestrationProjectionDigests(database, "lane-1");
    ingest(database, repoRoot, laneB);
    expect(orchestrationProjectionDigests(database, "lane-1")).toEqual(before);
    expect(readOrchestrationLaneProjection(database, "lane-2")?.projection.lane_id).toBe("lane-2");
  });

  it("U-EPR-IO-009: immutable projection rowと同一eventの2 process再送を検証する", async () => {
    const repoRoot = root();
    const paths = pathsFor(repoRoot);
    const dbPath = paths.database;
    const setup = db(dbPath, repoRoot);
    setup.close();
    dbs.splice(dbs.indexOf(setup), 1);
    const script = [
      'import { openHarnessDb } from "./src/state-db/index.ts";',
      'import { ingestOrchestrationEvent, orchestrationEventPaths } from "./src/runtime/event-projection-checkpoint-transaction.ts";',
      "const repo=process.env.TEST_REPO; const paths=orchestrationEventPaths(repo); const db=openHarnessDb(paths.database,{repoRoot:repo});",
      "try { console.log(JSON.stringify(ingestOrchestrationEvent({db,journalPath:paths.journal,checkpointPath:paths.checkpoint,envelope:JSON.parse(process.env.TEST_EVENT),observedAt:'2026-08-19T14:40:00Z',currentHeadSha:process.env.TEST_HEAD}))); } finally { db.close(); }",
    ].join("");
    const env = {
      TEST_REPO: repoRoot,
      TEST_EVENT: JSON.stringify(envelope()),
      TEST_HEAD: HEAD,
    };
    const outputs = await Promise.all([runNode(script, env), runNode(script, env)]);
    const results = outputs.map((value) => JSON.parse(value));
    expect(results.map((value) => value.ok).sort()).toEqual([true, true]);
    expect(results.map((value) => value.outcome).sort()).toEqual([
      "appended",
      "duplicate_absorbed",
    ]);
    const database = db(dbPath, repoRoot);
    expect(
      database.prepare("SELECT COUNT(*) AS n FROM orchestration_event_projections").get(),
    ).toMatchObject({
      n: 1,
    });
    expect(() =>
      database.prepare("UPDATE orchestration_event_projections SET event_type = 'failed'").run(),
    ).toThrow(/immutable/);
    expect(() => database.prepare("DELETE FROM orchestration_event_projections").run()).toThrow(
      /immutable/,
    );
  });
});
