import { describe, expect, it } from "vitest";
import {
  type CiCriticalPathSchedulerInput,
  scheduleCiCriticalPath,
} from "../src/runtime/ci-critical-path-scheduler";

// PLAN-L7-707-ci-critical-path-scheduler / U-CISCHED-001..008
// U-CISCHED-002 U-CISCHED-003 U-CISCHED-004 U-CISCHED-005
// U-CISCHED-006 U-CISCHED-007 U-CISCHED-008

const HEAD = "b".repeat(40);
const BASE = "a".repeat(40);
const OTHER_HEAD = "c".repeat(40);
const D1 = `sha256:${"1".repeat(64)}` as const;
const D2 = `sha256:${"2".repeat(64)}` as const;

function input(
  overrides: Partial<CiCriticalPathSchedulerInput> = {},
): CiCriticalPathSchedulerInput {
  return {
    candidate_head: HEAD,
    expected_candidate_head: HEAD,
    base_head: BASE,
    verification_plan_digest: D1,
    registry_digest: D2,
    obligations: [
      {
        capability_id: "verification:a",
        depends_on_capability_ids: [],
        obligation_class: "local",
        heavy: false,
      },
      {
        capability_id: "verification:b",
        depends_on_capability_ids: ["verification:a"],
        obligation_class: "boundary",
        heavy: false,
      },
    ],
    estimates: [
      {
        capability_id: "verification:a",
        p50_ms: 10,
        p95_ms: 20,
        variance_ms: 2,
        flake_rate: 0,
        queue_ms: 1,
        cache_state: "hit",
        sample_count: 5,
      },
      {
        capability_id: "verification:b",
        p50_ms: 30,
        p95_ms: 40,
        variance_ms: 3,
        flake_rate: 0,
        queue_ms: 1,
        cache_state: "miss",
        sample_count: 5,
      },
    ],
    max_parallel_jobs: 2,
    telemetry_max_age_ms: 86_400_000,
    telemetry_observed_at: "2026-08-30T00:00:00.000Z",
    evaluated_at: "2026-08-30T00:00:01.000Z",
    artifacts: [],
    exclusive_resources: [],
    expected_artifact_identity: {
      lockfile_digest: D1,
      node_version: "24.15.0",
      toolchain_digest: D2,
      platform: "linux-x64",
    },
    resource_requirements: [
      {
        capability_id: "verification:a",
        runner_os: "linux",
        cpu_units: 1,
        memory_mb: 512,
        timeout_ms: 60_000,
      },
      {
        capability_id: "verification:b",
        runner_os: "linux",
        cpu_units: 1,
        memory_mb: 512,
        timeout_ms: 60_000,
      },
    ],
    compatible_runner_os: ["linux"],
    available_cpu_units: 2,
    available_memory_mb: 2048,
    backpressure_active: false,
    ...overrides,
  };
}

