import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  evaluateReviewReceiptPlanBinding,
  loadChangedPlanReviewBindings,
  type ReviewReceiptPlanBindingInput,
} from "../src/runtime/review-receipt-plan-binding";

// PLAN-RECOVERY-1603-review-receipt-plan-binding

const SESSION = "9867601a-a3ad-4369-980c-11757d63a7de";
const MODEL = "claude:claude-fable-5-1";
const HEAD = "a".repeat(40);

function input(
  overrides: Partial<ReviewReceiptPlanBindingInput> = {},
): ReviewReceiptPlanBindingInput {
  return {
    receipt: { reviewer_session_id: SESSION, reviewer_model: MODEL, reviewed_head_sha: HEAD },
    changed_plans: [
      {
        plan_id: "PLAN-RECOVERY-X",
        status: "confirmed",
        review_entries: [
          {
            review_kind: "cross_agent",
            verdict: "approve",
            reviewer_session_id: SESSION,
            reviewer_model: MODEL,
            reviewed_head_sha: HEAD,
          },
        ],
      },
    ],
    ...overrides,
  };
}

describe("review receipt / PLAN binding", () => {
  it("U-RRPB-001: 全terminal変更PLANがreceiptと同じ独立review主体なら受理する", () => {
    expect(evaluateReviewReceiptPlanBinding(input())).toEqual({ ok: true, failures: [] });
  });

  it("U-RRPB-002: 作成側spawn sessionを独立収束sessionへ昇格できない", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({
          changed_plans: [
            {
              ...changed,
              review_entries: [
                { ...changed.review_entries[0], reviewer_session_id: "author-spawn-session" },
              ],
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, failures: [{ reason: "review_plan_session_mismatch" }] });
  });

  it("U-RRPB-003: session一致でもreviewer model不一致を拒否する", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({
          changed_plans: [
            {
              ...changed,
              review_entries: [
                { ...changed.review_entries[0], reviewer_model: "claude:claude-opus-5" },
              ],
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, failures: [{ reason: "review_plan_model_mismatch" }] });
  });

  it("U-RRPB-004: humanまたはintra-runtimeだけではcross-agent承認にならない", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({
          changed_plans: [
            {
              ...changed,
              review_entries: [
                { ...changed.review_entries[0], review_kind: "intra_runtime_subagent" },
              ],
            },
          ],
        }),
      ),
    ).toMatchObject({
      ok: false,
      failures: [{ reason: "review_plan_cross_agent_approval_missing" }],
    });
  });

  it("U-RRPB-005: draft変更PLANはterminal evidence母集団へ入れない", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({ changed_plans: [{ ...changed, status: "draft", review_entries: [] }] }),
      ),
    ).toEqual({ ok: true, failures: [] });
  });

  it("U-RRPB-006: parse不能PLANをfail-closeする", () => {
    expect(
      evaluateReviewReceiptPlanBinding(
        input({
          changed_plans: [
            {
              plan_id: "PLAN-RECOVERY-X",
              status: "unknown",
              review_entries: [],
              parse_failure: true,
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, failures: [{ reason: "review_plan_binding_unavailable" }] });
  });

  it("U-RRPB-007: accepted PLANもterminal evidence母集団から除外できない", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({ changed_plans: [{ ...changed, status: "accepted", review_entries: [] }] }),
      ),
    ).toMatchObject({
      ok: false,
      failures: [{ reason: "review_plan_cross_agent_approval_missing" }],
    });
  });

  it("U-RRPB-008: baseですでにterminalのPLANはmetadata変更だけで再照合しない", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({ changed_plans: [{ ...changed, base_status: "confirmed", review_entries: [] }] }),
      ),
    ).toEqual({ ok: true, failures: [] });
  });

  it("U-RRPB-009: provider prefix差を正規化し、異providerは拒否する", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({
          receipt: {
            reviewer_session_id: SESSION,
            reviewer_model: "claude-fable-5-1",
            reviewed_head_sha: HEAD,
          },
          changed_plans: [
            {
              ...changed,
              review_entries: [
                { ...changed.review_entries[0], reviewer_model: "claude:claude-fable-5-1" },
              ],
            },
          ],
        }),
      ),
    ).toEqual({ ok: true, failures: [] });
    expect(
      evaluateReviewReceiptPlanBinding(
        input({
          changed_plans: [
            {
              ...changed,
              review_entries: [
                { ...changed.review_entries[0], reviewer_model: "codex:gpt-5.6-sol" },
              ],
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, failures: [{ reason: "review_plan_model_mismatch" }] });
  });

  it("U-RRPB-010: loaderはgit差分取得不能をfail-closeする", () => {
    const root = mkdtempSync(join(tmpdir(), "helix-rrpb-no-git-"));
    expect(loadChangedPlanReviewBindings(root, "missing-base")).toMatchObject([
      { parse_failure: true },
    ]);
  });

  it("U-RRPB-013: PLAN evidenceとreceiptのcandidate HEAD不一致を拒否する", () => {
    const changed = input().changed_plans[0];
    expect(
      evaluateReviewReceiptPlanBinding(
        input({
          changed_plans: [
            {
              ...changed,
              review_entries: [{ ...changed.review_entries[0], reviewed_head_sha: "b".repeat(40) }],
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: false, failures: [{ reason: "review_plan_head_mismatch" }] });
  });

  it("U-RRPB-011: loaderは直下PLANだけを対象にしてsubdirectoryを除外する", () => {
    const root = createGitFixture();
    mkdirSync(join(root, "docs/plans/sub"), { recursive: true });
    writeFileSync(join(root, "docs/plans/sub/x.md"), planSource("PLAN-X", "confirmed"));
    commitAll(root, "add nested plan");
    expect(loadChangedPlanReviewBindings(root, "HEAD~1")).toEqual([]);
  });

  it("U-RRPB-012: loaderは壊れたfrontmatterをfail-closeする", () => {
    const root = createGitFixture();
    mkdirSync(join(root, "docs/plans"), { recursive: true });
    writeFileSync(join(root, "docs/plans/x.md"), "---\nstatus: [\n---\n");
    commitAll(root, "add malformed plan");
    expect(loadChangedPlanReviewBindings(root, "HEAD~1")).toMatchObject([{ parse_failure: true }]);
  });
});

function planSource(planId: string, status: string): string {
  return `---\nplan_id: ${planId}\nstatus: ${status}\nreview_evidence: []\n---\n`;
}

function commitAll(root: string, message: string): void {
  execFileSync("git", ["add", "docs"], { cwd: root });
  execFileSync("git", ["commit", "-m", message], { cwd: root });
}

function createGitFixture(): string {
  const root = mkdtempSync(join(tmpdir(), "helix-rrpb-git-"));
  execFileSync("git", ["init"], { cwd: root });
  execFileSync("git", ["config", "user.email", "fixture@example.invalid"], { cwd: root });
  execFileSync("git", ["config", "user.name", "Fixture"], { cwd: root });
  writeFileSync(join(root, "README.md"), "fixture\n");
  execFileSync("git", ["add", "README.md"], { cwd: root });
  execFileSync("git", ["commit", "-m", "base"], { cwd: root });
  return root;
}
