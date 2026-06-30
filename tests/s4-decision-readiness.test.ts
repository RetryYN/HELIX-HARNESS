import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  analyzeS4DecisionReadiness,
  buildS4DecisionPackets,
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
    "s4-decision-packet.v1",
    "planOnly=true",
    "decisionAllowed=false",
    "decisionEvidenceChecklist",
    "outcomeRouteMatrix",
    "provenanceRequirements",
    "S4 decision source ledger (checked 2026-06-30)",
    "| source | official URL | adopted version/date | latest official status | adoption decision | S4 decision use | required field impact |",
    "|---|---|---|---|---|---|---|",
    "| Scrum Guide 2020 | https://scrumguides.org/scrum-guide.html | November 2020 guide | current official Scrum Guide page | adopt-current-guide | inspect-adapt input | stakeholder_review_or_proxy |",
    "| ISO/IEC/IEEE 29148 | https://www.iso.org/standard/72089.html | ISO/IEC/IEEE 29148:2018 | current ISO standard page | adopt-2018-page-as-official-reference | requirements trace | acceptance_gap |",
    "| ISTQB Glossary | https://glossary.istqb.org/ | live official glossary | live official glossary | adopt-live-terms-with-ledger-date | test basis terms | verified_evidence |",
    "| NIST SSDF SP 800-218 | https://csrc.nist.gov/pubs/sp/800/218/final / https://csrc.nist.gov/pubs/sp/800/218/r1/ipd | final publication 1.1 | Rev. 1 initial public draft v1.2 | adopt-final-1.1; track-draft-do-not-adopt-until-final | residual risk | unresolved_risk |",
    "source_status_delta",
    "adoption_decision_delta",
    "workflow_route_impact",
    "date-only refresh",
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
          "- forward_route: confirmed route to L3 Forward design",
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

  it("emits a non-destructive S4 decision packet for S3 pending PoC plans", () => {
    const packets = buildS4DecisionPackets(input());
    expect(packets).toHaveLength(1);
    const packet = packets[0];

    expect(packet).toMatchObject({
      schemaVersion: "s4-decision-packet.v1",
      planId: "PLAN-DISCOVERY-900",
      status: "pending_po_decision",
      planOnly: true,
      mustNotDecide: true,
      decisionCommandAvailable: false,
      decisionAllowed: false,
    });
    expect(packet.allowedOutcomes).toEqual(["confirmed", "rejected", "pivot"]);
    expect(packet.decisionRecord.forward_route).toContain("L3 Forward design");
    expect(packet.blockedReasons).toContain(
      "plan remains S3 draft; PO/S4 decision_outcome has not been recorded",
    );
    expect(packet.nextWorkflowRoutes.map((route) => route.outcome)).toEqual([
      "confirmed",
      "rejected",
      "pivot",
    ]);
    expect(packet.decisionEvidenceChecklist).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "verified_evidence",
          decisionUse: expect.stringContaining("S3 verification"),
        }),
        expect.objectContaining({
          field: "acceptance_gap",
          decisionUse: expect.stringContaining("confirm"),
        }),
        expect.objectContaining({
          field: "route_impact",
          decisionUse: expect.stringContaining("Forward/Reverse/backlog"),
        }),
      ]),
    );
    expect(packet.outcomeRouteMatrix).toEqual([
      expect.objectContaining({
        outcome: "confirmed",
        terminalStatus: "confirmed or completed",
        routePolicy: expect.stringContaining("Forward/Reverse"),
      }),
      expect.objectContaining({
        outcome: "rejected",
        terminalStatus: "archived",
      }),
      expect.objectContaining({
        outcome: "pivot",
        terminalStatus: "archived",
        routePolicy: expect.stringContaining("S0/S1"),
      }),
    ]);
    expect(packet.provenanceRequirements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ item: "decision_record" }),
        expect.objectContaining({ item: "green_evidence" }),
        expect.objectContaining({ item: "route_and_fullback" }),
      ]),
    );
    expect(packet.relatedDecisionPackets).toEqual([
      expect.objectContaining({
        role: "primary",
        command: "ut-tdd s4 decision-packet --json",
      }),
    ]);
  });

  it("keeps supporting action-binding approval visible on S4 packets", () => {
    const packets = buildS4DecisionPackets(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-902.md",
            plan_id: "PLAN-DISCOVERY-902",
            kind: "poc",
            status: "draft",
            workflowPhase: "S3",
            decisionOutcome: null,
            text: `${input().plans[0].text}\nrequires action-binding approval before external execution`,
          },
        ],
      }),
    );

    expect(packets[0].relatedDecisionPackets).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          role: "primary",
          command: "ut-tdd s4 decision-packet --json",
        }),
        expect.objectContaining({
          role: "supporting",
          command: "ut-tdd action-binding approval-packet --json",
        }),
      ]),
    );
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
              "- forward_route: confirmed route to L3 Forward design",
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

  it("U-DECISIONREC-005: fails terminal S4 PoC plans that have decision_outcome without a structured record", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-906.md",
            plan_id: "PLAN-DISCOVERY-906",
            kind: "poc",
            status: "confirmed",
            workflowPhase: "S4",
            decisionOutcome: "confirmed",
            text: "decision_outcome: confirmed",
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-DISCOVERY-906", reason: "missing structured s4_decision_record" },
        { subject: "PLAN-DISCOVERY-906", reason: "missing structured decision_owner" },
        { subject: "PLAN-DISCOVERY-906", reason: "missing structured verified_evidence" },
        {
          subject: "PLAN-DISCOVERY-906",
          reason: "missing structured promotion_strategy_or_rejection_pivot_rationale",
        },
      ]),
    );
  });

  it("U-DECISIONREC-006: fails confirmed S4 decisions whose record contradicts promotion semantics", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-907.md",
            plan_id: "PLAN-DISCOVERY-907",
            kind: "poc",
            status: "confirmed",
            workflowPhase: "S4",
            decisionOutcome: "confirmed",
            text: [
              "decision_outcome: confirmed",
              "s4_decision_record:",
              "- allowed_outcome: `confirmed` / `rejected` / `pivot`",
              "- decision_owner: PO",
              "- decision_basis: verified evidence",
              "- verified_evidence: targeted tests and review evidence",
              "- stakeholder_review_or_proxy: PO/TL proxy review",
              "- acceptance_gap: none",
              "- unresolved_risk: none",
              "- external_source_basis: docs/process/modes/discovery.md",
              "- route_impact: confirmed but no promotion route",
              "- forward_route: none; archive only",
              "- reverse_fullback_required: maybe",
              "- promotion_strategy_or_rejection_pivot_rationale: reject the spike; no feature promotion",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-DISCOVERY-907",
          reason:
            "confirmed decision requires forward_route to name a Forward/Reverse promotion target",
        },
        {
          subject: "PLAN-DISCOVERY-907",
          reason: "confirmed decision requires reverse_fullback_required to be yes or no",
        },
        {
          subject: "PLAN-DISCOVERY-907",
          reason:
            "confirmed decision requires promotion_strategy_or_rejection_pivot_rationale to include reuse-as-is, reuse-with-hardening, or redesign",
        },
      ]),
    );
  });

  it("U-DECISIONREC-006: fails rejected S4 decisions that still look like feature promotion", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-908.md",
            plan_id: "PLAN-DISCOVERY-908",
            kind: "poc",
            status: "confirmed",
            workflowPhase: "S4",
            decisionOutcome: "rejected",
            text: [
              "decision_outcome: rejected",
              "s4_decision_record:",
              "- allowed_outcome: `confirmed` / `rejected` / `pivot`",
              "- decision_owner: PO",
              "- decision_basis: acceptance gap remains",
              "- verified_evidence: targeted tests and review evidence",
              "- stakeholder_review_or_proxy: PO/TL proxy review",
              "- acceptance_gap: mandatory scenario failed",
              "- unresolved_risk: unbounded implementation risk",
              "- external_source_basis: docs/process/modes/discovery.md",
              "- route_impact: rejected due acceptance gap",
              "- forward_route: PLAN-L3-99-promote-rejected-spike",
              "- reverse_fullback_required: yes",
              "- promotion_strategy_or_rejection_pivot_rationale: rejected due acceptance gap",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-DISCOVERY-908",
          reason: "rejected S4 decision must archive the PoC plan",
        },
        {
          subject: "PLAN-DISCOVERY-908",
          reason: "rejected decision must not name a Forward promotion route",
        },
      ]),
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
      "s4-decision-packet.v1",
      "planOnly=true",
      "decisionAllowed=false",
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
      "s4-decision-packet.v1",
      "planOnly=true",
      "decisionAllowed=false",
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

  it("exposes live S3 pending PoC work through the CLI S4 decision packet surface", () => {
    const raw = execFileSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "s4",
        "decision-packet",
        "--plan",
        "PLAN-DISCOVERY-10-helix-asset-visualization",
        "--json",
      ],
      { encoding: "utf8" },
    );
    const packets = JSON.parse(raw);
    expect(packets).toHaveLength(1);
    expect(packets[0]).toMatchObject({
      schemaVersion: "s4-decision-packet.v1",
      planId: "PLAN-DISCOVERY-10-helix-asset-visualization",
      status: "pending_po_decision",
      planOnly: true,
      mustNotDecide: true,
      decisionCommandAvailable: false,
      decisionAllowed: false,
    });
    expect(packets[0].allowedOutcomes).toEqual(["confirmed", "rejected", "pivot"]);
    expect(packets[0].blockedReasons).toEqual(
      expect.arrayContaining([
        "plan remains S3 draft; PO/S4 decision_outcome has not been recorded",
      ]),
    );
    expect(packets[0].decisionRecord.forward_route).toContain("L3 visualization");
    expect(packets[0].decisionEvidenceChecklist.map((row: { field: string }) => row.field)).toEqual(
      [
        "verified_evidence",
        "stakeholder_review_or_proxy",
        "acceptance_gap",
        "unresolved_risk",
        "external_source_basis",
        "route_impact",
      ],
    );
    expect(packets[0].outcomeRouteMatrix.map((row: { outcome: string }) => row.outcome)).toEqual([
      "confirmed",
      "rejected",
      "pivot",
    ]);
    expect(packets[0].provenanceRequirements.map((row: { item: string }) => row.item)).toEqual([
      "decision_record",
      "green_evidence",
      "stakeholder_or_proxy_review",
      "route_and_fullback",
      "source_ledger",
    ]);
  });
});
