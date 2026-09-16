import type {
  SemanticFeatureFrontierClassification,
  SemanticFeatureFrontierRecord,
} from "./outstanding";

export const SEMANTIC_FRONTIER_L3_SOURCE_PATH =
  "docs/design/helix/L3-requirements/pillar-functional-requirements.md";

export interface SemanticFrontierBindingExpectation {
  planId: string;
  classification: SemanticFeatureFrontierClassification;
  featureId?: string;
  requiredSourcePath?: string;
}

export interface SemanticFrontierBindingViolation {
  subject: string;
  reason: string;
}

export function semanticFrontierBindingForPlan(
  records: readonly SemanticFeatureFrontierRecord[] | undefined,
  expectation: SemanticFrontierBindingExpectation,
): SemanticFeatureFrontierRecord {
  return (
    matchingSemanticFrontierRecord(records, expectation) ?? {
      recordName: "semantic_feature_frontier_record",
      planId: expectation.planId,
      featureId: expectation.featureId ?? "",
      classification: expectation.classification,
      completionClaimAllowed: false,
      blockers: [],
      requiredRoute: "",
      reason: "missing_semantic_feature_frontier_record",
      sourcePaths: [],
    }
  );
}

export function semanticFrontierBindingViolations(
  records: readonly SemanticFeatureFrontierRecord[] | undefined,
  expectation: SemanticFrontierBindingExpectation,
  subject: string = expectation.planId,
): SemanticFrontierBindingViolation[] {
  const sourcePath = expectation.requiredSourcePath ?? SEMANTIC_FRONTIER_L3_SOURCE_PATH;
  const byPlan = records?.filter((record) => record.planId === expectation.planId) ?? [];
  const record = matchingSemanticFrontierRecord(records, expectation);
  const violations: SemanticFrontierBindingViolation[] = [];

  if (!record) {
    if (byPlan.length === 0) {
      violations.push({
        subject,
        reason: `missing semantic_feature_frontier_record for ${expectation.classification}`,
      });
    } else {
      for (const candidate of byPlan) {
        if (candidate.classification !== expectation.classification) {
          violations.push({
            subject,
            reason: `semantic_feature_frontier_record classification ${candidate.classification} expected ${expectation.classification}`,
          });
        }
        if (expectation.featureId && candidate.featureId !== expectation.featureId) {
          violations.push({
            subject,
            reason: `semantic_feature_frontier_record featureId ${candidate.featureId} expected ${expectation.featureId}`,
          });
        }
      }
    }
    return violations;
  }

  if (record.completionClaimAllowed !== false) {
    violations.push({
      subject,
      reason: "semantic_feature_frontier_record completionClaimAllowed must be false",
    });
  }
  if (!record.requiredRoute.trim()) {
    violations.push({
      subject,
      reason: "semantic_feature_frontier_record requiredRoute missing",
    });
  }
  if (!record.sourcePaths.includes(sourcePath)) {
    violations.push({
      subject,
      reason: `semantic_feature_frontier_record sourcePaths must include ${sourcePath}`,
    });
  }
  return violations;
}

function matchingSemanticFrontierRecord(
  records: readonly SemanticFeatureFrontierRecord[] | undefined,
  expectation: SemanticFrontierBindingExpectation,
): SemanticFeatureFrontierRecord | null {
  return (
    records?.find(
      (record) =>
        record.planId === expectation.planId &&
        record.classification === expectation.classification &&
        (!expectation.featureId || record.featureId === expectation.featureId),
    ) ?? null
  );
}
