import { describe, expect, it } from "vitest";
import {
  analyzeSemanticFrontierConsistency,
  loadSemanticFrontierConsistencyInput,
  type SemanticFrontierConsistencyInput,
  semanticFrontierConsistencyMessages,
} from "../src/lint/semantic-frontier-consistency";

const L1_MARKERS = [
  "HBR-P0",
  "HBR-P1",
  "HBR-P2",
  "HBR-P3",
  "HBR-P4",
  "HBR-P6",
  "HBR-P7",
  "HBR-P8",
  "HBR-P9",
  "HNFR-P3",
  "HNFR-P5",
  "HNFR-P8",
  "HNFR-AC",
];

const L3_IDS = [
  "HR-FR-P0-01",
  "HR-FR-P0-02",
  "HR-FR-P1-01",
  "HR-FR-P1-02",
  "HR-FR-P1-03",
  "HR-FR-P1-04",
  "HR-FR-P2-01",
  "HR-FR-P2-02",
  "HR-FR-P2-03",
  "HR-FR-P2-04",
  "HR-FR-P3-01",
  "HR-FR-P3-02",
  "HR-FR-P4-01",
  "HR-FR-P4-02",
  "HR-FR-P4-03",
  "HR-FR-P6-01",
  "HR-FR-P6-02",
  "HR-FR-P6-03",
  "HR-FR-P6-04",
  "HR-FR-P6-05",
  "HR-FR-P7-01",
  "HR-FR-P7-02",
  "HR-FR-P7-03",
  "HR-FR-P8-01",
  "HR-FR-P8-02",
  "HR-FR-P8-03",
  "HR-FR-P8-04",
  "HR-FR-P9-01",
  "HR-FR-P9-02",
  "HR-FR-P9-03",
  "HR-NFR-P3-01",
  "HR-NFR-P3-02",
  "HR-NFR-P3-03",
  "HR-NFR-P3-04",
  "HR-NFR-P5-01",
  "HR-NFR-P5-02",
  "HR-NFR-P5-03",
  "HR-NFR-P8-01",
  "HR-NFR-P8-02",
  "HR-NFR-P8-03",
  "HR-NFR-AC-01",
  "HR-NFR-AC-02",
  "HR-NFR-AC-03",
];

const L12_IDS = [
  "HAT-P0-01",
  "HAT-P0-02",
  "HAT-P1-01",
  "HAT-P1-02",
  "HAT-P1-03",
  "HAT-P1-04",
  "HAT-P2-01",
  "HAT-P2-02",
  "HAT-P2-03",
  "HAT-P2-04",
  "HAT-P3-01",
  "HAT-P3-02",
  "HAT-P4-01",
  "HAT-P4-02",
  "HAT-P4-03",
  "HAT-P6-01",
  "HAT-P6-02",
  "HAT-P6-03",
  "HAT-P6-04",
  "HAT-P6-05",
  "HAT-P7-01",
  "HAT-P7-02",
  "HAT-P7-03",
  "HAT-P8-01",
  "HAT-P8-02",
  "HAT-P8-03",
  "HAT-P8-04",
  "HAT-P9-01",
  "HAT-P9-02",
  "HAT-P9-03",
  "HAT-N3-01",
  "HAT-N3-02",
  "HAT-N3-03",
  "HAT-N3-04",
  "HAT-N5-01",
  "HAT-N5-02",
  "HAT-N5-03",
  "HAT-N8-01",
  "HAT-N8-02",
  "HAT-N8-03",
  "HAT-NAC-01",
  "HAT-NAC-02",
  "HAT-NAC-03",
];

