/**
 * Issue #221: bounded probe execution と append-only measurement history。
 *
 * 任意 command / shell / network / credential を入力として受け取らない。
 * probe は固定 allowlist の ID で選択し、実行器はこのモジュールの port に
 * resource bound を適用した結果だけを返す。Node が唯一の DB transaction writer であり、
 * Python semantic core や probe 出力を直接 DB／command として扱わない。
 */
import { canonicalJson, type Sha256Digest, sha256Digest } from "../shared/canonical-digest";
import type { HarnessDb } from "../state-db";

export const BOUNDED_PROBE_PLAN_SCHEMA_VERSION = "helix-bounded-probe-plan.v1" as const;
export const BOUNDED_PROBE_RESULT_SCHEMA_VERSION = "helix-bounded-probe-result.v1" as const;
export const MEASUREMENT_HISTORY_EVENT_SCHEMA_VERSION =
  "helix-measurement-history-event.v1" as const;
export const MEASUREMENT_HISTORY_HEAD_ID = "measurement-history" as const;

export const BOUNDED_PROBE_ALLOWLIST = [
  "db-probe",
  "db-readonly",
  "db-rebuild",
  "harness-check",
] as const;

type BoundedProbeId = (typeof BOUNDED_PROBE_ALLOWLIST)[number];
type UtcInstant = string;
type FullHead = string;

export type BoundedProbeFailureCode =
  | "plan_schema_invalid"
  | "probe_not_allowlisted"
  | "registry_digest_unavailable"
  | "registry_digest_mismatch"
  | "current_head_unavailable"
  | "current_head_mismatch"
  | "dataset_digest_unavailable"
  | "dataset_digest_mismatch"
  | "probe_execution_timeout"
  | "probe_execution_failed"
  | "probe_result_invalid"
  | "probe_result_insufficient"
  | "history_event_invalid"
  | "history_head_unseeded"
  | "history_head_conflict"
  | "history_conflict"
  | "history_commit_failed";

export interface BoundedProbeBoundsV1 {
  warmup_count: number;
  sample_count: number;
  timeout_ms: number;
  deadline_at: UtcInstant;
  output_limit_bytes: number;
  cpu_time_ms: number;
  memory_limit_bytes: number;
  network: "deny";
  credentials: "none";
}

export interface MeasurementJoinContextV1 {
  requirement_id: string;
  release_id: string | null;
  regression_id: string | null;
  improvement_episode_id: string | null;
}

export interface BoundedProbePlanV1 {
  schema_version: typeof BOUNDED_PROBE_PLAN_SCHEMA_VERSION;
  run_id: string;
  nfr_id: string;
  registry_revision: number;
  registry_digest: Sha256Digest;
  metric_id: string;
  unit: string;
  probe_id: BoundedProbeId;
  workload_id: string;
  environment_profile_id: string;
  data_digest: Sha256Digest;
  measured_head: FullHead;
  runner_id: string;
  runner_version: string;
  bounds: BoundedProbeBoundsV1;
  join_context: MeasurementJoinContextV1;
}

export interface BoundedProbeExecutionResultV1 {
  schema_version: typeof BOUNDED_PROBE_RESULT_SCHEMA_VERSION;
  status: "passed" | "failed" | "timed_out" | "insufficient";
  exit_code: number | null;
  sample_count: number;
  representativeness_ratio: number;
  value: number | null;
  stdout_bytes: number;
  stderr_bytes: number;
  cpu_time_ms: number;
  peak_memory_bytes: number;
  started_at: UtcInstant;
  completed_at: UtcInstant;
  stdout_digest: Sha256Digest;
  stderr_digest: Sha256Digest;
}

export interface BoundedProbeRunV1 {
  plan: BoundedProbePlanV1;
  plan_digest: Sha256Digest;
  result: BoundedProbeExecutionResultV1;
  result_digest: Sha256Digest;
}

