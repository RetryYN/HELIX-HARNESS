import { parse as parseYaml } from "yaml";
import { z } from "zod";
import { type RecommendedCommandV1, recommendedCommandV1Schema } from "../schema/index";
import {
  ROUTE_COMMAND_PAIR_AGENT_PLAN,
  ROUTE_COMMAND_TASK_CLASSIFY,
  ROUTE_SIGNAL_MAP,
  type RouteSignalMapEntry,
} from "../schema/route-map";
import type { ContractResult, Finding, Severity } from "./contracts";

function finding(
  code: string,
  message: string,
  options: { evidencePath?: string; severity?: Severity } = {},
): Finding {
  return {
    code,
    severity: options.severity ?? "error",
    evidence_path: options.evidencePath ?? "",
    message,
  };
}

function result(findings: Finding[], evidence_paths: string[] = []): ContractResult {
  return { ok: findings.every((f) => f.severity !== "error"), findings, evidence_paths };
}

export function routeSignalToMode(input: {
  signal: string;
  current_plan?: string;
  drive?: string;
}): ContractResult & { candidates: string[] } {
  const normalized = input.signal.trim().toLowerCase();
  const candidates = ROUTE_SIGNAL_MAP.map((entry, index) => ({
    entry,
    index,
    matchLength: routeMatchLength(entry, normalized),
  }))
    .filter((candidate) => candidate.matchLength > 0)
    .sort((a, b) => b.matchLength - a.matchLength || a.index - b.index)
    .map((candidate) => candidate.entry.mode);
  const findings =
    candidates.length === 0
      ? [finding("no-route", "unknown signal has no route", { severity: "warn" })]
      : [];
  return { ...result(findings), candidates };
}

export interface RouteEvalResult extends ContractResult {
  signal: string;
  mode: string | null;
  suggest_command: string;
  recommended_command: RecommendedCommandV1 | null;
  approval: RouteApprovalResult;
  escalation_boundaries: RouteEscalationBoundary[];
  exit_code: 0 | 1 | 2;
}

export interface RouteApprovalPolicy {
  rules: {
    mode: string;
    condition?: string;
    required_approvers: string[];
  }[];
  approvals?: {
    mode: string;
    condition?: string;
    approver: string;
    approved_at: string;
    subject?: string;
  }[];
}

export interface RouteApprovalResult {
  required: boolean;
  status: "not_required" | "approved" | "policy_missing" | "approval_missing";
  required_approvers: string[];
  approved_by: string[];
  missing_approvers: string[];
}

export type RouteSignalEntry = RouteSignalMapEntry;

export interface RouteConfigViolation {
  code: "legacy-db-dependency" | "personal-absolute-path";
  path: string;
  evidence: string;
}

export interface RouteEscalationBoundary {
  term: string;
  evidence: string;
}