describe("CI critical-path scheduler", () => {
  it("U-CISCHED-001: required obligation exact setを変更しない", () => {
    const result = scheduleCiCriticalPath(input());

    expect(result.execution_dag.map((node) => node.capability_id).sort()).toEqual([
      "verification:a",
      "verification:b",
    ]);
    expect(result.critical_path_capability_ids).toEqual(["verification:a", "verification:b"]);
    expect(result.ok).toBe(true);
  });

  it("U-CISCHED-002: dependencyとdurationからcritical pathを決定する", () => {
    const result = scheduleCiCriticalPath(input());
    expect(result.predicted_critical_path_ms).toBe(62);
    expect(result.execution_dag.map((node) => node.parallel_group)).toEqual([0, 1]);
    const prioritized = scheduleCiCriticalPath(
      input({
        obligations: [
          {
            capability_id: "verification:global-a",
            depends_on_capability_ids: [],
            obligation_class: "global_invariant",
            heavy: true,
          },
          {
            capability_id: "verification:local-z",
            depends_on_capability_ids: [],
            obligation_class: "local",
            heavy: false,
          },
        ],
        estimates: [
          {
            capability_id: "verification:global-a",
            p50_ms: 10,
            p95_ms: 20,
            variance_ms: 2,
            flake_rate: 0,
            queue_ms: 1,
            cache_state: "hit",
            sample_count: 5,
          },
          {
            capability_id: "verification:local-z",
            p50_ms: 10,
            p95_ms: 20,
            variance_ms: 2,
            flake_rate: 0,
            queue_ms: 1,
            cache_state: "miss",
            sample_count: 5,
          },
        ],
      }),
    );
    expect(prioritized.execution_dag.map((node) => node.capability_id)).toEqual([
      "verification:local-z",
      "verification:global-a",
    ]);
    expect(prioritized.execution_dag.map((node) => node.parallel_group)).toEqual([0, 1]);
    expect(prioritized.predicted_critical_path_ms).toBe(42);
  });

  it("U-CISCHED-003: wrong artifact identityを個別拒否する", () => {
    const valid = {
      artifact_id: "artifact:build",
      capability_id: "verification:a",
      source_head: HEAD,
      lockfile_digest: D1,
      node_version: "24.15.0",
      toolchain_digest: D2,
      platform: "linux-x64",
      input_digest: D1,
      output_digest: D2,
    } as const;
    for (const artifact of [
      { ...valid, source_head: BASE },
      { ...valid, lockfile_digest: D2 },
      { ...valid, node_version: "25.0.0" },
      { ...valid, toolchain_digest: D1 },
      { ...valid, platform: "windows-x64" },
      { ...valid, input_digest: "bad" as `sha256:${string}` },
      { ...valid, output_digest: "bad" as `sha256:${string}` },
    ]) {
      const result = scheduleCiCriticalPath(input({ artifacts: [artifact] }));
      expect(result.findings).toContainEqual(
        expect.objectContaining({ code: "artifact_identity_invalid" }),
      );
    }
    const missingExpected = scheduleCiCriticalPath(
      input({ artifacts: [valid], expected_artifact_identity: undefined as never }),
    );
    expect(missingExpected.findings).toContainEqual(
      expect.objectContaining({ code: "artifact_identity_invalid" }),
    );
  });

  it("U-CISCHED-004: exclusive resourceをlease/fenceなしに並列化しない", () => {
    const result = scheduleCiCriticalPath(
      input({
        obligations: [
          {
            capability_id: "verification:a",
            depends_on_capability_ids: [],
            obligation_class: "local",
            heavy: false,
          },
          {
            capability_id: "verification:b",
            depends_on_capability_ids: [],
            obligation_class: "local",
            heavy: false,
          },
        ],
        exclusive_resources: [
          {
            capability_id: "verification:a",
            resource_id: "db:state",
            lease_id: "lease:a",
            fence_token: "fence:1",
          },
          {
            capability_id: "verification:b",
            resource_id: "db:state",
            lease_id: "",
            fence_token: "",
          },
        ],
        resource_requirements: [
          {
            capability_id: "verification:a",
            runner_os: "linux",
            cpu_units: 1,
            memory_mb: 512,
            timeout_ms: 60_000,
          },
          {
            capability_id: "verification:b",
            runner_os: "linux",
            cpu_units: 1,
            memory_mb: 512,
            timeout_ms: 60_000,
          },
        ],
      }),
    );
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "exclusive_resource_unfenced" }),
    );
    expect(result.execution_dag[0].parallel_group).not.toBe(result.execution_dag[1].parallel_group);
    expect(result.predicted_critical_path_ms).toBe(62);
  });

  it("U-CISCHED-005: stale telemetryでrequired setを保存してfallbackする", () => {
    const result = scheduleCiCriticalPath(input({ evaluated_at: "2026-09-02T00:00:00.000Z" }));
    expect(result.fallback_reasons).toEqual(["telemetry_stale_or_insufficient"]);
    expect(result.execution_dag).toHaveLength(2);
    expect(result.ok).toBe(true);
  });

  it("U-CISCHED-006: quotaと不正HEADをboundedに拒否する", () => {
    const result = scheduleCiCriticalPath(
      input({
        candidate_head: OTHER_HEAD,
        max_parallel_jobs: 0,
        obligations: [
          {
            capability_id: "verification:a",
            depends_on_capability_ids: [],
            obligation_class: "local",
            heavy: false,
          },
          {
            capability_id: "verification:b",
            depends_on_capability_ids: ["verification:a"],
            obligation_class: "global_invariant",
            heavy: true,
          },
        ],
      }),
    );
    expect(result.findings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "head_invalid" }),
        expect.objectContaining({ code: "parallel_quota_invalid" }),
      ]),
    );
    expect(result.bounded_cancel_policy).toEqual({
      trigger: "local_or_boundary_failure",
      cancellable_unstarted_capability_ids: ["verification:b"],
      preserves_required_obligations: true,
    });
  });

  it("U-CISCHED-007: exact identity一致時だけartifactをreuseする", () => {
    const artifact = {
      artifact_id: "artifact:build",
      capability_id: "verification:a",
      source_head: HEAD,
      lockfile_digest: D1,
      node_version: "24.15.0",
      toolchain_digest: D2,
      platform: "linux-x64",
      input_digest: D1,
      output_digest: D2,
    } as const;
    const result = scheduleCiCriticalPath(
      input({
        artifacts: [artifact],
      }),
    );
    expect(result.reused_artifact_ids).toEqual(["artifact:build"]);
    expect(result.ok).toBe(true);
  });

  it("U-CISCHED-009: runner/resource/timeout不整合とbackpressureを保守的に扱う", () => {
    const result = scheduleCiCriticalPath(
      input({
        resource_requirements: [
          {
            capability_id: "verification:a",
            runner_os: "windows",
            cpu_units: 3,
            memory_mb: 4096,
            timeout_ms: 0,
          },
        ],
        backpressure_active: true,
      }),
    );
    expect(result.findings).toEqual(
      expect.arrayContaining([expect.objectContaining({ code: "runtime_context_invalid" })]),
    );
    expect(result.fallback_reasons).toContain("backpressure_conservative");
  });

  it("U-CISCHED-010: 後段classから前段classへのdependencyを拒否する", () => {
    const result = scheduleCiCriticalPath(
      input({
        obligations: [
          {
            capability_id: "verification:global",
            depends_on_capability_ids: [],
            obligation_class: "global_invariant",
            heavy: true,
          },
          {
            capability_id: "verification:local",
            depends_on_capability_ids: ["verification:global"],
            obligation_class: "local",
            heavy: false,
          },
        ],
        resource_requirements: [
          {
            capability_id: "verification:global",
            runner_os: "linux",
            cpu_units: 1,
            memory_mb: 512,
            timeout_ms: 60_000,
          },
          {
            capability_id: "verification:local",
            runner_os: "linux",
            cpu_units: 1,
            memory_mb: 512,
            timeout_ms: 60_000,
          },
        ],
      }),
    );
    expect(result.findings).toContainEqual(
      expect.objectContaining({ code: "dependency_class_inversion" }),
    );
  });

  it("U-CISCHED-008: 同一入力のplan digestを決定的にする", () => {
    const first = scheduleCiCriticalPath(input());
    expect(scheduleCiCriticalPath(input())).toEqual(first);
    const changed = scheduleCiCriticalPath(
      input({
        obligations: [
          {
            capability_id: "verification:a",
            depends_on_capability_ids: [],
            obligation_class: "local",
            heavy: false,
          },
          {
            capability_id: "verification:b",
            depends_on_capability_ids: [],
            obligation_class: "local",
            heavy: false,
          },
        ],
        max_parallel_jobs: 1,
      }),
    );
    expect(changed.schedule_digest).not.toBe(first.schedule_digest);
  });
});