export interface MeasurementHistoryEventV1 {
  schema_version: typeof MEASUREMENT_HISTORY_EVENT_SCHEMA_VERSION;
  event_digest: Sha256Digest;
  previous_event_digest: Sha256Digest | null;
  run_id: string;
  plan_digest: Sha256Digest;
  result_digest: Sha256Digest;
  nfr_id: string;
  registry_revision: number;
  registry_digest: Sha256Digest;
  metric_id: string;
  unit: string;
  probe_id: BoundedProbeId;
  workload_id: string;
  environment_profile_id: string;
  data_digest: Sha256Digest;
  measured_head: FullHead;
  runner_id: string;
  runner_version: string;
  requirement_id: string;
  release_id: string | null;
  regression_id: string | null;
  improvement_episode_id: string | null;
  status: BoundedProbeExecutionResultV1["status"];
  quality: "measured" | "unknown" | "failed";
  exit_code: number | null;
  sample_count: number;
  representativeness_ratio: number;
  value: number | null;
  stdout_digest: Sha256Digest;
  stderr_digest: Sha256Digest;
  started_at: UtcInstant;
  completed_at: UtcInstant;
  recorded_at: UtcInstant;
}

export interface ProbeAdmissionContextV1 {
  registry_digest: Sha256Digest | null;
  current_head: FullHead | null;
  current_data_digest: Sha256Digest | null;
}

export interface BoundedProbePortV1 {
  /**
   * 実行器はsignalを尊重して、deadline到達時に子プロセス／workerを停止しなければならない。
   * この契約を満たさないportをbounded executionとして扱わない。
   */
  execute(plan: BoundedProbePlanV1, signal: AbortSignal): Promise<BoundedProbeExecutionResultV1>;
}

export interface ProbeAnalysisFailure {
  ok: false;
  failureCodes: readonly BoundedProbeFailureCode[];
  messages: readonly string[];
}

export type ProbeAnalysis<T> = { ok: true; value: T } | ProbeAnalysisFailure;

export interface MeasurementHistoryAppendReceiptV1 {
  status: "appended" | "idempotent";
  event_digest: Sha256Digest;
  previous_event_digest: Sha256Digest | null;
  sequence: number;
}

export interface MeasurementHistoryReplayV1 {
  ok: boolean;
  events: readonly MeasurementHistoryEventV1[];
  last_event_digest: Sha256Digest | null;
  last_sequence: number;
  failure: string | null;
}

const PLAN_KEYS = [
  "schema_version",
  "run_id",
  "nfr_id",
  "registry_revision",
  "registry_digest",
  "metric_id",
  "unit",
  "probe_id",
  "workload_id",
  "environment_profile_id",
  "data_digest",
  "measured_head",
  "runner_id",
  "runner_version",
  "bounds",
  "join_context",
] as const;
const BOUNDS_KEYS = [
  "warmup_count",
  "sample_count",
  "timeout_ms",
  "deadline_at",
  "output_limit_bytes",
  "cpu_time_ms",
  "memory_limit_bytes",
  "network",
  "credentials",
] as const;
const JOIN_KEYS = [
  "requirement_id",
  "release_id",
  "regression_id",
  "improvement_episode_id",
] as const;
const RESULT_KEYS = [
  "schema_version",
  "status",
  "exit_code",
  "sample_count",
  "representativeness_ratio",
  "value",
  "stdout_bytes",
  "stderr_bytes",
  "cpu_time_ms",
  "peak_memory_bytes",
  "started_at",
  "completed_at",
  "stdout_digest",
  "stderr_digest",
] as const;
const EVENT_KEYS = [
  "schema_version",
  "event_digest",
  "previous_event_digest",
  "run_id",
  "plan_digest",
  "result_digest",
  "nfr_id",
  "registry_revision",
  "registry_digest",
  "metric_id",
  "unit",
  "probe_id",
  "workload_id",
  "environment_profile_id",
  "data_digest",
  "measured_head",
  "runner_id",
  "runner_version",
  "requirement_id",
  "release_id",
  "regression_id",
  "improvement_episode_id",
  "status",
  "quality",
  "exit_code",
  "sample_count",
  "representativeness_ratio",
  "value",
  "stdout_digest",
  "stderr_digest",
  "started_at",
  "completed_at",
  "recorded_at",
] as const;
const DIGEST = /^sha256:[a-f0-9]{64}$/u;
const HEAD = /^[a-f0-9]{40}$/u;
const ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/u;
const NFR = /^HR-NFR-REG-[0-9]{3}$/u;
const UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/u;
const ALLOWLIST = new Set<string>(BOUNDED_PROBE_ALLOWLIST);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): boolean {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && expected.every((key) => actual.includes(key));
}