const ROUTE_CONFIG_FORBIDDEN_PATTERNS: {
  code: RouteConfigViolation["code"];
  pattern: RegExp;
}[] = [
  { code: "legacy-db-dependency", pattern: /\blegacy\s*(?:DB|database)\b/i },
  { code: "legacy-db-dependency", pattern: /\blegacy[_-]?db\b/i },
  {
    code: "personal-absolute-path",
    pattern: /(?:[A-Za-z]:\\Users\\[^\\\s"']+|\/Users\/[^/\s"']+|~\/)/,
  },
];

const ROUTE_ESCALATION_PATTERNS: { term: string; pattern: RegExp }[] = [
  "authentication",
  "authorization",
  "access control",
  "payment",
  "billing",
  "credential",
  "secret",
  "hmac",
  "webhook",
  "pii",
  "license",
  "production",
  "destructive",
  "migration",
  "schema",
  "external api",
  "external infrastructure",
  "infrastructure",
].map((term) => ({
  term,
  pattern: new RegExp(`\\b${term}s?\\b`, "i"),
}));

const ROUTE_CONTRACT_EVIDENCE_PATH = "src/workflow/routing-contracts.ts";

export const D_CONTRACT_MODES = [
  "forward",
  "reverse",
  "recovery",
  "retrofit",
  "refactor",
  "discovery",
  "design-bottomup",
  "scrum",
  "version-up",
  "incident",
  "add-feature",
  "research",
] as const;

export const dContractModeRoutingSchema = z.object({
  routes: z
    .array(
      z.object({
        signal: z.string().trim().min(1),
        mode: z.enum(D_CONTRACT_MODES),
        priority: z.number().int().nonnegative(),
        next: z.array(z.string().trim().min(1)).default([]),
      }),
    )
    .min(1),
});

export const dContractGateChecksSchema = z.object({
  gates: z.record(
    z.string().regex(/^G(?:[1-9]|1[0-4])$/),
    z
      .array(
        z.object({
          check: z.string().trim().min(1),
          next_action: recommendedCommandV1Schema,
        }),
      )
      .min(1),
  ),
});

export type DContractModeRouting = z.infer<typeof dContractModeRoutingSchema>;
export type DContractGateChecks = z.infer<typeof dContractGateChecksSchema>;

export interface DContractDslResult extends ContractResult {
  mode_routing: DContractModeRouting | null;
  gate_checks: DContractGateChecks | null;
}

function parseDContractYaml(text: string): unknown | null {
  try {
    return parseYaml(text);
  } catch {
    return null;
  }
}

function duplicateSignals(routes: DContractModeRouting["routes"]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const route of routes) {
    if (seen.has(route.signal)) duplicates.add(route.signal);
    seen.add(route.signal);
  }
  return [...duplicates].sort();
}

function detectRouteCycles(routes: DContractModeRouting["routes"]): string[][] {
  const graph = new Map(routes.map((route) => [route.signal, route.next]));
  const cycles: string[][] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(signal: string, stack: string[]): void {
    if (visiting.has(signal)) {
      const cycleStart = stack.indexOf(signal);
      cycles.push([...stack.slice(cycleStart), signal]);
      return;
    }
    if (visited.has(signal)) return;
    visiting.add(signal);
    for (const next of graph.get(signal) ?? []) {
      if (graph.has(next)) visit(next, [...stack, next]);
    }
    visiting.delete(signal);
    visited.add(signal);
  }

  for (const signal of graph.keys()) visit(signal, [signal]);
  return cycles;
}

export function validateDContractDsl(input: {
  modeRoutingText: string;
  gateChecksText: string;
  requiredGateIds?: string[];
  modeRoutingPath?: string;
  gateChecksPath?: string;
}): DContractDslResult {
  const modeRoutingPath = input.modeRoutingPath ?? "mode-routing.yaml";
  const gateChecksPath = input.gateChecksPath ?? "gate-checks.yaml";
  const findings: Finding[] = [];

  const modeRoutingRaw = parseDContractYaml(input.modeRoutingText);
  const gateChecksRaw = parseDContractYaml(input.gateChecksText);
  if (modeRoutingRaw === null) {
    findings.push(
      finding("d-contract-mode-routing-yaml", "mode-routing.yaml must parse as YAML", {
        evidencePath: modeRoutingPath,
      }),
    );
  }
  if (gateChecksRaw === null) {
    findings.push(
      finding("d-contract-gate-checks-yaml", "gate-checks.yaml must parse as YAML", {
        evidencePath: gateChecksPath,
      }),
    );
  }

  const modeRoutingParsed = dContractModeRoutingSchema.safeParse(modeRoutingRaw);
  const gateChecksParsed = dContractGateChecksSchema.safeParse(gateChecksRaw);
  if (!modeRoutingParsed.success) {
    findings.push(
      finding("d-contract-mode-routing-schema", "mode-routing.yaml violates D-CONTRACT schema", {
        evidencePath: modeRoutingPath,
      }),
    );
  }
  if (!gateChecksParsed.success) {
    findings.push(
      finding(
        "d-contract-gate-checks-schema",
        "gate-checks.yaml violates D-CONTRACT schema or recommendedCommandV1",
        { evidencePath: gateChecksPath },
      ),
    );
  }

  const modeRouting = modeRoutingParsed.success ? modeRoutingParsed.data : null;
  const gateChecks = gateChecksParsed.success ? gateChecksParsed.data : null;
  if (modeRouting) {
    for (const signal of duplicateSignals(modeRouting.routes)) {
      findings.push(
        finding("d-contract-duplicate-signal", `mode-routing signal must be unique: ${signal}`, {
          evidencePath: modeRoutingPath,
        }),
      );
    }
    const signals = new Set(modeRouting.routes.map((route) => route.signal));
    for (const route of modeRouting.routes) {
      for (const next of route.next) {
        if (!signals.has(next)) {
          findings.push(
            finding(
              "d-contract-unknown-next",
              `mode-routing next target is missing: ${route.signal} -> ${next}`,
              { evidencePath: modeRoutingPath },
            ),
          );
        }
      }
    }
    for (const cycle of detectRouteCycles(modeRouting.routes)) {
      findings.push(
        finding(
          "d-contract-next-cycle",
          `mode-routing next cycle detected: ${cycle.join(" -> ")}`,
          { evidencePath: modeRoutingPath },
        ),
      );
    }
  }
  if (gateChecks) {
    for (const gateId of input.requiredGateIds ?? []) {
      if (!gateChecks.gates[gateId]) {
        findings.push(
          finding(
            "d-contract-missing-required-gate",
            `gate-checks.yaml is missing required gate: ${gateId}`,
            { evidencePath: gateChecksPath },
          ),
        );
      }
    }
  }

  return {
    ...result(findings, [modeRoutingPath, gateChecksPath]),
    mode_routing: modeRouting,
    gate_checks: gateChecks,
  };
}

export function validateRouteConfigText(input: {
  path: string;
  text: string;
}): RouteConfigViolation[] {
  const violations: RouteConfigViolation[] = [];
  for (const { code, pattern } of ROUTE_CONFIG_FORBIDDEN_PATTERNS) {
    const match = input.text.match(pattern);
    if (match) {
      violations.push({ code, path: input.path, evidence: match[0] ?? "" });
    }
  }
  return violations;
}

export function detectRouteEscalationBoundaries(text: string): RouteEscalationBoundary[] {
  return ROUTE_ESCALATION_PATTERNS.flatMap(({ term, pattern }) => {
    const match = text.match(pattern);
    return match ? [{ term, evidence: match[0] ?? term }] : [];
  });
}

function routeCondition(input: { mode: string; signal: string; drift_type?: string }): string {
  const signal = input.signal.toLowerCase();
  if (
    input.mode === "retrofit" &&
    (input.drift_type === "config_drift" || signal.includes("config_drift"))
  ) {
    return "config_drift";
  }
  if (input.mode === "incident") return "env=prod";
  return input.mode;
}

function resolveApproval(params: {
  route: { mode: string; requiresApproval: boolean };
  input: { signal: string; drift_type?: string };
  policy?: RouteApprovalPolicy;
  escalationBoundaries?: RouteEscalationBoundary[];
}): RouteApprovalResult {
  const { input, policy, route } = params;
  const escalationBoundaries = params.escalationBoundaries ?? [];
  const condition =
    escalationBoundaries.length > 0
      ? "escalation"
      : routeCondition({
          mode: route.mode,
          signal: input.signal,
          drift_type: input.drift_type,
        });
  const required =
    route.requiresApproval ||
    escalationBoundaries.length > 0 ||
    (route.mode === "retrofit" && condition === "config_drift");
  if (!required) {
    return {
      required: false,
      status: "not_required",
      required_approvers: [],
      approved_by: [],
      missing_approvers: [],
    };
  }
  if (!policy) {
    return {
      required: true,
      status: "policy_missing",
      required_approvers: [],
      approved_by: [],
      missing_approvers: [],
    };
  }
  const rule = policy.rules.find(
    (r) => (r.mode === route.mode || r.mode === "*") && (!r.condition || r.condition === condition),
  );
  if (!rule) {
    return {
      required: true,
      status: "policy_missing",
      required_approvers: [],
      approved_by: [],
      missing_approvers: [],
    };
  }
  const approved = new Set(
    (policy.approvals ?? [])
      .filter(
        (a) =>
          (a.mode === route.mode || a.mode === "*") &&
          (!a.condition || a.condition === rule.condition),
      )
      .map((a) => a.approver),
  );
  const missing = rule.required_approvers.filter((approver) => !approved.has(approver));
  return {
    required: true,
    status: missing.length === 0 ? "approved" : "approval_missing",
    required_approvers: rule.required_approvers,
    approved_by: rule.required_approvers.filter((approver) => approved.has(approver)),
    missing_approvers: missing,
  };
}

function routeMatchLength(entry: RouteSignalEntry, normalizedSignal: string): number {
  return Math.max(
    0,
    ...entry.tokens.map((token) =>
      normalizedSignal.includes(token.toLowerCase()) ? token.length : 0,
    ),
  );
}

export function evaluateRouteCommand(input: {
  signal: string;
  env?: string;
  drift_type?: string;
  approval_policy?: RouteApprovalPolicy;
  route_map?: RouteSignalEntry[];
  route_config_violations?: RouteConfigViolation[];
}): RouteEvalResult {
  if (input.route_config_violations && input.route_config_violations.length > 0) {
    return {
      ...result(
        input.route_config_violations.map((violation) =>
          finding(
            violation.code,
            "route configuration must not depend on legacy DB or personal absolute paths",
            { evidencePath: violation.path },
          ),
        ),
        input.route_config_violations.map((violation) => violation.path),
      ),
      signal: input.signal,
      mode: null,
      suggest_command: "fix route-map configuration before PLAN creation",
      recommended_command: null,
      approval: {
        required: false,
        status: "not_required",
        required_approvers: [],
        approved_by: [],
        missing_approvers: [],
      },
      escalation_boundaries: [],
      exit_code: 1,
    };
  }
  const normalized = input.signal.trim().toLowerCase();
  const escalationBoundaries = detectRouteEscalationBoundaries(input.signal);
  const routeMap = [...(input.route_map ?? []), ...ROUTE_SIGNAL_MAP];
  const route = routeMap
    .map((entry, index) => ({ entry, index, matchLength: routeMatchLength(entry, normalized) }))
    .filter((candidate) => candidate.matchLength > 0)
    .sort((a, b) => b.matchLength - a.matchLength || a.index - b.index)[0]?.entry;
  if (!route) {
    return {
      ...result([
        finding("no-route", "unknown signal has no route; escalate upstream before PLAN creation", {
          severity: "warn",
        }),
      ]),
      signal: input.signal,
      mode: null,
      suggest_command: "upstream delegation required: define route-map entry before PLAN creation",
      recommended_command: null,
      approval: {
        required: false,
        status: "not_required",
        required_approvers: [],
        approved_by: [],
        missing_approvers: [],
      },
      escalation_boundaries: escalationBoundaries,
      exit_code: 2,
    };
  }
  const approval = resolveApproval({
    route,
    input,
    policy: input.approval_policy,
    escalationBoundaries,
  });
  const recommendedCandidate = {
    schema_version: "v1",
    command: route.command,
    args: {
      signal: input.signal,
      mode: route.mode,
      ...(route.command === ROUTE_COMMAND_PAIR_AGENT_PLAN
        ? {
            pair_route: "smart_test_author_to_light_implementation_to_smart_review",
            requires_plan_id: true,
          }
        : {}),
      ...(input.env ? { env: input.env } : {}),
      ...(input.drift_type ? { drift_type: input.drift_type } : {}),
    },
    safety: {
      auto_apply: false,
      requires_human_approval: approval.required,
      requires_preflight: route.preflight,
    },
  };
  const recommendedParsed = recommendedCommandV1Schema.safeParse(recommendedCandidate);
  if (!recommendedParsed.success) {
    return {
      ...result(
        [
          finding(
            "legacy-runtime-command",
            "recommended command must start with helix; legacy runtime command names are forbidden",
          ),
        ],
        [ROUTE_CONTRACT_EVIDENCE_PATH],
      ),
      signal: input.signal,
      mode: route.mode,
      suggest_command: route.command,
      recommended_command: null,
      approval,
      escalation_boundaries: escalationBoundaries,
      exit_code: 1,
    };
  }
  const approvalFinding =
    approval.status === "policy_missing"
      ? finding("approval-policy-missing", "human approval policy is missing or unresolved")
      : approval.status === "approval_missing"
        ? finding("approval-missing", "required human approval is missing")
        : null;
  return {
    ...result(approvalFinding ? [approvalFinding] : [], [ROUTE_CONTRACT_EVIDENCE_PATH]),
    signal: input.signal,
    mode: route.mode,
    suggest_command:
      route.command === ROUTE_COMMAND_TASK_CLASSIFY
        ? `${route.command} --text "${input.signal}"`
        : route.command === ROUTE_COMMAND_PAIR_AGENT_PLAN
          ? `${route.command} --plan-id <PLAN-ID> --task "${input.signal}"`
          : route.command,
    recommended_command: recommendedParsed.data,
    approval,
    escalation_boundaries: escalationBoundaries,
    exit_code: approvalFinding ? 1 : 0,
  };
}
