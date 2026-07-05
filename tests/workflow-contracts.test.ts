import { describe, expect, it } from "vitest";
import { recommendedCommandV1Schema } from "../src/schema/index";
import { openHarnessDb } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import {
  assertRefactorInvariant,
  classifyDriveTddFits,
  computeUtHistorySignals,
  decideDiscoveryS4,
  detectFrontendDrift,
  enforceForwardOrder,
  evaluateGreenDefinition,
  evaluateResearchDecision,
  evaluateRetrofitMatrix,
  mergeTwoStageAgentDesign,
  projectUtHistorySignals,
  recordCrossCuttingEvent,
  recordTestRunEvidence,
  routeReverseR4,
  routeScrumFullback,
  validateFrontendDesignWorkflow,
  validateScreenDesignWorkflow,
} from "../src/workflow/contracts";
import {
  buildCommandCatalog,
  catalogExistingAssets,
  catalogSkills,
  classifyDrive,
  prioritizeCapabilityGaps,
  recommendModelEffort,
  recommendSkills,
  renderFoundationReadiness,
  resolveDriveStatePartition,
  suggestSkillInjection,
  validateDriveStatePartitions,
  validateFolderRules,
} from "../src/workflow/contracts-extras";
import { DRIVE_TDD_FITS } from "../src/workflow/contracts-policy";
import type { ContractResult as SidecarContractResult } from "../src/workflow/contracts-types";
import {
  evaluateRouteCommand,
  routeSignalToMode,
  validateRouteConfigText,
} from "../src/workflow/routing-contracts";

// @helix-trace FR-L1-06
// @helix-trace FR-L1-08
// @helix-trace FR-L1-11
// @helix-trace FR-L1-12
// @helix-trace FR-L1-13
// @helix-trace FR-L1-14
// @helix-trace FR-L1-15
// @helix-trace FR-L1-22
// @helix-trace FR-L1-23
// @helix-trace FR-L1-25
// @helix-trace FR-L1-26
// @helix-trace FR-L1-27
// @helix-trace FR-L1-28
// @helix-trace FR-L1-29
// @helix-trace FR-L1-30
// @helix-trace FR-L1-32
// @helix-trace FR-L1-37
// @helix-trace FR-L1-39
// @helix-trace FR-L1-40
// @helix-trace FR-L1-41
// @helix-trace FR-L1-47
// @helix-trace FR-L1-48

