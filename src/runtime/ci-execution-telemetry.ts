import { canonicalJson, compareBytewise, type Sha256Digest, sha256Digest } from "./digest";
import type { CiProfile, ExecutionSurface } from "./impact-ci";

export const CI_EXECUTION_TELEMETRY_SCHEMA_VERSION = "helix-ci-execution-telemetry.v1" as const;

export type CiTelemetryNodeKind = "job" | "step" | "test" | "setup" | "artifact_transfer";
export type CiTelemetryOperation =
  | "checkout"
  | "dependency_install"
  | "build"
  | "db_rebuild"
  | "doctor"
  | "test"
  | "artifact_upload"
  | "artifact_download"
  | "workflow_control";
export type CiTelemetryRunnerOs = "linux" | "windows" | "macos";
export type CiTelemetryArchitecture = "x64" | "arm64";
export type CiTelemetryStatus = "passed" | "failed" | "cancelled" | "timed_out" | "superseded";
export type CiTelemetryCacheClass = "cold" | "warm";
export type CiTelemetryCpuClass = "2-core" | "4-core" | "8-core" | "16-core";
export type CiTelemetryMemoryClass = "small" | "medium" | "large" | "xlarge";

export interface CiTelemetryRunnerV1 {
  os: CiTelemetryRunnerOs;
  architecture: CiTelemetryArchitecture;
  node_version: string;
  toolchain_digest: Sha256Digest;
  environment_digest: Sha256Digest;
}

export interface CiTelemetryTimingV1 {
  queued_at: string;
  started_at: string;
  completed_at: string;
  queue_time_ms: number;
  wall_time_ms: number;
  runner_time_ms: number;
}

export interface CiTelemetryResourceV1 {
  cpu_class: CiTelemetryCpuClass;
  memory_class: CiTelemetryMemoryClass;
}

export interface CiTelemetryCacheV1 {
  class: CiTelemetryCacheClass;
  hit: boolean;
}

export interface CiTelemetryOutcomeV1 {
  status: CiTelemetryStatus;
  exit_code: number | null;
  retry: boolean;
  flaky: boolean;
  first_detecting_oracle_id: string | null;
}

export interface CiTelemetryArtifactV1 {
  direction: "upload" | "download";
  lockfile_digest: Sha256Digest;
  input_digest: Sha256Digest;
  output_digest: Sha256Digest;
}

export interface CiExecutionTelemetryEventV1 {
  schema_version: typeof CI_EXECUTION_TELEMETRY_SCHEMA_VERSION;
  event_id: string;
  node_id: string;
  node_kind: CiTelemetryNodeKind;
  verification_identity: string;
  operation: CiTelemetryOperation;
  depends_on_node_ids: readonly string[];
  profile: CiProfile;
  execution_surface: ExecutionSurface;
  source_head: string;
  base_head: string;
  candidate_head: string;
  workflow_id: string;
  run_id: string;
  attempt: number;
  runner: CiTelemetryRunnerV1;
  timing: CiTelemetryTimingV1;
  resource: CiTelemetryResourceV1;
  cache: CiTelemetryCacheV1;
  outcome: CiTelemetryOutcomeV1;
  artifact: CiTelemetryArtifactV1 | null;
  payload_digest: Sha256Digest;
  evidence_digest: Sha256Digest;
}

export type CiExecutionTelemetryEventInput = Omit<
  CiExecutionTelemetryEventV1,
  "schema_version" | "payload_digest" | "evidence_digest"
>;

export interface CiTelemetryValidation {
  ok: boolean;
  errors: string[];
}

export interface CiTelemetryRunSummary {
  run_id: string;
  attempt: number;
  profile: CiProfile;
  execution_surface: ExecutionSurface;
  runner_os: CiTelemetryRunnerOs;
  runner_architecture: CiTelemetryArchitecture;
  runner_node_version: string;
  toolchain_digest: Sha256Digest;
  environment_digest: Sha256Digest;
  cache_class: CiTelemetryCacheClass;
  cache_hit: boolean;
  cpu_class: CiTelemetryCpuClass;
  memory_class: CiTelemetryMemoryClass;
  event_count: number;
  execution_wall_time_ms: number;
  critical_path_ms: number;
  critical_path_node_ids: readonly string[];
  duplicate_setup_count: number;
  duplicate_setup_wall_time_ms: number;
  excluded_from_percentiles: boolean;
}

export interface CiTelemetrySeries {
  profile: CiProfile;
  execution_surface: ExecutionSurface;
  runner_os: CiTelemetryRunnerOs;
  runner_architecture: CiTelemetryArchitecture;
  runner_node_version: string;
  toolchain_digest: Sha256Digest;
  environment_digest: Sha256Digest;
  cache_class: CiTelemetryCacheClass;
  cache_hit: boolean;
  cpu_class: CiTelemetryCpuClass;
  memory_class: CiTelemetryMemoryClass;
  sample_count: number;
  excluded_count: number;
  p50_wall_time_ms: number | null;
  p95_wall_time_ms: number | null;
  p99_wall_time_ms: number | null;
  p50_critical_path_ms: number | null;
  p95_critical_path_ms: number | null;
  p99_critical_path_ms: number | null;
}

