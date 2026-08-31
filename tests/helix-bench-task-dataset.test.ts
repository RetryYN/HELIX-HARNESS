import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  HELIX_BENCH_CATEGORIES,
  HELIX_BENCH_TASK_FIELDS,
  loadHelixBenchDataset,
  validateHelixBenchDataset,
} from "../src/runtime/helix-bench-task-dataset";

// PLAN-L7-719-helix-bench-task-dataset

function registries() {
  const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
  return {
    publicRegistry: read("config/helix-bench/public-tasks.v1.json"),
    fixtureRegistry: read("config/helix-bench/fixtures.v1.json"),
    hiddenRegistry: read("config/helix-bench/hidden/hidden-oracles.v1.json"),
  };
}

describe("HELIX-Bench task dataset", () => {
  it("U-HBDATA-001: 10 taskと5カテゴリをexact snapshotへ束縛する", () => {
    const result = loadHelixBenchDataset();
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.failure_code);
    expect(result.public_tasks).toHaveLength(10);
    expect(new Set(result.public_tasks.map((task) => task.category))).toEqual(
      new Set(HELIX_BENCH_CATEGORIES),
    );
    expect(
      Object.fromEntries(
        HELIX_BENCH_CATEGORIES.map((category) => [
          category,
          result.public_tasks.filter((task) => task.category === category).length,
        ]),
      ),
    ).toEqual(Object.fromEntries(HELIX_BENCH_CATEGORIES.map((category) => [category, 2])));
    for (const task of result.public_tasks) {
      expect(Object.keys(task.snapshot).sort()).toEqual([...HELIX_BENCH_TASK_FIELDS].sort());
    }
    expect(result.fixture_count).toBe(10);
    expect(result.hidden_oracle_count).toBe(10);
    expect(result.dataset_digest).toMatch(/^sha256:[a-f0-9]{64}$/u);
  });

  it("U-HBDATA-002: missing fixtureとfixture digest driftをfail-closeする", () => {
    const missing = registries();
    missing.fixtureRegistry.fixtures.pop();
    expect(validateHelixBenchDataset(missing)).toMatchObject({
      ok: false,
      failure_code: "FIXTURE_MISSING",
    });

    const drift = registries();
    drift.fixtureRegistry.fixtures[0].payload.case = "future-answer";
    expect(validateHelixBenchDataset(drift)).toMatchObject({
      ok: false,
      failure_code: "FIXTURE_DIGEST_DRIFT",
    });
  });

  it("U-HBDATA-003: hidden oracle欠落／digest drift／public leakageを個別拒否する", () => {
    const missing = registries();
    missing.hiddenRegistry.oracles.shift();
    expect(validateHelixBenchDataset(missing)).toMatchObject({
      ok: false,
      failure_code: "HIDDEN_ORACLE_MISSING",
    });

    const emptyNegativeOracle = registries();
    emptyNegativeOracle.hiddenRegistry.oracles[0].negative_mutations = [];
    const hidden = emptyNegativeOracle.hiddenRegistry.oracles[0];
    emptyNegativeOracle.publicRegistry.tasks[0].snapshot.hidden_oracle_digest = `sha256:${"0".repeat(64)}`;
    const digestDriftResult = validateHelixBenchDataset(emptyNegativeOracle);
    expect(digestDriftResult).toMatchObject({
      ok: false,
      failure_code: "HIDDEN_ORACLE_INVALID",
      task_id: hidden.task_id,
    });

    const drift = registries();
    drift.hiddenRegistry.oracles[0].negative_mutations.push("future_answer");
    expect(validateHelixBenchDataset(drift)).toMatchObject({
      ok: false,
      failure_code: "HIDDEN_ORACLE_DIGEST_DRIFT",
    });

    const leakage = registries();
    leakage.publicRegistry.tasks[0].prompt = "private_review_contextを参照する";
    expect(validateHelixBenchDataset(leakage)).toMatchObject({
      ok: false,
      failure_code: "HIDDEN_ORACLE_LEAKAGE",
    });
  });

  it("U-HBDATA-006: 初期datasetをexact 10 taskへ固定する", () => {
    const extra = registries();
    extra.publicRegistry.tasks.push(structuredClone(extra.publicRegistry.tasks[0]));
    expect(validateHelixBenchDataset(extra)).toMatchObject({
      ok: false,
      failure_code: "DATASET_INVALID",
    });
  });

  it("U-HBDATA-004: historical resultをcurrent task証拠へ再利用しない", () => {
    const input = registries();
    input.hiddenRegistry.oracles[0].historical_result_refs.push("PR-262-score");
    expect(validateHelixBenchDataset(input)).toMatchObject({
      ok: false,
      failure_code: "HISTORICAL_RESULT_REUSE",
    });
  });

  it("U-HBDATA-005: Cursor canaryをprovider authorityでなくexternal worker候補にする", () => {
    const result = loadHelixBenchDataset();
    expect(result.ok).toBe(true);
    if (!result.ok) throw new Error(result.failure_code);
    const cursorCandidate = result.public_tasks.find(
      (task) => task.snapshot.task_id === "HB-IMP-002",
    );
    expect(cursorCandidate).toMatchObject({
      category: "Controlled Implementation",
      external_worker_candidate: true,
    });
    expect(JSON.stringify(cursorCandidate)).not.toMatch(/cursor|grok|kimi|composer/iu);
  });
});
