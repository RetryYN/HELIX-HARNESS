export const ARTIFACT_CONVERGENCE_ANALYZER_SCHEMA_VERSION = "artifact-convergence-analyzer.v1";

export type ArtifactType = "spec" | "plan" | "task" | "code" | "test" | "design";
export type ConvergenceFindingKind =
  | "ambiguity"
  | "contradiction"
  | "missing_test"
  | "stale_task"
  | "implemented_without_design";

export interface ConvergenceArtifact {
  artifact_id: string;
  type: ArtifactType;
  path: string;
  line?: number | null;
  digest: string;
  refs?: string[];
  stale?: boolean;
}

export interface ConvergenceFinding {
  kind: ConvergenceFindingKind;
  severity: "warning" | "critical";
  source_artifact: { artifact_id: string; path: string; line: number | null; digest: string };
  actionable_task: string;
  escalation_needed: boolean;
}

export interface ArtifactConvergenceReport {
  schema_version: typeof ARTIFACT_CONVERGENCE_ANALYZER_SCHEMA_VERSION;
  ok: boolean;
  completion_claim_allowed: boolean;
  findings: ConvergenceFinding[];
  generated_tasks: Array<{
    task_id: string;
    source_finding: ConvergenceFindingKind;
    duplicate: boolean;
  }>;
  source_command: string;
  read_only: true;
}

function sourceOf(artifact: ConvergenceArtifact): ConvergenceFinding["source_artifact"] {
  return {
    artifact_id: artifact.artifact_id,
    path: artifact.path,
    line: artifact.line ?? null,
    digest: artifact.digest,
  };
}

export function buildArtifactConvergenceReport(
  artifacts: ConvergenceArtifact[],
  options: { existingPlanIds?: string[]; sourceCommand?: string } = {},
): ArtifactConvergenceReport {
  const findings: ConvergenceFinding[] = [];
  const hasDesign = artifacts.some((artifact) => artifact.type === "design");
  const hasTest = artifacts.some((artifact) => artifact.type === "test");
  const codeArtifacts = artifacts.filter((artifact) => artifact.type === "code");
  const taskArtifacts = artifacts.filter((artifact) => artifact.type === "task");

  for (const artifact of artifacts) {
    if (!artifact.digest.trim()) {
      findings.push({
        kind: "ambiguity",
        severity: "critical",
        source_artifact: sourceOf(artifact),
        actionable_task: `record digest for ${artifact.artifact_id}`,
        escalation_needed: false,
      });
    }
  }
  if (codeArtifacts.length > 0 && !hasDesign) {
    findings.push({
      kind: "implemented_without_design",
      severity: "critical",
      source_artifact: sourceOf(codeArtifacts[0]),
      actionable_task: "add design binding before completion claim",
      escalation_needed: true,
    });
  }
  if (
    !hasTest &&
    artifacts.some((artifact) => artifact.type === "plan" || artifact.type === "code")
  ) {
    const source = artifacts.find(
      (artifact) => artifact.type === "plan" || artifact.type === "code",
    );
    if (source) {
      findings.push({
        kind: "missing_test",
        severity: "critical",
        source_artifact: sourceOf(source),
        actionable_task: "add test or test-design evidence",
        escalation_needed: false,
      });
    }
  }
  for (const task of taskArtifacts.filter((artifact) => artifact.stale)) {
    findings.push({
      kind: "stale_task",
      severity: "warning",
      source_artifact: sourceOf(task),
      actionable_task: "refresh or close stale task through PLAN evidence",
      escalation_needed: false,
    });
  }

  const existing = new Set(options.existingPlanIds ?? []);
  const generatedTasks = findings.map((finding, index) => {
    const taskId = `converge:${finding.kind}:${finding.source_artifact.artifact_id}`;
    return {
      task_id: taskId,
      source_finding: finding.kind,
      duplicate: existing.has(taskId) || existing.has(`PLAN-${index + 1}-${finding.kind}`),
    };
  });
  const criticalOpen = findings.some((finding) => finding.severity === "critical");
  return {
    schema_version: ARTIFACT_CONVERGENCE_ANALYZER_SCHEMA_VERSION,
    ok: !criticalOpen,
    completion_claim_allowed: !criticalOpen,
    findings,
    generated_tasks: generatedTasks,
    source_command: options.sourceCommand ?? "helix artifacts converge --json",
    read_only: true,
  };
}