const CONFIRMED_MEANINGS = [
  {
    featureId: "forward_convergence",
    meaning: "逸脱受け止めと Forward 収束",
    l1Parents: ["HBR-P0"],
    l3RequirementIds: ["HR-FR-P0-01", "HR-FR-P0-02"],
    l12AcceptanceIds: ["HAT-P0-01", "HAT-P0-02"],
  },
  {
    featureId: "continuous_autonomy_version_up",
    meaning: "連続自律走行 / Scrum 分割 / version-up",
    l1Parents: ["HBR-P1"],
    l3RequirementIds: ["HR-FR-P1-01", "HR-FR-P1-02", "HR-FR-P1-03", "HR-FR-P1-04"],
    l12AcceptanceIds: ["HAT-P1-01", "HAT-P1-02", "HAT-P1-03", "HAT-P1-04"],
  },
  {
    featureId: "pair_agent_tdd_route",
    meaning: "agent/tool/runtime guardrail + pair-agent TDD route",
    l1Parents: ["HBR-P2", "HBR-P3", "HBR-P4"],
    l3RequirementIds: ["HR-FR-P2-01", "HR-FR-P2-02", "HR-FR-P2-03", "HR-FR-P2-04"],
    l12AcceptanceIds: ["HAT-P2-01", "HAT-P2-02", "HAT-P2-03", "HAT-P2-04"],
  },
  {
    featureId: "strong_verification",
    meaning: "強い検証 / test-first / 実装精度",
    l1Parents: ["HBR-P3", "HNFR-P3"],
    l3RequirementIds: [
      "HR-FR-P3-01",
      "HR-FR-P3-02",
      "HR-NFR-P3-01",
      "HR-NFR-P3-02",
      "HR-NFR-P3-03",
      "HR-NFR-P3-04",
    ],
    l12AcceptanceIds: [
      "HAT-P3-01",
      "HAT-P3-02",
      "HAT-N3-01",
      "HAT-N3-02",
      "HAT-N3-03",
      "HAT-N3-04",
    ],
  },
  {
    featureId: "auto_repair_metrics",
    meaning: "自動修復 / 計測改善",
    l1Parents: ["HBR-P4"],
    l3RequirementIds: ["HR-FR-P4-01", "HR-FR-P4-02", "HR-FR-P4-03"],
    l12AcceptanceIds: ["HAT-P4-01", "HAT-P4-02", "HAT-P4-03"],
  },
  {
    featureId: "github_setup_release_rename",
    meaning: "GitHub 自動化 / setup / release / rename",
    l1Parents: ["HBR-P6"],
    l3RequirementIds: ["HR-FR-P6-01", "HR-FR-P6-02", "HR-FR-P6-03", "HR-FR-P6-04", "HR-FR-P6-05"],
    l12AcceptanceIds: ["HAT-P6-01", "HAT-P6-02", "HAT-P6-03", "HAT-P6-04", "HAT-P6-05"],
  },
  {
    featureId: "shared_memory_ddd",
    meaning: "共有 memory / Glossary / DDD context",
    l1Parents: ["HBR-P7"],
    l3RequirementIds: ["HR-FR-P7-01", "HR-FR-P7-02", "HR-FR-P7-03"],
    l12AcceptanceIds: ["HAT-P7-01", "HAT-P7-02", "HAT-P7-03"],
  },
  {
    featureId: "external_grounding_security",
    meaning: "外部検索 / skillify / security boundary",
    l1Parents: ["HBR-P8", "HNFR-P8"],
    l3RequirementIds: [
      "HR-FR-P8-01",
      "HR-FR-P8-02",
      "HR-FR-P8-03",
      "HR-FR-P8-04",
      "HR-NFR-P8-01",
      "HR-NFR-P8-02",
      "HR-NFR-P8-03",
    ],
    l12AcceptanceIds: [
      "HAT-P8-01",
      "HAT-P8-02",
      "HAT-P8-03",
      "HAT-P8-04",
      "HAT-N8-01",
      "HAT-N8-02",
      "HAT-N8-03",
    ],
  },
  {
    featureId: "db_convergence_contract",
    meaning: "DB 収束 / relation graph / contract ledger",
    l1Parents: ["HBR-P9"],
    l3RequirementIds: ["HR-FR-P9-01", "HR-FR-P9-02", "HR-FR-P9-03"],
    l12AcceptanceIds: ["HAT-P9-01", "HAT-P9-02", "HAT-P9-03"],
  },
  {
    featureId: "context_efficiency",
    meaning: "context efficiency",
    l1Parents: ["HNFR-P5"],
    l3RequirementIds: ["HR-NFR-P5-01", "HR-NFR-P5-02", "HR-NFR-P5-03"],
    l12AcceptanceIds: ["HAT-N5-01", "HAT-N5-02", "HAT-N5-03"],
  },
  {
    featureId: "adapter_rule_memory_consistency",
    meaning: "adapter/rule/memory 一貫性",
    l1Parents: ["HNFR-AC"],
    l3RequirementIds: ["HR-NFR-AC-01", "HR-NFR-AC-02", "HR-NFR-AC-03"],
    l12AcceptanceIds: ["HAT-NAC-01", "HAT-NAC-02", "HAT-NAC-03"],
  },
] as const;

function confirmedCurrentMeaningRecords() {
  return CONFIRMED_MEANINGS.map((record) => ({
    recordName: "confirmed_current_meaning_record" as const,
    classification: "confirmed_current" as const,
    completionBoundary: "downstream_evidence_required" as const,
    sourcePaths: [
      "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
      "docs/test-design/helix/L3-pillar-acceptance-test-design.md",
    ],
    featureId: record.featureId,
    meaning: record.meaning,
    l1Parents: [...record.l1Parents],
    l3RequirementIds: [...record.l3RequirementIds],
    l12AcceptanceIds: [...record.l12AcceptanceIds],
  }));
}

function tableRows(ids: string[]): string {
  return ids.map((id) => `| ${id} | x | y |`).join("\n");
}

