export const CLI_R00_SCHEMA_VERSION = "helix-cli-r00-throughput-baseline.v1" as const;
export const CLI_R00_BEHAVIOR_CONTRACT_ID = "CLI-R00-THROUGHPUT-BASELINE-001" as const;
export const CLI_R00_SLICE_ID = "CLI-R00" as const;
export const CLI_R00_ISSUE_ID = 1687;
export const CLI_R00_FROZEN_ARTIFACT_PATH = "config/cli-r00-throughput-baseline.v1.json" as const;
export const CLI_R00_CLI_SOURCE_PATH = "src/cli.ts" as const;
export const CLI_R00_WORKFLOW_PATH = ".github/workflows/harness-check.yml" as const;

export const CLI_R00_METRIC_IDS = [
  "CI_WALL_CLOCK",
  "FULL_REGRESSION_WALL_CLOCK",
  "TARGETED_TEST_WALL_CLOCK",
  "CLI_COMMAND_STARTUP_TIME",
  "CI_RERUN_COUNT",
  "FULL_REGRESSION_INVOCATION_COUNT",
  "REVIEW_RECEIPT_REGEN_COUNT",
  "CHANGED_FILE_FAN_OUT",
  "CHANGED_SYMBOL_FAN_OUT",
  "DIFF_BYTES",
  "REVIEW_CONTEXT_BYTES_OR_TOKENS",
  "BASE_SYNC_COUNT",
  "MERGE_CONFLICT_OR_SHARED_FILE_COLLISION_COUNT",
] as const;

export type CliR00MetricId = (typeof CLI_R00_METRIC_IDS)[number];
export type CliR00Observability = "measured" | "proxy" | "unmeasurable";
export type CliR00Environment = "github_actions" | "local_process";

export const CLI_R00_FAILURE_CODES = [
  "schema_invalid",
  "metric_set_incomplete",
  "observability_mismatch",
  "unmeasurable_claimed_measured",
  "proxy_claimed_as_direct",
  "condition_mismatch",
  "value_missing_for_measured",
  "unknown_key",
  "environment_mixed",
  "unmeasurable_not_comparable",
] as const;

export type CliR00FailureCode = (typeof CLI_R00_FAILURE_CODES)[number];

export interface CliR00Failure {
  code: CliR00FailureCode;
  detail: string;
}

export interface CliR00MetricDefinition {
  metric_id: CliR00MetricId;
  observability: CliR00Observability;
  unit: string;
  lower_is_better: boolean;
  collection_recipe_id: string;
  remesurement_recipe: string;
  unmeasurable_reason: string | null;
  proxy_definition: string | null;
}

export interface CliR00Condition {
  schema_version: typeof CLI_R00_SCHEMA_VERSION;
  metric_id: CliR00MetricId;
  observability: CliR00Observability;
  environment: CliR00Environment;
  collection_recipe_id: string;
  source_head: string | null;
  workflow_id: string | null;
  workflow_run_id: string | null;
  command_argv: readonly string[] | null;
  test_paths: readonly string[] | null;
  node_version: string | null;
  runner_os: string | null;
}

export interface CliR00Percentiles {
  n: number;
  min: number;
  p50: number;
  p95: number;
  max: number;
}

export interface CliR00Observation {
  metric_id: CliR00MetricId;
  observability: CliR00Observability;
  unit: string;
  value: number | null;
  sample_values: readonly number[] | null;
  percentiles: CliR00Percentiles | null;
  condition: CliR00Condition;
  evidence_ref: string | null;
  notes: string;
}

export interface CliR00StructuralSnapshot {
  source_head: string;
  cli_path: typeof CLI_R00_CLI_SOURCE_PATH;
  cli_bytes: number;
  cli_lines: number;
  cli_nonblank_lines: number;
  top_level_command_families: readonly string[];
  command_registration_count: number;
  unique_command_name_count: number;
  changed_file_fan_out: number;
  changed_symbol_fan_out: number;
  shared_file_collision_proxy: number;
  full_regression_shard_job_ids: readonly string[];
  full_regression_invocation_count_structural: number;
}

export interface CliR00SupportingContext {
  cli_path: typeof CLI_R00_CLI_SOURCE_PATH;
  cli_bytes: number;
  cli_lines: number;
  cli_nonblank_lines: number;
  top_level_command_families: readonly string[];
  command_registration_count: number;
  unique_command_name_count: number;
  full_regression_shard_job_ids: readonly string[];
  review_context_token_estimate: number | null;
  token_estimate_method: string | null;
  historical_notes: readonly string[];
}

export interface CliR00BaselineArtifact {
  schema_version: typeof CLI_R00_SCHEMA_VERSION;
  behavior_contract_id: typeof CLI_R00_BEHAVIOR_CONTRACT_ID;
  issue_id: typeof CLI_R00_ISSUE_ID;
  baseline_kind: "pre_refactor";
  slice_id: typeof CLI_R00_SLICE_ID;
  captured_at: string;
  source_head: string;
  source_branch: string;
  observations: readonly CliR00Observation[];
  supporting_context: CliR00SupportingContext;
}

