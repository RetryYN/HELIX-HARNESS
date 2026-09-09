import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  CLI_R00_BEHAVIOR_CONTRACT_ID,
  CLI_R00_CLI_SOURCE_PATH,
  CLI_R00_FROZEN_ARTIFACT_PATH,
  CLI_R00_ISSUE_ID,
  CLI_R00_METRIC_IDS,
  CLI_R00_SCHEMA_VERSION,
  CLI_R00_SLICE_ID,
  CLI_R00_WORKFLOW_PATH,
  type CliR00BaselineArtifact,
  type CliR00Observation,
  cliR00MetricDefinitions,
  collectCliR00StructuralSnapshot,
  compareCliR00Observation,
  remesureCliR00StructuralProxies,
  validateCliR00BaselineArtifact,
} from "../src/runtime/cli-r00-throughput-baseline";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function loadFrozenArtifact(): CliR00BaselineArtifact {
  const parsed = JSON.parse(readFileSync(CLI_R00_FROZEN_ARTIFACT_PATH, "utf8"));
  const validated = validateCliR00BaselineArtifact(parsed);
  expect(validated.ok, JSON.stringify(validated)).toBe(true);
  if (!validated.ok) throw new Error("frozen artifact invalid");
  return validated.artifact;
}

function liveSnapshot() {
  const cliSource = readFileSync(CLI_R00_CLI_SOURCE_PATH, "utf8");
  const cliBytes = readFileSync(CLI_R00_CLI_SOURCE_PATH).byteLength;
  const workflowSource = readFileSync(CLI_R00_WORKFLOW_PATH, "utf8");
  return collectCliR00StructuralSnapshot({ cliBytes, cliSource, workflowSource });
}

function observation(
  artifact: CliR00BaselineArtifact,
  metricId: (typeof CLI_R00_METRIC_IDS)[number],
) {
  const found = artifact.observations.find((item) => item.metric_id === metricId);
  expect(found, metricId).toBeDefined();
  return found as CliR00Observation;
}

