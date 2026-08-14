// PLAN-L7-560-measurement-evidence-evaluator
import { describe, expect, it } from "vitest";
import {
  evaluateMeasurementEvidence,
  MEASUREMENT_EVALUATION_SCHEMA_VERSION,
  type MeasurementBaselineBindingMeasured,
  type MeasurementEvaluationInputV1,
} from "../src/requirements/measurement-evidence-evaluator";
import type { NfrEntryV1 } from "../src/requirements/nfr-registry";

const digestA = `sha256:${"a".repeat(64)}` as const;
const digestB = `sha256:${"b".repeat(64)}` as const;
const digestC = `sha256:${"c".repeat(64)}` as const;
const head = "1".repeat(40);

function declaration(): NfrEntryV1 {
  return {
    nfr_id: "HR-NFR-REG-004",
    revision: 2,
    quality_family: "standard",
    quality_characteristic: "performance_efficiency",
    source_authority: [
      {
        role: "l3_observable_behavior",
        canonical_layer: "L3",
        id: "HR-NFR-REG-004",
        artifact_path: "docs/source.md",
        locator: "§4.8",
        source_digest: digestA,
      },
    ],
    target_surface: ["measurement-harness"],
    metric: {
      id: "db-p95-ms",
      name: "DB p95",
      unit: "ms",
      aggregation: "p95",
      direction: "lower_is_better",
    },
    workload: { id: "db-rebuild", description: "fixture", reference: "docs/workload.md" },
    environment: {
      profile_id: "node24-linux",
      description: "fixture",
      reference: "docs/environment.md",
    },
    data: { kind: "synthetic", reference: "tests/fixture.json" },
    sampling: {
      method: "fixed_count",
      minimum_sample_count: 10,
      value: 10,
      unit: "count",
      reference: "POL-1",
    },
    baseline: { status: "measured", value: 90, unit: "ms", reference: "evidence/baseline.json" },
    target: { status: "declared", value: 100, unit: "ms", reference: "POL-1" },
    slo: { status: "declared", objective: 100, unit: "ms", policy_ref: "POL-1" },
    error_budget: { status: "declared", value: 10, unit: "ms", reference: "POL-1" },
    hard_limit: { status: "declared", value: 120, unit: "ms", reference: "POL-1" },
    freshness_policy: {
      max_age_seconds: 3600,
      minimum_representativeness_ratio: 0.8,
      policy_ref: "POL-1",
    },
    threshold: {
      metric_id: "db-p95-ms",
      unit: "ms",
      comparator: "lte",
      inclusive: true,
      value: 100,
      policy_ref: "POL-1",
    },
    window: { kind: "run", value: 1, unit: "run" },
    probe: { id: "db-probe", reference: "#221", read_only: true },
    oracle: {
      id: "U-MEVAL-001",
      test_path: "tests/measurement-evidence-evaluator.test.ts",
      expectation: "evaluate",
    },
    owner: "measurement-harness",
    evidence_path: "docs/evidence.md",
    remeasure_trigger: ["revision change"],
  };
}

function input(): MeasurementEvaluationInputV1 {
  return {
    schema_version: MEASUREMENT_EVALUATION_SCHEMA_VERSION,
    declaration: declaration(),
    observation: {
      observation_id: "obs-1",
      nfr_id: "HR-NFR-REG-004",
      registry_revision: 2,
      metric_id: "db-p95-ms",
      unit: "ms",
      value: 90,
      workload_id: "db-rebuild",
      environment_profile_id: "node24-linux",
      data_digest: digestA,
      sampling_method: "fixed_count",
      sample_count: 10,
      representativeness_ratio: 0.8,
      window_kind: "run",
      window_value: 1,
      window_unit: "run",
      started_at: "2026-08-14T10:00:00Z",
      completed_at: "2026-08-14T10:01:00Z",
      measured_head: head,
      evidence_digest: digestB,
      baseline_binding: {
        status: "measured",
        run_id: "baseline-run-1",
        nfr_id: "HR-NFR-REG-004",
        registry_revision: 2,
        metric_id: "db-p95-ms",
        unit: "ms",
        workload_id: "db-rebuild",
        environment_profile_id: "node24-linux",
        data_digest: digestA,
        window_kind: "run",
        window_value: 1,
        window_unit: "run",
        measured_head: head,
        evidence_digest: digestA,
        value: 90,
      },
    },
    evaluated_at: "2026-08-14T10:02:00Z",
  };
}