export interface CiExecutionTelemetryProjectionV1 {
  schema_version: typeof CI_EXECUTION_TELEMETRY_SCHEMA_VERSION;
  source_head: string;
  base_head: string;
  candidate_head: string;
  event_count: number;
  run_count: number;
  failed_count: number;
  timed_out_count: number;
  cancelled_count: number;
  superseded_count: number;
  retry_count: number;
  flaky_count: number;
  preserved_failure_count: number;
  artifact_transfer_count: number;
  duplicate_setup_count: number;
  duplicate_setup_wall_time_ms: number;
  first_detecting_oracle_ids: readonly string[];
  failure_detection_yield: {
    failure_count: number;
    detected_failure_count: number;
    ratio: number | null;
  };
  runs: readonly CiTelemetryRunSummary[];
  series: readonly CiTelemetrySeries[];
}

export interface CiTelemetryProjectionResult extends CiTelemetryValidation {
  projection: CiExecutionTelemetryProjectionV1 | null;
}

const PROFILES = new Set<CiProfile>([
  "draft_preflight",
  "candidate_admission",
  "post_merge_full",
  "nightly_full",
]);
const EXECUTION_SURFACES = new Set<ExecutionSurface>(["local_internal", "github_actions"]);
const NODE_KINDS = new Set<CiTelemetryNodeKind>([
  "job",
  "step",
  "test",
  "setup",
  "artifact_transfer",
]);
const OPERATIONS = new Set<CiTelemetryOperation>([
  "checkout",
  "dependency_install",
  "build",
  "db_rebuild",
  "doctor",
  "test",
  "artifact_upload",
  "artifact_download",
  "workflow_control",
]);
const RUNNER_OSES = new Set<CiTelemetryRunnerOs>(["linux", "windows", "macos"]);
const ARCHITECTURES = new Set<CiTelemetryArchitecture>(["x64", "arm64"]);
const STATUSES = new Set<CiTelemetryStatus>([
  "passed",
  "failed",
  "cancelled",
  "timed_out",
  "superseded",
]);
const CACHE_CLASSES = new Set<CiTelemetryCacheClass>(["cold", "warm"]);
const CPU_CLASSES = new Set<CiTelemetryCpuClass>(["2-core", "4-core", "8-core", "16-core"]);
const MEMORY_CLASSES = new Set<CiTelemetryMemoryClass>(["small", "medium", "large", "xlarge"]);
const SETUP_OPERATIONS = new Set<CiTelemetryOperation>([
  "checkout",
  "dependency_install",
  "build",
  "db_rebuild",
  "doctor",
]);
const SHA_PATTERN = /^[0-9a-f]{40}$/u;
const DIGEST_PATTERN = /^sha256:[0-9a-f]{64}$/u;
const IDENTIFIER_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,127}$/u;
const NODE_VERSION_PATTERN = /^v?\d+\.\d+\.\d+$/u;
const RFC3339_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/u;
const FORBIDDEN_KEY_PATTERN =
  /(?:raw[_-]?log|stdout|stderr|credential|secret|password|passwd|api[_-]?key|private[_-]?key|\btoken\b|\bpii\b)/iu;

const EVENT_KEYS = [
  "schema_version",
  "event_id",
  "node_id",
  "node_kind",
  "verification_identity",
  "operation",
  "depends_on_node_ids",
  "profile",
  "execution_surface",
  "source_head",
  "base_head",
  "candidate_head",
  "workflow_id",
  "run_id",
  "attempt",
  "runner",
  "timing",
  "resource",
  "cache",
  "outcome",
  "artifact",
  "payload_digest",
  "evidence_digest",
] as const;
const RUNNER_KEYS = [
  "os",
  "architecture",
  "node_version",
  "toolchain_digest",
  "environment_digest",
] as const;
const TIMING_KEYS = [
  "queued_at",
  "started_at",
  "completed_at",
  "queue_time_ms",
  "wall_time_ms",
  "runner_time_ms",
] as const;
const RESOURCE_KEYS = ["cpu_class", "memory_class"] as const;
const CACHE_KEYS = ["class", "hit"] as const;
const OUTCOME_KEYS = [
  "status",
  "exit_code",
  "retry",
  "flaky",
  "first_detecting_oracle_id",
] as const;
const ARTIFACT_KEYS = ["direction", "lockfile_digest", "input_digest", "output_digest"] as const;

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function sortedUnique(values: readonly string[]): string[] {
  return [...new Set(values)].sort(compareBytewise);
}

function isDigest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && DIGEST_PATTERN.test(value);
}

function isIdentifier(value: unknown): value is string {
  return typeof value === "string" && IDENTIFIER_PATTERN.test(value);
}

