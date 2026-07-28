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

const EXPECTED_CLASSIFIED_CONSTRUCT_IDS = [
  "scrum_reverse",
  "redesign",
  "design_refactor",
  "performance_refactor",
  "security_finding",
  "nfr_failure",
  "measurement_finding",
] as const;

const EXPECTED_PROJECTION_SURFACES = ["issue", "plan", "branch", "pr", "db", "right_arm"] as const;

const EXPECTED_PROJECTION_CONTRACT = {
  surfaces: EXPECTED_PROJECTION_SURFACES,
  identity_fields: [
    "catalog_route_id",
    "episode_route_id",
    "behavior_contract_id",
    "responsibility_owner",
    "head_sha",
    "revision",
  ],
  terminal_dispositions: ["resolved", "rejected", "quarantined", "superseded", "cancelled"],
  stale_conditions: [
    "head_changed",
    "contract_changed",
    "owner_changed",
    "dependency_frontier_changed",
    "evidence_expired",
  ],
  reentry_requirements: [
    "current_head",
    "current_contract",
    "current_owner",
    "current_dependency_frontier",
    "right_arm_evidence_current",
  ],
} as const;

const EXPECTED_BRANCH_PREFIXES: Readonly<Record<(typeof EXPECTED_ROUTE_IDS)[number], string[]>> = {
  forward_full_v: ["design/", "feature/"],
  production_scrum: ["design/", "feature/"],
  v_design_scrum_impl_hybrid: ["design/", "feature/"],
  discovery: ["poc/"],
  reverse: ["reverse/"],
  add_feature_top_down: ["add/"],
  add_feature_bottom_up: ["add/", "reverse/"],
  refactor: ["refactor/"],
  retrofit: ["retrofit/"],
  recovery: ["recovery/", "hotfix/"],
  incident: ["hotfix/"],
  research: ["research/"],
  version_up: ["version-up/"],
  operation_verification: ["verify/"],
  design_bottomup: ["design/", "add/"],
};

const EXPECTED_ALLOWED_KINDS: Readonly<Record<(typeof EXPECTED_ROUTE_IDS)[number], string[]>> = {
  forward_full_v: ["design", "impl"],
  production_scrum: ["design", "impl", "add-design", "add-impl"],
  v_design_scrum_impl_hybrid: ["design", "impl", "add-design", "add-impl"],
  discovery: ["poc"],
  reverse: ["reverse"],
  add_feature_top_down: ["add-design", "add-impl"],
  add_feature_bottom_up: ["add-design", "add-impl"],
  refactor: ["refactor"],
  retrofit: ["retrofit"],
  recovery: ["recovery"],
  incident: ["troubleshoot", "recovery"],
  research: ["research"],
  version_up: [
    "design",
    "impl",
    "add-design",
    "add-impl",
    "refactor",
    "retrofit",
    "research",
    "reverse",
    "recovery",
    "troubleshoot",
    "poc",
  ],
  operation_verification: ["design", "impl", "add-design", "add-impl", "refactor", "retrofit"],
  design_bottomup: ["design", "add-design"],
};

const EXPECTED_CLASSIFIED_CONSTRUCTS = {
  scrum_reverse: {
    classification: "subroute",
    parent_routes: ["production_scrum", "v_design_scrum_impl_hybrid"],
    entry_signals: ["increment_accepted"],
    routing_code: "scrum_reverse_fullback",
    exit_condition: "scrum_reverse_closed",
  },
  redesign: {
    classification: "decision",
    parent_routes: ["discovery", "refactor", "reverse"],
    entry_signals: ["external_contract_change", "behavior_change"],
    routing_code: "reroute_external_semantics_change",
    exit_condition: "replacement_route_current",
  },
  design_refactor: {
    classification: "gate",
    parent_routes: [
      "forward_full_v",
      "production_scrum",
      "v_design_scrum_impl_hybrid",
      "reverse",
      "add_feature_top_down",
      "add_feature_bottom_up",
      "retrofit",
      "design_bottomup",
    ],
    entry_signals: ["design_freeze_candidate"],
    routing_code: "minimize_before_design_freeze",
    exit_condition: "design_complexity_not_increased",
  },
  performance_refactor: {
    classification: "subtype",
    parent_routes: ["refactor", "operation_verification"],
    entry_signals: ["performance_degradation"],
    routing_code: "preserve_behavior_and_slo",
    exit_condition: "behavior_and_slo_preserved",
  },
  security_finding: {
    classification: "escalation_trigger",
    parent_routes: ["incident", "recovery", "reverse", "add_feature_top_down"],
    entry_signals: ["security"],
    routing_code: "route_security_by_impact",
    exit_condition: "security_impact_routed",
  },
  nfr_failure: {
    classification: "escalation_trigger",
    parent_routes: [
      "operation_verification",
      "incident",
      "recovery",
      "refactor",
      "add_feature_top_down",
    ],
    entry_signals: ["nfr_failure"],
    routing_code: "route_nfr_by_impact_and_contract",
    exit_condition: "nfr_failure_routed",
  },
  measurement_finding: {
    classification: "escalation_trigger",
    parent_routes: ["operation_verification", "recovery", "refactor", "add_feature_top_down"],
    entry_signals: ["measurement_finding"],
    routing_code: "route_measurement_by_disposition",
    exit_condition: "measurement_finding_routed",
  },
} as const;

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
  branch_prefixes: z.array(z.string().regex(/^[a-z][a-z0-9-]*\/$/)).min(1),
  document: z.string().startsWith("docs/").endsWith(".md"),
});

