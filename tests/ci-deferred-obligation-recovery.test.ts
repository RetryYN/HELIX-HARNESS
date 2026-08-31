import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  type CiCriticalPathSchedulerInput,
  scheduleCiCriticalPath,
} from "../src/runtime/ci-critical-path-scheduler";
import {
  type DeferredRecoveryInput,
  projectDeferredRecoveryAssignments,
  reconcileDeferredObligations,
} from "../src/runtime/ci-deferred-obligation-recovery";
import {
  type CiResponsibilityRegistry,
  ciResponsibilityRegistryDigest,
  validateCiResponsibilityRegistry,
} from "../src/runtime/ci-responsibility-registry";
import { composeCiVerificationPlan } from "../src/runtime/ci-verification-plan";

// PLAN-L7-717-ci-deferred-obligation-recovery / U-CIDEFER-001..006
const HEAD = "b".repeat(40);
const BASE = "a".repeat(40);
const DIGEST = `sha256:${"c".repeat(64)}` as const;

function registry(): CiResponsibilityRegistry {
  return JSON.parse(
    readFileSync("config/ci-responsibility-registry.v1.json", "utf8"),
  ) as CiResponsibilityRegistry;
}

function composeWithRegistry(
  current: CiResponsibilityRegistry,
  overrides: {
    changedArtifactNodeIds?: readonly string[];
    riskSignals?: readonly string[];
    requiredObligationIds?: readonly string[];
  } = {},
) {
  return composeCiVerificationPlan({
    registry: current,
    expected_registry_digest: ciResponsibilityRegistryDigest(current),
    work_authority: { kind: "issue", id: "issue:1208" },
    candidate_head: HEAD,
    expected_candidate_head: HEAD,
    base_head: BASE,
    execution_context: "pull_request",
    authority_node_ids: [],
    changed_artifact_node_ids: overrides.changedArtifactNodeIds ?? [
      "artifact:src/runtime/ci-responsibility-registry.ts",
    ],
    changed_test_capability_ids: [],
    risk_signals: overrides.riskSignals ?? [],
    required_obligation_ids: overrides.requiredObligationIds ?? [],
    defer_assignments: [],
  });
}

