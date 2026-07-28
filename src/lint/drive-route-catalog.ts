import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { MODE_ALLOWED_KINDS, normalizeRouteMode } from "../schema/mode-catalog";
import { ROUTE_SIGNAL_MAP } from "../schema/route-map";

const APPROVAL_POLICIES = [
  "none",
  "layer_gate",
  "po_decision",
  "po_intent",
  "action_bound",
] as const;

const EXPECTED_ROUTE_IDS = [
  "forward_full_v",
  "production_scrum",
  "v_design_scrum_impl_hybrid",
  "discovery",
  "reverse",
  "add_feature_top_down",
  "add_feature_bottom_up",
  "refactor",
  "retrofit",
  "recovery",
  "incident",
  "research",
  "version_up",
  "operation_verification",
  "design_bottomup",
] as const;

const EXPECTED_SPECIALIST_WORKFLOW_IDS = ["screen_design", "frontend_design"] as const;

const MODEL_TO_MODE: Record<string, string> = {
  Forward: "forward",
  Scrum: "scrum",
  Discovery: "discovery",
  Reverse: "reverse",
  "Add-feature": "add-feature",
  Refactor: "refactor",
  Retrofit: "retrofit",
  Recovery: "recovery",
  Incident: "incident",
  Research: "research",
  "version-up": "version-up",
  OperationVerification: "verification",
  "design-bottomup": "design-bottomup",
};

const routeSchema = z.object({
  route_id: z.string().regex(/^[a-z][a-z0-9_]*$/),
  model: z.string().min(1),
  route_class: z.enum([
    "spine",
    "delivery",
    "exploration",
    "normalization",
    "change",
    "migration",
    "restoration",
    "emergency",
    "decision",
    "preservation",
    "verification",
  ]),
  entry_signals: z.array(z.string().min(1)).min(1),
  allowed_kinds: z.array(z.string().min(1)).min(1),
  start_layers: z.array(z.string().min(1)).min(1),
  phases: z.array(z.string().min(1)).min(1),
  approval_policy: z.enum(APPROVAL_POLICIES),
  approval_requirements: z.array(
    z.object({
      trigger: z.string().min(1),
      approvers: z.array(z.string().min(1)).min(1),
      approved_action: z.string().min(1),
    }),
  ),
  autonomous_actions: z.array(z.string().min(1)).min(1),
  merge_targets: z.array(z.string().min(1)).min(1),
  exit_conditions: z.array(z.string().min(1)).min(1),
  next_routes: z.array(z.string().min(1)),
  document: z.string().startsWith("docs/").endsWith(".md"),
});

const catalogSchema = z.object({
  schema_version: z.literal("drive-route-catalog.v1"),
  forward_spine: z.literal("forward_full_v"),
  routes: z.array(routeSchema).min(1),
  specialist_workflows: z
    .array(
      z.object({
        workflow_id: z.string().regex(/^[a-z][a-z0-9_]*$/),
        parent_route: z.string().min(1),
        layer: z.string().min(1),
        pair_layer: z.string().min(1),
        entry_signals: z.array(z.string().min(1)).min(1),
        required_artifacts: z.array(z.string().min(1)).min(1),
        exit_conditions: z.array(z.string().min(1)).min(1),
        document: z.string().startsWith("docs/").endsWith(".md"),
      }),
    )
    .min(1),
});

export type DriveRouteCatalog = z.infer<typeof catalogSchema>;

export type DriveRouteCatalogReason =
  | "catalog_missing"
  | "catalog_schema_invalid"
  | "route_exact_set_mismatch"
  | "route_id_duplicate"
  | "signal_duplicate_within_route"
  | "kind_duplicate_within_route"
  | "start_layer_duplicate_within_route"
  | "phase_duplicate_within_route"
  | "exit_condition_duplicate_within_route"
  | "next_route_duplicate_within_route"
  | "unknown_model"
  | "mode_route_missing"
  | "kind_not_allowed_for_model"
  | "signal_route_missing"
  | "signal_route_mismatch"
  | "next_route_missing"
  | "forward_spine_not_terminal"
  | "forward_spine_unreachable"
  | "document_missing"
  | "specialist_exact_set_mismatch"
  | "specialist_parent_missing"
  | "specialist_document_missing";

export interface DriveRouteCatalogFinding {
  reason: DriveRouteCatalogReason;
  subject: string;
  detail?: string;
}

