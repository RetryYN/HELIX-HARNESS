import { describe, expect, it } from "vitest";
import {
  CI_EXECUTION_TELEMETRY_SCHEMA_VERSION,
  type CiExecutionTelemetryEventInput,
  type CiExecutionTelemetryEventV1,
  createCiExecutionTelemetryEvent,
  projectCiExecutionTelemetry,
  validateCiExecutionTelemetryBatch,
  validateCiExecutionTelemetryEvent,
} from "../src/runtime/ci-execution-telemetry";
import { sha256Digest } from "../src/runtime/digest";

// PLAN-L3-76-ci-execution-telemetry — U-TELE-001..U-TELE-010

const HEAD = "a".repeat(40);
const BASE = "b".repeat(40);
const ENVIRONMENT = sha256Digest("environment:linux");
const TOOLCHAIN = sha256Digest("toolchain:node24");
const EPOCH = Date.parse("2026-08-30T00:00:00.000Z");

type EventOptions = {
  eventId: string;
  nodeId: string;
  verificationIdentity?: string;
  nodeKind?: CiExecutionTelemetryEventInput["node_kind"];
  operation?: CiExecutionTelemetryEventInput["operation"];
  dependsOn?: string[];
  runId?: string;
  attempt?: number;
  startedMs?: number;
  completedMs?: number;
  queuedMs?: number;
  runnerMs?: number;
  status?: CiExecutionTelemetryEventInput["outcome"]["status"];
  exitCode?: number | null;
  retry?: boolean;
  flaky?: boolean;
  firstOracle?: string | null;
  profile?: CiExecutionTelemetryEventInput["profile"];
  executionSurface?: CiExecutionTelemetryEventInput["execution_surface"];
  cacheClass?: CiExecutionTelemetryEventInput["cache"]["class"];
  cacheHit?: boolean;
  artifact?: CiExecutionTelemetryEventInput["artifact"];
  runnerOs?: CiExecutionTelemetryEventInput["runner"]["os"];
  environmentDigest?: CiExecutionTelemetryEventInput["runner"]["environment_digest"];
};

function iso(offsetMs: number): string {
  return new Date(EPOCH + offsetMs).toISOString();
}

function makeEvent(options: EventOptions): CiExecutionTelemetryEventV1 {
  const queuedMs = options.queuedMs ?? 0;
  const startedMs = options.startedMs ?? 10;
  const completedMs = options.completedMs ?? 110;
  const status = options.status ?? "passed";
  const exitCode = options.exitCode ?? (status === "passed" ? 0 : null);
  return createCiExecutionTelemetryEvent({
    event_id: options.eventId,
    node_id: options.nodeId,
    node_kind: options.nodeKind ?? "step",
    verification_identity: options.verificationIdentity ?? `verification:${options.nodeId}`,
    operation: options.operation ?? "workflow_control",
    depends_on_node_ids: options.dependsOn ?? [],
    profile: options.profile ?? "candidate_admission",
    execution_surface: options.executionSurface ?? "github_actions",
    source_head: HEAD,
    base_head: BASE,
    candidate_head: HEAD,
    workflow_id: "harness-check",
    run_id: options.runId ?? "run-1",
    attempt: options.attempt ?? 1,
    runner: {
      os: options.runnerOs ?? "linux",
      architecture: "x64",
      node_version: "v24.15.0",
      toolchain_digest: TOOLCHAIN,
      environment_digest: options.environmentDigest ?? ENVIRONMENT,
    },
    timing: {
      queued_at: iso(queuedMs),
      started_at: iso(startedMs),
      completed_at: iso(completedMs),
      queue_time_ms: startedMs - queuedMs,
      wall_time_ms: completedMs - startedMs,
      runner_time_ms: options.runnerMs ?? completedMs - startedMs,
    },
    resource: { cpu_class: "2-core", memory_class: "medium" },
    cache: { class: options.cacheClass ?? "warm", hit: options.cacheHit ?? true },
    outcome: {
      status,
      exit_code: exitCode,
      retry: options.retry ?? false,
      flaky: options.flaky ?? false,
      first_detecting_oracle_id: options.firstOracle ?? null,
    },
    artifact: options.artifact ?? null,
  });
}

