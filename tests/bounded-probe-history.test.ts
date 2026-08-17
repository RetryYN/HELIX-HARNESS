// PLAN-L7-582-bounded-probe-history
import { describe, expect, it } from "vitest";
import {
  admitBoundedProbePlan,
  appendBoundedProbeRun,
  BOUNDED_PROBE_PLAN_SCHEMA_VERSION,
  BOUNDED_PROBE_RESULT_SCHEMA_VERSION,
  type BoundedProbeExecutionResultV1,
  type BoundedProbePlanV1,
  type BoundedProbeRunV1,
  computeBoundedProbePlanDigest,
  computeBoundedProbeResultDigest,
  replayMeasurementHistory,
  runBoundedProbe,
} from "../src/measurement/bounded-probe-history";
import { sha256Digest } from "../src/shared/canonical-digest";
import { openHarnessDb } from "../src/state-db";
import { migrate } from "../src/state-db/migration";

const digest = sha256Digest("fixture");
const head = "a".repeat(40);

function plan(overrides: Partial<BoundedProbePlanV1> = {}): BoundedProbePlanV1 {
  return {
    schema_version: BOUNDED_PROBE_PLAN_SCHEMA_VERSION,
    run_id: "run-001",
    nfr_id: "HR-NFR-REG-004",
    registry_revision: 2,
    registry_digest: digest,
    metric_id: "db-p95-ms",
    unit: "ms",
    probe_id: "db-probe",
    workload_id: "db-rebuild",
    environment_profile_id: "node24-linux",
    data_digest: digest,
    measured_head: head,
    runner_id: "runner-codex",
    runner_version: "1",
    bounds: {
      warmup_count: 1,
      sample_count: 3,
      timeout_ms: 1000,
      deadline_at: "2026-08-17T01:00:00Z",
      output_limit_bytes: 1024,
      cpu_time_ms: 1000,
      memory_limit_bytes: 1024 * 1024,
      network: "deny",
      credentials: "none",
    },
    join_context: {
      requirement_id: "HR-NFR-REG-004",
      release_id: "release-1",
      regression_id: null,
      improvement_episode_id: "episode-1",
    },
    ...overrides,
  };
}

function result(
  overrides: Partial<BoundedProbeExecutionResultV1> = {},
): BoundedProbeExecutionResultV1 {
  return {
    schema_version: BOUNDED_PROBE_RESULT_SCHEMA_VERSION,
    status: "passed",
    exit_code: 0,
    sample_count: 3,
    representativeness_ratio: 1,
    value: 90,
    stdout_bytes: 10,
    stderr_bytes: 0,
    cpu_time_ms: 10,
    peak_memory_bytes: 1024,
    started_at: "2026-08-17T00:59:00Z",
    completed_at: "2026-08-17T00:59:10Z",
    stdout_digest: digest,
    stderr_digest: digest,
    ...overrides,
  };
}

function context() {
  return { registry_digest: digest, current_head: head, current_data_digest: digest } as const;
}

async function run(
  overrides: Partial<BoundedProbeExecutionResultV1> = {},
): Promise<BoundedProbeRunV1> {
  const value = await runBoundedProbe(plan(), context(), {
    execute: async () => result(overrides),
  });
  expect(value.ok).toBe(true);
  if (!value.ok) throw new Error(value.failureCodes.join(","));
  return value.value;
}

