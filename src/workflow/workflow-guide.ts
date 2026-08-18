import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  loadWorkflowClassificationCatalog,
  WORKFLOW_CLASSIFICATION_CATALOG_PATH,
  type WorkflowClassificationCatalog,
} from "../schema/workflow-classification-catalog.js";
import {
  loadWorkflowClassificationRegistry,
  WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
  type WorkflowClassificationRegistry,
} from "../schema/workflow-classification-registry.js";

export const WORKFLOW_GUIDE_SCHEMA_VERSION = "helix-workflow-guide.v1" as const;
const SPECIALIST_DRIVE_IDS = ["BE", "FE", "FULLSTACK", "DB", "AGENT"] as const;

const WORKFLOW_PHASES = [
  { id: "classify", order: 1, purpose: "typed identityを確定する" },
  { id: "plan", order: 2, purpose: "入口、scope、gate、evidenceを確定する" },
  { id: "execute", order: 3, purpose: "選択されたworkflowの作業を実行する" },
  { id: "verify", order: 4, purpose: "要求、trace、証跡、stale条件を検証する" },
  { id: "accept", order: 5, purpose: "Forward再合流または明示的な未解決終端を記録する" },
] as const;

const GUIDE_GATES = [
  {
    id: "typed_identity",
    disposition: "requirements registryのaxisとidentityを必須化する",
  },
  {
    id: "authority_digest",
    disposition: "requirements、registry、catalogのdigestを束縛する",
  },
  {
    id: "evidence",
    disposition: "各phaseの実測証跡なしに完了を主張しない",
  },
  {
    id: "stale_projection",
    disposition: "registryまたはcatalogの変更後はguideを再生成する",
  },
] as const;

const STALE_CONDITIONS = [
  "requirements source digestが変わった",
  "workflow classification registryのversionまたはdigestが変わった",
  "generated catalogのdigestまたはsource registry tupleが変わった",
  "選択identityがregistryのworkflow_model exact setから消えた",
  "guide本文を手動編集した",
] as const;

type WorkflowEntity = WorkflowClassificationRegistry["entities"][number];

export interface WorkflowGuide {
  schema_version: typeof WORKFLOW_GUIDE_SCHEMA_VERSION;
  authority: {
    requirements_source: string;
    requirements_version: string;
    requirements_source_digest: string;
    registry_source: string;
    registry_version: string;
    registry_source_digest: string;
    catalog_projection: string;
    catalog_digest: string;
  };
  identity: {
    target_axis: "workflow_model";
    target_id: string;
    meaning: string;
    source_refs: string[];
    parent_ids: string[];
  };
  context: {
    development_style: string | null;
    case_driven_model: string | null;
    subroute: string | null;
    specialist_drive: string | null;
  };
  entry: {
    registered_signals: string[];
    selected_signal: string | null;
  };
  phases: ReadonlyArray<{
    id: (typeof WORKFLOW_PHASES)[number]["id"];
    order: number;
    purpose: string;
  }>;
  gates: ReadonlyArray<{ id: (typeof GUIDE_GATES)[number]["id"]; disposition: string }>;
  evidence: {
    required: string[];
    identity_binding: string;
  };
  exit: {
    success: string;
    unresolved: string[];
    blocked: string[];
  };
  stale_conditions: readonly string[];
  guide_digest: string;
}

export interface WorkflowGuideResult {
  ok: boolean;
  exit_code: 0 | 1 | 2;
  guide: WorkflowGuide | null;
  findings: Array<{ code: string; severity: "error" | "warn"; message: string }>;
}

function digest(bytes: Uint8Array): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function stableJson(value: unknown): string {
  return JSON.stringify(value);
}

function finding(
  code: string,
  message: string,
  severity: "error" | "warn" = "error",
): { code: string; severity: "error" | "warn"; message: string } {
  return { code, severity, message };
}

function entityForAxis(
  registry: WorkflowClassificationRegistry,
  axis: WorkflowClassificationRegistry["entities"][number]["axis"],
  value: string | undefined,
): WorkflowEntity | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  return (
    registry.entities.find((entity) => entity.axis === axis && entity.id === normalized) ?? null
  );
}

