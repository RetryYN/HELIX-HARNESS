import { readFileSync } from "node:fs";
import { join } from "node:path";
import { computeOutstandingWork, type OutstandingWork } from "./outstanding";

export interface SemanticFrontierConsistencyInput {
  l1Text: string;
  l3Text: string;
  l4Text: string;
  l5Text: string;
  l6Text: string;
  l12Text: string;
  l9SystemText: string;
  l8IntegrationText: string;
  l7UnitText: string;
  outstanding: OutstandingWork;
}

export interface SemanticFrontierConsistencyResult {
  ok: boolean;
  expectedCount: number;
  liveRecordCount: number;
  expectedConfirmedCount: number;
  liveConfirmedCount: number;
  l3RequirementRowCount: number;
  l12AcceptanceRowCount: number;
  violations: string[];
}

const L3_PATH = "docs/design/helix/L3-requirements/pillar-functional-requirements.md";

interface ExpectedFrontier {
  featureId: string;
  planMarker: string;
  classification: string;
  l3Markers: readonly string[];
}

const EXPECTED_FRONTIERS: readonly ExpectedFrontier[] = [
  {
    featureId: "l3_08_message_catalog_externalization",
    planMarker: "PLAN-L3-08",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L3-08", "message catalog"],
  },
  {
    featureId: "l3_09_requirements_omission_guards",
    planMarker: "PLAN-L3-09",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L3-09", "中間層 FR"],
  },
  {
    featureId: "l3_10_message_catalog_externalization",
    planMarker: "PLAN-L3-10",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L3-10", "message catalog"],
  },
  {
    featureId: "l3_11_requirements_omission_guards",
    planMarker: "PLAN-L3-11",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L3-11", "inventory evidence"],
  },
  {
    featureId: "serverless_readonly_share",
    planMarker: "PLAN-L7-146",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L7-146", "serverless readonly share"],
  },
  {
    featureId: "l7_339_p6_release_automation_descent",
    planMarker: "PLAN-L7-339",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L7-339", "release automation"],
  },
  {
    featureId: "l7_340_p6_release_automation_descent",
    planMarker: "PLAN-L7-340",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L7-340", "release automation"],
  },
  {
    featureId: "l7_341_coding_debt_reduction_roadmap",
    planMarker: "PLAN-L7-341",
    classification: "parked_future_version",
    l3Markers: ["PLAN-L7-341", "coding debt"],
  },
  {
    featureId: "name_cutover",
    planMarker: "PLAN-M-02",
    classification: "approval_gated_cutover",
    l3Markers: ["PLAN-M-02", "approval-gated cutover"],
  },
];

const REQUIRED_DOC_MARKERS = [
  "semantic_feature_frontier_record",
  "current_semantic_frontier_count=0",
  "frontier_pending_decision",
  "parked_future_version",
  "approval_gated_cutover",
] as const;

const SETUP_CLI_BOUNDARY_MARKERS = [
  "bare `helix",
  "`helix-package-script`",
  "package script のみ",
  "`bareCommandResolved=false`",
  "`fix_consumer_readiness`",
] as const;

const FORBIDDEN_SETUP_CLI_READY_MARKERS = [
  "PATH 解決が無い consumer でも",
  "ready にでき",
] as const;

const EXPECTED_L3_REQUIREMENT_ROWS = 46;
const EXPECTED_L12_ACCEPTANCE_ROWS = 46;

