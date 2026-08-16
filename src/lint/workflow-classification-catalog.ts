import {
  loadWorkflowClassificationCatalog,
  WORKFLOW_CLASSIFICATION_CATALOG_PATH,
  type WorkflowClassificationCatalog,
} from "../schema/workflow-classification-catalog";

export type WorkflowClassificationCatalogFindingReason =
  | "typed_catalog_missing_or_invalid"
  | "typed_identity_duplicate"
  | "typed_parent_missing"
  | "typed_signal_duplicate"
  | "typed_signal_target_missing"
  | "typed_signal_target_axis_mismatch";

export interface WorkflowClassificationCatalogFinding {
  reason: WorkflowClassificationCatalogFindingReason;
  subject: string;
  detail?: string;
}

export interface WorkflowClassificationCatalogLintResult {
  ok: boolean;
  entities: number;
  axes: number;
  signalBindings: number;
  registryVersion: string | null;
  findings: WorkflowClassificationCatalogFinding[];
}

export function admitWorkflowCatalogDoctorSurfaces(
  currentAuthorityOk: boolean,
  compatibilityInventoryOk: boolean,
): boolean {
  return currentAuthorityOk && compatibilityInventoryOk;
}

function duplicates(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const duplicate = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) duplicate.add(value);
    seen.add(value);
  }
  return [...duplicate].sort();
}

export function analyzeWorkflowClassificationCatalog(
  catalog: WorkflowClassificationCatalog,
): WorkflowClassificationCatalogLintResult {
  const findings: WorkflowClassificationCatalogFinding[] = [];
  const entityKeys = catalog.entities.map((entity) => `${entity.axis}:${entity.id}`);
  for (const duplicate of duplicates(entityKeys)) {
    findings.push({ reason: "typed_identity_duplicate", subject: duplicate });
  }
  const entitiesById = new Map(catalog.entities.map((entity) => [entity.id, entity] as const));
  for (const entity of catalog.entities) {
    for (const parentId of entity.parent_ids ?? []) {
      if (!entitiesById.has(parentId)) {
        findings.push({
          reason: "typed_parent_missing",
          subject: `${entity.axis}:${entity.id}`,
          detail: parentId,
        });
      }
    }
  }
  const signalOwners = new Map<string, string>();
  for (const binding of catalog.signal_bindings) {
    const target = entitiesById.get(binding.target_id);
    if (!target && binding.unresolved_until_decision !== true) {
      findings.push({
        reason: "typed_signal_target_missing",
        subject: `${binding.target_axis}:${binding.target_id}`,
      });
    } else if (target && target.axis !== binding.target_axis) {
      findings.push({
        reason: "typed_signal_target_axis_mismatch",
        subject: `${binding.target_axis}:${binding.target_id}`,
        detail: target.axis,
      });
    }
    for (const signal of binding.signals) {
      const normalized = signal.trim().toLocaleLowerCase("en-US");
      const owner = `${binding.target_axis}:${binding.target_id}`;
      const previous = signalOwners.get(normalized);
      if (previous && previous !== owner) {
        findings.push({
          reason: "typed_signal_duplicate",
          subject: normalized,
          detail: `${previous}|${owner}`,
        });
      } else {
        signalOwners.set(normalized, owner);
      }
    }
  }
  return {
    ok: findings.length === 0,
    entities: catalog.entities.length,
    axes: new Set(catalog.entities.map((entity) => entity.axis)).size,
    signalBindings: catalog.signal_bindings.length,
    registryVersion: catalog.source_registry.registry_version,
    findings,
  };
}

export function loadWorkflowClassificationCatalogLint(
  repoRoot: string = process.cwd(),
): WorkflowClassificationCatalogLintResult {
  try {
    return analyzeWorkflowClassificationCatalog(loadWorkflowClassificationCatalog(repoRoot));
  } catch (error) {
    return {
      ok: false,
      entities: 0,
      axes: 0,
      signalBindings: 0,
      registryVersion: null,
      findings: [
        {
          reason: "typed_catalog_missing_or_invalid",
          subject: WORKFLOW_CLASSIFICATION_CATALOG_PATH,
          detail: error instanceof Error ? error.message : String(error),
        },
      ],
    };
  }
}

export function workflowClassificationCatalogMessages(
  result: WorkflowClassificationCatalogLintResult,
): string[] {
  if (result.ok) {
    return [
      `workflow-classification-catalog - OK (authority=generated_projection registry=${result.registryVersion} axes=${result.axes} entities=${result.entities} signal_bindings=${result.signalBindings})`,
    ];
  }
  const sample = result.findings
    .slice(0, 8)
    .map(
      (finding) =>
        `${finding.subject}:${finding.reason}${finding.detail ? `(${finding.detail})` : ""}`,
    )
    .join(", ");
  return [`workflow-classification-catalog - violation ${result.findings.length} (${sample})`];
}
