import type { RuntimeSurface } from "./run-debug";

type DecisionKind = "allow" | "blocker" | "escalate" | "new_plan_required";
type TechnicalQuestionKind = "allow" | "deny" | "bypass_allowed";
type DetectorResultKind = "stub" | "advisory" | "fail_close";
type RecommendationKind = "adopt_candidate" | "harden_required" | "defer" | "reject";
type RunDebugTraceKind = "complete" | "incomplete" | "blocked";
type AdoptionDisposition =
  | "existing_pillar_covered"
  | "adopt"
  | "harden_required"
  | "defer"
  | "reject"
  | "new_plan_required";
type GuardSurfaceState = "wired" | "deferred" | "rejected";
type PolicyDecisionKind = "allow" | "deny" | "escalate";

export interface WorkPreflightInput {
  objective?: string | null;
  workflow_layer?: string | null;
  forward_return?: string | null;
  acceptance_verification?: string | null;
  work_source?: string | null;
  allowed_scope?: string[] | null;
  conflicts_with_plan_or_handover?: boolean;
  high_impact_unapproved?: boolean;
}

export interface WorkPreflightDecision {
  kind: DecisionKind;
  findings: string[];
}

export interface QuestionGateInput {
  question_text: string;
  question_class?: "technical" | "preference" | "unknown";
  tl_advisor_evidence?: string | null;
  bypass_reason?: string | null;
}

export interface TechnicalQuestionDecision {
  kind: TechnicalQuestionKind;
  question_class: "technical" | "preference";
  reason: string;
}

export interface DetectorAxisDescriptor {
  axis_id?: string | null;
  phase_gate?: string | null;
  kind?: DetectorResultKind | null;
  severity?: string | null;
  workflow_route?: string | null;
}

export interface DetectorAxisRegistration {
  ok: boolean;
  descriptor: DetectorAxisDescriptor | null;
  findings: string[];
}

export interface DetectorFinding {
  axis_id: string;
  kind: DetectorResultKind;
  use_as_hard_gate_proof?: boolean;
}

export interface DetectorRouteDecision {
  kind: "route" | "reject" | "unknown_axis";
  route: string | null;
  reason: string;
}

export interface DetectorAxisRegistry {
  axes: DetectorAxisDescriptor[];
}

export interface RecommendationInput {
  candidate: string;
  score?: number | null;
  reason?: string | null;
  references?: string[] | null;
  recommended_role?: string | null;
}

export interface RecommendationDecision {
  kind: RecommendationKind;
  reason: string;
}

export interface RunDebugTraceInput {
  expected_actions: string[];
  observed_evidence: string[];
  runtime_surface?: RuntimeSurface | null;
  correlation_id?: string | null;
  evidence_path?: string | null;
}

export interface RunDebugTraceDecision {
  kind: RunDebugTraceKind;
  matched_actions: string[];
  missing_actions: string[];
  runtime_surface: RuntimeSurface | "";
  correlation_id: string;
  evidence_path: string;
}

export interface CoreInjectionInput {
  repo_local_source?: string | null;
  generated_target?: string | null;
  consumer_mode?: string | null;
  required_marker?: string | null;
  provenance?: string | null;
  global_file_only_reference?: boolean;
}

export interface CoreInjectionDecision {
  disposition: AdoptionDisposition;
  repo_local_source: string;
  generated_target: string;
  consumer_mode: string;
  required_marker: string;
  provenance: string;
  rejected_assumption?: string;
}

export interface LegacyHookSurfaceInput {
  hook_source?: string | null;
  runtime_surface?: RuntimeSurface | "unsupported" | null;
  tool_matcher?: string | null;
  guard_intent?: string | null;
  parity_target?: string | null;
  test_oracle?: string | null;
  wired?: boolean;
}

export interface GuardSurfaceDisposition {
  state: GuardSurfaceState;
  runtime_surface: RuntimeSurface;
  guard_intent: string;
  reason: string;
  oracle: string;
}

export interface AgentRolePolicyInput {
  role_kind?: string | null;
  model_family?: string | null;
  slot?: string | null;
  delegation_boundary?: string | null;
  review_substitute?: string | null;
  self_review?: boolean;
  overpowered_without_approval?: boolean;
  unbounded_delegation?: boolean;
}

export interface AgentRolePolicyDecision {
  kind: PolicyDecisionKind;
  reason: string;
}