function schedulerInput(
  plan: ReturnType<typeof composeCiVerificationPlan>,
): CiCriticalPathSchedulerInput {
  const obligations = plan.execution_dag.map((node) => ({
    ...node,
    obligation_class: plan.local_obligations.includes(node.capability_id)
      ? ("local" as const)
      : plan.boundary_obligations.includes(node.capability_id)
        ? ("boundary" as const)
        : ("global_invariant" as const),
    heavy: false,
  }));
  return {
    candidate_head: HEAD,
    expected_candidate_head: HEAD,
    base_head: BASE,
    verification_plan_digest: plan.plan_digest,
    registry_digest: plan.registry_digest,
    obligations,
    estimates: obligations.map((obligation) => ({
      capability_id: obligation.capability_id,
      p50_ms: 10,
      p95_ms: 20,
      variance_ms: 2,
      flake_rate: 0,
      queue_ms: 1,
      cache_state: "hit" as const,
      sample_count: 5,
    })),
    max_parallel_jobs: 2,
    telemetry_max_age_ms: 86_400_000,
    telemetry_observed_at: "2026-09-01T00:00:00Z",
    evaluated_at: "2026-09-01T00:00:01Z",
    artifacts: [],
    exclusive_resources: [],
    expected_artifact_identities: [],
    resource_requirements: obligations.map((obligation) => ({
      capability_id: obligation.capability_id,
      runner_os: "linux",
      cpu_units: 1,
      memory_mb: 512,
      timeout_ms: 60_000,
    })),
    compatible_runner_os: ["linux"],
    available_cpu_units: 2,
    available_memory_mb: 2048,
    backpressure_active: false,
  };
}

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

  it("U-CIDEFER-008: Verification Planのcanonical targetをRecovery assignmentへ投影する", () => {
    const result = projectDeferredRecoveryAssignments({
      verification_plan: {
        candidate_head: HEAD,
        deferred_obligations: [
          {
            capability_id: "verification:release-candidate",
            target: "release",
            candidate_head: HEAD,
            receipt_status: "pending",
          },
        ],
      },
      origin_pr: 1208,
      selector_decision_id: "selector:decision-1",
      registry_edge_ids: {
        "verification:release-candidate": "edge:release-candidate",
      },
      expires_at_by_profile: {
        main: "2026-09-02T00:00:00Z",
        nightly: "2026-09-03T00:00:00Z",
        release: "2026-09-04T00:00:00Z",
      },
    });
    expect(result).toMatchObject({
      ok: true,
      assignments: [
        {
          obligation_id: "verification:release-candidate",
          target_profile: "release",
          registry_edge_id: "edge:release-candidate",
        },
      ],
    });
  });

  it("U-CIDEFER-009: edge欠落またはterminal receiptの再割当を拒否する", () => {
    const result = projectDeferredRecoveryAssignments({
      verification_plan: {
        candidate_head: HEAD,
        deferred_obligations: [
          {
            capability_id: "verification:release-candidate",
            target: "release",
            candidate_head: HEAD,
            receipt_status: "succeeded",
            receipt_digest: DIGEST,
          },
        ],
      },
      origin_pr: 1208,
      selector_decision_id: "selector:decision-1",
      registry_edge_ids: {},
      expires_at_by_profile: {
        main: "2026-09-02T00:00:00Z",
        nightly: "2026-09-03T00:00:00Z",
        release: "2026-09-04T00:00:00Z",
      },
    });
    expect(result.ok).toBe(false);
    expect(result.findings).toContainEqual(expect.objectContaining({ code: "assignment_invalid" }));
  });

  it("U-CIDEFER-010: selector fault injection exact setを各authority層で検出する", () => {
    const expected = ["verification:ci-responsibility-unit", "verification:impact-ci-boundary"];

    const selectorEdgeDeleted = registry();
    selectorEdgeDeleted.edges = selectorEdgeDeleted.edges.filter(
      (edge) =>
        !(
          edge.from === "artifact:src/runtime/ci-responsibility-registry.ts" &&
          edge.to === "module:ci-system-synthesis"
        ),
    );
    expect(
      composeWithRegistry(selectorEdgeDeleted, { requiredObligationIds: expected }).findings,
      "selector edge deletion",
    ).toContainEqual(expect.objectContaining({ code: "required_obligation_missing" }));

    const riskDowngraded = composeWithRegistry(registry(), {
      changedArtifactNodeIds: [],
      riskSignals: [],
      requiredObligationIds: [
        "verification:ci-authority-global",
        "verification:ci-responsibility-unit",
        "verification:impact-ci-boundary",
      ],
    });
    expect(riskDowngraded.findings, "risk downgrade").toContainEqual(
      expect.objectContaining({ code: "required_obligation_missing" }),
    );

    const moduleClosureMissing = registry();
    moduleClosureMissing.edges = moduleClosureMissing.edges.filter(
      (edge) => !(edge.from === "module:ci-system-synthesis" && edge.to === "runtime:impact-ci"),
    );
    expect(
      composeWithRegistry(moduleClosureMissing, { requiredObligationIds: expected }).findings,
      "Module closure missing",
    ).toContainEqual(expect.objectContaining({ code: "required_obligation_missing" }));

    const testOwnerMiswired = registry();
    testOwnerMiswired.capabilities = [
      ...testOwnerMiswired.capabilities,
      {
        ...testOwnerMiswired.capabilities[0],
        capability_id: "verification:ci-responsibility-shadow",
        owner: "wrong-test-owner",
      },
    ];
    expect(
      validateCiResponsibilityRegistry(testOwnerMiswired).findings,
      "test owner miswiring",
    ).toContainEqual(expect.objectContaining({ code: "duplicate_responsibility_owner" }));

    const plan = composeWithRegistry(registry());
    const scheduleInput = schedulerInput(plan);
    const artifactReuseMistake = scheduleCiCriticalPath({
      ...scheduleInput,
      artifacts: [
        {
          artifact_id: "artifact:ci-build",
          capability_id: "verification:ci-responsibility-unit",
          source_head: BASE,
          lockfile_digest: DIGEST,
          node_version: "24.15.0",
          toolchain_digest: DIGEST,
          platform: "linux-x64",
          input_digest: DIGEST,
          output_digest: DIGEST,
        },
      ],
      expected_artifact_identities: [
        {
          artifact_id: "artifact:ci-build",
          capability_id: "verification:ci-responsibility-unit",
          lockfile_digest: DIGEST,
          node_version: "24.15.0",
          toolchain_digest: DIGEST,
          platform: "linux-x64",
          input_digest: DIGEST,
          output_digest: DIGEST,
        },
      ],
    });
    expect(artifactReuseMistake.findings, "artifact reuse mistake").toContainEqual(
      expect.objectContaining({ code: "artifact_identity_invalid" }),
    );
  });

  it("U-CIDEFER-011: main／nightly／releaseを縮退させずexactly-once回収する", () => {
    const assignments = (["main", "nightly", "release"] as const).map((profile, index) => ({
      obligation_id: `verification:${profile}-contract`,
      origin_pr: 1208,
      candidate_head: HEAD,
      target_profile: profile,
      selector_decision_id: `selector:${profile}-${index}`,
      registry_edge_id: `edge:${profile}-${index}`,
      expires_at: "2026-09-02T00:00:00Z",
    }));
    const terminalRuns = assignments.map((assignment, index) => ({
      run_id: `run:${assignment.target_profile}-${index}`,
      attempt: 1,
      obligation_id: assignment.obligation_id,
      origin_pr: assignment.origin_pr,
      candidate_head: assignment.candidate_head,
      profile: assignment.target_profile,
      completed_at: "2026-09-01T00:00:00Z",
      result: "succeeded" as const,
      first_detecting_oracle_id: null,
      evidence_digest: DIGEST,
    }));
    const result = reconcileDeferredObligations(
      input({ assignments, terminal_runs: terminalRuns }),
    );
    expect(result.ok).toBe(true);
    expect(result.receipts.map((receipt) => receipt.target_profile)).toEqual([
      "main",
      "nightly",
      "release",
    ]);
    expect(new Set(result.receipts.map((receipt) => receipt.first_terminal_run_id)).size).toBe(3);
  });
});

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