export interface DriveRouteCatalogResult {
  ok: boolean;
  routes: number;
  specialists: number;
  findings: DriveRouteCatalogFinding[];
  catalog: DriveRouteCatalog | null;
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

function reachesForwardSpine(
  start: string,
  nextByRoute: ReadonlyMap<string, readonly string[]>,
  forwardSpine: string,
): boolean {
  const pending = [start];
  const visited = new Set<string>();
  while (pending.length > 0) {
    const current = pending.pop();
    if (!current || visited.has(current)) continue;
    if (current === forwardSpine) return true;
    visited.add(current);
    for (const next of nextByRoute.get(current) ?? []) {
      if (!visited.has(next)) pending.push(next);
    }
  }
  return false;
}

export function analyzeDriveRouteCatalog(
  raw: unknown,
  documentExists: (path: string) => boolean,
): DriveRouteCatalogResult {
  const parsed = catalogSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      routes: 0,
      specialists: 0,
      findings: [
        {
          reason: "catalog_schema_invalid",
          subject: "config/drive-route-catalog.json",
          detail: parsed.error.issues.map((issue) => issue.path.join(".")).join(","),
        },
      ],
      catalog: null,
    };
  }

  const catalog = parsed.data;
  const findings: DriveRouteCatalogFinding[] = [];
  const routeIds = catalog.routes.map((route) => route.route_id);
  const duplicateRouteIds = duplicates(routeIds);
  for (const routeId of duplicateRouteIds) {
    findings.push({ reason: "route_id_duplicate", subject: routeId });
  }

  const actualSet = [...new Set(routeIds)].sort();
  const expectedSet = [...EXPECTED_ROUTE_IDS].sort();
  if (JSON.stringify(actualSet) !== JSON.stringify(expectedSet)) {
    findings.push({
      reason: "route_exact_set_mismatch",
      subject: "routes",
      detail: `expected=${expectedSet.join(",")} actual=${actualSet.join(",")}`,
    });
  }

  const routeIdSet = new Set(routeIds);
  const nextByRoute = new Map(
    catalog.routes.map((route) => [route.route_id, route.next_routes] as const),
  );
  const routedModes = new Set(
    catalog.routes.map((route) => MODEL_TO_MODE[route.model]).filter(Boolean),
  );
  for (const mode of Object.keys(MODE_ALLOWED_KINDS).sort()) {
    if (!routedModes.has(mode)) {
      findings.push({ reason: "mode_route_missing", subject: mode });
    }
  }
  const signalModes = new Map<string, Set<string>>();
  for (const entry of ROUTE_SIGNAL_MAP) {
    for (const token of entry.tokens) {
      const modes = signalModes.get(token) ?? new Set<string>();
      modes.add(entry.mode);
      signalModes.set(token, modes);
    }
  }
  for (const route of catalog.routes) {
    for (const signal of duplicates(route.entry_signals)) {
      findings.push({
        reason: "signal_duplicate_within_route",
        subject: route.route_id,
        detail: signal,
      });
    }
    for (const kind of duplicates(route.allowed_kinds)) {
      findings.push({
        reason: "kind_duplicate_within_route",
        subject: route.route_id,
        detail: kind,
      });
    }
    for (const startLayer of duplicates(route.start_layers)) {
      findings.push({
        reason: "start_layer_duplicate_within_route",
        subject: route.route_id,
        detail: startLayer,
      });
    }
    for (const phase of duplicates(route.phases)) {
      findings.push({
        reason: "phase_duplicate_within_route",
        subject: route.route_id,
        detail: phase,
      });
    }
    for (const exitCondition of duplicates(route.exit_conditions)) {
      findings.push({
        reason: "exit_condition_duplicate_within_route",
        subject: route.route_id,
        detail: exitCondition,
      });
    }
    for (const nextRoute of duplicates(route.next_routes)) {
      findings.push({
        reason: "next_route_duplicate_within_route",
        subject: route.route_id,
        detail: nextRoute,
      });
    }
    const mode = MODEL_TO_MODE[route.model];
    if (!mode) {
      findings.push({ reason: "unknown_model", subject: route.route_id, detail: route.model });
    } else {
      const allowed = MODE_ALLOWED_KINDS[normalizeRouteMode(mode)] ?? new Set<string>();
      for (const kind of route.allowed_kinds) {
        if (!allowed.has(kind)) {
          findings.push({
            reason: "kind_not_allowed_for_model",
            subject: route.route_id,
            detail: `${route.model}:${kind}`,
          });
        }
      }
      for (const signal of route.entry_signals) {
        const routedModes = signalModes.get(signal);
        if (!routedModes) {
          findings.push({
            reason: "signal_route_missing",
            subject: route.route_id,
            detail: signal,
          });
        } else if (!routedModes.has(mode)) {
          findings.push({
            reason: "signal_route_mismatch",
            subject: route.route_id,
            detail: `${signal}->${[...routedModes].sort().join("|")} expected=${mode}`,
          });
        }
      }
    }
    for (const next of route.next_routes) {
      if (!routeIdSet.has(next)) {
        findings.push({
          reason: "next_route_missing",
          subject: route.route_id,
          detail: next,
        });
      }
    }
    if (!documentExists(route.document)) {
      findings.push({
        reason: "document_missing",
        subject: route.route_id,
        detail: route.document,
      });
    }
  }

  const forwardRoute = catalog.routes.find((route) => route.route_id === catalog.forward_spine);
  if (forwardRoute && forwardRoute.next_routes.length > 0) {
    findings.push({
      reason: "forward_spine_not_terminal",
      subject: catalog.forward_spine,
      detail: forwardRoute.next_routes.join(","),
    });
  }
  for (const route of catalog.routes) {
    if (
      route.route_id !== catalog.forward_spine &&
      !reachesForwardSpine(route.route_id, nextByRoute, catalog.forward_spine)
    ) {
      findings.push({
        reason: "forward_spine_unreachable",
        subject: route.route_id,
        detail: catalog.forward_spine,
      });
    }
  }

  const specialistIds = catalog.specialist_workflows.map((workflow) => workflow.workflow_id);
  const actualSpecialistSet = [...new Set(specialistIds)].sort();
  const expectedSpecialistSet = [...EXPECTED_SPECIALIST_WORKFLOW_IDS].sort();
  if (JSON.stringify(actualSpecialistSet) !== JSON.stringify(expectedSpecialistSet)) {
    findings.push({
      reason: "specialist_exact_set_mismatch",
      subject: "specialist_workflows",
      detail: `expected=${expectedSpecialistSet.join(",")} actual=${actualSpecialistSet.join(",")}`,
    });
  }
  for (const workflow of catalog.specialist_workflows) {
    if (!routeIdSet.has(workflow.parent_route)) {
      findings.push({
        reason: "specialist_parent_missing",
        subject: workflow.workflow_id,
        detail: workflow.parent_route,
      });
    }
    if (!documentExists(workflow.document)) {
      findings.push({
        reason: "specialist_document_missing",
        subject: workflow.workflow_id,
        detail: workflow.document,
      });
    }
    for (const field of [
      workflow.entry_signals,
      workflow.required_artifacts,
      workflow.exit_conditions,
    ]) {
      for (const duplicate of duplicates(field)) {
        findings.push({
          reason: "signal_duplicate_within_route",
          subject: workflow.workflow_id,
          detail: duplicate,
        });
      }
    }
  }

  return {
    ok: findings.length === 0,
    routes: catalog.routes.length,
    specialists: catalog.specialist_workflows.length,
    findings,
    catalog,
  };
}