function resolveSpecialistDrive(
  registry: WorkflowClassificationRegistry,
  value: string | undefined,
): { id: string | null; finding: ReturnType<typeof finding> | null } {
  if (value === undefined) return { id: null, finding: null };
  const normalized = value.trim().toLowerCase();
  if (!SPECIALIST_DRIVE_IDS.map((id) => id.toLowerCase()).includes(normalized)) {
    return {
      id: null,
      finding: finding(
        "workflow-guide-invalid-specialist-drive",
        `--drive は specialist drive のみ受理する: ${SPECIALIST_DRIVE_IDS.map((id) => id.toLowerCase()).join("|")}`,
      ),
    };
  }
  const entity = entityForAxis(registry, "specialist_drive", normalized);
  if (!entity) {
    return {
      id: null,
      finding: finding(
        "workflow-guide-specialist-drive-not-registered",
        `specialist drive がrequirements registryに存在しない: ${normalized}`,
      ),
    };
  }
  return { id: entity.id, finding: null };
}

function selectedSignalFor(
  catalog: WorkflowClassificationCatalog,
  workflowId: string,
  signal: string | undefined,
): { selected: string | null; finding: ReturnType<typeof finding> | null } {
  if (signal === undefined) return { selected: null, finding: null };
  const normalized = signal.trim().toLocaleLowerCase("en-US");
  const matches = catalog.signal_bindings.filter((binding) =>
    binding.signals.some((candidate) => candidate.trim().toLocaleLowerCase("en-US") === normalized),
  );
  if (matches.length === 0) {
    return {
      selected: null,
      finding: finding("workflow-guide-signal-unknown", "signalがregistryに存在しない"),
    };
  }
  if (matches.some((match) => match.unresolved_until_decision === true)) {
    return {
      selected: null,
      finding: finding(
        "workflow-guide-signal-decision-required",
        "signalは明示decisionまで未解決である",
      ),
    };
  }
  const identities = new Set(matches.map((match) => `${match.target_axis}:${match.target_id}`));
  if (identities.size !== 1) {
    return {
      selected: null,
      finding: finding("workflow-guide-signal-ambiguous", "signalが複数のtyped identityへ一致する"),
    };
  }
  const match = matches[0];
  if (match?.target_axis !== "workflow_model" || match.target_id !== workflowId) {
    return {
      selected: null,
      finding: finding(
        "workflow-guide-signal-identity-mismatch",
        "signalとworkflow identityが一致しない",
      ),
    };
  }
  return { selected: signal, finding: null };
}

function buildGuideDigest(input: Omit<WorkflowGuide, "guide_digest">): `sha256:${string}` {
  return digest(Buffer.from(stableJson(input), "utf8"));
}

export function workflowModelIds(repoRoot: string = process.cwd()): string[] {
  return loadWorkflowClassificationRegistry(repoRoot)
    .entities.filter((entity) => entity.axis === "workflow_model")
    .map((entity) => entity.id)
    .sort();
}

