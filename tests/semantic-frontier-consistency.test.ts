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
  "HR-FR-P9-04",
  "HR-FR-P9-05",
  "HR-FR-P9-06",
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
  "HAT-P9-04",
  "HAT-P9-05",
  "HAT-P9-06",
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
    l3RequirementIds: [
      "HR-FR-P9-01",
      "HR-FR-P9-02",
      "HR-FR-P9-03",
      "HR-FR-P9-04",
      "HR-FR-P9-05",
      "HR-FR-P9-06",
    ],
    l12AcceptanceIds: [
      "HAT-P9-01",
      "HAT-P9-02",
      "HAT-P9-03",
      "HAT-P9-04",
      "HAT-P9-05",
      "HAT-P9-06",
    ],
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
    "confirmed 46 件: `classification=confirmed_current`",
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
    "current_semantic_frontier_count=0",
    "frontier vocabulary: `frontier_pending_decision` / `parked_future_version` / `approval_gated_cutover` は将来再起票用に保持する",
    "setup は bare `helix --version` の PATH 解決を required にし、`helix-package-script` は fallback 証跡に限定する",
    "package script のみなら `bareCommandResolved=false` のまま `fix_consumer_readiness` に戻す",
    tableRows(L3_IDS),
  ].join("\n");
  const sharedDoc =
    "semantic_feature_frontier_record current_semantic_frontier_count=0 frontier_pending_decision parked_future_version approval_gated_cutover";
  const setupCliBoundary =
    "bare `helix --version` `helix-package-script` package script のみ `bareCommandResolved=false` `fix_consumer_readiness`";
  return {
    l1Text: L1_MARKERS.join("\n"),
    l3Text: `${l3Text}\n${sharedDoc}`,
    l4Text: sharedDoc,
    l5Text: sharedDoc,
    l6Text: sharedDoc,
    l12Text: `${sharedDoc}\n${setupCliBoundary}\n${tableRows(L12_IDS)}`,
    l9SystemText: sharedDoc,
    l8IntegrationText: sharedDoc,
    l7UnitText: sharedDoc,
    outstanding: {
      nonTerminalPlansByLayer: {},
      nonTerminalPlansTotal: 0,
      versionUpParked: 0,
      activeDraftTotal: 0,
      openDefers: 0,
      blockersByKind: {},
      items: [],
      completionReadiness: {
        ok: true,
        status: "ready",
        reason: "ready",
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
      semanticFeatureFrontierRecords: [],
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
    expect(result.l3RequirementRowCount).toBe(46);
    expect(result.l12AcceptanceRowCount).toBe(46);
    expect(semanticFrontierConsistencyMessages(result)).toEqual([
      "semantic-frontier-consistency - OK (frontier=0/0, confirmed=11/11)",
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

  it("fails when setup package scripts are treated as readiness without bare PATH", () => {
    const input = baseInput();
    input.l3Text = input.l3Text.replace("package script のみなら", "package script fallback");
    input.l12Text = `${input.l12Text}\nPATH 解決が無い consumer でも package script があれば ready にでき`;

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toEqual(
      expect.arrayContaining([
        "L3: setup CLI boundary marker missing package script のみ",
        "L12: package script only must not make consumer setup ready without bare helix PATH",
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

  it("fails when the L3 meaning-based feature list drops the closed-frontier marker", () => {
    const input = baseInput();
    input.l3Text = input.l3Text.replaceAll(
      "current_semantic_frontier_count=0",
      "frontier-count-open",
    );

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "L3: missing semantic frontier marker current_semantic_frontier_count=0",
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

  it("passes when live outstanding records remain empty after PO archive/defer decisions", () => {
    const input = baseInput();

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(true);
    expect(result.liveRecordCount).toBe(0);
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
    expect(result.violations).toContain("live semantic_feature_frontier_record count 1 expected 0");
  });

  it("fails when a live record is detached from the L3 feature-list source", () => {
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
      sourcePaths: ["docs/process/forward/L08-L14-verification-phase.md"],
    });

    const result = analyzeSemanticFrontierConsistency(input);

    expect(result.ok).toBe(false);
    expect(result.violations).toContain(
      "unlisted_feature: live semantic_feature_frontier_record is not in L3 expected frontier set",
    );
  });

  it("passes through the live repo loader", () => {
    const result = analyzeSemanticFrontierConsistency(loadSemanticFrontierConsistencyInput());

    expect(result.ok).toBe(true);
    expect(result.expectedCount).toBe(2);
    expect(result.liveRecordCount).toBe(2);
    expect(result.expectedConfirmedCount).toBe(11);
    expect(result.liveConfirmedCount).toBe(11);
  });
});