function addUnknownKeys(
  value: UnknownRecord,
  allowed: readonly string[],
  path: string,
  errors: string[],
): void {
  const allowedSet = new Set(allowed);
  for (const key of Object.keys(value)) {
    if (!allowedSet.has(key)) errors.push(`unknown_field:${path}.${key}`);
  }
}

function collectForbiddenKeys(value: unknown, path: string, errors: string[]): void {
  if (Array.isArray(value)) {
    for (const [index, child] of value.entries()) {
      collectForbiddenKeys(child, `${path}[${index}]`, errors);
    }
    return;
  }
  if (!isRecord(value)) return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = `${path}.${key}`;
    if (FORBIDDEN_KEY_PATTERN.test(key)) errors.push(`sensitive_field_forbidden:${childPath}`);
    collectForbiddenKeys(child, childPath, errors);
  }
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value !== "string") return null;
  const match = RFC3339_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6]);
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > (daysInMonth[month - 1] ?? 0) ||
    hour > 23 ||
    minute > 59 ||
    second > 59
  ) {
    return null;
  }
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function finiteNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function withoutDigests(value: UnknownRecord): UnknownRecord {
  const { payload_digest: _payloadDigest, evidence_digest: _evidenceDigest, ...rest } = value;
  if (Array.isArray(rest.depends_on_node_ids)) {
    rest.depends_on_node_ids = sortedUnique(
      rest.depends_on_node_ids.filter((item): item is string => typeof item === "string"),
    );
  }
  return rest;
}

function payloadDigest(value: UnknownRecord): Sha256Digest {
  return sha256Digest(canonicalJson(withoutDigests(value)));
}

function evidenceDigest(value: UnknownRecord): Sha256Digest {
  const payload = withoutDigests(value);
  return sha256Digest(
    canonicalJson({
      ...payload,
      payload_digest: value.payload_digest,
    }),
  );
}

function validateNestedShape(
  event: UnknownRecord,
  key: "runner" | "timing" | "resource" | "cache" | "outcome",
  allowed: readonly string[],
  errors: string[],
): UnknownRecord | null {
  const value = event[key];
  if (!isRecord(value)) {
    errors.push(`${key}_invalid`);
    return null;
  }
  addUnknownKeys(value, allowed, key, errors);
  return value;
}