function text(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 256 && ID.test(value);
}

function nullableText(value: unknown): value is string | null {
  return value === null || text(value);
}

function digest(value: unknown): value is Sha256Digest {
  return typeof value === "string" && DIGEST.test(value);
}

function instant(value: unknown): value is UtcInstant {
  return typeof value === "string" && UTC.test(value) && Number.isFinite(Date.parse(value));
}

function head(value: unknown): value is FullHead {
  return typeof value === "string" && HEAD.test(value);
}

function positiveInteger(value: unknown): value is number {
  return Number.isSafeInteger(value) && (value as number) > 0;
}

function boundedInteger(value: unknown, maximum: number): value is number {
  return Number.isSafeInteger(value) && (value as number) >= 0 && (value as number) <= maximum;
}

function finite(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function failure(
  failureCodes: readonly BoundedProbeFailureCode[],
  messages: readonly string[],
): ProbeAnalysisFailure {
  return { ok: false, failureCodes, messages };
}

function planFailure(code: BoundedProbeFailureCode, message: string): ProbeAnalysisFailure {
  return failure([code], [message]);
}

function validateBounds(value: unknown): boolean {
  if (!isRecord(value) || !exactKeys(value, BOUNDS_KEYS)) return false;
  return (
    boundedInteger(value.warmup_count, 1000) &&
    positiveInteger(value.sample_count) &&
    value.sample_count <= 1000 &&
    positiveInteger(value.timeout_ms) &&
    value.timeout_ms <= 30_000 &&
    instant(value.deadline_at) &&
    positiveInteger(value.output_limit_bytes) &&
    value.output_limit_bytes <= 64 * 1024 &&
    boundedInteger(value.cpu_time_ms, 30_000) &&
    positiveInteger(value.memory_limit_bytes) &&
    value.memory_limit_bytes <= 512 * 1024 * 1024 &&
    value.network === "deny" &&
    value.credentials === "none"
  );
}

function validateJoinContext(value: unknown): boolean {
  if (!isRecord(value) || !exactKeys(value, JOIN_KEYS)) return false;
  return (
    text(value.requirement_id) &&
    nullableText(value.release_id) &&
    nullableText(value.regression_id) &&
    nullableText(value.improvement_episode_id)
  );
}

function validatePlanShape(value: unknown): value is BoundedProbePlanV1 {
  if (!isRecord(value) || !exactKeys(value, PLAN_KEYS)) return false;
  return (
    value.schema_version === BOUNDED_PROBE_PLAN_SCHEMA_VERSION &&
    text(value.run_id) &&
    NFR.test(String(value.nfr_id)) &&
    positiveInteger(value.registry_revision) &&
    digest(value.registry_digest) &&
    text(value.metric_id) &&
    text(value.unit) &&
    typeof value.probe_id === "string" &&
    ALLOWLIST.has(value.probe_id) &&
    text(value.workload_id) &&
    text(value.environment_profile_id) &&
    digest(value.data_digest) &&
    head(value.measured_head) &&
    text(value.runner_id) &&
    text(value.runner_version) &&
    validateBounds(value.bounds) &&
    validateJoinContext(value.join_context)
  );
}

function validateResultShape(value: unknown): value is BoundedProbeExecutionResultV1 {
  if (!isRecord(value) || !exactKeys(value, RESULT_KEYS)) return false;
  return (
    value.schema_version === BOUNDED_PROBE_RESULT_SCHEMA_VERSION &&
    new Set(["passed", "failed", "timed_out", "insufficient"]).has(String(value.status)) &&
    (value.exit_code === null || Number.isSafeInteger(value.exit_code)) &&
    boundedInteger(value.sample_count, 1000) &&
    finite(value.representativeness_ratio) &&
    value.representativeness_ratio >= 0 &&
    value.representativeness_ratio <= 1 &&
    (value.value === null || finite(value.value)) &&
    boundedInteger(value.stdout_bytes, 64 * 1024) &&
    boundedInteger(value.stderr_bytes, 64 * 1024) &&
    positiveInteger(value.cpu_time_ms) &&
    value.cpu_time_ms <= 30_000 &&
    boundedInteger(value.peak_memory_bytes, 512 * 1024 * 1024) &&
    instant(value.started_at) &&
    instant(value.completed_at) &&
    Date.parse(value.started_at) <= Date.parse(value.completed_at) &&
    digest(value.stdout_digest) &&
    digest(value.stderr_digest) &&
    (value.status === "passed" || value.value === null)
  );
}

function resultBoundFailure(
  result: BoundedProbeExecutionResultV1,
  bounds: BoundedProbeBoundsV1,
): BoundedProbeFailureCode | null {
  if (result.sample_count > bounds.sample_count) return "probe_result_invalid";
  if (result.stdout_bytes + result.stderr_bytes > bounds.output_limit_bytes)
    return "probe_result_invalid";
  if (
    result.cpu_time_ms > bounds.cpu_time_ms ||
    result.peak_memory_bytes > bounds.memory_limit_bytes
  )
    return "probe_result_invalid";
  if (Date.parse(result.completed_at) > Date.parse(bounds.deadline_at))
    return "probe_result_invalid";
  if (
    result.status === "passed" &&
    (result.exit_code !== 0 || result.sample_count !== bounds.sample_count || result.value === null)
  )
    return "probe_result_insufficient";
  if (result.status === "insufficient" && result.sample_count >= bounds.sample_count)
    return "probe_result_invalid";
  return null;
}

export function computeBoundedProbePlanDigest(plan: BoundedProbePlanV1): Sha256Digest {
  return sha256Digest(canonicalJson(plan));
}

export function computeBoundedProbeResultDigest(
  result: BoundedProbeExecutionResultV1,
): Sha256Digest {
  return sha256Digest(canonicalJson(result));
}

/** planのschema・authority identity・current head/datasetを一方向にadmitする。 */
export function admitBoundedProbePlan(
  input: unknown,
  context: ProbeAdmissionContextV1,
): ProbeAnalysis<BoundedProbePlanV1> {
  if (!validatePlanShape(input)) {
    return planFailure(
      "plan_schema_invalid",
      "bounded probe planのexact schemaまたは値域が不正です",
    );
  }
  if (!ALLOWLIST.has(input.probe_id)) {
    return planFailure("probe_not_allowlisted", "未登録のprobe IDは実行できません");
  }
  if (context.registry_digest === null) {
    return planFailure(
      "registry_digest_unavailable",
      "registry digestが取得できないため実行を拒否しました",
    );
  }
  if (context.registry_digest !== input.registry_digest) {
    return planFailure("registry_digest_mismatch", "registry digestがplanと一致しません");
  }
  if (context.current_head === null) {
    return planFailure(
      "current_head_unavailable",
      "current HEADが取得できないため実行を拒否しました",
    );
  }
  if (context.current_head !== input.measured_head) {
    return planFailure("current_head_mismatch", "実測対象HEADがcurrent HEADと一致しません");
  }
  if (context.current_data_digest === null) {
    return planFailure(
      "dataset_digest_unavailable",
      "probe dataset digestが取得できないため実行を拒否しました",
    );
  }
  if (context.current_data_digest !== input.data_digest) {
    return planFailure("dataset_digest_mismatch", "probe dataset digestがplanと一致しません");
  }
  return { ok: true, value: input };
}

/** portが返した結果をresource bound・deadline・statusの観点で再検証する。 */
export async function runBoundedProbe(
  planInput: unknown,
  context: ProbeAdmissionContextV1,
  port: BoundedProbePortV1,
): Promise<ProbeAnalysis<BoundedProbeRunV1>> {
  const admitted = admitBoundedProbePlan(planInput, context);
  if (!admitted.ok) return admitted;
  const deadlineMs = Date.parse(admitted.value.bounds.deadline_at);
  const remainingMs = Math.min(admitted.value.bounds.timeout_ms, deadlineMs - Date.now());
  if (remainingMs <= 0) {
    return planFailure(
      "probe_execution_timeout",
      "probeのdeadlineが到達済みのため実行を拒否しました",
    );
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  let timedOut = false;
  const execution = Promise.resolve().then(() => port.execute(admitted.value, controller.signal));
  // timeout後にportがrejectしてもunhandled rejectionを発生させず、実行器の失敗をfail-closeする。
  void execution.catch(() => undefined);
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
      reject(new Error("probe_execution_timeout"));
    }, remainingMs);
  });
  let result: BoundedProbeExecutionResultV1;
  try {
    result = await Promise.race([execution, timeout]);
  } catch (error) {
    if (timer !== undefined) clearTimeout(timer);
    if (timedOut || (error instanceof Error && error.message === "probe_execution_timeout")) {
      return planFailure(
        "probe_execution_timeout",
        "probeがtimeoutまたはdeadline内に完了しなかったため拒否しました",
      );
    }
    return planFailure("probe_execution_failed", "probe実行器が失敗したため結果を受理しません");
  }
  if (timer !== undefined) clearTimeout(timer);
  if (!validateResultShape(result)) {
    return planFailure("probe_result_invalid", "probe resultのexact schemaまたは値域が不正です");
  }
  const resultFailure = resultBoundFailure(result, admitted.value.bounds);
  if (resultFailure !== null)
    return planFailure(
      resultFailure,
      resultFailure === "probe_result_insufficient"
        ? "passedを名乗るprobeが要求sample数を満たしていません"
        : "probe resultがresource／deadline／status境界を満たしていません",
    );
  return {
    ok: true,
    value: {
      plan: admitted.value,
      plan_digest: computeBoundedProbePlanDigest(admitted.value),
      result,
      result_digest: computeBoundedProbeResultDigest(result),
    },
  };
}

