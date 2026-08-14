import type { NfrEntryV1 } from "./nfr-registry";

export const MEASUREMENT_EVALUATION_SCHEMA_VERSION = "helix-measurement-evaluation.v1" as const;

export type MeasurementEvaluationFailureCode =
  | "evaluation_schema_invalid"
  | "observation_invalid"
  | "baseline_binding_invalid"
  | "evaluation_time_invalid";
export type MeasurementAxis =
  | "binding"
  | "freshness"
  | "representativeness"
  | "threshold"
  | "baseline"
  | "hard_limit";

export interface MeasurementBaselineBindingUnknown {
  status: "unknown";
  reason: string;
}

export interface MeasurementBaselineBindingMeasured {
  status: "measured";
  run_id: string;
  nfr_id: string;
  registry_revision: number;
  metric_id: string;
  unit: string;
  workload_id: string;
  environment_profile_id: string;
  data_digest: `sha256:${string}`;
  window_kind: NfrEntryV1["window"]["kind"];
  window_value: number;
  window_unit: string;
  measured_head: string;
  evidence_digest: `sha256:${string}`;
  value: number;
}

export type MeasurementBaselineBinding =
  | MeasurementBaselineBindingUnknown
  | MeasurementBaselineBindingMeasured;

export interface MeasurementObservationV1 {
  observation_id: string;
  nfr_id: string;
  registry_revision: number;
  metric_id: string;
  unit: string;
  value: number;
  workload_id: string;
  environment_profile_id: string;
  data_digest: `sha256:${string}`;
  sampling_method: NfrEntryV1["sampling"]["method"];
  sample_count: number;
  representativeness_ratio: number;
  window_kind: NfrEntryV1["window"]["kind"];
  window_value: number;
  window_unit: string;
  started_at: string;
  completed_at: string;
  measured_head: string;
  evidence_digest: `sha256:${string}`;
  baseline_binding: MeasurementBaselineBinding;
}

export interface MeasurementEvaluationInputV1 {
  schema_version: typeof MEASUREMENT_EVALUATION_SCHEMA_VERSION;
  declaration: NfrEntryV1;
  observation: MeasurementObservationV1;
  evaluated_at: string;
}

export interface MeasurementFinding {
  code: string;
  axis: MeasurementAxis;
  severity: "error" | "unknown";
  message: string;
  expected_ref: string | null;
  observed_ref: string | null;
}

export interface MeasurementEvaluationResultV1 {
  schema_version: typeof MEASUREMENT_EVALUATION_SCHEMA_VERSION;
  nfr_id: string;
  observation_id: string;
  evaluated_at: string;
  binding: "match" | "mismatch" | "unknown";
  freshness: "current" | "stale" | "unknown";
  representativeness: "representative" | "non_representative" | "unknown";
  threshold: "pass" | "fail" | "unknown";
  baseline: "usable" | "mismatch" | "unknown";
  hard_limit: "pass" | "fail" | "unknown";
  verdict: "green" | "red" | "unknown";
  findings: readonly MeasurementFinding[];
}

export type MeasurementEvaluationAnalysis =
  | { ok: true; value: MeasurementEvaluationResultV1 }
  | {
      ok: false;
      failureCodes: readonly MeasurementEvaluationFailureCode[];
      messages: readonly string[];
    };

type JsonObject = Record<string, unknown>;

const ROOT_KEYS = ["schema_version", "declaration", "observation", "evaluated_at"] as const;
const OBSERVATION_KEYS = [
  "observation_id",
  "nfr_id",
  "registry_revision",
  "metric_id",
  "unit",
  "value",
  "workload_id",
  "environment_profile_id",
  "data_digest",
  "sampling_method",
  "sample_count",
  "representativeness_ratio",
  "window_kind",
  "window_value",
  "window_unit",
  "started_at",
  "completed_at",
  "measured_head",
  "evidence_digest",
  "baseline_binding",
] as const;
const BASELINE_UNKNOWN_KEYS = ["status", "reason"] as const;
const BASELINE_MEASURED_KEYS = [
  "status",
  "run_id",
  "nfr_id",
  "registry_revision",
  "metric_id",
  "unit",
  "workload_id",
  "environment_profile_id",
  "data_digest",
  "window_kind",
  "window_value",
  "window_unit",
  "measured_head",
  "evidence_digest",
  "value",
] as const;
const DIGEST = /^sha256:[a-f0-9]{64}$/u;
const HEAD = /^[a-f0-9]{40}$/u;
const UTC_INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u;
const FAILURE_ORDER: readonly MeasurementEvaluationFailureCode[] = [
  "evaluation_schema_invalid",
  "observation_invalid",
  "baseline_binding_invalid",
  "evaluation_time_invalid",
];
const AXIS_ORDER: readonly MeasurementAxis[] = [
  "binding",
  "freshness",
  "representativeness",
  "threshold",
  "baseline",
  "hard_limit",
];