function mutable(): Record<string, unknown> {
  return structuredClone(input()) as unknown as Record<string, unknown>;
}

function success(value: unknown) {
  const result = evaluateMeasurementEvidence(value);
  expect(result.ok).toBe(true);
  if (!result.ok) throw new Error(result.failureCodes.join(","));
  return result.value;
}

function failure(value: unknown, code: string): void {
  const result = evaluateMeasurementEvidence(value);
  expect(result.ok).toBe(false);
  if (result.ok) throw new Error("failure expected");
  expect(result.failureCodes).toContain(code);
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

describe("measurement evidence evaluator", () => {
  it("U-MEVAL-001: root／observation／baseline／resultをexact key setで固定する", () => {
    const extra = mutable();
    extra.extra = true;
    failure(extra, "evaluation_schema_invalid");
    const observation = structuredClone(input()) as unknown as {
      observation: Record<string, unknown>;
    };
    observation.observation.extra = true;
    failure(observation, "observation_invalid");
    expect(Object.keys(success(input())).sort()).toEqual(
      [
        "baseline",
        "binding",
        "evaluated_at",
        "findings",
        "freshness",
        "hard_limit",
        "nfr_id",
        "observation_id",
        "representativeness",
        "schema_version",
        "threshold",
        "verdict",
      ].sort(),
    );
  });

  it("U-MEVAL-002: ID、revision、full SHA、digest、finite valueを拒否する", () => {
    for (const mutate of [
      (v: MeasurementEvaluationInputV1) => {
        v.observation.registry_revision = 0;
      },
      (v: MeasurementEvaluationInputV1) => {
        v.observation.measured_head = "abc";
      },
      (v: MeasurementEvaluationInputV1) => {
        v.observation.data_digest = "sha256:x" as `sha256:${string}`;
      },
      (v: MeasurementEvaluationInputV1) => {
        v.observation.value = Number.NaN;
      },
    ]) {
      const value = structuredClone(input());
      mutate(value);
      const result = evaluateMeasurementEvidence(value);
      expect(result.ok).toBe(false);
      if (result.ok) throw new Error("failure expected");
      expect(result.failureCodes).toContain("observation_invalid");
    }
    for (const mutate of [
      (v: MeasurementEvaluationInputV1) => {
        v.declaration.freshness_policy.minimum_representativeness_ratio = 2;
      },
      (v: MeasurementEvaluationInputV1) => {
        v.declaration.threshold.inclusive = "yes" as never;
      },
      (v: MeasurementEvaluationInputV1) => {
        v.declaration.threshold.value = [2, 1];
        v.declaration.threshold.comparator = "between";
      },
      (v: MeasurementEvaluationInputV1) => {
        v.declaration.sampling.method = "random" as never;
      },
      (v: MeasurementEvaluationInputV1) => {
        v.declaration.window.kind = "month" as never;
      },
    ]) {
      const value = structuredClone(input());
      mutate(value);
      failure(value, "evaluation_schema_invalid");
    }
  });

  it("U-MEVAL-003: declaration NFR／revision／metric／unit driftをmismatchにする", () => {
    for (const key of ["nfr_id", "registry_revision", "metric_id", "unit"] as const) {
      const value = structuredClone(input());
      if (key === "registry_revision") value.observation[key] = 3;
      else value.observation[key] = "other";
      expect(success(value).binding).toBe("mismatch");
    }
  });

  it("U-MEVAL-004: workload／environment／window driftをmismatchにする", () => {
    for (const key of [
      "workload_id",
      "environment_profile_id",
      "sampling_method",
      "window_kind",
      "window_value",
      "window_unit",
    ] as const) {
      const value = structuredClone(input());
      if (key === "window_value") value.observation[key] = 2;
      else if (key === "sampling_method") value.observation[key] = "ratio";
      else if (key === "window_kind") value.observation[key] = "sample";
      else value.observation[key] = "other";
      expect(success(value).binding).toBe("mismatch");
    }
  });

  it("U-MEVAL-005: invalid timeを拒否し評価時刻が完了前ならfreshness unknownにする", () => {
    const invalid = structuredClone(input());
    invalid.observation.started_at = "not-time";
    failure(invalid, "evaluation_time_invalid");
    const reversed = structuredClone(input());
    reversed.observation.started_at = "2026-08-14T10:02:00Z";
    failure(reversed, "evaluation_time_invalid");
    const beforeCompletion = structuredClone(input());
    beforeCompletion.evaluated_at = "2026-08-14T10:00:30Z";
    expect(success(beforeCompletion).freshness).toBe("unknown");
  });

  it("U-MEVAL-006: freshness境界をinclusiveにし1秒超過をstaleにする", () => {
    const boundary = structuredClone(input());
    boundary.evaluated_at = "2026-08-14T11:01:00Z";
    expect(success(boundary).freshness).toBe("current");
    const stale = structuredClone(boundary);
    stale.evaluated_at = "2026-08-14T11:01:01Z";
    expect(success(stale).freshness).toBe("stale");
  });

  it("U-MEVAL-007: sample countとratioを独立かつinclusiveに評価する", () => {
    expect(success(input()).representativeness).toBe("representative");
    const count = structuredClone(input());
    count.observation.sample_count = 9;
    expect(success(count).representativeness).toBe("non_representative");
    const ratio = structuredClone(input());
    ratio.observation.representativeness_ratio = 0.79;
    expect(success(ratio).representativeness).toBe("non_representative");
  });

  it("U-MEVAL-008: scalar comparatorとゼロ／負／小数をexact評価する", () => {
    const cases: Array<[NfrEntryV1["threshold"]["comparator"], number, number, "pass" | "fail"]> = [
      ["lt", 0, 1, "pass"],
      ["lte", -1, -1, "pass"],
      ["eq", 0.5, 0.5, "pass"],
      ["gte", 2, 1, "pass"],
      ["gt", 1, 1, "fail"],
    ];
    for (const [comparator, observed, expected, status] of cases) {
      const value = structuredClone(input());
      value.declaration.threshold = {
        ...value.declaration.threshold,
        comparator: comparator as "lte",
        value: expected,
      };
      value.observation.value = observed;
      expect(success(value).threshold, comparator).toBe(status);
    }
  });

  it("U-MEVAL-009: betweenのinclusive／exclusive両端を評価する", () => {
    const inclusive = structuredClone(input());
    inclusive.declaration.threshold = {
      ...inclusive.declaration.threshold,
      comparator: "between",
      inclusive: true,
      value: [90, 100],
    };
    expect(success(inclusive).threshold).toBe("pass");
    const exclusive = structuredClone(inclusive);
    exclusive.declaration.threshold.inclusive = false;
    expect(success(exclusive).threshold).toBe("fail");
  });

  it("U-MEVAL-010: baseline unknown／measured unionをstrictにする", () => {
    const unknown = structuredClone(input());
    unknown.observation.baseline_binding = { status: "unknown", reason: "not measured" };
    expect(success(unknown).baseline).toBe("unknown");
    const mixed = mutable() as unknown as MeasurementEvaluationInputV1;
    mixed.observation.baseline_binding = { status: "unknown", reason: "x", value: 1 } as never;
    failure(mixed, "baseline_binding_invalid");
  });

  it("U-MEVAL-011: baseline全context／HEAD binding driftをmismatchにする", () => {
    const mutations: Array<(baseline: MeasurementBaselineBindingMeasured) => void> = [
      (baseline) => {
        baseline.nfr_id = "NFR-OTHER";
      },
      (baseline) => {
        baseline.registry_revision = 3;
      },
      (baseline) => {
        baseline.metric_id = "other";
      },
      (baseline) => {
        baseline.unit = "other";
      },
      (baseline) => {
        baseline.workload_id = "other";
      },
      (baseline) => {
        baseline.environment_profile_id = "other";
      },
      (baseline) => {
        baseline.data_digest = digestB;
      },
      (baseline) => {
        baseline.window_kind = "sample";
      },
      (baseline) => {
        baseline.window_value = 2;
      },
      (baseline) => {
        baseline.window_unit = "minutes";
      },
      (baseline) => {
        baseline.measured_head = "2".repeat(40);
      },
    ];
    for (const mutate of mutations) {
      const value = structuredClone(input());
      const baseline = value.observation.baseline_binding;
      if (baseline.status !== "measured") throw new Error("fixture");
      mutate(baseline);
      expect(success(value).baseline).toBe("mismatch");
    }
    const distinctEvidence = structuredClone(input());
    const baseline = distinctEvidence.observation.baseline_binding;
    if (baseline.status !== "measured") throw new Error("fixture");
    baseline.evidence_digest = digestC;
    expect(success(distinctEvidence).baseline).toBe("usable");
  });

  it("U-MEVAL-012: hard limit unknown／pass／failをthresholdから独立評価する", () => {
    const unknown = structuredClone(input());
    unknown.declaration.hard_limit = {
      status: "unknown",
      value: null,
      unit: null,
      reference: "POL-1",
    };
    expect(success(unknown).hard_limit).toBe("unknown");
    expect(success(input()).hard_limit).toBe("pass");
    const failed = structuredClone(input());
    failed.observation.value = 121;
    failed.declaration.threshold.value = 200;
    expect(success(failed).hard_limit).toBe("fail");
    const higher = structuredClone(input());
    higher.declaration.metric.direction = "higher_is_better";
    higher.declaration.hard_limit.value = 90;
    higher.observation.value = 90;
    expect(success(higher).hard_limit).toBe("pass");
    higher.observation.value = 89;
    expect(success(higher).hard_limit).toBe("fail");
    const wrongUnit = structuredClone(input());
    wrongUnit.declaration.hard_limit.unit = "seconds";
    expect(success(wrongUnit).hard_limit).toBe("unknown");
    const range = structuredClone(input());
    range.declaration.metric.direction = "in_range";
    expect(success(range).hard_limit).toBe("unknown");
  });

  it("U-MEVAL-013: green／red／unknown真理値表をfail-closeする", () => {
    expect(success(input()).verdict).toBe("green");
    const red = structuredClone(input());
    red.observation.sample_count = 1;
    expect(success(red).verdict).toBe("red");
    const unknown = structuredClone(input());
    unknown.declaration.baseline = { status: "unknown", reason: "none", reference: "POL-1" };
    expect(success(unknown).verdict).toBe("unknown");
    unknown.observation.sample_count = 1;
    expect(success(unknown).verdict).toBe("red");
  });

  it("U-MEVAL-014: 全findingをaxis固定順でdedupeしraw値を出さない", () => {
    const value = structuredClone(input());
    value.observation.unit = "secret-value";
    value.observation.sample_count = 1;
    value.observation.value = 200;
    const result = success(value);
    expect(result.findings.map((entry) => entry.axis)).toEqual([
      "binding",
      "representativeness",
      "threshold",
      "baseline",
      "hard_limit",
    ]);
    expect(new Set(result.findings.map((entry) => entry.code)).size).toBe(result.findings.length);
    expect(result.findings).toEqual([
      {
        code: "binding_mismatch",
        axis: "binding",
        severity: "error",
        message: "binding mismatch",
        expected_ref: "measurement-policy:binding",
        observed_ref: null,
      },
      {
        code: "representativeness_below_minimum",
        axis: "representativeness",
        severity: "error",
        message: "representativeness below minimum",
        expected_ref: "measurement-policy:representativeness",
        observed_ref: null,
      },
      {
        code: "threshold_unknown",
        axis: "threshold",
        severity: "unknown",
        message: "threshold unknown",
        expected_ref: "measurement-policy:threshold",
        observed_ref: null,
      },
      {
        code: "baseline_mismatch",
        axis: "baseline",
        severity: "error",
        message: "baseline mismatch",
        expected_ref: "measurement-policy:baseline",
        observed_ref: null,
      },
      {
        code: "hard_limit_unknown",
        axis: "hard_limit",
        severity: "unknown",
        message: "hard limit unknown",
        expected_ref: "measurement-policy:hard_limit",
        observed_ref: null,
      },
    ]);
    expect(JSON.stringify(result.findings)).not.toContain("secret-value");
  });

  it("U-MEVAL-015: inputを変更せず同一入力へ決定的結果を返す", () => {
    const value = deepFreeze(input());
    const before = JSON.stringify(value);
    const first = evaluateMeasurementEvidence(value);
    const second = evaluateMeasurementEvidence(value);
    expect(first).toEqual(second);
    expect(first).not.toBe(second);
    if (first.ok && second.ok) expect(first.value.findings).not.toBe(second.value.findings);
    expect(JSON.stringify(value)).toBe(before);
  });
});