function eventBody(
  run: BoundedProbeRunV1,
  previous_event_digest: Sha256Digest | null,
  recorded_at: UtcInstant,
): Omit<MeasurementHistoryEventV1, "event_digest"> {
  const { plan, result } = run;
  return {
    schema_version: MEASUREMENT_HISTORY_EVENT_SCHEMA_VERSION,
    previous_event_digest,
    run_id: plan.run_id,
    plan_digest: run.plan_digest,
    result_digest: run.result_digest,
    nfr_id: plan.nfr_id,
    registry_revision: plan.registry_revision,
    registry_digest: plan.registry_digest,
    metric_id: plan.metric_id,
    unit: plan.unit,
    probe_id: plan.probe_id,
    workload_id: plan.workload_id,
    environment_profile_id: plan.environment_profile_id,
    data_digest: plan.data_digest,
    measured_head: plan.measured_head,
    runner_id: plan.runner_id,
    runner_version: plan.runner_version,
    requirement_id: plan.join_context.requirement_id,
    release_id: plan.join_context.release_id,
    regression_id: plan.join_context.regression_id,
    improvement_episode_id: plan.join_context.improvement_episode_id,
    status: result.status,
    quality:
      result.status === "passed"
        ? "measured"
        : result.status === "insufficient"
          ? "unknown"
          : "failed",
    exit_code: result.exit_code,
    sample_count: result.sample_count,
    representativeness_ratio: result.representativeness_ratio,
    value: result.value,
    stdout_digest: result.stdout_digest,
    stderr_digest: result.stderr_digest,
    started_at: result.started_at,
    completed_at: result.completed_at,
    recorded_at,
  };
}

