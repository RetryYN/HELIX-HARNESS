export const PREFLIGHT_GATE_AGGREGATION_SCHEMA = "helix-preflight-gate-aggregation.v1" as const;

export const REVIEW_ADMISSION_EXCLUSION_REASON =
  "PR-state-dependent admission is enforced separately after aggregation; it is not an aggregateable repository gate.";

export interface PreflightAggregationContext {
  eventName: string;
  headBranch: string;
  baseBranch: string;
  observedAt: string;
  outcomes: Readonly<Record<string, string | undefined>>;
}

export interface PreflightGateRecord {
  id: string;
  label: string;
  status: string;
  skip_reason?: string;
}

export interface ExcludedPreflightGateRecord {
  id: string;
  label: string;
  status: string;
  reason: string;
}

export interface PreflightGateAggregationResult {
  schema_version: typeof PREFLIGHT_GATE_AGGREGATION_SCHEMA;
  observed_at: string;
  gates: PreflightGateRecord[];
  excluded_gates: ExcludedPreflightGateRecord[];
  failures: PreflightGateRecord[];
  unauthorized_skips: PreflightGateRecord[];
  ok: boolean;
}

export interface ConditionalPreflightGate {
  readonly id: string;
  readonly label: string;
  readonly outcomeKey: string;
  readonly notApplicableReason: string;
  readonly applies: (context: PreflightAggregationContext) => boolean;
}

export interface RequiredPreflightGate {
  readonly id: string;
  readonly label: string;
  readonly outcomeKey: string;
}

export const REQUIRED_PREFLIGHT_GATES = [
  { id: "lint_biome", label: "lint (biome)", outcomeKey: "LINT_BIOME" },
  { id: "design_language", label: "design-language", outcomeKey: "DESIGN_LANGUAGE" },
  {
    id: "repo_guard_preflight",
    label: "repo-wide guard preflight",
    outcomeKey: "REPO_GUARD_PREFLIGHT",
  },
  {
    id: "install_bubblewrap",
    label: "install required Linux isolation backend",
    outcomeKey: "INSTALL_BUBBLEWRAP",
  },
  {
    id: "real_bubblewrap",
    label: "required real bubblewrap process isolation",
    outcomeKey: "REAL_BUBBLEWRAP",
  },
  { id: "branch_type_matrix", label: "branch type matrix", outcomeKey: "BRANCH_TYPE_MATRIX" },
  { id: "branch_kind_check", label: "branch-kind-check", outcomeKey: "BRANCH_KIND_CHECK" },
  { id: "commitlint", label: "commitlint", outcomeKey: "COMMITLINT" },
  { id: "poc_no_merge_guard", label: "poc-no-merge-guard", outcomeKey: "POC_NO_MERGE_GUARD" },
  {
    id: "hotfix_postmortem_required",
    label: "hotfix-postmortem-required",
    outcomeKey: "HOTFIX_POSTMORTEM_REQUIRED",
  },
  {
    id: "issue_closure_contract",
    label: "issue-closure-contract",
    outcomeKey: "ISSUE_CLOSURE_CONTRACT",
  },
  {
    id: "issue_dependency_contract",
    label: "issue-dependency-contract",
    outcomeKey: "ISSUE_DEPENDENCY_CONTRACT",
  },
  {
    id: "issue_dependency_repository_contract",
    label: "issue-dependency-repository-contract",
    outcomeKey: "ISSUE_DEPENDENCY_REPOSITORY_CONTRACT",
  },
  { id: "plan_lint", label: "plan-lint", outcomeKey: "PLAN_LINT" },
  { id: "post_merge_plan", label: "post-merge PLAN status", outcomeKey: "POST_MERGE_PLAN" },
  { id: "l12_authority", label: "L1-L12 canonical authority drift", outcomeKey: "L12_AUTHORITY" },
  { id: "typecheck", label: "typecheck (tsc --noEmit)", outcomeKey: "TYPECHECK" },
] as const satisfies readonly RequiredPreflightGate[];

export const REQUIRED_PREFLIGHT_GATE_IDS = REQUIRED_PREFLIGHT_GATES.map(
  (gate) => gate.id,
) as ReadonlyArray<(typeof REQUIRED_PREFLIGHT_GATES)[number]["id"]>;

export const OUTCOME_ENV_BY_GATE_ID: Record<
  (typeof REQUIRED_PREFLIGHT_GATES)[number]["id"],
  string