describe("bounded probe execution and measurement history", () => {
  it("U-PH-001: registry／HEAD／datasetを一致確認し、allowlist外をfail-closeする", () => {
    expect(admitBoundedProbePlan(plan(), context()).ok).toBe(true);
    expect(
      admitBoundedProbePlan(plan({ probe_id: "arbitrary-shell" as never }), context()),
    ).toMatchObject({ ok: false, failureCodes: ["plan_schema_invalid"] });
    expect(
      admitBoundedProbePlan(plan(), { ...context(), current_head: "b".repeat(40) }),
    ).toMatchObject({ ok: false, failureCodes: ["current_head_mismatch"] });
    expect(admitBoundedProbePlan(plan(), { ...context(), registry_digest: null })).toMatchObject({
      ok: false,
      failureCodes: ["registry_digest_unavailable"],
    });
    expect(
      admitBoundedProbePlan(plan(), { ...context(), current_data_digest: null }),
    ).toMatchObject({ ok: false, failureCodes: ["dataset_digest_unavailable"] });
  });

  it("U-PH-002: portへcommandを渡さず、resource／deadline／passed条件を再検証する", async () => {
    const admitted = await runBoundedProbe(plan(), context(), {
      execute: async (received) => {
        expect(received.probe_id).toBe("db-probe");
        expect(received.bounds.network).toBe("deny");
        expect(received.bounds.credentials).toBe("none");
        return result();
      },
    });
    expect(admitted.ok).toBe(true);
    if (admitted.ok) {
      expect(admitted.value.plan_digest).toBe(computeBoundedProbePlanDigest(admitted.value.plan));
      expect(admitted.value.result_digest).toBe(
        computeBoundedProbeResultDigest(admitted.value.result),
      );
    }
    await expect(
      runBoundedProbe(plan(), context(), {
        execute: async () => result({ completed_at: "2026-08-17T01:00:01Z" }),
      }),
    ).resolves.toMatchObject({ ok: false, failureCodes: ["probe_result_invalid"] });
    await expect(
      runBoundedProbe(plan(), context(), {
        execute: async () => result({ sample_count: 2 }),
      }),
    ).resolves.toMatchObject({ ok: false, failureCodes: ["probe_result_insufficient"] });
  });

  it("U-PH-003: insufficient／timeout／failureはgreen相当の測定値を生成しない", async () => {
    const insufficient = await run({
      status: "insufficient",
      exit_code: null,
      sample_count: 2,
      value: null,
    });
    expect(insufficient.result.value).toBeNull();
    const timedOut = await run({ status: "timed_out", exit_code: null, value: null });
    expect(timedOut.result.value).toBeNull();
    const failed = await run({ status: "failed", exit_code: 1, value: null });
    expect(failed.result.value).toBeNull();
  });

  it("U-PH-004: appendは単一transactionのdigest chainであり、同一runだけ冪等", async () => {
    const db = openHarnessDb(":memory:");
    migrate(db);
    try {
      const firstRun = await run();
      const first = appendBoundedProbeRun(db, firstRun);
      expect(first).toMatchObject({ ok: true, value: { status: "appended", sequence: 1 } });
      const retry = appendBoundedProbeRun(db, firstRun);
      expect(retry).toMatchObject({ ok: true, value: { status: "idempotent", sequence: 1 } });

      const secondPlan = plan({ run_id: "run-002" });
      const secondInput = await runBoundedProbe(secondPlan, context(), {
        execute: async () => result(),
      });
      expect(secondInput.ok).toBe(true);
      if (!secondInput.ok) throw new Error("second run missing");
      const second = appendBoundedProbeRun(db, secondInput.value);
      expect(second).toMatchObject({ ok: true, value: { status: "appended", sequence: 2 } });

      const replay = replayMeasurementHistory(db);
      expect(replay).toMatchObject({ ok: true, last_sequence: 2 });
      expect(replay.events).toHaveLength(2);
      expect(replay.events[1]?.previous_event_digest).toBe(replay.events[0]?.event_digest);

      const conflicting = await runBoundedProbe(
        plan({ run_id: "run-001", metric_id: "other" }),
        context(),
        {
          execute: async () => result(),
        },
      );
      expect(conflicting.ok).toBe(true);
      if (!conflicting.ok) throw new Error("conflicting run missing");
      expect(appendBoundedProbeRun(db, conflicting.value)).toMatchObject({
        ok: false,
        failureCodes: ["history_conflict"],
      });
    } finally {
      db.close();
    }
  });

  it("U-PH-005: history eventは直接UPDATE／DELETEできず、replayが改ざんを検知する", async () => {
    const db = openHarnessDb(":memory:");
    migrate(db);
    try {
      const runValue = await run();
      const appended = appendBoundedProbeRun(db, runValue);
      expect(appended.ok).toBe(true);
      expect(() =>
        db
          .prepare("UPDATE measurement_history_events SET quality = ? WHERE run_id = ?")
          .run("failed", "run-001"),
      ).toThrow(/immutable/);
      expect(() => db.prepare("DELETE FROM measurement_history_events").run()).toThrow(/immutable/);
      db.prepare("UPDATE measurement_history_heads SET last_sequence = ? WHERE head_id = ?").run(
        99,
        "measurement-history",
      );
      expect(replayMeasurementHistory(db)).toMatchObject({
        ok: false,
        failure: "measurement_history_head_mismatch",
      });
    } finally {
      db.close();
    }
  });
});
