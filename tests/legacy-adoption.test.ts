import { describe, expect, it } from "vitest";
import {
  analyzeRunDebugTrace,
  buildAgentRolePolicyDecision,
  buildContinuousRunControlDecision,
  buildCoreInjectionContract,
  buildLearningFeedbackDecision,
  buildRecommendationDecision,
  buildWorkPreflightDecision,
  classifyLegacyDbSurface,
  classifyLegacyHookSurface,
  classifyTechnicalQuestion,
  mapWorkflowInventoryToPillar,
  registerDetectorAxis,
  routeDetectorFinding,
} from "../src/runtime/legacy-adoption";

describe("old HELIX semantic adoption decisions (U-HLX)", () => {
  it("U-HLX-001: buildWorkPreflightDecision blocks missing source/scope and escalates high-impact work", () => {
    expect(
      buildWorkPreflightDecision({
        objective: "lower old HELIX adoption",
        workflow_layer: "L7",
        forward_return: "L6 contract",
        acceptance_verification: "U-HLX",
        work_source: "docs/design/helix/L6-function-design/legacy-helix-extension.md",
        allowed_scope: ["src/runtime/legacy-adoption.ts"],
      }),
    ).toEqual({ kind: "allow", findings: [] });
    expect(buildWorkPreflightDecision({ objective: "x", allowed_scope: [] })).toMatchObject({
      kind: "blocker",
      findings: expect.arrayContaining(["missing_work_source", "missing_allowed_scope"]),
    });
    expect(
      buildWorkPreflightDecision({
        objective: "prod auth change",
        high_impact_unapproved: true,
      }),
    ).toMatchObject({ kind: "escalate" });
  });

  it("U-HLX-002: classifyTechnicalQuestion denies technical questions without TL evidence", () => {
    expect(
      classifyTechnicalQuestion({
        question_text: "Should we change the DB schema contract?",
      }),
    ).toMatchObject({ kind: "deny", question_class: "technical" });
    expect(
      classifyTechnicalQuestion({
        question_text: "Should we change the DB schema contract?",
        tl_advisor_evidence: "review-evidence:tl",
      }),
    ).toMatchObject({ kind: "allow" });
    expect(
      classifyTechnicalQuestion({
        question_text: "Which label tone do you prefer?",
        question_class: "preference",
        bypass_reason: "user wording preference",
      }),
    ).toMatchObject({ kind: "bypass_allowed" });
  });

  it("U-HLX-003: registerDetectorAxis requires routeable axis metadata", () => {
    expect(
      registerDetectorAxis({
        axis_id: "drift",
        phase_gate: "G-DESIGN",
        kind: "fail_close",
        severity: "error",
        workflow_route: "reverse",
      }),
    ).toMatchObject({ ok: true, findings: [] });
    expect(registerDetectorAxis({ axis_id: "drift" })).toMatchObject({
      ok: false,
      findings: expect.arrayContaining(["missing_workflow_route"]),
    });
  });

  it("U-HLX-004: routeDetectorFinding rejects stub/advisory findings as hard gate proof", () => {
    const registry = {
      axes: [
        {
          axis_id: "coverage",
          phase_gate: "G-PAIR",
          kind: "advisory" as const,
          severity: "warn",
          workflow_route: "repair",
        },
      ],
    };
    expect(
      routeDetectorFinding(
        { axis_id: "coverage", kind: "advisory", use_as_hard_gate_proof: true },
        registry,
      ),
    ).toMatchObject({ kind: "reject" });
    expect(routeDetectorFinding({ axis_id: "coverage", kind: "advisory" }, registry)).toEqual({
      kind: "route",
      route: "repair",
      reason: "advisory",
    });
    expect(
      routeDetectorFinding(
        { axis_id: "coverage", kind: "fail_close", use_as_hard_gate_proof: true },
        registry,
      ),
    ).toEqual({
      kind: "reject",
      route: null,
      reason: "detector_kind_mismatch:advisory!=fail_close",
    });
  });

  it("U-HLX-005: buildRecommendationDecision emits traceable candidates and hardens legacy paths", () => {
    expect(
      buildRecommendationDecision({
        candidate: "docs/skills/qa/SKILL.md",
        score: 0.9,
        reason: "matches QA phase",
        references: ["docs/design/helix/L6-function-design/legacy-helix-extension.md"],
        recommended_role: "qa",
      }),
    ).toEqual({ kind: "adopt_candidate", reason: "traceable_candidate" });
    expect(
      buildRecommendationDecision({
        candidate: "~/ai-dev-kit-vscode/cli/helix-run",
        score: 0.9,
        reason: "legacy command",
        references: ["legacy"],
        recommended_role: "se",
      }),
    ).toMatchObject({ kind: "harden_required" });
  });

  it("U-HLX-006: analyzeRunDebugTrace keeps incomplete traces from closing L7.5 acceptance", () => {
    expect(
      analyzeRunDebugTrace({
        expected_actions: ["adapter-start", "adapter-stop"],
        observed_evidence: ["adapter-start", "adapter-stop"],
        runtime_surface: "ut-tdd-cli",
        correlation_id: "corr-1",
        evidence_path: ".ut-tdd/evidence/run-debug/session.jsonl",
      }),
    ).toMatchObject({ kind: "complete", runtime_surface: "ut-tdd-cli", missing_actions: [] });
    expect(
      analyzeRunDebugTrace({
        expected_actions: ["adapter-start", "adapter-stop"],
        observed_evidence: ["adapter-start"],
        runtime_surface: "ut-tdd-cli",
        correlation_id: "corr-1",
        evidence_path: ".ut-tdd/evidence/run-debug/session.jsonl",
      }),
    ).toMatchObject({ kind: "incomplete", missing_actions: ["adapter-stop"] });
  });

  it("U-HLX-007: buildCoreInjectionContract rejects personal/global paths as current truth", () => {
    expect(
      buildCoreInjectionContract({
        repo_local_source: "docs/templates/adapter/AGENTS.md",
        generated_target: ".codex/AGENTS.md",
        consumer_mode: "codex",
        required_marker: "UT-TDD:managed",
        provenance: "HELIX-HARNESS",
      }),
    ).toMatchObject({ disposition: "adopt" });
    expect(
      buildCoreInjectionContract({
        repo_local_source: "~/ai-dev-kit-vscode/helix/HELIX_CORE.md",
        generated_target: ".codex/AGENTS.md",
        consumer_mode: "codex",
        required_marker: "UT-TDD:managed",
        provenance: "legacy",
      }),
    ).toMatchObject({ disposition: "reject" });
  });

  it("U-HLX-008: classifyLegacyHookSurface records wired/deferred/rejected guard states", () => {
    expect(
      classifyLegacyHookSurface({
        hook_source: ".claude/hooks/work-guard.ts",
        runtime_surface: "codex-hook",
        tool_matcher: "apply_patch|write_file",
        guard_intent: "foreign-edit",
        parity_target: ".codex/hooks.json",
        test_oracle: "U-CODEXHOOK-001",
        wired: true,
      }),
    ).toMatchObject({ state: "wired", runtime_surface: "codex-hook" });
    expect(
      classifyLegacyHookSurface({
        hook_source: ".claude/hooks/agent-guard.ts",
        runtime_surface: "codex-hook",
        tool_matcher: "spawn_agent",
        guard_intent: "agent guard",
        parity_target: ".codex/hooks.json",
        test_oracle: "U-HLX-008",
        wired: false,
      }),
    ).toMatchObject({ state: "deferred" });
  });

  it("U-HLX-009: buildAgentRolePolicyDecision denies self-review and unbounded delegation", () => {
    expect(
      buildAgentRolePolicyDecision({
        role_kind: "qa",
        model_family: "sonnet",
        slot: "reviewer",
        delegation_boundary: "read-only review",
        review_substitute: "intra_runtime_subagent",
      }),
    ).toEqual({ kind: "allow", reason: "bounded_role_policy" });
    expect(
      buildAgentRolePolicyDecision({
        role_kind: "worker",
        model_family: "opus",
        slot: "worker",
        delegation_boundary: "self",
        review_substitute: "self",
        self_review: true,
      }),
    ).toMatchObject({ kind: "deny" });
  });

  it("U-HLX-010: mapWorkflowInventoryToPillar does not auto-route unknown workflows", () => {
    expect(
      mapWorkflowInventoryToPillar({
        workflow_doc: "HELIX-workflows/helix-process/forward.md",
        trigger: "plan",
        pillar: "HB-P1",
        workflow_mode: "forward",
        gate: "G-DESIGN",
        current_owner: "HELIX-HARNESS",
        known_workflow: true,
      }),
    ).toMatchObject({ disposition: "existing_pillar_covered" });
    expect(
      mapWorkflowInventoryToPillar({
        workflow_doc: "HELIX-workflows/helix-process/new-mode.md",
        known_workflow: false,
      }),
    ).toEqual({ disposition: "new_plan_required", reason: "unknown_workflow" });
  });

  it("U-HLX-011: classifyLegacyDbSurface rejects raw legacy state import", () => {
    expect(
      classifyLegacyDbSurface({
        source: "cli/lib/helix_db.py",
        state_kind: "projection",
        projection_target: "harness.db",
        read_model: "artifact_progress",
        api_boundary: "read-only",
        provenance: "legacy-source",
      }),
    ).toEqual({ disposition: "adopt", reason: "projected_read_model_with_provenance" });
    expect(classifyLegacyDbSurface({ raw_state_import: true })).toEqual({
      disposition: "reject",
      reason: "raw_legacy_state_import",
    });
  });

  it("U-HLX-012: buildContinuousRunControlDecision requires stop condition and budget evidence", () => {
    expect(
      buildContinuousRunControlDecision({
        trigger: "heartbeat",
        queue_lock: "job-1",
        timebox: "10m",
        budget_profile: "default",
        stop_condition: "canResume=false",
        verification_evidence: "runtime-verification.jsonl",
        auto_run: true,
      }),
    ).toEqual({ kind: "allow", reason: "bounded_continuous_run" });
    expect(
      buildContinuousRunControlDecision({
        trigger: "heartbeat",
        auto_run: true,
      }),
    ).toEqual({ kind: "deny", reason: "auto_run_without_stop_condition" });
  });

  it("U-HLX-013: buildLearningFeedbackDecision cannot close acceptance from learning output alone", () => {
    expect(
      buildLearningFeedbackDecision({
        event_source: "feedback_events",
        recipe_source: "recipe",
        learning_result: "improve skill routing",
        target_backlog: "IMP-200",
        evidence_link: "tests/legacy-adoption.test.ts",
        review_state: "tl_reviewed",
      }),
    ).toEqual({ kind: "adopt_candidate", reason: "reviewed_improvement_candidate" });
    expect(
      buildLearningFeedbackDecision({
        event_source: "feedback_events",
        closes_acceptance: true,
      }),
    ).toEqual({ kind: "reject", reason: "learning_result_cannot_close_acceptance" });
  });
});