function isRecord(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: JsonObject, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && expected.every((key) => actual.includes(key));
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function positiveSafeInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function parseInstant(value: unknown): number | null {
  if (typeof value !== "string" || !UTC_INSTANT.test(value)) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function addFailure(
  failures: Map<MeasurementEvaluationFailureCode, string>,
  code: MeasurementEvaluationFailureCode,
  message: string,
): void {
  if (!failures.has(code)) failures.set(code, message);
}

function validateObservation(
  raw: JsonObject,
  failures: Map<MeasurementEvaluationFailureCode, string>,
): void {
  if (!exactKeys(raw, OBSERVATION_KEYS)) {
    addFailure(failures, "observation_invalid", "observation exact key set is invalid");
    return;
  }
  for (const key of [
    "observation_id",
    "nfr_id",
    "metric_id",
    "unit",
    "workload_id",
    "environment_profile_id",
    "window_unit",
  ] as const) {
    if (!text(raw[key]))
      addFailure(failures, "observation_invalid", `observation ${key} is invalid`);
  }
  if (!positiveSafeInteger(raw.registry_revision) || !positiveSafeInteger(raw.sample_count))
    addFailure(failures, "observation_invalid", "observation positive integer is invalid");
  if (!finite(raw.value) || !finite(raw.window_value) || (raw.window_value as number) <= 0)
    addFailure(failures, "observation_invalid", "observation finite value is invalid");
  if (
    !finite(raw.representativeness_ratio) ||
    (raw.representativeness_ratio as number) < 0 ||
    (raw.representativeness_ratio as number) > 1
  )
    addFailure(failures, "observation_invalid", "observation representativeness ratio is invalid");
  if (
    typeof raw.data_digest !== "string" ||
    !DIGEST.test(raw.data_digest) ||
    typeof raw.evidence_digest !== "string" ||
    !DIGEST.test(raw.evidence_digest)
  )
    addFailure(failures, "observation_invalid", "observation digest is invalid");
  if (typeof raw.measured_head !== "string" || !HEAD.test(raw.measured_head))
    addFailure(failures, "observation_invalid", "observation measured_head is invalid");
  if (
    !new Set(["all", "fixed_count", "ratio", "time_interval"]).has(String(raw.sampling_method)) ||
    !new Set(["run", "sample", "release", "time"]).has(String(raw.window_kind))
  )
    addFailure(failures, "observation_invalid", "observation enum is invalid");
  const started = parseInstant(raw.started_at);
  const completed = parseInstant(raw.completed_at);
  if (started === null || completed === null || started > completed)
    addFailure(failures, "evaluation_time_invalid", "observation time range is invalid");
}

function validateBaseline(
  raw: unknown,
  failures: Map<MeasurementEvaluationFailureCode, string>,
): void {
  if (!isRecord(raw)) {
    addFailure(failures, "baseline_binding_invalid", "baseline binding is not an object");
    return;
  }
  if (raw.status === "unknown") {
    if (!exactKeys(raw, BASELINE_UNKNOWN_KEYS) || !text(raw.reason))
      addFailure(failures, "baseline_binding_invalid", "unknown baseline binding is invalid");
    return;
  }
  if (raw.status !== "measured" || !exactKeys(raw, BASELINE_MEASURED_KEYS)) {
    addFailure(failures, "baseline_binding_invalid", "measured baseline binding is invalid");
    return;
  }
  for (const key of [
    "run_id",
    "nfr_id",
    "metric_id",
    "unit",
    "workload_id",
    "environment_profile_id",
    "window_unit",
  ] as const) {
    if (!text(raw[key]))
      addFailure(failures, "baseline_binding_invalid", `baseline ${key} is invalid`);
  }
  if (
    !positiveSafeInteger(raw.registry_revision) ||
    !finite(raw.window_value) ||
    (raw.window_value as number) <= 0 ||
    !finite(raw.value)
  )
    addFailure(failures, "baseline_binding_invalid", "baseline numeric field is invalid");
  if (
    typeof raw.data_digest !== "string" ||
    !DIGEST.test(raw.data_digest) ||
    typeof raw.evidence_digest !== "string" ||
    !DIGEST.test(raw.evidence_digest) ||
    typeof raw.measured_head !== "string" ||
    !HEAD.test(raw.measured_head)
  )
    addFailure(failures, "baseline_binding_invalid", "baseline evidence binding is invalid");
}

function declarationUsable(raw: unknown): raw is NfrEntryV1 {
  if (!isRecord(raw)) return false;
  const metric = raw.metric;
  const workload = raw.workload;
  const environment = raw.environment;
  const sampling = raw.sampling;
  const freshness = raw.freshness_policy;
  const threshold = raw.threshold;
  const window = raw.window;
  return (
    text(raw.nfr_id) &&
    positiveSafeInteger(raw.revision) &&
    isRecord(metric) &&
    text(metric.id) &&
    text(metric.unit) &&
    new Set(["higher_is_better", "lower_is_better", "in_range"]).has(String(metric.direction)) &&
    isRecord(workload) &&
    text(workload.id) &&
    isRecord(environment) &&
    text(environment.profile_id) &&
    isRecord(sampling) &&
    text(sampling.method) &&
    positiveSafeInteger(sampling.minimum_sample_count) &&
    isRecord(freshness) &&
    finite(freshness.max_age_seconds) &&
    (freshness.max_age_seconds as number) > 0 &&
    finite(freshness.minimum_representativeness_ratio) &&
    isRecord(threshold) &&
    text(threshold.metric_id) &&
    text(threshold.unit) &&
    new Set(["lt", "lte", "eq", "gte", "gt", "between"]).has(String(threshold.comparator)) &&
    isRecord(window) &&
    text(window.kind) &&
    finite(window.value) &&
    text(window.unit) &&
    isRecord(raw.baseline) &&
    isRecord(raw.hard_limit)
  );
}

function compareThreshold(value: number, threshold: NfrEntryV1["threshold"]): boolean | null {
  if (threshold.comparator === "between") {
    if (!Array.isArray(threshold.value) || threshold.value.length !== 2) return null;
    const [lower, upper] = threshold.value;
    if (!finite(lower) || !finite(upper) || lower > upper) return null;
    return threshold.inclusive ? value >= lower && value <= upper : value > lower && value < upper;
  }
  if (!finite(threshold.value)) return null;
  switch (threshold.comparator) {
    case "lt":
      return value < threshold.value;
    case "lte":
      return value <= threshold.value;
    case "eq":
      return value === threshold.value;
    case "gte":
      return value >= threshold.value;
    case "gt":
      return value > threshold.value;
  }
}

function finding(
  code: string,
  axis: MeasurementAxis,
  severity: "error" | "unknown",
): MeasurementFinding {
  return {
    code,
    axis,
    severity,
    message: code.replaceAll("_", " "),
    expected_ref: axis,
    observed_ref: null,
  };
}

function sameBaselineContext(
  baseline: MeasurementBaselineBindingMeasured,
  observation: MeasurementObservationV1,
): boolean {
  return (
    baseline.nfr_id === observation.nfr_id &&
    baseline.registry_revision === observation.registry_revision &&
    baseline.metric_id === observation.metric_id &&
    baseline.unit === observation.unit &&
    baseline.workload_id === observation.workload_id &&
    baseline.environment_profile_id === observation.environment_profile_id &&
    baseline.data_digest === observation.data_digest &&
    baseline.window_kind === observation.window_kind &&
    baseline.window_value === observation.window_value &&
    baseline.window_unit === observation.window_unit &&
    baseline.measured_head === observation.measured_head
  );
}

export function evaluateMeasurementEvidence(raw: unknown): MeasurementEvaluationAnalysis {
  const failures = new Map<MeasurementEvaluationFailureCode, string>();
  if (
    !isRecord(raw) ||
    !exactKeys(raw, ROOT_KEYS) ||
    raw.schema_version !== MEASUREMENT_EVALUATION_SCHEMA_VERSION
  ) {
    addFailure(failures, "evaluation_schema_invalid", "measurement evaluation root is invalid");
  }
  if (isRecord(raw)) {
    if (!declarationUsable(raw.declaration))
      addFailure(failures, "evaluation_schema_invalid", "measurement declaration is invalid");
    if (!isRecord(raw.observation))
      addFailure(failures, "observation_invalid", "observation is not an object");
    else {
      validateObservation(raw.observation, failures);
      validateBaseline(raw.observation.baseline_binding, failures);
    }
    if (parseInstant(raw.evaluated_at) === null)
      addFailure(failures, "evaluation_time_invalid", "evaluated_at is invalid");
  }
  if (failures.size > 0) {
    const ordered = FAILURE_ORDER.filter((code) => failures.has(code));
    return {
      ok: false,
      failureCodes: ordered,
      messages: ordered.map((code) => failures.get(code) as string),
    };
  }

  const input = raw as unknown as MeasurementEvaluationInputV1;
  const declaration = input.declaration;
  const observation = input.observation;
  const findings: MeasurementFinding[] = [];
  const bindingMatch =
    observation.nfr_id === declaration.nfr_id &&
    observation.registry_revision === declaration.revision &&
    observation.metric_id === declaration.metric.id &&
    observation.unit === declaration.metric.unit &&
    observation.workload_id === declaration.workload.id &&
    observation.environment_profile_id === declaration.environment.profile_id &&
    observation.sampling_method === declaration.sampling.method &&
    observation.window_kind === declaration.window.kind &&
    observation.window_value === declaration.window.value &&
    observation.window_unit === declaration.window.unit;
  const binding: MeasurementEvaluationResultV1["binding"] = bindingMatch ? "match" : "mismatch";
  if (!bindingMatch) findings.push(finding("binding_mismatch", "binding", "error"));

  const completed = Date.parse(observation.completed_at);
  const evaluated = Date.parse(input.evaluated_at);
  let freshness: MeasurementEvaluationResultV1["freshness"];
  if (evaluated < completed) {
    freshness = "unknown";
    findings.push(finding("freshness_evaluated_before_completion", "freshness", "unknown"));
  } else if ((evaluated - completed) / 1000 <= declaration.freshness_policy.max_age_seconds) {
    freshness = "current";
  } else {
    freshness = "stale";
    findings.push(finding("freshness_stale", "freshness", "error"));
  }

  const representative =
    observation.sample_count >= declaration.sampling.minimum_sample_count &&
    observation.representativeness_ratio >=
      declaration.freshness_policy.minimum_representativeness_ratio;
  const representativeness: MeasurementEvaluationResultV1["representativeness"] = representative
    ? "representative"
    : "non_representative";
  if (!representative)
    findings.push(finding("representativeness_below_minimum", "representativeness", "error"));

  const thresholdComparison =
    declaration.threshold.metric_id === observation.metric_id &&
    declaration.threshold.unit === observation.unit
      ? compareThreshold(observation.value, declaration.threshold)
      : null;
  const threshold: MeasurementEvaluationResultV1["threshold"] =
    thresholdComparison === null ? "unknown" : thresholdComparison ? "pass" : "fail";
  if (threshold !== "pass")
    findings.push(
      finding(
        threshold === "fail" ? "threshold_failed" : "threshold_unknown",
        "threshold",
        threshold === "fail" ? "error" : "unknown",
      ),
    );

  let baseline: MeasurementEvaluationResultV1["baseline"] = "unknown";
  if (
    declaration.baseline.status === "measured" &&
    observation.baseline_binding.status === "measured"
  ) {
    baseline =
      sameBaselineContext(observation.baseline_binding, observation) &&
      declaration.baseline.unit === observation.baseline_binding.unit &&
      declaration.baseline.value === observation.baseline_binding.value
        ? "usable"
        : "mismatch";
  }
  if (baseline !== "usable")
    findings.push(
      finding(
        baseline === "mismatch" ? "baseline_mismatch" : "baseline_unknown",
        "baseline",
        baseline === "mismatch" ? "error" : "unknown",
      ),
    );

  let hardLimit: MeasurementEvaluationResultV1["hard_limit"] = "unknown";
  if (
    declaration.hard_limit.status === "declared" &&
    declaration.hard_limit.unit === observation.unit &&
    finite(declaration.hard_limit.value)
  ) {
    if (declaration.metric.direction === "higher_is_better")
      hardLimit = observation.value >= declaration.hard_limit.value ? "pass" : "fail";
    else if (declaration.metric.direction === "lower_is_better")
      hardLimit = observation.value <= declaration.hard_limit.value ? "pass" : "fail";
  }
  if (hardLimit !== "pass")
    findings.push(
      finding(
        hardLimit === "fail" ? "hard_limit_failed" : "hard_limit_unknown",
        "hard_limit",
        hardLimit === "fail" ? "error" : "unknown",
      ),
    );

  const orderedFindings = [...new Map(findings.map((entry) => [entry.code, entry])).values()].sort(
    (left, right) =>
      AXIS_ORDER.indexOf(left.axis) - AXIS_ORDER.indexOf(right.axis) ||
      left.code.localeCompare(right.code),
  );
  const statuses = [binding, freshness, representativeness, threshold, baseline, hardLimit];
  const hasFailure = statuses.some((status) =>
    ["mismatch", "stale", "non_representative", "fail"].includes(status),
  );
  const hasUnknown = statuses.includes("unknown");
  return {
    ok: true,
    value: {
      schema_version: MEASUREMENT_EVALUATION_SCHEMA_VERSION,
      nfr_id: declaration.nfr_id,
      observation_id: observation.observation_id,
      evaluated_at: input.evaluated_at,
      binding,
      freshness,
      representativeness,
      threshold,
      baseline,
      hard_limit: hardLimit,
      verdict: hasFailure ? "red" : hasUnknown ? "unknown" : "green",
      findings: orderedFindings,
    },
  };
}