> = Object.fromEntries(
  REQUIRED_PREFLIGHT_GATES.map((gate) => [gate.id, gate.outcomeKey]),
) as Record<(typeof REQUIRED_PREFLIGHT_GATES)[number]["id"], string>;

export const CONDITIONAL_PREFLIGHT_GATES: readonly ConditionalPreflightGate[] = [
  {
    id: "poc_no_merge_guard",
    label: "poc-no-merge-guard",
    outcomeKey: "POC_NO_MERGE_GUARD",
    notApplicableReason: "event_or_branch_not_poc_main",
    applies: (context) =>
      context.eventName === "pull_request" &&
      context.baseBranch === "main" &&
      context.headBranch.startsWith("poc/"),
  },
  {
    id: "hotfix_postmortem_required",
    label: "hotfix-postmortem-required",
    outcomeKey: "HOTFIX_POSTMORTEM_REQUIRED",
    notApplicableReason: "event_or_branch_not_hotfix_main",
    applies: (context) =>
      context.eventName === "pull_request" &&
      context.baseBranch === "main" &&
      context.headBranch.startsWith("hotfix/"),
  },
  {
    id: "issue_closure_contract",
    label: "issue-closure-contract",
    outcomeKey: "ISSUE_CLOSURE_CONTRACT",
    notApplicableReason: "event_not_pull_request",
    applies: (context) => context.eventName === "pull_request",
  },
  {
    id: "issue_dependency_contract",
    label: "issue-dependency-contract",
    outcomeKey: "ISSUE_DEPENDENCY_CONTRACT",
    notApplicableReason: "event_not_pull_request",
    applies: (context) => context.eventName === "pull_request",
  },
  {
    id: "issue_dependency_repository_contract",
    label: "issue-dependency-repository-contract",
    outcomeKey: "ISSUE_DEPENDENCY_REPOSITORY_CONTRACT",
    notApplicableReason: "event_not_schedule_or_workflow_dispatch",
    applies: (context) =>
      context.eventName === "schedule" || context.eventName === "workflow_dispatch",
  },
];

export function observedOutcome(
  outcomes: Readonly<Record<string, string | undefined>>,
  key: string,
): string {
  return outcomes[key] || "unknown";
}

export function conditionalGateApplies(
  id: string,
  context: Pick<PreflightAggregationContext, "eventName" | "headBranch" | "baseBranch">,
): boolean {
  const gate = CONDITIONAL_PREFLIGHT_GATES.find((entry) => entry.id === id);
  if (!gate) throw new Error(`unknown_conditional_gate:${id}`);
  return gate.applies({
    eventName: context.eventName,
    headBranch: context.headBranch,
    baseBranch: context.baseBranch,
    observedAt: "",
    outcomes: {},
  });
}

export function collectFailures(gates: readonly PreflightGateRecord[]): PreflightGateRecord[] {
  return gates.filter((gate) => gate.status !== "success" && gate.status !== "skipped");
}

export function collectUnauthorizedSkips(
  gates: readonly PreflightGateRecord[],
): PreflightGateRecord[] {
  return gates.filter(
    (gate) =>
      gate.status === "skipped" &&
      (!gate.skip_reason || gate.skip_reason.startsWith("unexpected_skip:")),
  );
}

export function isAggregationOk(input: {
  failures: readonly PreflightGateRecord[];
  unauthorized_skips: readonly PreflightGateRecord[];
}): boolean {
  return input.failures.length === 0 && input.unauthorized_skips.length === 0;
}

export function aggregationFailCloseMessage(result: PreflightGateAggregationResult): string {
  return `preflight gate aggregation failed: ${result.failures.length} failure(s), ${result.unauthorized_skips.length} unauthorized skip(s)`;
}

export function formatPreflightGateLine(gate: PreflightGateRecord): string {
  return `${gate.id}: ${gate.status}${gate.skip_reason ? ` (${gate.skip_reason})` : ""}`;
}

function recordGate(input: {
  id: string;
  label: string;
  status: string;
  skipReason?: string;
}): PreflightGateRecord {
  const gate: PreflightGateRecord = {
    id: input.id,
    label: input.label,
    status: input.status,
  };
  if (input.skipReason) gate.skip_reason = input.skipReason;
  return gate;
}

