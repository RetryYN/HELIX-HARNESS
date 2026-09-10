import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runPreflightGateAggregationCommand } from "../src/cli/preflight-gate-aggregation";
import {
  CONDITIONAL_PREFLIGHT_GATES,
  conditionalGateApplies,
  OUTCOME_ENV_BY_GATE_ID,
  PREFLIGHT_GATE_AGGREGATION_SCHEMA,
  type PreflightGateAggregationResult,
  REQUIRED_PREFLIGHT_GATE_IDS,
} from "../src/runtime/preflight-gate-aggregation";

// PLAN-RECOVERY-1688-preflight-gate-aggregation — U-CI-PREFLIGHT-AGGREGATION-CLI-001

const roots: string[] = [];

function fixture(): { root: string; outputPath: string } {
  const root = mkdtempSync(join(tmpdir(), "helix-preflight-agg-"));
  roots.push(root);
  return { root, outputPath: join(root, "preflight-gate-results.json") };
}

afterEach(() => {
  while (roots.length > 0) rmSync(roots.pop() as string, { recursive: true, force: true });
});

function passingEnv(): NodeJS.ProcessEnv {
  const context = {
    eventName: "pull_request",
    headBranch: "recovery/1688-preflight-gate-aggregation",
    baseBranch: "main",
  };
  const env: NodeJS.ProcessEnv = {
    EVENT_NAME: context.eventName,
    HEAD_BRANCH: context.headBranch,
    BASE_BRANCH: context.baseBranch,
    CURRENT_HEAD_REVIEW: "success",
  };
  for (const id of REQUIRED_PREFLIGHT_GATE_IDS) {
    env[OUTCOME_ENV_BY_GATE_ID[id]] = "success";
  }
  for (const gate of CONDITIONAL_PREFLIGHT_GATES) {
    if (!conditionalGateApplies(gate.id, context)) env[gate.outcomeKey] = "skipped";
  }
  return env;
}

describe("Preflight gate aggregation CLI adapter", () => {
  it("U-CI-PREFLIGHT-AGGREGATION-CLI-001: typed JSONを書き、失敗時はexit 1へ写像する", () => {
    const passing = fixture();
    const ok = runPreflightGateAggregationCommand(
      ["--output", passing.outputPath, "--observed-at", "2026-09-10T12:00:00.000Z"],
      passingEnv(),
    );
    expect(ok.ok).toBe(true);
    const written = JSON.parse(
      readFileSync(passing.outputPath, "utf8"),
    ) as PreflightGateAggregationResult;
    expect(written.schema_version).toBe(PREFLIGHT_GATE_AGGREGATION_SCHEMA);
    expect(written.ok).toBe(true);

    const failing = fixture();
    const env = passingEnv();
    env.LINT_BIOME = "failure";
    env.DESIGN_LANGUAGE = "failure";
    const red = runPreflightGateAggregationCommand(
      ["--output", failing.outputPath, "--observed-at", "2026-09-10T12:00:00.000Z"],
      env,
    );
    expect(red.ok).toBe(false);
    expect(red.failures.map((gate) => gate.id)).toEqual(["lint_biome", "design_language"]);

    const spawned = spawnSync(
      process.execPath,
      [
        "--import",
        "tsx",
        "src/cli/preflight-gate-aggregation.ts",
        "--output",
        failing.outputPath,
        "--observed-at",
        "2026-09-10T12:00:00.000Z",
      ],
      { env: { ...process.env, ...env }, encoding: "utf8" },
    );
    expect(spawned.status).toBe(1);
    expect(spawned.stderr).toContain(
      "preflight gate aggregation failed: 2 failure(s), 0 unauthorized skip(s)",
    );
    expect(spawned.stdout).toContain("lint_biome: failure");
    expect(spawned.stdout).toContain("design_language: failure");
    expect(spawned.stdout).toContain("typecheck: success");
  });
});