export interface WorkflowInventoryInput {
  workflow_doc?: string | null;
  trigger?: string | null;
  pillar?: string | null;
  workflow_mode?: string | null;
  gate?: string | null;
  current_owner?: string | null;
  known_workflow?: boolean;
  duplicate_pillar_count?: boolean;
}

export interface WorkflowMappingDecision {
  disposition: AdoptionDisposition;
  reason: string;
}

export interface LegacyDataSurfaceInput {
  source?: string | null;
  state_kind?: string | null;
  projection_target?: string | null;
  read_model?: string | null;
  api_boundary?: string | null;
  provenance?: string | null;
  raw_state_import?: boolean;
}

export interface DataSurfaceDecision {
  disposition: AdoptionDisposition;
  reason: string;
}

export interface ContinuousRunInput {
  trigger?: string | null;
  queue_lock?: string | null;
  timebox?: string | null;
  budget_profile?: string | null;
  stop_condition?: string | null;
  verification_evidence?: string | null;
  auto_run?: boolean;
}

export interface ContinuousRunDecision {
  kind: PolicyDecisionKind;
  reason: string;
}

export interface LearningFeedbackInput {
  event_source?: string | null;
  recipe_source?: string | null;
  learning_result?: string | null;
  target_backlog?: string | null;
  evidence_link?: string | null;
  review_state?: "unreviewed" | "tl_reviewed" | "human_reviewed" | null;
  closes_acceptance?: boolean;
}

export interface LearningFeedbackDecision {
  kind: RecommendationKind;
  reason: string;
}

const TECHNICAL_QUESTION_RE =
  /\b(design|contract|schema|migration|security|architecture|api|db|auth|placement|structure)\b/i;
const LEGACY_PATH_RE = new RegExp(
  [
    "^~/",
    "|/",
    "home/",
    "|^[A-Za-z]:\\\\",
    "|\\.",
    "helix\\b",
    "|",
    "ai",
    "-dev",
    "-kit",
    "-vscode",
  ].join(""),
  "i",
);
const LEGACY_RUNTIME_COMMAND_RE = new RegExp(["helix", "\\s+", "codex"].join(""), "i");

function present(value: string | null | undefined): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function missingRequired(fields: Record<string, unknown>): string[] {
  return Object.entries(fields)
    .filter(([, value]) => {
      if (Array.isArray(value)) return value.length === 0;
      return !present(value as string | null | undefined);
    })
    .map(([field]) => `missing_${field}`);
}

export function buildWorkPreflightDecision(input: WorkPreflightInput): WorkPreflightDecision {
  const findings = missingRequired({
    objective: input.objective,
    workflow_layer: input.workflow_layer,
    forward_return: input.forward_return,
    acceptance_verification: input.acceptance_verification,
    work_source: input.work_source,
    allowed_scope: input.allowed_scope,
  });
  if (input.conflicts_with_plan_or_handover) findings.push("conflict_with_plan_or_handover");
  if (input.high_impact_unapproved) findings.push("high_impact_unapproved");

  if (input.high_impact_unapproved) return { kind: "escalate", findings };
  if (findings.length > 0) return { kind: "blocker", findings };
  return { kind: "allow", findings: [] };
}

export function classifyTechnicalQuestion(input: QuestionGateInput): TechnicalQuestionDecision {
  const questionClass =
    input.question_class === "technical" ||
    (input.question_class !== "preference" && TECHNICAL_QUESTION_RE.test(input.question_text))
      ? "technical"
      : "preference";

  if (questionClass === "technical") {
    if (present(input.tl_advisor_evidence)) {
      return { kind: "allow", question_class: questionClass, reason: "tl_advisor_evidence" };
    }
    return { kind: "deny", question_class: questionClass, reason: "missing_tl_advisor_evidence" };
  }

  if (present(input.bypass_reason)) {
    return { kind: "bypass_allowed", question_class: questionClass, reason: input.bypass_reason };
  }
  return { kind: "deny", question_class: questionClass, reason: "missing_bypass_reason" };
}

export function registerDetectorAxis(descriptor: DetectorAxisDescriptor): DetectorAxisRegistration {
  const findings = missingRequired({
    axis_id: descriptor.axis_id,
    phase_gate: descriptor.phase_gate,
    kind: descriptor.kind,
    severity: descriptor.severity,
    workflow_route: descriptor.workflow_route,
  });
  return {
    ok: findings.length === 0,
    descriptor: findings.length === 0 ? descriptor : null,
    findings,
  };
}

