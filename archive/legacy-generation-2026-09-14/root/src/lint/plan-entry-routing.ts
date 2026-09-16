import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import {
  loadWorkflowClassificationCatalog,
  resolveWorkflowClassificationSignalToken,
  WORKFLOW_CLASSIFICATION_CATALOG_PATH,
} from "../schema/workflow-classification-catalog";
import {
  legacyKindAllowed,
  legacyRoutedModeForSignal,
  legacyWorkflowModeForPlan,
  loadPlanLegacyWorkflowIdentityInventory,
  type PlanLegacyWorkflowIdentityInventory,
} from "./plan-entry-routing-legacy-input";
import { parseMarkdownFrontmatter } from "./shared";

export const PLAN_ENTRY_ROUTING_BASELINE_PATH = "docs/governance/plan-entry-routing-baseline.json";

const EXCLUDED_PLAN_PREFIXES = ["PLAN-DISCOVERY-", "PLAN-M-"];

export type PlanEntryRoutingReason =
  | "entry_signal_absent"
  | "entry_signal_unresolvable"
  | "kind_signal_mismatch"
  | "route_mode_absent"
  | "kind_route_mode_mismatch"
  | "workflow_identity_invalid"
  | "workflow_identity_authority_missing"
  | "workflow_identity_authority_invalid"
  | "workflow_identity_authority_drift"
  | "workflow_identity_signal_unknown"
  | "workflow_identity_signal_decision_required"
  | "workflow_identity_signal_ambiguous"
  | "workflow_identity_signal_mismatch"
  | "legacy_route_mode_reemitted"
  | "workflow_identity_required"
  | "legacy_workflow_identity_inventory_invalid";

export type PlanWorkflowIdentityAuthorityFailureReason = Extract<
  PlanEntryRoutingReason,
  | "workflow_identity_authority_missing"
  | "workflow_identity_authority_invalid"
  | "workflow_identity_authority_drift"
>;

export interface PlanWorkflowIdentityAuthorityFailure {
  reason: PlanWorkflowIdentityAuthorityFailureReason;
  authorityPath: string;
}

export interface PlanWorkflowIdentity {
  schemaVersion: string;
  registryVersion: string;
  registrySourceDigest: string;
  targetAxis: string;
  targetId: string;
  authorityFailure: PlanWorkflowIdentityAuthorityFailure | null;
  valid: boolean;
}

export interface PlanEntrySignalResolution {
  value: string;
  token: string | null;
  kind: "po_directive" | "feedback" | "issue_queue" | "catalog_signal" | "unresolvable";
}

export interface PlanEntryTypedSignalResolution {
  value: string;
  token: string;
  disposition: "classified" | "unknown" | "decision_required" | "ambiguous";
  targetAxis: string | null;
  targetId: string | null;
}

export interface PlanEntryRoutingDoc {
  file: string;
  planId: string;
  kind: string | null;
  status: string | null;
  routeMode: string | null;
  workflowIdentity: PlanWorkflowIdentity | null;
  entrySignals: string[];
  resolvedSignals: PlanEntrySignalResolution[];
  typedSignalResolutions: PlanEntryTypedSignalResolution[];
  /** legacy compatibility projection。typed workflow identityを持つ文書ではnull。 */
  workflowMode: string | null;
}

export interface PlanEntryRoutingBaseline {
  recorded: string | null;
  grandfathered: string[];
}

export interface PlanEntryRoutingViolation {
  planId: string;
  file: string;
  reason: PlanEntryRoutingReason;
  detail?: string;
}

export interface PlanEntryRoutingResult {
  checked: number;
  newViolations: PlanEntryRoutingViolation[];
  grandfathered: PlanEntryRoutingViolation[];
  baselineCount: number;
  ok: boolean;
}

export type PlanEntrySignalResolver = (entrySignals: string[]) => PlanEntrySignalResolution[];
export type LegacyPlanWorkflowModeResolver = typeof legacyWorkflowModeForPlan;
export type LegacyPlanSignalModeResolver = typeof legacyRoutedModeForSignal;

export interface LoadPlanEntryRoutingDocsInput {
  repoRoot?: string;
  target?: string;
  resolveSignals?: PlanEntrySignalResolver;
  resolveLegacyWorkflowMode?: LegacyPlanWorkflowModeResolver;
}

export interface AnalyzePlanEntryRoutingInput {
  docs: PlanEntryRoutingDoc[];
  baseline: PlanEntryRoutingBaseline;
  legacyInventory: PlanLegacyWorkflowIdentityInventory;
  resolveLegacySignalMode?: LegacyPlanSignalModeResolver;
}

