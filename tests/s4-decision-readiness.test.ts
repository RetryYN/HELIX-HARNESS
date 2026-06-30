import { describe, expect, it } from "vitest";
import {
  analyzeS4DecisionReadiness,
  loadS4DecisionReadinessInput,
  type S4DecisionReadinessInput,
  s4DecisionReadinessMessages,
} from "../src/lint/s4-decision-readiness";

function input(overrides: Partial<S4DecisionReadinessInput> = {}): S4DecisionReadinessInput {
  const modeDoc = [
    "s4_decision_record",
    "allowed_outcome",
    "decision_owner",
    "decision_basis",
    "forward_route",
    "reverse_fullback_required",
  ].join("\n");
  return {
    discoveryMd: modeDoc,
    scrumMd: modeDoc,
    outstandingTs: [
      "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
      "decision_owner and decision_basis recorded before terminal status",
      "forward_route / reverse_fullback_required recorded when confirmed",
    ].join("\n"),
    plans: [
      {
        file: "PLAN-DISCOVERY-900.md",
        plan_id: "PLAN-DISCOVERY-900",
        kind: "poc",
        status: "draft",
        workflowPhase: "S3",
        decisionOutcome: null,
        text: [
          "s4_decision_record:",
          "- allowed_outcome: `confirmed` / `rejected` / `pivot`",
          "- decision_owner: PO",
          "- decision_basis: verified evidence",
          "- forward_route: confirmed route",
          "- reverse_fullback_required: yes",
        ].join("\n"),
      },
    ],
    ...overrides,
  };
}

describe("S4 decision readiness", () => {
  it("U-DECISIONREC-001: passes when S3 pending PoC plans carry an explicit S4 decision record", () => {
    const result = analyzeS4DecisionReadiness(input());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-DISCOVERY-900"]);
    expect(s4DecisionReadinessMessages(result)[0]).toContain("s4-decision-readiness - OK");
  });

  it("U-DECISIONREC-001: fails S3 pending PoC plans that do not say what S4 must decide", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-901.md",
            plan_id: "PLAN-DISCOVERY-901",
            kind: "poc",
            status: "draft",
            workflowPhase: "S3",
            decisionOutcome: null,
            text: "verified evidence only",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured s4_decision_record" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured decision_basis" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured reverse_fullback_required" },
      ]),
    );
  });

  it("U-DECISIONREC-001: fails S3 pending PoC plans that mention fields without a structured record", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-903.md",
            plan_id: "PLAN-DISCOVERY-903",
            kind: "poc",
            status: "draft",
            workflowPhase: "S3",
            decisionOutcome: null,
            text: "s4_decision_record allowed_outcome decision_owner decision_basis forward_route reverse_fullback_required",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "missing structured s4_decision_record",
    );
  });

  it("does not require a pending decision record once decision_outcome exists", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-902.md",
            plan_id: "PLAN-DISCOVERY-902",
            kind: "poc",
            status: "draft",
            workflowPhase: "S3",
            decisionOutcome: "confirmed",
            text: "decision_outcome: confirmed",
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual([]);
  });

  it("passes against the live repository and lists the current S3 PO decisions", () => {
    const result = analyzeS4DecisionReadiness(loadS4DecisionReadinessInput());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual([
      "PLAN-DISCOVERY-07-design-bottomup-mode",
      "PLAN-DISCOVERY-10-helix-asset-visualization",
    ]);
  });
});