export function routeDetectorFinding(
  finding: DetectorFinding,
  registry: DetectorAxisRegistry,
): DetectorRouteDecision {
  const descriptor = registry.axes.find((axis) => axis.axis_id === finding.axis_id);
  if (!descriptor || !present(descriptor.workflow_route)) {
    return { kind: "unknown_axis", route: null, reason: "unknown_axis" };
  }
  if (descriptor.kind !== finding.kind) {
    return {
      kind: "reject",
      route: null,
      reason: `detector_kind_mismatch:${descriptor.kind ?? "unknown"}!=${finding.kind}`,
    };
  }
  if (finding.use_as_hard_gate_proof && finding.kind !== "fail_close") {
    return {
      kind: "reject",
      route: null,
      reason: `${finding.kind}_cannot_serve_as_hard_gate_proof`,
    };
  }
  return { kind: "route", route: descriptor.workflow_route, reason: finding.kind };
}

export function buildRecommendationDecision(input: RecommendationInput): RecommendationDecision {
  const findings = missingRequired({
    candidate: input.candidate,
    score: input.score === null || input.score === undefined ? null : String(input.score),
    reason: input.reason,
    references: input.references,
    recommended_role: input.recommended_role,
  });
  if (findings.length > 0) return { kind: "reject", reason: findings.join(",") };
  if (LEGACY_PATH_RE.test(input.candidate) || LEGACY_RUNTIME_COMMAND_RE.test(input.candidate)) {
    return { kind: "harden_required", reason: "legacy_runtime_path_candidate" };
  }
  return { kind: "adopt_candidate", reason: "traceable_candidate" };
}

export function analyzeRunDebugTrace(input: RunDebugTraceInput): RunDebugTraceDecision {
  const missingMeta = missingRequired({
    runtime_surface: input.runtime_surface,
    correlation_id: input.correlation_id,
    evidence_path: input.evidence_path,
  });
  const evidenceText = input.observed_evidence.join("\n");
  const matched = input.expected_actions.filter((action) => evidenceText.includes(action));
  const missingActions = input.expected_actions.filter((action) => !matched.includes(action));
  return {
    kind:
      missingMeta.length > 0 ? "blocked" : missingActions.length > 0 ? "incomplete" : "complete",
    matched_actions: matched,
    missing_actions: [...missingMeta, ...missingActions],
    runtime_surface: input.runtime_surface ?? "",
    correlation_id: input.correlation_id ?? "",
    evidence_path: input.evidence_path ?? "",
  };
}

export function buildCoreInjectionContract(input: CoreInjectionInput): CoreInjectionDecision {
  const findings = missingRequired({
    repo_local_source: input.repo_local_source,
    generated_target: input.generated_target,
    consumer_mode: input.consumer_mode,
    required_marker: input.required_marker,
    provenance: input.provenance,
  });
  const legacyAssumption =
    LEGACY_PATH_RE.test(input.repo_local_source ?? "") ||
    LEGACY_PATH_RE.test(input.generated_target ?? "") ||
    LEGACY_RUNTIME_COMMAND_RE.test(input.repo_local_source ?? "") ||
    LEGACY_RUNTIME_COMMAND_RE.test(input.generated_target ?? "") ||
    input.global_file_only_reference;
  if (legacyAssumption) {
    return {
      disposition: "reject",
      repo_local_source: input.repo_local_source ?? "",
      generated_target: input.generated_target ?? "",
      consumer_mode: input.consumer_mode ?? "",
      required_marker: input.required_marker ?? "",
      provenance: input.provenance ?? "",
      rejected_assumption: "legacy_or_global_path_as_current_truth",
    };
  }
  if (findings.length > 0) {
    return {
      disposition: "harden_required",
      repo_local_source: input.repo_local_source ?? "",
      generated_target: input.generated_target ?? "",
      consumer_mode: input.consumer_mode ?? "",
      required_marker: input.required_marker ?? "",
      provenance: input.provenance ?? "",
      rejected_assumption: findings.join(","),
    };
  }
  return {
    disposition: "adopt",
    repo_local_source: input.repo_local_source ?? "",
    generated_target: input.generated_target ?? "",
    consumer_mode: input.consumer_mode ?? "",
    required_marker: input.required_marker ?? "",
    provenance: input.provenance ?? "",
  };
}