function buildEvent(
  run: BoundedProbeRunV1,
  previous_event_digest: Sha256Digest | null,
  recorded_at: UtcInstant,
): MeasurementHistoryEventV1 {
  const body = eventBody(run, previous_event_digest, recorded_at);
  return { ...body, event_digest: sha256Digest(canonicalJson(body)) };
}

function validateEvent(event: unknown): event is MeasurementHistoryEventV1 {
  if (!isRecord(event) || !exactKeys(event, EVENT_KEYS)) return false;
  if (
    event.schema_version !== MEASUREMENT_HISTORY_EVENT_SCHEMA_VERSION ||
    !digest(event.event_digest) ||
    !(event.previous_event_digest === null || digest(event.previous_event_digest)) ||
    !text(event.run_id) ||
    !digest(event.plan_digest) ||
    !digest(event.result_digest) ||
    !NFR.test(String(event.nfr_id)) ||
    !positiveInteger(event.registry_revision) ||
    !digest(event.registry_digest) ||
    !text(event.metric_id) ||
    !text(event.unit) ||
    typeof event.probe_id !== "string" ||
    !ALLOWLIST.has(event.probe_id) ||
    !text(event.workload_id) ||
    !text(event.environment_profile_id) ||
    !digest(event.data_digest) ||
    !head(event.measured_head) ||
    !text(event.runner_id) ||
    !text(event.runner_version) ||
    !text(event.requirement_id) ||
    !nullableText(event.release_id) ||
    !nullableText(event.regression_id) ||
    !nullableText(event.improvement_episode_id) ||
    !new Set(["passed", "failed", "timed_out", "insufficient"]).has(String(event.status)) ||
    !new Set(["measured", "unknown", "failed"]).has(String(event.quality)) ||
    (event.exit_code !== null && !Number.isSafeInteger(event.exit_code)) ||
    !boundedInteger(event.sample_count, 1000) ||
    !finite(event.representativeness_ratio) ||
    event.representativeness_ratio < 0 ||
    event.representativeness_ratio > 1 ||
    (event.value !== null && !finite(event.value)) ||
    !digest(event.stdout_digest) ||
    !digest(event.stderr_digest) ||
    !instant(event.started_at) ||
    !instant(event.completed_at) ||
    !instant(event.recorded_at)
  )
    return false;
  const { event_digest, ...body } = event;
  return sha256Digest(canonicalJson(body)) === event_digest;
}