export function validateCiExecutionTelemetryEvent(
  event: CiExecutionTelemetryEventV1,
): CiTelemetryValidation {
  const errors: string[] = [];
  if (!isRecord(event)) return { ok: false, errors: ["event_invalid"] };

  addUnknownKeys(event, EVENT_KEYS, "event", errors);
  collectForbiddenKeys(event, "event", errors);

  if (event.schema_version !== CI_EXECUTION_TELEMETRY_SCHEMA_VERSION) {
    errors.push("schema_version_invalid");
  }
  for (const key of [
    "event_id",
    "node_id",
    "verification_identity",
    "workflow_id",
    "run_id",
  ] as const) {
    if (!isIdentifier(event[key])) errors.push(`${key}_invalid`);
  }
  if (!NODE_KINDS.has(event.node_kind)) errors.push("node_kind_invalid");
  if (!OPERATIONS.has(event.operation)) errors.push("operation_invalid");
  if (!Array.isArray(event.depends_on_node_ids)) {
    errors.push("depends_on_node_ids_invalid");
  } else {
    if (event.depends_on_node_ids.some((id) => !isIdentifier(id))) {
      errors.push("depends_on_node_ids_invalid");
    }
    if (
      canonicalJson(event.depends_on_node_ids) !==
      canonicalJson(
        sortedUnique(
          event.depends_on_node_ids.filter((id): id is string => typeof id === "string"),
        ),
      )
    ) {
      errors.push("depends_on_node_ids_noncanonical");
    }
  }
  if (!PROFILES.has(event.profile)) errors.push("profile_invalid");
  if (!EXECUTION_SURFACES.has(event.execution_surface)) errors.push("execution_surface_invalid");
  for (const key of ["source_head", "base_head", "candidate_head"] as const) {
    if (!SHA_PATTERN.test(event[key])) errors.push(`${key}_invalid`);
  }
  if (SHA_PATTERN.test(event.source_head) && SHA_PATTERN.test(event.candidate_head)) {
    if (event.source_head !== event.candidate_head) errors.push("source_candidate_head_mismatch");
  }
  if (!Number.isSafeInteger(event.attempt) || event.attempt < 1) errors.push("attempt_invalid");

  const runner = validateNestedShape(event, "runner", RUNNER_KEYS, errors);
  if (runner) {
    if (!RUNNER_OSES.has(runner.os as CiTelemetryRunnerOs)) errors.push("runner_os_invalid");
    if (!ARCHITECTURES.has(runner.architecture as CiTelemetryArchitecture)) {
      errors.push("runner_architecture_invalid");
    }
    if (
      typeof runner.node_version !== "string" ||
      !NODE_VERSION_PATTERN.test(runner.node_version)
    ) {
      errors.push("runner_node_version_invalid");
    }
    if (!isDigest(runner.toolchain_digest)) errors.push("runner_toolchain_digest_invalid");
    if (!isDigest(runner.environment_digest)) errors.push("runner_environment_digest_invalid");
  }

  const timing = validateNestedShape(event, "timing", TIMING_KEYS, errors);
  const timestamps = timing
    ? (["queued_at", "started_at", "completed_at"] as const).map((key) =>
        parseTimestamp(timing[key]),
      )
    : [];
  if (timing) {
    for (const [index, key] of (["queued_at", "started_at", "completed_at"] as const).entries()) {
      if (timestamps[index] === null) errors.push(`timing_${key}_invalid`);
    }
    for (const key of ["queue_time_ms", "wall_time_ms", "runner_time_ms"] as const) {
      if (!finiteNonNegativeInteger(timing[key])) errors.push(`timing_${key}_invalid`);
    }
    const [queuedAt, startedAt, completedAt] = timestamps;
    if (queuedAt !== null && startedAt !== null && completedAt !== null) {
      if (queuedAt > startedAt || startedAt > completedAt) errors.push("timing_order_invalid");
      if (
        finiteNonNegativeInteger(timing.queue_time_ms) &&
        timing.queue_time_ms !== startedAt - queuedAt
      ) {
        errors.push("timing_queue_duration_mismatch");
      }
      if (
        finiteNonNegativeInteger(timing.wall_time_ms) &&
        timing.wall_time_ms !== completedAt - startedAt
      ) {
        errors.push("timing_wall_duration_mismatch");
      }
      if (
        finiteNonNegativeInteger(timing.runner_time_ms) &&
        finiteNonNegativeInteger(timing.wall_time_ms) &&
        timing.runner_time_ms > timing.wall_time_ms
      ) {
        errors.push("timing_runner_duration_exceeds_wall");
      }
    }
  }

  const resource = validateNestedShape(event, "resource", RESOURCE_KEYS, errors);
  if (resource) {
    if (!CPU_CLASSES.has(resource.cpu_class as CiTelemetryCpuClass))
      errors.push("resource_cpu_class_invalid");
    if (!MEMORY_CLASSES.has(resource.memory_class as CiTelemetryMemoryClass)) {
      errors.push("resource_memory_class_invalid");
    }
  }

  const cache = validateNestedShape(event, "cache", CACHE_KEYS, errors);
  if (cache) {
    if (!CACHE_CLASSES.has(cache.class as CiTelemetryCacheClass))
      errors.push("cache_class_invalid");
    if (typeof cache.hit !== "boolean") errors.push("cache_hit_invalid");
    if (cache.class === "cold" && cache.hit === true) errors.push("cold_cache_hit_invalid");
  }

  const outcome = validateNestedShape(event, "outcome", OUTCOME_KEYS, errors);
  if (outcome) {
    if (!STATUSES.has(outcome.status as CiTelemetryStatus)) errors.push("outcome_status_invalid");
    if (
      outcome.exit_code !== null &&
      (!Number.isSafeInteger(outcome.exit_code) || (outcome.exit_code as number) < 0)
    ) {
      errors.push("outcome_exit_code_invalid");
    }
    if (typeof outcome.retry !== "boolean") errors.push("outcome_retry_invalid");
    if (typeof outcome.flaky !== "boolean") errors.push("outcome_flaky_invalid");
    if (
      outcome.first_detecting_oracle_id !== null &&
      !isIdentifier(outcome.first_detecting_oracle_id)
    ) {
      errors.push("outcome_first_detecting_oracle_invalid");
    }
    if (outcome.status === "passed" && outcome.exit_code !== 0) {
      errors.push("passed_exit_code_mismatch");
    }
    if (
      outcome.status === "failed" &&
      (outcome.exit_code === null ||
        !Number.isSafeInteger(outcome.exit_code) ||
        outcome.exit_code === 0)
    ) {
      errors.push("failed_exit_code_invalid");
    }
    if (outcome.status !== "passed" && outcome.status !== "failed" && outcome.exit_code !== null) {
      errors.push("nonterminal_exit_code_invalid");
    }
    if (
      (outcome.status === "failed" || outcome.status === "timed_out") &&
      (!isIdentifier(outcome.first_detecting_oracle_id) ||
        outcome.first_detecting_oracle_id.length === 0)
    ) {
      errors.push("failure_detector_required");
    }
    if (
      outcome.status !== "failed" &&
      outcome.status !== "timed_out" &&
      outcome.first_detecting_oracle_id !== null
    ) {
      errors.push("nonfailure_detector_forbidden");
    }
  }

  if (event.artifact !== null && event.artifact !== undefined) {
    if (!isRecord(event.artifact)) {
      errors.push("artifact_invalid");
    } else {
      addUnknownKeys(event.artifact, ARTIFACT_KEYS, "artifact", errors);
      if (event.artifact.direction !== "upload" && event.artifact.direction !== "download") {
        errors.push("artifact_direction_invalid");
      }
      if (!isDigest(event.artifact.lockfile_digest))
        errors.push("artifact_lockfile_digest_invalid");
      if (!isDigest(event.artifact.input_digest)) errors.push("artifact_input_digest_invalid");
      if (!isDigest(event.artifact.output_digest)) errors.push("artifact_output_digest_invalid");
    }
  }
  if (
    event.node_kind === "artifact_transfer" &&
    (event.artifact === null || event.artifact === undefined)
  ) {
    errors.push("artifact_required");
  }
  if (
    event.node_kind !== "artifact_transfer" &&
    event.artifact !== null &&
    event.artifact !== undefined
  ) {
    errors.push("artifact_only_transfer_node");
  }
  if (event.operation === "artifact_upload" || event.operation === "artifact_download") {
    if (
      event.node_kind !== "artifact_transfer" ||
      event.artifact === null ||
      event.artifact === undefined
    ) {
      errors.push("artifact_operation_requires_transfer_node");
    } else if (
      (event.operation === "artifact_upload" && event.artifact.direction !== "upload") ||
      (event.operation === "artifact_download" && event.artifact.direction !== "download")
    ) {
      errors.push("artifact_operation_direction_mismatch");
    }
  }
  if (
    event.node_kind === "artifact_transfer" &&
    event.operation !== "artifact_upload" &&
    event.operation !== "artifact_download"
  ) {
    errors.push("artifact_transfer_operation_invalid");
  }
  if (event.node_kind === "test" && event.operation !== "test")
    errors.push("test_operation_mismatch");
  if (event.node_kind === "setup" && !SETUP_OPERATIONS.has(event.operation)) {
    errors.push("setup_operation_mismatch");
  }

  if (!isDigest(event.payload_digest)) errors.push("payload_digest_invalid");
  if (!isDigest(event.evidence_digest)) errors.push("evidence_digest_invalid");
  if (isDigest(event.payload_digest)) {
    try {
      if (event.payload_digest !== payloadDigest(event)) errors.push("payload_digest_mismatch");
    } catch {
      errors.push("payload_digest_uncomputable");
    }
  }
  if (isDigest(event.evidence_digest)) {
    try {
      if (event.evidence_digest !== evidenceDigest(event)) errors.push("evidence_digest_mismatch");
    } catch {
      errors.push("evidence_digest_uncomputable");
    }
  }

  return { ok: errors.length === 0, errors: sortedUnique(errors) };
}

