import { readFileSync } from "node:fs";
import { join } from "node:path";
import { computeOutstandingWork, type OutstandingWork } from "./outstanding";

export interface SemanticFrontierConsistencyInput {
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
  violations: string[];
}

const L3_PATH = "docs/design/helix/L3-requirements/pillar-functional-requirements.md";

const EXPECTED_FRONTIERS = [
  {
    featureId: "design_bottomup_mode",
    planMarker: "PLAN-DISCOVERY-07",
    classification: "frontier_pending_decision",
    l3Markers: [
      "design-bottomup mode",
      "classification=frontier_pending_decision",
      "backend から FE 要件を洗い出す",
    ],
  },
  {
    featureId: "asset_progress_visualization",
    planMarker: "PLAN-DISCOVERY-10",
    classification: "frontier_pending_decision",
    l3Markers: [
      "asset/progress visualization",
      "classification=frontier_pending_decision",
      "S4 PO decision pending",
    ],
  },
  {
    featureId: "serverless_readonly_share",
    planMarker: "PLAN-L7-146",
    classification: "parked_future_version",
    l3Markers: [
      "serverless readonly share",
      "classification=parked_future_version",
      "activation decision",
    ],
  },
  {
    featureId: "name_cutover",
    planMarker: "PLAN-M-02",
    classification: "approval_gated_cutover",
    l3Markers: [
      "identifier rename",
      "classification=approval_gated_cutover",
      "cutover/action-binding approval",
    ],
  },
] as const;

const REQUIRED_DOC_MARKERS = [
  "semantic_feature_frontier_record",
  "frontier_pending_decision",
  "parked_future_version",
  "approval_gated_cutover",
] as const;

export function loadSemanticFrontierConsistencyInput(
  repoRoot: string = process.cwd(),
): SemanticFrontierConsistencyInput {
  const read = (relPath: string): string => readFileSync(join(repoRoot, relPath), "utf8");
  return {
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

  const liveRecords = input.outstanding.semanticFeatureFrontierRecords ?? [];
  const expectedFeatureIds = new Set<string>(
    EXPECTED_FRONTIERS.map((frontier) => frontier.featureId),
  );
  for (const record of liveRecords) {
    if (!expectedFeatureIds.has(record.featureId)) {
      violations.push(
        `${record.featureId}: live semantic_feature_frontier_record is not in L3 expected frontier set`,
      );
    }
  }
  if (liveRecords.length !== EXPECTED_FRONTIERS.length) {
    violations.push(
      `live semantic_feature_frontier_record count ${liveRecords.length} expected ${EXPECTED_FRONTIERS.length}`,
    );
  }

  for (const expected of EXPECTED_FRONTIERS) {
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
    expectedCount: EXPECTED_FRONTIERS.length,
    liveRecordCount: liveRecords.length,
    violations,
  };
}

export function semanticFrontierConsistencyMessages(
  result: SemanticFrontierConsistencyResult,
): string[] {
  if (result.ok) {
    return [
      `semantic-frontier-consistency - OK (expected=${result.expectedCount}, live=${result.liveRecordCount})`,
    ];
  }
  const detail = result.violations.slice(0, 8).join("; ");
  const more = result.violations.length > 8 ? ` (+${result.violations.length - 8} more)` : "";
  return [`semantic-frontier-consistency - violation: ${detail}${more}`];
}