const EXPECTED_CONFIRMED_MEANINGS = [
  {
    featureId: "forward_convergence",
    meaningMarker: "逸脱受け止めと Forward 収束",
    l1Parents: ["HBR-P0"],
    l3Ids: ["HR-FR-P0-01", "HR-FR-P0-02"],
    l12Ids: ["HAT-P0-01", "HAT-P0-02"],
  },
  {
    featureId: "continuous_autonomy_version_up",
    meaningMarker: "連続自律走行 / Scrum 分割 / version-up",
    l1Parents: ["HBR-P1"],
    l3Ids: ["HR-FR-P1-01", "HR-FR-P1-02", "HR-FR-P1-03", "HR-FR-P1-04"],
    l12Ids: ["HAT-P1-01", "HAT-P1-02", "HAT-P1-03", "HAT-P1-04"],
  },
  {
    featureId: "pair_agent_tdd_route",
    meaningMarker: "agent/tool/runtime guardrail + pair-agent TDD route",
    l1Parents: ["HBR-P2", "HBR-P3", "HBR-P4"],
    l3Ids: ["HR-FR-P2-01", "HR-FR-P2-02", "HR-FR-P2-03", "HR-FR-P2-04"],
    l12Ids: ["HAT-P2-01", "HAT-P2-02", "HAT-P2-03", "HAT-P2-04"],
  },
  {
    featureId: "strong_verification",
    meaningMarker: "強い検証 / test-first / 実装精度",
    l1Parents: ["HBR-P3", "HNFR-P3"],
    l3Ids: [
      "HR-FR-P3-01",
      "HR-FR-P3-02",
      "HR-NFR-P3-01",
      "HR-NFR-P3-02",
      "HR-NFR-P3-03",
      "HR-NFR-P3-04",
    ],
    l12Ids: ["HAT-P3-01", "HAT-P3-02", "HAT-N3-01", "HAT-N3-02", "HAT-N3-03", "HAT-N3-04"],
  },
  {
    featureId: "auto_repair_metrics",
    meaningMarker: "自動修復 / 計測改善",
    l1Parents: ["HBR-P4"],
    l3Ids: ["HR-FR-P4-01", "HR-FR-P4-02", "HR-FR-P4-03"],
    l12Ids: ["HAT-P4-01", "HAT-P4-02", "HAT-P4-03"],
  },
  {
    featureId: "github_setup_release_rename",
    meaningMarker: "GitHub 自動化 / setup / release / rename",
    l1Parents: ["HBR-P6"],
    l3Ids: ["HR-FR-P6-01", "HR-FR-P6-02", "HR-FR-P6-03", "HR-FR-P6-04", "HR-FR-P6-05"],
    l12Ids: ["HAT-P6-01", "HAT-P6-02", "HAT-P6-03", "HAT-P6-04", "HAT-P6-05"],
  },
  {
    featureId: "shared_memory_ddd",
    meaningMarker: "共有 memory / Glossary / DDD context",
    l1Parents: ["HBR-P7"],
    l3Ids: ["HR-FR-P7-01", "HR-FR-P7-02", "HR-FR-P7-03"],
    l12Ids: ["HAT-P7-01", "HAT-P7-02", "HAT-P7-03"],
  },
  {
    featureId: "external_grounding_security",
    meaningMarker: "外部検索 / skillify / security boundary",
    l1Parents: ["HBR-P8", "HNFR-P8"],
    l3Ids: [
      "HR-FR-P8-01",
      "HR-FR-P8-02",
      "HR-FR-P8-03",
      "HR-FR-P8-04",
      "HR-NFR-P8-01",
      "HR-NFR-P8-02",
      "HR-NFR-P8-03",
    ],
    l12Ids: [
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
    meaningMarker: "DB 収束 / relation graph / contract ledger",
    l1Parents: ["HBR-P9"],
    l3Ids: [
      "HR-FR-P9-01",
      "HR-FR-P9-02",
      "HR-FR-P9-03",
      "HR-FR-P9-04",
      "HR-FR-P9-05",
      "HR-FR-P9-06",
    ],
    l12Ids: [
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
    meaningMarker: "context efficiency",
    l1Parents: ["HNFR-P5"],
    forbiddenL1Rows: ["| **HBR-P5** |"],
    l3Ids: ["HR-NFR-P5-01", "HR-NFR-P5-02", "HR-NFR-P5-03"],
    l12Ids: ["HAT-N5-01", "HAT-N5-02", "HAT-N5-03"],
  },
  {
    featureId: "adapter_rule_memory_consistency",
    meaningMarker: "adapter/rule/memory 一貫性",
    l1Parents: ["HNFR-AC"],
    l3Ids: ["HR-NFR-AC-01", "HR-NFR-AC-02", "HR-NFR-AC-03"],
    l12Ids: ["HAT-NAC-01", "HAT-NAC-02", "HAT-NAC-03"],
  },
] as const;

export function loadSemanticFrontierConsistencyInput(
  repoRoot: string = process.cwd(),
): SemanticFrontierConsistencyInput {
  const read = (relPath: string): string => readFileSync(join(repoRoot, relPath), "utf8");
  return {
    l1Text: read("docs/design/helix/L1-requirements/pillar-requirements.md"),
    l3Text: read(L3_PATH),
    l4Text: read("docs/design/helix/L4-basic-design/pillar-basic-design.md"),
    l5Text: read("docs/design/helix/L5-detail/pillar-detail-design.md"),
    l6Text: read("docs/design/helix/L6-function-design/pillar-function-design.md"),
    l12Text: read("docs/test-design/helix/L3-pillar-acceptance-test-design.md"),
    l9SystemText: read("docs/test-design/helix/L4-pillar-system-test-design.md"),
    l8IntegrationText: read("docs/test-design/helix/L5-pillar-integration-test-design.md"),
    l7UnitText: read("docs/test-design/helix/L6-pillar-unit-test-design.md"),
    outstanding: computeOutstandingWork(repoRoot),
  };
}

export function analyzeSemanticFrontierConsistency(
  input: SemanticFrontierConsistencyInput,
): SemanticFrontierConsistencyResult {
  const violations: string[] = [];

  if (!input.l3Text.includes("§0.2 意味ベース機能一覧と要求修正境界")) {
    violations.push("L3 meaning-based feature list section missing");
  }
  if (!input.l3Text.includes("G-SF `semantic_feature_frontier_record` への写像")) {
    violations.push("L3 G-SF mapping section missing");
  }
  if (!input.l3Text.includes("confirmed 46 件: `classification=confirmed_current`")) {
    violations.push("L3 confirmed_current mapping for 46-item pillar overlay missing");
  }

  const l3RequirementRows = extractTableIds(input.l3Text, /^HR-(?:FR|NFR)-(?:P|AC)/);
  const l12AcceptanceRows = extractTableIds(input.l12Text, /^HAT-(?:P|N|NAC)/);
  if (l3RequirementRows.length !== EXPECTED_L3_REQUIREMENT_ROWS) {
    violations.push(
      `L3 confirmed requirement row count ${l3RequirementRows.length} expected ${EXPECTED_L3_REQUIREMENT_ROWS}`,
    );
  }
  if (l12AcceptanceRows.length !== EXPECTED_L12_ACCEPTANCE_ROWS) {
    violations.push(
      `L12 confirmed acceptance row count ${l12AcceptanceRows.length} expected ${EXPECTED_L12_ACCEPTANCE_ROWS}`,
    );
  }

  for (const expected of EXPECTED_CONFIRMED_MEANINGS) {
    if (!input.l3Text.includes(expected.meaningMarker)) {
      violations.push(`${expected.featureId}: L3 meaning list missing ${expected.meaningMarker}`);
    }
    for (const parent of expected.l1Parents) {
      if (!hasStandaloneMarker(input.l1Text, parent)) {
        violations.push(`${expected.featureId}: L1 parent marker missing ${parent}`);
      }
    }
    const forbiddenRows = "forbiddenL1Rows" in expected ? expected.forbiddenL1Rows : [];
    for (const forbidden of forbiddenRows) {
      if (input.l1Text.includes(forbidden)) {
        violations.push(`${expected.featureId}: forbidden L1 parent row present ${forbidden}`);
      }
    }
    for (const id of expected.l3Ids) {
      if (!l3RequirementRows.includes(id)) {
        violations.push(`${expected.featureId}: L3 requirement row missing ${id}`);
      }
    }
    for (const id of expected.l12Ids) {
      if (!l12AcceptanceRows.includes(id)) {
        violations.push(`${expected.featureId}: L12 acceptance row missing ${id}`);
      }
    }
  }
  const expectedConfirmedL3Ids = new Set<string>(
    EXPECTED_CONFIRMED_MEANINGS.flatMap((item) => [...item.l3Ids]),
  );
  for (const id of l3RequirementRows) {
    if (!expectedConfirmedL3Ids.has(id)) {
      violations.push(
        `${id}: L3 requirement row is not covered by confirmed_current meaning catalog`,
      );
    }
  }
  const expectedConfirmedL12Ids = new Set<string>(
    EXPECTED_CONFIRMED_MEANINGS.flatMap((item) => [...item.l12Ids]),
  );
  for (const id of l12AcceptanceRows) {
    if (!expectedConfirmedL12Ids.has(id)) {
      violations.push(
        `${id}: L12 acceptance row is not covered by confirmed_current meaning catalog`,
      );
    }
  }

  const liveConfirmedRecords = input.outstanding.confirmedCurrentMeaningRecords ?? [];
  const expectedConfirmedIds = new Set<string>(
    EXPECTED_CONFIRMED_MEANINGS.map((item) => item.featureId),
  );
  for (const record of liveConfirmedRecords) {
    if (!expectedConfirmedIds.has(record.featureId)) {
      violations.push(
        `${record.featureId}: live confirmed_current meaning record is not in L3 expected confirmed set`,
      );
    }
  }
  if (liveConfirmedRecords.length !== EXPECTED_CONFIRMED_MEANINGS.length) {
    violations.push(
      `live confirmed_current meaning record count ${liveConfirmedRecords.length} expected ${EXPECTED_CONFIRMED_MEANINGS.length}`,
    );
  }
  for (const expected of EXPECTED_CONFIRMED_MEANINGS) {
    const record = liveConfirmedRecords.find(
      (candidate) => candidate.featureId === expected.featureId,
    );
    if (!record) {
      violations.push(`${expected.featureId}: live confirmed_current meaning record missing`);
      continue;
    }
    if (record.classification !== "confirmed_current") {
      violations.push(
        `${expected.featureId}: confirmed classification ${record.classification} expected confirmed_current`,
      );
    }
    if (record.completionBoundary !== "downstream_evidence_required") {
      violations.push(
        `${expected.featureId}: completionBoundary must remain downstream_evidence_required`,
      );
    }
    for (const parent of expected.l1Parents) {
      if (!record.l1Parents.includes(parent)) {
        violations.push(`${expected.featureId}: live confirmed record missing L1 parent ${parent}`);
      }
    }
    for (const id of expected.l3Ids) {
      if (!record.l3RequirementIds.includes(id)) {
        violations.push(
          `${expected.featureId}: live confirmed record missing L3 requirement ${id}`,
        );
      }
    }
    for (const id of expected.l12Ids) {
      if (!record.l12AcceptanceIds.includes(id)) {
        violations.push(
          `${expected.featureId}: live confirmed record missing L12 acceptance ${id}`,
        );
      }
    }
    if (!record.sourcePaths.includes(L3_PATH)) {
      violations.push(`${expected.featureId}: confirmed sourcePaths must include ${L3_PATH}`);
    }
    if (
      !record.sourcePaths.includes("docs/test-design/helix/L3-pillar-acceptance-test-design.md")
    ) {
      violations.push(
        `${expected.featureId}: confirmed sourcePaths must include L12 acceptance source`,
      );
    }
  }

  for (const [docName, text] of [
    ["L3", input.l3Text],
    ["L4", input.l4Text],
    ["L5", input.l5Text],
    ["L6", input.l6Text],
    ["L12", input.l12Text],
    ["L9", input.l9SystemText],
    ["L8", input.l8IntegrationText],
    ["L7", input.l7UnitText],
  ] as const) {
    for (const marker of REQUIRED_DOC_MARKERS) {
      if (!text.includes(marker)) {
        violations.push(`${docName}: missing semantic frontier marker ${marker}`);
      }
    }
  }

  for (const [docName, text] of [
    ["L3", input.l3Text],
    ["L12", input.l12Text],
  ] as const) {
    for (const marker of SETUP_CLI_BOUNDARY_MARKERS) {
      if (!text.includes(marker)) {
        violations.push(`${docName}: setup CLI boundary marker missing ${marker}`);
      }
    }
    if (FORBIDDEN_SETUP_CLI_READY_MARKERS.every((marker) => text.includes(marker))) {
      violations.push(
        `${docName}: package script only must not make consumer setup ready without bare helix PATH`,
      );
    }
  }

  const liveRecords = input.outstanding.semanticFeatureFrontierRecords ?? [];
  const expectedFrontiers = EXPECTED_FRONTIERS.filter((frontier) =>
    liveRecords.some((record) => record.featureId === frontier.featureId),
  );
  const expectedFeatureIds = new Set<string>(
    expectedFrontiers.map((frontier) => frontier.featureId),
  );
  for (const record of liveRecords) {
    if (!expectedFeatureIds.has(record.featureId)) {
      violations.push(
        `${record.featureId}: live semantic_feature_frontier_record is not in L3 expected frontier set`,
      );
    }
  }
  if (liveRecords.length !== expectedFrontiers.length) {
    violations.push(
      `live semantic_feature_frontier_record count ${liveRecords.length} expected ${expectedFrontiers.length}`,
    );
  }

  for (const expected of expectedFrontiers) {
    for (const marker of expected.l3Markers) {
      if (!input.l3Text.includes(marker)) {
        violations.push(`${expected.featureId}: L3 meaning list missing marker ${marker}`);
      }
    }

    const record = liveRecords.find((r) => r.featureId === expected.featureId);
    if (!record) {
      violations.push(`${expected.featureId}: live semantic_feature_frontier_record missing`);
      continue;
    }
    if (!record.planId.includes(expected.planMarker)) {
      violations.push(
        `${expected.featureId}: live planId ${record.planId} does not match ${expected.planMarker}`,
      );
    }
    if (record.classification !== expected.classification) {
      violations.push(
        `${expected.featureId}: classification ${record.classification} expected ${expected.classification}`,
      );
    }
    if (record.completionClaimAllowed !== false) {
      violations.push(`${expected.featureId}: completionClaimAllowed must be false`);
    }
    if (!record.requiredRoute.trim()) {
      violations.push(`${expected.featureId}: requiredRoute missing`);
    }
    if (!record.sourcePaths.includes(L3_PATH)) {
      violations.push(`${expected.featureId}: sourcePaths must include ${L3_PATH}`);
    }
  }

  return {
    ok: violations.length === 0,
    expectedCount: expectedFrontiers.length,
    liveRecordCount: liveRecords.length,
    expectedConfirmedCount: EXPECTED_CONFIRMED_MEANINGS.length,
    liveConfirmedCount: liveConfirmedRecords.length,
    l3RequirementRowCount: l3RequirementRows.length,
    l12AcceptanceRowCount: l12AcceptanceRows.length,
    violations,
  };
}

function extractTableIds(text: string, idPattern: RegExp): string[] {
  const ids: string[] = [];
  for (const line of text.split("\n")) {
    const cells = line
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim().replace(/\*\*/g, ""));
    const id = cells[0];
    if (id && idPattern.test(id)) ids.push(id);
  }
  return [...new Set(ids)];
}

function hasStandaloneMarker(text: string, marker: string): boolean {
  return new RegExp(`(^|[^A-Z0-9-])${escapeRegExp(marker)}(?![A-Z0-9-])`).test(text);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function semanticFrontierConsistencyMessages(
  result: SemanticFrontierConsistencyResult,
): string[] {
  if (result.ok) {
    return [
      `semantic-frontier-consistency - OK (frontier=${result.liveRecordCount}/${result.expectedCount}, confirmed=${result.liveConfirmedCount}/${result.expectedConfirmedCount})`,
    ];
  }
  const detail = result.violations.slice(0, 8).join("; ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`semantic-frontier-consistency - violation: ${detail}${more}`];
}