export function loadDriveRouteCatalog(repoRoot: string = process.cwd()): DriveRouteCatalogResult {
  const path = join(repoRoot, "config", "drive-route-catalog.json");
  if (!existsSync(path)) {
    return {
      ok: false,
      routes: 0,
      specialists: 0,
      findings: [{ reason: "catalog_missing", subject: "config/drive-route-catalog.json" }],
      catalog: null,
    };
  }
  try {
    const raw = JSON.parse(readFileSync(path, "utf8")) as unknown;
    return analyzeDriveRouteCatalog(raw, (document) => existsSync(join(repoRoot, document)));
  } catch {
    return {
      ok: false,
      routes: 0,
      specialists: 0,
      findings: [{ reason: "catalog_schema_invalid", subject: "config/drive-route-catalog.json" }],
      catalog: null,
    };
  }
}

export function driveRouteCatalogMessages(result: DriveRouteCatalogResult): string[] {
  if (result.ok) {
    return [
      `drive-route-catalog - OK (routes=${result.routes}, specialists=${result.specialists})`,
    ];
  }
  const sample = result.findings
    .slice(0, 8)
    .map(
      (finding) =>
        `${finding.subject}:${finding.reason}${finding.detail ? `(${finding.detail})` : ""}`,
    )
    .join(", ");
  return [`drive-route-catalog - violation ${result.findings.length} (${sample})`];
}