export function createCiExecutionTelemetryEvent(
  input: CiExecutionTelemetryEventInput,
): CiExecutionTelemetryEventV1 {
  const inputRecord = input as unknown as UnknownRecord;
  const { payload_digest: _payloadDigest, evidence_digest: _evidenceDigest, ...rest } = inputRecord;
  const normalized: UnknownRecord = {
    ...rest,
    schema_version: CI_EXECUTION_TELEMETRY_SCHEMA_VERSION,
    depends_on_node_ids: Array.isArray(rest.depends_on_node_ids)
      ? sortedUnique(rest.depends_on_node_ids.filter((id): id is string => typeof id === "string"))
      : rest.depends_on_node_ids,
  };
  normalized.payload_digest = payloadDigest(normalized);
  normalized.evidence_digest = evidenceDigest(normalized);
  const event = normalized as unknown as CiExecutionTelemetryEventV1;
  const validation = validateCiExecutionTelemetryEvent(event);
  if (!validation.ok) throw new Error(`invalid_ci_telemetry:${validation.errors.join(",")}`);
  return event;
}

export function validateCiExecutionTelemetryBatch(
  events: readonly CiExecutionTelemetryEventV1[],
): CiTelemetryValidation {
  const errors: string[] = [];
  if (!Array.isArray(events) || events.length === 0)
    return { ok: false, errors: ["telemetry_batch_empty"] };

  for (const event of events) errors.push(...validateCiExecutionTelemetryEvent(event).errors);
  if (errors.length > 0) return { ok: false, errors: sortedUnique(errors) };
  const eventIds = new Set<string>();
  const nodeIds = new Set<string>();
  for (const event of events) {
    if (eventIds.has(event.event_id)) errors.push(`duplicate_event_id:${event.event_id}`);
    eventIds.add(event.event_id);
    if (nodeIds.has(event.node_id)) errors.push(`duplicate_node_id:${event.node_id}`);
    nodeIds.add(event.node_id);
  }

  const first = events[0];
  if (first) {
    const bindingFields = [
      "schema_version",
      "profile",
      "execution_surface",
      "source_head",
      "base_head",
      "candidate_head",
      "workflow_id",
      "run_id",
      "attempt",
    ] as const;
    for (const field of bindingFields) {
      if (events.some((event) => event[field] !== first[field])) {
        errors.push(`batch_binding_mismatch:${field}`);
      }
    }
    if (
      events.some((event) => event.runner.environment_digest !== first.runner.environment_digest)
    ) {
      errors.push("batch_binding_mismatch:environment_digest");
    }
    if (events.some((event) => event.runner.toolchain_digest !== first.runner.toolchain_digest)) {
      errors.push("batch_binding_mismatch:toolchain_digest");
    }
    if (events.some((event) => event.runner.os !== first.runner.os))
      errors.push("batch_binding_mismatch:runner_os");
    if (events.some((event) => event.runner.architecture !== first.runner.architecture)) {
      errors.push("batch_binding_mismatch:runner_architecture");
    }
    if (events.some((event) => event.runner.node_version !== first.runner.node_version)) {
      errors.push("batch_binding_mismatch:runner_node_version");
    }
    if (events.some((event) => event.cache.class !== first.cache.class)) {
      errors.push("batch_binding_mismatch:cache_class");
    }
    if (events.some((event) => event.cache.hit !== first.cache.hit)) {
      errors.push("batch_binding_mismatch:cache_hit");
    }
    if (events.some((event) => event.resource.cpu_class !== first.resource.cpu_class)) {
      errors.push("batch_binding_mismatch:cpu_class");
    }
    if (events.some((event) => event.resource.memory_class !== first.resource.memory_class)) {
      errors.push("batch_binding_mismatch:memory_class");
    }
  }

  const dependencies = new Map(events.map((event) => [event.node_id, event.depends_on_node_ids]));
  const eventsByNodeId = new Map(events.map((event) => [event.node_id, event]));
  for (const event of events) {
    const dependencyIds = event.depends_on_node_ids;
    if (new Set(dependencyIds).size !== dependencyIds.length) {
      errors.push(`duplicate_dependency:${event.node_id}`);
    }
    for (const dependency of dependencyIds) {
      if (!nodeIds.has(dependency)) {
        errors.push(`missing_dependency:${event.node_id}:${dependency}`);
        continue;
      }
      if (dependency === event.node_id) errors.push(`self_dependency:${event.node_id}`);
      const dependencyEvent = eventsByNodeId.get(dependency);
      if (dependencyEvent) {
        const dependencyCompletedAt = parseTimestamp(dependencyEvent.timing.completed_at);
        const eventStartedAt = parseTimestamp(event.timing.started_at);
        if (
          dependencyCompletedAt !== null &&
          eventStartedAt !== null &&
          eventStartedAt < dependencyCompletedAt
        ) {
          errors.push(`dependency_timing_order_invalid:${event.node_id}:${dependency}`);
        }
        if (
          event.node_kind === "artifact_transfer" &&
          event.artifact !== null &&
          dependencyEvent.node_kind === "artifact_transfer" &&
          dependencyEvent.artifact !== null &&
          event.artifact.input_digest !== dependencyEvent.artifact.output_digest
        ) {
          errors.push(`artifact_dependency_digest_mismatch:${event.node_id}:${dependency}`);
        }
        if (
          event.node_kind === "artifact_transfer" &&
          event.artifact !== null &&
          dependencyEvent.node_kind === "artifact_transfer" &&
          dependencyEvent.artifact !== null &&
          event.artifact.lockfile_digest !== dependencyEvent.artifact.lockfile_digest
        ) {
          errors.push(`artifact_dependency_lockfile_mismatch:${event.node_id}:${dependency}`);
        }
      }
    }
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (nodeId: string): void => {
    if (visiting.has(nodeId)) {
      errors.push(`dependency_cycle:${nodeId}`);
      return;
    }
    if (visited.has(nodeId)) return;
    visiting.add(nodeId);
    for (const dependency of dependencies.get(nodeId) ?? []) {
      if (dependencies.has(dependency)) visit(dependency);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
  };
  for (const nodeId of [...nodeIds].sort(compareBytewise)) visit(nodeId);

  return { ok: errors.length === 0, errors: sortedUnique(errors) };
}

function percentile(values: readonly number[], fraction: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.max(0, Math.ceil(sorted.length * fraction) - 1)] ?? 0;
}

function criticalPath(events: readonly CiExecutionTelemetryEventV1[]): {
  duration: number;
  nodeIds: string[];
} {
  const byId = new Map(events.map((event) => [event.node_id, event]));
  const distance = new Map<string, number>();
  const paths = new Map<string, string[]>();
  const ordered: string[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (nodeId: string): void => {
    if (visited.has(nodeId)) return;
    if (visiting.has(nodeId)) return;
    visiting.add(nodeId);
    const event = byId.get(nodeId);
    for (const dependency of event?.depends_on_node_ids ?? []) {
      if (byId.has(dependency)) visit(dependency);
    }
    visiting.delete(nodeId);
    visited.add(nodeId);
    ordered.push(nodeId);
  };
  for (const event of [...events].sort((left, right) =>
    compareBytewise(left.node_id, right.node_id),
  )) {
    visit(event.node_id);
  }

  let bestDuration = 0;
  let bestPath: string[] = [];
  for (const nodeId of ordered) {
    const event = byId.get(nodeId);
    if (!event) continue;
    let nodeDuration = event.timing.wall_time_ms;
    let nodePath = [nodeId];
    for (const dependency of event.depends_on_node_ids) {
      const dependencyDuration = distance.get(dependency);
      const dependencyPath = paths.get(dependency);
      if (dependencyDuration === undefined || !dependencyPath) continue;
      const candidateDuration = dependencyDuration + event.timing.wall_time_ms;
      const candidatePath = [...dependencyPath, nodeId];
      const candidateKey = candidatePath.join("\0");
      const currentKey = nodePath.join("\0");
      if (
        candidateDuration > nodeDuration ||
        (candidateDuration === nodeDuration && candidateKey < currentKey)
      ) {
        nodeDuration = candidateDuration;
        nodePath = candidatePath;
      }
    }
    distance.set(nodeId, nodeDuration);
    paths.set(nodeId, nodePath);
    const pathKey = nodePath.join("\0");
    const bestKey = bestPath.join("\0");
    if (nodeDuration > bestDuration || (nodeDuration === bestDuration && pathKey < bestKey)) {
      bestDuration = nodeDuration;
      bestPath = nodePath;
    }
  }
  return { duration: bestDuration, nodeIds: bestPath };
}

function runKey(event: CiExecutionTelemetryEventV1): string {
  return `${event.run_id}\0${String(event.attempt).padStart(12, "0")}`;
}

function runSummaryKey(summary: CiTelemetryRunSummary): string {
  return `${summary.run_id}\0${String(summary.attempt).padStart(12, "0")}`;
}

function summarizeRun(events: readonly CiExecutionTelemetryEventV1[]): CiTelemetryRunSummary {
  const first = events[0];
  if (!first) throw new Error("telemetry_run_empty");
  const queued = events.map((event) => Date.parse(event.timing.queued_at));
  const completed = events.map((event) => Date.parse(event.timing.completed_at));
  const duplicateSetupByIdentity = new Map<string, CiExecutionTelemetryEventV1[]>();
  for (const event of events) {
    if (event.node_kind !== "setup") continue;
    const key = `${event.operation}\0${event.verification_identity}`;
    const current = duplicateSetupByIdentity.get(key) ?? [];
    current.push(event);
    duplicateSetupByIdentity.set(key, current);
  }
  let duplicateSetupCount = 0;
  let duplicateSetupWallTimeMs = 0;
  for (const setupEvents of duplicateSetupByIdentity.values()) {
    if (setupEvents.length < 2) continue;
    const extras = [...setupEvents]
      .sort((left, right) => compareBytewise(left.node_id, right.node_id))
      .slice(1);
    duplicateSetupCount += extras.length;
    duplicateSetupWallTimeMs += extras.reduce((sum, event) => sum + event.timing.wall_time_ms, 0);
  }
  const path = criticalPath(events);
  const excluded = events.some(
    (event) => event.outcome.status === "cancelled" || event.outcome.status === "superseded",
  );
  return {
    run_id: first.run_id,
    attempt: first.attempt,
    profile: first.profile,
    execution_surface: first.execution_surface,
    runner_os: first.runner.os,
    runner_architecture: first.runner.architecture,
    runner_node_version: first.runner.node_version,
    toolchain_digest: first.runner.toolchain_digest,
    environment_digest: first.runner.environment_digest,
    cache_class: first.cache.class,
    cache_hit: first.cache.hit,
    cpu_class: first.resource.cpu_class,
    memory_class: first.resource.memory_class,
    event_count: events.length,
    execution_wall_time_ms: Math.max(...completed) - Math.min(...queued),
    critical_path_ms: path.duration,
    critical_path_node_ids: path.nodeIds,
    duplicate_setup_count: duplicateSetupCount,
    duplicate_setup_wall_time_ms: duplicateSetupWallTimeMs,
    excluded_from_percentiles: excluded,
  };
}

export function projectCiExecutionTelemetry(
  events: readonly CiExecutionTelemetryEventV1[],
): CiTelemetryProjectionResult {
  const errors: string[] = [];
  if (!Array.isArray(events) || events.length === 0) {
    return { ok: false, errors: ["telemetry_projection_empty"], projection: null };
  }
  if (events.some((event) => !isRecord(event))) {
    return { ok: false, errors: ["event_invalid"], projection: null };
  }

  const groups = new Map<string, CiExecutionTelemetryEventV1[]>();
  for (const event of events) {
    const key = runKey(event);
    const current = groups.get(key) ?? [];
    current.push(event);
    groups.set(key, current);
  }
  for (const [key, group] of groups) {
    const validation = validateCiExecutionTelemetryBatch(group);
    errors.push(...validation.errors.map((error) => `${key}:${error}`));
  }

  const globalEventIds = new Set<string>();
  for (const event of events) {
    if (globalEventIds.has(event.event_id))
      errors.push(`duplicate_global_event_id:${event.event_id}`);
    globalEventIds.add(event.event_id);
  }
  const first = events[0];
  if (!first) return { ok: false, errors: sortedUnique(errors), projection: null };
  for (const field of ["source_head", "base_head", "candidate_head"] as const) {
    if (events.some((event) => event[field] !== first[field]))
      errors.push(`projection_binding_mismatch:${field}`);
  }
  if (errors.length > 0) return { ok: false, errors: sortedUnique(errors), projection: null };

  const runSummaries = [...groups.values()]
    .map((group) => summarizeRun(group))
    .sort((left, right) => compareBytewise(runSummaryKey(left), runSummaryKey(right)));
  const seriesGroups = new Map<string, CiTelemetryRunSummary[]>();
  for (const summary of runSummaries) {
    const key = [
      summary.profile,
      summary.execution_surface,
      summary.runner_os,
      summary.runner_architecture,
      summary.runner_node_version,
      summary.toolchain_digest,
      summary.environment_digest,
      summary.cache_class,
      String(summary.cache_hit),
      summary.cpu_class,
      summary.memory_class,
    ].join("\0");
    const current = seriesGroups.get(key) ?? [];
    current.push(summary);
    seriesGroups.set(key, current);
  }
  const series = [...seriesGroups.entries()]
    .sort(([left], [right]) => compareBytewise(left, right))
    .map(([_, summaries]) => {
      const representative = summaries[0];
      if (!representative) throw new Error("telemetry_series_empty");
      const included = summaries.filter((summary) => !summary.excluded_from_percentiles);
      return {
        profile: representative.profile,
        execution_surface: representative.execution_surface,
        runner_os: representative.runner_os,
        runner_architecture: representative.runner_architecture,
        runner_node_version: representative.runner_node_version,
        toolchain_digest: representative.toolchain_digest,
        environment_digest: representative.environment_digest,
        cache_class: representative.cache_class,
        cache_hit: representative.cache_hit,
        cpu_class: representative.cpu_class,
        memory_class: representative.memory_class,
        sample_count: included.length,
        excluded_count: summaries.length - included.length,
        p50_wall_time_ms: percentile(
          included.map((summary) => summary.execution_wall_time_ms),
          0.5,
        ),
        p95_wall_time_ms: percentile(
          included.map((summary) => summary.execution_wall_time_ms),
          0.95,
        ),
        p99_wall_time_ms: percentile(
          included.map((summary) => summary.execution_wall_time_ms),
          0.99,
        ),
        p50_critical_path_ms: percentile(
          included.map((summary) => summary.critical_path_ms),
          0.5,
        ),
        p95_critical_path_ms: percentile(
          included.map((summary) => summary.critical_path_ms),
          0.95,
        ),
        p99_critical_path_ms: percentile(
          included.map((summary) => summary.critical_path_ms),
          0.99,
        ),
      } satisfies CiTelemetrySeries;
    });

  const failed = events.filter((event) => event.outcome.status === "failed");
  const timedOut = events.filter((event) => event.outcome.status === "timed_out");
  const cancelled = events.filter((event) => event.outcome.status === "cancelled");
  const superseded = events.filter((event) => event.outcome.status === "superseded");
  const failures = [...failed, ...timedOut];
  const detectedFailures = failures.filter(
    (event) => event.outcome.first_detecting_oracle_id !== null,
  );
  const firstDetectingOracleIds = sortedUnique(
    failures
      .map((event) => event.outcome.first_detecting_oracle_id)
      .filter((oracle): oracle is string => oracle !== null),
  );
  const artifactTransfers = events.filter((event) => event.node_kind === "artifact_transfer");
  const duplicateSetupCount = runSummaries.reduce((sum, run) => sum + run.duplicate_setup_count, 0);
  const duplicateSetupWallTimeMs = runSummaries.reduce(
    (sum, run) => sum + run.duplicate_setup_wall_time_ms,
    0,
  );

  return {
    ok: true,
    errors: [],
    projection: {
      schema_version: CI_EXECUTION_TELEMETRY_SCHEMA_VERSION,
      source_head: first.source_head,
      base_head: first.base_head,
      candidate_head: first.candidate_head,
      event_count: events.length,
      run_count: runSummaries.length,
      failed_count: failed.length,
      timed_out_count: timedOut.length,
      cancelled_count: cancelled.length,
      superseded_count: superseded.length,
      retry_count: events.filter((event) => event.outcome.retry).length,
      flaky_count: events.filter((event) => event.outcome.flaky).length,
      preserved_failure_count: failures.length,
      artifact_transfer_count: artifactTransfers.length,
      duplicate_setup_count: duplicateSetupCount,
      duplicate_setup_wall_time_ms: duplicateSetupWallTimeMs,
      first_detecting_oracle_ids: firstDetectingOracleIds,
      failure_detection_yield: {
        failure_count: failures.length,
        detected_failure_count: detectedFailures.length,
        ratio: failures.length === 0 ? null : detectedFailures.length / failures.length,
      },
      runs: runSummaries,
      series,
    },
  };
}