const catalogSchema = z.object({
  schema_version: z.literal("drive-route-catalog.v1"),
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
  | "allowed_kind_exact_set_mismatch"
  | "signal_route_missing"
  | "signal_route_mismatch"
  | "next_route_missing"
  | "forward_spine_not_terminal"
  | "forward_spine_unreachable"
  | "route_cycle_detected"
  | "document_missing"
  | "classified_construct_exact_set_mismatch"
  | "classified_construct_contract_mismatch"
  | "classified_construct_duplicate"
  | "classified_construct_parent_missing"
  | "projection_surface_exact_set_mismatch"
  | "projection_contract_exact_set_mismatch"
  | "projection_contract_duplicate"
  | "branch_prefix_exact_set_mismatch"
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
    for (const branchPrefix of duplicates(route.branch_prefixes)) {
      findings.push({
        reason: "projection_contract_duplicate",
        subject: route.route_id,
        detail: branchPrefix,
      });
    }
    const expectedBranchPrefixes =
      EXPECTED_BRANCH_PREFIXES[route.route_id as keyof typeof EXPECTED_BRANCH_PREFIXES];
    if (
      expectedBranchPrefixes &&
      JSON.stringify([...new Set(route.branch_prefixes)].sort()) !==
        JSON.stringify([...expectedBranchPrefixes].sort())
    ) {
      findings.push({
        reason: "branch_prefix_exact_set_mismatch",
        subject: route.route_id,
        detail: `expected=${expectedBranchPrefixes.join(",")} actual=${route.branch_prefixes.join(",")}`,
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
      const expectedKinds =
        EXPECTED_ALLOWED_KINDS[route.route_id as keyof typeof EXPECTED_ALLOWED_KINDS];
      if (
        expectedKinds &&
        JSON.stringify([...route.allowed_kinds].sort()) !==
          JSON.stringify([...expectedKinds].sort())
      ) {
        findings.push({
          reason: "allowed_kind_exact_set_mismatch",
          subject: route.route_id,
          detail: `expected=${expectedKinds.join(",")} actual=${route.allowed_kinds.join(",")}`,
        });
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
  for (const routeId of cyclicRoutes(nextByRoute, catalog.forward_spine)) {
    findings.push({
      reason: "route_cycle_detected",
      subject: routeId,
      detail: catalog.forward_spine,
    });
  }

  for (const [field, values] of Object.entries(catalog.projection_contract)) {
    const expected =
      EXPECTED_PROJECTION_CONTRACT[field as keyof typeof EXPECTED_PROJECTION_CONTRACT];
    const actualSet = [...new Set(values)].sort();
    const expectedSet = [...expected].sort();
    if (JSON.stringify(actualSet) !== JSON.stringify(expectedSet)) {
      findings.push({
        reason:
          field === "surfaces"
            ? "projection_surface_exact_set_mismatch"
            : "projection_contract_exact_set_mismatch",
        subject: `projection_contract.${field}`,
        detail: `expected=${expectedSet.join(",")} actual=${actualSet.join(",")}`,
      });
    }
    for (const duplicate of duplicates(values)) {
      findings.push({
        reason: "projection_contract_duplicate",
        subject: `projection_contract.${field}`,
        detail: duplicate,
      });
    }
  }

  const constructIds = catalog.classified_constructs.map((construct) => construct.construct_id);
  const actualConstructSet = [...new Set(constructIds)].sort();
  const expectedConstructSet = [...EXPECTED_CLASSIFIED_CONSTRUCT_IDS].sort();
  if (JSON.stringify(actualConstructSet) !== JSON.stringify(expectedConstructSet)) {
    findings.push({
      reason: "classified_construct_exact_set_mismatch",
      subject: "classified_constructs",
      detail: `expected=${expectedConstructSet.join(",")} actual=${actualConstructSet.join(",")}`,
    });
  }
  for (const duplicate of duplicates(constructIds)) {
    findings.push({ reason: "classified_construct_duplicate", subject: duplicate });
  }
  for (const construct of catalog.classified_constructs) {
    const expected =
      EXPECTED_CLASSIFIED_CONSTRUCTS[
        construct.construct_id as keyof typeof EXPECTED_CLASSIFIED_CONSTRUCTS
      ];
    if (
      expected &&
      (construct.classification !== expected.classification ||
        JSON.stringify([...new Set(construct.parent_routes)].sort()) !==
          JSON.stringify([...expected.parent_routes].sort()) ||
        JSON.stringify([...new Set(construct.entry_signals)].sort()) !==
          JSON.stringify([...expected.entry_signals].sort()) ||
        construct.routing_code !== expected.routing_code ||
        construct.exit_condition !== expected.exit_condition)
    ) {
      findings.push({
        reason: "classified_construct_contract_mismatch",
        subject: construct.construct_id,
      });
    }
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
