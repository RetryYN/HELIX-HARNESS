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
    "verified_evidence",
    "stakeholder_review_or_proxy",
    "acceptance_gap",
    "unresolved_risk",
    "external_source_basis",
    "route_impact",
    "forward_route",
    "reverse_fullback_required",
    "promotion_strategy_or_rejection_pivot_rationale",
    "S4 decision source ledger (checked 2026-06-30)",
    "| source | official URL | adopted version/date | latest official status | adoption decision | S4 decision use | required field impact |",
    "|---|---|---|---|---|---|---|",
    "| Scrum Guide 2020 | https://scrumguides.org/scrum-guide.html | November 2020 guide | current official Scrum Guide page | adopt-current-guide | inspect-adapt input | stakeholder_review_or_proxy |",
    "| ISO/IEC/IEEE 29148 | https://www.iso.org/standard/72089.html | ISO/IEC/IEEE 29148:2018 | current ISO standard page | adopt-2018-page-as-official-reference | requirements trace | acceptance_gap |",
    "| ISTQB Glossary | https://glossary.istqb.org/ | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | test basis terms | verified_evidence |",
    "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final / https://csrc.nist.gov/pubs/sp/800/218/r1/ipd | final publication 1.1 | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | residual risk | unresolved_risk |",
  ].join("\n");
  return {
    discoveryMd: modeDoc,
    scrumMd: modeDoc,
    outstandingTs: [
      "s4_decision_record with allowed_outcome confirmed / rejected / pivot",
      "decision_owner and decision_basis recorded before terminal status",
      "forward_route / reverse_fullback_required recorded when confirmed",
      "promotion_strategy_or_rejection_pivot_rationale recorded before terminal status",
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
          "- verified_evidence: targeted tests and review evidence",
          "- stakeholder_review_or_proxy: PO/TL proxy review",
          "- acceptance_gap: none",
          "- unresolved_risk: none",
          "- external_source_basis: docs/process/modes/discovery.md",
          "- route_impact: confirmed routes forward; rejected/pivot returns backlog",
          "- forward_route: confirmed route",
          "- reverse_fullback_required: yes",
          "- promotion_strategy_or_rejection_pivot_rationale: reuse-with-hardening or reject/pivot rationale",
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
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured verified_evidence" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured acceptance_gap" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured route_impact" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured reverse_fullback_required" },
        {
          subject: "PLAN-DISCOVERY-901",
          reason: "missing structured promotion_strategy_or_rejection_pivot_rationale",
        },
      ]),
    );
  });

  it("U-DECISIONREC-001: fails S4 records that do not decompose the decision basis", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-904.md",
            plan_id: "PLAN-DISCOVERY-904",
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
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-DISCOVERY-904", reason: "missing structured verified_evidence" },
        { subject: "PLAN-DISCOVERY-904", reason: "missing structured stakeholder_review_or_proxy" },
        { subject: "PLAN-DISCOVERY-904", reason: "missing structured acceptance_gap" },
        { subject: "PLAN-DISCOVERY-904", reason: "missing structured unresolved_risk" },
        { subject: "PLAN-DISCOVERY-904", reason: "missing structured external_source_basis" },
        { subject: "PLAN-DISCOVERY-904", reason: "missing structured route_impact" },
        {
          subject: "PLAN-DISCOVERY-904",
          reason: "missing structured promotion_strategy_or_rejection_pivot_rationale",
        },
      ]),
    );
  });

  it("U-DECISIONREC-004: fails S4 records whose allowed_outcome set drifts from the design enum", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-905.md",
            plan_id: "PLAN-DISCOVERY-905",
            kind: "poc",
            status: "draft",
            workflowPhase: "S3",
            decisionOutcome: null,
            text: [
              "s4_decision_record:",
              "- allowed_outcome: `confirmed` / `ship_anyway`",
              "- decision_owner: PO",
              "- decision_basis: verified evidence",
              "- verified_evidence: targeted tests and review evidence",
              "- stakeholder_review_or_proxy: PO/TL proxy review",
              "- acceptance_gap: none",
              "- unresolved_risk: none",
              "- external_source_basis: docs/process/modes/discovery.md",
              "- route_impact: confirmed routes forward; rejected/pivot returns backlog",
              "- forward_route: confirmed route",
              "- reverse_fullback_required: yes",
              "- promotion_strategy_or_rejection_pivot_rationale: reuse-with-hardening or reject/pivot rationale",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((v) => v.reason)).toContain(
      "invalid allowed_outcome set for s4_decision_record: missing allowed_outcome rejected,pivot; unknown allowed_outcome ship_anyway",
    );
  });

  it("fails when S4 decision source ledgers lose adoption decisions or required rows", () => {
    const modeDoc = [
      "s4_decision_record",
      "allowed_outcome",
      "decision_owner",
      "decision_basis",
      "verified_evidence",
      "stakeholder_review_or_proxy",
      "acceptance_gap",
      "unresolved_risk",
      "external_source_basis",
      "route_impact",
      "forward_route",
      "reverse_fullback_required",
      "promotion_strategy_or_rejection_pivot_rationale",
      "S4 decision source ledger (checked 2026-06-30)",
      "| source | official URL | adopted version/date | latest official status | adoption decision | S4 decision use | required field impact |",
      "|---|---|---|---|---|---|---|",
      "| Scrum Guide 2020 | https://scrumguides.org/scrum-guide.html | November 2020 guide | current official Scrum Guide page | - | inspect-adapt input | stakeholder_review_or_proxy |",
    ].join("\n");

    const result = analyzeS4DecisionReadiness(input({ discoveryMd: modeDoc, scrumMd: modeDoc }));

    expect(result.ok).toBe(false);
    expect(result.missingSourceLedgerRows).toContain("ISO/IEC/IEEE 29148");
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/modes/discovery.md",
      reason: "S4 decision source ledger Scrum Guide 2020 has empty adoption decision",
    });
  });

  it("fails when S4 decision source ledgers have stale checked dates", () => {
    // U-SOURCELEDGER-002
    const staleModeDoc = [
      "s4_decision_record",
      "allowed_outcome",
      "decision_owner",
      "decision_basis",
      "verified_evidence",
      "stakeholder_review_or_proxy",
      "acceptance_gap",
      "unresolved_risk",
      "external_source_basis",
      "route_impact",
      "forward_route",
      "reverse_fullback_required",
      "promotion_strategy_or_rejection_pivot_rationale",
      "S4 decision source ledger (checked 2026-01-01)",
      "| source | official URL | adopted version/date | latest official status | adoption decision | S4 decision use | required field impact |",
      "|---|---|---|---|---|---|---|",
      "| Scrum Guide 2020 | https://scrumguides.org/scrum-guide.html | November 2020 guide | current official Scrum Guide page | adopt-current-guide | inspect-adapt input | stakeholder_review_or_proxy |",
      "| ISO/IEC/IEEE 29148 | https://www.iso.org/standard/72089.html | ISO/IEC/IEEE 29148:2018 | current ISO standard page | adopt-2018-page-as-official-reference | requirements trace | acceptance_gap |",
      "| ISTQB Glossary | https://glossary.istqb.org/ | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | test basis terms | verified_evidence |",
      "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final / https://csrc.nist.gov/pubs/sp/800/218/r1/ipd | final publication 1.1 | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | residual risk | unresolved_risk |",
    ].join("\n");

    const result = analyzeS4DecisionReadiness(
      input({ discoveryMd: staleModeDoc, scrumMd: staleModeDoc }),
    );

    expect(result.ok).toBe(false);
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/modes/discovery.md",
      reason: "S4 decision source ledger checked date is stale: 2026-01-01 (180d > 90d)",
    });
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/modes/scrum.md",
      reason: "S4 decision source ledger checked date is stale: 2026-01-01 (180d > 90d)",
    });
  });

  it("accepts refreshed S4 decision source ledger checked dates without losing table rows", () => {
    // U-SOURCELEDGER-005
    const refreshed = input().discoveryMd.replace(
      "S4 decision source ledger (checked 2026-06-30)",
      "S4 decision source ledger (checked 2026-06-15)",
    );

    const result = analyzeS4DecisionReadiness(
      input({ discoveryMd: refreshed, scrumMd: refreshed }),
    );

    expect(result.ok).toBe(true);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
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

  it("U-DECISIONREC-001: fails S3 PoC plans that place decision_outcome before S4", () => {
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

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-DISCOVERY-902",
      reason: "decision_outcome requires workflow_phase=S4",
    });
    expect(result.pendingPlanIds).toEqual([]);
  });

  it("passes against the live repository and lists the current S3 PO decisions", () => {
    const result = analyzeS4DecisionReadiness(loadS4DecisionReadinessInput());
    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual([
      "PLAN-DISCOVERY-07-design-bottomup-mode",
      "PLAN-DISCOVERY-10-helix-asset-visualization",
    ]);
    expect(result.missingSourceLedgerRows).toEqual([]);
    expect(result.sourceLedgerViolations).toEqual([]);
  });
});