describe("L7 workflow contract implementations", () => {
  it("records UT run evidence into harness.db projection tables and reports weak links", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const result = recordTestRunEvidence(
        {
          plan_id: "PLAN-L7-X",
          command: "bun run test",
          runner: "vitest",
          scope: "tests/workflow-contracts.test.ts",
          started_at: "2026-06-12T00:00:00.000Z",
          completed_at: "2026-06-12T00:01:00.000Z",
          exit_code: 0,
          evidence_path: ".helix/evidence/test.json",
          output_digest: "sha256:0123456789abcdef",
          cases: [
            {
              oracle_id: "U-FR-L1-06",
              name: "records projection",
              status: "passed",
              artifact_path: "src/workflow/contracts.ts",
            },
          ],
        },
        { db },
      );

      expect(result.ok).toBe(true);
      expect(result.refs.map((ref) => ref.table)).toEqual([
        "test_runs",
        "test_cases",
        "test_results",
        "test_artifact_edges",
      ]);
      expect(db.prepare("SELECT COUNT(*) AS n FROM test_runs").get()?.n).toBe(1);
      expect(
        db.prepare("SELECT output_digest FROM test_runs WHERE plan_id = ?").get("PLAN-L7-X")
          ?.output_digest,
      ).toBe("sha256:0123456789abcdef");
      expect(
        db
          .prepare(
            "SELECT duration_ms, started_at, completed_at, failure_digest FROM test_results WHERE oracle_id = ?",
          )
          .get("U-FR-L1-06"),
      ).toEqual({
        duration_ms: 0,
        started_at: "2026-06-12T00:00:00.000Z",
        completed_at: "2026-06-12T00:01:00.000Z",
        failure_digest: "",
      });
      expect(db.prepare("SELECT COUNT(*) AS n FROM test_artifact_edges").get()?.n).toBe(1);
    } finally {
      db.close();
    }
  });

  it("evaluates green definition and UT history signals without silent pass", () => {
    const green = evaluateGreenDefinition({
      profile: "l7",
      required_commands: ["lint", "test"],
      reviewed_at: "2026-06-12T00:05:00.000Z",
      command_evidence: [
        {
          kind: "lint",
          completed_at: "2026-06-12T00:01:00.000Z",
          exit_code: 0,
          evidence_path: "lint.log",
        },
        {
          kind: "test",
          completed_at: "2026-06-12T00:02:00.000Z",
          exit_code: 0,
          evidence_path: "test.log",
        },
      ],
    });
    expect(green.ok).toBe(true);
    expect(green.computed_green_at).toBe("2026-06-12T00:02:00.000Z");

    const weak = evaluateGreenDefinition({
      profile: "l7",
      required_commands: ["lint", "test", "doctor"],
      command_evidence: [],
    });
    expect(weak.ok).toBe(false);
    expect(weak.missing).toEqual(["lint", "test", "doctor"]);

    const signals = computeUtHistorySignals({
      required_oracles: ["U-1", "U-2"],
      test_runs: [
        {
          command: "test",
          runner: "vitest",
          scope: "unit",
          started_at: "2026-06-12T00:00:00.000Z",
          completed_at: "2026-06-12T00:01:00.000Z",
          exit_code: 0,
          evidence_path: "test.log",
          cases: [{ oracle_id: "U-1", name: "one", status: "passed" }],
        },
      ],
    });
    expect(signals.signals.find((s) => s.signal_type === "oracle_coverage")?.score).toBe(0.5);
    expect(signals.signals.find((s) => s.signal_type === "flake_score")?.score).toBe(0);
    expect(signals.signals.find((s) => s.signal_type === "duration_regression")?.score).toBe(0);
  });

  it("detects UT history flake and duration regression signals from oracle history", () => {
    const signals = computeUtHistorySignals({
      duration_regression_ratio: 1.5,
      test_runs: [
        {
          command: "test",
          runner: "vitest",
          scope: "unit",
          started_at: "2026-06-12T00:00:00.000Z",
          completed_at: "2026-06-12T00:01:00.000Z",
          exit_code: 1,
          evidence_path: "run-1.log",
          cases: [
            { oracle_id: "U-FLAKE", name: "flaky", status: "failed", duration_ms: 10 },
            { oracle_id: "U-SLOW", name: "slow", status: "passed", duration_ms: 100 },
          ],
        },
        {
          command: "test",
          runner: "vitest",
          scope: "unit",
          started_at: "2026-06-12T00:02:00.000Z",
          completed_at: "2026-06-12T00:03:00.000Z",
          exit_code: 0,
          evidence_path: "run-2.log",
          cases: [
            { oracle_id: "U-FLAKE", name: "flaky", status: "passed", duration_ms: 12 },
            { oracle_id: "U-SLOW", name: "slow", status: "passed", duration_ms: 180 },
          ],
        },
      ],
    });

    expect(signals.signals.find((s) => s.signal_type === "flake_score")?.score).toBe(0.5);
    expect(signals.signals.find((s) => s.signal_type === "duration_regression")?.score).toBe(0.5);
  });

  it("keeps UT history signals oracle-scoped and uses prior median for duration regression", () => {
    const signals = computeUtHistorySignals({
      duration_regression_ratio: 2,
      test_runs: [
        {
          command: "test",
          runner: "vitest",
          scope: "unit",
          started_at: "2026-06-12T00:04:00.000Z",
          completed_at: "2026-06-12T00:05:00.000Z",
          exit_code: 0,
          evidence_path: "run-3.log",
          cases: [
            { oracle_id: "U-STABLE", name: "stable", status: "passed", duration_ms: 300 },
            { oracle_id: "U-SKIP", name: "skip", status: "skipped" },
          ],
        },
        {
          command: "test",
          runner: "vitest",
          scope: "unit",
          started_at: "2026-06-12T00:00:00.000Z",
          completed_at: "2026-06-12T00:01:00.000Z",
          exit_code: 1,
          evidence_path: "run-1.log",
          cases: [
            { oracle_id: "U-STABLE", name: "stable", status: "passed", duration_ms: 100 },
            { oracle_id: "U-OTHER", name: "other", status: "failed", duration_ms: 20 },
          ],
        },
        {
          command: "test",
          runner: "vitest",
          scope: "unit",
          started_at: "2026-06-12T00:02:00.000Z",
          completed_at: "2026-06-12T00:03:00.000Z",
          exit_code: 0,
          evidence_path: "run-2.log",
          cases: [
            { oracle_id: "U-STABLE", name: "stable", status: "passed", duration_ms: 200 },
            { oracle_id: "U-OTHER", name: "other", status: "passed", duration_ms: 0 },
          ],
        },
      ],
    });

    expect(signals.signals.find((s) => s.signal_type === "flake_score")?.score).toBe(1 / 3);
    expect(signals.signals.find((s) => s.signal_type === "duration_regression")?.score).toBe(1 / 3);
  });

  it("projects UT history flake and duration signals into harness.db", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      const result = projectUtHistorySignals(
        {
          plan_id: "PLAN-L7-238",
          window: "2026-07-03T00:00:00.000Z..2026-07-03T00:03:00.000Z",
          duration_regression_ratio: 1.5,
          required_oracles: ["U-FLAKE", "U-SLOW"],
          test_runs: [
            {
              plan_id: "PLAN-L7-238",
              command: "bun test",
              runner: "vitest",
              scope: "unit",
              started_at: "2026-07-03T00:00:00.000Z",
              completed_at: "2026-07-03T00:01:00.000Z",
              exit_code: 1,
              evidence_path: ".helix/evidence/run-1.json",
              cases: [
                { oracle_id: "U-FLAKE", name: "flaky", status: "failed", duration_ms: 10 },
                { oracle_id: "U-SLOW", name: "slow", status: "passed", duration_ms: 100 },
              ],
            },
            {
              plan_id: "PLAN-L7-238",
              command: "bun test",
              runner: "vitest",
              scope: "unit",
              started_at: "2026-07-03T00:02:00.000Z",
              completed_at: "2026-07-03T00:03:00.000Z",
              exit_code: 0,
              evidence_path: ".helix/evidence/run-2.json",
              cases: [
                { oracle_id: "U-FLAKE", name: "flaky", status: "passed", duration_ms: 12 },
                { oracle_id: "U-SLOW", name: "slow", status: "passed", duration_ms: 180 },
              ],
            },
          ],
        },
        { db, now: () => "2026-07-03T00:04:00.000Z" },
      );

      expect(result.ok).toBe(true);
      expect(result.refs.map((ref) => ref.table)).toContain("test_flake_events");
      expect(result.refs.map((ref) => ref.table)).toContain("quality_signals");
      expect(db.prepare("SELECT COUNT(*) AS n FROM test_flake_events").get()?.n).toBe(1);
      expect(
        db
          .prepare(
            "SELECT pass_count, fail_count, flake_score FROM test_flake_events WHERE test_case_id = ?",
          )
          .get("test-case-oracle:PLAN-L7-238:U-FLAKE"),
      ).toEqual({ pass_count: 1, fail_count: 1, flake_score: 0.5 });
      expect(
        db
          .prepare(
            "SELECT plan_id, oracle_id, first_seen_at, last_seen_at FROM test_cases WHERE test_case_id = ?",
          )
          .get("test-case-oracle:PLAN-L7-238:U-FLAKE"),
      ).toEqual({
        plan_id: "PLAN-L7-238",
        oracle_id: "U-FLAKE",
        first_seen_at: "2026-07-03T00:01:00.000Z",
        last_seen_at: "2026-07-03T00:03:00.000Z",
      });
      expect(
        db
          .prepare(
            "SELECT status, value FROM quality_signals WHERE source = ? AND subject_id = ? AND metric = ?",
          )
          .get("ut-history", "oracle:PLAN-L7-238:U-SLOW", "duration_regression"),
      ).toEqual({ status: "warn", value: 1.8 });
      expect(
        db
          .prepare(
            "SELECT status, value FROM quality_signals WHERE source = ? AND subject_id = ? AND metric = ?",
          )
          .get("ut-history", "PLAN-L7-238", "duration_regression"),
      ).toEqual({ status: "warn", value: 0.5 });
      expect(
        db
          .prepare(
            "SELECT COUNT(*) AS n FROM quality_signals WHERE source = ? AND subject_id = ? AND metric = ?",
          )
          .get("ut-history", "oracle:PLAN-L7-238:U-SLOW", "duration_trend_ms")?.n,
      ).toBe(2);
      expect(
        db
          .prepare(
            "SELECT value, threshold, status, computed_at FROM quality_signals WHERE source = ? AND subject_id = ? AND metric = ? ORDER BY computed_at DESC LIMIT 1",
          )
          .get("ut-history", "oracle:PLAN-L7-238:U-SLOW", "duration_trend_ms"),
      ).toEqual({
        value: 180,
        threshold: 100,
        status: "warn",
        computed_at: "2026-07-03T00:03:00.000Z",
      });
    } finally {
      db.close();
    }
  });

  it("keeps UT history projection IDs scoped by plan", () => {
    const db = openHarnessDb(":memory:");
    try {
      migrate(db);
      for (const planId of ["PLAN-A", "PLAN-B"]) {
        projectUtHistorySignals(
          {
            plan_id: planId,
            window: "same-window",
            test_runs: [
              {
                plan_id: planId,
                command: "bun test",
                runner: "vitest",
                scope: "unit",
                started_at: "2026-07-03T00:00:00.000Z",
                completed_at: "2026-07-03T00:01:00.000Z",
                exit_code: 1,
                evidence_path: `${planId}-1.json`,
                cases: [{ oracle_id: "U-SHARED", name: "shared", status: "failed" }],
              },
              {
                plan_id: planId,
                command: "bun test",
                runner: "vitest",
                scope: "unit",
                started_at: "2026-07-03T00:02:00.000Z",
                completed_at: "2026-07-03T00:03:00.000Z",
                exit_code: 0,
                evidence_path: `${planId}-2.json`,
                cases: [{ oracle_id: "U-SHARED", name: "shared", status: "passed" }],
              },
            ],
          },
          { db, now: () => "2026-07-03T00:04:00.000Z" },
        );
      }

      expect(db.prepare("SELECT COUNT(*) AS n FROM test_flake_events").get()?.n).toBe(2);
      expect(
        db
          .prepare("SELECT COUNT(DISTINCT subject_id) AS n FROM quality_signals WHERE metric = ?")
          .get("flake_score")?.n,
      ).toBe(4);
    } finally {
      db.close();
    }
  });

  it("implements routing, workflow, FE/design, asset, model, drive, skill, and command contracts", () => {
    expect(routeSignalToMode({ signal: "reverse gap" }).candidates).toEqual(["reverse"]);
    expect(routeSignalToMode({ signal: "drift", drive: "agent" }).candidates[0]).toBe("reverse");
    expect(routeSignalToMode({ signal: "regression_prod" }).candidates[0]).toBe("incident");
    expect(routeSignalToMode({ signal: "new_requirement" }).candidates[0]).toBe("add-feature");
    expect(routeSignalToMode({ signal: "version_deferral" }).candidates[0]).toBe("version-up");
    const routeEval = evaluateRouteCommand({ signal: "reverse gap" });
    expect(routeEval.mode).toBe("reverse");
    expect(routeEval.exit_code).toBe(0);
    expect(routeEval.recommended_command?.command).toBe("helix task classify");
    expect(recommendedCommandV1Schema.safeParse(routeEval.recommended_command).success).toBe(true);
    expect(routeEval.suggest_command).toContain("reverse gap");
    const unknownRoute = evaluateRouteCommand({ signal: "unmapped-special-case" });
    expect(unknownRoute.exit_code).toBe(2);
    expect(unknownRoute.recommended_command).toBeNull();
    const blockedRoute = evaluateRouteCommand({ signal: "forced_stop" });
    expect(blockedRoute.exit_code).toBe(1);
    expect(blockedRoute.approval.status).toBe("policy_missing");
    expect(blockedRoute.suggest_command).toBe("helix doctor");
    expect(blockedRoute.recommended_command?.safety.requires_human_approval).toBe(true);
    for (const signal of ["production_incident", "hotfix_required", "regression_prod"]) {
      const incidentRoute = evaluateRouteCommand({ signal });
      expect(incidentRoute.mode).toBe("incident");
      expect(incidentRoute.exit_code).toBe(1);
      expect(incidentRoute.approval.required).toBe(true);
      expect(incidentRoute.recommended_command?.command).toBe("helix doctor");
    }
    const approvedRoute = evaluateRouteCommand({
      signal: "forced_stop",
      approval_policy: {
        rules: [{ mode: "recovery", required_approvers: ["tl", "po"] }],
        approvals: [
          { mode: "recovery", approver: "tl", approved_at: "2026-06-23T00:00:00.000Z" },
          { mode: "recovery", approver: "po", approved_at: "2026-06-23T00:00:00.000Z" },
        ],
      },
    });
    expect(approvedRoute.exit_code).toBe(0);
    expect(approvedRoute.approval.status).toBe("approved");
    const driftRoute = evaluateRouteCommand({ signal: "drift", drift_type: "schema" });
    expect(driftRoute.mode).toBe("reverse");
    expect(driftRoute.recommended_command?.args).toMatchObject({ drift_type: "schema" });
    const additiveInterruptRoute = evaluateRouteCommand({ signal: "new_requirement" });
    expect(additiveInterruptRoute.mode).toBe("add-feature");
    const versionUpRoute = evaluateRouteCommand({ signal: "version_deferral" });
    expect(versionUpRoute.mode).toBe("version-up");
    expect(versionUpRoute.exit_code).toBe(0);
    expect(versionUpRoute.recommended_command?.command).toBe("helix task classify");
    expect(versionUpRoute.recommended_command?.args).toMatchObject({
      signal: "version_deferral",
      mode: "version-up",
    });
    const pairAgentRoute = evaluateRouteCommand({
      signal: "pair_agent_tdd implement with lightweight worker and smart reviewer",
    });
    expect(pairAgentRoute.mode).toBe("add-feature");
    expect(pairAgentRoute.exit_code).toBe(0);
    expect(pairAgentRoute.recommended_command?.command).toBe("helix pair-agent plan");
    expect(pairAgentRoute.recommended_command?.args).toMatchObject({
      signal: "pair_agent_tdd implement with lightweight worker and smart reviewer",
      mode: "add-feature",
      pair_route: "smart_test_author_to_light_implementation_to_smart_review",
      requires_plan_id: true,
    });
    expect(pairAgentRoute.recommended_command?.safety).toMatchObject({
      auto_apply: false,
      requires_preflight: true,
      requires_human_approval: false,
    });
    expect(recommendedCommandV1Schema.safeParse(pairAgentRoute.recommended_command).success).toBe(
      true,
    );
    const pairAgentTextRoute = evaluateRouteCommand({ signal: "pair-agent TDD route" });
    expect(pairAgentTextRoute.mode).toBe("add-feature");
    expect(pairAgentTextRoute.recommended_command?.command).toBe("helix pair-agent plan");
    expect(pairAgentTextRoute.recommended_command?.args).toMatchObject({
      signal: "pair-agent TDD route",
      pair_route: "smart_test_author_to_light_implementation_to_smart_review",
      requires_plan_id: true,
    });
    const versionUpExternalRoute = evaluateRouteCommand({
      signal:
        "version_deferral Cloudflare HMAC webhook access control external infrastructure activation",
    });
    expect(versionUpExternalRoute.mode).toBe("version-up");
    expect(versionUpExternalRoute.exit_code).toBe(1);
    expect(versionUpExternalRoute.escalation_boundaries.map((b) => b.term)).toEqual(
      expect.arrayContaining(["hmac", "webhook", "access control", "external infrastructure"]),
    );
    expect(versionUpExternalRoute.approval.status).toBe("policy_missing");
    expect(versionUpExternalRoute.recommended_command?.safety.requires_human_approval).toBe(true);
    const legacyRuntimeName = ["ut", "tdd"].join("-");
    const legacyCommandRoute = evaluateRouteCommand({
      signal: "legacy override",
      route_map: [
        {
          tokens: ["legacy"],
          mode: "reverse",
          command: `${legacyRuntimeName} reverse`,
          preflight: true,
          requiresApproval: false,
        },
      ],
    });
    expect(legacyCommandRoute.exit_code).toBe(1);
    expect(legacyCommandRoute.recommended_command).toBeNull();
    expect(legacyCommandRoute.findings[0]?.code).toBe("legacy-runtime-command");
    const routeConfigViolations = validateRouteConfigText({
      path: ".helix/config/route-map.yaml",
      text: "source: legacy DB\nowner: C:\\Users\\micro\\legacy\n",
    });
    expect(routeConfigViolations.map((v) => v.code)).toEqual([
      "legacy-db-dependency",
      "personal-absolute-path",
    ]);
    const routeConfigBlocked = evaluateRouteCommand({
      signal: "reverse gap",
      route_config_violations: routeConfigViolations,
    });
    expect(routeConfigBlocked.exit_code).toBe(1);
    expect(routeConfigBlocked.recommended_command).toBeNull();
    const escalationBlocked = evaluateRouteCommand({
      signal: "feature_addition payment support",
    });
    expect(escalationBlocked.exit_code).toBe(1);
    expect(escalationBlocked.mode).toBe("add-feature");
    expect(escalationBlocked.escalation_boundaries.map((b) => b.term)).toContain("payment");
    expect(escalationBlocked.approval.status).toBe("policy_missing");
    expect(escalationBlocked.recommended_command?.safety.requires_human_approval).toBe(true);
    const escalationApproved = evaluateRouteCommand({
      signal: "feature_addition payment support",
      approval_policy: {
        rules: [{ mode: "*", condition: "escalation", required_approvers: ["po"] }],
        approvals: [
          {
            mode: "*",
            condition: "escalation",
            approver: "po",
            approved_at: "2026-06-23T00:00:00.000Z",
          },
        ],
      },
    });
    expect(escalationApproved.exit_code).toBe(0);
    expect(escalationApproved.approval.status).toBe("approved");
    expect(
      recordCrossCuttingEvent({
        type: "drift",
        subject_id: "PLAN-X",
        severity: "warn",
        evidence_path: "evidence.md",
      }).ok,
    ).toBe(true);
    const skillInjection: SidecarContractResult & {
      candidates: { skill_id: string; score: number; reason: string }[];
    } = suggestSkillInjection({
      task: "test doctor",
      layer: "L7",
      drive: "agent",
      catalog: [{ skill_id: "testing", triggers: ["test"], layers: ["L7"], drives: ["agent"] }],
    });
    expect(skillInjection.ok).toBe(true);
    expect(skillInjection.candidates[0]?.skill_id).toBe("testing");
    expect(
      enforceForwardOrder({
        layer: "L7",
        gate: "G7",
        prior_gates: [{ gate: "G6", status: "passed" }],
      }).allowed,
    ).toBe(true);
    expect(
      routeReverseR4({
        reverse_type: "gap",
        r4_evidence: { status: "confirmed", evidence_path: "r4.md" },
        forward_routing: "PLAN-L7-X",
      }).target_plan,
    ).toBe("PLAN-L7-X");
    expect(
      decideDiscoveryS4({
        hypothesis: "h",
        poc_evidence: { status: "verified", evidence_path: "poc.md" },
        outcome: "confirmed",
      }).decision,
    ).toBe("confirmed");
    expect(detectFrontendDrift({ token_root: "tokens" }).drift_signals).toContain(
      "absent:mock_root",
    );
    expect(
      routeScrumFullback({ increment: "INC-1", s4_decision: "confirmed" }).forward_targets,
    ).toEqual(["Forward:INC-1"]);
    expect(
      assertRefactorInvariant({
        before: "same",
        after: "same",
        regression: { exit_code: 0, evidence_path: "test.log", test_ids: ["U-FR-L1-25"] },
      }).unchanged,
    ).toBe(true);
    const refactorWithoutTestId = assertRefactorInvariant({
      before: "same",
      after: "same",
      regression: { exit_code: 0, evidence_path: "test.log" },
    });
    expect(refactorWithoutTestId.ok).toBe(false);
    expect(refactorWithoutTestId.findings.map((f) => f.code)).toContain("refactor-test-id-missing");
    expect(evaluateRetrofitMatrix({ migration: "m", config: "c", rollback: "r" }).readiness).toBe(
      "ready",
    );
    expect(
      evaluateResearchDecision({ memo: "m", sources: ["s"], adr_candidate: "ADR" }).decision_ready,
    ).toBe(true);
    expect(mergeTwoStageAgentDesign({ phase1: "a", phase2: "b", handoff: "c" }).merged).toContain(
      "a",
    );
    expect(
      validateScreenDesignWorkflow({
        ia: "i",
        screens: "s",
        flow: "f",
        wireframe: "w",
        mock: "m",
        components: "c",
      }).complete,
    ).toBe(true);
    expect(
      validateFrontendDesignWorkflow({
        visual: "v",
        tokens: "t",
        a11y: "a",
        vrt: "r",
        ux: "u",
      }).complete,
    ).toBe(true);
    const tddFits = classifyDriveTddFits({
      modes: ["design", "add-feature", "refactor", "screen-design", "frontend-design"],
    });
    expect(DRIVE_TDD_FITS.map((fit) => fit.mode)).toContain("design-bottomup");
    expect(tddFits.ok).toBe(true);
    expect(tddFits.fits.every((fit) => fit.compatibility === "strong")).toBe(true);
    expect(tddFits.fits.find((fit) => fit.mode === "design")?.red_triggers).toContain(
      "descent_obligation_missing",
    );
    expect(
      tddFits.fits.find((fit) => fit.mode === "frontend-design")?.green_requirements,
    ).toContain("vrt");
    expect(
      validateFolderRules({
        path: "docs/plans/PLAN.md",
        artifact_kind: "plan",
        registry: { plan: ["docs/plans/"] },
      }).violations,
    ).toEqual([]);
    expect(
      catalogExistingAssets({ roots: [{ path: "docs/skills/x.md", type: "skill" }] }).assets,
    ).toHaveLength(1);
    expect(
      prioritizeCapabilityGaps({
        assets: [{ asset_id: "a" }],
        workflow_impact: { roster: 3 },
        missing_routes: ["roster"],
      }).priorities[0]?.gap,
    ).toBe("roster");
    expect(
      renderFoundationReadiness({
        categories: [{ name: "db", implemented: true }, { name: "ui" }],
      }).missing,
    ).toEqual(["ui"]);
    expect(
      recommendModelEffort({
        task: "large uncertain",
        drive: "agent",
        layer: "L7",
        size: "L",
        uncertainty: 0.8,
      }).reasoning_effort,
    ).toBe("high");
    expect(classifyDrive({ plan: "PLAN db" }).drive).toBe("db");
    expect(
      resolveDriveStatePartition({
        drive: "db",
        mode: "Forward",
        kind: "impl",
        layer: "L7",
        plan_id: "PLAN-X",
      }).partition_path,
    ).toContain(".helix/drive/db/Forward/PLAN-X");
    const dbPartition = resolveDriveStatePartition({
      drive: "db",
      mode: "Forward",
      kind: "impl",
      layer: "L7",
      plan_id: "PLAN-DB",
    });
    const agentPartition = resolveDriveStatePartition({
      drive: "agent",
      mode: "Forward",
      kind: "impl",
      layer: "L7",
      plan_id: "PLAN-AGENT",
    });
    expect(
      validateDriveStatePartitions({
        partitions: [
          { drive: "db", partition_path: dbPartition.partition_path, artifact_ids: ["db-only"] },
          {
            drive: "agent",
            partition_path: agentPartition.partition_path,
            artifact_ids: ["agent-only"],
          },
        ],
      }).ok,
    ).toBe(true);
    const contaminated = validateDriveStatePartitions({
      partitions: [
        { drive: "db", partition_path: dbPartition.partition_path, artifact_ids: ["shared"] },
        {
          drive: "agent",
          partition_path: agentPartition.partition_path,
          artifact_ids: ["shared"],
        },
      ],
    });
    expect(contaminated.ok).toBe(false);
    expect(contaminated.findings.map((finding) => finding.code)).toContain(
      "cross-drive-artifact-contamination",
    );
    expect(
      validateDriveStatePartitions({
        allowed_cross_drive_artifacts: ["shared"],
        partitions: [
          { drive: "db", partition_path: dbPartition.partition_path, artifact_ids: ["shared"] },
          {
            drive: "agent",
            partition_path: agentPartition.partition_path,
            artifact_ids: ["shared"],
          },
        ],
      }).ok,
    ).toBe(true);
    expect(
      catalogSkills({ skill_docs: [{ path: "s.md", triggers: ["test"] }] }).skills,
    ).toHaveLength(1);
    expect(
      recommendSkills({
        task: "test",
        layer: "L7",
        drive: "agent",
        catalog: [{ skill_id: "testing", triggers: ["test"] }],
      }).recommendations,
    ).toHaveLength(1);
    expect(
      buildCommandCatalog({
        command_docs: [{ path: "docs/commands/db.md", command: "db status" }],
        cli_surface: ["db status"],
      }).ok,
    ).toBe(true);
  });
});
