import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import {
  analyzeS4DecisionReadiness,
  buildS4DecisionPackets,
  loadS4DecisionReadinessInput,
  type S4DecisionReadinessInput,
  s4DecisionReadinessMessages,
  s4DecisionVerificationCommandViolations,
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
    "source_ledger_freshness",
    "route_impact",
    "forward_route",
    "reverse_fullback_required",
    "promotion_strategy_or_rejection_pivot_rationale",
    "s4-decision-packet.v1",
    "planOnly=true",
    "decisionAllowed=false",
    "decisionEvidenceChecklist",
    "outcomeRouteMatrix",
    "decisionVerificationCommandMatrix",
    "executable verification command",
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
    semanticFeatureFrontierRecords: [
      {
        recordName: "semantic_feature_frontier_record",
        planId: "PLAN-DISCOVERY-900",
        featureId: "design_bottomup_mode",
        classification: "frontier_pending_decision",
        completionClaimAllowed: false,
        blockers: ["po_decision_pending"],
        requiredRoute: "S4 decide -> Reverse/Forward merge only after decision_outcome is recorded",
        reason: "po_decision_pending",
        sourcePaths: [
          "docs/process/modes/discovery.md",
          "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
        ],
      },
    ],
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
          "- source_ledger_freshness: fresh S4 decision source ledger checked 2026-06-30",
          "- source_status_delta: none",
          "- adoption_decision_delta: none",
          "- workflow_route_impact: none before S4 decision",
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

  it("fails S4 records whose source_ledger_freshness does not cite the current ledger checked date", () => {
    const base = input();
    const result = analyzeS4DecisionReadiness(
      input({
        discoveryMd: base.discoveryMd.replace(
          "S4 decision source ledger (checked 2026-06-30)",
          "S4 decision source ledger (checked 2026-07-02)",
        ),
        scrumMd: base.scrumMd.replace(
          "S4 decision source ledger (checked 2026-06-30)",
          "S4 decision source ledger (checked 2026-07-02)",
        ),
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-DISCOVERY-900",
      reason:
        "source_ledger_freshness checked date must match current S4 decision source ledger checked 2026-07-02",
    });
  });

  it("fails S4 records that omit source ledger meaning-review fields", () => {
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
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured source_ledger_freshness" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured source_status_delta" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured adoption_decision_delta" },
        { subject: "PLAN-DISCOVERY-901", reason: "missing structured workflow_route_impact" },
      ]),
    );
  });

  it("fails S4 records whose source ledger meaning-review fields are placeholders", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-902.md",
            plan_id: "PLAN-DISCOVERY-902",
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
              "- source_ledger_freshness: source_ledger_freshness",
              "- source_status_delta: source_status_delta",
              "- adoption_decision_delta: adoption_decision_delta",
              "- workflow_route_impact: workflow_route_impact",
              "- route_impact: confirmed routes forward; rejected/pivot returns backlog",
              "- forward_route: confirmed route to L3 Forward design",
              "- reverse_fullback_required: yes",
              "- promotion_strategy_or_rejection_pivot_rationale: reuse-with-hardening or reject/pivot rationale",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations.map((violation) => violation.reason)).toEqual(
      expect.arrayContaining([
        "structured source_ledger_freshness must not be placeholder",
        "structured source_status_delta must not be placeholder",
        "structured adoption_decision_delta must not be placeholder",
        "structured workflow_route_impact must not be placeholder",
      ]),
    );
  });

  it("U-DECISIONREC-013: emits a non-destructive S4 decision packet with verification commands for S3 pending PoC plans", () => {
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
    expect(packet.semanticFeatureFrontierRecord).toMatchObject({
      recordName: "semantic_feature_frontier_record",
      planId: "PLAN-DISCOVERY-900",
      featureId: "design_bottomup_mode",
      classification: "frontier_pending_decision",
      completionClaimAllowed: false,
    });
    expect(packet.decisionRecord.forward_route).toContain("L3 Forward design");
    expect(packet.recordTemplates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordName: "s4_decision_record",
          yamlLines: expect.arrayContaining([
            "s4_decision_record:",
            '  - allowed_outcome: "<confirmed|rejected|pivot>"',
            '  - decision_owner: "<decision_owner>"',
          ]),
        }),
      ]),
    );
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
    expect(packet.decisionVerificationCommandMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "decision-packet-baseline",
          command: "bun run src/cli.ts s4 decision-packet --plan PLAN-DISCOVERY-900 --json",
          sourceCheckedAt: "2026-07-02",
          adoptionDecision: "adopt-current-s4-packet-contract-for-po-decision-review",
        }),
        expect.objectContaining({
          phase: "s3-verification-evidence",
          command: "bun run src/cli.ts doctor",
          evidence: expect.stringContaining("s4-decision-readiness"),
        }),
        expect.objectContaining({
          phase: "requirements-trace",
          expected: expect.stringContaining("G1/G3 trace"),
          sourceUrl: "docs/governance/ut-tdd-agent-harness-requirements_v1.2.md",
          sourceStatusDelta: expect.stringContaining("G1/G3 trace"),
        }),
        expect.objectContaining({
          phase: "full-regression",
          command: "bun run test",
          source: "HELIX full regression policy",
          adoptionDecision: "adopt-full-regression-before-terminal-s4-route",
        }),
        expect.objectContaining({
          phase: "completion-frontier",
          command: "bun run src/cli.ts status --json",
          sourceUrl: "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
          workflowRouteImpact: expect.stringContaining("completionReadiness blocked"),
        }),
      ]),
    );
    for (const row of packet.decisionVerificationCommandMatrix) {
      expect(row.sourceCheckedAt, row.phase).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.latestOfficialStatus, row.phase).not.toBe("");
      expect(row.sourceStatusDelta, row.phase).not.toBe("");
      expect(row.adoptionDecision, row.phase).not.toBe("");
      expect(row.adoptionDecisionDelta, row.phase).not.toBe("");
      expect(row.workflowRouteImpact, row.phase).not.toBe("");
    }
    expect(s4DecisionVerificationCommandViolations(packet)).toEqual([]);
    expect(
      s4DecisionVerificationCommandViolations({
        ...packet,
        decisionVerificationCommandMatrix: packet.decisionVerificationCommandMatrix.map((row) =>
          row.phase === "s3-verification-evidence"
            ? {
                ...row,
                command:
                  "run the PLAN-declared S3 verification command(s) cited by verified_evidence",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-DISCOVERY-900.s3-verification-evidence",
        reason:
          "decisionVerificationCommandMatrix command is not an executable approved surface: run the PLAN-declared S3 verification command(s) cited by verified_evidence",
      },
    ]);
    expect(
      s4DecisionVerificationCommandViolations({
        ...packet,
        decisionVerificationCommandMatrix: packet.decisionVerificationCommandMatrix.map((row) =>
          row.phase === "source-ledger-freshness"
            ? {
                ...row,
                sourceCheckedAt: "2026-01-01",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-DISCOVERY-900.source-ledger-freshness",
        reason: expect.stringMatching(
          /^decisionVerificationCommandMatrix sourceCheckedAt is stale: 2026-01-01 \(\d+d > 90d\)$/,
        ),
      },
    ]);
    expect(
      s4DecisionVerificationCommandViolations({
        ...packet,
        decisionVerificationCommandMatrix: packet.decisionVerificationCommandMatrix.map((row) =>
          row.phase === "source-ledger-freshness"
            ? {
                ...row,
                sourceCheckedAt: "2999-01-01",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-DISCOVERY-900.source-ledger-freshness",
        reason: "decisionVerificationCommandMatrix sourceCheckedAt is in the future: 2999-01-01",
      },
    ]);
    expect(
      s4DecisionVerificationCommandViolations({
        ...packet,
        decisionVerificationCommandMatrix: packet.decisionVerificationCommandMatrix.map((row) =>
          row.phase === "source-ledger-freshness"
            ? {
                ...row,
                latestOfficialStatus: "TODO",
                workflowRouteImpact: "-",
              }
            : row,
        ),
      }),
    ).toEqual([
      {
        subject: "PLAN-DISCOVERY-900.source-ledger-freshness",
        reason: "decisionVerificationCommandMatrix latestOfficialStatus is missing or placeholder",
      },
      {
        subject: "PLAN-DISCOVERY-900.source-ledger-freshness",
        reason: "decisionVerificationCommandMatrix workflowRouteImpact is missing or placeholder",
      },
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
    expect(packet.generatedAt).toEqual(expect.any(String));
    expect(packet.sourceCommand).toBe("ut-tdd s4 decision-packet --json");
    expect(packet.freshness).toEqual({
      validForMinutes: 1440,
      expiresAt: expect.any(String),
      stale: false,
      policy: "decision-packet-freshness.v1",
    });
  });

  it("keeps S4 draft PoC plans without decision_outcome in the PO decision packet frontier", () => {
    const s4PendingPlan = {
      ...input().plans[0],
      workflowPhase: "S4",
      decisionOutcome: null,
    };
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [s4PendingPlan],
      }),
    );
    const packets = buildS4DecisionPackets(
      input({
        plans: [s4PendingPlan],
      }),
    );

    expect(result.ok).toBe(true);
    expect(result.pendingPlanIds).toEqual(["PLAN-DISCOVERY-900"]);
    expect(packets).toHaveLength(1);
    expect(packets[0]).toMatchObject({
      planId: "PLAN-DISCOVERY-900",
      status: "pending_po_decision",
      decisionAllowed: false,
    });
    expect(packets[0].blockedReasons).toContain(
      "plan is already in S4 draft; PO/S4 decision_outcome has not been recorded",
    );
  });

  it("fails S3 pending PoC plans that are detached from live semantic frontier records", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        semanticFeatureFrontierRecords: [],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-DISCOVERY-900",
      reason: "missing semantic_feature_frontier_record for frontier_pending_decision",
    });
  });

  it("fails S3 pending PoC semantic frontier records with wrong classification or missing L3 source", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        semanticFeatureFrontierRecords: [
          {
            recordName: "semantic_feature_frontier_record",
            planId: "PLAN-DISCOVERY-900",
            featureId: "design_bottomup_mode",
            classification: "parked_future_version",
            completionClaimAllowed: false,
            blockers: ["po_decision_pending"],
            requiredRoute: "S4 decide",
            reason: "po_decision_pending",
            sourcePaths: ["docs/process/modes/discovery.md"],
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        {
          subject: "PLAN-DISCOVERY-900",
          reason:
            "semantic_feature_frontier_record classification parked_future_version expected frontier_pending_decision",
        },
      ]),
    );

    const semanticRecord = input().semanticFeatureFrontierRecords?.[0];
    if (!semanticRecord) throw new Error("missing S4 semantic frontier fixture");
    const missingL3 = analyzeS4DecisionReadiness(
      input({
        semanticFeatureFrontierRecords: [
          {
            ...semanticRecord,
            sourcePaths: ["docs/process/modes/discovery.md"],
          },
        ],
      }),
    );
    expect(missingL3.violations).toContainEqual({
      subject: "PLAN-DISCOVERY-900",
      reason:
        "semantic_feature_frontier_record sourcePaths must include docs/design/helix/L3-requirements/pillar-functional-requirements.md",
    });
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
    expect(packets[0].blockedReasons).toContain(
      "same PLAN also requires action-binding approval before high-impact execution",
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
              "- allowed_outcome: `confirmed`",
              "- decision_owner: PO",
              "- decision_basis: verified evidence",
              "- verified_evidence: targeted tests and review evidence",
              "- stakeholder_review_or_proxy: PO/TL proxy review",
              "- acceptance_gap: none",
              "- unresolved_risk: none",
              "- external_source_basis: docs/process/modes/discovery.md",
              "- source_ledger_freshness: fresh S4 decision source ledger checked 2026-06-30",
              "- source_status_delta: none",
              "- adoption_decision_delta: none",
              "- workflow_route_impact: none before S4 decision",
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

  it("fails terminal S4 decisions whose allowed_outcome still lists the enum instead of the selected outcome", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-907B.md",
            plan_id: "PLAN-DISCOVERY-907B",
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
              "- source_ledger_freshness: fresh S4 decision source ledger checked 2026-06-30",
              "- source_status_delta: none",
              "- adoption_decision_delta: none",
              "- workflow_route_impact: none before S4 decision",
              "- route_impact: confirmed routes forward",
              "- forward_route: PLAN-L3-99-confirmed-forward-route",
              "- reverse_fullback_required: yes",
              "- promotion_strategy_or_rejection_pivot_rationale: reuse-with-hardening",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(false);
    expect(result.violations).toContainEqual({
      subject: "PLAN-DISCOVERY-907B",
      reason:
        "invalid selected allowed_outcome for s4_decision_record: allowed_outcome must select exactly one outcome, found=confirmed,rejected,pivot",
    });
  });

  it("accepts terminal S4 decisions whose allowed_outcome selects the recorded decision_outcome", () => {
    const result = analyzeS4DecisionReadiness(
      input({
        plans: [
          {
            file: "PLAN-DISCOVERY-907C.md",
            plan_id: "PLAN-DISCOVERY-907C",
            kind: "poc",
            status: "confirmed",
            workflowPhase: "S4",
            decisionOutcome: "confirmed",
            text: [
              "decision_outcome: confirmed",
              "s4_decision_record:",
              "- allowed_outcome: `confirmed`",
              "- decision_owner: PO",
              "- decision_basis: verified evidence",
              "- verified_evidence: targeted tests and review evidence",
              "- stakeholder_review_or_proxy: PO/TL proxy review",
              "- acceptance_gap: none",
              "- unresolved_risk: none",
              "- external_source_basis: docs/process/modes/discovery.md",
              "- source_ledger_freshness: fresh S4 decision source ledger checked 2026-06-30",
              "- source_status_delta: none",
              "- adoption_decision_delta: none",
              "- workflow_route_impact: none before S4 decision",
              "- route_impact: confirmed routes forward",
              "- forward_route: PLAN-L3-99-confirmed-forward-route",
              "- reverse_fullback_required: yes",
              "- promotion_strategy_or_rejection_pivot_rationale: reuse-with-hardening",
            ].join("\n"),
          },
        ],
      }),
    );

    expect(result.ok).toBe(true);
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
              "- allowed_outcome: `rejected`",
              "- decision_owner: PO",
              "- decision_basis: acceptance gap remains",
              "- verified_evidence: targeted tests and review evidence",
              "- stakeholder_review_or_proxy: PO/TL proxy review",
              "- acceptance_gap: mandatory scenario failed",
              "- unresolved_risk: unbounded implementation risk",
              "- external_source_basis: docs/process/modes/discovery.md",
              "- source_ledger_freshness: fresh S4 decision source ledger checked 2026-06-30",
              "- source_status_delta: none",
              "- adoption_decision_delta: none",
              "- workflow_route_impact: none before S4 decision",
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
      reason: expect.stringMatching(
        /^S4 decision source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
      ),
    });
    expect(result.sourceLedgerViolations).toContainEqual({
      subject: "docs/process/modes/scrum.md",
      reason: expect.stringMatching(
        /^S4 decision source ledger checked date is stale: 2026-01-01 \(\d+d > 90d\)$/,
      ),
    });
  });

  it("accepts refreshed S4 decision source ledger checked dates without losing table rows", () => {
    // U-SOURCELEDGER-005
    const base = input();
    const refreshed = base.discoveryMd.replace(
      "S4 decision source ledger (checked 2026-06-30)",
      "S4 decision source ledger (checked 2026-06-15)",
    );
    const refreshedPlan = {
      ...base.plans[0],
      text: base.plans[0].text.replace(
        "fresh S4 decision source ledger checked 2026-06-30",
        "fresh S4 decision source ledger checked 2026-06-15",
      ),
    };

    const result = analyzeS4DecisionReadiness(
      input({ discoveryMd: refreshed, scrumMd: refreshed, plans: [refreshedPlan] }),
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
      generatedAt: expect.any(String),
      sourceCommand: "ut-tdd s4 decision-packet --json",
      freshness: {
        validForMinutes: 1440,
        expiresAt: expect.any(String),
        stale: false,
        policy: "decision-packet-freshness.v1",
      },
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
    expect(packets[0].decisionVerificationCommandMatrix).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          phase: "decision-packet-baseline",
          command:
            "bun run src/cli.ts s4 decision-packet --plan PLAN-DISCOVERY-10-helix-asset-visualization --json",
        }),
        expect.objectContaining({
          phase: "targeted-regression",
          command: "bun test tests/s4-decision-readiness.test.ts tests/cli-surface.test.ts",
          adoptionDecision: "adopt-targeted-regression-before-s4-decision-review",
        }),
        expect.objectContaining({
          phase: "completion-frontier",
          command: "bun run src/cli.ts status --json",
          sourceCheckedAt: "2026-07-02",
        }),
      ]),
    );
    for (const row of packets[0].decisionVerificationCommandMatrix) {
      expect(row.sourceCheckedAt, row.phase).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(row.latestOfficialStatus, row.phase).not.toBe("");
      expect(row.sourceStatusDelta, row.phase).not.toBe("");
      expect(row.adoptionDecision, row.phase).not.toBe("");
      expect(row.adoptionDecisionDelta, row.phase).not.toBe("");
      expect(row.workflowRouteImpact, row.phase).not.toBe("");
    }
    expect(s4DecisionVerificationCommandViolations(packets[0])).toEqual([]);
    expect(packets[0].provenanceRequirements.map((row: { item: string }) => row.item)).toEqual([
      "decision_record",
      "green_evidence",
      "stakeholder_or_proxy_review",
      "route_and_fullback",
      "source_ledger",
    ]);
    expect(packets[0].recordTemplates).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          recordName: "s4_decision_record",
          yamlLines: expect.arrayContaining(['  - allowed_outcome: "<confirmed|rejected|pivot>"']),
        }),
        expect.objectContaining({
          recordName: "action_binding_approval_record",
          yamlLines: expect.arrayContaining([
            '  - approved_actor: "<approved_actor>"',
            '  - reviewed_snapshot_binding: "<activationSnapshot.snapshotId|cutoverSnapshot.snapshotId|no-snapshot basis>"',
          ]),
        }),
      ]),
    );

    const text = execFileSync(
      "bun",
      [
        "run",
        "src/cli.ts",
        "s4",
        "decision-packet",
        "--plan",
        "PLAN-DISCOVERY-10-helix-asset-visualization",
      ],
      { encoding: "utf8" },
    );
    expect(text).toContain("evidence-checks=6");
    expect(text).toContain("outcome-routes=3");
    expect(text).toContain("verification-commands=8");
    expect(text).toContain("record-template s4_decision_record");
    expect(text).toContain("record-template action_binding_approval_record");
    expect(text).toContain(
      "verification-source: requirements-trace source=HELIX V-model trace gate sourceUrl=docs/governance/ut-tdd-agent-harness-requirements_v1.2.md",
    );
    expect(text).toContain("writePolicy=no-write command=bun run src/cli.ts doctor");
    expect(text).toContain(
      "verification-source: completion-frontier source=HELIX completion frontier contract sourceUrl=docs/design/helix/L3-requirements/pillar-functional-requirements.md",
    );
  });
});
