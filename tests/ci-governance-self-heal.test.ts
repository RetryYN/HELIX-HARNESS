// PLAN-L7-423-ci-governance-self-heal
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  checkDependencyDrift,
  checkL6Completion,
  checkReviewEvidence,
  missingDraftApprovalHandoffViolations,
  requiresPublishedApprovalHandoff,
} from "../src/doctor/index";
import { nodeFeedbackLifecycleDeps as compatibilityNodeDeps } from "../src/feedback/lifecycle";
import { nodeFeedbackLifecycleDeps } from "../src/feedback/lifecycle-node";
import { analyzeDependencyDrift } from "../src/lint/dependency-drift";
import { analyzeReviewEvidence, type ParsedReviewPlan } from "../src/lint/review-evidence";
import { isSecretLike, SECRET_PATTERN } from "../src/security/secret-policy";
import {
  SECRET_PATTERN as STATE_DB_SECRET_PATTERN,
  isSecretLike as stateDbIsSecretLike,
} from "../src/state-db";

const technicalCommand = {
  kind: "unit_test",
  command: "bun test tests/ci-governance-self-heal.test.ts",
  runner: "bun",
  scope: "targeted",
  exit_code: 0,
  evidence_path: "tests/ci-governance-self-heal.test.ts",
  output_digest: `sha256:${"0".repeat(64)}`,
  completed_at: "2026-07-11",
};

function reviewPlan(entries: ParsedReviewPlan["crossEntries"]): ParsedReviewPlan {
  return {
    file: "fixture.md",
    plan_id: "PLAN-L7-999-review-fixture",
    kind: "impl",
    status: "confirmed",
    updated: "2026-07-11",
    hasEvidence: true,
    crossEntries: entries,
  };
}

describe("CI governance self-heal", () => {
  it("U-CISELF-001: 解消済みdependency cycleはgrandfatherなしで復活を拒否する", () => {
    const result = checkDependencyDrift(process.cwd());
    expect(result.ok, result.messages.join("\n")).toBe(true);
    expect(result.result?.findings.some((finding) => finding.severity === "error")).toBe(false);
    const source = readFileSync("src/lint/dependency-drift.ts", "utf8");
    for (const removed of [
      "export -> lint -> state-db -> export",
      "export -> lint -> workflow -> state-db -> export",
      "graph -> lint -> state-db -> graph",
      "graph -> lint -> workflow -> state-db -> graph",
      "graph -> vmodel -> lint -> state-db -> graph",
      "graph -> vmodel -> lint -> workflow -> state-db -> graph",
      "graph -> vmodel -> plan -> lint -> state-db -> graph",
      "graph -> vmodel -> plan -> lint -> workflow -> state-db -> graph",
      "lint -> state-db -> lint",
      "lint -> workflow -> state-db -> lint",
    ]) {
      expect(source).not.toContain(`"${removed}"`);
    }
    const resurrected = analyzeDependencyDrift({
      sourceDocs: [
        { path: "src/lint/a.ts", text: 'import "../state-db/b";' },
        { path: "src/state-db/b.ts", text: 'import "../lint/a";' },
      ],
      testDocs: [],
    });
    expect(resurrected.findings).toContainEqual(
      expect.objectContaining({ code: "module-cycle", severity: "error" }),
    );
  });

  it("U-CISELF-002: feedback lifecycle旧importとNode adapterを互換維持する", () => {
    expect(compatibilityNodeDeps).toBe(nodeFeedbackLifecycleDeps);
  });

  it("U-CISELF-003: secret policyはstate-db互換面と同一SSoTを共有する", () => {
    expect(STATE_DB_SECRET_PATTERN).toBe(SECRET_PATTERN);
    expect(stateDbIsSecretLike).toBe(isSecretLike);
  });

  it("U-CISELF-004: human-only approvalは技術green command gateを迂回できない", () => {
    const human = {
      review_kind: "human",
      verdict: "approve",
      reviewed_at: "2026-07-11",
      tests_green_at: "2026-07-11",
    };
    expect(analyzeReviewEvidence([reviewPlan([human])]).ok).toBe(false);
    expect(
      analyzeReviewEvidence([
        reviewPlan([
          human,
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-07-11",
            tests_green_at: "2026-07-11",
            green_commands: [technicalCommand],
          },
        ]),
      ]).ok,
    ).toBe(true);
  });

  it("U-CISELF-005: L6全docはL8から逆traceされ、設計中draftはfreeze未完了として可視化する", () => {
    const result = checkL6Completion(process.cwd());
    expect(result.ok, result.messages.join("\n")).toBe(true);
  });

  it("U-CISELF-006: 実repoのreview evidenceは技術検証と判断を分離してgreen", () => {
    const result = checkReviewEvidence(process.cwd());
    expect(result.ok, result.messages.join("\n")).toBe(true);
  });

  it("U-CISELF-007: projectionはpure policy、CLIはNode adapterを直接参照する", () => {
    expect(readFileSync("src/state-db/projection-writer.ts", "utf8")).toContain(
      'from "../policy/feedback-lifecycle"',
    );
    expect(readFileSync("src/cli.ts", "utf8")).toContain('from "./feedback/lifecycle-node"');
  });

  it("U-CISELF-008: fresh cloneのdecision draft未生成はapproval hard violationにしない", () => {
    const missingDraft = {
      effective_phase: "approval",
      reason_codes: ["handoff.status.approval_required", "handoff.decision_draft.missing"],
      status: "approval_required",
      handoff_missing: 1,
      handoff_present: 0,
      approval_state: "missing",
      approval_status: "missing",
      scope_status: "not_checked",
      approval_scope_digest: null,
      expected_approval_scope_digest: null,
      decision_id: null,
      reviewed_candidate_count: null,
      valid_for_apply: false,
      command:
        "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out draft.yml --summary-json",
    } as const;
    expect(
      requiresPublishedApprovalHandoff({
        effective_phase: missingDraft.effective_phase,
        reason_codes: missingDraft.reason_codes,
      }),
    ).toBe(false);
    expect(missingDraftApprovalHandoffViolations(missingDraft)).toEqual([]);
    for (const unsafe of [
      { ...missingDraft, valid_for_apply: true },
      { ...missingDraft, handoff_present: 1 },
      {
        ...missingDraft,
        reason_codes: [...missingDraft.reason_codes, "handoff.decision_draft.present"],
      },
      { ...missingDraft, status: "approval_pending" },
      { ...missingDraft, approval_status: "approved" },
      { ...missingDraft, scope_status: "match" },
      { ...missingDraft, approval_scope_digest: `sha256:${"0".repeat(64)}` },
      { ...missingDraft, reviewed_candidate_count: 1 },
      { ...missingDraft, command: "helix closure review-bundle --action close_ready" },
    ]) {
      expect(missingDraftApprovalHandoffViolations(unsafe).length).toBeGreaterThan(0);
    }
    expect(
      requiresPublishedApprovalHandoff({
        effective_phase: "approval",
        reason_codes: ["handoff.status.approval_pending", "handoff.decision_draft.present"],
      }),
    ).toBe(true);
    expect(
      requiresPublishedApprovalHandoff({
        effective_phase: "machine",
        reason_codes: ["handoff.decision_draft.missing"],
      }),
    ).toBe(false);
  });
});
