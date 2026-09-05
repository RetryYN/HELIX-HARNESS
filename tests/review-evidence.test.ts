import { describe, expect, it } from "vitest";
import {
  analyzeReviewEvidence,
  BUN_HISTORICAL_RECEIPT_INVENTORY_DIGEST,
  bunHistoricalReceiptInventoryDigest,
  extractReviewEntries,
  type GitPlanDateProvenance,
  hasReviewEvidence,
  isNonSemanticL3MetadataMigrationLine,
  L3_HUMAN_APPROVAL_ENFORCEMENT_DATE,
  type L3HumanApproval,
  loadReviewerSessionModelHistory,
  loadReviewPlans,
  type ParsedReviewPlan,
  parseReviewerSessionModelHistory,
  parseReviewPlan,
  REVIEWER_SESSION_ENFORCEMENT_DATE,
  REVIEWER_SESSION_MODEL_HISTORY_PATH,
  REVIEWER_SESSION_MODEL_HISTORY_SCHEMA,
  type ReviewEntry,
  readGitPlanDateProvenance,
  reviewerModelAt,
} from "../src/lint/review-evidence";
import { checkCrossAgentModelPair, modelProviderFromId } from "../src/schema";

/** review-evidence lint (IMP-071 presence + IMP-076 cross-review semantic) — review 前置証跡の機械強制。 */

const plan = (o: Partial<ParsedReviewPlan>): ParsedReviewPlan => ({
  file: "x.md",
  plan_id: "PLAN-X",
  kind: "design",
  layer: "unknown",
  status: "confirmed",
  updated: "2026-06-05",
  created: "2026-06-05",
  hasEvidence: false,
  crossEntries: [],
  l3HumanApprovalInvalid: false,
  ...o,
});

const technicalCommand = {
  kind: "unit_test",
  command: "npx --no-install vitest run tests/review-evidence.test.ts",
  runner: "node",
  scope: "targeted",
  exit_code: 0,
  evidence_path: "tests/review-evidence.test.ts",
  output_digest: `sha256:${"0".repeat(64)}`,
  completed_at: "2026-06-23",
};

const l3Approval = (planId: string): L3HumanApproval => ({
  schema_version: "helix-l3-human-approval.v1",
  approval_kind: "human_po",
  decision: "approve",
  approver: "RetryYN",
  approved_at: "2026-08-27T12:00:00Z",
  plan_id: planId,
  approval_record_id: "L3-PO-1097-001",
  approval_source: "github_issue_comment",
  approval_source_url:
    "https://github.com/RetryYN/HELIX-HARNESS/issues/1097#issuecomment-1234567890",
});

const technicalReview = (): ReviewEntry => ({
  reviewer: "independent-reviewer",
  review_kind: "cross_agent",
  reviewed_at: "2026-06-23T00:00:01Z",
  tests_green_at: "2026-06-23T00:00:00Z",
  verdict: "approve",
  worker_model: "gpt-5.4-codex",
  reviewer_model: "claude-opus-5",
  green_commands: [technicalCommand],
});