function asUntrustedEvent(value: unknown): CiExecutionTelemetryEventV1 {
  return value as CiExecutionTelemetryEventV1;
}

describe("CI execution telemetry contract", () => {
  it("U-TELE-001: valid eventはtyped identity、runner、時刻、結果、digestを一体で検証する", () => {
    const event = makeEvent({ eventId: "event-1", nodeId: "node-1" });

    expect(event.schema_version).toBe(CI_EXECUTION_TELEMETRY_SCHEMA_VERSION);
    expect(validateCiExecutionTelemetryEvent(event)).toEqual({ ok: true, errors: [] });
    expect(event.payload_digest).toMatch(/^sha256:[0-9a-f]{64}$/u);
    expect(event.evidence_digest).toMatch(/^sha256:[0-9a-f]{64}$/u);
  });

  it("U-TELE-002: payload／evidence digest改竄とsource HEAD誤りを個別に拒否する", () => {
    const event = makeEvent({ eventId: "event-2", nodeId: "node-2" });
    const payloadMutation = { ...event, operation: "test" as const };
    expect(validateCiExecutionTelemetryEvent(payloadMutation).errors).toContain(
      "payload_digest_mismatch",
    );

    const evidenceMutation = { ...event, evidence_digest: sha256Digest("forged") };
    expect(validateCiExecutionTelemetryEvent(evidenceMutation).errors).toContain(
      "evidence_digest_mismatch",
    );

    const sourceMutation = { ...event, source_head: "c".repeat(40) };
    expect(validateCiExecutionTelemetryEvent(sourceMutation).errors).toEqual(
      expect.arrayContaining(["source_candidate_head_mismatch", "payload_digest_mismatch"]),
    );
  });

  it("U-TELE-003: queue／wall／runner時間の逆転と不整合をfail-closeする", () => {
    const event = makeEvent({ eventId: "event-3", nodeId: "node-3" });
    const reverse = {
      ...event,
      timing: { ...event.timing, completed_at: iso(5) },
    };
    expect(validateCiExecutionTelemetryEvent(reverse).errors).toEqual(
      expect.arrayContaining(["timing_order_invalid", "timing_wall_duration_mismatch"]),
    );

    const invalidCalendarDate = {
      ...event,
      timing: { ...event.timing, completed_at: "2026-02-30T00:00:00.000Z" },
    };
    expect(validateCiExecutionTelemetryEvent(invalidCalendarDate).errors).toContain(
      "timing_completed_at_invalid",
    );

    const duration = {
      ...event,
      timing: { ...event.timing, queue_time_ms: event.timing.queue_time_ms + 1 },
    };
    expect(validateCiExecutionTelemetryEvent(duration).errors).toContain(
      "timing_queue_duration_mismatch",
    );

    const runnerOverrun = {
      ...event,
      timing: { ...event.timing, runner_time_ms: event.timing.wall_time_ms + 1 },
    };
    expect(validateCiExecutionTelemetryEvent(runnerOverrun).errors).toContain(
      "timing_runner_duration_exceeds_wall",
    );
  });

  it("U-TELE-004: unknown runner、attempt、enumを受理しない", () => {
    const event = makeEvent({ eventId: "event-4", nodeId: "node-4" });
    const unknownRunner = {
      ...event,
      runner: { ...event.runner, os: "solaris" as const },
    };
    expect(validateCiExecutionTelemetryEvent(asUntrustedEvent(unknownRunner)).errors).toContain(
      "runner_os_invalid",
    );

    const invalidAttempt = { ...event, attempt: 0 };
    expect(validateCiExecutionTelemetryEvent(invalidAttempt).errors).toContain("attempt_invalid");

    const invalidProfile = { ...event, profile: "unknown" };
    expect(validateCiExecutionTelemetryEvent(asUntrustedEvent(invalidProfile)).errors).toContain(
      "profile_invalid",
    );
  });

  it("U-TELE-005: raw log、credential、未知fieldをtelemetryへ混入できない", () => {
    const event = makeEvent({ eventId: "event-5", nodeId: "node-5" });
    const unsafe = {
      ...event,
      raw_log: "do not persist",
      credential: "do not persist",
    };
    expect(validateCiExecutionTelemetryEvent(unsafe).errors).toEqual(
      expect.arrayContaining([
        "unknown_field:event.raw_log",
        "unknown_field:event.credential",
        "sensitive_field_forbidden:event.raw_log",
        "sensitive_field_forbidden:event.credential",
      ]),
    );
    expect(
      validateCiExecutionTelemetryEvent(null as unknown as CiExecutionTelemetryEventV1),
    ).toEqual({ ok: false, errors: ["event_invalid"] });
  });

  it("U-TELE-006: setup／test／artifact transferのcost node種別を独立して束縛する", () => {
    const setup = makeEvent({
      eventId: "event-6",
      nodeId: "setup-6",
      nodeKind: "setup",
      operation: "checkout",
    });
    expect(validateCiExecutionTelemetryEvent(setup)).toEqual({ ok: true, errors: [] });

    const validTest = makeEvent({
      eventId: "event-7",
      nodeId: "test-7",
      nodeKind: "test",
      operation: "test",
    });
    const testMismatch = { ...validTest, operation: "build" as const };
    expect(validateCiExecutionTelemetryEvent(testMismatch).errors).toContain(
      "test_operation_mismatch",
    );

    const artifact = makeEvent({
      eventId: "event-8",
      nodeId: "artifact-8",
      nodeKind: "artifact_transfer",
      operation: "artifact_upload",
      artifact: {
        direction: "upload",
        input_digest: sha256Digest("input"),
        output_digest: sha256Digest("output"),
      },
    });
    expect(validateCiExecutionTelemetryEvent(artifact)).toEqual({ ok: true, errors: [] });

    const artifactOnStep = {
      ...setup,
      artifact: {
        direction: "upload" as const,
        input_digest: sha256Digest("input-step"),
        output_digest: sha256Digest("output-step"),
      },
    };
    expect(validateCiExecutionTelemetryEvent(artifactOnStep).errors).toContain(
      "artifact_only_transfer_node",
    );

    const validArtifact = makeEvent({
      eventId: "event-9",
      nodeId: "artifact-9",
      nodeKind: "artifact_transfer",
      operation: "artifact_download",
      artifact: {
        direction: "download",
        input_digest: sha256Digest("input-9"),
        output_digest: sha256Digest("output-9"),
      },
    });
    const missingArtifact = { ...validArtifact, artifact: null };
    expect(validateCiExecutionTelemetryEvent(missingArtifact).errors).toContain(
      "artifact_required",
    );
  });

  it("U-TELE-007: status、exit code、first detecting oracleの欠落を相殺しない", () => {
    const validPassed = makeEvent({
      eventId: "event-10",
      nodeId: "node-10",
      status: "passed",
    });
    const passedFailure = { ...validPassed, outcome: { ...validPassed.outcome, exit_code: 1 } };
    expect(validateCiExecutionTelemetryEvent(passedFailure).errors).toContain(
      "passed_exit_code_mismatch",
    );

    const validFailure = makeEvent({
      eventId: "event-11",
      nodeId: "node-11",
      status: "failed",
      exitCode: 1,
      firstOracle: "oracle-failure",
    });
    const failedWithoutDetector = {
      ...validFailure,
      outcome: { ...validFailure.outcome, first_detecting_oracle_id: null },
    };
    expect(validateCiExecutionTelemetryEvent(failedWithoutDetector).errors).toContain(
      "failure_detector_required",
    );

    const validTimedOut = makeEvent({
      eventId: "event-12",
      nodeId: "node-12",
      status: "timed_out",
      firstOracle: "oracle-timeout",
    });
    const timedOutWithExit = {
      ...validTimedOut,
      outcome: { ...validTimedOut.outcome, exit_code: 1 },
    };
    expect(validateCiExecutionTelemetryEvent(timedOutWithExit).errors).toContain(
      "nonterminal_exit_code_invalid",
    );
  });

  it("U-TELE-008: batchはcontext、node identity、dependency DAGを検証する", () => {
    const first = makeEvent({ eventId: "event-13", nodeId: "node-13" });
    const missingDependency = makeEvent({
      eventId: "event-14",
      nodeId: "node-14",
      dependsOn: ["missing-node"],
    });
    expect(validateCiExecutionTelemetryBatch([first, missingDependency]).errors).toContain(
      "missing_dependency:node-14:missing-node",
    );

    const cycleA = makeEvent({ eventId: "event-15", nodeId: "cycle-a", dependsOn: ["cycle-b"] });
    const cycleB = makeEvent({ eventId: "event-16", nodeId: "cycle-b", dependsOn: ["cycle-a"] });
    expect(validateCiExecutionTelemetryBatch([cycleA, cycleB]).errors).toEqual(
      expect.arrayContaining(["dependency_cycle:cycle-a"]),
    );

    const duplicate = makeEvent({ eventId: "event-13-duplicate", nodeId: first.node_id });
    expect(validateCiExecutionTelemetryBatch([first, duplicate]).errors).toContain(
      "duplicate_node_id:node-13",
    );

    const context = makeEvent({ eventId: "event-17", nodeId: "node-17", runId: "run-2" });
    expect(validateCiExecutionTelemetryBatch([first, context]).errors).toContain(
      "batch_binding_mismatch:run_id",
    );
  });

  it("U-TELE-009: 同一runのcritical pathと重複setup、複数attemptのfailureを保持する", () => {
    const runOneSetup = makeEvent({
      eventId: "event-18",
      nodeId: "setup-one",
      verificationIdentity: "setup:checkout",
      nodeKind: "setup",
      operation: "checkout",
      startedMs: 0,
      completedMs: 100,
      runId: "run-1",
    });
    const runOneDuplicate = makeEvent({
      eventId: "event-19",
      nodeId: "setup-two",
      verificationIdentity: "setup:checkout",
      nodeKind: "setup",
      operation: "checkout",
      startedMs: 0,
      completedMs: 50,
      runId: "run-1",
    });
    const runOneFailure = makeEvent({
      eventId: "event-20",
      nodeId: "test-one",
      verificationIdentity: "test:critical",
      nodeKind: "test",
      operation: "test",
      dependsOn: ["setup-two"],
      startedMs: 50,
      completedMs: 250,
      status: "failed",
      exitCode: 1,
      firstOracle: "oracle-test-failure",
      runId: "run-1",
    });
    const runTwoSetup = makeEvent({
      eventId: "event-21",
      nodeId: "setup-three",
      verificationIdentity: "setup:checkout",
      nodeKind: "setup",
      operation: "checkout",
      startedMs: 0,
      completedMs: 20,
      runId: "run-2",
      attempt: 2,
    });
    const runTwoPass = makeEvent({
      eventId: "event-22",
      nodeId: "test-two",
      verificationIdentity: "test:critical",
      nodeKind: "test",
      operation: "test",
      dependsOn: ["setup-three"],
      startedMs: 20,
      completedMs: 120,
      retry: true,
      flaky: true,
      runId: "run-2",
      attempt: 2,
    });
    const cancelled = makeEvent({
      eventId: "event-23",
      nodeId: "cancelled",
      status: "cancelled",
      startedMs: 0,
      completedMs: 10,
      runId: "run-3",
      attempt: 1,
    });

    const result = projectCiExecutionTelemetry([
      runTwoPass,
      cancelled,
      runOneFailure,
      runTwoSetup,
      runOneDuplicate,
      runOneSetup,
    ]);
    expect(result).toMatchObject({ ok: true, errors: [] });
    expect(result.projection).toMatchObject({
      event_count: 6,
      run_count: 3,
      failed_count: 1,
      cancelled_count: 1,
      retry_count: 1,
      flaky_count: 1,
      preserved_failure_count: 1,
      duplicate_setup_count: 1,
      duplicate_setup_wall_time_ms: 50,
      first_detecting_oracle_ids: ["oracle-test-failure"],
      failure_detection_yield: {
        failure_count: 1,
        detected_failure_count: 1,
        ratio: 1,
      },
    });
    expect(result.projection?.runs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          run_id: "run-1",
          critical_path_ms: 250,
          critical_path_node_ids: ["setup-two", "test-one"],
          excluded_from_percentiles: false,
        }),
        expect.objectContaining({ run_id: "run-3", excluded_from_percentiles: true }),
      ]),
    );
    expect(result.projection?.series).toEqual([
      expect.objectContaining({
        sample_count: 2,
        excluded_count: 1,
        p50_wall_time_ms: 120,
        p95_wall_time_ms: 250,
        p99_wall_time_ms: 250,
        p50_critical_path_ms: 120,
        p95_critical_path_ms: 250,
        p99_critical_path_ms: 250,
      }),
    ]);
  });

  it("U-TELE-010: series軸を混在させずpercentileと順序決定性を保持する", () => {
    const first = makeEvent({
      eventId: "event-24",
      nodeId: "node-24",
      completedMs: 110,
      runId: "series-a-1",
      cacheClass: "warm",
    });
    const second = makeEvent({
      eventId: "event-25",
      nodeId: "node-25",
      startedMs: 10,
      completedMs: 210,
      runId: "series-a-2",
      cacheClass: "warm",
    });
    const differentProfile = makeEvent({
      eventId: "event-26",
      nodeId: "node-26",
      completedMs: 910,
      profile: "post_merge_full",
      runId: "series-b-1",
    });
    const differentSurface = makeEvent({
      eventId: "event-27",
      nodeId: "node-27",
      completedMs: 710,
      executionSurface: "local_internal",
      runId: "series-c-1",
    });
    const differentEnvironment = makeEvent({
      eventId: "event-28",
      nodeId: "node-28",
      completedMs: 810,
      environmentDigest: sha256Digest("environment:other"),
      runId: "series-d-1",
    });
    const differentCache = makeEvent({
      eventId: "event-29",
      nodeId: "node-29",
      completedMs: 610,
      cacheClass: "cold",
      cacheHit: false,
      runId: "series-e-1",
    });
    const forward = projectCiExecutionTelemetry([
      first,
      second,
      differentProfile,
      differentSurface,
      differentEnvironment,
      differentCache,
    ]);
    const reverse = projectCiExecutionTelemetry([
      differentCache,
      differentEnvironment,
      differentSurface,
      differentProfile,
      second,
      first,
    ]);

    expect(reverse).toEqual(forward);
    expect(forward.projection?.series).toHaveLength(5);
    expect(forward.projection?.series).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          profile: "candidate_admission",
          execution_surface: "github_actions",
          environment_digest: ENVIRONMENT,
          cache_class: "warm",
          sample_count: 2,
          p50_wall_time_ms: 110,
          p95_wall_time_ms: 210,
          p99_wall_time_ms: 210,
        }),
        expect.objectContaining({ profile: "post_merge_full", sample_count: 1 }),
        expect.objectContaining({ execution_surface: "local_internal", sample_count: 1 }),
        expect.objectContaining({
          environment_digest: sha256Digest("environment:other"),
          sample_count: 1,
        }),
        expect.objectContaining({ cache_class: "cold", sample_count: 1 }),
      ]),
    );
  });
});