export function buildWorkflowGuide(input: {
  workflow: string;
  signal?: string;
  development_style?: string;
  case_driven_model?: string;
  subroute?: string;
  specialist_drive?: string;
  repo_root?: string;
}): WorkflowGuideResult {
  const repoRoot = input.repo_root ?? process.cwd();
  const registry = loadWorkflowClassificationRegistry(repoRoot);
  const catalog = loadWorkflowClassificationCatalog(repoRoot);
  const workflowId = input.workflow.trim().toUpperCase();
  const entity = registry.entities.find(
    (candidate) => candidate.axis === "workflow_model" && candidate.id === workflowId,
  );
  if (!entity) {
    return {
      ok: false,
      exit_code: 2,
      guide: null,
      findings: [
        finding(
          "workflow-guide-unsupported-identity",
          `workflowはworkflow_model exact setに存在しない: ${input.workflow}`,
        ),
      ],
    };
  }

  const findings: WorkflowGuideResult["findings"] = [];
  const contextValues: Array<{
    axis: "development_style" | "case_driven_model" | "subroute";
    value: string | undefined;
  }> = [
    { axis: "development_style", value: input.development_style },
    { axis: "case_driven_model", value: input.case_driven_model },
    { axis: "subroute", value: input.subroute },
  ];
  const context: Record<string, string | null> = {};
  for (const item of contextValues) {
    const resolved = entityForAxis(registry, item.axis, item.value);
    if (item.value !== undefined && !resolved) {
      findings.push(
        finding(
          "workflow-guide-invalid-context-identity",
          `${item.axis} がrequirements registryに存在しない: ${item.value}`,
        ),
      );
    }
    context[item.axis] = resolved?.id ?? null;
  }
  const drive = resolveSpecialistDrive(registry, input.specialist_drive);
  if (drive.finding) findings.push(drive.finding);
  const signal = selectedSignalFor(catalog, workflowId, input.signal);
  if (signal.finding) findings.push(signal.finding);
  if (findings.length > 0) {
    return { ok: false, exit_code: 2, guide: null, findings };
  }

  const catalogBytes = readFileSync(resolve(repoRoot, WORKFLOW_CLASSIFICATION_CATALOG_PATH));
  const registryBytes = readFileSync(resolve(repoRoot, WORKFLOW_CLASSIFICATION_REGISTRY_PATH));
  const withoutDigest = {
    schema_version: WORKFLOW_GUIDE_SCHEMA_VERSION,
    authority: {
      requirements_source: registry.authority.source,
      requirements_version: registry.requirements_version,
      requirements_source_digest: registry.authority.source_digest,
      registry_source: WORKFLOW_CLASSIFICATION_REGISTRY_PATH,
      registry_version: registry.registry_version,
      registry_source_digest: digest(registryBytes),
      catalog_projection: WORKFLOW_CLASSIFICATION_CATALOG_PATH,
      catalog_digest: digest(catalogBytes),
    },
    identity: {
      target_axis: "workflow_model" as const,
      target_id: entity.id,
      meaning: entity.meaning,
      source_refs: [...entity.source_refs],
      parent_ids: [...(entity.parent_ids ?? [])],
    },
    context: {
      development_style: context.development_style ?? null,
      case_driven_model: context.case_driven_model ?? null,
      subroute: context.subroute ?? null,
      specialist_drive: drive.id,
    },
    entry: {
      registered_signals: catalog.signal_bindings
        .filter(
          (binding) => binding.target_axis === "workflow_model" && binding.target_id === entity.id,
        )
        .flatMap((binding) => binding.signals),
      selected_signal: signal.selected,
    },
    phases: WORKFLOW_PHASES,
    gates: GUIDE_GATES,
    evidence: {
      required: [
        "requirements_source_digest",
        "registry_source_digest",
        "catalog_digest",
        "typed_identity",
        "phase_outputs",
        "current_head_review_receipt",
      ],
      identity_binding: "target_axis + target_id + registry_version + registry_source_digest",
    },
    exit: {
      success: "accept_then_forward_merge",
      unresolved: ["unknown_signal", "decision_required", "missing_context_decision"],
      blocked: ["ambiguous_signal", "unsupported_identity", "stale_projection", "missing_evidence"],
    },
    stale_conditions: STALE_CONDITIONS,
  } satisfies Omit<WorkflowGuide, "guide_digest">;
  return {
    ok: true,
    exit_code: 0,
    guide: { ...withoutDigest, guide_digest: buildGuideDigest(withoutDigest) },
    findings: [],
  };
}

export function renderWorkflowGuideText(guide: WorkflowGuide): string {
  return [
    `workflow-guide: ${guide.identity.target_id}`,
    `identity: axis=${guide.identity.target_axis} id=${guide.identity.target_id}`,
    `meaning: ${guide.identity.meaning}`,
    `authority: requirements=${guide.authority.requirements_version} registry=${guide.authority.registry_version}`,
    `entry-signals: ${guide.entry.registered_signals.join(",") || "-"}`,
    `context: style=${guide.context.development_style ?? "-"} case=${guide.context.case_driven_model ?? "-"} subroute=${guide.context.subroute ?? "-"} specialist-drive=${guide.context.specialist_drive ?? "-"}`,
    `phases: ${guide.phases.map((phase) => `${phase.order}:${phase.id}`).join(" -> ")}`,
    `gates: ${guide.gates.map((gate) => gate.id).join(",")}`,
    `evidence: ${guide.evidence.required.join(",")}`,
    `exit: success=${guide.exit.success} unresolved=${guide.exit.unresolved.join(",")} blocked=${guide.exit.blocked.join(",")}`,
    `stale: ${guide.stale_conditions.join(" | ")}`,
    `guide-digest: ${guide.guide_digest}`,
  ].join("\n");
}