describe("green command evidence (IMP-108)", () => {
  it("pins every pre-retirement Bun receipt by semantic content, not a backdatable timestamp", () => {
    const plans = loadReviewPlans();
    expect(bunHistoricalReceiptInventoryDigest(plans)).toBe(
      BUN_HISTORICAL_RECEIPT_INVENTORY_DIGEST,
    );
    const bunPlan = plans.find((candidate) =>
      candidate.crossEntries.some((entry) =>
        entry.green_commands?.some((command) => command.runner === "bun"),
      ),
    );
    expect(bunPlan).toBeDefined();
    const changed = structuredClone(plans);
    const changedPlan = changed.find((candidate) => candidate.plan_id === bunPlan?.plan_id)!;
    const changedCommand = changedPlan.crossEntries
      .flatMap((entry) => entry.green_commands ?? [])
      .find((command) => command.runner === "bun")!;
    changedCommand.completed_at = "2020-01-01T00:00:00Z";
    expect(analyzeReviewEvidence(changed).greenCommandViolations).toContainEqual({
      plan_id: "BUN-HISTORICAL-RECEIPT-INVENTORY",
      reason: "retired_bun_receipt_inventory_drift",
    });

    const changedEnvelope = structuredClone(plans);
    const envelopePlan = changedEnvelope.find(
      (candidate) => candidate.plan_id === bunPlan?.plan_id,
    )!;
    const envelopeEntry = envelopePlan.crossEntries.find((entry) =>
      entry.green_commands?.some((command) => command.runner === "bun"),
    )!;
    envelopeEntry.reviewer = `${envelopeEntry.reviewer ?? "unknown"}-forged`;
    expect(analyzeReviewEvidence(changedEnvelope).greenCommandViolations).toContainEqual({
      plan_id: "BUN-HISTORICAL-RECEIPT-INVENTORY",
      reason: "retired_bun_receipt_inventory_drift",
    });
  });

  it("U-GREENDEF-000: retirement前のBun receiptは不変保持し、retirement後の新規Bun evidenceは拒否する", () => {
    const historical = analyzeReviewEvidence([
      plan({
        updated: "2026-07-18",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-07-18T12:00:00Z",
            tests_green_at: "2026-07-18T12:00:00Z",
            green_commands: [
              {
                ...technicalCommand,
                command: "bun test tests/review-evidence.test.ts",
                runner: "bun",
                completed_at: "2026-07-18T12:00:00Z",
              },
            ],
          },
        ],
      }),
    ]);
    expect(historical.greenCommandViolations).toEqual([]);

    const newEvidence = analyzeReviewEvidence([
      plan({
        updated: "2026-07-19",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-07-20T12:00:00+09:00",
            tests_green_at: "2026-07-20T12:00:00+09:00",
            green_commands: [
              {
                ...technicalCommand,
                command: "bun test tests/review-evidence.test.ts",
                runner: "bun",
                completed_at: "2026-07-20T12:00:00+09:00",
              },
            ],
          },
        ],
      }),
    ]);
    expect(newEvidence.greenCommandViolations).toEqual([
      { plan_id: "PLAN-X", reason: "retired_bun_runner" },
    ]);
  });

  it("U-GREENDEF-001: legacy timestamp-only review evidence remains valid before enforcement", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-LEGACY-GREEN",
        updated: "2026-06-22",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            reviewed_at: "2026-06-22",
            tests_green_at: "2026-06-22",
          },
        ],
      }),
    ]);

    expect(r.greenCommandViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-GREENDEF-002: new confirmed review evidence requires green_commands", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-NEW-GREEN-MISSING",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
          },
        ],
      }),
    ]);

    expect(r.greenCommandViolations).toEqual([
      { plan_id: "PLAN-NEW-GREEN-MISSING", reason: "missing_green_commands" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-GREENDEF-002b: human判断は別の技術greenがある場合だけcommand重複を免除する", () => {
    const result = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-NON-TECHNICAL-REVIEW",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "fail",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
          },
          {
            review_kind: "human",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
          },
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
            green_commands: [
              {
                kind: "unit_test",
                command: "npx --no-install vitest run tests/review-evidence.test.ts",
                runner: "node",
                scope: "targeted",
                exit_code: 0,
                evidence_path: "tests/review-evidence.test.ts",
                output_digest:
                  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                completed_at: "2026-06-23",
              },
            ],
          },
        ],
      }),
    ]);

    expect(result.greenCommandViolations).toEqual([]);
    expect(result.ok).toBe(true);

    const humanOnly = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-HUMAN-ONLY-BYPASS",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "human",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
          },
        ],
      }),
    ]);
    expect(humanOnly.greenCommandViolations).toEqual([
      { plan_id: "PLAN-HUMAN-ONLY-BYPASS", reason: "missing_green_commands" },
    ]);
    expect(humanOnly.ok).toBe(false);

    for (const verdict of ["reject", "request_changes", "unknown", undefined]) {
      const planId = `PLAN-NON-APPROVAL-${verdict ?? "missing"}`;
      const rejectedTechnical = analyzeReviewEvidence([
        plan({
          plan_id: planId,
          updated: "2026-06-23",
          hasEvidence: true,
          crossEntries: [
            {
              review_kind: "human",
              verdict: "approve",
              reviewed_at: "2026-06-23",
              tests_green_at: "2026-06-23",
            },
            {
              review_kind: "intra_runtime_subagent",
              ...(verdict ? { verdict } : {}),
              reviewed_at: "2026-06-23",
              tests_green_at: "2026-06-23",
              green_commands: [technicalCommand],
            },
          ],
        }),
      ]);
      expect(rejectedTechnical.greenCommandViolations).toContainEqual({
        plan_id: planId,
        reason: "missing_green_commands",
      });
      expect(rejectedTechnical.ok).toBe(false);
    }

    for (const verdict of ["fail", "reject", "request_changes"]) {
      const result = analyzeReviewEvidence([
        plan({
          plan_id: `PLAN-${verdict.toUpperCase()}-ONLY`,
          updated: "2026-06-23",
          hasEvidence: true,
          crossEntries: [
            {
              review_kind: "intra_runtime_subagent",
              verdict,
              reviewed_at: "2026-06-23",
              tests_green_at: "2026-06-23",
              ...(verdict === "fail" ? {} : { green_commands: [technicalCommand] }),
            },
          ],
        }),
      ]);
      expect(result.greenCommandViolations[0]?.reason).toBe("missing_technical_approval");
      expect(result.ok).toBe(false);
    }

    const failThenApprove = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-FAIL-THEN-APPROVE",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "fail",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
          },
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve_after_fixes",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
            green_commands: [technicalCommand],
          },
        ],
      }),
    ]);
    expect(failThenApprove.greenCommandViolations).toEqual([]);
    expect(failThenApprove.ok).toBe(true);
  });

  it("U-GREENDEF-003: new confirmed review evidence accepts structured green command evidence", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-NEW-GREEN-OK",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
            green_commands: [
              {
                kind: "unit_test",
                command: "npx --no-install vitest run tests/review-evidence.test.ts",
                runner: "node",
                scope: "targeted",
                exit_code: 0,
                evidence_path: "tests/review-evidence.test.ts",
                output_digest:
                  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                completed_at: "2026-06-23",
              },
            ],
          },
        ],
      }),
    ]);

    expect(r.greenCommandViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-GREENDEF-004: nonzero green command exit code fails", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-NEW-GREEN-BAD",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
            green_commands: [
              {
                kind: "doctor",
                command: "npx --no-install tsx src/cli.ts doctor",
                runner: "node",
                scope: "gate",
                exit_code: 1,
                evidence_path: "docs/plans/PLAN-L7-108-review-green-command-evidence.md",
                output_digest:
                  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                completed_at: "2026-06-23",
              },
            ],
          },
        ],
      }),
    ]);

    expect(r.greenCommandViolations).toEqual([
      { plan_id: "PLAN-NEW-GREEN-BAD", reason: "nonzero_exit_code" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-GREENDEF-005: green command kind must match the command text", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-NEW-GREEN-KIND-MISMATCH",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
            green_commands: [
              {
                kind: "doctor",
                command: "npm run lint",
                runner: "node",
                scope: "gate",
                exit_code: 0,
                evidence_path: "docs/plans/PLAN-L7-108-review-green-command-evidence.md",
                output_digest:
                  "sha256:0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
                completed_at: "2026-06-23",
              },
            ],
          },
        ],
      }),
    ]);

    expect(r.greenCommandViolations).toEqual([
      { plan_id: "PLAN-NEW-GREEN-KIND-MISMATCH", reason: "command_kind_mismatch" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-GREENDEF-006: green command output digest must be full sha256", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-NEW-GREEN-SHORT-DIGEST",
        updated: "2026-06-23",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-06-23",
            tests_green_at: "2026-06-23",
            green_commands: [
              {
                kind: "doctor",
                command: "npx --no-install tsx src/cli.ts doctor",
                runner: "node",
                scope: "gate",
                exit_code: 0,
                evidence_path: "docs/plans/PLAN-L7-108-review-green-command-evidence.md",
                output_digest: "sha256:0123456789abcdef",
                completed_at: "2026-06-23",
              },
            ],
          },
        ],
      }),
    ]);

    expect(r.greenCommandViolations).toEqual([
      { plan_id: "PLAN-NEW-GREEN-SHORT-DIGEST", reason: "invalid_output_digest" },
    ]);
    expect(r.ok).toBe(false);
  });
});

describe("stale approval cleanup (IMP-080)", () => {
  it("U-REVIEW-007: draft + verdict=approve は stale approval violation", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-DRAFT-APPROVE",
        status: "draft",
        hasEvidence: true,
        crossEntries: [{ review_kind: "intra_runtime_subagent", verdict: "approve" }],
      }),
    ]);
    expect(r.staleApprovalViolations).toEqual([
      { plan_id: "PLAN-DRAFT-APPROVE", reason: "draft_with_approval" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-REVIEW-008: confirmed + approve / draft + 証跡なし は stale approval ではない", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-CONFIRMED-APPROVE",
        status: "confirmed",
        hasEvidence: true,
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            verdict: "approve",
            reviewed_at: "2026-06-08",
            tests_green_at: "2026-06-08",
          },
        ],
      }),
      plan({ plan_id: "PLAN-DRAFT-NONE", status: "draft", hasEvidence: false, crossEntries: [] }),
    ]);
    expect(r.staleApprovalViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });
});