const TYPED_SIGNAL_FAILURE_REASONS = {
  unknown: "workflow_identity_signal_unknown",
  decision_required: "workflow_identity_signal_decision_required",
  ambiguous: "workflow_identity_signal_ambiguous",
} as const satisfies Record<
  Exclude<PlanEntryTypedSignalResolution["disposition"], "classified">,
  PlanEntryRoutingReason
>;

function stringField(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];
}

function objectField(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function workflowIdentityAuthorityFailure(
  error: unknown,
  repoRoot: string,
): PlanWorkflowIdentityAuthorityFailure {
  const record = objectField(error);
  const absolutePath = stringField(record?.path);
  const authorityPath = absolutePath
    ? relative(repoRoot, absolutePath).replaceAll("\\", "/")
    : WORKFLOW_CLASSIFICATION_CATALOG_PATH;
  const message = error instanceof Error ? error.message : String(error);
  if (record?.code === "ENOENT") {
    return { reason: "workflow_identity_authority_missing", authorityPath };
  }
  if (message.includes("workflow classification catalog drift")) {
    return { reason: "workflow_identity_authority_drift", authorityPath };
  }
  return { reason: "workflow_identity_authority_invalid", authorityPath };
}

export function unresolvedPlanEntrySignals(entrySignals: string[]): PlanEntrySignalResolution[] {
  return entrySignals.map((value) =>
    value.startsWith("po_directive:")
      ? { value, token: "po_directive", kind: "po_directive" }
      : { value, token: null, kind: "unresolvable" },
  );
}

export function loadPlanEntryRoutingDocs(
  input: LoadPlanEntryRoutingDocsInput = {},
): PlanEntryRoutingDoc[] {
  const {
    repoRoot = process.cwd(),
    target,
    resolveSignals = unresolvedPlanEntrySignals,
    resolveLegacyWorkflowMode = legacyWorkflowModeForPlan,
  } = input;
  const plansDir = join(repoRoot, "docs", "plans");
  if (!existsSync(plansDir)) return [];
  const files = target
    ? [target]
    : readdirSync(plansDir)
        .filter((name) => name.startsWith("PLAN-") && name.endsWith(".md"))
        .map((name) => join("docs", "plans", name));
  const docs: PlanEntryRoutingDoc[] = [];
  const legacyInventory = loadPlanLegacyWorkflowIdentityInventory(repoRoot);
  const legacyKeys = new Set(
    legacyInventory.entries.map((entry) => `${entry.plan_id}\0${entry.path}`),
  );
  let catalog: ReturnType<typeof loadWorkflowClassificationCatalog> | null = null;
  let authorityFailure: PlanWorkflowIdentityAuthorityFailure | null = null;
  try {
    catalog = loadWorkflowClassificationCatalog(repoRoot);
  } catch (error) {
    authorityFailure = workflowIdentityAuthorityFailure(error, repoRoot);
  }
  for (const rel of files) {
    const abs = join(repoRoot, rel);
    if (!existsSync(abs)) continue;
    const raw = parseMarkdownFrontmatter(readFileSync(abs, "utf-8"));
    if (!raw) continue;
    const planId = stringField(raw.plan_id) ?? rel;
    const kind = stringField(raw.kind);
    const routeMode = stringField(raw.route_mode);
    const identityRaw = objectField(raw.workflow_identity);
    const targetAxis = stringField(identityRaw?.target_axis);
    const targetId = stringField(identityRaw?.target_id);
    const workflowIdentity = identityRaw
      ? {
          schemaVersion: stringField(identityRaw.schema_version) ?? "",
          registryVersion: stringField(identityRaw.registry_version) ?? "",
          registrySourceDigest: stringField(identityRaw.registry_source_digest) ?? "",
          targetAxis: targetAxis ?? "",
          targetId: targetId ?? "",
          authorityFailure,
          valid:
            authorityFailure === null &&
            identityRaw.schema_version === "helix-plan-workflow-identity.v1" &&
            catalog !== null &&
            identityRaw.registry_version === catalog.source_registry.registry_version &&
            identityRaw.registry_source_digest === catalog.source_registry.registry_source_digest &&
            catalog.entities.some((entity) => entity.axis === targetAxis && entity.id === targetId),
        }
      : null;
    const entrySignals = stringArray(raw.entry_signals);
    const resolvedSignals = resolveSignals(entrySignals).map((signal) => {
      if (signal.kind !== "unresolvable" || catalog === null) return signal;
      const resolution = resolveWorkflowClassificationSignalToken(signal.value, catalog);
      return resolution.disposition === "classified"
        ? { value: signal.value, token: signal.value, kind: "catalog_signal" as const }
        : signal;
    });
    const typedSignalResolutions =
      catalog === null
        ? []
        : resolvedSignals.flatMap((signal): PlanEntryTypedSignalResolution[] => {
            if (signal.kind === "po_directive" || !signal.token) return [];
            const resolution = resolveWorkflowClassificationSignalToken(signal.token, catalog);
            return [
              {
                value: signal.value,
                token: signal.token,
                disposition: resolution.disposition,
                targetAxis: resolution.target_axis,
                targetId: resolution.target_id,
              },
            ];
          });
    docs.push({
      file: rel,
      planId,
      kind,
      status: stringField(raw.status),
      routeMode,
      workflowIdentity,
      entrySignals,
      resolvedSignals,
      typedSignalResolutions,
      workflowMode:
        workflowIdentity || !legacyInventory.valid || !legacyKeys.has(`${planId}\0${rel}`)
          ? null
          : resolveLegacyWorkflowMode({ planId, kind, routeMode }),
    });
  }
  return docs;
}

export function loadPlanEntryRoutingBaseline(
  repoRoot: string = process.cwd(),
): PlanEntryRoutingBaseline {
  const abs = join(repoRoot, PLAN_ENTRY_ROUTING_BASELINE_PATH);
  if (!existsSync(abs)) return { recorded: null, grandfathered: [] };
  try {
    const parsed = JSON.parse(readFileSync(abs, "utf-8")) as Partial<PlanEntryRoutingBaseline>;
    return {
      recorded: typeof parsed.recorded === "string" ? parsed.recorded : null,
      grandfathered: Array.isArray(parsed.grandfathered)
        ? parsed.grandfathered.filter((id): id is string => typeof id === "string")
        : [],
    };
  } catch {
    return { recorded: null, grandfathered: [] };
  }
}

function isExcluded(doc: PlanEntryRoutingDoc): boolean {
  return doc.status === "archived" || EXCLUDED_PLAN_PREFIXES.some((p) => doc.planId.startsWith(p));
}

function collectViolations(
  doc: PlanEntryRoutingDoc,
  resolveLegacySignalMode: LegacyPlanSignalModeResolver,
): PlanEntryRoutingViolation[] {
  const violations: PlanEntryRoutingViolation[] = [];
  if (doc.entrySignals.length === 0) {
    violations.push({ planId: doc.planId, file: doc.file, reason: "entry_signal_absent" });
  }
  for (const signal of doc.resolvedSignals) {
    if (signal.kind === "po_directive") continue;
    if (!signal.token) {
      violations.push({
        planId: doc.planId,
        file: doc.file,
        reason: "entry_signal_unresolvable",
        detail: signal.value,
      });
      continue;
    }
    if (!doc.workflowIdentity) {
      const routedMode = resolveLegacySignalMode(signal.token);
      if (!routedMode || !legacyKindAllowed(routedMode, doc.kind)) {
        violations.push({
          planId: doc.planId,
          file: doc.file,
          reason: "kind_signal_mismatch",
          detail: `${signal.token}->${routedMode ?? "no-route"} kind=${doc.kind ?? "-"}`,
        });
      }
    }
  }
  if (doc.workflowIdentity) {
    if (doc.workflowIdentity.authorityFailure) {
      violations.push({
        planId: doc.planId,
        file: doc.file,
        reason: doc.workflowIdentity.authorityFailure.reason,
        detail: doc.workflowIdentity.authorityFailure.authorityPath,
      });
    } else if (!doc.workflowIdentity.valid) {
      violations.push({
        planId: doc.planId,
        file: doc.file,
        reason: "workflow_identity_invalid",
        detail: `${doc.workflowIdentity.targetAxis}:${doc.workflowIdentity.targetId}`,
      });
    }
    if (doc.routeMode) {
      violations.push({
        planId: doc.planId,
        file: doc.file,
        reason: "legacy_route_mode_reemitted",
        detail: doc.routeMode,
      });
    }
    if (doc.workflowIdentity.valid) {
      for (const signal of doc.typedSignalResolutions) {
        if (signal.disposition !== "classified") {
          violations.push({
            planId: doc.planId,
            file: doc.file,
            reason: TYPED_SIGNAL_FAILURE_REASONS[signal.disposition],
            detail: signal.token,
          });
          continue;
        }
        if (
          signal.targetAxis !== doc.workflowIdentity.targetAxis ||
          signal.targetId !== doc.workflowIdentity.targetId
        ) {
          violations.push({
            planId: doc.planId,
            file: doc.file,
            reason: "workflow_identity_signal_mismatch",
            detail: `${signal.token}->${signal.targetAxis}:${signal.targetId} declared=${doc.workflowIdentity.targetAxis}:${doc.workflowIdentity.targetId}`,
          });
        }
      }
    }
  } else if (!doc.routeMode) {
    violations.push({ planId: doc.planId, file: doc.file, reason: "route_mode_absent" });
  } else if (!legacyKindAllowed(doc.routeMode, doc.kind)) {
    violations.push({
      planId: doc.planId,
      file: doc.file,
      reason: "kind_route_mode_mismatch",
      detail: `${doc.routeMode} kind=${doc.kind ?? "-"}`,
    });
  }
  return violations;
}

function legacyIdentityAdmissionViolation(
  doc: PlanEntryRoutingDoc,
  legacyInventory: PlanLegacyWorkflowIdentityInventory,
): PlanEntryRoutingViolation | null {
  if (doc.workflowIdentity) return null;
  if (!legacyInventory.valid) {
    return {
      planId: doc.planId,
      file: doc.file,
      reason: "legacy_workflow_identity_inventory_invalid",
    };
  }
  if (
    legacyInventory.entries.some((entry) => entry.plan_id === doc.planId && entry.path === doc.file)
  ) {
    return null;
  }
  return { planId: doc.planId, file: doc.file, reason: "workflow_identity_required" };
}

export function analyzePlanEntryRouting(
  input: AnalyzePlanEntryRoutingInput,
): PlanEntryRoutingResult {
  const {
    docs,
    baseline,
    legacyInventory,
    resolveLegacySignalMode = legacyRoutedModeForSignal,
  } = input;
  const grandfatheredIds = new Set(baseline.grandfathered);
  const newViolations: PlanEntryRoutingViolation[] = [];
  const grandfathered: PlanEntryRoutingViolation[] = [];
  let checked = 0;
  for (const doc of docs) {
    const identityAdmissionViolation = legacyIdentityAdmissionViolation(doc, legacyInventory);
    if (identityAdmissionViolation) {
      newViolations.push(identityAdmissionViolation);
      continue;
    }
    if (isExcluded(doc)) continue;
    checked += 1;
    for (const violation of collectViolations(doc, resolveLegacySignalMode)) {
      if (grandfatheredIds.has(violation.planId)) grandfathered.push(violation);
      else newViolations.push(violation);
    }
  }
  const grandfatheredPlanIds = new Set(grandfathered.map((v) => v.planId));
  return {
    checked,
    newViolations,
    grandfathered,
    baselineCount: baseline.grandfathered.length,
    ok: newViolations.length === 0 && grandfatheredPlanIds.size <= baseline.grandfathered.length,
  };
}

export function buildPlanEntryRoutingBaseline(
  docs: PlanEntryRoutingDoc[],
  recorded: string,
  legacyInventory: PlanLegacyWorkflowIdentityInventory,
): PlanEntryRoutingBaseline {
  const empty: PlanEntryRoutingBaseline = { recorded: null, grandfathered: [] };
  const result = analyzePlanEntryRouting({ docs, baseline: empty, legacyInventory });
  const ids = [...new Set(result.newViolations.map((v) => v.planId))].sort();
  return { recorded, grandfathered: ids };
}

export function planEntryRoutingMessages(result: PlanEntryRoutingResult): string[] {
  const grandfatheredIds = new Set(result.grandfathered.map((v) => v.planId)).size;
  if (result.ok) {
    return [
      `plan-entry-routing - OK (PLAN checked=${result.checked}, grandfathered=${grandfatheredIds}/${result.baselineCount})`,
    ];
  }
  const sample = result.newViolations
    .slice(0, 8)
    .map((v) => `${v.planId}:${v.reason}${v.detail ? `(${v.detail})` : ""}`)
    .join(", ");
  return [
    `plan-entry-routing - violation ${result.newViolations.length} 件 (checked=${result.checked}, grandfathered=${grandfatheredIds}/${result.baselineCount})。entry_signals と typed workflow_identityを確認し、route_modeはlegacy input-onlyとして扱う`,
    `plan-entry-routing - sample: ${sample}`,
  ];
}
