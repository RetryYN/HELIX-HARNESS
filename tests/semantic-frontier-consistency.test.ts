import { describe, expect, it } from "vitest";
import {
  analyzeSemanticFrontierConsistency,
  loadSemanticFrontierConsistencyInput,
  type SemanticFrontierConsistencyInput,
  semanticFrontierConsistencyMessages,
} from "../src/lint/semantic-frontier-consistency";

function baseInput(): SemanticFrontierConsistencyInput {
  const l3Text = [
    "§0.2 意味ベース機能一覧と要求修正境界",
    "G-SF `semantic_feature_frontier_record` への写像",
    "design-bottomup mode: `classification=frontier_pending_decision`。backend から FE 要件を洗い出す",
    "asset/progress visualization: `classification=frontier_pending_decision`。S4 PO decision pending",
    "`PLAN-L7-146` serverless readonly share: `classification=parked_future_version`。activation decision",
    "PLAN-M-02 identifier rename: `classification=approval_gated_cutover`。cutover/action-binding approval",
  ].join("\n");
  const sharedDoc =
    "semantic_feature_frontier_record frontier_pending_decision parked_future_version approval_gated_cutover";
  return {
    l3Text: `${l3Text}\n${sharedDoc}`,
    l4Text: sharedDoc,
    l5Text: sharedDoc,
    l6Text: sharedDoc,
    l12Text: sharedDoc,
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
        requiredActions: [],
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
    },
  };
}

describe("semantic frontier consistency", () => {
  // U-OUTSTANDING-013: L3 meaning-list frontier records and live status/handover
  // semanticFeatureFrontierRecords stay bidirectionally aligned.
  it("passes when L3 meaning units and live semantic frontier records match", () => {
    const result = analyzeSemanticFrontierConsistency(baseInput());

    expect(result.ok).toBe(true);
    expect(semanticFrontierConsistencyMessages(result)).toEqual([
      "semantic-frontier-consistency - OK (expected=4, live=4)",
    ]);
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
  });
});