describe("review-evidence lint (review 前置の機械強制、IMP-071)", () => {
  it("U-REVIEW-001: hasReviewEvidence — review_evidence ブロック (≥1 entry) を presence 検出", () => {
    const withEv = `---\nplan_id: PLAN-A\nstatus: confirmed\nreview_evidence:\n  - reviewer: code-reviewer\n    review_kind: intra_runtime_subagent\n    reviewed_at: "2026-06-05"\n    verdict: approve\n---\n`;
    const withoutEv = `---\nplan_id: PLAN-B\nstatus: confirmed\nv2_import: x\n---\n`;
    const emptyKey = `---\nplan_id: PLAN-C\nstatus: confirmed\nreview_evidence:\n---\n`; // key だけ、entry なし
    const bodyOnly = `---\nplan_id: PLAN-D\nstatus: confirmed\n---\n\nreview_evidence:\n  - reviewer: forged-body-example\n`;
    expect(hasReviewEvidence(withEv)).toBe(true);
    expect(hasReviewEvidence(withoutEv)).toBe(false);
    expect(hasReviewEvidence(emptyKey)).toBe(false);
    expect(hasReviewEvidence(bodyOnly)).toBe(false);
  });

  it("U-REVIEW-002: parseReviewPlan — plan_id/kind/status/hasEvidence を抽出", () => {
    const content = `---\nplan_id: PLAN-L4-05-workflow-orchestration\nkind: add-design\nstatus: confirmed\nreview_evidence:\n  - reviewer: code-reviewer\n    review_kind: intra_runtime_subagent\n    reviewed_at: "2026-06-05"\n    verdict: approve\n---\n`;
    const p = parseReviewPlan("PLAN-L4-05-workflow-orchestration.md", content);
    expect(p.kind).toBe("add-design");
    expect(p.status).toBe("confirmed");
    expect(p.hasEvidence).toBe(true);
  });

  it("U-REVIEW-003: confirmed の design/impl 系で evidence 無し → missing + ok=false", () => {
    const r = analyzeReviewEvidence([
      plan({ plan_id: "PLAN-L4-09-x", kind: "design", hasEvidence: false }),
    ]);
    expect(r.missing).toEqual([{ plan_id: "PLAN-L4-09-x", kind: "design" }]);
    expect(r.ok).toBe(false);
  });

  it("U-REVIEW-004: evidence あり → missing 0 / ok=true (add-design/add-impl/impl 全 kind)", () => {
    const r = analyzeReviewEvidence([
      plan({ plan_id: "PLAN-D", kind: "design", hasEvidence: true }),
      plan({ plan_id: "PLAN-AD", kind: "add-design", hasEvidence: true }),
      plan({ plan_id: "PLAN-I", kind: "impl", hasEvidence: true }),
      plan({ plan_id: "PLAN-AI", kind: "add-impl", hasEvidence: true }),
    ]);
    expect(r.missing).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-REVIEW-005: 対象外 — draft (未確定) / 非 design-impl kind (poc/charter/reverse) は missing にしない", () => {
    const r = analyzeReviewEvidence([
      plan({ plan_id: "PLAN-DRAFT", kind: "design", status: "draft", hasEvidence: false }),
      plan({ plan_id: "PLAN-POC", kind: "poc", status: "confirmed", hasEvidence: false }),
      plan({ plan_id: "PLAN-CHARTER", kind: "charter", status: "confirmed", hasEvidence: false }),
      plan({ plan_id: "PLAN-REV", kind: "reverse", status: "confirmed", hasEvidence: false }),
      plan({ plan_id: "PLAN-ARCH", kind: "design", status: "archived", hasEvidence: false }),
    ]);
    expect(r.missing).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-REVIEW-006: 実 repo CI fail-close ガード — confirmed design/impl PLAN は全件 review_evidence あり (missing 0)", () => {
    // hard 化 (IMP-071 2026-06-05): 履歴 15 件 back-fill 完了後、missing==[] を CI で課す。
    // 以後 confirmed design/impl PLAN を review 証跡なしで足すと本テストが red → CI fail-close
    // (backfill U-BACKFILL-006 / scrum-reverse U-SCRUMREV-005 と同パターンの実 repo 回帰ガード)。
    const r = analyzeReviewEvidence(loadReviewPlans());
    expect(r.missing).toEqual([]);
    expect(r.crossReviewViolations).toEqual([]); // 実 repo に cross_agent entry は無い (claude-only solo) → 違反0
    expect(r.testBeforeReviewViolations).toEqual([]); // 全 review_evidence entry に tests_green_at ≤ reviewed_at (IMP-077 back-fill 済)
    // r.ok は green_commands の鮮度 audit も含むため、この fail-close ガードは
    // review_evidence presence / cross-review / test-before-review の対象 facet に限定して固定する。
    expect(
      r.missing.length + r.crossReviewViolations.length + r.testBeforeReviewViolations.length,
    ).toBe(0);
    // confirmed かつ review_evidence ありの代表 PLAN が missing に出ないことも明示 (draft 除外と混同しない)。
    const missingIds = new Set(r.missing.map((m) => m.plan_id));
    expect(missingIds.has("PLAN-L4-05-workflow-orchestration")).toBe(false);
    expect(missingIds.has("PLAN-L7-13-review-evidence")).toBe(false);
  });
});

