import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

const APPROVAL_POLICIES = [
  "none",
  "layer_gate",
  "po_decision",
  "po_intent",
  "action_bound",
] as const;

export const LEGACY_DRIVE_ROUTE_INVENTORY_DIGEST =
  "sha256:6538ba04e632f5ab099b273aa88b1f4297e35fdbe25b7f404a95ba788156b4f8";

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
  branch_prefixes: z.array(z.string().regex(/^[a-z][a-z0-9-]*\/$/)).min(1),
  document: z.string().startsWith("docs/").endsWith(".md"),
});

const catalogSchema = z.object({
  schema_version: z.literal("drive-route-catalog.v1"),
  authority_role: z.literal("compatibility_inventory"),
  current_authority: z.literal("config/workflow-classification-catalog.v1.json"),
  forward_spine: z.literal("forward_full_v"),
  routes: z.array(routeSchema).min(1),
  projection_contract: z.object({
    surfaces: z.array(z.string().min(1)).min(1),
    identity_fields: z.array(z.string().min(1)).min(1),
    terminal_dispositions: z.array(z.string().min(1)).min(1),
    stale_conditions: z.array(z.string().min(1)).min(1),
    reentry_requirements: z.array(z.string().min(1)).min(1),
  }),
  classified_constructs: z.array(
    z.object({
      construct_id: z.string().regex(/^[a-z][a-z0-9_]*$/),
      classification: z.enum(["subroute", "decision", "gate", "subtype", "escalation_trigger"]),
      parent_routes: z.array(z.string().min(1)).min(1),
      entry_signals: z.array(z.string().min(1)).min(1),
      routing_code: z.string().regex(/^[a-z][a-z0-9_]*$/),
      routing_rule: z.string().min(1),
      exit_condition: z.string().min(1),
    }),
  ),
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

export type LegacyDriveRouteInventory = z.infer<typeof catalogSchema>;
/** @deprecated compatibility input only. Current identity authority is the typed workflow catalog. */
export type DriveRouteCatalog = LegacyDriveRouteInventory;

export type DriveRouteCatalogReason =
  | "catalog_missing"
  | "catalog_schema_invalid"
  | "route_id_duplicate"
  | "signal_duplicate_within_route"
  | "kind_duplicate_within_route"
  | "start_layer_duplicate_within_route"
  | "phase_duplicate_within_route"
  | "exit_condition_duplicate_within_route"
  | "next_route_duplicate_within_route"
  | "next_route_missing"
  | "forward_spine_not_terminal"
  | "forward_spine_unreachable"
  | "route_cycle_detected"
  | "document_missing"
  | "classified_construct_duplicate"
  | "classified_construct_parent_missing"
  | "projection_contract_duplicate"
  | "specialist_parent_missing"
  | "specialist_document_missing"
  | "specialist_duplicate"
  | "compatibility_inventory_drift";

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

function cyclicRoutes(
  nextByRoute: ReadonlyMap<string, readonly string[]>,
  forwardSpine: string,
): string[] {
  const state = new Map<string, "visiting" | "visited">();
  const stack: string[] = [];
  const cyclic = new Set<string>();

  function visit(routeId: string): void {
    if (routeId === forwardSpine || state.get(routeId) === "visited") return;
    if (state.get(routeId) === "visiting") {
      const cycleStart = stack.lastIndexOf(routeId);
      for (const member of stack.slice(Math.max(0, cycleStart))) cyclic.add(member);
      return;
    }
    state.set(routeId, "visiting");
    stack.push(routeId);
    for (const next of nextByRoute.get(routeId) ?? []) visit(next);
    stack.pop();
    state.set(routeId, "visited");
  }

  for (const routeId of nextByRoute.keys()) visit(routeId);
  return [...cyclic].sort();
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

  const routeIdSet = new Set(routeIds);
  const nextByRoute = new Map(
    catalog.routes.map((route) => [route.route_id, route.next_routes] as const),
  );
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
    for (const branchPrefix of duplicates(route.branch_prefixes)) {
      findings.push({
        reason: "projection_contract_duplicate",
        subject: route.route_id,
        detail: branchPrefix,
      });
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
  for (const routeId of cyclicRoutes(nextByRoute, catalog.forward_spine)) {
    findings.push({
      reason: "route_cycle_detected",
      subject: routeId,
      detail: catalog.forward_spine,
    });
  }

  for (const [field, values] of Object.entries(catalog.projection_contract)) {
    for (const duplicate of duplicates(values)) {
      findings.push({
        reason: "projection_contract_duplicate",
        subject: `projection_contract.${field}`,
        detail: duplicate,
      });
    }
  }

  const constructIds = catalog.classified_constructs.map((construct) => construct.construct_id);
  for (const duplicate of duplicates(constructIds)) {
    findings.push({ reason: "classified_construct_duplicate", subject: duplicate });
  }
  for (const construct of catalog.classified_constructs) {
    for (const parentRoute of construct.parent_routes) {
      if (!routeIdSet.has(parentRoute)) {
        findings.push({
          reason: "classified_construct_parent_missing",
          subject: construct.construct_id,
          detail: parentRoute,
        });
      }
    }
    for (const field of [construct.parent_routes, construct.entry_signals]) {
      for (const duplicate of duplicates(field)) {
        findings.push({
          reason: "classified_construct_duplicate",
          subject: construct.construct_id,
          detail: duplicate,
        });
      }
    }
  }

  const specialistIds = catalog.specialist_workflows.map((workflow) => workflow.workflow_id);
  for (const duplicate of duplicates(specialistIds)) {
    findings.push({ reason: "specialist_duplicate", subject: duplicate });
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
    const bytes = readFileSync(path);
    const raw = JSON.parse(bytes.toString("utf8")) as unknown;
    const result = analyzeDriveRouteCatalog(raw, (document) =>
      existsSync(join(repoRoot, document)),
    );
    const digest = `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
    if (digest !== LEGACY_DRIVE_ROUTE_INVENTORY_DIGEST) {
      result.findings.unshift({
        reason: "compatibility_inventory_drift",
        subject: "config/drive-route-catalog.json",
        detail: `expected=${LEGACY_DRIVE_ROUTE_INVENTORY_DIGEST} actual=${digest}`,
      });
      result.ok = false;
    }
    return result;
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
      `legacy-drive-route-inventory - OK (authority=compatibility_input_only routes=${result.routes}, specialists=${result.specialists})`,
    ];
  }
  const sample = result.findings
    .slice(0, 8)
    .map(
      (finding) =>
        `${finding.subject}:${finding.reason}${finding.detail ? `(${finding.detail})` : ""}`,
    )
    .join(", ");
  return [`legacy-drive-route-inventory - violation ${result.findings.length} (${sample})`];
}
