export type ArtifactProgressColor = "red" | "yellow" | "green";

export type ArtifactProgressState =
  | "dependency_unchecked"
  | "implemented_unverified"
  | "recovering"
  | "verified";

export interface ArtifactProgressDecisionInput {
  linkedTestCount: number;
  passedLinkedTestRunCount?: number;
  dependencyChecked: boolean;
  dependencyCheckRunId?: string;
  dependencyCheckedAt?: string;
  openDependencyImpacts: number;
  recoveryPlanIds?: string[];
  /** artifact_progress の artifact_type（plan/design/test-design/requirement/source/test）。 */
  artifactType?: string;
  /** doc 系 artifact の frontmatter/registry status（confirmed 等）。doc 検証 oracle に使う。 */
  docStatus?: string | null;
}

/**
 * doc 系 artifact は test run ではなく review/pair gate で検証される。
 * test-evidence oracle を doc に適用すると永続 yellow ノイズになる（2026-07-07 実測 722/802 件）。
 */
export const DOC_ARTIFACT_TYPES = new Set(["plan", "design", "test-design", "requirement"]);

const DOC_VERIFIED_STATUSES = new Set(["confirmed", "completed", "archived"]);

export interface ArtifactProgressDecision {
  state: ArtifactProgressState;
  color: ArtifactProgressColor;
  reason: string;
}

export function deriveArtifactProgressDecision(
  input: ArtifactProgressDecisionInput,
): ArtifactProgressDecision {
  const recoveryPlanIds = input.recoveryPlanIds ?? [];
  if (recoveryPlanIds.length > 0) {
    return {
      state: "recovering",
      color: "yellow",
      reason: `recovery in progress: ${recoveryPlanIds.join(",")}`,
    };
  }
  if (!input.dependencyChecked || input.openDependencyImpacts > 0) {
    return {
      state: "dependency_unchecked",
      color: "red",
      reason:
        input.openDependencyImpacts > 0
          ? `${input.openDependencyImpacts} open dependency impact(s)`
          : "dependency check is missing",
    };
  }
  if (DOC_ARTIFACT_TYPES.has(input.artifactType ?? "")) {
    const status = (input.docStatus ?? "").trim().toLowerCase();
    if (DOC_VERIFIED_STATUSES.has(status)) {
      return {
        state: "verified",
        color: "green",
        reason: `document verified by review/pair gates (status=${status})`,
      };
    }
    return {
      state: "implemented_unverified",
      color: "yellow",
      reason: `draft document awaiting review/pair gates (status=${status || "unknown"})`,
    };
  }
  if ((input.passedLinkedTestRunCount ?? 0) > 0) {
    return {
      state: "verified",
      color: "green",
      reason: "linked test run passed and dependency impact is clear",
    };
  }
  if (input.linkedTestCount > 0) {
    return {
      state: "implemented_unverified",
      color: "yellow",
      reason: "linked test exists but no passing test run is recorded",
    };
  }
  return {
    state: "implemented_unverified",
    color: "yellow",
    reason: "implemented artifact has no linked test evidence yet",
  };
}