describe("L3 typed PO approval gate (Issue #1097)", () => {
  it("U-L3APP-014: typed supersession metadataだけの後方適用はL3要求意味変更へ昇格しない", () => {
    expect(
      isNonSemanticL3MetadataMigrationLine(
        "superseded_by: [PLAN-L3-15-requirements-authority-chain-remediation]",
      ),
    ).toBe(true);
    expect(isNonSemanticL3MetadataMigrationLine("supersession_metadata_only: true")).toBe(true);
    expect(isNonSemanticL3MetadataMigrationLine("status: confirmed")).toBe(false);
    expect(isNonSemanticL3MetadataMigrationLine("title: changed requirement meaning")).toBe(false);
  });

  // PLAN-L7-687-l3-human-approval-gate と PLAN-L7-688-l3-human-approval-git-provenance の
  // verification_bindings がこの test file を所有する。
  it("U-L3APP-001: AI technical reviewだけでは基準日以降のL3 terminal化を許可しない", () => {
    const planId = "PLAN-L3-90-l3-human-approval-gate";
    const result = analyzeReviewEvidence([
      plan({
        plan_id: planId,
        layer: "L3",
        status: "confirmed",
        updated: L3_HUMAN_APPROVAL_ENFORCEMENT_DATE,
        kind: "design",
        hasEvidence: true,
        crossEntries: [technicalReview()],
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([
      { plan_id: planId, reason: "missing_human_po_approval" },
    ]);
    expect(result.ok).toBe(false);
  });

  it("U-L3APP-002: review_kind=humanを混ぜてもtyped PO approvalの代替にはならない", () => {
    const planId = "PLAN-L3-91-l3-human-approval-gate";
    const result = analyzeReviewEvidence([
      plan({
        plan_id: planId,
        layer: "L3",
        status: "completed",
        updated: "2026-08-28",
        kind: "design",
        hasEvidence: true,
        crossEntries: [
          {
            ...technicalReview(),
            review_kind: "human",
            reviewer: "PO",
            reviewer_model: undefined,
            worker_model: undefined,
            green_commands: undefined,
          },
        ],
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([
      { plan_id: planId, reason: "missing_human_po_approval" },
    ]);
  });

  it("U-L3APP-003: typed PO approvalが対象PLANへ束縛されていれば通過する", () => {
    const planId = "PLAN-L3-92-l3-human-approval-gate";
    const result = analyzeReviewEvidence([
      plan({
        plan_id: planId,
        layer: "L3",
        status: "confirmed",
        updated: "2026-08-27",
        kind: "design",
        hasEvidence: true,
        crossEntries: [technicalReview()],
        l3HumanApproval: l3Approval(planId),
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-L3APP-004: 過去に確定済みのL3 PLANは遡及的に承認記録を捏造させない", () => {
    const result = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-L3-93-l3-human-approval-legacy",
        layer: "L3",
        status: "confirmed",
        updated: "2026-08-26",
        kind: "design",
        hasEvidence: true,
        crossEntries: [technicalReview()],
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-L3APP-005: malformed approvalまたは別PLANのapprovalはfail-closeする", () => {
    const planId = "PLAN-L3-94-l3-human-approval-invalid";
    const parsed = parseReviewPlan(
      "PLAN-L3-94-l3-human-approval-invalid.md",
      [
        "---",
        `plan_id: ${planId}`,
        "layer: L3",
        "kind: design",
        "status: confirmed",
        "created: 2026-08-27",
        `updated: ${L3_HUMAN_APPROVAL_ENFORCEMENT_DATE}`,
        "l3_human_approval:",
        "  schema_version: helix-l3-human-approval.v1",
        "  approval_kind: human_po",
        "  decision: approve",
        "  approver: RetryYN",
        "  approved_at: 2026-08-27T12:00:00Z",
        "  plan_id: PLAN-L3-95-other-plan",
        "  approval_record_id: L3-PO-1097-002",
        "  approval_source: github_issue_comment",
        "  approval_source_url: https://github.com/RetryYN/HELIX-HARNESS/issues/1097#issuecomment-1234567890",
        "---",
        "body",
      ].join("\n"),
    );

    expect(parsed.l3HumanApprovalInvalid).toBe(true);
    expect(analyzeReviewEvidence([parsed]).l3HumanApprovalViolations).toEqual([
      { plan_id: planId, reason: "invalid_human_po_approval" },
    ]);
  });

  it("U-L3APP-006: created以後にupdatedを戻す時系列逆転は承認recordがあっても拒否する", () => {
    const planId = "PLAN-L3-95-l3-human-approval-created-date";
    const result = analyzeReviewEvidence([
      plan({
        plan_id: planId,
        layer: "L3",
        status: "confirmed",
        created: L3_HUMAN_APPROVAL_ENFORCEMENT_DATE,
        updated: "2026-08-26",
        kind: "design",
        hasEvidence: true,
        crossEntries: [technicalReview()],
        l3HumanApproval: l3Approval(planId),
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([
      { plan_id: planId, reason: "invalid_l3_plan_dates" },
    ]);
    expect(result.ok).toBe(false);
  });

  it("U-L3APP-007: L3 terminal PLANの日付欠落・暦日不正は承認recordがあっても拒否する", () => {
    const cases = [
      { plan_id: "PLAN-L3-96-l3-human-approval-missing-date", created: "", updated: "2026-08-27" },
      {
        plan_id: "PLAN-L3-97-l3-human-approval-invalid-date",
        created: "2026-08-99",
        updated: "2026-08-27",
      },
    ];
    for (const candidate of cases) {
      const result = analyzeReviewEvidence([
        plan({
          ...candidate,
          layer: "L3",
          status: "confirmed",
          kind: "design",
          hasEvidence: true,
          crossEntries: [technicalReview()],
          l3HumanApproval: l3Approval(candidate.plan_id),
        }),
      ]);
      expect(result.l3HumanApprovalViolations).toEqual([
        { plan_id: candidate.plan_id, reason: "invalid_l3_plan_dates" },
      ]);
      expect(result.ok).toBe(false);
    }
  });

  it("U-L3APP-008: frontmatterをbackdateしてもGit初出日が基準日以降なら承認欠落を拒否する", () => {
    const planId = "PLAN-L3-98-l3-human-approval-git-created";
    const gitDateProvenance: GitPlanDateProvenance = {
      source: "git",
      firstCommitDate: "2026-08-27T09:00:00Z",
      lastCommitDate: "2026-08-27T09:00:00Z",
    };
    const result = analyzeReviewEvidence([
      plan({
        plan_id: planId,
        layer: "L3",
        status: "confirmed",
        created: "2020-01-01",
        updated: "2020-01-02",
        kind: "design",
        hasEvidence: true,
        crossEntries: [technicalReview()],
        gitDateProvenance,
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([
      { plan_id: planId, reason: "missing_human_po_approval" },
    ]);
    expect(result.ok).toBe(false);
  });

  it("U-L3APP-009: frontmatterをbackdateしてもGit最終変更日が基準日以降なら承認欠落を拒否する", () => {
    const planId = "PLAN-L3-99-l3-human-approval-git-updated";
    const result = analyzeReviewEvidence([
      plan({
        plan_id: planId,
        layer: "L3",
        status: "confirmed",
        created: "2020-01-01",
        updated: "2020-01-02",
        kind: "design",
        hasEvidence: true,
        crossEntries: [technicalReview()],
        gitDateProvenance: {
          source: "git",
          firstCommitDate: "2026-08-26T09:00:00Z",
          lastCommitDate: "2026-08-27T09:00:00Z",
        },
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([
      { plan_id: planId, reason: "missing_human_po_approval" },
    ]);
    expect(result.ok).toBe(false);
  });

  it("U-L3APP-010: Git provenance取得不能は承認recordがあってもfail-closeする", () => {
    const planId = "PLAN-L3-100-l3-human-approval-git-missing";
    const result = analyzeReviewEvidence([
      plan({
        plan_id: planId,
        layer: "L3",
        status: "confirmed",
        created: "2026-08-27",
        updated: "2026-08-27",
        kind: "design",
        hasEvidence: true,
        crossEntries: [technicalReview()],
        l3HumanApproval: l3Approval(planId),
        gitDateProvenance: { source: "git", error: "history_unavailable" },
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([
      { plan_id: planId, reason: "missing_l3_plan_git_provenance" },
    ]);
    expect(result.ok).toBe(false);
  });

  it("U-L3APP-011: 基準日前のGit provenanceを持つ既存L3 PLANには承認を遡及要求しない", () => {
    const result = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-L3-101-l3-human-approval-grandfather",
        layer: "L3",
        status: "confirmed",
        created: "2026-08-26",
        updated: "2026-08-27",
        kind: "design",
        hasEvidence: true,
        crossEntries: [{ ...technicalReview(), reviewer_session_id: "codex-test-session" }],
        gitDateProvenance: {
          source: "git",
          firstCommitDate: "2026-08-26T09:00:00Z",
          lastCommitDate: "2026-08-26T10:00:00Z",
        },
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-L3APP-013: strict registry tuple migrationだけでは既存L3へPO再承認を遡及要求しない", () => {
    const result = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-L3-102-l3-human-approval-registry-migration",
        layer: "L3",
        status: "confirmed",
        created: "2026-08-26",
        updated: "2026-08-26",
        kind: "design",
        hasEvidence: true,
        crossEntries: [{ ...technicalReview(), reviewer_session_id: "codex-test-session" }],
        gitDateProvenance: {
          source: "git",
          firstCommitDate: "2026-08-26T09:00:00Z",
          lastCommitDate: "2026-08-29T09:00:00Z",
          lastAuthorityCommitDate: "2026-08-26T10:00:00Z",
        },
      }),
    ]);

    expect(result.l3HumanApprovalViolations).toEqual([]);
    expect(result.ok).toBe(true);
  });

  it("U-L3APP-012: loaderはtracked PLANのGit初出／最終変更日を取得する", () => {
    const provenance = readGitPlanDateProvenance(
      process.cwd(),
      "docs/plans/PLAN-L7-687-l3-human-approval-gate.md",
    );

    expect(provenance.source).toBe("git");
    expect(provenance.error).toBeUndefined();
    expect(provenance.firstCommitDate).toMatch(/^2026-08-27T/u);
    expect(Date.parse(provenance.lastCommitDate ?? "")).toBeGreaterThanOrEqual(
      Date.parse(provenance.firstCommitDate ?? ""),
    );

    const loaded = loadReviewPlans(process.cwd()).find(
      (candidate) => candidate.plan_id === "PLAN-L3-00-master",
    );
    expect(loaded?.gitDateProvenance?.source).toBe("git");
    expect(loaded?.gitDateProvenance?.error).toBeUndefined();
    expect(loaded?.gitDateProvenance?.firstCommitDate).toMatch(/^2026-06-28T/u);
  });
});

/** IMP-076 — cross-review semantic 強制 (same_model_approval / cross_agent distinctness)。 */
describe("cross-review semantic 強制 (IMP-076)", () => {
  it("U-XREVIEW-001: cross_agent で worker≠reviewer model → 違反なし / ok=true", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-A",
        kind: "add-impl",
        crossEntries: [
          {
            review_kind: "cross_agent",
            reviewed_at: "2026-06-05",
            tests_green_at: "2026-06-05",
            worker_model: "claude-opus-4-8",
            reviewer_model: "gpt-5.5",
          },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.crossReviewViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-XREVIEW-002: cross_agent で worker≡reviewer の同一 model → violation / ok=false (same_model_approval)", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-B",
        crossEntries: [
          {
            review_kind: "cross_agent",
            worker_model: "claude-opus-4-8",
            reviewer_model: "claude-opus-4-8",
          },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.crossReviewViolations).toEqual([
      { plan_id: "PLAN-B", reason: "same_model_or_missing" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-XREVIEW-003: cross_agent で model 欠落 → violation (単体 runtime は相異 model を供給できない=僭称を弾く)", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-C",
        crossEntries: [{ review_kind: "cross_agent" }],
        hasEvidence: true,
      }),
    ]);
    expect(r.crossReviewViolations).toEqual([
      { plan_id: "PLAN-C", reason: "same_model_or_missing" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-XREVIEW-004: cross_agent は同一 provider の別 model でも violation", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-SAME-PROVIDER",
        crossEntries: [
          {
            review_kind: "cross_agent",
            worker_model: "claude-opus-4-8",
            reviewer_model: "claude-sonnet-4-6",
          },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.crossReviewViolations).toEqual([
      { plan_id: "PLAN-SAME-PROVIDER", reason: "same_provider" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-XREVIEW-005: 非 cross_agent (intra_runtime_subagent) は model 同一/欠落でも対象外", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-D",
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            reviewed_at: "2026-06-05",
            tests_green_at: "2026-06-05",
            worker_model: "x",
            reviewer_model: "x",
          },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.crossReviewViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-XREVIEW-006: extractReviewEntries — frontmatter yaml から review_kind/worker_model/reviewer_model 抽出", () => {
    const content = `---
plan_id: PLAN-E
review_evidence:
  - reviewer: frontier-reviewer
    review_kind: cross_agent
    reviewed_at: "2026-06-05"
    verdict: approve
    worker_model: claude-opus-4-8
    reviewer_model: gpt-5.5
---
body`;
    const entries = extractReviewEntries(content);
    expect(entries).toEqual([
      {
        reviewer: "frontier-reviewer",
        review_kind: "cross_agent",
        verdict: "approve",
        reviewed_at: "2026-06-05",
        worker_model: "claude-opus-4-8",
        reviewer_model: "gpt-5.5",
      },
    ]);
  });
});

/** IMP-077 — 定量テスト→定性レビュー順序強制 (tests_green_at ≤ reviewed_at、全駆動モデル普遍)。 */
describe("test→review 順序強制 (IMP-077)", () => {
  it("U-TORDER-001: tests_green_at ≤ reviewed_at → 違反なし / ok=true", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-T1",
        crossEntries: [
          { review_kind: "human", reviewed_at: "2026-06-05", tests_green_at: "2026-06-04" },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.testBeforeReviewViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-TORDER-002: tests_green_at > reviewed_at → review_before_test violation / ok=false", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-T2",
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            reviewed_at: "2026-06-05",
            tests_green_at: "2026-06-06",
          },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.testBeforeReviewViolations).toEqual([
      { plan_id: "PLAN-T2", reason: "review_before_test" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-TORDER-003: tests_green_at 欠落 → missing_tests_green_at violation", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-T3",
        crossEntries: [{ review_kind: "intra_runtime_subagent", reviewed_at: "2026-06-05" }],
        hasEvidence: true,
      }),
    ]);
    expect(r.testBeforeReviewViolations).toEqual([
      { plan_id: "PLAN-T3", reason: "missing_tests_green_at" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-TORDER-004: 全駆動モデル普遍 — kind=reverse (非 design/impl) でも review_evidence entry があれば順序対象", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-T4",
        kind: "reverse",
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            reviewed_at: "2026-06-05",
            tests_green_at: "2026-06-06",
          },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.testBeforeReviewViolations).toEqual([
      { plan_id: "PLAN-T4", reason: "review_before_test" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-TORDER-005: draft (未確定) は順序対象外", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-T5",
        status: "draft",
        crossEntries: [{ review_kind: "intra_runtime_subagent", reviewed_at: "2026-06-05" }],
        hasEvidence: true,
      }),
    ]);
    expect(r.testBeforeReviewViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-TORDER-006: timezone表記が混在してもepochで正順を判定する", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-T6",
        crossEntries: [
          {
            review_kind: "intra_runtime_subagent",
            reviewed_at: "2026-07-12T10:30:00+09:00",
            tests_green_at: "2026-07-12T01:00:00Z",
          },
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.testBeforeReviewViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });
});

describe("cross_agent provider 認識 (PLAN-RECOVERY-12)", () => {
  it("U-REVIEW-010: Kimi を第三の独立 provider として認識する", () => {
    expect(modelProviderFromId("kimi-code/k3-256k")).toBe("kimi");
    expect(modelProviderFromId("moonshot-v1-128k")).toBe("kimi");
    // 既存 provider 判定は変えない。
    expect(modelProviderFromId("claude-opus-5")).toBe("claude");
    expect(modelProviderFromId("gpt-5.6-sol")).toBe("codex");
    expect(modelProviderFromId("some-unlisted-model")).toBe("unknown");

    // claude × kimi は別 provider なので cross_agent として成立する。
    expect(checkCrossAgentModelPair("claude-opus-5", "kimi-code/k3-256k")).toMatchObject({
      ok: true,
      workerProvider: "claude",
      reviewerProvider: "kimi",
    });
    // 同一 provider 同士は従来どおり拒否する。
    expect(checkCrossAgentModelPair("kimi-code/k3-256k", "moonshot-v1-128k")).toMatchObject({
      ok: false,
      issue: "same_provider",
    });
  });
});

/**
 * reviewer 主体の構造化強制 (PLAN-L7-648-review-evidence-reviewer-identity, Issue #923)。
 * 設計 = docs/design/helix/L6-function-design/review-evidence-reviewer-identity.md
 * テスト設計 = docs/test-design/helix/L8-review-evidence-reviewer-identity-unit-test-design.md
 */
describe("reviewer 主体の構造化強制 (Issue #923)", () => {
  // ok=true が reviewer identity 由来であることを保証するため、他検査 (IMP-077 / IMP-108) を満たす entry を基準にする。
  const aiEntry = (over: Partial<ReviewEntry> = {}): ReviewEntry => ({
    review_kind: "cross_agent",
    reviewed_at: "2026-08-22T00:00:00Z",
    tests_green_at: "2026-08-22T00:00:00Z",
    verdict: "approve",
    worker_model: "codex:gpt-5.6-sol",
    reviewer_model: "claude:claude-opus-5",
    reviewer_session_id: "792345fd-722c-4696-85eb-02494ab28d30",
    green_commands: [
      {
        kind: "unit_test",
        command: "npx --no-install vitest run --project fast tests/review-evidence.test.ts",
        runner: "node",
        scope: "targeted",
        exit_code: 0,
        evidence_path: ".helix/state/review/review-evidence.json",
        output_digest: `sha256:${"0".repeat(64)}`,
        completed_at: "2026-08-22T00:00:00Z",
      },
    ],
    ...over,
  });

  it("U-RVIDENT-001: enforcement date 以降に作成された confirmed PLAN の AI review entry に reviewer_session_id があれば違反なし", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-IDENT-OK",
        kind: "impl",
        created: REVIEWER_SESSION_ENFORCEMENT_DATE,
        updated: REVIEWER_SESSION_ENFORCEMENT_DATE,
        crossEntries: [aiEntry()],
        hasEvidence: true,
      }),
    ]);
    expect(r.reviewerIdentityViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-RVIDENT-002: reviewer_session_id 欠落 → missing_reviewer_session_id / ok=false (prose だけの主体記録を拒否)", () => {
    const entry = aiEntry();
    entry.reviewer_session_id = undefined;
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-IDENT-MISSING",
        kind: "impl",
        created: REVIEWER_SESSION_ENFORCEMENT_DATE,
        updated: REVIEWER_SESSION_ENFORCEMENT_DATE,
        crossEntries: [entry],
        hasEvidence: true,
      }),
    ]);
    expect(r.reviewerIdentityViolations).toEqual([
      { plan_id: "PLAN-IDENT-MISSING", reason: "missing_reviewer_session_id" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-RVIDENT-003: 空白・prose 混入・短すぎる値は invalid_reviewer_session_id として拒否する", () => {
    for (const bad of ["", "   ", "別 session", "session id: 792345fd", "abc", "-leading-hyphen"]) {
      const r = analyzeReviewEvidence([
        plan({
          plan_id: "PLAN-IDENT-BAD",
          kind: "impl",
          created: REVIEWER_SESSION_ENFORCEMENT_DATE,
          updated: REVIEWER_SESSION_ENFORCEMENT_DATE,
          crossEntries: [aiEntry({ reviewer_session_id: bad })],
          hasEvidence: true,
        }),
      ]);
      expect(
        r.reviewerIdentityViolations.length,
        `reviewer_session_id=${JSON.stringify(bad)}`,
      ).toBe(1);
      expect(r.ok).toBe(false);
    }
  });

  it("U-RVIDENT-004: reviewer_model 欠落は session があっても violation (主体は session×model の対で定まる)", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-IDENT-NOMODEL",
        kind: "impl",
        created: REVIEWER_SESSION_ENFORCEMENT_DATE,
        updated: REVIEWER_SESSION_ENFORCEMENT_DATE,
        crossEntries: [
          aiEntry({
            review_kind: "intra_runtime_subagent",
            worker_model: undefined,
            reviewer_model: undefined,
          }),
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.reviewerIdentityViolations).toEqual([
      { plan_id: "PLAN-IDENT-NOMODEL", reason: "missing_reviewer_model" },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-RVIDENT-005: enforcement date より前に作成された PLAN は、後から updated しても遡及要求しない (記録の無い session の捏造を強いない)", () => {
    const entry = aiEntry();
    entry.reviewer_session_id = undefined;
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-IDENT-LEGACY",
        kind: "impl",
        created: "2026-08-21",
        updated: "2026-09-30",
        crossEntries: [entry],
        hasEvidence: true,
      }),
    ]);
    expect(r.reviewerIdentityViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-RVIDENT-006: human review entry は session を持たないので対象外", () => {
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-IDENT-HUMAN",
        kind: "impl",
        created: REVIEWER_SESSION_ENFORCEMENT_DATE,
        updated: REVIEWER_SESSION_ENFORCEMENT_DATE,
        crossEntries: [
          aiEntry({ review_kind: "human", reviewer: "PO", reviewer_session_id: undefined }),
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.reviewerIdentityViolations).toEqual([]);
  });

  it("U-RVIDENT-007: 同一 session が別 reviewer_model を名乗る記録は date-gate 非依存で衝突として surface する", () => {
    const session = "8e73aa7e-52a7-4ea8-a688-8d4ac834d747";
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-CONFLICT-A",
        kind: "impl",
        created: "2026-08-01",
        updated: "2026-08-01",
        crossEntries: [aiEntry({ reviewer_session_id: session })],
        hasEvidence: true,
      }),
      plan({
        plan_id: "PLAN-CONFLICT-B",
        kind: "impl",
        created: "2026-08-01",
        updated: "2026-08-01",
        crossEntries: [
          aiEntry({ reviewer_session_id: session, reviewer_model: "claude:claude-fable-5" }),
        ],
        hasEvidence: true,
      }),
    ]);
    expect(r.reviewerIdentityViolations).toEqual([
      { plan_id: "PLAN-CONFLICT-A", reason: `reviewer_session_model_conflict:${session}` },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-RVIDENT-008: 同一 session が同一 model で複数 PLAN に現れるのは正常 (衝突にしない)", () => {
    const session = "8e73aa7e-52a7-4ea8-a688-8d4ac834d747";
    const r = analyzeReviewEvidence([
      plan({
        plan_id: "PLAN-SAME-A",
        kind: "impl",
        created: "2026-08-01",
        updated: "2026-08-01",
        crossEntries: [aiEntry({ reviewer_session_id: session })],
        hasEvidence: true,
      }),
      plan({
        plan_id: "PLAN-SAME-B",
        kind: "impl",
        created: "2026-08-01",
        updated: "2026-08-01",
        crossEntries: [aiEntry({ reviewer_session_id: session })],
        hasEvidence: true,
      }),
    ]);
    expect(r.reviewerIdentityViolations).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("U-RVIDENT-009: extractReviewEntries が reviewer_session_id を型付きで読む (prose scope に依存しない)", () => {
    const entries = extractReviewEntries(
      [
        "---",
        "plan_id: PLAN-Z",
        "review_evidence:",
        '  - reviewer: "Claude Code / claude-opus-5"',
        "    review_kind: cross_agent",
        '    reviewed_at: "2026-08-22T00:00:00Z"',
        "    verdict: approve",
        "    worker_model: codex:gpt-5.6-sol",
        "    reviewer_model: claude:claude-opus-5",
        "    reviewer_session_id: 792345fd-722c-4696-85eb-02494ab28d30",
        "---",
        "",
      ].join("\n"),
    );
    expect(entries[0].reviewer_session_id).toBe("792345fd-722c-4696-85eb-02494ab28d30");
  });

  it("U-RVIDENT-010: 実 repo fail-close ガード — 現行 docs/plans に reviewer identity violation が無い", () => {
    const r = analyzeReviewEvidence(loadReviewPlans(process.cwd()));
    expect(r.reviewerIdentityViolations).toEqual([]);
  });

  // PLAN-RECOVERY-1543-reviewer-session-model-history: session × model の有効期間 registry。
  const historySession = "019febe1-8983-7820-bee4-4cd62876f9b6";
  const history = () =>
    parseReviewerSessionModelHistory({
      schema_version: REVIEWER_SESSION_MODEL_HISTORY_SCHEMA,
      sessions: [
        {
          reviewer_session_id: historySession,
          runtime: "codex",
          windows: [
            {
              reviewer_model: "codex:gpt-5.6-sol",
              since: "2026-08-10T13:37:33Z",
              until: "2026-09-05T03:00:00Z",
              basis: "既存 review_evidence の自己申告。attestation ではない。",
            },
            {
              reviewer_model: "codex",
              since: "2026-09-05T03:00:00Z",
              until: null,
              basis: "Codex 所有者の申告（確認できる範囲は runtime=codex）。attestation ではない。",
            },
          ],
        },
      ],
    });
  const historyPlan = (planId: string, reviewedAt: string, reviewerModel: string) =>
    plan({
      plan_id: planId,
      kind: "impl",
      created: "2026-09-01",
      updated: "2026-09-05",
      crossEntries: [
        aiEntry({
          reviewer_session_id: historySession,
          reviewer_model: reviewerModel,
          reviewed_at: reviewedAt,
          tests_green_at: reviewedAt,
        }),
      ],
      hasEvidence: true,
    });

  it("U-RVIDENT-012: registry に有効期間が宣言された session は model 切替をまたいでも衝突にしない", () => {
    const r = analyzeReviewEvidence(
      [
        historyPlan("PLAN-HIST-SOL", "2026-08-30T13:06:00Z", "codex:gpt-5.6-sol"),
        historyPlan("PLAN-HIST-ASTRA", "2026-09-05T03:36:39Z", "codex"),
      ],
      { sessionModelHistory: history() },
    );
    expect(r.reviewerIdentityViolations).toEqual([]);
    expect(reviewerModelAt(history().sessions[0], "2026-08-30T13:06:00Z")).toBe(
      "codex:gpt-5.6-sol",
    );
    expect(reviewerModelAt(history().sessions[0], "2026-09-05T03:36:39Z")).toBe("codex");
    // registry なしでは従来どおり衝突（履歴宣言だけが解消手段であることを固定）。
    const legacy = analyzeReviewEvidence([
      historyPlan("PLAN-HIST-SOL", "2026-08-30T13:06:00Z", "codex:gpt-5.6-sol"),
      historyPlan("PLAN-HIST-ASTRA", "2026-09-05T03:36:39Z", "codex"),
    ]);
    expect(legacy.reviewerIdentityViolations).toEqual([
      { plan_id: "PLAN-HIST-ASTRA", reason: `reviewer_session_model_conflict:${historySession}` },
    ]);
  });

  it("U-RVIDENT-013: registry 登録 session は window 外・model 不一致を history_mismatch として fail-close する", () => {
    // 旧 window 内で新 model を名乗る（切替前に Astra を主張）。
    const early = analyzeReviewEvidence(
      [historyPlan("PLAN-HIST-EARLY", "2026-09-01T00:00:00Z", "codex")],
      { sessionModelHistory: history() },
    );
    expect(early.reviewerIdentityViolations).toEqual([
      {
        plan_id: "PLAN-HIST-EARLY",
        reason: `reviewer_session_model_history_mismatch:${historySession}`,
      },
    ]);
    // 新 window 内で旧 model を名乗る（切替後に Sol を主張 = 旧記録への文字列合わせ）。
    const late = analyzeReviewEvidence(
      [historyPlan("PLAN-HIST-LATE", "2026-09-05T04:00:00Z", "codex:gpt-5.6-sol")],
      { sessionModelHistory: history() },
    );
    expect(late.reviewerIdentityViolations).toEqual([
      {
        plan_id: "PLAN-HIST-LATE",
        reason: `reviewer_session_model_history_mismatch:${historySession}`,
      },
    ]);
    // どの window にも入らない（since より前）。
    const before = analyzeReviewEvidence(
      [historyPlan("PLAN-HIST-BEFORE", "2026-08-01T00:00:00Z", "codex:gpt-5.6-sol")],
      { sessionModelHistory: history() },
    );
    expect(before.reviewerIdentityViolations).toEqual([
      {
        plan_id: "PLAN-HIST-BEFORE",
        reason: `reviewer_session_model_history_mismatch:${historySession}`,
      },
    ]);
    // model が 1 つでも registry に載った session は照合する（単一 model だから通す、にしない）。
    expect(before.ok).toBe(false);
  });

  it("U-RVIDENT-014: registry の schema / 時系列不整合は parse 時点で fail-close する", () => {
    const base = history();
    const mutate = (fn: (raw: Record<string, unknown>) => void) => {
      const raw = JSON.parse(JSON.stringify(base)) as Record<string, unknown>;
      fn(raw);
      return () => parseReviewerSessionModelHistory(raw);
    };
    expect(
      mutate((raw) => {
        raw.schema_version = "helix-reviewer-session-model-history.v0";
      }),
    ).toThrow("reviewer_session_model_history_invalid:schema_version");
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ since: string }> }>)[0].windows[1].since =
          "2026-09-05T02:00:00Z";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].windows[1].since");
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ until: string | null }> }>)[0].windows[0].until =
          null;
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].windows[1].since");
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ until: string | null }> }>)[0].windows[0].until =
          "2026-08-10T13:37:33Z";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].windows[0].until");
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ reviewer_session_id: string }>)[0].reviewer_session_id =
          "session id: bad";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].reviewer_session_id");
    expect(
      mutate((raw) => {
        const sessions = raw.sessions as Array<Record<string, unknown>>;
        sessions.push(JSON.parse(JSON.stringify(sessions[0])));
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[1].reviewer_session_id");
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ basis: string }> }>)[0].windows[0].basis = "";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].windows[0].basis");
    // runtime は許容集合のみ。`unknown` は modelProviderFromId の未知正規化と一致してしまうため拒否する。
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ runtime: string }>)[0].runtime = "unknown";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].runtime");
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ runtime: string }>)[0].runtime = "ollama";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].runtime");
    // timezone 無しの日時は Date.parse では通るが環境依存なので拒否する。
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ since: string }> }>)[0].windows[0].since =
          "2026-08-10T13:37:33";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].windows[0].since");
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ until: string | null }> }>)[0].windows[0].until =
          "2026-09-05";
      }),
    ).toThrow("reviewer_session_model_history_invalid:sessions[0].windows[0].until");
    // 形式は合っていても暦上存在しない日付は拒否する（Date.parse は 2/30 を 3/2 へ黙って正規化する）。
    for (const bad of [
      "2026-02-30T00:00:00Z",
      "2027-02-29T00:00:00Z", // 非うるう年
      "2026-04-31T00:00:00Z",
      "2026-13-01T00:00:00Z",
      "2026-08-10T24:00:00Z",
      "2026-08-10T13:60:00Z",
      "2026-08-10T13:37:33+24:00",
    ]) {
      expect(
        mutate((raw) => {
          (raw.sessions as Array<{ windows: Array<{ since: string }> }>)[0].windows[0].since = bad;
        }),
        bad,
      ).toThrow("reviewer_session_model_history_invalid:sessions[0].windows[0].since");
    }
    // 有効なうるう日と offset 境界は受理する（対照）。
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ since: string }> }>)[0].windows[0].since =
          "2024-02-29T00:00:00Z";
      }),
    ).not.toThrow();
    expect(
      mutate((raw) => {
        (raw.sessions as Array<{ windows: Array<{ since: string }> }>)[0].windows[0].since =
          "2026-08-10T22:37:33+09:00";
      }),
    ).not.toThrow();
    // 読込側の失敗は違反として surface され、履歴なし扱いに黙って落ちない。
    const r = analyzeReviewEvidence([], {
      sessionModelHistory: null,
      sessionModelHistoryError: "reviewer_session_model_history_invalid:root",
    });
    expect(r.reviewerIdentityViolations).toEqual([
      {
        plan_id: REVIEWER_SESSION_MODEL_HISTORY_PATH,
        reason: "reviewer_session_model_history_invalid:root",
      },
    ]);
    expect(r.ok).toBe(false);
  });

  it("U-RVIDENT-015: registry に無い session は従来の単一 model 規則で衝突する（履歴は他 session を緩めない）", () => {
    const other = "8e73aa7e-52a7-4ea8-a688-8d4ac834d747";
    const r = analyzeReviewEvidence(
      [
        historyPlan("PLAN-HIST-SOL", "2026-08-30T13:06:00Z", "codex:gpt-5.6-sol"),
        plan({
          plan_id: "PLAN-OTHER-A",
          kind: "impl",
          created: "2026-08-01",
          updated: "2026-08-01",
          crossEntries: [aiEntry({ reviewer_session_id: other })],
          hasEvidence: true,
        }),
        plan({
          plan_id: "PLAN-OTHER-B",
          kind: "impl",
          created: "2026-08-01",
          updated: "2026-08-01",
          crossEntries: [
            aiEntry({ reviewer_session_id: other, reviewer_model: "claude:claude-fable-5" }),
          ],
          hasEvidence: true,
        }),
      ],
      { sessionModelHistory: history() },
    );
    expect(r.reviewerIdentityViolations).toEqual([
      { plan_id: "PLAN-OTHER-A", reason: `reviewer_session_model_conflict:${other}` },
    ]);
  });

  it("U-RVIDENT-016: 実 repo の registry は parse でき、現行 docs/plans と矛盾しない（fail-close ガード）", () => {
    const loaded = loadReviewerSessionModelHistory(process.cwd());
    expect(loaded).not.toBeNull();
    expect(loaded?.schema_version).toBe(REVIEWER_SESSION_MODEL_HISTORY_SCHEMA);
    expect(loaded?.sessions.map((s) => s.reviewer_session_id)).toContain(historySession);
    const r = analyzeReviewEvidence(loadReviewPlans(process.cwd()), {
      sessionModelHistory: loaded,
    });
    expect(r.reviewerIdentityViolations).toEqual([]);
  });

  it("U-RVIDENT-017: registry の runtime と entry の reviewer_model provider が食い違う記録は runtime_mismatch で fail-close する", () => {
    // registry は runtime=codex を宣言しているのに、同 session id で claude model を名乗る entry。
    const r = analyzeReviewEvidence(
      [historyPlan("PLAN-HIST-RUNTIME", "2026-08-30T13:06:00Z", "claude:claude-opus-5")],
      { sessionModelHistory: history() },
    );
    expect(r.reviewerIdentityViolations).toEqual([
      {
        plan_id: "PLAN-HIST-RUNTIME",
        reason: `reviewer_session_model_history_runtime_mismatch:${historySession}`,
      },
      {
        plan_id: "PLAN-HIST-RUNTIME",
        reason: `reviewer_session_model_history_mismatch:${historySession}`,
      },
    ]);
    expect(r.ok).toBe(false);
    // provider が一致し window 内なら runtime_mismatch は出ない（対照）。
    const okCase = analyzeReviewEvidence(
      [historyPlan("PLAN-HIST-OK", "2026-08-30T13:06:00Z", "codex:gpt-5.6-sol")],
      { sessionModelHistory: history() },
    );
    expect(okCase.reviewerIdentityViolations).toEqual([]);
  });

  it("U-RVIDENT-019: reviewed_at も timezone 必須。timezone 無しは実行環境に依らず null（不一致）へ fail-close し、明示 offset の同一 instant は一致する", () => {
    const declared = history().sessions[0];
    // 境界 03:00Z の直後を timezone 無しで書くと、UTC では新 window / JST では旧 window に解釈され得る。
    // 形式検査で null にすることで TZ に依らず同じ結果（不一致）になる。
    expect(reviewerModelAt(declared, "2026-09-05T04:00:00")).toBeNull();
    expect(reviewerModelAt(declared, "2026-09-05")).toBeNull();
    expect(reviewerModelAt(declared, "not-a-date")).toBeNull();
    // 暦上存在しない日付は形式が合っていても null（Date.parse の黙った正規化で attribution しない）。
    expect(reviewerModelAt(declared, "2026-02-30T12:00:00Z")).toBeNull();
    expect(reviewerModelAt(declared, "2027-02-29T12:00:00Z")).toBeNull();
    expect(reviewerModelAt(declared, "2026-04-31T12:00:00Z")).toBeNull();
    // 有効なうるう日は照合される（対照）。
    expect(reviewerModelAt(declared, "2028-02-29T12:00:00Z")).toBe("codex");
    // 小数精度を ms へ丸めて別 window へ昇格させない: 境界 03:00:00Z の直前は旧 window のまま。
    expect(reviewerModelAt(declared, "2026-09-05T02:59:59.9999Z")).toBe("codex:gpt-5.6-sol");
    expect(reviewerModelAt(declared, "2026-09-05T02:59:59.999999999Z")).toBe("codex:gpt-5.6-sol");
    // 境界一致（半開区間の下端）と、小数桁数だけが異なる同一 instant は同じ window に落ちる。
    for (const same of [
      "2026-09-05T03:00:00Z",
      "2026-09-05T03:00:00.0Z",
      "2026-09-05T03:00:00.000Z",
      "2026-09-05T03:00:00.000000000Z",
      "2026-09-05T12:00:00.000000+09:00",
    ]) {
      expect(reviewerModelAt(declared, same), same).toBe("codex");
    }
    // sub-ms 幅の window は潰れずに区別される（since < until が保たれ、内側の instant だけが一致する）。
    const subMs = parseReviewerSessionModelHistory({
      schema_version: REVIEWER_SESSION_MODEL_HISTORY_SCHEMA,
      sessions: [
        {
          reviewer_session_id: historySession,
          runtime: "codex",
          windows: [
            {
              reviewer_model: "codex:narrow",
              since: "2026-09-05T03:00:00.0000001Z",
              until: "2026-09-05T03:00:00.0000002Z",
              basis: "sub-ms 幅の合成 window。attestation ではない。",
            },
            {
              reviewer_model: "codex:after",
              since: "2026-09-05T03:00:00.0000002Z",
              until: null,
              basis: "合成。attestation ではない。",
            },
          ],
        },
      ],
    }).sessions[0];
    expect(reviewerModelAt(subMs, "2026-09-05T03:00:00.00000015Z")).toBe("codex:narrow");
    expect(reviewerModelAt(subMs, "2026-09-05T03:00:00.0000002Z")).toBe("codex:after");
    expect(reviewerModelAt(subMs, "2026-09-05T03:00:00.00000009Z")).toBeNull();
    // 明示 offset は同一 instant として照合される（+09:00 の 12:00 = 03:00Z = 新 window 開始）。
    expect(reviewerModelAt(declared, "2026-09-05T12:00:00+09:00")).toBe("codex");
    expect(reviewerModelAt(declared, "2026-09-05T11:59:59+09:00")).toBe("codex:gpt-5.6-sol");
    expect(reviewerModelAt(declared, "2026-09-05T03:00:00.000Z")).toBe("codex");
    // analyze 経由でも timezone 無し reviewed_at は history_mismatch として違反になる。
    const r = analyzeReviewEvidence(
      [historyPlan("PLAN-HIST-TZLESS", "2026-09-05T04:00:00", "codex")],
      { sessionModelHistory: history() },
    );
    expect(r.reviewerIdentityViolations.map((v) => v.reason)).toContain(
      `reviewer_session_model_history_mismatch:${historySession}`,
    );
    expect(r.ok).toBe(false);
  });
});