export function classifyLegacyHookSurface(input: LegacyHookSurfaceInput): GuardSurfaceDisposition {
  const runtimeSurface = input.runtime_surface;
  if (
    runtimeSurface !== "claude-hook" &&
    runtimeSurface !== "codex-hook" &&
    runtimeSurface !== "codex-hosted-api" &&
    runtimeSurface !== "ut-tdd-cli" &&
    runtimeSurface !== "external-api"
  ) {
    return {
      state: "rejected",
      runtime_surface: "codex-hosted-api",
      guard_intent: input.guard_intent ?? "",
      reason: "unsupported_runtime_surface",
      oracle: input.test_oracle ?? "",
    };
  }
  const findings = missingRequired({
    hook_source: input.hook_source,
    tool_matcher: input.tool_matcher,
    guard_intent: input.guard_intent,
    parity_target: input.parity_target,
    test_oracle: input.test_oracle,
  });
  return {
    state: findings.length > 0 ? "rejected" : input.wired ? "wired" : "deferred",
    runtime_surface: runtimeSurface,
    guard_intent: input.guard_intent ?? "",
    reason: findings.length > 0 ? findings.join(",") : input.wired ? "wired" : "unwired_deferred",
    oracle: input.test_oracle ?? "",
  };
}

export function buildAgentRolePolicyDecision(input: AgentRolePolicyInput): AgentRolePolicyDecision {
  const findings = missingRequired({
    role_kind: input.role_kind,
    model_family: input.model_family,
    slot: input.slot,
    delegation_boundary: input.delegation_boundary,
    review_substitute: input.review_substitute,
  });
  if (input.self_review || input.unbounded_delegation) {
    return { kind: "deny", reason: "unsafe_delegation_boundary" };
  }
  if (input.overpowered_without_approval) {
    return { kind: "escalate", reason: "overpowered_model_without_approval" };
  }
  if (findings.length > 0) return { kind: "deny", reason: findings.join(",") };
  return { kind: "allow", reason: "bounded_role_policy" };
}

export function mapWorkflowInventoryToPillar(
  input: WorkflowInventoryInput,
): WorkflowMappingDecision {
  const findings = missingRequired({
    workflow_doc: input.workflow_doc,
    trigger: input.trigger,
    pillar: input.pillar,
    workflow_mode: input.workflow_mode,
    gate: input.gate,
    current_owner: input.current_owner,
  });
  if (input.known_workflow === false) {
    return { disposition: "new_plan_required", reason: "unknown_workflow" };
  }
  if (input.duplicate_pillar_count) {
    return { disposition: "harden_required", reason: "duplicate_pillar_count" };
  }
  if (findings.length > 0) return { disposition: "harden_required", reason: findings.join(",") };
  return { disposition: "existing_pillar_covered", reason: "mapped_to_existing_pillar" };
}

export function classifyLegacyDbSurface(input: LegacyDataSurfaceInput): DataSurfaceDecision {
  if (input.raw_state_import) return { disposition: "reject", reason: "raw_legacy_state_import" };
  const findings = missingRequired({
    source: input.source,
    state_kind: input.state_kind,
    projection_target: input.projection_target,
    read_model: input.read_model,
    api_boundary: input.api_boundary,
    provenance: input.provenance,
  });
  if (findings.length > 0) return { disposition: "harden_required", reason: findings.join(",") };
  return { disposition: "adopt", reason: "projected_read_model_with_provenance" };
}

export function buildContinuousRunControlDecision(
  input: ContinuousRunInput,
): ContinuousRunDecision {
  const findings = missingRequired({
    trigger: input.trigger,
    queue_lock: input.queue_lock,
    timebox: input.timebox,
    budget_profile: input.budget_profile,
    stop_condition: input.stop_condition,
    verification_evidence: input.verification_evidence,
  });
  if (input.auto_run && !present(input.stop_condition)) {
    return { kind: "deny", reason: "auto_run_without_stop_condition" };
  }
  if (findings.length > 0) return { kind: "deny", reason: findings.join(",") };
  return { kind: "allow", reason: "bounded_continuous_run" };
}

export function buildLearningFeedbackDecision(
  input: LearningFeedbackInput,
): LearningFeedbackDecision {
  if (input.closes_acceptance) {
    return { kind: "reject", reason: "learning_result_cannot_close_acceptance" };
  }
  const findings = missingRequired({
    event_source: input.event_source,
    recipe_source: input.recipe_source,
    learning_result: input.learning_result,
    target_backlog: input.target_backlog,
    evidence_link: input.evidence_link,
    review_state: input.review_state,
  });
  if (input.review_state === "unreviewed") return { kind: "defer", reason: "awaiting_review" };
  if (findings.length > 0) return { kind: "defer", reason: findings.join(",") };
  return { kind: "adopt_candidate", reason: "reviewed_improvement_candidate" };
}