const ARTIFACT_KEYS = [
  "schema_version",
  "behavior_contract_id",
  "issue_id",
  "baseline_kind",
  "slice_id",
  "captured_at",
  "source_head",
  "source_branch",
  "observations",
  "supporting_context",
] as const;

const OBSERVATION_KEYS = [
  "metric_id",
  "observability",
  "unit",
  "value",
  "sample_values",
  "percentiles",
  "condition",
  "evidence_ref",
  "notes",
] as const;

const CONDITION_KEYS = [
  "schema_version",
  "metric_id",
  "observability",
  "environment",
  "collection_recipe_id",
  "source_head",
  "workflow_id",
  "workflow_run_id",
  "command_argv",
  "test_paths",
  "node_version",
  "runner_os",
] as const;

const SUPPORTING_KEYS = [
  "cli_path",
  "cli_bytes",
  "cli_lines",
  "cli_nonblank_lines",
  "top_level_command_families",
  "command_registration_count",
  "unique_command_name_count",
  "full_regression_shard_job_ids",
  "review_context_token_estimate",
  "token_estimate_method",
  "historical_notes",
] as const;

const PERCENTILE_KEYS = ["n", "min", "p50", "p95", "max"] as const;
const FULL_SHA_PATTERN = /^[a-f0-9]{40}$/;
const RFC3339_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const TOP_LEVEL_COMMAND_PATTERN = /(?:const \w+ = )?program\.command\("([^"]+)"\)/g;
const ANY_COMMAND_PATTERN = /\.command\("([^"]+)"\)/g;
const SHARD_JOB_PATTERN = /^ {2}full-regression-(bulk-\d+|stateful):$/gm;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function exactKeys(value: Record<string, unknown>, expected: readonly string[]): string | null {
  const actual = Object.keys(value);
  const extra = actual.filter((key) => !expected.includes(key));
  const missing = expected.filter((key) => !actual.includes(key));
  if (extra.length > 0) return `unknown_key:${extra.join(",")}`;
  if (missing.length > 0) return `missing_key:${missing.join(",")}`;
  return null;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isNumberArray(value: unknown): value is number[] {
  return Array.isArray(value) && value.every((item) => isFiniteNumber(item));
}

function decodeNonNegativeInt(value: unknown, field: string): number | CliR00Failure[] {
  if (!isFiniteNumber(value) || !Number.isInteger(value) || value < 0) {
    return [
      {
        code: "schema_invalid",
        detail: `supporting_context.${field} must be a non-negative integer`,
      },
    ];
  }
  return value;
}

export function cliR00MetricDefinitions(): readonly CliR00MetricDefinition[] {
  return [
    {
      metric_id: "CI_WALL_CLOCK",
      observability: "measured",
      unit: "seconds",
      lower_is_better: true,
      collection_recipe_id: "gh-run-harness-check-wall",
      remesurement_recipe:
        "同一workflow `harness-check.yml` の成功runについて `startedAt` から `updatedAt` までの秒を取る。比較は同一event（main push）と同一runner classに限定する。",
      unmeasurable_reason: null,
      proxy_definition: null,
    },
    {
      metric_id: "FULL_REGRESSION_WALL_CLOCK",
      observability: "measured",
      unit: "seconds",
      lower_is_better: true,
      collection_recipe_id: "gh-run-full-regression-span",
      remesurement_recipe:
        "同一runの `full-regression-preflight.startedAt` から `full-regression-finalize.completedAt` までの秒を取る。reuseでshard未起動のrunは母集団から除外し、0秒として扱わない。",
      unmeasurable_reason: null,
      proxy_definition: null,
    },
    {
      metric_id: "TARGETED_TEST_WALL_CLOCK",
      observability: "measured",
      unit: "milliseconds",
      lower_is_better: true,
      collection_recipe_id: "vitest-targeted-cli-r00",
      remesurement_recipe:
        "`npx --no-install vitest run --project fast tests/cli-r00-throughput-baseline.test.ts` のwallを同一Node majorで複数sampleする。時間閾値自体をoracleにしない。",
      unmeasurable_reason: null,
      proxy_definition: null,
    },
    {
      metric_id: "CLI_COMMAND_STARTUP_TIME",
      observability: "measured",
      unit: "milliseconds",
      lower_is_better: true,
      collection_recipe_id: "tsx-cli-version-startup",
      remesurement_recipe:
        "`npx --no-install tsx src/cli.ts --version` を同一Node version・同一cwdで5回以上測り p50/p95 を残す。`--help` は代表値に混ぜない。",
      unmeasurable_reason: null,
      proxy_definition: null,
    },
    {
      metric_id: "CI_RERUN_COUNT",
      observability: "unmeasurable",
      unit: "count",
      lower_is_better: true,
      collection_recipe_id: "pr-episode-rerun-window",
      remesurement_recipe:
        "比較対象PR集合と期間を先に固定し、harness-check の attempt>1 を数える。単一HEADのattempt=1をこの指標の測定値として使わない。",
      unmeasurable_reason:
        "単一HEADの1回の成功runからは、PR episode全体の再実行回数を再現可能な母集団として固定できない。",
      proxy_definition: null,
    },
    {
      metric_id: "FULL_REGRESSION_INVOCATION_COUNT",
      observability: "measured",
      unit: "count",
      lower_is_better: true,
      collection_recipe_id: "full-regression-job-presence",
      remesurement_recipe:
        "対象runで `full-regression-bulk-*` と `full-regression-stateful` が起動したなら 1、reuseで未起動なら 0。shard数をinvocation数に数えない。",
      unmeasurable_reason: null,
      proxy_definition: null,
    },
    {
      metric_id: "REVIEW_RECEIPT_REGEN_COUNT",
      observability: "unmeasurable",
      unit: "count",
      lower_is_better: true,
      collection_recipe_id: "review-receipt-regen-ledger",
      remesurement_recipe:
        "receipt再発行回数のrepo-owned ledgerが無い限り測定不能のまま残す。推測値をmeasuredへ昇格しない。",
      unmeasurable_reason:
        "GitHub runやgit historyに review receipt 再生成回数の第一級fieldが無く、後付け集計は再現条件を固定できない。",
      proxy_definition: null,
    },
    {
      metric_id: "CHANGED_FILE_FAN_OUT",
      observability: "proxy",
      unit: "files",
      lower_is_better: true,
      collection_recipe_id: "shared-cli-file-fan-out",
      remesurement_recipe:
        "command familyを1つだけ変える場合に必ず含む実装file数を数える。現行は `src/cli.ts` の1である。digest pin追従は別指標とし、このproxyへ混ぜない。",
      unmeasurable_reason: null,
      proxy_definition:
        "任意のcommand family変更が共有する実装file数。現行monolithでは `src/cli.ts` が常に1ファイル入る。",
    },
    {
      metric_id: "CHANGED_SYMBOL_FAN_OUT",
      observability: "proxy",
      unit: "symbols",
      lower_is_better: true,
      collection_recipe_id: "cli-top-level-family-count",
      remesurement_recipe:
        '`src/cli.ts` の top-level command 登録 (`program` の `.command("...")`) を再抽出した family数を使う。推測でUNKNOWN familyを足さない。',
      unmeasurable_reason: null,
      proxy_definition:
        "同一compilation unitを共有するtop-level command family数。1 familyの変更でもreview対象symbol集合の下限になる。",
    },
    {
      metric_id: "DIFF_BYTES",
      observability: "proxy",
      unit: "bytes",
      lower_is_better: true,
      collection_recipe_id: "cli-source-byte-size",
      remesurement_recipe:
        "`src/cli.ts` のUTF-8 byte長を取る。1行変更でもreview表面の下限としてこの値を使う。",
      unmeasurable_reason: null,
      proxy_definition:
        "monolith内の任意変更がレビューに乗せる下限diff。現行は `src/cli.ts` 全体のbyte長。",
    },
    {
      metric_id: "REVIEW_CONTEXT_BYTES_OR_TOKENS",
      observability: "proxy",
      unit: "bytes",
      lower_is_better: true,
      collection_recipe_id: "cli-review-context-bytes",
      remesurement_recipe:
        "bytesは `src/cli.ts` のbyte長を再測する。tokenは `ceil(bytes/4)` の見積もりであり、measured tokenではない。",
      unmeasurable_reason: null,
      proxy_definition:
        "command family変更時にreviewerが読む下限context。bytesを正本とし、token換算は見積もりとしてsupporting_contextへ分離する。",
    },
    {
      metric_id: "BASE_SYNC_COUNT",
      observability: "unmeasurable",
      unit: "count",
      lower_is_better: true,
      collection_recipe_id: "pr-base-sync-window",
      remesurement_recipe:
        "比較対象の並行PR集合と期間を先に固定し、`src/cli.ts` を含むbase sync回数を数える。単発観測を測定値にしない。",
      unmeasurable_reason:
        "base sync回数はGitHub episodeの過程量であり、単一HEADのtreeからは再現可能な母集団を固定できない。",
      proxy_definition: null,
    },
    {
      metric_id: "MERGE_CONFLICT_OR_SHARED_FILE_COLLISION_COUNT",
      observability: "proxy",
      unit: "families",
      lower_is_better: true,
      collection_recipe_id: "shared-file-collision-family-count",
      remesurement_recipe:
        "top-level command family数をcollision class sizeとして再抽出する。同時open PR数はhistorical noteであり、このproxy値へ代入しない。",
      unmeasurable_reason: null,
      proxy_definition:
        "`src/cli.ts` を共有するtop-level command family数。任意の2 family変更は同一fileで衝突する。",
    },
  ];
}

export function cliR00DefinitionById(metricId: CliR00MetricId): CliR00MetricDefinition {
  const found = cliR00MetricDefinitions().find((item) => item.metric_id === metricId);
  if (!found) throw new Error(`unknown CLI-R00 metric: ${metricId}`);
  return found;
}

export function extractCliCommandFamilies(cliSource: string): {
  topLevel: string[];
  allRegistrations: string[];
} {
  const topLevel = [...cliSource.matchAll(TOP_LEVEL_COMMAND_PATTERN)].map(
    (match) => match[1] ?? "",
  );
  const allRegistrations = [...cliSource.matchAll(ANY_COMMAND_PATTERN)].map(
    (match) => match[1] ?? "",
  );
  return {
    topLevel: topLevel.filter((name) => name.length > 0),
    allRegistrations: allRegistrations.filter((name) => name.length > 0),
  };
}

export function extractFullRegressionShardJobIds(workflowSource: string): string[] {
  return [...workflowSource.matchAll(SHARD_JOB_PATTERN)].map(
    (match) => `full-regression-${match[1]}`,
  );
}

export function countSourceLines(source: string): { lines: number; nonblank: number } {
  const rows = source.split(/\r?\n/);
  const trailingEmpty = source.endsWith("\n") ? 1 : 0;
  const lines = rows.length - trailingEmpty;
  const nonblank = rows.filter((line) => line.trim().length > 0).length;
  return { lines, nonblank };
}

export function estimateReviewTokensFromBytes(bytes: number): number {
  if (!Number.isInteger(bytes) || bytes < 0) {
    throw new Error("cli bytes must be a non-negative integer");
  }
  return Math.ceil(bytes / 4);
}

export function collectCliR00StructuralSnapshot(input: {
  sourceHead: string;
  cliBytes: number;
  cliSource: string;
  workflowSource: string;
}): CliR00StructuralSnapshot {
  if (!FULL_SHA_PATTERN.test(input.sourceHead)) {
    throw new Error("sourceHead must be a full SHA");
  }
  if (!Number.isInteger(input.cliBytes) || input.cliBytes < 0) {
    throw new Error("cliBytes must be a non-negative integer");
  }
  const families = extractCliCommandFamilies(input.cliSource);
  const lines = countSourceLines(input.cliSource);
  const shardIds = extractFullRegressionShardJobIds(input.workflowSource);
  return {
    source_head: input.sourceHead,
    cli_path: CLI_R00_CLI_SOURCE_PATH,
    cli_bytes: input.cliBytes,
    cli_lines: lines.lines,
    cli_nonblank_lines: lines.nonblank,
    top_level_command_families: families.topLevel,
    command_registration_count: families.allRegistrations.length,
    unique_command_name_count: new Set(families.allRegistrations).size,
    changed_file_fan_out: 1,
    changed_symbol_fan_out: families.topLevel.length,
    shared_file_collision_proxy: families.topLevel.length,
    full_regression_shard_job_ids: shardIds,
    full_regression_invocation_count_structural: shardIds.length > 0 ? 1 : 0,
  };
}

export function percentilesFromSamples(samples: readonly number[]): CliR00Percentiles {
  if (samples.length === 0 || samples.some((value) => !Number.isFinite(value))) {
    throw new Error("percentiles require a non-empty finite sample set");
  }
  const sorted = [...samples].sort((left, right) => left - right);
  const at = (ratio: number): number => {
    const index = Math.round((sorted.length - 1) * ratio);
    return sorted[index] ?? sorted[0];
  };
  return {
    n: sorted.length,
    min: sorted[0] ?? 0,
    p50: at(0.5),
    p95: at(0.95),
    max: sorted[sorted.length - 1] ?? 0,
  };
}

function decodePercentiles(value: unknown): CliR00Percentiles | null | CliR00Failure[] {
  if (value === null) return null;
  if (!isRecord(value))
    return [{ code: "schema_invalid", detail: "percentiles must be object|null" }];
  const keys = exactKeys(value, PERCENTILE_KEYS);
  if (keys) {
    return [
      {
        code: keys.startsWith("unknown_key:") ? "unknown_key" : "schema_invalid",
        detail: `percentiles:${keys}`,
      },
    ];
  }
  const n = value.n;
  const min = value.min;
  const p50 = value.p50;
  const p95 = value.p95;
  const max = value.max;
  if (
    !isFiniteNumber(n) ||
    !isFiniteNumber(min) ||
    !isFiniteNumber(p50) ||
    !isFiniteNumber(p95) ||
    !isFiniteNumber(max)
  ) {
    return [{ code: "schema_invalid", detail: "percentiles fields must be finite numbers" }];
  }
  if (!Number.isInteger(n) || n < 1) {
    return [{ code: "schema_invalid", detail: "percentiles.n must be a positive integer" }];
  }
  return { n, min, p50, p95, max };
}

function decodeCondition(
  value: unknown,
  expectedMetric: CliR00MetricId,
): { condition: CliR00Condition } | { failures: CliR00Failure[] } {
  if (!isRecord(value))
    return { failures: [{ code: "schema_invalid", detail: "condition must be object" }] };
  const keys = exactKeys(value, CONDITION_KEYS);
  if (keys) {
    return {
      failures: [
        {
          code: keys.startsWith("unknown_key:") ? "unknown_key" : "schema_invalid",
          detail: `condition:${keys}`,
        },
      ],
    };
  }
  if (value.schema_version !== CLI_R00_SCHEMA_VERSION) {
    return { failures: [{ code: "schema_invalid", detail: "condition.schema_version mismatch" }] };
  }
  if (value.metric_id !== expectedMetric) {
    return {
      failures: [
        {
          code: "schema_invalid",
          detail: `condition.metric_id ${String(value.metric_id)} != ${expectedMetric}`,
        },
      ],
    };
  }
  const observability = value.observability;
  if (
    observability !== "measured" &&
    observability !== "proxy" &&
    observability !== "unmeasurable"
  ) {
    return { failures: [{ code: "schema_invalid", detail: "condition.observability invalid" }] };
  }
  const environment = value.environment;
  if (environment !== "github_actions" && environment !== "local_process") {
    return { failures: [{ code: "schema_invalid", detail: "condition.environment invalid" }] };
  }
  if (typeof value.collection_recipe_id !== "string" || value.collection_recipe_id.length === 0) {
    return {
      failures: [{ code: "schema_invalid", detail: "condition.collection_recipe_id required" }],
    };
  }
  const collectionRecipeId = value.collection_recipe_id;
  const optionalString = (raw: unknown, field: string): string | null | CliR00Failure[] => {
    if (raw === null) return null;
    if (typeof raw === "string" && raw.length > 0) return raw;
    return [{ code: "schema_invalid", detail: `condition.${field} must be string|null` }];
  };
  const sourceHead = optionalString(value.source_head, "source_head");
  if (Array.isArray(sourceHead)) return { failures: sourceHead };
  if (sourceHead !== null && !FULL_SHA_PATTERN.test(sourceHead)) {
    return {
      failures: [{ code: "schema_invalid", detail: "condition.source_head must be full SHA" }],
    };
  }
  const workflowId = optionalString(value.workflow_id, "workflow_id");
  if (Array.isArray(workflowId)) return { failures: workflowId };
  const workflowRunId = optionalString(value.workflow_run_id, "workflow_run_id");
  if (Array.isArray(workflowRunId)) return { failures: workflowRunId };
  const nodeVersion = optionalString(value.node_version, "node_version");
  if (Array.isArray(nodeVersion)) return { failures: nodeVersion };
  const runnerOs = optionalString(value.runner_os, "runner_os");
  if (Array.isArray(runnerOs)) return { failures: runnerOs };
  const commandArgv = value.command_argv;
  if (commandArgv !== null && !isStringArray(commandArgv)) {
    return {
      failures: [
        { code: "schema_invalid", detail: "condition.command_argv must be string[]|null" },
      ],
    };
  }
  const testPaths = value.test_paths;
  if (testPaths !== null && !isStringArray(testPaths)) {
    return {
      failures: [{ code: "schema_invalid", detail: "condition.test_paths must be string[]|null" }],
    };
  }
  return {
    condition: {
      schema_version: CLI_R00_SCHEMA_VERSION,
      metric_id: expectedMetric,
      observability,
      environment,
      collection_recipe_id: collectionRecipeId,
      source_head: sourceHead,
      workflow_id: workflowId,
      workflow_run_id: workflowRunId,
      command_argv: commandArgv,
      test_paths: testPaths,
      node_version: nodeVersion,
      runner_os: runnerOs,
    },
  };
}

function decodeObservation(
  value: unknown,
): { observation: CliR00Observation } | { failures: CliR00Failure[] } {
  if (!isRecord(value))
    return { failures: [{ code: "schema_invalid", detail: "observation must be object" }] };
  const keys = exactKeys(value, OBSERVATION_KEYS);
  if (keys) {
    return {
      failures: [
        {
          code: keys.startsWith("unknown_key:") ? "unknown_key" : "schema_invalid",
          detail: `observation:${keys}`,
        },
      ],
    };
  }
  if (!CLI_R00_METRIC_IDS.includes(value.metric_id as CliR00MetricId)) {
    return {
      failures: [
        { code: "metric_set_incomplete", detail: `unknown metric ${String(value.metric_id)}` },
      ],
    };
  }
  const metricId = value.metric_id as CliR00MetricId;
  const definition = cliR00DefinitionById(metricId);
  const observability = value.observability;
  if (
    observability !== "measured" &&
    observability !== "proxy" &&
    observability !== "unmeasurable"
  ) {
    return { failures: [{ code: "schema_invalid", detail: `${metricId}.observability invalid` }] };
  }
  if (observability !== definition.observability) {
    if (definition.observability === "unmeasurable" && observability === "measured") {
      return { failures: [{ code: "unmeasurable_claimed_measured", detail: metricId }] };
    }
    if (definition.observability === "proxy" && observability === "measured") {
      return { failures: [{ code: "proxy_claimed_as_direct", detail: metricId }] };
    }
    return {
      failures: [
        {
          code: "observability_mismatch",
          detail: `${metricId}: artifact=${String(observability)} catalog=${definition.observability}`,
        },
      ],
    };
  }
  if (typeof value.unit !== "string" || value.unit !== definition.unit) {
    return {
      failures: [{ code: "schema_invalid", detail: `${metricId}.unit must equal catalog unit` }],
    };
  }
  const observationValue = value.value;
  if (observationValue !== null && !isFiniteNumber(observationValue)) {
    return {
      failures: [
        { code: "schema_invalid", detail: `${metricId}.value must be finite number|null` },
      ],
    };
  }
  if (definition.observability !== "unmeasurable" && observationValue === null) {
    return { failures: [{ code: "value_missing_for_measured", detail: metricId }] };
  }
  if (definition.observability === "unmeasurable" && observationValue !== null) {
    return {
      failures: [{ code: "unmeasurable_claimed_measured", detail: `${metricId} has a value` }],
    };
  }
  const sampleValues = value.sample_values;
  if (sampleValues !== null && !isNumberArray(sampleValues)) {
    return {
      failures: [
        { code: "schema_invalid", detail: `${metricId}.sample_values must be number[]|null` },
      ],
    };
  }
  const percentiles = decodePercentiles(value.percentiles);
  if (Array.isArray(percentiles)) return { failures: percentiles };
  const condition = decodeCondition(value.condition, metricId);
  if ("failures" in condition) return condition;
  if (condition.condition.observability !== observability) {
    return {
      failures: [{ code: "observability_mismatch", detail: `${metricId} condition observability` }],
    };
  }
  if (condition.condition.collection_recipe_id !== definition.collection_recipe_id) {
    return {
      failures: [
        {
          code: "condition_mismatch",
          detail: `${metricId} collection_recipe_id must stay ${definition.collection_recipe_id}`,
        },
      ],
    };
  }
  const evidenceRef = value.evidence_ref;
  if (typeof evidenceRef !== "string" && evidenceRef !== null) {
    return {
      failures: [
        { code: "schema_invalid", detail: `${metricId}.evidence_ref must be string|null` },
      ],
    };
  }
  if (typeof value.notes !== "string") {
    return { failures: [{ code: "schema_invalid", detail: `${metricId}.notes must be string` }] };
  }
  return {
    observation: {
      metric_id: metricId,
      observability,
      unit: value.unit,
      value: observationValue,
      sample_values: sampleValues,
      percentiles,
      condition: condition.condition,
      evidence_ref: evidenceRef,
      notes: value.notes,
    },
  };
}

function decodeSupportingContext(
  value: unknown,
): { context: CliR00SupportingContext } | { failures: CliR00Failure[] } {
  if (!isRecord(value)) {
    return { failures: [{ code: "schema_invalid", detail: "supporting_context must be object" }] };
  }
  const keys = exactKeys(value, SUPPORTING_KEYS);
  if (keys) {
    return {
      failures: [
        {
          code: keys.startsWith("unknown_key:") ? "unknown_key" : "schema_invalid",
          detail: `supporting_context:${keys}`,
        },
      ],
    };
  }
  if (value.cli_path !== CLI_R00_CLI_SOURCE_PATH) {
    return {
      failures: [
        { code: "schema_invalid", detail: "supporting_context.cli_path must be src/cli.ts" },
      ],
    };
  }
  const cliBytes = decodeNonNegativeInt(value.cli_bytes, "cli_bytes");
  if (Array.isArray(cliBytes)) return { failures: cliBytes };
  const cliLines = decodeNonNegativeInt(value.cli_lines, "cli_lines");
  if (Array.isArray(cliLines)) return { failures: cliLines };
  const cliNonblankLines = decodeNonNegativeInt(value.cli_nonblank_lines, "cli_nonblank_lines");
  if (Array.isArray(cliNonblankLines)) return { failures: cliNonblankLines };
  const commandRegistrationCount = decodeNonNegativeInt(
    value.command_registration_count,
    "command_registration_count",
  );
  if (Array.isArray(commandRegistrationCount)) return { failures: commandRegistrationCount };
  const uniqueCommandNameCount = decodeNonNegativeInt(
    value.unique_command_name_count,
    "unique_command_name_count",
  );
  if (Array.isArray(uniqueCommandNameCount)) return { failures: uniqueCommandNameCount };
  if (
    !isStringArray(value.top_level_command_families) ||
    value.top_level_command_families.length === 0
  ) {
    return {
      failures: [
        {
          code: "schema_invalid",
          detail: "supporting_context.top_level_command_families required",
        },
      ],
    };
  }
  if (!isStringArray(value.full_regression_shard_job_ids)) {
    return {
      failures: [
        {
          code: "schema_invalid",
          detail: "supporting_context.full_regression_shard_job_ids must be string[]",
        },
      ],
    };
  }
  const tokenEstimate = value.review_context_token_estimate;
  if (tokenEstimate !== null && !isFiniteNumber(tokenEstimate)) {
    return {
      failures: [
        {
          code: "schema_invalid",
          detail: "supporting_context.review_context_token_estimate must be number|null",
        },
      ],
    };
  }
  const tokenEstimateMethod = value.token_estimate_method;
  if (tokenEstimateMethod !== null && typeof tokenEstimateMethod !== "string") {
    return {
      failures: [
        {
          code: "schema_invalid",
          detail: "supporting_context.token_estimate_method must be string|null",
        },
      ],
    };
  }
  if (!isStringArray(value.historical_notes)) {
    return {
      failures: [
        { code: "schema_invalid", detail: "supporting_context.historical_notes must be string[]" },
      ],
    };
  }
  return {
    context: {
      cli_path: CLI_R00_CLI_SOURCE_PATH,
      cli_bytes: cliBytes,
      cli_lines: cliLines,
      cli_nonblank_lines: cliNonblankLines,
      top_level_command_families: value.top_level_command_families,
      command_registration_count: commandRegistrationCount,
      unique_command_name_count: uniqueCommandNameCount,
      full_regression_shard_job_ids: value.full_regression_shard_job_ids,
      review_context_token_estimate: tokenEstimate,
      token_estimate_method: tokenEstimateMethod,
      historical_notes: value.historical_notes,
    },
  };
}

export function validateCliR00BaselineArtifact(
  input: unknown,
): { ok: true; artifact: CliR00BaselineArtifact } | { ok: false; failures: CliR00Failure[] } {
  if (!isRecord(input)) {
    return { ok: false, failures: [{ code: "schema_invalid", detail: "artifact must be object" }] };
  }
  const keys = exactKeys(input, ARTIFACT_KEYS);
  if (keys) {
    return {
      ok: false,
      failures: [
        {
          code: keys.startsWith("unknown_key:") ? "unknown_key" : "schema_invalid",
          detail: `artifact:${keys}`,
        },
      ],
    };
  }
  const failures: CliR00Failure[] = [];
  if (input.schema_version !== CLI_R00_SCHEMA_VERSION) {
    failures.push({ code: "schema_invalid", detail: "schema_version mismatch" });
  }
  if (input.behavior_contract_id !== CLI_R00_BEHAVIOR_CONTRACT_ID) {
    failures.push({ code: "schema_invalid", detail: "behavior_contract_id mismatch" });
  }
  if (input.issue_id !== CLI_R00_ISSUE_ID) {
    failures.push({ code: "schema_invalid", detail: "issue_id must be 1687" });
  }
  if (input.baseline_kind !== "pre_refactor") {
    failures.push({ code: "schema_invalid", detail: "baseline_kind must be pre_refactor" });
  }
  if (input.slice_id !== CLI_R00_SLICE_ID) {
    failures.push({ code: "schema_invalid", detail: "slice_id must be CLI-R00" });
  }
  const capturedAt = input.captured_at;
  const sourceHead = input.source_head;
  const sourceBranch = input.source_branch;
  if (typeof capturedAt !== "string" || !RFC3339_PATTERN.test(capturedAt)) {
    failures.push({ code: "schema_invalid", detail: "captured_at must be RFC3339" });
  }
  if (typeof sourceHead !== "string" || !FULL_SHA_PATTERN.test(sourceHead)) {
    failures.push({ code: "schema_invalid", detail: "source_head must be full SHA" });
  }
  if (typeof sourceBranch !== "string" || sourceBranch.length === 0) {
    failures.push({ code: "schema_invalid", detail: "source_branch required" });
  }
  if (!Array.isArray(input.observations)) {
    failures.push({ code: "schema_invalid", detail: "observations must be an array" });
    return { ok: false, failures };
  }
  const observations: CliR00Observation[] = [];
  for (const raw of input.observations) {
    const decoded = decodeObservation(raw);
    if ("failures" in decoded) failures.push(...decoded.failures);
    else observations.push(decoded.observation);
  }
  const ids = observations.map((item) => item.metric_id);
  if (
    ids.length !== CLI_R00_METRIC_IDS.length ||
    CLI_R00_METRIC_IDS.some((id, index) => ids[index] !== id)
  ) {
    failures.push({
      code: "metric_set_incomplete",
      detail: `observations must be the exact Issue #1687 set in catalog order: ${CLI_R00_METRIC_IDS.join(",")}`,
    });
  }
  const supporting = decodeSupportingContext(input.supporting_context);
  if ("failures" in supporting) failures.push(...supporting.failures);
  if (failures.length > 0) return { ok: false, failures };
  if (!("context" in supporting)) {
    return {
      ok: false,
      failures: [{ code: "schema_invalid", detail: "supporting_context missing" }],
    };
  }
  if (
    typeof capturedAt !== "string" ||
    typeof sourceHead !== "string" ||
    typeof sourceBranch !== "string"
  ) {
    return {
      ok: false,
      failures: [{ code: "schema_invalid", detail: "identity fields missing after validation" }],
    };
  }
  return {
    ok: true,
    artifact: {
      schema_version: CLI_R00_SCHEMA_VERSION,
      behavior_contract_id: CLI_R00_BEHAVIOR_CONTRACT_ID,
      issue_id: CLI_R00_ISSUE_ID,
      baseline_kind: "pre_refactor",
      slice_id: CLI_R00_SLICE_ID,
      captured_at: capturedAt,
      source_head: sourceHead,
      source_branch: sourceBranch,
      observations,
      supporting_context: supporting.context,
    },
  };
}

export function conditionsEqual(left: CliR00Condition, right: CliR00Condition): boolean {
  return (
    left.schema_version === right.schema_version &&
    left.metric_id === right.metric_id &&
    left.observability === right.observability &&
    left.environment === right.environment &&
    left.collection_recipe_id === right.collection_recipe_id &&
    left.source_head === right.source_head &&
    left.workflow_id === right.workflow_id &&
    left.workflow_run_id === right.workflow_run_id &&
    JSON.stringify(left.command_argv) === JSON.stringify(right.command_argv) &&
    JSON.stringify(left.test_paths) === JSON.stringify(right.test_paths) &&
    left.node_version === right.node_version &&
    left.runner_os === right.runner_os
  );
}

export function compareCliR00Observation(
  baseline: CliR00Observation,
  candidate: CliR00Observation,
): { comparable: boolean; failures: CliR00Failure[]; delta: number | null } {
  const failures: CliR00Failure[] = [];
  if (baseline.metric_id !== candidate.metric_id) {
    failures.push({
      code: "condition_mismatch",
      detail: `${baseline.metric_id} != ${candidate.metric_id}`,
    });
  }
  if (baseline.observability !== candidate.observability) {
    failures.push({
      code: "observability_mismatch",
      detail: `${baseline.metric_id}: ${baseline.observability} != ${candidate.observability}`,
    });
  }
  if (baseline.condition.environment !== candidate.condition.environment) {
    failures.push({
      code: "environment_mixed",
      detail: `${baseline.metric_id}: ${baseline.condition.environment} != ${candidate.condition.environment}`,
    });
  }
  if (!conditionsEqual(baseline.condition, candidate.condition)) {
    failures.push({
      code: "condition_mismatch",
      detail: `${baseline.metric_id} remesurement conditions are not identical`,
    });
  }
  if (baseline.observability === "unmeasurable" || candidate.observability === "unmeasurable") {
    failures.push({
      code: "unmeasurable_not_comparable",
      detail: `${baseline.metric_id} cannot be compared as a numeric delta`,
    });
    return { comparable: false, failures, delta: null };
  }
  if (failures.length > 0) return { comparable: false, failures, delta: null };
  if (baseline.value === null || candidate.value === null) {
    return {
      comparable: false,
      failures: [{ code: "value_missing_for_measured", detail: baseline.metric_id }],
      delta: null,
    };
  }
  return { comparable: true, failures: [], delta: candidate.value - baseline.value };
}

export function remesureCliR00StructuralProxies(
  artifact: CliR00BaselineArtifact,
  snapshot: CliR00StructuralSnapshot,
): CliR00Failure[] {
  const failures: CliR00Failure[] = [];
  if (snapshot.source_head !== artifact.source_head) {
    failures.push({
      code: "condition_mismatch",
      detail: `snapshot.source_head ${snapshot.source_head} != artifact.source_head ${artifact.source_head}`,
    });
  }
  const byId = new Map(artifact.observations.map((item) => [item.metric_id, item]));
  const expected: Array<[CliR00MetricId, number]> = [
    ["CHANGED_FILE_FAN_OUT", snapshot.changed_file_fan_out],
    ["CHANGED_SYMBOL_FAN_OUT", snapshot.changed_symbol_fan_out],
    ["DIFF_BYTES", snapshot.cli_bytes],
    ["REVIEW_CONTEXT_BYTES_OR_TOKENS", snapshot.cli_bytes],
    ["MERGE_CONFLICT_OR_SHARED_FILE_COLLISION_COUNT", snapshot.shared_file_collision_proxy],
  ];
  for (const [metricId, pinned] of expected) {
    const observation = byId.get(metricId);
    if (!observation || observation.value !== pinned) {
      failures.push({
        code: "condition_mismatch",
        detail: `${metricId} frozen value ${observation?.value ?? "missing"} != source_head snapshot ${pinned}`,
      });
    }
  }
  if (artifact.supporting_context.cli_bytes !== snapshot.cli_bytes) {
    failures.push({
      code: "condition_mismatch",
      detail: "supporting_context.cli_bytes drifted from source_head blob",
    });
  }
  if (
    artifact.supporting_context.top_level_command_families.join("\0") !==
    snapshot.top_level_command_families.join("\0")
  ) {
    failures.push({
      code: "condition_mismatch",
      detail: "top-level command families drifted from source_head blob",
    });
  }
  if (
    artifact.supporting_context.full_regression_shard_job_ids.join("\0") !==
    snapshot.full_regression_shard_job_ids.join("\0")
  ) {
    failures.push({
      code: "condition_mismatch",
      detail: "full-regression shard jobs drifted from source_head workflow blob",
    });
  }
  return failures;
}
