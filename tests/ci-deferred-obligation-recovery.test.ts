import { describe, expect, it } from "vitest";
import {
  type DeferredRecoveryInput,
  reconcileDeferredObligations,
} from "../src/runtime/ci-deferred-obligation-recovery";

// PLAN-L7-717-ci-deferred-obligation-recovery / U-CIDEFER-001..006
const HEAD = "b".repeat(40);
const DIGEST = `sha256:${"c".repeat(64)}`;

function input(overrides: Partial<DeferredRecoveryInput> = {}): DeferredRecoveryInput {
  return {
    assignments: [
      {
        obligation_id: "verification:deferred-contract",
        origin_pr: 1208,
        candidate_head: HEAD,
        target_profile: "nightly",
        selector_decision_id: "selector:decision-1",
        registry_edge_id: "edge:requirement-test",
        expires_at: "2026-09-02T00:00:00Z",
      },
    ],
    terminal_runs: [
      {
        run_id: "run:nightly-1",
        attempt: 1,
        obligation_id: "verification:deferred-contract",
        origin_pr: 1208,
        candidate_head: HEAD,
        profile: "nightly",
        completed_at: "2026-09-01T00:00:00Z",
        result: "succeeded",
        first_detecting_oracle_id: null,
        evidence_digest: DIGEST,
      },
    ],
    quarantines: [],
    evaluated_at: "2026-09-01T01:00:00Z",
    wall_time_delta_ms: -120_000,
    runner_minute_delta: -2,
    escaped_defect_count: 0,
    mutation_detection_count: 5,
    injected_mutation_count: 5,
    flake_count: 0,
    ...overrides,
  };
}

describe("CI deferred obligation recovery", () => {
  it("U-CIDEFER-001: assignmentを最初のterminal runへexactly-once接続する", () => {
    const result = reconcileDeferredObligations(input());
    expect(result.ok).toBe(true);
    expect(result.receipts).toEqual([
      expect.objectContaining({
        obligation_id: "verification:deferred-contract",
        origin_pr: 1208,
        candidate_head: HEAD,
        first_terminal_run_id: "run:nightly-1",
        finding_disposition: "closed",
      }),
    ]);
    expect(result.projection_digest).toMatch(/^sha256:[a-f0-9]{64}$/);
  });

  it("U-CIDEFER-002: missing、duplicate、expiredを相殺しない", () => {
    const missing = reconcileDeferredObligations(input({ terminal_runs: [] }));
    expect(missing.findings).toContainEqual(expect.objectContaining({ code: "recovery_missing" }));
    const expired = reconcileDeferredObligations(
      input({ terminal_runs: [], evaluated_at: "2026-09-03T00:00:00Z" }),
    );
    expect(expired.findings).toContainEqual(expect.objectContaining({ code: "recovery_expired" }));
    const duplicate = reconcileDeferredObligations(
      input({
        terminal_runs: [
          input().terminal_runs[0],
          { ...input().terminal_runs[0], run_id: "run:nightly-2", attempt: 2 },
        ],
      }),
    );
    expect(duplicate.findings).toContainEqual(
      expect.objectContaining({ code: "recovery_duplicate" }),
    );
  });

  it("U-CIDEFER-003: wrong profile、stale HEAD、wrong origin、cancelを個別拒否する", () => {
    const run = input().terminal_runs[0];
    const result = reconcileDeferredObligations(
      input({
        terminal_runs: [
          {
            ...run,
            profile: "main",
            candidate_head: "d".repeat(40),
            origin_pr: 9,
            result: "cancelled",
          },
        ],
      }),
    );
    expect(result.findings.map((item) => item.code)).toEqual(
      expect.arrayContaining([
        "recovery_wrong_profile",
        "recovery_stale_head",
        "recovery_origin_mismatch",
        "recovery_cancelled",
      ]),
    );
  });

  it("U-CIDEFER-004: failureをselector、registry edge、oracleへbackpropする", () => {
    const run = input().terminal_runs[0];
    const result = reconcileDeferredObligations(
      input({
        terminal_runs: [
          { ...run, result: "failed", first_detecting_oracle_id: "oracle:mutation-1" },
        ],
      }),
    );
    expect(result.receipts[0].finding_disposition).toBe("backprop_required");
    expect(result.backprop_candidates).toEqual([
      expect.objectContaining({
        selector_decision_id: "selector:decision-1",
        registry_edge_id: "edge:requirement-test",
        first_detecting_oracle_id: "oracle:mutation-1",
        disposition: "reverse_candidate",
      }),
    ]);
  });

  it("U-CIDEFER-005: quarantineはowner、期限、replacement oracleを必須化する", () => {
    const result = reconcileDeferredObligations(
      input({
        quarantines: [
          {
            obligation_id: "verification:deferred-contract",
            owner: "",
            expires_at: "2026-08-31T00:00:00Z",
            replacement_oracle_id: "",
          },
        ],
      }),
    );
    expect(result.findings).toContainEqual(expect.objectContaining({ code: "quarantine_invalid" }));
  });

  it("U-CIDEFER-006: 時間短縮が安全性を落とした場合は完了を拒否する", () => {
    const result = reconcileDeferredObligations(
      input({ escaped_defect_count: 1, mutation_detection_count: 4 }),
    );
    expect(result.safety_metrics).toMatchObject({
      wall_time_delta_ms: -120_000,
      mutation_detection_ratio: 0.8,
    });
    expect(result.findings).toContainEqual(expect.objectContaining({ code: "safety_regression" }));
  });

  it("U-CIDEFER-007: CLI adapterはprojectionをJSON出力しfinding時に非zeroで停止する", () => {
    const directory = mkdtempSync(join(tmpdir(), "helix-ci-deferred-"));
    try {
      const greenPath = join(directory, "green.json");
      const redPath = join(directory, "red.json");
      writeFileSync(greenPath, JSON.stringify(input()), "utf8");
      writeFileSync(redPath, JSON.stringify(input({ terminal_runs: [] })), "utf8");
      const run = (path: string) =>
        spawnSync(
          process.execPath,
          ["--import", "tsx", "src/cli.ts", "ci", "deferred-recovery", "--input", path, "--json"],
          { cwd: process.cwd(), encoding: "utf8" },
        );
      const green = run(greenPath);
      expect(green.status).toBe(0);
      expect(JSON.parse(green.stdout)).toMatchObject({ ok: true, receipts: [{ origin_pr: 1208 }] });
      const red = run(redPath);
      expect(red.status).toBe(1);
      expect(JSON.parse(red.stdout).findings).toContainEqual(
        expect.objectContaining({ code: "recovery_missing" }),
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
});

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