describe("CLI-R00 throughput baseline", () => {
  it("U-CLIR00-001: Issue #1687の13指標exact setをcatalog順で固定する", () => {
    const ids = cliR00MetricDefinitions().map((item) => item.metric_id);
    expect(ids).toEqual([...CLI_R00_METRIC_IDS]);
    expect(ids).toEqual([
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
    ]);
    expect(new Set(ids).size).toBe(13);
  });

  it("U-CLIR00-002: measured／proxy／unmeasurableが過不足なく排他である", () => {
    const definitions = cliR00MetricDefinitions();
    const measured = definitions
      .filter((item) => item.observability === "measured")
      .map((item) => item.metric_id);
    const proxy = definitions
      .filter((item) => item.observability === "proxy")
      .map((item) => item.metric_id);
    const unmeasurable = definitions
      .filter((item) => item.observability === "unmeasurable")
      .map((item) => item.metric_id);
    expect(measured).toEqual([
      "CI_WALL_CLOCK",
      "FULL_REGRESSION_WALL_CLOCK",
      "TARGETED_TEST_WALL_CLOCK",
      "CLI_COMMAND_STARTUP_TIME",
      "FULL_REGRESSION_INVOCATION_COUNT",
    ]);
    expect(proxy).toEqual([
      "CHANGED_FILE_FAN_OUT",
      "CHANGED_SYMBOL_FAN_OUT",
      "DIFF_BYTES",
      "REVIEW_CONTEXT_BYTES_OR_TOKENS",
      "MERGE_CONFLICT_OR_SHARED_FILE_COLLISION_COUNT",
    ]);
    expect(unmeasurable).toEqual([
      "CI_RERUN_COUNT",
      "REVIEW_RECEIPT_REGEN_COUNT",
      "BASE_SYNC_COUNT",
    ]);
    expect(measured.length + proxy.length + unmeasurable.length).toBe(definitions.length);
    for (const item of definitions) {
      if (item.observability === "unmeasurable") {
        expect(item.unmeasurable_reason && item.unmeasurable_reason.length > 10).toBe(true);
        expect(item.proxy_definition).toBeNull();
      } else {
        expect(item.unmeasurable_reason).toBeNull();
      }
      if (item.observability === "proxy") {
        expect(item.proxy_definition && item.proxy_definition.length > 10).toBe(true);
      } else {
        expect(item.proxy_definition).toBeNull();
      }
    }
  });

  it("U-CLIR00-003: 測定不能指標へ数値を置くと unmeasurable_claimed_measured になる", () => {
    const artifact = clone(loadFrozenArtifact()) as unknown as Record<string, unknown>;
    const observations = artifact.observations as Array<Record<string, unknown>>;
    const target = observations.find((item) => item.metric_id === "CI_RERUN_COUNT");
    expect(target).toBeDefined();
    if (!target) throw new Error("missing CI_RERUN_COUNT");
    target.observability = "measured";
    target.value = 0;
    (target.condition as Record<string, unknown>).observability = "measured";
    const result = validateCliR00BaselineArtifact(artifact);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.failures.some((item) => item.code === "unmeasurable_claimed_measured")).toBe(
      true,
    );
  });

  it("U-CLIR00-004: proxyをmeasuredへ昇格すると proxy_claimed_as_direct になる", () => {
    const artifact = clone(loadFrozenArtifact()) as unknown as Record<string, unknown>;
    const observations = artifact.observations as Array<Record<string, unknown>>;
    const target = observations.find((item) => item.metric_id === "DIFF_BYTES");
    expect(target).toBeDefined();
    if (!target) throw new Error("missing DIFF_BYTES");
    target.observability = "measured";
    (target.condition as Record<string, unknown>).observability = "measured";
    const result = validateCliR00BaselineArtifact(artifact);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected failure");
    expect(result.failures.some((item) => item.code === "proxy_claimed_as_direct")).toBe(true);
  });

  it("U-CLIR00-005: Node versionまたはenvironmentが違うと比較できない", () => {
    const artifact = loadFrozenArtifact();
    const baseline = observation(artifact, "CLI_COMMAND_STARTUP_TIME");
    const nodeDrift = clone(baseline);
    nodeDrift.condition = { ...baseline.condition, node_version: "v22.14.0" };
    const nodeCompare = compareCliR00Observation(baseline, nodeDrift);
    expect(nodeCompare.comparable).toBe(false);
    expect(nodeCompare.failures.some((item) => item.code === "condition_mismatch")).toBe(true);

    const envDrift = clone(observation(artifact, "CI_WALL_CLOCK"));
    envDrift.condition = { ...envDrift.condition, environment: "local_process" };
    const envCompare = compareCliR00Observation(observation(artifact, "CI_WALL_CLOCK"), envDrift);
    expect(envCompare.comparable).toBe(false);
    expect(envCompare.failures.some((item) => item.code === "environment_mixed")).toBe(true);
  });

  it("U-CLIR00-006: live src/cli.ts と workflow から構造snapshotを決定的に再抽出する", () => {
    const first = liveSnapshot();
    const second = liveSnapshot();
    expect(first).toEqual(second);
    expect(first.cli_path).toBe("src/cli.ts");
    expect(first.cli_bytes).toBeGreaterThan(700_000);
    expect(first.top_level_command_families.length).toBeGreaterThan(10);
    expect(first.changed_file_fan_out).toBe(1);
    expect(first.changed_symbol_fan_out).toBe(first.top_level_command_families.length);
    expect(first.shared_file_collision_proxy).toBe(first.top_level_command_families.length);
    expect(first.full_regression_shard_job_ids).toEqual([
      "full-regression-bulk-1",
      "full-regression-bulk-2",
      "full-regression-bulk-3",
      "full-regression-stateful",
    ]);
    expect(first.full_regression_invocation_count_structural).toBe(1);
    expect(first.top_level_command_families).toContain("plan");
    expect(first.top_level_command_families).toContain("ci");
    expect(first.top_level_command_families).toContain("team");
  });

  it("U-CLIR00-007: collision proxyはfamily数であり同時PR数を代入しない", () => {
    const snapshot = liveSnapshot();
    const artifact = loadFrozenArtifact();
    const collision = observation(artifact, "MERGE_CONFLICT_OR_SHARED_FILE_COLLISION_COUNT");
    expect(collision.observability).toBe("proxy");
    expect(collision.value).toBe(snapshot.top_level_command_families.length);
    expect(collision.value).not.toBe(3);
    expect(artifact.supporting_context.historical_notes.some((note) => note.includes("3"))).toBe(
      true,
    );
  });

  it("U-CLIR00-008: frozen artifactが検証に通り、構造proxyがliveと一致する", () => {
    const artifact = loadFrozenArtifact();
    expect(artifact.schema_version).toBe(CLI_R00_SCHEMA_VERSION);
    expect(artifact.behavior_contract_id).toBe(CLI_R00_BEHAVIOR_CONTRACT_ID);
    expect(artifact.issue_id).toBe(CLI_R00_ISSUE_ID);
    expect(artifact.slice_id).toBe(CLI_R00_SLICE_ID);
    expect(artifact.baseline_kind).toBe("pre_refactor");
    expect(artifact.source_branch).toBe("refactor/1687-cli-r00-baseline");
    const snapshot = liveSnapshot();
    expect(remesureCliR00StructuralProxies(artifact, snapshot)).toEqual([]);
  });

  it("U-CLIR00-009: 未知keyと短縮HEADを拒否する", () => {
    const extra = clone(loadFrozenArtifact()) as unknown as Record<string, unknown>;
    extra.fast = true;
    const extraResult = validateCliR00BaselineArtifact(extra);
    expect(extraResult.ok).toBe(false);
    if (extraResult.ok) throw new Error("expected unknown_key");
    expect(extraResult.failures.some((item) => item.code === "unknown_key")).toBe(true);

    const shortHead = clone(loadFrozenArtifact()) as unknown as Record<string, unknown>;
    shortHead.source_head = "282ec5219";
    const shortResult = validateCliR00BaselineArtifact(shortHead);
    expect(shortResult.ok).toBe(false);
    if (shortResult.ok) throw new Error("expected schema_invalid");
    expect(shortResult.failures.some((item) => item.code === "schema_invalid")).toBe(true);
  });

  it("U-CLIR00-010: collectorはsrc/cli.tsをimportせずcommand登録しない", () => {
    const source = readFileSync("src/runtime/cli-r00-throughput-baseline.ts", "utf8");
    expect(source).not.toMatch(/from ["'][^"']*\/cli(?:\.js|\.ts)?["']/);
    expect(source).not.toMatch(/import\(["'][^"']*\/cli(?:\.js|\.ts)?["']\)/);
    expect(source).not.toMatch(/(?:^|[^\\])program\.command\(/m);
    expect(source).not.toMatch(/parseAsync\s*\(/);
    expect(readFileSync("package.json", "utf8")).not.toMatch(/cli-r00/);
  });

  it("U-CLIR00-011: observationsから1件削除すると metric_set_incomplete で殺す", () => {
    const artifact = clone(loadFrozenArtifact()) as unknown as Record<string, unknown>;
    const observations = artifact.observations as unknown[];
    observations.splice(0, 1);
    const result = validateCliR00BaselineArtifact(artifact);
    expect(result.ok).toBe(false);
    if (result.ok) throw new Error("expected metric_set_incomplete");
    expect(result.failures.some((item) => item.code === "metric_set_incomplete")).toBe(true);
  });

  it("U-CLIR00-012: 測定不能指標の数値delta比較を拒否する", () => {
    const artifact = loadFrozenArtifact();
    const baseline = observation(artifact, "REVIEW_RECEIPT_REGEN_COUNT");
    const candidate = clone(baseline);
    const compared = compareCliR00Observation(baseline, candidate);
    expect(compared.comparable).toBe(false);
    expect(compared.delta).toBeNull();
    expect(compared.failures.some((item) => item.code === "unmeasurable_claimed_measured")).toBe(
      true,
    );
  });
});