function rowEvent(row: Record<string, unknown>): MeasurementHistoryEventV1 | null {
  if (typeof row.event_json !== "string") return null;
  try {
    const parsed = JSON.parse(row.event_json) as unknown;
    return validateEvent(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/** bounded runをDB headとのsingle transactionでappendする。再送は同一bytesだけ冪等。 */
export function appendBoundedProbeRun(
  db: HarnessDb,
  run: BoundedProbeRunV1,
  recorded_at: UtcInstant = run.result.completed_at,
): ProbeAnalysis<MeasurementHistoryAppendReceiptV1> {
  if (!validatePlanShape(run.plan) || computeBoundedProbePlanDigest(run.plan) !== run.plan_digest) {
    return planFailure("plan_schema_invalid", "append対象planのdigestまたはschemaが不正です");
  }
  if (
    !validateResultShape(run.result) ||
    computeBoundedProbeResultDigest(run.result) !== run.result_digest
  ) {
    return planFailure("probe_result_invalid", "append対象resultのdigestまたはschemaが不正です");
  }
  const resultFailure = resultBoundFailure(run.result, run.plan.bounds);
  if (resultFailure !== null)
    return planFailure(
      resultFailure,
      "append対象resultがplanのboundまたはstatus境界を満たしていません",
    );
  if (!instant(recorded_at))
    return planFailure("history_event_invalid", "recorded_atがUTC instantではありません");
  try {
    db.exec("BEGIN IMMEDIATE");
    const existing = db
      .prepare(
        "SELECT event_digest,event_json,sequence,previous_event_digest FROM measurement_history_events WHERE run_id = ?",
      )
      .get(run.plan.run_id);
    if (existing !== undefined) {
      const event = rowEvent(existing);
      if (
        event === null ||
        event.event_digest !== existing.event_digest ||
        event.plan_digest !== run.plan_digest ||
        event.result_digest !== run.result_digest
      ) {
        db.exec("ROLLBACK");
        return planFailure("history_conflict", "既存runのhistory eventが壊れているか別payloadです");
      }
      const head = db
        .prepare(
          "SELECT last_event_digest,last_sequence FROM measurement_history_heads WHERE head_id = ?",
        )
        .get(MEASUREMENT_HISTORY_HEAD_ID);
      db.exec("ROLLBACK");
      return {
        ok: true,
        value: {
          status: "idempotent",
          event_digest: event.event_digest,
          previous_event_digest: event.previous_event_digest,
          sequence: Number(existing.sequence ?? head?.last_sequence ?? 0),
        },
      };
    }
    const head = db
      .prepare(
        "SELECT last_event_digest,last_sequence FROM measurement_history_heads WHERE head_id = ?",
      )
      .get(MEASUREMENT_HISTORY_HEAD_ID);
    if (head === undefined) {
      db.exec("ROLLBACK");
      return planFailure("history_head_unseeded", "measurement history headがseedされていません");
    }
    const previous = head.last_event_digest === null ? null : String(head.last_event_digest);
    if (!(previous === null || digest(previous))) {
      db.exec("ROLLBACK");
      return planFailure("history_head_conflict", "measurement history head digestが不正です");
    }
    const sequence = Number(head.last_sequence ?? 0) + 1;
    const event = buildEvent(run, previous, recorded_at);
    if (!validateEvent(event)) {
      db.exec("ROLLBACK");
      return planFailure("history_event_invalid", "生成したhistory eventがschemaに適合しません");
    }
    db.prepare(
      `INSERT INTO measurement_history_events
       (event_digest,sequence,previous_event_digest,run_id,plan_digest,result_digest,schema_version,
        nfr_id,registry_revision,registry_digest,metric_id,unit,probe_id,workload_id,
        environment_profile_id,data_digest,measured_head,runner_id,runner_version,requirement_id,
        release_id,regression_id,improvement_episode_id,status,quality,exit_code,sample_count,
        representativeness_ratio,value,stdout_digest,stderr_digest,started_at,completed_at,recorded_at,event_json)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    ).run(
      event.event_digest,
      sequence,
      event.previous_event_digest,
      event.run_id,
      event.plan_digest,
      event.result_digest,
      event.schema_version,
      event.nfr_id,
      event.registry_revision,
      event.registry_digest,
      event.metric_id,
      event.unit,
      event.probe_id,
      event.workload_id,
      event.environment_profile_id,
      event.data_digest,
      event.measured_head,
      event.runner_id,
      event.runner_version,
      event.requirement_id,
      event.release_id,
      event.regression_id,
      event.improvement_episode_id,
      event.status,
      event.quality,
      event.exit_code,
      event.sample_count,
      event.representativeness_ratio,
      event.value,
      event.stdout_digest,
      event.stderr_digest,
      event.started_at,
      event.completed_at,
      event.recorded_at,
      canonicalJson(event),
    );
    const updated = db
      .prepare(
        "UPDATE measurement_history_heads SET last_event_digest = ?, last_sequence = ?, updated_at = ? WHERE head_id = ? AND last_event_digest IS ? AND last_sequence = ?",
      )
      .run(
        event.event_digest,
        sequence,
        recorded_at,
        MEASUREMENT_HISTORY_HEAD_ID,
        previous,
        sequence - 1,
      );
    if (updated.changes !== 1) throw new Error("measurement_history_head_cas_conflict");
    db.exec("COMMIT");
    return {
      ok: true,
      value: {
        status: "appended",
        event_digest: event.event_digest,
        previous_event_digest: event.previous_event_digest,
        sequence,
      },
    };
  } catch (error) {
    try {
      db.exec("ROLLBACK");
    } catch {
      // rollback failure is reported by the outer transaction owner.
    }
    return planFailure(
      "history_commit_failed",
      `measurement history append failed: ${String(error)}`,
    );
  }
}

/** DB eventとdigest chainを再生し、projection／historyの不整合をgreenへ縮退させない。 */
export function replayMeasurementHistory(db: HarnessDb): MeasurementHistoryReplayV1 {
  const rows = db.prepare("SELECT * FROM measurement_history_events ORDER BY sequence ASC").all();
  let previous: Sha256Digest | null = null;
  let sequence = 0;
  const events: MeasurementHistoryEventV1[] = [];
  for (const row of rows) {
    const event = rowEvent(row);
    if (
      event === null ||
      Number(row.sequence) !== sequence + 1 ||
      event.previous_event_digest !== previous
    ) {
      return {
        ok: false,
        events,
        last_event_digest: previous,
        last_sequence: sequence,
        failure: `measurement_history_chain_invalid_at:${String(row.sequence)}`,
      };
    }
    events.push(event);
    previous = event.event_digest;
    sequence += 1;
  }
  const head = db
    .prepare(
      "SELECT last_event_digest,last_sequence FROM measurement_history_heads WHERE head_id = ?",
    )
    .get(MEASUREMENT_HISTORY_HEAD_ID);
  if (
    head === undefined ||
    (head.last_event_digest === null
      ? previous !== null
      : String(head.last_event_digest) !== previous) ||
    Number(head.last_sequence ?? -1) !== sequence
  ) {
    return {
      ok: false,
      events,
      last_event_digest: previous,
      last_sequence: sequence,
      failure: "measurement_history_head_mismatch",
    };
  }
  return { ok: true, events, last_event_digest: previous, last_sequence: sequence, failure: null };
}
