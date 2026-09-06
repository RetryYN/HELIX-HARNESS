import { describe, expect, it } from "vitest";
import {
  evaluateReviewReceiptPlanBinding,
  type ReviewReceiptPlanBindingInput,
} from "../src/runtime/review-receipt-plan-binding";

// PLAN-RECOVERY-1603-review-receipt-plan-binding

const SESSION = "9867601a-a3ad-4369-980c-11757d63a7de";
const MODEL = "claude:claude-fable-5-1";

function input(
  overrides: Partial<ReviewReceiptPlanBindingInput> = {},
): ReviewReceiptPlanBindingInput {
  return {
    receipt: { reviewer_session_id: SESSION, reviewer_model: MODEL },
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
});