function baseInput(): SemanticFrontierConsistencyInput {
  const l3Text = [
    "§0.2 意味ベース機能一覧と要求修正境界",
    "G-SF `semantic_feature_frontier_record` への写像",
    "confirmed 43 件: `classification=confirmed_current`",
    "逸脱受け止めと Forward 収束",
    "連続自律走行 / Scrum 分割 / version-up",
    "agent/tool/runtime guardrail + pair-agent TDD route",
    "強い検証 / test-first / 実装精度",
    "自動修復 / 計測改善",
    "GitHub 自動化 / setup / release / rename",
    "共有 memory / Glossary / DDD context",
    "外部検索 / skillify / security boundary",
    "DB 収束 / relation graph / contract ledger",
    "context efficiency",
    "adapter/rule/memory 一貫性",
    "design-bottomup mode: `classification=frontier_pending_decision`。backend から FE 要件を洗い出す",
    "asset/progress visualization: `classification=frontier_pending_decision`。S4 PO decision pending",
    "`PLAN-L7-146` serverless readonly share: `classification=parked_future_version`。activation decision",
    "PLAN-M-02 identifier rename: `classification=approval_gated_cutover`。cutover/action-binding approval",
    tableRows(L3_IDS),
  ].join("\n");
  const sharedDoc =
    "semantic_feature_frontier_record frontier_pending_decision parked_future_version approval_gated_cutover";
  return {
    l1Text: L1_MARKERS.join("\n"),
    l3Text: `${l3Text}\n${sharedDoc}`,
    l4Text: sharedDoc,
    l5Text: sharedDoc,
    l6Text: sharedDoc,
    l12Text: `${sharedDoc}\n${tableRows(L12_IDS)}`,
    l9SystemText: sharedDoc,
    l8IntegrationText: sharedDoc,
    l7UnitText: sharedDoc,
    outstanding: {
      nonTerminalPlansByLayer: {},
      nonTerminalPlansTotal: 3,
      versionUpParked: 1,
      activeDraftTotal: 2,
      openDefers: 0,
      blockersByKind: {},
      items: [],
      completionReadiness: {
        ok: false,
        status: "blocked",
        reason: "blocked",
        blockers: [],
        authorityBoundary: "automation_work_required",
        humanDecisionRequired: false,
        humanDecisionBlockers: [],
        workflowStateBlockers: [],
        autonomousWorkBlockers: [],
        nextAuthority: "automation",
        requiredActions: [],
        requiredActionsJa: [],
      },
      semanticFeatureFrontierRecords: [
        {
          recordName: "semantic_feature_frontier_record",
          planId: "PLAN-DISCOVERY-07-design-bottomup-mode",
          featureId: "design_bottomup_mode",
          classification: "frontier_pending_decision",
          completionClaimAllowed: false,
          blockers: ["po_decision_pending"],
          requiredRoute: "S4 decide",
          reason: "po_decision_pending",
          sourcePaths: [
            "docs/process/modes/discovery.md",
            "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
          ],
        },
        {
          recordName: "semantic_feature_frontier_record",
          planId: "PLAN-DISCOVERY-10-helix-asset-visualization",
          featureId: "asset_progress_visualization",
          classification: "frontier_pending_decision",
          completionClaimAllowed: false,
          blockers: ["po_decision_pending"],
          requiredRoute: "S4 decide",
          reason: "po_decision_pending",
          sourcePaths: [
            "docs/process/modes/discovery.md",
            "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
          ],
        },
        {
          recordName: "semantic_feature_frontier_record",
          planId: "PLAN-L7-146-serverless-readonly-share",
          featureId: "serverless_readonly_share",
          classification: "parked_future_version",
          completionClaimAllowed: false,
          blockers: ["version_up_parked"],
          requiredRoute: "version-up activation",
          reason: "version_up_parked",
          sourcePaths: [
            "docs/process/modes/version-up.md",
            "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
          ],
        },
        {
          recordName: "semantic_feature_frontier_record",
          planId: "PLAN-M-02-helix-identifier-rename",
          featureId: "name_cutover",
          classification: "approval_gated_cutover",
          completionClaimAllowed: false,
          blockers: ["irreversible_migration_pending"],
          requiredRoute: "L14 cutover",
          reason: "irreversible_migration_pending",
          sourcePaths: [
            "docs/design/helix/L3-requirements/pillar-functional-requirements.md",
            "docs/process/forward/L08-L14-verification-phase.md",
          ],
        },
      ],
      confirmedCurrentMeaningRecords: confirmedCurrentMeaningRecords(),
    },
  };
}