function addConditionalGate(
  gates: PreflightGateRecord[],
  definition: ConditionalPreflightGate,
  context: PreflightAggregationContext,
): void {
  const status = observedOutcome(context.outcomes, definition.outcomeKey);
  if (status === "skipped") {
    gates.push(
      recordGate({
        id: definition.id,
        label: definition.label,
        status,
        skipReason: definition.applies(context)
          ? `unexpected_skip:${definition.id}`
          : `not_applicable:${definition.notApplicableReason}`,
      }),
    );
    return;
  }
  gates.push(recordGate({ id: definition.id, label: definition.label, status }));
}

export function aggregatePreflightGates(
  context: PreflightAggregationContext,
): PreflightGateAggregationResult {
  const gates: PreflightGateRecord[] = [];
  const installBubblewrap = observedOutcome(context.outcomes, "INSTALL_BUBBLEWRAP");
  const realBubblewrap = observedOutcome(context.outcomes, "REAL_BUBBLEWRAP");
  const planLint = observedOutcome(context.outcomes, "PLAN_LINT");
  const postMergePlan = observedOutcome(context.outcomes, "POST_MERGE_PLAN");

  gates.push(
    recordGate({
      id: "lint_biome",
      label: "lint (biome)",
      status: observedOutcome(context.outcomes, "LINT_BIOME"),
    }),
  );
  gates.push(
    recordGate({
      id: "design_language",
      label: "design-language",
      status: observedOutcome(context.outcomes, "DESIGN_LANGUAGE"),
    }),
  );
  gates.push(
    recordGate({
      id: "repo_guard_preflight",
      label: "repo-wide guard preflight",
      status: observedOutcome(context.outcomes, "REPO_GUARD_PREFLIGHT"),
    }),
  );
  gates.push(
    recordGate({
      id: "install_bubblewrap",
      label: "install required Linux isolation backend",
      status: installBubblewrap,
    }),
  );
  gates.push(
    recordGate({
      id: "real_bubblewrap",
      label: "required real bubblewrap process isolation",
      status:
        realBubblewrap === "skipped" && installBubblewrap !== "success"
          ? "skipped"
          : realBubblewrap,
      skipReason:
        installBubblewrap !== "success" ? "dependency_failed:install_bubblewrap" : undefined,
    }),
  );
  gates.push(
    recordGate({
      id: "branch_type_matrix",
      label: "branch type matrix",
      status: observedOutcome(context.outcomes, "BRANCH_TYPE_MATRIX"),
    }),
  );
  gates.push(
    recordGate({
      id: "branch_kind_check",
      label: "branch-kind-check",
      status: observedOutcome(context.outcomes, "BRANCH_KIND_CHECK"),
    }),
  );
  gates.push(
    recordGate({
      id: "commitlint",
      label: "commitlint",
      status: observedOutcome(context.outcomes, "COMMITLINT"),
    }),
  );

  for (const definition of CONDITIONAL_PREFLIGHT_GATES) {
    addConditionalGate(gates, definition, context);
  }

  gates.push(recordGate({ id: "plan_lint", label: "plan-lint", status: planLint }));
  gates.push(
    recordGate({
      id: "post_merge_plan",
      label: "post-merge PLAN status",
      status: postMergePlan === "skipped" && planLint !== "success" ? "skipped" : postMergePlan,
      skipReason: planLint !== "success" ? "dependency_failed:plan_lint" : undefined,
    }),
  );
  gates.push(
    recordGate({
      id: "l12_authority",
      label: "L1-L12 canonical authority drift",
      status: observedOutcome(context.outcomes, "L12_AUTHORITY"),
    }),
  );
  gates.push(
    recordGate({
      id: "typecheck",
      label: "typecheck (tsc --noEmit)",
      status: observedOutcome(context.outcomes, "TYPECHECK"),
    }),
  );

  const failures = collectFailures(gates);
  const unauthorized_skips = collectUnauthorizedSkips(gates);
  return {
    schema_version: PREFLIGHT_GATE_AGGREGATION_SCHEMA,
    observed_at: context.observedAt,
    gates,
    excluded_gates: [
      {
        id: "current_head_review",
        label: "current HEAD independent review admission",
        status: observedOutcome(context.outcomes, "CURRENT_HEAD_REVIEW"),
        reason: REVIEW_ADMISSION_EXCLUSION_REASON,
      },
    ],
    failures,
    unauthorized_skips,
    ok: isAggregationOk({ failures, unauthorized_skips }),
  };
}