describe("semantic frontier consistency", () => {
  // U-OUTSTANDING-013: L3 meaning-list frontier records and live status/handover
  // semanticFeatureFrontierRecords stay bidirectionally aligned.
  it("passes when L3 meaning units and live semantic frontier records match", () => {
    const result = analyzeSemanticFrontierConsistency(baseInput());

    expect(result.ok).toBe(true);
    expect(result.expectedConfirmedCount).toBe(11);
    expect(result.l3RequirementRowCount).toBe(43);
    expect(result.l12AcceptanceRowCount).toBe(43);
    expect(semanticFrontierConsistencyMessages(result)).toEqual([
      "semantic-frontier-consistency - OK (frontier=4/4, confirmed=11/11)",
    ]);
  });

  it("fails when a confirmed meaning category loses its L1 parent, L3 row, or L12 acceptance", () => {
    const input = baseInput();
    input.l1Text = input.l1Text.replace("HBR-P6", "HBR-P6-MISSING");
    input.l3Text = input.l3Text.replace("| HR-FR-P6-03 |", "| HR-FR-P6-03-MISSING |");
    input.l12Text = input.l12Text.replace("| HAT-P6-03 |", "| HAT-P6-03-MISSING |");

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "github_setup_release_rename: L1 parent marker missing HBR-P6",
        "github_setup_release_rename: L3 requirement row missing HR-FR-P6-03",
        "github_setup_release_rename: L12 acceptance row missing HAT-P6-03",
      ]),
    );
  });

  it("fails when context efficiency is split into a fake HBR-P5 pillar", () => {
    const input = baseInput();
    input.l1Text = `${input.l1Text}\n| **HBR-P5** | fake context pillar |`;

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "context_efficiency: forbidden L1 parent row present | **HBR-P5** |",
    );
  });

  it("fails when the L3 meaning-based feature list drops a frontier marker", () => {
    const input = baseInput();
    input.l3Text = input.l3Text.replace("serverless readonly share", "serverless sharing");

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "serverless_readonly_share: L3 meaning list missing marker serverless readonly share",
    );
  });

  it("fails when a confirmed L3 row is not covered by the confirmed_current catalog", () => {
    const input = baseInput();
    input.outstanding.confirmedCurrentMeaningRecords =
      input.outstanding.confirmedCurrentMeaningRecords?.map((record) =>
        record.featureId === "pair_agent_tdd_route"
          ? {
              ...record,
              l3RequirementIds: record.l3RequirementIds.filter((id) => id !== "HR-FR-P2-03"),
              l12AcceptanceIds: record.l12AcceptanceIds.filter((id) => id !== "HAT-P2-03"),
            }
          : record,
      );

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "pair_agent_tdd_route: live confirmed record missing L3 requirement HR-FR-P2-03",
        "pair_agent_tdd_route: live confirmed record missing L12 acceptance HAT-P2-03",
      ]),
    );
  });

  it("fails when live outstanding records omit a meaning unit", () => {
    const input = baseInput();
    input.outstanding.semanticFeatureFrontierRecords =
      input.outstanding.semanticFeatureFrontierRecords?.filter(
        (record) => record.featureId !== "name_cutover",
      );

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "name_cutover: live semantic_feature_frontier_record missing",
    );
  });

  it("fails when live outstanding records contain an unlisted meaning unit", () => {
    const input = baseInput();
    input.outstanding.semanticFeatureFrontierRecords?.push({
      recordName: "semantic_feature_frontier_record",
      planId: "PLAN-DISCOVERY-99-unlisted",
      featureId: "unlisted_feature",
      classification: "frontier_pending_decision",
      completionClaimAllowed: false,
      blockers: ["po_decision_pending"],
      requiredRoute: "S4 decide",
      reason: "po_decision_pending",
      sourcePaths: ["docs/design/helix/L3-requirements/pillar-functional-requirements.md"],
    });

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "unlisted_feature: live semantic_feature_frontier_record is not in L3 expected frontier set",
    );
    expect(result.violations).toContain("live semantic_feature_frontier_record count 5 expected 4");
  });

  it("fails when a live record is detached from the L3 feature-list source", () => {
    const input = baseInput();
    const cutover = input.outstanding.semanticFeatureFrontierRecords?.find(
      (record) => record.featureId === "name_cutover",
    );
    if (cutover) {
      cutover.sourcePaths = ["docs/process/forward/L08-L14-verification-phase.md"];
    }

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "name_cutover: sourcePaths must include docs/design/helix/L3-requirements/pillar-functional-requirements.md",
    );
  });

  it("passes through the live repo loader", () => {
    const result = analyzeSemanticFrontierConsistency(loadSemanticFrontierConsistencyInput());

    expect(result.ok).toBe(true);
    expect(result.expectedCount).toBe(4);
    expect(result.liveRecordCount).toBe(4);
    expect(result.expectedConfirmedCount).toBe(11);
    expect(result.liveConfirmedCount).toBe(11);
  });
});
