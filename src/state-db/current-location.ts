import { createHash } from "node:crypto";
import { VMODEL_ZIP_FILENAME, VMODEL_ZIP_SOURCE_BINDINGS } from "../vmodel/zip-manifest";
import type { HarnessDb } from "./index";

export type ProjectDriveModel =
  | "Forward"
  | "Reverse"
  | "Additive"
  | "Recovery"
  | "Refactor"
  | "OperationVerification";
export type ProjectL12CoverageStatus = "done" | "missing" | "reverify";
export type ProjectDesignCoverageGateStatus = "pass" | "needs_design" | "unknown";
export type ProjectDesignCoverageGateItemStatus = "covered" | "missing" | "reverify";
export type ProjectOperationScopeStatus = "observed" | "designed" | "missing" | "reverify";
export type ProjectArtifactRemapStatus = "done" | "missing" | "reverify";
export type ProjectArtifactRemapKind = "plan" | "design" | "test-design" | "gap";
export type ProjectZipAdoptionCategory = "adopt" | "complement" | "reject";
export type ProjectZipAdoptionItemStatus = "declared" | "missing";
export type ProjectTailoringGateCategory = "required" | "optional" | "na";
export type ProjectTailoringGateItemStatus = "declared" | "missing" | "excluded";

export const PROJECT_ARTIFACT_REMAP_STATUSES: ProjectArtifactRemapStatus[] = [
  "done",
  "missing",
  "reverify",
];

export function isProjectArtifactRemapStatus(status: string): status is ProjectArtifactRemapStatus {
  return PROJECT_ARTIFACT_REMAP_STATUSES.includes(status as ProjectArtifactRemapStatus);
}

export interface ProjectL12LayerCoverage {
  layer: string;
  label: string;
  status: ProjectL12CoverageStatus;
  zipSourceBindingIds?: string[];
  tailoringRuleIds?: string[];
  tailoringDetailLevels?: string[];
  legacyLayers: string[];
  planIds: string[];
  designIds: string[];
  testDesignIds: string[];
  reasons: string[];
}

export interface ProjectDesignCoverageGateItem {
  coverageId: string;
  l12Layer: string;
  label: string;
  zipSourceBindingIds?: string[];
  tailoringRuleIds?: string[];
  tailoringDetailLevels?: string[];
  requiredKinds: string[];
  acceptedLayers: string[];
  status: ProjectDesignCoverageGateItemStatus;
  declarationIds: string[];
  sourcePaths: string[];
  returnRoute: "Forward" | "Reverse";
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectDesignCoverageGate {
  status: ProjectDesignCoverageGateStatus;
  items: ProjectDesignCoverageGateItem[];
  covered: number;
  missing: number;
  reverify: number;
  docDependencies: string[];
  implementationDependencies: string[];
}

export interface ProjectAcceptanceTraceabilityItem {
  acceptanceId: string;
  requirementId: string;
  status: "linked" | "declared" | "missing";
  declarationIds: string[];
  sourcePaths: string[];
  referenceIds: string[];
  referenceStatuses: string[];
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectAcceptanceTraceability {
  status: "pass" | "needs_trace";
  items: ProjectAcceptanceTraceabilityItem[];
  total: number;
  linked: number;
  declared: number;
  missing: number;
  sourceDocument: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md";
  docDependencies: string[];
  implementationDependencies: string[];
}

export interface ProjectScrumOperationItem {
  operationId: string;
  category: "backlog" | "sprint" | "acceptance" | "plan";
  status: "observed" | "missing";
  declarationIds: string[];
  planIds: string[];
  sourcePaths: string[];
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectScrumOperation {
  status: "active" | "planned" | "not_observed";
  sourcePackage: string;
  sourceBindings: string[];
  backlogItems: number;
  sprintItems: number;
  acceptanceItems: number;
  activeSprintPlans: number;
  items: ProjectScrumOperationItem[];
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectSkillBindingItem {
  skillId: string;
  skillPath: string;
  tier: "required" | "recommended" | "optional";
  injectAt: "before_work" | "on_demand";
  rank: number;
  score: number;
  matchedDriveModels: string[];
  matchedLayers: string[];
  sourceDriveModels: string[];
  sourceLayers: string[];
  reasons: string[];
}

export interface ProjectSkillBinding {
  status: "ready" | "catalog_missing" | "no_match";
  sourcePackage: string;
  selectedModel: ProjectDriveModel;
  workflowModes: string[];
  l12Layers: string[];
  requiredSkills: number;
  recommendedSkills: number;
  optionalSkills: number;
  items: ProjectSkillBindingItem[];
  command: "helix skill suggest --plan <active-plan-path>";
  sourceBindings: string[];
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectCurrentLocationFinding {
  code:
    | "l14_claim_with_l7_work"
    | "unresolved_design_reference"
    | "impl_ahead_descent_obligation"
    | "roadmap_uncovered_frontier"
    | "operation_scope_gap"
    | "artifact_remap_unmapped"
    | "design_coverage_gap"
    | "tailoring_required_gap"
    | "design_declaration_drift";
  severity: "error" | "warn" | "info";
  detail: string;
  docDependencies: string[];
  implementationDependencies: string[];
}

export interface ProjectDriveRecommendation {
  model: ProjectDriveModel;
  reason: string;
  reverseTargets: string[];
  docDependencies: string[];
  implementationDependencies: string[];
}

export type ProjectDriveRouteStatus =
  | "forward_ready"
  | "forward_frontier"
  | "reverse_required"
  | "recovery_required"
  | "unknown";

export interface ProjectDriveRouteDecision {
  routeId: string;
  status: ProjectDriveRouteStatus;
  selectedModel: ProjectDriveModel;
  defaultModel: "Forward";
  reason: string;
  writePolicy: "read-only";
  sourceCommand: "helix current-location --json";
  viewCommand: "helix progress tree-view --json";
  mustReturnToDesign: boolean;
  forward: {
    allowed: boolean;
    roadmapStatus: ProjectRoadmapPositionStatus;
    frontier: string[];
    currentBandIds: string[];
    currentGateIds: string[];
    coverageIds: string[];
    coverageLabels: string[];
  };
  reverse: {
    required: boolean;
    targets: string[];
    l12Layers: string[];
    coverageIds: string[];
    coverageLabels: string[];
    docDependencies: string[];
    implementationDependencies: string[];
    queueActions: ProjectClosureQueueNextAction[];
    ledgerIds: string[];
    acceptanceCriteria: string[];
  };
  reasons: string[];
}

export interface ProjectDriveModelCandidate {
  model: ProjectDriveModel;
  rank: number;
  status: "selected" | "available" | "blocked" | "suppressed";
  route_id: string;
  trigger: string;
  required_action: string;
  command: string;
  coverage_ids: string[];
  coverage_labels: string[];
  doc_dependencies: string[];
  implementation_dependencies: string[];
  reasons: string[];
}

export interface ProjectDriveModelReport {
  schema_version: "project-drive-model.v1";
  source_clock: string | null;
  selected_model: ProjectDriveModel;
  default_model: "Forward";
  selection_status: ProjectDriveRouteStatus;
  current: ProjectCurrentLocationSnapshot["current"];
  candidates: ProjectDriveModelCandidate[];
  selected_candidate: ProjectDriveModelCandidate;
  blocked_models: ProjectDriveModel[];
  available_models: ProjectDriveModel[];
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix drive model --json";
  view_command: "helix progress tree-view --json";
}

export interface ProjectRecoveryPlanStep {
  step_id: string;
  sequence: number;
  status: "ready" | "blocked" | "pending" | "not_required";
  command: string;
  required_action: string;
  expected_transition: string;
  doc_dependencies: string[];
  implementation_dependencies: string[];
  reasons: string[];
}

export interface ProjectRecoveryActionLane {
  action: ProjectClosureQueueNextAction;
  rank: number;
  count: number;
  listed: number;
  omitted: number;
  selected: boolean;
  lane_type: "approval" | "evidence_collection" | "evidence_repair" | "design_reverse";
  status: "ready" | "blocked" | "not_required";
  human_required: boolean;
  primary_command: string;
  evidence_plan_command: string;
  batch_command: string;
  review_command: string;
  evidence_probe_command: string | null;
  evidence_materialize_command: string | null;
  evidence_approval_draft_command: string | null;
  evidence_apply_dry_run_command: string | null;
  evidence_apply_execute_command: string | null;
  evidence_apply_write_policy: "approval-required" | null;
  evidence_handoff_artifacts: ProjectClosureEvidenceHandoffArtifacts | null;
  target_tables: string[];
  sample_plan_ids: string[];
  required_action: string;
  expected_transition: string;
  postcheck_commands: string[];
  reasons: string[];
}

export type ProjectRecoveryAutomationClass =
  | "approval_required"
  | "evidence_required"
  | "design_required"
  | "not_required";

export interface ProjectRecoveryAutomationBoundary {
  action: ProjectClosureQueueNextAction;
  lane_type: ProjectRecoveryActionLane["lane_type"];
  automation_class: ProjectRecoveryAutomationClass;
  count: number;
  selected: boolean;
  status: "ready" | "blocked" | "not_required";
  mutation_allowed: false;
  approval_required: boolean;
  dry_run_command: string;
  review_command: string;
  batch_command: string;
  evidence_plan_command: string;
  evidence_patch_command: string | null;
  evidence_patch_write_policy: "approval-required" | null;
  evidence_probe_command: string | null;
  evidence_materialize_command: string | null;
  evidence_approval_draft_command: string | null;
  evidence_apply_dry_run_command: string | null;
  evidence_apply_execute_command: string | null;
  evidence_apply_write_policy: "approval-required" | null;
  evidence_handoff_artifacts: ProjectClosureEvidenceHandoffArtifacts | null;
  execute_command: string | null;
  required_record: string | null;
  safety_policy: string;
  reasons: string[];
}

export interface ProjectRecoveryAutomationRunwayPhase {
  sequence: number;
  action: ProjectClosureQueueNextAction;
  phase_type: "machine" | "approval" | "design_reverse";
  count: number;
  selected: boolean;
  status: ProjectRecoveryActionLane["status"];
  human_required: boolean;
  command: string;
  evidence_probe_command: string | null;
  evidence_materialize_command: string | null;
  evidence_approval_draft_command: string | null;
  evidence_apply_dry_run_command: string | null;
  evidence_apply_execute_command: string | null;
  evidence_apply_write_policy: "approval-required" | null;
  evidence_handoff_artifacts: ProjectClosureEvidenceHandoffArtifacts | null;
  target_tables: string[];
  postcheck_commands: string[];
  remaining_after_phase: number;
  next_gate:
    | "continue_machine_recovery"
    | "approval_gate"
    | "design_reverse_gate"
    | "recompute_drive_model";
  expected_transition: string;
}

export interface ProjectRecoveryAutomationRunway {
  status:
    | "machine_work_available"
    | "approval_required"
    | "design_reverse_required"
    | "clear"
    | "not_required";
  machine_actionable_count: number;
  human_approval_count: number;
  design_reverse_count: number;
  remaining_after_machine_lanes: number;
  next_machine_action: ProjectClosureQueueNextAction | null;
  next_machine_command: string | null;
  next_machine_probe_command: string | null;
  next_machine_materialize_command: string | null;
  next_machine_approval_draft_command: string | null;
  next_machine_apply_dry_run_command: string | null;
  approval_actions: ProjectClosureQueueNextAction[];
  phases: ProjectRecoveryAutomationRunwayPhase[];
  target_tables: string[];
  postcheck_commands: string[];
  expected_transition: string;
  reasons: string[];
}

export interface ProjectRecoveryExitForecastLane {
  action: ProjectClosureQueueNextAction;
  count: number;
  blocking: boolean;
  human_required: boolean;
  command: string;
  required_action: string;
}

export interface ProjectRecoveryExitForecast {
  status: "blocked" | "ready_to_recompute" | "not_required";
  remaining_queue_items: number;
  blocking_lanes: ProjectClosureQueueNextAction[];
  blockers: string[];
  lanes: ProjectRecoveryExitForecastLane[];
  next_command: string;
  expected_transition: string;
}

export interface ProjectRecoveryReentryForecast {
  status:
    | "machine_phase_pending"
    | "approval_gate_pending"
    | "design_reverse_pending"
    | "ready_to_recompute"
    | "not_required";
  current_blocking_count: number;
  blocking_after_machine_lanes: number;
  required_phase_count: number;
  next_phase_action: ProjectClosureQueueNextAction | null;
  next_phase_type: ProjectRecoveryAutomationRunwayPhase["phase_type"] | null;
  next_gate: ProjectRecoveryAutomationRunwayPhase["next_gate"] | "not_required";
  next_command: string;
  next_execution_command: string;
  recompute_commands: string[];
  expected_transition: string;
  reasons: string[];
}

export interface ProjectRecoveryPlan {
  schema_version: "project-recovery-plan.v1";
  source_clock: string | null;
  status: "active" | "not_required";
  current: ProjectCurrentLocationSnapshot["current"];
  drive_model: ProjectDriveModelReport;
  selected_closure_action: ProjectClosureQueueNextAction | null;
  closure_evidence_plan: ProjectClosureEvidencePlan | null;
  action_lanes: ProjectRecoveryActionLane[];
  automation_boundaries: ProjectRecoveryAutomationBoundary[];
  automation_runway: ProjectRecoveryAutomationRunway;
  exit_forecast: ProjectRecoveryExitForecast;
  reentry_forecast: ProjectRecoveryReentryForecast;
  steps: ProjectRecoveryPlanStep[];
  exit_criteria: string[];
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix recovery plan --json";
  view_command: "helix progress tree-view --json";
}

export type ProjectRoadmapPositionStatus = "clear" | "frontier" | "uncovered" | "unknown";

export interface ProjectRoadmapBandPosition {
  bandId: string;
  name: string;
  status: "covered" | "parked" | "uncovered";
  l12Layers: string[];
  coverageIds: string[];
  coverageLabels: string[];
  roadmapIds: string[];
  reasons: string[];
}

export interface ProjectRoadmapGatePosition {
  roadmapGateId: string;
  planId: string;
  gateId: string;
  totalSpans: number;
  confirmedSpans: number;
  reached: boolean;
  l12Layers: string[];
  coverageIds: string[];
  coverageLabels: string[];
  status: "reached" | "pending";
  reasons: string[];
}

export interface ProjectRoadmapPosition {
  status: ProjectRoadmapPositionStatus;
  rollup: {
    total_bands: number;
    covered_bands: number;
    parked_bands: number;
    uncovered_bands: number;
    total_gates: number;
    reached_gates: number;
    total_spans: number;
    confirmed_spans: number;
  };
  frontier: string[];
  current_band_ids: string[];
  current_gate_ids: string[];
  bands: ProjectRoadmapBandPosition[];
  gates: ProjectRoadmapGatePosition[];
  docDependencies: string[];
  implementationDependencies: string[];
}

export interface ProjectRoadmapCurrentAction {
  action_id: string;
  category: "band" | "gate" | "drive_route" | "closure" | "finding";
  status: "current" | "blocked" | "pending" | "reached" | "covered" | "parked";
  automation_class: "machine" | "approval" | "design" | "verification" | "none";
  phase_action: ProjectClosureQueueNextAction | null;
  l12_layers: string[];
  coverage_ids: string[];
  coverage_labels: string[];
  command: string;
  batch_command: string | null;
  review_command: string | null;
  evidence_patch_command: string | null;
  evidence_probe_command: string | null;
  evidence_materialize_command: string | null;
  evidence_approval_draft_command: string | null;
  evidence_apply_dry_run_command: string | null;
  evidence_apply_execute_command: string | null;
  evidence_apply_write_policy: "approval-required" | null;
  required_action: string;
  doc_dependencies: string[];
  implementation_dependencies: string[];
  reasons: string[];
}

export interface ProjectRoadmapCurrentReport {
  schema_version: "project-roadmap-current.v1";
  source_clock: string | null;
  status: "synced" | "frontier" | "uncovered" | "contradicted" | "unknown";
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  roadmap_position: ProjectRoadmapPosition;
  consistency: {
    aligned: boolean;
    db_current_l12_layer: string | null;
    roadmap_current_l12_layers: string[];
    roadmap_projected_l12_layers: string[];
    roadmap_terminal_l12_layers: string[];
    alignment_basis: "frontier" | "terminal" | "none";
    blocking_findings: string[];
    reasons: string[];
  };
  actions: ProjectRoadmapCurrentAction[];
  counts: {
    current_bands: number;
    current_gates: number;
    blockers: number;
    actions: number;
  };
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix roadmap current --json";
  view_command: "helix progress tree-view --json";
}

export interface ProjectCurrentLocationSnapshot {
  schema_version: "project-current-location.v1";
  source_clock: string | null;
  current: {
    layer: string | null;
    l12_layer: string | null;
    status: "forward" | "needs_reverse" | "needs_recovery" | "unknown";
    completion_boundary: "open" | "contradicted" | "closed";
    roadmap_frontier: string[];
  };
  counts: {
    plans_total: number;
    open_l7_plans: number;
    terminal_l14_plans: number;
    design_declarations: number;
    design_references: number;
    design_impact: number;
    unresolved_design_references: number;
    design_declaration_drifts: number;
    impl_ahead_obligations: number;
    uncovered_roadmap_bands: number;
  };
  roadmap_position: ProjectRoadmapPosition;
  design_coverage_gate: ProjectDesignCoverageGate;
  acceptance_traceability: ProjectAcceptanceTraceability;
  zip_adoption: ProjectZipAdoptionMatrix;
  tailoring_gate: ProjectTailoringGate;
  scrum_operation?: ProjectScrumOperation;
  skill_binding?: ProjectSkillBinding;
  closure: ProjectClosureStatus;
  coverage: {
    l12_layers: ProjectL12LayerCoverage[];
    done: number;
    missing: number;
    reverify: number;
  };
  operation_scope: {
    items: ProjectOperationScopeCoverage[];
    designed: number;
    observed: number;
    observed_gap: number;
    missing: number;
    reverify: number;
  };
  artifact_remap: {
    items: ProjectArtifactRemap[];
    layers: ProjectArtifactRemapLayerSummary[];
    done: number;
    missing: number;
    reverify: number;
  };
  findings: ProjectCurrentLocationFinding[];
  drive_recommendation: ProjectDriveRecommendation;
  drive_route: ProjectDriveRouteDecision;
  recovery?: {
    status: ProjectRecoveryPlan["status"];
    selected_closure_action: ProjectClosureQueueNextAction | null;
    exit_forecast: ProjectRecoveryExitForecast;
    automation_runway: ProjectRecoveryAutomationRunway;
    reentry_forecast: ProjectRecoveryReentryForecast;
    source_command: "helix recovery plan --json";
    view_command: "helix progress tree-view --json";
  } | null;
}

export interface ProjectTailoringGateItem {
  tailoringId: string;
  category: ProjectTailoringGateCategory;
  label: string;
  detailLevel: "詳細" | "標準" | "簡易" | "省略";
  status: ProjectTailoringGateItemStatus;
  declarationIds: string[];
  sourcePaths: string[];
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectTailoringGate {
  status: "pass" | "needs_tailoring";
  profile: "solo";
  items: ProjectTailoringGateItem[];
  required: number;
  optional: number;
  excluded: number;
  missing_required: number;
  sourceDocument: "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md";
  docDependencies: string[];
  implementationDependencies: string[];
}

export interface ProjectZipAdoptionMatrixItem {
  adoptionId: string;
  category: ProjectZipAdoptionCategory;
  label: string;
  status: ProjectZipAdoptionItemStatus;
  declarationIds: string[];
  sourcePaths: string[];
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectZipAdoptionMatrix {
  status: "complete" | "missing";
  items: ProjectZipAdoptionMatrixItem[];
  adopted: number;
  complemented: number;
  rejected: number;
  missing: number;
  sourcePackage: string;
  sourceDocument: "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md";
  docDependencies: string[];
  implementationDependencies: string[];
}

export interface ProjectClosureBatchReport {
  schema_version: "project-closure-batch.v1";
  source_clock: string | null;
  selected_action: ProjectClosureQueueNextAction | null;
  available_actions: ProjectClosureQueueNextAction[];
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  packet: ProjectClosurePacket | null;
  ledger: ProjectClosureNextActionLedgerEntry | null;
  work_buckets: ProjectClosureBatchWorkBucket[];
  queue_items: ProjectClosureQueueItem[];
  total: number;
  listed: number;
  omitted: number;
  limit: number;
  offset: number;
  window: {
    start: number;
    end: number;
    page_index: number;
    page_count: number;
    has_previous: boolean;
    has_next: boolean;
    previous_offset: number | null;
    next_offset: number | null;
  };
  write_policy: "read-only";
  source_command: "helix closure batch --json";
  view_command: "helix progress tree-view --json";
  findings: ProjectCurrentLocationFinding[];
}

export interface ProjectClosureBatchWorkBucket {
  bucket_id: string;
  action: ProjectClosureQueueNextAction;
  rank: number;
  count: number;
  listed: number;
  omitted: number;
  evidence_signature: string;
  evidence_components: string[];
  evidence_statuses: string[];
  target_tables: string[];
  primary_command: string;
  evidence_plan_command: string;
  postcheck_commands: string[];
  repair_plan: ProjectClosureBatchRepairPlan;
  required_action: string;
  expected_transition: string;
  sample_plan_ids: string[];
  doc_dependencies: string[];
  implementation_dependencies: string[];
  reasons: string[];
}

export interface ProjectClosureBatchRepairPlan {
  status: "not_required" | "needs_evidence" | "needs_repair";
  failed_evidence_count: number;
  latest_failed_at: string | null;
  automation: ProjectClosureBatchRepairAutomation;
  command_candidates: ProjectClosureBatchRepairCommandCandidate[];
  projection_plan_ids: string[];
  projection_items: ProjectClosureBatchRepairProjectionItem[];
  required_green_tables: string[];
  required_green_status: "passed_or_accepted";
  projection_templates: ProjectClosureEvidenceRowTemplate[];
  projection_policy: string;
  safety_policy: string;
  reasons: string[];
}

export interface ProjectClosureBatchRepairAutomation {
  status:
    | "not_required"
    | "ready_to_execute"
    | "needs_command_resolution"
    | "needs_evidence_projection";
  command_candidate_count: number;
  runnable_command_count: number;
  label_only_command_count: number;
  resolution_candidate_count: number;
  safe_resolution_command_count: number;
  projection_item_count: number;
  primary_next_command: string | null;
  blockers: string[];
  required_action: string;
  reasons: string[];
}

export interface ProjectClosureBatchRepairProjectionItem {
  plan_id: string;
  source_path: string;
  failed_evidence_count: number;
  latest_failed_at: string | null;
  command_labels: string[];
  evidence_paths: string[];
  required_green_tables: string[];
  projection_templates: ProjectClosureEvidenceRowTemplate[];
  evidence_artifact_templates: ProjectClosureGreenEvidenceArtifactTemplate[];
  evidence_patch_plan: ProjectClosureGreenEvidencePatchPlan;
  required_action: string;
  postcheck_commands: string[];
  reasons: string[];
}

export interface ProjectClosureGreenEvidenceArtifactTemplate {
  artifact_kind:
    | "plan_review_evidence"
    | "structured_test_evidence"
    | "runtime_verification_evidence";
  artifact_path: string;
  projection_target_tables: string[];
  template_format: "yaml_frontmatter" | "json";
  write_policy: "template_only";
  required_fields: string[];
  example: Record<string, unknown>;
  required_action: string;
  reasons: string[];
}

export interface ProjectClosureGreenEvidencePatchPlan {
  approval_required: true;
  write_policy: "approval-required";
  dry_run_command: string;
  execute_command: null;
  patch_candidates: ProjectClosureGreenEvidencePatchCandidate[];
  postcheck_commands: string[];
  safety_policy: string;
  reasons: string[];
}

export interface ProjectClosureGreenEvidencePatchCandidate {
  artifact_kind: ProjectClosureGreenEvidenceArtifactTemplate["artifact_kind"];
  artifact_path: string;
  operation: "append_yaml_frontmatter" | "create_json_artifact";
  template_format: ProjectClosureGreenEvidenceArtifactTemplate["template_format"];
  projection_target_tables: string[];
  preview_digest: string;
  preview_lines: string[];
  unresolved_placeholders: string[];
  placeholder_count: number;
  real_evidence_required: boolean;
  required_action: string;
}

export interface ProjectClosureBatchRepairCommandCandidate {
  command_label: string;
  command_verb: string | null;
  runnable_command: string | null;
  resolution_candidates: ProjectClosureBatchCommandResolutionCandidate[];
  count: number;
  latest_observed_at: string | null;
  evidence_paths: string[];
  sample_plan_ids: string[];
  required_action: string;
  reasons: string[];
}

export interface ProjectClosureBatchCommandResolutionCandidate {
  command: string;
  source: "classified_verb" | "known_helix_surface" | "package_script";
  confidence: "high" | "medium" | "low";
  safe_to_run: boolean;
  projection_binding: ProjectClosureBatchCommandProjectionBinding;
  required_action: string;
}

export interface ProjectClosureBatchCommandProjectionBinding {
  target_tables: string[];
  source_surfaces: string[];
  required_fields: string[];
  success_status: "passed_or_accepted";
  write_policy: "read-only_plan";
  postcheck_commands: string[];
  required_action: string;
}

export interface ProjectClosureEvidencePlanGapCount {
  component: ProjectClosureEvidenceGap["component"];
  status: ProjectClosureEvidenceGap["status"];
  count: number;
  evidence_tables: string[];
  required_action: string;
}

export interface ProjectClosureEvidenceRowTemplate {
  table: string;
  purpose: string;
  status_after_projection: string;
  required_fields: string[];
  example_row: Record<string, string | number | null>;
  required_action: string;
}

export interface ProjectClosureEvidencePlanItem {
  plan_id: string;
  source_path: string;
  next_action: ProjectClosureQueueNextAction;
  remediation_status: ProjectArtifactRemapStatus;
  evidence_status: ProjectClosureEvidenceSummary["status"];
  evidence_action: string;
  target_tables: string[];
  evidence_gaps: ProjectClosureEvidenceGap[];
  repair_targets: ProjectClosureFailedEvidence[];
  evidence_templates: ProjectClosureEvidenceRowTemplate[];
  expected_transition: string;
  required_action: string;
  doc_dependencies: string[];
  implementation_dependencies: string[];
  postcheck_commands: string[];
  reasons: string[];
}

export interface ProjectClosureEvidencePlan {
  schema_version: "project-closure-evidence-plan.v1";
  source_clock: string | null;
  selected_action: ProjectClosureQueueNextAction | null;
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  total: number;
  listed: number;
  omitted: number;
  limit: number;
  evidence_gap_counts: ProjectClosureEvidencePlanGapCount[];
  target_tables: string[];
  items: ProjectClosureEvidencePlanItem[];
  acceptance_criteria: string[];
  postcheck_commands: string[];
  expected_transition: string | null;
  write_policy: "read-only";
  source_command: "helix closure evidence-plan --json";
  view_command: "helix progress tree-view --json";
  findings: ProjectCurrentLocationFinding[];
}

export interface ProjectClosureEvidencePatchPacketCandidate {
  candidate_id: string;
  plan_id: string;
  source_path: string;
  artifact_kind: ProjectClosureGreenEvidencePatchCandidate["artifact_kind"];
  artifact_path: string;
  operation: ProjectClosureGreenEvidencePatchCandidate["operation"];
  template_format: ProjectClosureGreenEvidencePatchCandidate["template_format"];
  projection_target_tables: string[];
  preview_digest: string;
  preview_lines: string[];
  unresolved_placeholders: string[];
  placeholder_count: number;
  real_evidence_required: boolean;
  required_action: string;
  postcheck_commands: string[];
  rollback_note: string;
  reasons: string[];
}

export interface ProjectClosureEvidencePatchPacket {
  schema_version: "project-closure-evidence-patch-packet.v1";
  source_clock: string | null;
  selected_action: ProjectClosureQueueNextAction | null;
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  queue_total: number;
  queue_listed: number;
  queue_omitted: number;
  limit: number;
  patch_candidate_count: number;
  patch_candidates: ProjectClosureEvidencePatchPacketCandidate[];
  apply_readiness: {
    status: "no_candidates" | "blocked_placeholders" | "ready_for_approval";
    allowed_to_apply: false;
    placeholder_count: number;
    blocked_candidate_count: number;
    required_action: string;
    execute_command: null;
  };
  approval: {
    required: true;
    decision_id: string;
    approval_scope_digest: string;
    allowed_outcomes: string[];
    required_record_fields: string[];
  };
  safety_policy: {
    packet_write_policy: "read-only";
    patch_write_policy: "approval-required";
    execute_command: null;
    dry_run_command: string;
    safeguards: string[];
  };
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix closure evidence-patch --json";
  view_command: "helix progress tree-view --json";
  findings: ProjectCurrentLocationFinding[];
}

export interface ProjectClosureEvidenceProbeExecution {
  command: string;
  session_id?: string;
  correlation_id?: string;
  started_at: string;
  completed_at: string;
  exit_code: number | null;
  status: "passed" | "failed" | "error";
  output_digest: string;
  stdout_bytes: number;
  stderr_bytes: number;
  output_excerpt?: {
    stdout_head: string;
    stdout_tail: string;
    stderr_head: string;
    stderr_tail: string;
    truncated: boolean;
    limit: number;
  };
  error_message: string | null;
}

export interface ProjectClosureEvidenceProbePacket {
  schema_version: "project-closure-evidence-probe.v1";
  source_clock: string | null;
  selected_action: ProjectClosureQueueNextAction | null;
  dry_run: boolean;
  command: string | null;
  can_execute: boolean;
  command_source: string | null;
  confidence: string | null;
  target_plan_ids: string[];
  projection_binding: ProjectClosureBatchCommandProjectionBinding | null;
  execution: ProjectClosureEvidenceProbeExecution | null;
  placeholder_resolution: {
    fillable_placeholders: string[];
    remaining_placeholders: string[];
    required_action: string;
  };
  apply_readiness: {
    status:
      | "command_not_available"
      | "dry_run"
      | "command_failed"
      | "needs_artifact_values";
    allowed_to_materialize: false;
    required_action: string;
  };
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix closure evidence-probe --json";
  view_command: "helix progress tree-view --json";
  findings: ProjectCurrentLocationFinding[];
}

export interface ProjectClosureEvidenceMaterializeCandidate {
  candidate_id: string;
  plan_id: string;
  artifact_path: string;
  operation: ProjectClosureGreenEvidencePatchCandidate["operation"];
  projection_target_tables: string[];
  materialized_preview_digest: string;
  materialized_preview_lines: string[];
  filled_placeholders: string[];
  placeholder_resolution_sources: Array<{
    placeholder: string;
    source: "probe_execution" | "deterministic_closure_rule";
    value_digest: string;
  }>;
  remaining_placeholders: string[];
  remaining_placeholder_count: number;
  ready_for_approval: boolean;
  required_action: string;
}

export interface ProjectClosureEvidenceMaterializePacket {
  schema_version: "project-closure-evidence-materialize.v1";
  source_clock: string | null;
  selected_action: ProjectClosureQueueNextAction | null;
  probe_execution: ProjectClosureEvidenceProbeExecution | null;
  queue_total: number;
  queue_listed: number;
  queue_omitted: number;
  materialized_candidate_count: number;
  materialized_candidates: ProjectClosureEvidenceMaterializeCandidate[];
  materialize_readiness: {
    status: "no_probe_execution" | "probe_not_green" | "blocked_placeholders" | "ready_for_approval";
    allowed_to_apply: false;
    remaining_placeholder_count: number;
    blocked_candidate_count: number;
    required_action: string;
    execute_command: null;
  };
  approval: {
    required: true;
    decision_id: string;
    approval_scope_digest: string;
    required_record_fields: string[];
  };
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix closure evidence-materialize --json";
  view_command: "helix progress tree-view --json";
  findings: ProjectCurrentLocationFinding[];
}

export interface ProjectClosureEvidenceApplyPlan {
  schema_version: "project-closure-evidence-apply-plan.v1";
  source_clock: string | null;
  dry_run: true;
  selected_action: ProjectClosureQueueNextAction | null;
  materialize_readiness: ProjectClosureEvidenceMaterializePacket["materialize_readiness"];
  approval: {
    required: true;
    record_path: string | null;
    valid: boolean;
    decision_id: string | null;
    outcome: string | null;
    approval_scope_digest: string | null;
    reasons: string[];
  };
  allowed_to_apply: boolean;
  blocked_reasons: string[];
  patch_candidates: Array<{
    candidate_id: string;
    plan_id: string;
    artifact_path: string;
    operation: ProjectClosureGreenEvidencePatchCandidate["operation"];
    materialized_preview_digest: string;
    materialized_preview_lines: string[];
    expected_effect: string;
    rollback_note: string;
  }>;
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix closure evidence-apply --dry-run --json";
  view_command: "helix progress tree-view --json";
}

export interface ProjectClosureEvidenceApprovalDraftPacket {
  schema_version: "project-closure-evidence-approval-draft.v1";
  source_clock: string | null;
  selected_action: ProjectClosureQueueNextAction | null;
  plan_only: true;
  must_not_apply: true;
  approval_allowed: false;
  apply_authorized: false;
  materialize_readiness: ProjectClosureEvidenceMaterializePacket["materialize_readiness"];
  materialized_candidate_count: number;
  approval: {
    required: true;
    decision_id: string;
    approval_scope_digest: string;
    draft_outcome: "pending_human_review";
    allowed_outcomes: ["approve_materialized_evidence", "reject_materialized_evidence"];
    non_authorizing: true;
    required_action: string;
  };
  candidate_digests: Array<{
    candidate_id: string;
    plan_id: string;
    artifact_path: string;
    operation: ProjectClosureGreenEvidencePatchCandidate["operation"];
    materialized_preview_digest: string;
    ready_for_approval: boolean;
  }>;
  approval_record_template: string[];
  approval_record_text: string;
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix closure evidence-approval-draft --json";
  view_command: "helix progress tree-view --json";
  findings: ProjectCurrentLocationFinding[];
}

export interface ProjectArtifactRemapBatchItem {
  kind: ProjectArtifactRemapKind;
  artifactId: string;
  sourcePath: string;
  legacyLayer: string | null;
  l12Layer: string | null;
  coverageId: string | null;
  coverageLabel: string | null;
  zipSourceBindingIds: string[];
  tailoringRuleIds: string[];
  tailoringDetailLevels: string[];
  status: ProjectArtifactRemapStatus;
  driveModel: ProjectDriveModel;
  requiredAction: string;
  docDependencies: string[];
  implementationDependencies: string[];
  closureLink: {
    planId: string;
    nextAction: ProjectClosureQueueNextAction;
    evidenceStatus: ProjectClosureEvidenceSummary["status"];
    remediationStatus: ProjectArtifactRemapStatus;
    batchCommand: string;
    reviewCommand: string;
    transitionCommand: string;
    priority: number;
  } | null;
  reasons: string[];
}

export interface ProjectArtifactRemapBatchReport {
  schema_version: "project-artifact-remap-batch.v1";
  source_clock: string | null;
  selected_layer: string | null;
  selected_status: ProjectArtifactRemapStatus | null;
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  layers: ProjectArtifactRemapLayerSummary[];
  items: ProjectArtifactRemapBatchItem[];
  total: number;
  listed: number;
  omitted: number;
  limit: number;
  counts: {
    done: number;
    missing: number;
    reverify: number;
  };
  recommended_next_action: {
    model: ProjectDriveModel;
    command: string;
    human_required: false;
    reason: string;
  };
  write_policy: "read-only";
  source_command: "helix artifact-remap batch --json";
  view_command: "helix progress tree-view --json";
}

export interface ProjectClosureOverview {
  schema_version: "project-closure-overview.v1";
  source_clock: string | null;
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  closure: {
    status: ProjectClosureStatus["status"];
    open_l7: number;
    l14_claims: number;
    closure_evidence: number;
    remediation: {
      done: number;
      missing: number;
      reverify: number;
    };
    queue_total: number;
    route_counts: ProjectClosureQueueRouteCounts;
    ledger_status_counts: ProjectClosureNextActionLedgerStatusCounts;
    apply_readiness: {
      close_ready_count: number;
      approval_required: boolean;
      status: "approval_required" | "no_close_ready_candidates";
      dry_run_command: string;
      execute_command: string;
      review_bundle_command: "helix closure review-bundle --action close_ready --summary-json";
      transition_plan_command: "helix closure transition-plan --action close_ready --summary-json";
      review_window_command: string;
      transition_window_command: string;
      decision_draft_command: string;
      write_policy: "approval-required";
    };
  };
  actions: Array<{
    action: ProjectClosureQueueNextAction;
    count: number;
    listed: number;
    omitted: number;
    batch_id: string | null;
    ledger_status: string | null;
    human_required: boolean;
    evidence_policy: string | null;
    review_command: string;
    transition_command: string;
    sample_plan_ids: string[];
    required_action: string | null;
    promotion_gate: string | null;
  }>;
  recommended_next_action: {
    action: ProjectClosureQueueNextAction | null;
    reason: string;
    command: string;
    human_required: boolean;
  };
  findings: ProjectCurrentLocationFinding[];
  write_policy: "read-only";
  source_command: "helix closure overview --json";
  view_command: "helix progress tree-view --json";
}

export interface ProjectClosureReviewBundle {
  schema_version: "project-closure-review-bundle.v1";
  source_clock: string | null;
  action: ProjectClosureQueueNextAction;
  approval_required: boolean;
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  packet: ProjectClosurePacket | null;
  ledger: ProjectClosureNextActionLedgerEntry | null;
  candidates: ProjectClosureQueueItem[];
  total: number;
  listed: number;
  omitted: number;
  limit: number;
  offset: number;
  window: ProjectClosureBatchReport["window"];
  review_scope: {
    approval_scope_digest: string;
    plan_ids: string[];
    source_paths: string[];
    coverage_ids: string[];
    l12_layers: string[];
    evidence_totals: {
      artifact_paths: number;
      evidence_paths: number;
      trace_edges: number;
      test_runs_total: number;
      test_runs_passed: number;
      gate_runs_total: number;
      gate_runs_passed: number;
      runtime_verification_total: number;
      runtime_verification_accepted: number;
    };
    blocked_by_findings: string[];
  };
  decision: {
    decision_id: string;
    allowed_outcomes: string[];
    outcome_routes: ProjectClosureOutcomeRoute[];
    required_evidence: string[];
    approval_record_template: string[];
    blocked_by_findings: string[];
  };
  safeguards: string[];
  write_policy: "read-only";
  source_command: "helix closure review-bundle --json";
  view_command: "helix progress tree-view --json";
}

export interface ProjectClosureOutcomeRoute {
  outcome: string;
  projection_type: "apply_closure" | "reroute_closure_lane" | "unsupported_outcome";
  target_action: ProjectClosureQueueNextAction | "accepted" | null;
  drive_model: ProjectDriveModel;
  human_required: boolean;
  command: string;
  transition_command: string;
  expected_transition: string;
  required_action: string;
  doc_dependencies: string[];
  implementation_dependencies: string[];
  postcheck_commands: string[];
  reasons: string[];
}

export interface ProjectClosureTransitionPlan {
  schema_version: "project-closure-transition-plan.v1";
  source_clock: string | null;
  action: ProjectClosureQueueNextAction;
  decision_outcome: string;
  dry_run: true;
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectDriveRouteDecision;
  target_plan_ids: string[];
  total: number;
  listed: number;
  omitted: number;
  limit: number;
  offset: number;
  window: ProjectClosureBatchReport["window"];
  approval_scope_digest: string;
  allowed_to_apply: boolean;
  blocked_reasons: string[];
  outcome_projection: ProjectClosureOutcomeRoute;
  planned_steps: Array<{
    step_id: string;
    target: string;
    operation: string;
    expected_effect: string;
    evidence_required: string[];
  }>;
  postcheck_commands: string[];
  rollback_notes: string[];
  write_policy: "read-only";
  source_command: string;
  view_command: "helix progress tree-view --json";
}

export interface ProjectClosureDecisionDraftPacket {
  schema_version: "project-closure-decision-draft.v1";
  source_clock: string | null;
  action: ProjectClosureQueueNextAction;
  plan_only: true;
  must_not_apply: true;
  approval_allowed: false;
  apply_authorized: false;
  review: {
    total: number;
    listed: number;
    omitted: number;
    limit: number;
    offset: number;
    window: ProjectClosureBatchReport["window"];
  };
  decision: {
    decision_id: string;
    approval_scope_digest: string;
    draft_outcome: "pending_human_review";
    allowed_outcomes: string[];
    outcome_routes: ProjectClosureOutcomeRoute[];
    non_authorizing: true;
    required_action: string;
  };
  candidate_digests: Array<{
    plan_id: string;
    source_path: string;
    l12_layer: string;
    coverage_id: string | null;
    coverage_label: string | null;
    evidence_status: ProjectClosureEvidenceSummary["status"];
    ready_for_approval: boolean;
  }>;
  approval_record_template: string[];
  approval_record_text: string;
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: "helix closure decision-draft --json";
  view_command: "helix progress tree-view --json";
  findings: ProjectCurrentLocationFinding[];
}

export interface ProjectClosureApplyPlan {
  schema_version: "project-closure-apply-plan.v1";
  source_clock: string | null;
  dry_run: true;
  action: "close_ready";
  approval: {
    required: true;
    record_path: string | null;
    valid: boolean;
    decision_id: string | null;
    outcome: string | null;
    approval_scope_digest: string | null;
    reasons: string[];
  };
  allowed_to_apply: boolean;
  blocked_reasons: string[];
  patch_candidates: Array<{
    plan_id: string;
    source_path: string;
    current_status: string;
    next_status: "accepted";
    operation: "frontmatter_status_update";
    expected_effect: string;
    evidence_summary: {
      artifact_paths: string[];
      evidence_paths: string[];
      test_runs: ProjectClosureEvidenceSummary["testRuns"];
      gate_runs: ProjectClosureEvidenceSummary["gateRuns"];
      runtime_verification: ProjectClosureEvidenceSummary["runtimeVerification"];
    };
  }>;
  postcheck_commands: string[];
  write_policy: "read-only";
  source_command: string;
  view_command: "helix progress tree-view --json";
}

export interface ProjectClosureStatus {
  status: "closed" | "open" | "contradicted" | "unknown";
  l7_open_plan_ids: string[];
  terminal_l14_plan_ids: string[];
  closure_evidence_ids: string[];
  required_evidence: string[];
  remediation: {
    items: ProjectClosureRemediation[];
    done: number;
    missing: number;
    reverify: number;
  };
  queue: {
    items: ProjectClosureQueueItem[];
    total: number;
    route_counts: ProjectClosureQueueRouteCounts;
  };
  packets: {
    items: ProjectClosurePacket[];
    total: number;
  };
  next_action_ledger: {
    entries: ProjectClosureNextActionLedgerEntry[];
    total: number;
    status_counts: ProjectClosureNextActionLedgerStatusCounts;
    write_policy: "read-only";
    source_command: "helix current-location --json";
    view_command: "helix progress tree-view --json";
  };
  docDependencies: string[];
  implementationDependencies: string[];
}

export type ProjectClosureNextActionLedgerStatus =
  | "ready"
  | "needs_evidence"
  | "needs_repair"
  | "needs_reverse";

export interface ProjectClosureNextActionLedgerStatusCounts {
  ready: number;
  needs_evidence: number;
  needs_repair: number;
  needs_reverse: number;
}

export interface ProjectClosureNextActionLedgerEntry {
  ledgerId: string;
  packetId: string;
  nextAction: ProjectClosureQueueNextAction;
  status: ProjectClosureNextActionLedgerStatus;
  driveModel: ProjectDriveModel;
  l12Layer: string;
  count: number;
  primaryCommand: "helix current-location --json";
  reviewSurface: "helix progress tree-view --json";
  writePolicy: "read-only";
  planIds: string[];
  samplePlanIds: string[];
  sourcePaths: string[];
  requiredAction: string;
  docDependencies: string[];
  implementationDependencies: string[];
  acceptanceCriteria: string[];
  evidencePolicy: string;
  automation: ProjectClosureAutomationGuide;
  humanRequired: boolean;
  reasons: string[];
}

export interface ProjectClosurePacket {
  packetId: string;
  nextAction: ProjectClosureQueueNextAction;
  label: string;
  driveModel: ProjectDriveModel;
  l12Layer: string;
  count: number;
  planIds: string[];
  sourcePaths: string[];
  requiredAction: string;
  docDependencies: string[];
  implementationDependencies: string[];
  acceptanceCriteria: string[];
  automation: ProjectClosureAutomationGuide;
  reasons: string[];
}

export interface ProjectClosureAutomationGuide {
  batchId: string;
  sequence: number;
  machineFilter: string;
  detectionSource: "harness.db";
  reviewCommand: string;
  viewCommand: "helix progress tree-view --json";
  writePolicy: "read-only";
  expectedTransition: string;
  promotionGate: string;
  samplePlanIds: string[];
}

export interface ProjectClosureQueueItem {
  planId: string;
  kind: string;
  status: string;
  updatedAt: string | null;
  sourcePath: string;
  l12Layer: string;
  coverageId: string | null;
  coverageLabel: string | null;
  priority: number;
  driveModel: ProjectDriveModel;
  remediationStatus: ProjectArtifactRemapStatus;
  nextAction: ProjectClosureQueueNextAction;
  requiredAction: string;
  docDependencies: string[];
  implementationDependencies: string[];
  evidence: ProjectClosureEvidenceSummary;
  evidenceGaps: ProjectClosureEvidenceGap[];
  evidenceAction: string;
  reasons: string[];
}

export type ProjectClosureQueueNextAction =
  | "close_ready"
  | "collect_evidence"
  | "repair_failed_evidence"
  | "reverse_design";

export const PROJECT_CLOSURE_QUEUE_ACTIONS: ProjectClosureQueueNextAction[] = [
  "close_ready",
  "collect_evidence",
  "repair_failed_evidence",
  "reverse_design",
];

export function isProjectClosureQueueNextAction(
  action: string,
): action is ProjectClosureQueueNextAction {
  return PROJECT_CLOSURE_QUEUE_ACTIONS.includes(action as ProjectClosureQueueNextAction);
}

export interface ProjectClosureQueueRouteCounts {
  close_ready: number;
  collect_evidence: number;
  repair_failed_evidence: number;
  reverse_design: number;
}

export interface ProjectClosureEvidenceSummary {
  status: "missing" | "partial" | "ready";
  artifactPaths: string[];
  traceEdges: number;
  testRuns: {
    total: number;
    passed: number;
    failed: number;
  };
  gateRuns: {
    total: number;
    passed: number;
    failed: number;
  };
  runtimeVerification: {
    total: number;
    accepted: number;
  };
  evidencePaths: string[];
  failedEvidence?: ProjectClosureFailedEvidence[];
}

export interface ProjectClosureFailedEvidence {
  component: "test" | "gate";
  id: string;
  status: string;
  command: string | null;
  evidencePath: string | null;
  outputDigest: string | null;
  observedAt: string | null;
  requiredAction: string;
}

export interface ProjectClosureEvidenceGap {
  component: "artifact" | "execution" | "test" | "gate" | "runtime";
  status: "missing" | "failed" | "not_accepted";
  evidenceTables: string[];
  requiredAction: string;
}

export interface ProjectClosureRemediation {
  category: "l7_open_plan" | "closure_evidence" | "l14_claim";
  label: string;
  status: ProjectArtifactRemapStatus;
  l12Layer: string;
  count: number;
  subjectIds: string[];
  requiredAction: string;
  docDependencies: string[];
  implementationDependencies: string[];
  reasons: string[];
}

export interface ProjectOperationScopeCoverage {
  scope: string;
  label: string;
  coverageId: string;
  coverageLabel: string;
  status: ProjectOperationScopeStatus;
  designIds: string[];
  observedCount: number;
  observationSources: string[];
  evidenceTables: string[];
  reasons: string[];
}

export interface ProjectArtifactRemap {
  kind: ProjectArtifactRemapKind;
  artifactId: string;
  sourcePath: string;
  legacyLayer: string | null;
  l12Layer: string | null;
  coverageId: string | null;
  coverageLabel: string | null;
  zipSourceBindingIds?: string[];
  tailoringRuleIds?: string[];
  tailoringDetailLevels?: string[];
  status: ProjectArtifactRemapStatus;
  reasons: string[];
}

export interface ProjectArtifactRemapLayerSummary {
  layer: string;
  label: string;
  status: ProjectArtifactRemapStatus;
  driveModel: ProjectDriveModel;
  total: number;
  done: number;
  missing: number;
  reverify: number;
  artifactIds: string[];
  batchCommand: string;
  requiredAction: string;
  reasons: string[];
}

const LAYER_ORDER = [
  "L0",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "L6",
  "L7",
  "L8",
  "L9",
  "L10",
  "L11",
  "L12",
  "L13",
  "L14",
] as const;

const REACHED_STATUSES = new Set(["confirmed", "completed", "accepted"]);
const ACTIVE_STATUSES = new Set(["draft", "confirmed", "in_progress", "active"]);
const TERMINAL_STATUSES = new Set(["confirmed", "completed", "accepted"]);

const L12_LAYERS = [
  { layer: "L1", label: "企画" },
  { layer: "L2", label: "要求+画面" },
  { layer: "L3", label: "要件凍結" },
  { layer: "L4", label: "基本設計" },
  { layer: "L5", label: "詳細設計+テスト設計" },
  { layer: "L6", label: "実装" },
  { layer: "L7", label: "TDD closure" },
  { layer: "L8", label: "単体テスト" },
  { layer: "L9", label: "結合テスト" },
  { layer: "L10", label: "総合テスト" },
  { layer: "L11", label: "受入テスト" },
  { layer: "L12", label: "運用テスト" },
] as const;

const OPERATION_SCOPES = [
  {
    scope: "log_design",
    label: "ログ設計",
    patterns: [/ログ/, /\blog\b/i, /\blogging\b/i],
    tables: ["design_declarations", "runtime_verification_events"],
  },
  {
    scope: "kpi_metric",
    label: "KPI/metric",
    patterns: [/\bkpi\b/i, /\bmetric\b/i, /メトリク/, /指標/],
    tables: ["design_declarations", "runtime_verification_events"],
  },
  {
    scope: "runtime_verification",
    label: "runtime verification",
    patterns: [/runtime[_ -]?verification/i, /実行時検証/, /運用後検証/],
    tables: ["design_declarations", "runtime_verification_events"],
  },
  {
    scope: "operation_test",
    label: "運用テスト",
    patterns: [/運用テスト/, /\boperation[_ -]?test\b/i, /\bops[_ -]?test\b/i],
    tables: ["design_declarations", "test_runs", "gate_runs", "runtime_verification_events"],
  },
  {
    scope: "class_method_contract",
    label: "class/method contract",
    patterns: [/class/i, /method/i, /contract/i, /クラス/, /メソッド/, /契約/],
    tables: ["design_declarations", "runtime_verification_events"],
  },
  {
    scope: "incident_recovery_route",
    label: "incident Recovery/Reverse route",
    patterns: [/incident/i, /failure/i, /障害/, /逆流/, /recovery.+reverse/i, /reverse.+recovery/i],
    tables: [
      "design_declarations",
      "closure_next_action_ledger",
      "runtime_verification_events",
    ],
  },
] as const;

const ZIP_ADOPTION_RULES = [
  {
    adoptionId: "HVM-ADOPT-01",
    category: "adopt",
    label: "YAML source and typed spec",
  },
  {
    adoptionId: "HVM-ADOPT-02",
    category: "adopt",
    label: "document coverage and tailoring",
  },
  {
    adoptionId: "HVM-ADOPT-03",
    category: "adopt",
    label: "traceability and impact",
  },
  {
    adoptionId: "HVM-ADOPT-04",
    category: "adopt",
    label: "WBS/current-location",
  },
  {
    adoptionId: "HVM-ADOPT-05",
    category: "adopt",
    label: "operation observability",
  },
  {
    adoptionId: "HVM-COMP-01",
    category: "complement",
    label: "harness.db runtime evidence",
  },
  {
    adoptionId: "HVM-COMP-02",
    category: "complement",
    label: "Project view dynamic rendering",
  },
  {
    adoptionId: "HVM-COMP-03",
    category: "complement",
    label: "approval and action boundary",
  },
  {
    adoptionId: "HVM-REJECT-01",
    category: "reject",
    label: "Python and Excel generator are reference only",
  },
] as const satisfies ReadonlyArray<{
  adoptionId: string;
  category: ProjectZipAdoptionCategory;
  label: string;
}>;

const ZIP_ADOPTION_IMPLEMENTATION_DEPENDENCIES: Record<string, string[]> = {
  "HVM-ADOPT-01": [
    "design_declarations",
    "design_references",
    "vmodel_zip_source_bindings",
  ],
  "HVM-ADOPT-02": ["artifact_registry", "design_declarations", "design_coverage_gate"],
  "HVM-ADOPT-03": ["design_references", "design_impact", "relation_graph"],
  "HVM-ADOPT-04": ["plan_registry", "roadmap_rollups", "roadmap_band_coverage"],
  "HVM-ADOPT-05": [
    "design_declarations",
    "runtime_verification_events",
    "closure_next_action_ledger",
  ],
  "HVM-COMP-01": [
    "test_runs",
    "gate_runs",
    "runtime_verification_events",
    "guardrail_decisions",
  ],
  "HVM-COMP-02": [
    "project_current_location",
    "visualization_view_model",
    "visualization_tree_view",
    "vmodel_zip_source_bindings",
  ],
  "HVM-COMP-03": [
    "closure_next_action_ledger",
    "approval_review_gate",
    "action_binding_approval",
  ],
  "HVM-REJECT-01": [
    "zip-reference-runtime-boundary",
    "vmodel_zip_manifest",
    "ADR-001",
  ],
};

const TAILORING_RULES = [
  {
    tailoringId: "HVM-TAILOR-CORE-DESIGN",
    category: "required",
    label: "core design documents",
    detailLevel: "標準",
  },
  {
    tailoringId: "HVM-TAILOR-DETAIL-CONTRACT",
    category: "required",
    label: "detailed design contract",
    detailLevel: "詳細",
  },
  {
    tailoringId: "HVM-TAILOR-TEST-ORACLE",
    category: "required",
    label: "test design and TDD closure",
    detailLevel: "標準",
  },
  {
    tailoringId: "HVM-TAILOR-OPERATION",
    category: "required",
    label: "operation observability",
    detailLevel: "標準",
  },
  {
    tailoringId: "HVM-TAILOR-DIAGRAMS",
    category: "optional",
    label: "diagrams",
    detailLevel: "簡易",
  },
  {
    tailoringId: "HVM-TAILOR-INDEXES",
    category: "optional",
    label: "indexes and maps",
    detailLevel: "簡易",
  },
  {
    tailoringId: "HVM-TAILOR-MOBILE-DESKTOP-NA",
    category: "na",
    label: "mobile and desktop specific documents",
    detailLevel: "省略",
  },
  {
    tailoringId: "HVM-TAILOR-ENTERPRISE-NA",
    category: "na",
    label: "enterprise only governance documents",
    detailLevel: "省略",
  },
] as const satisfies ReadonlyArray<{
  tailoringId: string;
  category: ProjectTailoringGateCategory;
  label: string;
  detailLevel: ProjectTailoringGateItem["detailLevel"];
}>;

const DESIGN_COVERAGE_RULES = [
  {
    coverageId: "L1-planning-intent",
    l12Layer: "L1",
    label: "企画/採用境界",
    requiredKinds: ["企画", "charter", "採用境界"],
    acceptedLayers: ["L1"],
  },
  {
    coverageId: "L2-requirements-screen",
    l12Layer: "L2",
    label: "要求/画面/フロー",
    requiredKinds: ["要求", "画面", "screen", "mock", "flow"],
    acceptedLayers: ["L2"],
  },
  {
    coverageId: "L3-requirements-freeze",
    l12Layer: "L3",
    label: "要件凍結/機能要件",
    requiredKinds: ["機能要件", "要件", "要求"],
    acceptedLayers: ["L3"],
  },
  {
    coverageId: "L4-basic-design",
    l12Layer: "L4",
    label: "基本設計/方式",
    requiredKinds: ["基本設計", "方式", "architecture"],
    acceptedLayers: ["L4"],
  },
  {
    coverageId: "L5-detailed-contract",
    l12Layer: "L5",
    label: "詳細設計/class-method contract",
    requiredKinds: ["詳細設計", "class/method contract", "contract", "テーブル", "型"],
    acceptedLayers: ["L5"],
  },
  {
    coverageId: "L6-implementation-binding",
    l12Layer: "L6",
    label: "実装契約/implementation binding",
    requiredKinds: ["実装契約", "implementation contract", "implementation binding"],
    acceptedLayers: ["L6"],
  },
  {
    coverageId: "L7-tdd-closure",
    l12Layer: "L7",
    label: "TDD closure / trace closure",
    requiredKinds: ["TDD closure", "closure", "trace"],
    acceptedLayers: ["L7"],
  },
  {
    coverageId: "L8-unit-test-design",
    l12Layer: "L8",
    label: "単体テスト設計",
    requiredKinds: ["単体テスト", "unit test"],
    acceptedLayers: ["L8"],
  },
  {
    coverageId: "L9-integration-test-design",
    l12Layer: "L9",
    label: "結合テスト設計",
    requiredKinds: ["結合テスト", "integration test"],
    acceptedLayers: ["L9"],
  },
  {
    coverageId: "L10-system-test-design",
    l12Layer: "L10",
    label: "総合テスト設計",
    requiredKinds: ["総合テスト", "system test"],
    acceptedLayers: ["L10"],
  },
  {
    coverageId: "L11-acceptance-test-design",
    l12Layer: "L11",
    label: "受入テスト設計",
    requiredKinds: ["受入テスト", "acceptance test"],
    acceptedLayers: ["L11", "L12"],
  },
  {
    coverageId: "L12-operation-observability",
    l12Layer: "L12",
    label: "運用テスト/ログ/KPI/runtime",
    requiredKinds: ["運用テスト", "ログ", "KPI", "runtime verification", "class/method contract"],
    acceptedLayers: ["L12", "L5"],
  },
] as const;

function designCoverageRuleForL12Layer(layer: string | null): (typeof DESIGN_COVERAGE_RULES)[number] | null {
  if (layer === null) return null;
  return DESIGN_COVERAGE_RULES.find((rule) => rule.l12Layer === layer) ?? null;
}

function l12LayerForCoverageId(coverageId: string): string | null {
  return DESIGN_COVERAGE_RULES.find((rule) => rule.coverageId === coverageId)?.l12Layer ?? null;
}

function zipSourceBindingIdsForL12Layer(layer: string | null): string[] {
  if (!layer) return [];
  return unique(
    VMODEL_ZIP_SOURCE_BINDINGS.filter((binding) => binding.l12Layers.includes(layer)).map(
      (binding) => binding.bindingId,
    ),
  );
}

function tailoringRuleIdsForL12Layer(layer: string | null): string[] {
  switch (layer) {
    case "L1":
    case "L2":
    case "L3":
    case "L4":
      return ["HVM-TAILOR-CORE-DESIGN"];
    case "L5":
    case "L6":
      return ["HVM-TAILOR-DETAIL-CONTRACT"];
    case "L7":
    case "L8":
    case "L9":
    case "L10":
    case "L11":
      return ["HVM-TAILOR-TEST-ORACLE"];
    case "L12":
      return ["HVM-TAILOR-OPERATION"];
    default:
      return [];
  }
}

function tailoringDetailLevelsForRules(ruleIds: string[]): string[] {
  return unique(
    ruleIds
      .map((ruleId) => TAILORING_RULES.find((rule) => rule.tailoringId === ruleId)?.detailLevel)
      .filter((value): value is ProjectTailoringGateItem["detailLevel"] => Boolean(value)),
  );
}

function coverageMetadataForL12Layer(layer: string | null): {
  zipSourceBindingIds: string[];
  tailoringRuleIds: string[];
  tailoringDetailLevels: string[];
} {
  const tailoringRuleIds = tailoringRuleIdsForL12Layer(layer);
  return {
    zipSourceBindingIds: zipSourceBindingIdsForL12Layer(layer),
    tailoringRuleIds,
    tailoringDetailLevels: tailoringDetailLevelsForRules(tailoringRuleIds),
  };
}

function designCoverageIdsForL12Layers(layers: string[]): string[] {
  const coverageIds: string[] = [];
  for (const layer of layers) {
    const coverageId = designCoverageRuleForL12Layer(layer)?.coverageId;
    if (coverageId) coverageIds.push(coverageId);
  }
  return unique(coverageIds);
}

function designCoverageLabelsForL12Layers(layers: string[]): string[] {
  const labels: string[] = [];
  for (const layer of layers) {
    const label = designCoverageRuleForL12Layer(layer)?.label;
    if (label) labels.push(label);
  }
  return unique(labels);
}

const VMFIT_ACCEPTANCE_TRACE_RULES = [
  ["HAC-VMFIT-01a", "HR-FR-VMFIT-01"],
  ["HAC-VMFIT-01b", "HR-FR-VMFIT-01"],
  ["HAC-VMFIT-02a", "HR-FR-VMFIT-02"],
  ["HAC-VMFIT-02b", "HR-FR-VMFIT-02"],
  ["HAC-VMFIT-02c", "HR-FR-VMFIT-02"],
  ["HAC-VMFIT-03a", "HR-FR-VMFIT-03"],
  ["HAC-VMFIT-03b", "HR-FR-VMFIT-03"],
  ["HAC-VMFIT-04a", "HR-FR-VMFIT-04"],
  ["HAC-VMFIT-04b", "HR-FR-VMFIT-04"],
  ["HAC-VMFIT-05a", "HR-FR-VMFIT-05"],
  ["HAC-VMFIT-05b", "HR-FR-VMFIT-05"],
  ["HAC-VMFIT-06a", "HR-FR-VMFIT-06"],
  ["HAC-VMFIT-06b", "HR-FR-VMFIT-06"],
  ["HAC-VMFIT-07a", "HR-FR-VMFIT-07"],
  ["HAC-VMFIT-07b", "HR-FR-VMFIT-07"],
  ["HAC-VMFIT-07c", "HR-FR-VMFIT-07"],
] as const;

function scalarNumber(db: HarnessDb, sql: string, params: unknown[] = []): number {
  const row = db.prepare(sql).get(...params) as Record<string, unknown> | undefined;
  return Number(row?.value ?? 0);
}

function scalarText(db: HarnessDb, sql: string, params: unknown[] = []): string | null {
  const row = db.prepare(sql).get(...params) as Record<string, unknown> | undefined;
  const value = row?.value;
  return typeof value === "string" && value.length > 0 ? value : null;
}

function listText(db: HarnessDb, sql: string, params: unknown[] = []): string[] {
  return db
    .prepare(sql)
    .all(...params)
    .map((row) => String(row.value ?? ""))
    .filter(Boolean);
}

function layerRank(layer: string): number {
  const index = LAYER_ORDER.indexOf(layer as (typeof LAYER_ORDER)[number]);
  return index < 0 ? -1 : index;
}

function highestLayer(layers: string[]): string | null {
  return [...layers].sort((a, b) => layerRank(b) - layerRank(a))[0] ?? null;
}

export function mapCurrentLayerToL12(layer: string | null): string | null {
  switch (layer) {
    case null:
      return null;
    case "L0":
    case "L1":
      return "L1";
    case "L2":
      return "L2";
    case "L3":
      return "L3";
    case "L4":
      return "L4";
    case "L5":
    case "L6":
      return "L5";
    case "L7":
      return "L6-L7";
    case "L8":
      return "L8";
    case "L9":
      return "L9";
    case "L10":
      return "L10";
    case "L11":
    case "L12":
      return "L11";
    case "L13":
    case "L14":
      return "L12";
    default:
      return layer;
  }
}

function mapLegacyLayerToL12Coverage(layer: string | null): string | null {
  switch (layer) {
    case null:
      return null;
    case "L0":
    case "L1":
      return "L1";
    case "L2":
      return "L2";
    case "L3":
      return "L3";
    case "L4":
      return "L4";
    case "L5":
    case "L6":
      return "L5";
    case "L7":
      return "L6";
    case "L8":
      return "L8";
    case "L9":
      return "L9";
    case "L10":
      return "L10";
    case "L11":
    case "L12":
      return "L11";
    case "L13":
    case "L14":
      return "L12";
    default:
      return null;
  }
}

function mapCrossPlanToL12Coverage(planId: string): { layer: string; reason: string } | null {
  if (planId.startsWith("PLAN-DISCOVERY-")) {
    return {
      layer: "L3",
      reason: "Discovery/cross PLAN は S4 後に要件/方式判断へ正規化するため L3 へ再投影",
    };
  }
  if (planId.startsWith("PLAN-REVERSE-")) {
    return {
      layer: "L5",
      reason: "Reverse/cross PLAN は設計/テスト設計へ戻す補正なので L5 へ再投影",
    };
  }
  if (planId.startsWith("PLAN-RECOVERY-")) {
    return {
      layer: "L12",
      reason: "Recovery/cross PLAN は運用・復旧検証の入口なので L12 へ再投影",
    };
  }
  return null;
}

function mapPlanToL12Coverage(
  legacyLayer: string | null,
  planId: string,
): { layer: string | null; reason?: string } {
  if (legacyLayer === "cross") {
    return mapCrossPlanToL12Coverage(planId) ?? { layer: null };
  }
  return { layer: mapLegacyLayerToL12Coverage(legacyLayer) };
}

function mapDeclarationLayerToL12Coverage(layer: string | null): string | null {
  if (layer === null) return null;
  if (layer === "L0") return "L1";
  if (L12_LAYERS.some((candidate) => candidate.layer === layer)) return layer;
  if (layer === "L13" || layer === "L14") return "L12";
  return null;
}

function bandIdToL12Layers(bandId: string): string[] {
  switch (bandId) {
    case "upstream":
      return ["L1", "L2", "L3"];
    case "design":
      return ["L4", "L5"];
    case "impl":
      return ["L6", "L7"];
    case "verification":
      return ["L8", "L9", "L10", "L11", "L12"];
    case "cutover":
      return ["L12"];
    default:
      return [];
  }
}

function roadmapPlanToL12Layers(planId: string): string[] {
  const match = /^PLAN-L(\d+)-/.exec(planId);
  if (!match) return [];
  const mapped = mapCurrentLayerToL12(`L${match[1]}`);
  if (!mapped) return [];
  return mapped.split("-").filter(Boolean);
}

function buildSourceClock(db: HarnessDb): string | null {
  return scalarText(
    db,
    `SELECT MAX(value) AS value
     FROM (
       SELECT MAX(updated_at) AS value FROM plan_registry
       UNION ALL SELECT MAX(computed_at) FROM roadmap_rollups
       UNION ALL SELECT MAX(indexed_at) FROM design_declarations
       UNION ALL SELECT MAX(indexed_at) FROM design_references
       UNION ALL SELECT MAX(indexed_at) FROM design_impact
       UNION ALL SELECT MAX(indexed_at) FROM descent_obligations
     )
     WHERE value IS NOT NULL AND value <> ''`,
  );
}

function roadmapFrontier(db: HarnessDb): string[] {
  const raw = scalarText(db, "SELECT frontier AS value FROM roadmap_rollups WHERE rollup_id = ?", [
    "program",
  ]);
  if (!raw) return [];
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .sort();
}

function splitCsv(value: unknown): string[] {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function collectRoadmapPosition(db: HarnessDb): ProjectRoadmapPosition {
  const rollupRow = db
    .prepare(
      `SELECT total_bands, covered_bands, parked_bands, uncovered_bands,
              total_gates, reached_gates, total_spans, confirmed_spans, frontier
       FROM roadmap_rollups
       WHERE rollup_id = ?`,
    )
    .get("program") as Record<string, unknown> | undefined;
  const rollup = {
    total_bands: Number(rollupRow?.total_bands ?? 0),
    covered_bands: Number(rollupRow?.covered_bands ?? 0),
    parked_bands: Number(rollupRow?.parked_bands ?? 0),
    uncovered_bands: Number(rollupRow?.uncovered_bands ?? 0),
    total_gates: Number(rollupRow?.total_gates ?? 0),
    reached_gates: Number(rollupRow?.reached_gates ?? 0),
    total_spans: Number(rollupRow?.total_spans ?? 0),
    confirmed_spans: Number(rollupRow?.confirmed_spans ?? 0),
  };
  const frontier = splitCsv(rollupRow?.frontier).sort();
  const bands = (
    db
      .prepare(
        "SELECT band_id, name, status, roadmap_ids FROM roadmap_band_coverage ORDER BY band_id",
      )
      .all() as Array<Record<string, unknown>>
  ).map((row): ProjectRoadmapBandPosition => {
    const bandId = String(row.band_id ?? "");
    const status = String(row.status ?? "uncovered") as ProjectRoadmapBandPosition["status"];
    const roadmapIds = splitCsv(row.roadmap_ids);
    const l12Layers = bandIdToL12Layers(bandId);
    const reasons =
      status === "covered"
        ? ["登録工程表が band を被覆している"]
        : status === "parked"
          ? ["明示 defer/park として frontier から除外される"]
          : ["工程表未登録の forward work として current frontier になる"];
    return {
      bandId,
      name: String(row.name ?? ""),
      status,
      l12Layers,
      coverageIds: designCoverageIdsForL12Layers(l12Layers),
      coverageLabels: designCoverageLabelsForL12Layers(l12Layers),
      roadmapIds,
      reasons,
    };
  });
  const gates = (
    db
      .prepare(
        `SELECT roadmap_gate_id, plan_id, gate_id, total_spans, confirmed_spans, reached
         FROM roadmap_gate_progress
         ORDER BY plan_id, gate_id`,
      )
      .all() as Array<Record<string, unknown>>
  ).map((row): ProjectRoadmapGatePosition => {
    const planId = String(row.plan_id ?? "");
    const reached = Number(row.reached ?? 0) === 1;
    const totalSpans = Number(row.total_spans ?? 0);
    const confirmedSpans = Number(row.confirmed_spans ?? 0);
    const l12Layers = roadmapPlanToL12Layers(planId);
    return {
      roadmapGateId: String(row.roadmap_gate_id ?? ""),
      planId,
      gateId: String(row.gate_id ?? ""),
      totalSpans,
      confirmedSpans,
      reached,
      l12Layers,
      coverageIds: designCoverageIdsForL12Layers(l12Layers),
      coverageLabels: designCoverageLabelsForL12Layers(l12Layers),
      status: reached ? "reached" : "pending",
      reasons: reached
        ? ["gate 配下の span が到達済み"]
        : [`gate 配下 span ${confirmedSpans}/${totalSpans} のため工程表 frontier になる`],
    };
  });
  const currentBandIds = unique([
    ...bands
      .filter((band) => band.status === "uncovered" || frontier.includes(band.bandId))
      .map((band) => band.bandId),
    ...frontier.filter((id) => bandIdToL12Layers(id).length > 0),
  ]);
  const currentGateIds = unique(
    gates
      .filter((gate) => !gate.reached || frontier.includes(gate.planId))
      .map((gate) => `${gate.planId}:${gate.gateId}`),
  );
  const docDependencies = unique([
    ...bands.flatMap((band) => band.roadmapIds.map((id) => `docs/plans/${id}.md`)),
    ...gates.map((gate) => `docs/plans/${gate.planId}.md`),
  ]);
  const status: ProjectRoadmapPositionStatus =
    rollupRow === undefined
      ? "unknown"
      : rollup.uncovered_bands > 0
        ? "uncovered"
        : frontier.length > 0 || currentGateIds.length > 0
          ? "frontier"
          : "clear";

  return {
    status,
    rollup,
    frontier,
    current_band_ids: currentBandIds,
    current_gate_ids: currentGateIds,
    bands,
    gates,
    docDependencies,
    implementationDependencies: [
      "roadmap_rollups",
      "roadmap_band_coverage",
      "roadmap_gate_progress",
    ],
  };
}

function roadmapCurrentReportStatus(
  snapshot: ProjectCurrentLocationSnapshot,
): ProjectRoadmapCurrentReport["status"] {
  if (snapshot.current.status === "unknown" || snapshot.roadmap_position.status === "unknown") {
    return "unknown";
  }
  if (
    snapshot.current.completion_boundary === "contradicted" ||
    snapshot.drive_route.status === "recovery_required"
  ) {
    return "contradicted";
  }
  if (snapshot.roadmap_position.status === "uncovered") return "uncovered";
  if (snapshot.roadmap_position.status === "frontier") return "frontier";
  return "synced";
}

function terminalRoadmapL12Layers(position: ProjectRoadmapPosition): string[] {
  if (position.status !== "clear") return [];
  if (position.rollup.total_bands === 0) return [];
  if (position.rollup.total_gates > 0 && position.rollup.reached_gates < position.rollup.total_gates) {
    return [];
  }
  const hasTerminalBand = position.bands.some(
    (band) =>
      band.status === "covered" &&
      (band.bandId === "verification" || band.bandId === "cutover") &&
      band.l12Layers.includes("L12"),
  );
  return hasTerminalBand ? ["L12"] : [];
}

function l12LayerTokens(layer: string | null): string[] {
  if (layer === null) return [];
  return layer
    .split("-")
    .map((token) => token.trim())
    .filter((token) => /^L\d+$/.test(token));
}

function roadmapCurrentRequiredAction(
  action: Pick<ProjectRoadmapCurrentAction, "category" | "status">,
): string {
  if (action.category === "band") {
    return action.status === "covered" || action.status === "parked"
      ? "工程表 band は現在地判定の補助 evidence として保持する"
      : "工程表 band を PLAN/typed declaration に接続し、DB current-location へ投影する";
  }
  if (action.category === "gate") {
    return action.status === "reached"
      ? "到達済み gate を current-location の補助 evidence として保持する"
      : "未到達 gate の span を確認し、必要な設計/実装/検証 evidence を追加する";
  }
  if (action.category === "drive_route") {
    return "工程表の frontier と DB current-location から選ばれた drive route を適用する";
  }
  if (action.category === "closure") {
    return "工程表を進める前に closure queue を evidence-plan / review-bundle で解消する";
  }
  return "blocking finding を解消し、工程表と DB 現在地の整合を再計算する";
}

function roadmapClosurePhaseAction(
  snapshot: ProjectCurrentLocationSnapshot,
): ProjectClosureQueueNextAction | null {
  const counts = snapshot.closure.queue.route_counts;
  if (counts.repair_failed_evidence > 0) return "repair_failed_evidence";
  if (counts.collect_evidence > 0) return "collect_evidence";
  if (counts.close_ready > 0) return "close_ready";
  if (counts.reverse_design > 0) return "reverse_design";
  return null;
}

function roadmapClosureAutomationClass(
  action: ProjectClosureQueueNextAction | null,
): ProjectRoadmapCurrentAction["automation_class"] {
  if (action === "close_ready") return "approval";
  if (action === "reverse_design") return "design";
  if (action === "collect_evidence" || action === "repair_failed_evidence") return "machine";
  return "none";
}

export function closureEvidenceProbeRecordPath(action: ProjectClosureQueueNextAction): string {
  return `.helix/tmp/closure/${action}-probe-record.json`;
}

export function closureEvidenceApprovalDraftPath(action: ProjectClosureQueueNextAction): string {
  return `.helix/tmp/closure/${action}-approval-draft.yml`;
}

export function closureEvidenceProbeCommand(action: ProjectClosureQueueNextAction): string {
  return `helix closure evidence-probe --action ${action} --limit 1 --execute --out ${closureEvidenceProbeRecordPath(action)} --json`;
}

export function closureEvidenceMaterializeCommand(action: ProjectClosureQueueNextAction): string {
  return `helix closure evidence-materialize --action ${action} --limit 1 --probe-record ${closureEvidenceProbeRecordPath(action)} --summary-json`;
}

export function closureEvidenceApprovalDraftCommand(action: ProjectClosureQueueNextAction): string {
  return `helix closure evidence-approval-draft --action ${action} --limit 1 --probe-record ${closureEvidenceProbeRecordPath(action)} --out ${closureEvidenceApprovalDraftPath(action)} --summary-json`;
}

export function closureEvidenceApplyDryRunCommand(action: ProjectClosureQueueNextAction): string {
  return `helix closure evidence-apply --dry-run --action ${action} --limit 1 --probe-record ${closureEvidenceProbeRecordPath(action)} --approval-record <approved-approval-record-path> --summary-json`;
}

export function closureEvidenceApplyExecuteCommand(action: ProjectClosureQueueNextAction): string {
  return `helix closure evidence-apply --execute --action ${action} --limit 1 --probe-record ${closureEvidenceProbeRecordPath(action)} --approval-record <approved-approval-record-path> --summary-json`;
}

export interface ProjectClosureEvidenceHandoffArtifacts {
  probe_record_path: string;
  approval_draft_path: string;
  write_policy: "local-artifact-new-file";
}

export function closureEvidenceHandoffArtifacts(
  action: ProjectClosureQueueNextAction,
): ProjectClosureEvidenceHandoffArtifacts | null {
  if (action !== "collect_evidence" && action !== "repair_failed_evidence") return null;
  return {
    probe_record_path: closureEvidenceProbeRecordPath(action),
    approval_draft_path: closureEvidenceApprovalDraftPath(action),
    write_policy: "local-artifact-new-file",
  };
}

function roadmapClosureCommand(action: ProjectClosureQueueNextAction | null): string {
  if (action === "collect_evidence" || action === "repair_failed_evidence") {
    return closureEvidenceProbeCommand(action);
  }
  if (action === "close_ready") {
    return "helix closure review-bundle --action close_ready --summary-json";
  }
  if (action === "reverse_design") {
    return "helix closure evidence-plan --action reverse_design --json";
  }
  return "helix closure evidence-plan --json";
}

function roadmapClosureRequiredAction(action: ProjectClosureQueueNextAction | null): string {
  if (action === "collect_evidence" || action === "repair_failed_evidence") {
    return `${action} の evidence-probe で green evidence を取得し、materialize / approval draft / apply dry-run を経て工程表/current-location/vmodel fit を再計算する`;
  }
  if (action === "close_ready") {
    return "close_ready review-bundle と approval record で closure claim を確認し、工程表/current-location/vmodel fit を再計算する";
  }
  if (action === "reverse_design") {
    return "設計/テスト設計へ戻す依存範囲を確認し、Reverse 修正後に工程表/current-location/vmodel fit を再計算する";
  }
  return "工程表を進める前に closure queue を evidence-plan / review-bundle で解消する";
}

export function buildProjectRoadmapCurrentReport(
  snapshot: ProjectCurrentLocationSnapshot,
): ProjectRoadmapCurrentReport {
  const roadmapCurrentL12Layers = unique([
    ...snapshot.roadmap_position.current_band_ids.flatMap((bandId) => bandIdToL12Layers(bandId)),
    ...snapshot.roadmap_position.gates
      .filter((gate) => snapshot.roadmap_position.current_gate_ids.includes(`${gate.planId}:${gate.gateId}`))
      .flatMap((gate) => gate.l12Layers),
  ]);
  const roadmapTerminalL12Layers = terminalRoadmapL12Layers(snapshot.roadmap_position);
  const roadmapProjectedL12Layers =
    roadmapCurrentL12Layers.length > 0 ? roadmapCurrentL12Layers : roadmapTerminalL12Layers;
  const alignmentBasis =
    roadmapCurrentL12Layers.length > 0
      ? "frontier"
      : roadmapTerminalL12Layers.length > 0
        ? "terminal"
        : "none";
  const dbCurrentL12Layer = snapshot.current.l12_layer;
  const dbCurrentL12LayerTokens = l12LayerTokens(dbCurrentL12Layer);
  const blockingFindings = snapshot.findings
    .filter((finding) => finding.severity === "error")
    .map((finding) => finding.code);
  const status = roadmapCurrentReportStatus(snapshot);
  const aligned =
    dbCurrentL12LayerTokens.length > 0 &&
    dbCurrentL12LayerTokens.every((layer) => roadmapProjectedL12Layers.includes(layer));
  const bandActions = snapshot.roadmap_position.bands
    .filter(
      (band) =>
        snapshot.roadmap_position.current_band_ids.includes(band.bandId) ||
        band.status === "uncovered",
    )
    .map((band): ProjectRoadmapCurrentAction => {
      const action = {
        action_id: `roadmap-band:${band.bandId}`,
        category: "band" as const,
        status:
          band.status === "covered"
            ? ("covered" as const)
            : band.status === "parked"
              ? ("parked" as const)
              : ("current" as const),
        automation_class: "verification" as const,
        phase_action: null,
        l12_layers: [...band.l12Layers],
        coverage_ids: [...band.coverageIds],
        coverage_labels: [...band.coverageLabels],
        command: "helix roadmap current --json",
        batch_command: null,
        review_command: null,
        evidence_patch_command: null,
        evidence_probe_command: null,
        evidence_materialize_command: null,
        evidence_approval_draft_command: null,
        evidence_apply_dry_run_command: null,
        evidence_apply_execute_command: null,
        evidence_apply_write_policy: null,
        required_action: "",
        doc_dependencies: band.roadmapIds.map((id) => `docs/plans/${id}.md`),
        implementation_dependencies: ["roadmap_band_coverage", "roadmap_rollups"],
        reasons: [...band.reasons],
      };
      return {
        ...action,
        required_action: roadmapCurrentRequiredAction(action),
      };
    });
  const gateActions = snapshot.roadmap_position.gates
    .filter((gate) => snapshot.roadmap_position.current_gate_ids.includes(`${gate.planId}:${gate.gateId}`))
    .map((gate): ProjectRoadmapCurrentAction => {
      const action = {
        action_id: `roadmap-gate:${gate.planId}:${gate.gateId}`,
        category: "gate" as const,
        status: gate.reached ? ("reached" as const) : ("pending" as const),
        automation_class: "verification" as const,
        phase_action: null,
        l12_layers: [...gate.l12Layers],
        coverage_ids: [...gate.coverageIds],
        coverage_labels: [...gate.coverageLabels],
        command: `docs/plans/${gate.planId}.md`,
        batch_command: null,
        review_command: null,
        evidence_patch_command: null,
        evidence_probe_command: null,
        evidence_materialize_command: null,
        evidence_approval_draft_command: null,
        evidence_apply_dry_run_command: null,
        evidence_apply_execute_command: null,
        evidence_apply_write_policy: null,
        required_action: "",
        doc_dependencies: [`docs/plans/${gate.planId}.md`],
        implementation_dependencies: ["roadmap_gate_progress", "roadmap_rollups"],
        reasons: [...gate.reasons],
      };
      return {
        ...action,
        required_action: roadmapCurrentRequiredAction(action),
      };
    });
  const driveActionL12Layers = snapshot.drive_route.mustReturnToDesign
    ? [...snapshot.drive_route.reverse.l12Layers]
    : [...snapshot.drive_route.forward.currentBandIds.flatMap((id) => bandIdToL12Layers(id))];
  const driveAction: ProjectRoadmapCurrentAction = {
    action_id: snapshot.drive_route.routeId,
    category: "drive_route",
    status: snapshot.drive_route.mustReturnToDesign ? "blocked" : "current",
    automation_class: snapshot.drive_route.mustReturnToDesign ? "design" : "machine",
    phase_action: null,
    l12_layers: driveActionL12Layers,
    coverage_ids: designCoverageIdsForL12Layers(driveActionL12Layers),
    coverage_labels: designCoverageLabelsForL12Layers(driveActionL12Layers),
    command: "helix current-location --json",
    batch_command: null,
    review_command: null,
    evidence_patch_command: null,
    evidence_probe_command: null,
    evidence_materialize_command: null,
    evidence_approval_draft_command: null,
    evidence_apply_dry_run_command: null,
    evidence_apply_execute_command: null,
    evidence_apply_write_policy: null,
    required_action: roadmapCurrentRequiredAction({
      category: "drive_route",
      status: snapshot.drive_route.mustReturnToDesign ? "blocked" : "current",
    }),
    doc_dependencies: snapshot.drive_route.mustReturnToDesign
      ? [...snapshot.drive_route.reverse.docDependencies]
      : [...snapshot.roadmap_position.docDependencies],
    implementation_dependencies: snapshot.drive_route.mustReturnToDesign
      ? [...snapshot.drive_route.reverse.implementationDependencies]
      : [...snapshot.roadmap_position.implementationDependencies],
    reasons: [...snapshot.drive_route.reasons],
  };
  const closurePhaseAction = roadmapClosurePhaseAction(snapshot);
  const closureEvidenceAction =
    closurePhaseAction === "collect_evidence" || closurePhaseAction === "repair_failed_evidence"
      ? closurePhaseAction
      : null;
  const closureActions: ProjectRoadmapCurrentAction[] =
    snapshot.closure.queue.total > 0
      ? [
          {
            action_id: "closure-queue",
            category: "closure",
            status: snapshot.closure.status === "contradicted" ? "blocked" : "pending",
            automation_class: roadmapClosureAutomationClass(closurePhaseAction),
            phase_action: closurePhaseAction,
            l12_layers: unique(snapshot.closure.queue.items.map((item) => item.l12Layer)),
            coverage_ids: unique(
              snapshot.closure.queue.items
                .map((item) => item.coverageId)
                .filter((coverageId): coverageId is string => coverageId !== null),
            ),
            coverage_labels: unique(
              snapshot.closure.queue.items
                .map((item) => item.coverageLabel)
                .filter((coverageLabel): coverageLabel is string => coverageLabel !== null),
            ),
            command: roadmapClosureCommand(closurePhaseAction),
            batch_command: closurePhaseAction
              ? `helix closure batch --action ${closurePhaseAction} --json`
              : "helix closure batch --json",
            review_command: closurePhaseAction
              ? `helix closure review-bundle --action ${closurePhaseAction} --summary-json`
              : "helix closure review-bundle --json",
            evidence_patch_command: closureEvidenceAction
              ? `helix closure evidence-patch --action ${closureEvidenceAction} --json`
              : null,
            evidence_probe_command: closureEvidenceAction
              ? closureEvidenceProbeCommand(closureEvidenceAction)
              : null,
            evidence_materialize_command: closureEvidenceAction
              ? closureEvidenceMaterializeCommand(closureEvidenceAction)
              : null,
            evidence_approval_draft_command: closureEvidenceAction
              ? closureEvidenceApprovalDraftCommand(closureEvidenceAction)
              : null,
            evidence_apply_dry_run_command: closureEvidenceAction
              ? closureEvidenceApplyDryRunCommand(closureEvidenceAction)
              : null,
            evidence_apply_execute_command: closureEvidenceAction
              ? closureEvidenceApplyExecuteCommand(closureEvidenceAction)
              : null,
            evidence_apply_write_policy: closureEvidenceAction ? "approval-required" : null,
            required_action: roadmapClosureRequiredAction(closurePhaseAction),
            doc_dependencies: [...snapshot.closure.docDependencies],
            implementation_dependencies: [...snapshot.closure.implementationDependencies],
            reasons: [
              `phase=${closurePhaseAction ?? "-"}`,
              `automation=${roadmapClosureAutomationClass(closurePhaseAction)}`,
              ...snapshot.closure.required_evidence,
            ],
          },
        ]
      : [];
  const findingActions = snapshot.findings.map((finding): ProjectRoadmapCurrentAction => {
    const action = {
      action_id: `finding:${finding.code}`,
      category: "finding" as const,
      status: finding.severity === "error" ? ("blocked" as const) : ("pending" as const),
      automation_class: finding.severity === "error" ? ("machine" as const) : ("verification" as const),
      phase_action: null,
      l12_layers: [],
      coverage_ids: [],
      coverage_labels: [],
      command: "helix current-location --json",
      batch_command: null,
      review_command: null,
      evidence_patch_command: null,
      evidence_probe_command: null,
      evidence_materialize_command: null,
      evidence_approval_draft_command: null,
      evidence_apply_dry_run_command: null,
      evidence_apply_execute_command: null,
      evidence_apply_write_policy: null,
      required_action: "",
      doc_dependencies: [],
      implementation_dependencies: [],
      reasons: [finding.detail],
    };
    return {
      ...action,
      required_action: roadmapCurrentRequiredAction(action),
    };
  });
  const actions = [driveAction, ...closureActions, ...bandActions, ...gateActions, ...findingActions];
  return {
    schema_version: "project-roadmap-current.v1",
    source_clock: snapshot.source_clock,
    status,
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    roadmap_position: snapshot.roadmap_position,
    consistency: {
      aligned,
      db_current_l12_layer: dbCurrentL12Layer,
      roadmap_current_l12_layers: roadmapCurrentL12Layers,
      roadmap_projected_l12_layers: roadmapProjectedL12Layers,
      roadmap_terminal_l12_layers: roadmapTerminalL12Layers,
      alignment_basis: alignmentBasis,
      blocking_findings: blockingFindings,
      reasons: unique([
        aligned
          ? "DB current-location と工程表 projected L12 範囲は同じ現在地を指している"
          : "DB current-location と工程表 projected L12 範囲が一致しない",
        `alignment_basis=${alignmentBasis}`,
        `drive_route=${snapshot.drive_route.routeId}`,
        `roadmap_status=${snapshot.roadmap_position.status}`,
        `completion_boundary=${snapshot.current.completion_boundary}`,
      ]),
    },
    actions,
    counts: {
      current_bands: snapshot.roadmap_position.current_band_ids.length,
      current_gates: snapshot.roadmap_position.current_gate_ids.length,
      blockers: actions.filter((action) => action.status === "blocked").length,
      actions: actions.length,
    },
    postcheck_commands: [
      "helix db rebuild",
      "helix roadmap current --json",
      "helix current-location --json",
      "helix vmodel fit",
    ],
    write_policy: "read-only",
    source_command: "helix roadmap current --json",
    view_command: "helix progress tree-view --json",
  };
}

function driveCandidateStatus(
  selected: ProjectDriveModel,
  model: ProjectDriveModel,
  blocked: boolean,
): ProjectDriveModelCandidate["status"] {
  if (selected === model) return "selected";
  return blocked ? "blocked" : "available";
}

function selectedDriveModelForSnapshot(snapshot: ProjectCurrentLocationSnapshot): ProjectDriveModel {
  if (
    snapshot.current.status === "needs_recovery" ||
    snapshot.drive_route.status === "recovery_required" ||
    snapshot.current.completion_boundary === "contradicted"
  ) {
    return "Recovery";
  }
  if (snapshot.drive_recommendation.model === "Reverse") return "Reverse";
  if (snapshot.operation_scope.missing > 0 || snapshot.operation_scope.reverify > 0) {
    return "OperationVerification";
  }
  if (snapshot.findings.some((finding) => finding.code === "design_declaration_drift")) {
    return "Refactor";
  }
  if (
    snapshot.roadmap_position.status === "frontier" ||
    snapshot.roadmap_position.status === "uncovered"
  ) {
    return "Forward";
  }
  return "Forward";
}

function driveModelRouteId(
  model: ProjectDriveModel,
  snapshot: ProjectCurrentLocationSnapshot,
): string {
  switch (model) {
    case "Recovery":
      return "drive:Recovery:recover-current-location";
    case "Reverse":
      return "drive:Reverse:repair-design-test-implementation";
    case "Additive":
      return "drive:Additive:add-design-then-impl";
    case "Refactor":
      return "drive:Refactor:preserve-behavior-clean-structure";
    case "OperationVerification":
      return "drive:OperationVerification:verify-runtime-scope";
    case "Forward":
      return snapshot.drive_route.status === "forward_ready"
        ? "drive:Forward:continue-forward"
        : "drive:Forward:advance-roadmap-frontier";
  }
}

function driveModelCandidateCoverage(input: {
  model: ProjectDriveModel;
  snapshot: ProjectCurrentLocationSnapshot;
}): { coverage_ids: string[]; coverage_labels: string[] } {
  let coverageIds: string[];
  let coverageLabels: string[];
  switch (input.model) {
    case "Recovery":
    case "Reverse":
      coverageIds = [...input.snapshot.drive_route.reverse.coverageIds];
      coverageLabels = [...input.snapshot.drive_route.reverse.coverageLabels];
      break;
    case "OperationVerification":
      coverageIds = unique(input.snapshot.operation_scope.items.map((item) => item.coverageId));
      coverageLabels = unique(input.snapshot.operation_scope.items.map((item) => item.coverageLabel));
      break;
    case "Forward":
      coverageIds = [...input.snapshot.drive_route.forward.coverageIds];
      coverageLabels = [...input.snapshot.drive_route.forward.coverageLabels];
      break;
    case "Additive":
      coverageIds = unique(
        input.snapshot.artifact_remap.items
          .map((item) => item.coverageId)
          .filter((coverageId): coverageId is string => coverageId !== null),
      );
      coverageLabels = unique(
        input.snapshot.artifact_remap.items
          .map((item) => item.coverageLabel)
          .filter((coverageLabel): coverageLabel is string => coverageLabel !== null),
      );
      break;
    case "Refactor": {
      const coverageRule = designCoverageRuleForL12Layer("L5");
      coverageIds = coverageRule ? [coverageRule.coverageId] : [];
      coverageLabels = coverageRule ? [coverageRule.label] : [];
      break;
    }
  }
  return { coverage_ids: coverageIds, coverage_labels: coverageLabels };
}

export function buildProjectDriveModelReport(
  snapshot: ProjectCurrentLocationSnapshot,
): ProjectDriveModelReport {
  const selectedModel = selectedDriveModelForSnapshot(snapshot);
  const hasErrorFindings = snapshot.findings.some((finding) => finding.severity === "error");
  const hasDesignGaps =
    snapshot.design_coverage_gate.status !== "pass" || snapshot.tailoring_gate.status !== "pass";
  const hasOperationGaps =
    snapshot.operation_scope.missing > 0 || snapshot.operation_scope.reverify > 0;
  const hasRoadmapFrontier =
    snapshot.roadmap_position.status === "frontier" ||
    snapshot.roadmap_position.status === "uncovered";
  const recoveryDeps = unique([
    ...snapshot.closure.docDependencies,
    ...snapshot.closure.queue.items.flatMap((item) => item.docDependencies),
    ...snapshot.drive_route.reverse.docDependencies,
  ]);
  const recoveryImplDeps = unique([
    ...snapshot.closure.implementationDependencies,
    ...snapshot.closure.queue.items.flatMap((item) => item.implementationDependencies),
    ...snapshot.drive_route.reverse.implementationDependencies,
  ]);
  const candidates = ([
    {
      model: "Recovery",
      rank: 1,
      status: driveCandidateStatus(
        selectedModel,
        "Recovery",
        snapshot.current.status !== "needs_recovery",
      ),
      route_id: driveModelRouteId("Recovery", snapshot),
      trigger: "L14 claim と L7/open evidence の矛盾、または current-location recovery_required",
      required_action:
        "closure evidence-plan / review-bundle で L7 closure と L12 claim を再照合し、現在地矛盾を解消する",
      command: "helix closure evidence-plan --json",
      ...driveModelCandidateCoverage({ model: "Recovery", snapshot }),
      doc_dependencies: recoveryDeps,
      implementation_dependencies: recoveryImplDeps,
      reasons: [
        `current=${snapshot.current.status}/${snapshot.current.completion_boundary}`,
        `closure=${snapshot.closure.status}`,
        `route=${snapshot.drive_route.routeId}`,
      ],
    },
    {
      model: "Reverse",
      rank: 2,
      status: driveCandidateStatus(
        selectedModel,
        "Reverse",
        selectedModel === "Recovery" || (!hasErrorFindings && !hasDesignGaps),
      ),
      route_id: driveModelRouteId("Reverse", snapshot),
      trigger: "設計/テスト設計/実装依存の欠落、drift、impl-ahead、coverage gap",
      required_action:
        "該当 doc/implementation dependency を設計・テスト設計へ戻し、Forward に復帰できる状態へ修復する",
      command: "helix current-location --json",
      ...driveModelCandidateCoverage({ model: "Reverse", snapshot }),
      doc_dependencies: unique([
        ...snapshot.drive_route.reverse.docDependencies,
        ...snapshot.design_coverage_gate.docDependencies,
      ]),
      implementation_dependencies: unique([
        ...snapshot.drive_route.reverse.implementationDependencies,
        ...snapshot.design_coverage_gate.implementationDependencies,
      ]),
      reasons: [
        `error_findings=${snapshot.findings.filter((finding) => finding.severity === "error").length}`,
        `design_coverage=${snapshot.design_coverage_gate.status}`,
        `tailoring=${snapshot.tailoring_gate.status}`,
      ],
    },
    {
      model: "OperationVerification",
      rank: 3,
      status: driveCandidateStatus(
        selectedModel,
        "OperationVerification",
        selectedModel === "Recovery" || selectedModel === "Reverse" || !hasOperationGaps,
      ),
      route_id: driveModelRouteId("OperationVerification", snapshot),
      trigger: "ログ設計、runtime verification、class/method contract など L12 運用 scope の不足",
      required_action:
        "operation scope の missing/reverify を design declaration と runtime evidence に接続する",
      command: "helix current-location --json",
      ...driveModelCandidateCoverage({ model: "OperationVerification", snapshot }),
      doc_dependencies: ["docs/design/**", "docs/test-design/**"],
      implementation_dependencies: unique(
        snapshot.operation_scope.items.flatMap((item) => item.evidenceTables),
      ),
      reasons: [
        `operation_missing=${snapshot.operation_scope.missing}`,
        `operation_reverify=${snapshot.operation_scope.reverify}`,
      ],
    },
    {
      model: "Forward",
      rank: 4,
      status: driveCandidateStatus(
        selectedModel,
        "Forward",
        selectedModel === "Recovery" || selectedModel === "Reverse",
      ),
      route_id: driveModelRouteId("Forward", snapshot),
      trigger: "原則駆動モデル。blocker が無ければ工程表 frontier を前進させる",
      required_action: "roadmap current と design coverage が一致している範囲を Forward で進める",
      command: "helix roadmap current --json",
      ...driveModelCandidateCoverage({ model: "Forward", snapshot }),
      doc_dependencies: [...snapshot.roadmap_position.docDependencies],
      implementation_dependencies: [...snapshot.roadmap_position.implementationDependencies],
      reasons: [
        `roadmap=${snapshot.roadmap_position.status}`,
        `frontier=${snapshot.roadmap_position.frontier.join(",") || "-"}`,
      ],
    },
    {
      model: "Additive",
      rank: 5,
      status: driveCandidateStatus(
        selectedModel,
        "Additive",
        selectedModel === "Recovery" || selectedModel === "Reverse" || !hasRoadmapFrontier,
      ),
      route_id: driveModelRouteId("Additive", snapshot),
      trigger: "既存設計を保った delta 追加。add-design / add-impl を L12 coverage に再投影する",
      required_action: "追加分を L5 詳細設計または typed spec に登録し、対応する実装/evidence を接続する",
      command: "helix artifact-remap batch --status reverify --json",
      ...driveModelCandidateCoverage({ model: "Additive", snapshot }),
      doc_dependencies: unique(snapshot.artifact_remap.items.map((item) => item.sourcePath)),
      implementation_dependencies: ["artifact_remap", "plan_registry", "design_declarations"],
      reasons: [
        `artifact_reverify=${snapshot.artifact_remap.reverify}`,
        `artifact_missing=${snapshot.artifact_remap.missing}`,
      ],
    },
    {
      model: "Refactor",
      rank: 6,
      status: driveCandidateStatus(
        selectedModel,
        "Refactor",
        selectedModel === "Recovery" ||
          selectedModel === "Reverse" ||
          snapshot.counts.design_declaration_drifts === 0,
      ),
      route_id: driveModelRouteId("Refactor", snapshot),
      trigger: "振る舞い維持の構造改善。design declaration drift や class/method 契約の重複を整理する",
      required_action:
        "設計/テスト evidence を保持したまま、構造変更の影響範囲と regression evidence を追加する",
      command: "helix current-location --json",
      ...driveModelCandidateCoverage({ model: "Refactor", snapshot }),
      doc_dependencies: unique(snapshot.findings.flatMap((finding) => finding.docDependencies)),
      implementation_dependencies: unique(
        snapshot.findings.flatMap((finding) => finding.implementationDependencies),
      ),
      reasons: [`design_declaration_drifts=${snapshot.counts.design_declaration_drifts}`],
    },
  ] satisfies ProjectDriveModelCandidate[]).sort((a, b) => a.rank - b.rank);
  const selectedCandidate =
    candidates.find((candidate) => candidate.model === selectedModel) ?? candidates[0];
  return {
    schema_version: "project-drive-model.v1",
    source_clock: snapshot.source_clock,
    selected_model: selectedCandidate.model,
    default_model: "Forward",
    selection_status: snapshot.drive_route.status,
    current: snapshot.current,
    candidates,
    selected_candidate: selectedCandidate,
    blocked_models: candidates
      .filter((candidate) => candidate.status === "blocked")
      .map((candidate) => candidate.model),
    available_models: candidates
      .filter((candidate) => candidate.status === "available" || candidate.status === "selected")
      .map((candidate) => candidate.model),
    postcheck_commands: [
      "helix drive model --json",
      "helix current-location --json",
      "helix roadmap current --json",
      "helix vmodel fit",
    ],
    write_policy: "read-only",
    source_command: "helix drive model --json",
    view_command: "helix progress tree-view --json",
  };
}

function selectedRecoveryClosureAction(
  snapshot: ProjectCurrentLocationSnapshot,
): ProjectClosureQueueNextAction | null {
  const counts = snapshot.closure.queue.route_counts;
  if (counts.repair_failed_evidence > 0) return "repair_failed_evidence";
  if (counts.collect_evidence > 0) return "collect_evidence";
  if (counts.reverse_design > 0) return "reverse_design";
  if (counts.close_ready > 0) return "close_ready";
  return null;
}

function recoveryStepStatus(input: {
  required: boolean;
  blocked?: boolean;
}): ProjectRecoveryPlanStep["status"] {
  if (!input.required) return "not_required";
  return input.blocked ? "blocked" : "ready";
}

function recoveryLaneType(
  action: ProjectClosureQueueNextAction,
): ProjectRecoveryActionLane["lane_type"] {
  switch (action) {
    case "close_ready":
      return "approval";
    case "collect_evidence":
      return "evidence_collection";
    case "repair_failed_evidence":
      return "evidence_repair";
    case "reverse_design":
      return "design_reverse";
  }
}

function recoveryLanePrimaryCommand(action: ProjectClosureQueueNextAction): string {
  switch (action) {
    case "close_ready":
      return "helix closure review-bundle --action close_ready --summary-json";
    case "collect_evidence":
    case "repair_failed_evidence":
    case "reverse_design":
      return `helix closure batch --action ${action} --json`;
  }
}

function recoveryEvidenceCommandChain(action: ProjectClosureQueueNextAction): {
  evidence_probe_command: string | null;
  evidence_materialize_command: string | null;
  evidence_approval_draft_command: string | null;
  evidence_apply_dry_run_command: string | null;
  evidence_apply_execute_command: string | null;
  evidence_apply_write_policy: "approval-required" | null;
  evidence_handoff_artifacts: ProjectClosureEvidenceHandoffArtifacts | null;
} {
  if (action !== "collect_evidence" && action !== "repair_failed_evidence") {
    return {
      evidence_probe_command: null,
      evidence_materialize_command: null,
      evidence_approval_draft_command: null,
      evidence_apply_dry_run_command: null,
      evidence_apply_execute_command: null,
      evidence_apply_write_policy: null,
      evidence_handoff_artifacts: null,
    };
  }
  return {
    evidence_probe_command: closureEvidenceProbeCommand(action),
    evidence_materialize_command: closureEvidenceMaterializeCommand(action),
    evidence_approval_draft_command: closureEvidenceApprovalDraftCommand(action),
    evidence_apply_dry_run_command: closureEvidenceApplyDryRunCommand(action),
    evidence_apply_execute_command: closureEvidenceApplyExecuteCommand(action),
    evidence_apply_write_policy: "approval-required",
    evidence_handoff_artifacts: closureEvidenceHandoffArtifacts(action),
  };
}

function buildProjectRecoveryActionLanes(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    active: boolean;
    selectedAction: ProjectClosureQueueNextAction | null;
    limit: number;
  },
): ProjectRecoveryActionLane[] {
	  return PROJECT_CLOSURE_QUEUE_ACTIONS.map((action, index) => {
	    const queueItems = snapshot.closure.queue.items.filter((item) => item.nextAction === action);
	    const evidencePlan = buildProjectClosureEvidencePlan(snapshot, { action, limit: 0 });
	    const evidenceChain = recoveryEvidenceCommandChain(action);
    const status: ProjectRecoveryActionLane["status"] = !input.active || queueItems.length === 0
      ? "not_required"
      : action === "close_ready" &&
          snapshot.findings.some((finding) => finding.severity === "error")
        ? "blocked"
        : "ready";
    const humanRequired = action === "close_ready" && queueItems.length > 0;
    return {
      action,
      rank: index + 1,
      count: queueItems.length,
      listed: Math.min(queueItems.length, input.limit),
      omitted: Math.max(0, queueItems.length - input.limit),
      selected: input.selectedAction === action,
      lane_type: recoveryLaneType(action),
      status,
      human_required: humanRequired,
	      primary_command: recoveryLanePrimaryCommand(action),
	      evidence_plan_command: `helix closure evidence-plan --action ${action} --json`,
	      batch_command: `helix closure batch --action ${action} --json`,
	      review_command: `helix closure review-bundle --action ${action} --summary-json`,
	      evidence_probe_command: evidenceChain.evidence_probe_command,
	      evidence_materialize_command: evidenceChain.evidence_materialize_command,
	      evidence_approval_draft_command: evidenceChain.evidence_approval_draft_command,
	      evidence_apply_dry_run_command: evidenceChain.evidence_apply_dry_run_command,
	      evidence_apply_execute_command: evidenceChain.evidence_apply_execute_command,
	      evidence_apply_write_policy: evidenceChain.evidence_apply_write_policy,
	      evidence_handoff_artifacts: evidenceChain.evidence_handoff_artifacts,
	      target_tables: [...evidencePlan.target_tables],
      sample_plan_ids: queueItems.slice(0, input.limit).map((item) => item.planId),
      required_action: closurePacketRequiredAction(action),
      expected_transition: closurePacketExpectedTransition(action),
      postcheck_commands: closureEvidencePlanPostcheckCommands(action),
      reasons: [
        `route_count=${queueItems.length}`,
        `lane=${recoveryLaneType(action)}`,
        humanRequired ? "human approval required" : "machine evidence lane",
        input.selectedAction === action ? "selected by recovery priority" : "parallel recovery lane",
      ],
    };
  });
}

function buildProjectRecoveryExitForecast(input: {
  active: boolean;
  current: ProjectCurrentLocationSnapshot["current"];
  selectedAction: ProjectClosureQueueNextAction | null;
  lanes: ProjectRecoveryActionLane[];
}): ProjectRecoveryExitForecast {
  if (!input.active) {
    return {
      status: "not_required",
      remaining_queue_items: 0,
      blocking_lanes: [],
      blockers: [],
      lanes: [],
      next_command: "helix drive model --json",
      expected_transition: "Recovery 以外の drive model selection に従う",
    };
  }
  const activeLanes = input.lanes.filter((lane) => lane.count > 0);
  const remaining = activeLanes.reduce((sum, lane) => sum + lane.count, 0);
  const laneBlockers = activeLanes.map(
    (lane) => `${lane.action}:${lane.count}${lane.human_required ? ":human" : ""}`,
  );
  const blockers = [
    ...(input.current.completion_boundary === "contradicted"
      ? ["completion_boundary=contradicted"]
      : []),
    ...laneBlockers,
  ];
  const selectedLane =
    input.selectedAction !== null
      ? activeLanes.find((lane) => lane.action === input.selectedAction)
      : null;
  return {
    status: blockers.length > 0 ? "blocked" : "ready_to_recompute",
    remaining_queue_items: remaining,
    blocking_lanes: activeLanes.map((lane) => lane.action),
    blockers,
    lanes: activeLanes.map((lane) => ({
      action: lane.action,
      count: lane.count,
      blocking: true,
      human_required: lane.human_required,
      command: lane.primary_command,
      required_action: lane.required_action,
    })),
    next_command: selectedLane?.primary_command ?? "helix drive model --json",
    expected_transition:
      blockers.length > 0
        ? "blocking lanes を 0 件へ減らし、current-location を再計算する"
        : "helix drive model --json で Recovery 解除を確認する",
  };
}

function recoveryAutomationClass(
  lane: ProjectRecoveryActionLane,
): ProjectRecoveryAutomationClass {
  if (lane.count === 0) return "not_required";
  switch (lane.action) {
    case "close_ready":
      return "approval_required";
    case "collect_evidence":
    case "repair_failed_evidence":
      return "evidence_required";
    case "reverse_design":
      return "design_required";
  }
}

function recoverySafetyPolicy(
  lane: ProjectRecoveryActionLane,
  automationClass: ProjectRecoveryAutomationClass,
): string {
  if (automationClass === "not_required") {
    return "対象 queue がないため自動化しない";
  }
  switch (lane.action) {
    case "close_ready":
      return "read-only review bundle まで。closure apply は approval record と dry-run 確認が揃うまで禁止";
    case "collect_evidence":
      return "evidence row template と target table を提示し、実ファイル patch は evidence-patch approval packet で承認する";
    case "repair_failed_evidence":
      return "failed evidence は保持し、green evidence の再投影 patch は evidence-patch approval packet で承認する";
    case "reverse_design":
      return "設計/テスト設計へ戻す依存範囲を提示するだけで、設計成果物は自動改変しない";
  }
}

function buildProjectRecoveryAutomationBoundaries(
  lanes: ProjectRecoveryActionLane[],
): ProjectRecoveryAutomationBoundary[] {
  return lanes.map((lane): ProjectRecoveryAutomationBoundary => {
    const automationClass = recoveryAutomationClass(lane);
    const approvalRequired = automationClass === "approval_required";
	    const evidencePatchCommand =
	      lane.action === "collect_evidence" || lane.action === "repair_failed_evidence"
	        ? `helix closure evidence-patch --action ${lane.action} --json`
	        : null;
    const closureApplyDryRunCommand = `helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit ${lane.count} --json`;
    const closureApplyExecuteCommand = `helix closure apply --execute --approval-record <approved-approval-record-path> --limit ${lane.count} --json`;
	    return {
      action: lane.action,
      lane_type: lane.lane_type,
      automation_class: automationClass,
      count: lane.count,
      selected: lane.selected,
      status: lane.status,
      mutation_allowed: false,
      approval_required: approvalRequired,
      dry_run_command:
        lane.action === "close_ready"
          ? closureApplyDryRunCommand
          : (evidencePatchCommand ?? lane.batch_command),
      review_command: lane.review_command,
      batch_command: lane.batch_command,
	      evidence_plan_command: lane.evidence_plan_command,
	      evidence_patch_command: evidencePatchCommand,
	      evidence_patch_write_policy: evidencePatchCommand ? "approval-required" : null,
	      evidence_probe_command: lane.evidence_probe_command,
	      evidence_materialize_command: lane.evidence_materialize_command,
	      evidence_approval_draft_command: lane.evidence_approval_draft_command,
		      evidence_apply_dry_run_command: lane.evidence_apply_dry_run_command,
		      evidence_apply_execute_command: lane.evidence_apply_execute_command,
		      evidence_apply_write_policy: lane.evidence_apply_write_policy,
		      evidence_handoff_artifacts: lane.evidence_handoff_artifacts,
	      execute_command: approvalRequired
        ? closureApplyExecuteCommand
        : null,
      required_record: approvalRequired || evidencePatchCommand ? "approval_scope_digest" : null,
      safety_policy: recoverySafetyPolicy(lane, automationClass),
      reasons: [
        `automation_class=${automationClass}`,
        `mutation_allowed=false`,
        approvalRequired || evidencePatchCommand
          ? "approval_scope_digest required before mutation"
          : "read-only planning surface",
        evidencePatchCommand ? "evidence_patch_write_policy=approval-required" : "evidence_patch=none",
	        lane.evidence_probe_command ? `evidence_probe=${lane.evidence_probe_command}` : "evidence_probe=none",
	        lane.evidence_materialize_command
	          ? `evidence_materialize=${lane.evidence_materialize_command}`
	          : "evidence_materialize=none",
	        lane.evidence_approval_draft_command
	          ? `evidence_approval_draft=${lane.evidence_approval_draft_command}`
	          : "evidence_approval_draft=none",
	        lane.evidence_apply_dry_run_command
	          ? `evidence_apply_dry_run=${lane.evidence_apply_dry_run_command}`
	          : "evidence_apply_dry_run=none",
        ...lane.reasons,
      ],
    };
  });
}

function buildProjectRecoveryAutomationRunway(input: {
  active: boolean;
  selectedAction: ProjectClosureQueueNextAction | null;
  lanes: ProjectRecoveryActionLane[];
}): ProjectRecoveryAutomationRunway {
  if (!input.active) {
    return {
      status: "not_required",
      machine_actionable_count: 0,
      human_approval_count: 0,
      design_reverse_count: 0,
	      remaining_after_machine_lanes: 0,
	      next_machine_action: null,
	      next_machine_command: null,
	      next_machine_probe_command: null,
	      next_machine_materialize_command: null,
	      next_machine_approval_draft_command: null,
	      next_machine_apply_dry_run_command: null,
	      approval_actions: [],
      phases: [],
      target_tables: [],
      postcheck_commands: ["helix drive model --json"],
      expected_transition: "Recovery 以外の drive model selection に従う",
      reasons: ["Recovery が選択されていないため automation runway は不要"],
    };
  }

  const activeLanes = input.lanes.filter((lane) => lane.count > 0);
  const machineLanes = activeLanes.filter(
    (lane) =>
      !lane.human_required &&
      lane.status === "ready" &&
      (lane.lane_type === "evidence_collection" || lane.lane_type === "evidence_repair"),
  );
  const approvalLanes = activeLanes.filter((lane) => lane.human_required);
  const designReverseLanes = activeLanes.filter((lane) => lane.lane_type === "design_reverse");
  const machineActionableCount = machineLanes.reduce((sum, lane) => sum + lane.count, 0);
  const humanApprovalCount = approvalLanes.reduce((sum, lane) => sum + lane.count, 0);
  const designReverseCount = designReverseLanes.reduce((sum, lane) => sum + lane.count, 0);
  const totalActiveCount = activeLanes.reduce((sum, lane) => sum + lane.count, 0);
  const nextMachineLane =
    machineLanes.find((lane) => lane.action === input.selectedAction) ?? machineLanes[0] ?? null;
  const machinePhases = [
    ...(nextMachineLane ? [nextMachineLane] : []),
    ...machineLanes.filter((lane) => lane.action !== nextMachineLane?.action),
  ];
  const phaseInputs = [
    ...machinePhases.map((lane) => ({ lane, phaseType: "machine" as const })),
    ...approvalLanes.map((lane) => ({ lane, phaseType: "approval" as const })),
    ...designReverseLanes.map((lane) => ({ lane, phaseType: "design_reverse" as const })),
  ];
  let remainingAfterPhase = totalActiveCount;
  const phases = phaseInputs.map((phase, index): ProjectRecoveryAutomationRunwayPhase => {
    remainingAfterPhase = Math.max(0, remainingAfterPhase - phase.lane.count);
    const nextPhase = phaseInputs[index + 1];
    const nextGate: ProjectRecoveryAutomationRunwayPhase["next_gate"] =
      nextPhase === undefined
        ? "recompute_drive_model"
        : nextPhase.phaseType === "machine"
          ? "continue_machine_recovery"
          : nextPhase.phaseType === "approval"
            ? "approval_gate"
            : "design_reverse_gate";
    return {
      sequence: index + 1,
      action: phase.lane.action,
      phase_type: phase.phaseType,
      count: phase.lane.count,
      selected: phase.lane.selected,
      status: phase.lane.status,
	      human_required: phase.lane.human_required,
	      command:
	        phase.phaseType === "approval" ? phase.lane.review_command : phase.lane.primary_command,
	      evidence_probe_command: phase.lane.evidence_probe_command,
	      evidence_materialize_command: phase.lane.evidence_materialize_command,
	      evidence_approval_draft_command: phase.lane.evidence_approval_draft_command,
		      evidence_apply_dry_run_command: phase.lane.evidence_apply_dry_run_command,
		      evidence_apply_execute_command: phase.lane.evidence_apply_execute_command,
		      evidence_apply_write_policy: phase.lane.evidence_apply_write_policy,
		      evidence_handoff_artifacts: phase.lane.evidence_handoff_artifacts,
		      target_tables: [...phase.lane.target_tables],
      postcheck_commands: [...phase.lane.postcheck_commands],
      remaining_after_phase: remainingAfterPhase,
      next_gate: nextGate,
      expected_transition: phase.lane.expected_transition,
    };
  });
  const status: ProjectRecoveryAutomationRunway["status"] =
    machineActionableCount > 0
      ? "machine_work_available"
      : humanApprovalCount > 0
        ? "approval_required"
        : designReverseCount > 0
          ? "design_reverse_required"
          : "clear";

  return {
    status,
    machine_actionable_count: machineActionableCount,
    human_approval_count: humanApprovalCount,
    design_reverse_count: designReverseCount,
	    remaining_after_machine_lanes: Math.max(0, totalActiveCount - machineActionableCount),
	    next_machine_action: nextMachineLane?.action ?? null,
	    next_machine_command: nextMachineLane?.primary_command ?? null,
	    next_machine_probe_command: nextMachineLane?.evidence_probe_command ?? null,
	    next_machine_materialize_command: nextMachineLane?.evidence_materialize_command ?? null,
	    next_machine_approval_draft_command: nextMachineLane?.evidence_approval_draft_command ?? null,
	    next_machine_apply_dry_run_command: nextMachineLane?.evidence_apply_dry_run_command ?? null,
	    approval_actions: approvalLanes.map((lane) => lane.action),
    phases,
    target_tables: unique(machineLanes.flatMap((lane) => lane.target_tables)),
    postcheck_commands: unique(machineLanes.flatMap((lane) => lane.postcheck_commands)),
    expected_transition:
      machineActionableCount > 0
        ? "machine evidence lane を処理してから current-location / drive model / vmodel fit を再計算する"
        : humanApprovalCount > 0
          ? "approval bundle を確認し、承認済み close_ready だけを closure apply へ進める"
          : designReverseCount > 0
            ? "設計/テスト設計へ戻す対象を Reverse route に移し、Forward 復帰条件を再計算する"
            : "closure queue が空のため drive model を再計算する",
    reasons: [
      `machine_actionable=${machineActionableCount}`,
      `human_approval=${humanApprovalCount}`,
      `design_reverse=${designReverseCount}`,
      `remaining_after_machine=${Math.max(0, totalActiveCount - machineActionableCount)}`,
      nextMachineLane
        ? `next_machine_action=${nextMachineLane.action}`
        : "next_machine_action=-",
    ],
  };
}

const RECOVERY_REENTRY_RECOMPUTE_COMMANDS = [
  "helix current-location --json",
  "helix drive model --json",
  "helix roadmap current --json",
  "helix vmodel fit",
];

function buildProjectRecoveryReentryForecast(input: {
  active: boolean;
  exitForecast: ProjectRecoveryExitForecast;
  automationRunway: ProjectRecoveryAutomationRunway;
}): ProjectRecoveryReentryForecast {
  if (!input.active) {
    return {
      status: "not_required",
      current_blocking_count: 0,
      blocking_after_machine_lanes: 0,
      required_phase_count: 0,
      next_phase_action: null,
	      next_phase_type: null,
	      next_gate: "not_required",
	      next_command: "helix drive model --json",
	      next_execution_command: "helix drive model --json",
	      recompute_commands: ["helix drive model --json"],
      expected_transition: "Recovery 以外の drive model selection に従う",
      reasons: ["Recovery が選択されていない"],
    };
  }

  const nextPhase = input.automationRunway.phases[0] ?? null;
  const status: ProjectRecoveryReentryForecast["status"] =
    nextPhase === null
      ? "ready_to_recompute"
      : nextPhase.phase_type === "machine"
        ? "machine_phase_pending"
        : nextPhase.phase_type === "approval"
          ? "approval_gate_pending"
          : "design_reverse_pending";
	  return {
    status,
    current_blocking_count: input.exitForecast.remaining_queue_items,
    blocking_after_machine_lanes: input.automationRunway.remaining_after_machine_lanes,
    required_phase_count: input.automationRunway.phases.length,
    next_phase_action: nextPhase?.action ?? null,
    next_phase_type: nextPhase?.phase_type ?? null,
	    next_gate: nextPhase?.next_gate ?? "recompute_drive_model",
	    next_command: nextPhase?.command ?? "helix drive model --json",
	    next_execution_command:
	      nextPhase?.evidence_probe_command ?? nextPhase?.command ?? "helix drive model --json",
	    recompute_commands: [...RECOVERY_REENTRY_RECOMPUTE_COMMANDS],
    expected_transition:
      nextPhase === null
        ? "drive model を再計算して Recovery 解除または次駆動モデルを確定する"
        : "runway phase を順に消化し、remaining=0 になったら drive model / roadmap / vmodel fit を再計算する",
    reasons: [
      `current_blocking=${input.exitForecast.remaining_queue_items}`,
      `phase_count=${input.automationRunway.phases.length}`,
      `blocking_after_machine=${input.automationRunway.remaining_after_machine_lanes}`,
      nextPhase
        ? `next_phase=${nextPhase.sequence}:${nextPhase.phase_type}:${nextPhase.action}`
        : "next_phase=-",
    ],
  };
}

export function buildProjectRecoveryPlan(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    limit?: number;
  } = {},
): ProjectRecoveryPlan {
  const driveModel = buildProjectDriveModelReport(snapshot);
  const active = driveModel.selected_model === "Recovery";
  const selectedAction = active ? selectedRecoveryClosureAction(snapshot) : null;
  const evidencePlan = selectedAction
    ? buildProjectClosureEvidencePlan(snapshot, {
        action: selectedAction,
        limit: input.limit ?? 20,
      })
    : null;
  const laneLimit = Math.max(0, input.limit ?? 20);
  const actionLanes = buildProjectRecoveryActionLanes(snapshot, {
    active,
    selectedAction,
    limit: laneLimit,
  });
  const exitForecast = buildProjectRecoveryExitForecast({
    active,
    current: snapshot.current,
    selectedAction,
    lanes: actionLanes,
  });
  const automationBoundaries = buildProjectRecoveryAutomationBoundaries(actionLanes);
  const automationRunway = buildProjectRecoveryAutomationRunway({
    active,
    selectedAction,
    lanes: actionLanes,
  });
  const reentryForecast = buildProjectRecoveryReentryForecast({
    active,
    exitForecast,
    automationRunway,
  });
  const recoveryDocDeps = unique([
    ...driveModel.selected_candidate.doc_dependencies,
    ...(evidencePlan?.items.flatMap((item) => item.doc_dependencies) ?? []),
    ...snapshot.closure.docDependencies,
  ]);
  const recoveryImplDeps = unique([
    ...driveModel.selected_candidate.implementation_dependencies,
    ...(evidencePlan?.items.flatMap((item) => item.implementation_dependencies) ?? []),
    ...snapshot.closure.implementationDependencies,
  ]);
  const steps: ProjectRecoveryPlanStep[] = [
    {
      step_id: "detect-current-location",
      sequence: 1,
      status: active ? "ready" : "not_required",
      command: "helix current-location --json",
      required_action:
        "DB current-location と L12 compatibility projection から recovery_required を再確認する",
      expected_transition: active
        ? "Recovery plan の対象 current-location を固定する"
        : "Recovery 不要として Forward/Reverse/OperationVerification の候補へ委譲する",
      doc_dependencies: snapshot.drive_route.reverse.docDependencies,
      implementation_dependencies: snapshot.drive_route.reverse.implementationDependencies,
      reasons: [
        `current=${snapshot.current.status}/${snapshot.current.completion_boundary}`,
        `route=${snapshot.drive_route.routeId}`,
      ],
    },
    {
      step_id: "plan-closure-evidence",
      sequence: 2,
      status: recoveryStepStatus({
        required: active,
        blocked: selectedAction === null,
      }),
      command: selectedAction
        ? `helix closure evidence-plan --action ${selectedAction} --json`
        : "helix closure evidence-plan --json",
      required_action:
        "L7 closure queue の evidence gap を target table と postcheck command へ展開する",
      expected_transition: selectedAction
        ? `closure queue の ${selectedAction} items を次状態へ動かす準備ができる`
        : "closure queue が空なら recovery blocker は closure 以外へ限定される",
      doc_dependencies: recoveryDocDeps,
      implementation_dependencies: recoveryImplDeps,
      reasons: evidencePlan
        ? [
            `selected_action=${selectedAction}`,
            `evidence_items=${evidencePlan.total}`,
            `target_tables=${evidencePlan.target_tables.join(",") || "-"}`,
          ]
        : ["closure evidence plan 対象なし"],
    },
    {
      step_id: "review-or-repair-closure",
      sequence: 3,
      status: recoveryStepStatus({
        required: active && selectedAction !== null,
        blocked: selectedAction === "close_ready" && snapshot.findings.some((finding) => finding.severity === "error"),
      }),
      command: selectedAction
        ? selectedAction === "close_ready"
          ? "helix closure review-bundle --action close_ready --summary-json"
          : `helix closure batch --action ${selectedAction} --json`
        : "helix closure overview --json",
      required_action:
        "close_ready は approval bundle へ進め、collect/repair/reverse は evidence または設計戻しを実施する",
      expected_transition:
        "closure queue が close_ready、または evidence 収集/修復後の再分類対象へ移る",
      doc_dependencies: recoveryDocDeps,
      implementation_dependencies: recoveryImplDeps,
      reasons: [
        `closure=${snapshot.closure.status}`,
        `queue=${snapshot.closure.queue.total}`,
        `findings=${snapshot.findings.length}`,
      ],
    },
    {
      step_id: "recompute-drive-model",
      sequence: 4,
      status: active ? "pending" : "not_required",
      command: "helix drive model --json",
      required_action:
        "closure evidence の追加/修復後に drive model を再計算し、Recovery が解除されたか確認する",
      expected_transition:
        "selected model が Recovery から Forward/Reverse/OperationVerification のいずれかへ移る",
      doc_dependencies: recoveryDocDeps,
      implementation_dependencies: recoveryImplDeps,
      reasons: [`selected=${driveModel.selected_model}`, `blocked=${driveModel.blocked_models.join(",") || "-"}`],
    },
    {
      step_id: "verify-vmodel-fit",
      sequence: 5,
      status: active ? "pending" : "not_required",
      command: "helix vmodel fit",
      required_action: "Recovery 解除後に ZIP/L12/current-location fit gate を再評価する",
      expected_transition:
        "current-location gate が pass、または残 blocker が Recovery 以外の drive model として明示される",
      doc_dependencies: [
        "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
        "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
      ],
      implementation_dependencies: [
        "design_declarations",
        "design_references",
        "roadmap_rollups",
        "runtime_verification_events",
      ],
      reasons: ["vmodel fit は Recovery の出口 gate として扱う"],
    },
  ];

  return {
    schema_version: "project-recovery-plan.v1",
    source_clock: snapshot.source_clock,
    status: active ? "active" : "not_required",
    current: snapshot.current,
    drive_model: driveModel,
    selected_closure_action: selectedAction,
    closure_evidence_plan: evidencePlan,
    action_lanes: actionLanes,
    automation_boundaries: automationBoundaries,
    automation_runway: automationRunway,
    exit_forecast: exitForecast,
    reentry_forecast: reentryForecast,
    steps,
    exit_criteria: [
      "current-location の completion_boundary が contradicted ではない",
      "drive model selected が Recovery ではない",
      "L7 closure queue の blocker が close_ready/review 済み、または evidence plan により再分類済み",
      "helix vmodel fit の current-location gate が pass または Recovery 以外の blocker を返す",
    ],
    postcheck_commands: [
      "helix current-location --json",
      "helix closure evidence-plan --json",
      "helix drive model --json",
      "helix roadmap current --json",
      "helix vmodel fit",
    ],
    write_policy: "read-only",
    source_command: "helix recovery plan --json",
    view_command: "helix progress tree-view --json",
  };
}

function collectOpenPlanLayers(db: HarnessDb): string[] {
  return db
    .prepare("SELECT layer, status FROM plan_registry WHERE layer <> ''")
    .all()
    .filter((row) => ACTIVE_STATUSES.has(String(row.status ?? "").toLowerCase()))
    .map((row) => String(row.layer ?? ""))
    .filter(Boolean);
}

function collectReachedPlanLayers(db: HarnessDb): string[] {
  return db
    .prepare("SELECT layer, status FROM plan_registry WHERE layer <> ''")
    .all()
    .filter((row) => REACHED_STATUSES.has(String(row.status ?? "").toLowerCase()))
    .map((row) => String(row.layer ?? ""))
    .filter(Boolean);
}

function collectUnresolvedDesignReferenceDocs(db: HarnessDb): string[] {
  return listText(
    db,
    "SELECT DISTINCT source_path AS value FROM design_references WHERE status <> ? ORDER BY source_path",
    ["resolved"],
  );
}

function collectImplAheadDocs(db: HarnessDb): string[] {
  return listText(
    db,
    "SELECT DISTINCT defer_spec AS value FROM descent_obligations WHERE status = ? AND defer_spec <> '' ORDER BY defer_spec",
    ["impl-ahead"],
  );
}

function collectDesignDeclarationDriftDocs(db: HarnessDb): string[] {
  return listText(
    db,
    `SELECT DISTINCT evidence_path AS value
     FROM findings
     WHERE kind LIKE ?
       AND severity = ?
       AND status = ?
       AND evidence_path <> ''
     ORDER BY evidence_path`,
    ["design-declaration-%", "error", "open"],
  );
}

function collectPlanIds(db: HarnessDb, sql: string, params: unknown[] = []): string[] {
  return listText(db, sql, params);
}

interface PlanRegistryRow {
  planId: string;
  kind: string;
  status: string;
  updatedAt: string | null;
}

function collectOpenL7PlanRows(db: HarnessDb): PlanRegistryRow[] {
  return (
    db
      .prepare(
        `SELECT plan_id, kind, status, updated_at
         FROM plan_registry
         WHERE layer = ? AND lower(status) IN ('draft', 'confirmed', 'in_progress', 'active')
         ORDER BY plan_id`,
      )
      .all("L7") as Array<Record<string, unknown>>
  ).map((row) => ({
    planId: String(row.plan_id ?? ""),
    kind: String(row.kind ?? ""),
    status: String(row.status ?? ""),
    updatedAt: String(row.updated_at ?? "") || null,
  }));
}

function closureEvidenceStatus(
  evidence: Omit<ProjectClosureEvidenceSummary, "status">,
): ProjectClosureEvidenceSummary["status"] {
  const hasExecutionEvidence =
    evidence.testRuns.passed > 0 ||
    evidence.gateRuns.passed > 0 ||
    evidence.runtimeVerification.accepted > 0;
  if (evidence.artifactPaths.length > 0 && hasExecutionEvidence) return "ready";
  const hasAnyEvidence =
    evidence.artifactPaths.length > 0 ||
    evidence.traceEdges > 0 ||
    evidence.testRuns.total > 0 ||
    evidence.gateRuns.total > 0 ||
    evidence.runtimeVerification.total > 0 ||
    evidence.evidencePaths.length > 0;
  return hasAnyEvidence ? "partial" : "missing";
}

function collectFailedClosureEvidenceForPlan(
  db: HarnessDb,
  planId: string,
): ProjectClosureFailedEvidence[] {
  const failedTests = (
    db
      .prepare(
        `SELECT test_run_id, status, command, evidence_path, output_digest, completed_at
         FROM test_runs
         WHERE plan_id = ? AND (status = ? OR exit_code <> 0)
         ORDER BY completed_at DESC, test_run_id
         LIMIT 20`,
      )
      .all(planId, "failed") as Array<Record<string, unknown>>
  ).map(
    (row): ProjectClosureFailedEvidence => ({
      component: "test",
      id: String(row.test_run_id ?? ""),
      status: String(row.status ?? "failed"),
      command: typeof row.command === "string" && row.command.length > 0 ? row.command : null,
      evidencePath:
        typeof row.evidence_path === "string" && row.evidence_path.length > 0
          ? row.evidence_path
          : null,
      outputDigest:
        typeof row.output_digest === "string" && row.output_digest.length > 0
          ? row.output_digest
          : null,
      observedAt:
        typeof row.completed_at === "string" && row.completed_at.length > 0
          ? row.completed_at
          : null,
      requiredAction:
        "失敗 test を保持したまま、同じ plan_id に passed test_runs を追加投影する",
    }),
  );
  const failedGates = (
    db
      .prepare(
        `SELECT gate_run_id, gate_id, status, evidence_path, checked_at
         FROM gate_runs
         WHERE plan_id = ? AND status = ?
         ORDER BY checked_at DESC, gate_run_id
         LIMIT 20`,
      )
      .all(planId, "failed") as Array<Record<string, unknown>>
  ).map(
    (row): ProjectClosureFailedEvidence => ({
      component: "gate",
      id: String(row.gate_run_id ?? row.gate_id ?? ""),
      status: String(row.status ?? "failed"),
      command:
        typeof row.gate_id === "string" && row.gate_id.length > 0
          ? `helix gate ${row.gate_id}`
          : null,
      evidencePath:
        typeof row.evidence_path === "string" && row.evidence_path.length > 0
          ? row.evidence_path
          : null,
      outputDigest: null,
      observedAt:
        typeof row.checked_at === "string" && row.checked_at.length > 0 ? row.checked_at : null,
      requiredAction:
        "失敗 gate を保持したまま、同じ plan_id に passed gate_runs を追加投影する",
    }),
  );
  return [...failedTests, ...failedGates];
}

function collectClosureEvidenceForPlan(
  db: HarnessDb,
  plan: PlanRegistryRow,
): ProjectClosureEvidenceSummary {
  const sourcePath = `docs/plans/${plan.planId}.md`;
  const artifactPaths = unique(
    listText(db, "SELECT path AS value FROM artifact_registry WHERE path = ? ORDER BY path", [
      sourcePath,
    ]),
  );
  const traceEdges = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM trace_edges WHERE plan_id = ?",
    [plan.planId],
  );
  const testRunsTotal = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM test_runs WHERE plan_id = ?",
    [plan.planId],
  );
  const testRunsPassed = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM test_runs WHERE plan_id = ? AND (status = ? OR exit_code = 0)",
    [plan.planId, "passed"],
  );
  const testRunsFailed = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM test_runs WHERE plan_id = ? AND (status = ? OR exit_code <> 0)",
    [plan.planId, "failed"],
  );
  const gateRunsTotal = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM gate_runs WHERE plan_id = ?",
    [plan.planId],
  );
  const gateRunsPassed = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM gate_runs WHERE plan_id = ? AND status = ?",
    [plan.planId, "passed"],
  );
  const gateRunsFailed = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM gate_runs WHERE plan_id = ? AND status = ?",
    [plan.planId, "failed"],
  );
  const runtimeVerificationTotal = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM runtime_verification_events WHERE plan_id = ?",
    [plan.planId],
  );
  const runtimeVerificationAccepted = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM runtime_verification_events WHERE plan_id = ? AND accept_status = ?",
    [plan.planId, "accepted"],
  );
  const evidencePaths = unique([
    ...listText(
      db,
      "SELECT DISTINCT evidence_path AS value FROM test_runs WHERE plan_id = ? AND evidence_path <> '' ORDER BY evidence_path LIMIT 20",
      [plan.planId],
    ),
    ...listText(
      db,
      "SELECT DISTINCT evidence_path AS value FROM gate_runs WHERE plan_id = ? AND evidence_path <> '' ORDER BY evidence_path LIMIT 20",
      [plan.planId],
    ),
    ...listText(
      db,
      "SELECT DISTINCT evidence_path AS value FROM runtime_verification_events WHERE plan_id = ? AND evidence_path <> '' ORDER BY evidence_path LIMIT 20",
      [plan.planId],
    ),
  ]);
  const failedEvidence = collectFailedClosureEvidenceForPlan(db, plan.planId);
  const summary = {
    artifactPaths,
    traceEdges,
    testRuns: {
      total: testRunsTotal,
      passed: testRunsPassed,
      failed: testRunsFailed,
    },
    gateRuns: {
      total: gateRunsTotal,
      passed: gateRunsPassed,
      failed: gateRunsFailed,
    },
    runtimeVerification: {
      total: runtimeVerificationTotal,
      accepted: runtimeVerificationAccepted,
    },
    evidencePaths,
    failedEvidence,
  };

  return {
    status: closureEvidenceStatus(summary),
    ...summary,
  };
}

function collectClosureEvidenceIds(db: HarnessDb): string[] {
  return listText(
    db,
    `SELECT DISTINCT defined_id AS value
     FROM design_declarations
     WHERE layer = ?
       AND (
         lower(declaration_kind) LIKE '%closure%'
         OR lower(title) LIKE '%closure%'
         OR lower(declaration_kind) LIKE '%tdd%'
         OR lower(title) LIKE '%tdd%'
         OR lower(declaration_kind) LIKE '%trace%'
         OR lower(title) LIKE '%trace%'
       )
     ORDER BY defined_id`,
    ["L7"],
  );
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))].sort();
}

function operationScopeText(row: Record<string, unknown>): string {
  return [row.defined_id, row.declaration_kind, row.title, row.layer, row.source_path]
    .map((value) => String(value ?? ""))
    .join(" ");
}

function operationRuntimeEvidenceText(row: Record<string, unknown>): string {
  return [
    row.event_id,
    row.requirement_id,
    row.test_oracle_id,
    row.claim,
    row.source,
    row.runtime_surface,
    row.evidence_path,
  ]
    .map((value) => String(value ?? ""))
    .join(" ");
}

function designCoverageText(row: Record<string, unknown>): string {
  return [row.defined_id, row.declaration_kind, row.title, row.layer, row.source_path]
    .map((value) => String(value ?? ""))
    .join(" ")
    .toLowerCase();
}

function matchesDesignCoverageRule(
  row: Record<string, unknown>,
  rule: (typeof DESIGN_COVERAGE_RULES)[number],
): boolean {
  const text = designCoverageText(row);
  return rule.requiredKinds.some((kind) => text.includes(kind.toLowerCase()));
}

function buildDesignCoverageGate(db: HarnessDb): ProjectDesignCoverageGate {
  const declarationRows = db
    .prepare(
      "SELECT defined_id, declaration_kind, title, layer, source_path FROM design_declarations",
    )
    .all() as Array<Record<string, unknown>>;

  const items = DESIGN_COVERAGE_RULES.map((rule): ProjectDesignCoverageGateItem => {
    const coverageMetadata = coverageMetadataForL12Layer(rule.l12Layer);
    const matched = declarationRows.filter((row) => matchesDesignCoverageRule(row, rule));
    const acceptedLayers = [...rule.acceptedLayers] as string[];
    const accepted = matched.filter((row) => acceptedLayers.includes(String(row.layer ?? "")));
    const status: ProjectDesignCoverageGateItemStatus =
      accepted.length > 0 ? "covered" : matched.length > 0 ? "reverify" : "missing";
    const declarationIds = unique(matched.map((row) => String(row.defined_id ?? "")));
    const sourcePaths = unique(matched.map((row) => String(row.source_path ?? "")));
    const reasons =
      status === "covered"
        ? ["typed declaration が必須 coverage rule と accepted layer を満たしている"]
        : status === "reverify"
          ? ["typed declaration はあるが L12 accepted layer へ再投影確認が必要"]
          : ["必須 typed declaration が無く、heuristic-only では coverage 根拠にしない"];
    const coverageReasons = [
      `ZIP source bindings=${coverageMetadata.zipSourceBindingIds.join(",") || "-"}`,
      `tailoring=${coverageMetadata.tailoringRuleIds.join(",") || "-"} detail=${coverageMetadata.tailoringDetailLevels.join(",") || "-"}`,
    ];

    return {
      coverageId: rule.coverageId,
      l12Layer: rule.l12Layer,
      label: rule.label,
      zipSourceBindingIds: coverageMetadata.zipSourceBindingIds,
      tailoringRuleIds: coverageMetadata.tailoringRuleIds,
      tailoringDetailLevels: coverageMetadata.tailoringDetailLevels,
      requiredKinds: [...rule.requiredKinds],
      acceptedLayers: [...rule.acceptedLayers],
      status,
      declarationIds,
      sourcePaths,
      returnRoute: status === "covered" ? "Forward" : "Reverse",
      docDependencies:
        sourcePaths.length > 0 ? sourcePaths : ["docs/design/**", "docs/test-design/**"],
      implementationDependencies: ["design_declarations", "design_references"],
      reasons: unique([...reasons, ...coverageReasons]),
    };
  });

  return {
    status:
      items.length === 0
        ? "unknown"
        : items.every((item) => item.status === "covered")
          ? "pass"
          : "needs_design",
    items,
    covered: items.filter((item) => item.status === "covered").length,
    missing: items.filter((item) => item.status === "missing").length,
    reverify: items.filter((item) => item.status === "reverify").length,
    docDependencies: unique(items.flatMap((item) => item.docDependencies)),
    implementationDependencies: unique(items.flatMap((item) => item.implementationDependencies)),
  };
}

function buildAcceptanceTraceability(db: HarnessDb): ProjectAcceptanceTraceability {
  const declarationRows = db
    .prepare(
      `SELECT declaration_id, defined_id, source_path
       FROM design_declarations
       WHERE defined_id LIKE 'HAC-VMFIT-%'
       ORDER BY defined_id, declaration_id`,
    )
    .all() as Array<Record<string, unknown>>;
  const referenceRows = db
    .prepare(
      `SELECT reference_id, from_id, to_id, status, source_path
       FROM design_references
       WHERE from_id LIKE 'HAC-VMFIT-%'
       ORDER BY from_id, to_id, reference_id`,
    )
    .all() as Array<Record<string, unknown>>;

  const items = VMFIT_ACCEPTANCE_TRACE_RULES.map(
    ([acceptanceId, requirementId]): ProjectAcceptanceTraceabilityItem => {
      const declarations = declarationRows.filter((row) => row.defined_id === acceptanceId);
      const references = referenceRows.filter(
        (row) => row.from_id === acceptanceId && row.to_id === requirementId,
      );
      const resolved = references.filter((row) => row.status === "resolved");
      const status: ProjectAcceptanceTraceabilityItem["status"] =
        resolved.length > 0 ? "linked" : declarations.length > 0 ? "declared" : "missing";
      const declarationIds = unique(declarations.map((row) => String(row.declaration_id ?? "")));
      const sourcePaths = unique(
        [...declarations, ...references].map((row) => String(row.source_path ?? "")),
      );
      const referenceIds = unique(references.map((row) => String(row.reference_id ?? "")));
      const referenceStatuses = unique(references.map((row) => String(row.status ?? "")));
      const reasons =
        status === "linked"
          ? ["acceptance criteria が対象要件へ resolved reference で接続されている"]
          : status === "declared"
            ? ["acceptance criteria は宣言済みだが対象要件への resolved reference が無い"]
            : ["acceptance criteria の typed declaration が無い"];

      return {
        acceptanceId,
        requirementId,
        status,
        declarationIds,
        sourcePaths,
        referenceIds,
        referenceStatuses,
        docDependencies:
          sourcePaths.length > 0
            ? sourcePaths
            : ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
        implementationDependencies: ["design_declarations", "design_references"],
        reasons,
      };
    },
  );

  return {
    status: items.every((item) => item.status === "linked") ? "pass" : "needs_trace",
    items,
    total: items.length,
    linked: items.filter((item) => item.status === "linked").length,
    declared: items.filter((item) => item.status === "declared").length,
    missing: items.filter((item) => item.status === "missing").length,
    sourceDocument: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
    docDependencies: unique(items.flatMap((item) => item.docDependencies)),
    implementationDependencies: unique(items.flatMap((item) => item.implementationDependencies)),
  };
}

function scrumDeclarationCategory(row: Record<string, unknown>): ProjectScrumOperationItem["category"] | null {
  const text = [
    row.defined_id,
    row.declaration_kind,
    row.title,
    row.source_path,
  ]
    .map((value) => String(value ?? ""))
    .join(" ");
  if (/\bAC-\d+(?:-\d+)?\b/.test(text) || /受入基準|BDD|acceptance/i.test(text)) {
    return "acceptance";
  }
  if (/\b(?:SP|SG|INC)-\d+\b/.test(text) || /スプリント|sprint|increment/i.test(text)) {
    return "sprint";
  }
  if (/\b(?:EP|US)-\d+\b/.test(text) || /\bG\d+\b/.test(text) || /backlog|バックログ|ストーリー|エピック/i.test(text)) {
    return "backlog";
  }
  return null;
}

function buildScrumOperation(db: HarnessDb): ProjectScrumOperation {
  const sourceBindings = VMODEL_ZIP_SOURCE_BINDINGS.filter((binding) =>
    binding.bindingId.startsWith("zip-source:scrum-"),
  );
  const declarationRows = db
    .prepare(
      "SELECT defined_id, declaration_kind, title, source_path FROM design_declarations",
    )
    .all() as Array<Record<string, unknown>>;
  const planRows = db
    .prepare(
      `SELECT plan_id, kind, status, updated_at
       FROM plan_registry
       WHERE lower(kind) = 'poc'
          OR plan_id LIKE 'PLAN-DISCOVERY-%'
          OR plan_id LIKE 'PLAN-SCRUM-%'
       ORDER BY plan_id`,
    )
    .all() as Array<Record<string, unknown>>;
  const rowsByCategory: Record<"backlog" | "sprint" | "acceptance", Array<Record<string, unknown>>> = {
    backlog: [],
    sprint: [],
    acceptance: [],
  };
  for (const row of declarationRows) {
    const category = scrumDeclarationCategory(row);
    if (category && category !== "plan") rowsByCategory[category].push(row);
  }
  const activePlanRows = planRows.filter((row) =>
    ACTIVE_STATUSES.has(String(row.status ?? "").toLowerCase()),
  );
  const itemFromDeclarations = (input: {
    operationId: string;
    category: "backlog" | "sprint" | "acceptance";
    rows: Array<Record<string, unknown>>;
    missingDoc: string;
  }): ProjectScrumOperationItem => {
    const sourcePaths = unique(input.rows.map((row) => String(row.source_path ?? "")));
    return {
      operationId: input.operationId,
      category: input.category,
      status: input.rows.length > 0 ? "observed" : "missing",
      declarationIds: unique(input.rows.map((row) => String(row.defined_id ?? ""))),
      planIds: [],
      sourcePaths,
      docDependencies: sourcePaths.length > 0 ? sourcePaths : [input.missingDoc],
      implementationDependencies: ["design_declarations"],
      reasons:
        input.rows.length > 0
          ? ["Scrum 運営層の typed declaration を DB から検出した"]
          : ["ハイブリッド版の Scrum 運営層に対応する typed declaration が未検出"],
    };
  };
  const planSourcePaths = activePlanRows.map(
    (row) => `docs/plans/${String(row.plan_id ?? "")}.md`,
  );
  const items: ProjectScrumOperationItem[] = [
    itemFromDeclarations({
      operationId: "scrum:product-backlog",
      category: "backlog",
      rows: rowsByCategory.backlog,
      missingDoc: "docs/112_プロダクトバックログ.yaml",
    }),
    itemFromDeclarations({
      operationId: "scrum:sprint-plan",
      category: "sprint",
      rows: rowsByCategory.sprint,
      missingDoc: "docs/116_スプリント計画.yaml",
    }),
    itemFromDeclarations({
      operationId: "scrum:acceptance",
      category: "acceptance",
      rows: rowsByCategory.acceptance,
      missingDoc: "docs/29_受入基準・BDDシナリオ.yaml",
    }),
    {
      operationId: "scrum:active-plan",
      category: "plan",
      status: activePlanRows.length > 0 ? "observed" : "missing",
      declarationIds: [],
      planIds: unique(activePlanRows.map((row) => String(row.plan_id ?? ""))),
      sourcePaths: unique(planSourcePaths),
      docDependencies: planSourcePaths.length > 0 ? unique(planSourcePaths) : ["docs/plans/PLAN-DISCOVERY-*.md"],
      implementationDependencies: ["plan_registry"],
      reasons:
        activePlanRows.length > 0
          ? ["active Scrum/Discovery PLAN を plan_registry から検出した"]
          : ["active Scrum/Discovery PLAN が未検出。Scrum 運営層は計画外として扱う"],
    },
  ];
  const observedItems = items.filter((item) => item.status === "observed").length;
  const status: ProjectScrumOperation["status"] =
    activePlanRows.length > 0 || rowsByCategory.sprint.length > 0
      ? "active"
      : observedItems > 0
        ? "planned"
        : "not_observed";

  return {
    status,
    sourcePackage: VMODEL_ZIP_FILENAME,
    sourceBindings: sourceBindings.map((binding) => binding.bindingId),
    backlogItems: rowsByCategory.backlog.length,
    sprintItems: rowsByCategory.sprint.length,
    acceptanceItems: rowsByCategory.acceptance.length,
    activeSprintPlans: activePlanRows.length,
    items,
    docDependencies: unique(items.flatMap((item) => item.docDependencies)),
    implementationDependencies: unique([
      ...sourceBindings.flatMap((binding) => binding.evidenceTables),
      ...items.flatMap((item) => item.implementationDependencies),
    ]),
    reasons:
      status === "not_observed"
        ? ["ハイブリッド版の Scrum 運営層に対応する DB projection が未観測"]
        : ["ハイブリッド版の Scrum 運営層を DB 現在地の補助軸として検出した"],
  };
}

function skillBindingTier(score: number): ProjectSkillBindingItem["tier"] {
  if (score >= 0.8) return "required";
  if (score >= 0.5) return "recommended";
  return "optional";
}

function skillBindingScore(input: {
  asset: Record<string, unknown>;
  workflowModes: string[];
  l12Layers: string[];
}): {
  score: number;
  matchedDriveModels: string[];
  matchedLayers: string[];
  sourceDriveModels: string[];
  sourceLayers: string[];
  reasons: string[];
} {
  const sourceDriveModels = splitCsv(input.asset.applies_drive_models);
  const sourceLayers = splitCsv(input.asset.applies_layers);
  const matchedDriveModels = sourceDriveModels.filter((driveModel) =>
    input.workflowModes.includes(driveModel),
  );
  const matchedLayers = sourceLayers.filter((layer) => input.l12Layers.includes(layer));
  const text = [
    input.asset.asset_id,
    input.asset.path,
    input.asset.trigger,
    input.asset.capability,
    input.asset.skill_type,
  ]
    .map((value) => String(value ?? ""))
    .join(" ")
    .toLowerCase();
  let score = 0.15;
  const reasons: string[] = [];
  if (matchedDriveModels.length > 0) {
    score += matchedDriveModels.includes("Scrum") ? 0.3 : 0.35;
    reasons.push(`drive_model=${matchedDriveModels.join(",")}`);
  }
  if (matchedLayers.length > 0) {
    score += 0.3;
    reasons.push(`l12_layer=${matchedLayers.join(",")}`);
  }
  if (/verification|test|quality|review|checklist|trace|oracle/.test(text)) {
    score += 0.15;
    reasons.push("quality_or_verification_signal");
  }
  if (/recovery|debug|incident|reverse/.test(text)) {
    score += 0.1;
    reasons.push("recovery_or_reverse_signal");
  }
  if (/scrum|sprint|backlog|planning|task/.test(text)) {
    score += 0.1;
    reasons.push("scrum_or_planning_signal");
  }
  return {
    score: Math.min(1, Number(score.toFixed(2))),
    matchedDriveModels,
    matchedLayers,
    sourceDriveModels,
    sourceLayers,
    reasons,
  };
}

function skillBindingLayers(snapshot: ProjectCurrentLocationSnapshot): string[] {
  return unique([
    snapshot.current.l12_layer ?? "",
    ...snapshot.drive_route.forward.coverageIds.map((coverageId) => l12LayerForCoverageId(coverageId) ?? ""),
    ...snapshot.drive_route.reverse.l12Layers,
    ...snapshot.operation_scope.items.map((item) => l12LayerForCoverageId(item.coverageId) ?? ""),
    ...snapshot.design_coverage_gate.items
      .filter((item) => item.status !== "covered")
      .map((item) => item.l12Layer),
  ]);
}

function buildProjectSkillBinding(
  db: HarnessDb,
  snapshot: ProjectCurrentLocationSnapshot,
): ProjectSkillBinding {
  const selectedModel = selectedDriveModelForSnapshot(snapshot);
  const scrumOperation = snapshot.scrum_operation ?? buildScrumOperation(db);
  const workflowModes = unique([
    selectedModel,
    ...(scrumOperation.status === "active" || scrumOperation.status === "planned" ? ["Scrum"] : []),
  ]);
  const l12Layers = skillBindingLayers(snapshot);
  const rows = db
    .prepare(
      `SELECT asset_id, path, trigger, capability, skill_type, applies_layers, applies_drive_models
       FROM automation_assets
       WHERE asset_type = ?
       ORDER BY asset_id`,
    )
    .all("skill") as Array<Record<string, unknown>>;

  if (rows.length === 0) {
    return {
      status: "catalog_missing",
      sourcePackage: VMODEL_ZIP_FILENAME,
      selectedModel,
      workflowModes,
      l12Layers,
      requiredSkills: 0,
      recommendedSkills: 0,
      optionalSkills: 0,
      items: [],
      command: "helix skill suggest --plan <active-plan-path>",
      sourceBindings: scrumOperation.sourceBindings,
      docDependencies: ["docs/skills/SKILL_MAP.md", "docs/skills/**"],
      implementationDependencies: ["automation_assets", "skill_recommendations"],
      reasons: ["automation_assets に skill catalog が無く、drive model から skill を機械選択できない"],
    };
  }

  const items = rows
    .map((asset) => {
      const scored = skillBindingScore({ asset, workflowModes, l12Layers });
      return { asset, ...scored };
    })
    .filter(
      (entry) =>
        entry.score >= 0.5 ||
        entry.matchedDriveModels.length > 0 ||
        entry.matchedLayers.length > 0,
    )
    .sort(
      (a, b) =>
        b.score - a.score ||
        String(a.asset.asset_id ?? "").localeCompare(String(b.asset.asset_id ?? "")),
    )
    .slice(0, 8)
    .map((entry, index): ProjectSkillBindingItem => {
      const tier = skillBindingTier(entry.score);
      return {
        skillId: String(entry.asset.asset_id ?? ""),
        skillPath: String(entry.asset.path ?? ""),
        tier,
        injectAt: tier === "optional" ? "on_demand" : "before_work",
        rank: index + 1,
        score: entry.score,
        matchedDriveModels: entry.matchedDriveModels,
        matchedLayers: entry.matchedLayers,
        sourceDriveModels: entry.sourceDriveModels,
        sourceLayers: entry.sourceLayers,
        reasons: entry.reasons.length > 0 ? entry.reasons : ["catalog metadata matched weakly"],
      };
    });

  return {
    status: items.length > 0 ? "ready" : "no_match",
    sourcePackage: VMODEL_ZIP_FILENAME,
    selectedModel,
    workflowModes,
    l12Layers,
    requiredSkills: items.filter((item) => item.tier === "required").length,
    recommendedSkills: items.filter((item) => item.tier === "recommended").length,
    optionalSkills: items.filter((item) => item.tier === "optional").length,
    items,
    command: "helix skill suggest --plan <active-plan-path>",
    sourceBindings: scrumOperation.sourceBindings,
    docDependencies: unique([
      "docs/skills/SKILL_MAP.md",
      ...items.map((item) => item.skillPath),
      ...scrumOperation.docDependencies,
    ]),
    implementationDependencies: unique([
      "automation_assets",
      "skill_recommendations",
      ...scrumOperation.implementationDependencies,
    ]),
    reasons:
      items.length > 0
        ? [
            `selected_model=${selectedModel}`,
            `workflow_modes=${workflowModes.join(",")}`,
            `l12_layers=${l12Layers.join(",") || "-"}`,
            "skill 本文を一括 load せず catalog metadata から read-only 推奨を生成した",
          ]
        : [
            `selected_model=${selectedModel}`,
            `workflow_modes=${workflowModes.join(",")}`,
            "drive model / Scrum / L12 layer に一致する skill catalog entry が無い",
          ],
  };
}

function buildZipAdoptionMatrix(db: HarnessDb): ProjectZipAdoptionMatrix {
  const rows = db
    .prepare(
      `SELECT defined_id, source_path
       FROM design_declarations
       WHERE defined_id LIKE 'HVM-ADOPT-%'
          OR defined_id LIKE 'HVM-COMP-%'
          OR defined_id LIKE 'HVM-REJECT-%'
       ORDER BY defined_id`,
    )
    .all() as Array<Record<string, unknown>>;
  const rowsById = new Map<string, Array<Record<string, unknown>>>();
  for (const row of rows) {
    const id = String(row.defined_id ?? "");
    const list = rowsById.get(id) ?? [];
    list.push(row);
    rowsById.set(id, list);
  }

  const items = ZIP_ADOPTION_RULES.map((rule): ProjectZipAdoptionMatrixItem => {
    const matched = rowsById.get(rule.adoptionId) ?? [];
    const status: ProjectZipAdoptionItemStatus = matched.length > 0 ? "declared" : "missing";
    const declarationIds = unique(matched.map((row) => String(row.defined_id ?? "")));
    const sourcePaths = unique(matched.map((row) => String(row.source_path ?? "")));

    return {
      adoptionId: rule.adoptionId,
      category: rule.category,
      label: rule.label,
      status,
      declarationIds,
      sourcePaths,
      docDependencies:
        sourcePaths.length > 0
          ? sourcePaths
          : ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
      implementationDependencies:
        ZIP_ADOPTION_IMPLEMENTATION_DEPENDENCIES[rule.adoptionId] ?? [
          "design_declarations",
          "design_references",
        ],
      reasons:
        status === "declared"
          ? ["ZIP 採用/補完/非採用判断が typed declaration として検出された"]
          : ["ZIP 採用/補完/非採用判断の typed declaration が未検出"],
    };
  });

  return {
    status: items.every((item) => item.status === "declared") ? "complete" : "missing",
    items,
    adopted: items.filter((item) => item.category === "adopt" && item.status === "declared").length,
    complemented: items.filter(
      (item) => item.category === "complement" && item.status === "declared",
    ).length,
    rejected: items.filter((item) => item.category === "reject" && item.status === "declared")
      .length,
    missing: items.filter((item) => item.status === "missing").length,
    sourcePackage: VMODEL_ZIP_FILENAME,
    sourceDocument: "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
    docDependencies: unique(items.flatMap((item) => item.docDependencies)),
    implementationDependencies: unique(items.flatMap((item) => item.implementationDependencies)),
  };
}

function buildTailoringGate(db: HarnessDb): ProjectTailoringGate {
  const rows = db
    .prepare(
      `SELECT defined_id, source_path
       FROM design_declarations
       WHERE defined_id LIKE 'HVM-TAILOR-%'
       ORDER BY defined_id`,
    )
    .all() as Array<Record<string, unknown>>;
  const rowsById = new Map<string, Array<Record<string, unknown>>>();
  for (const row of rows) {
    const id = String(row.defined_id ?? "");
    const list = rowsById.get(id) ?? [];
    list.push(row);
    rowsById.set(id, list);
  }

  const items = TAILORING_RULES.map((rule): ProjectTailoringGateItem => {
    const matched = rowsById.get(rule.tailoringId) ?? [];
    const declared = matched.length > 0;
    const status: ProjectTailoringGateItemStatus =
      rule.category === "na" ? "excluded" : declared ? "declared" : "missing";
    const declarationIds = unique(matched.map((row) => String(row.defined_id ?? "")));
    const sourcePaths = unique(matched.map((row) => String(row.source_path ?? "")));
    const reasons =
      status === "declared"
        ? [
            "個人開発 tailoring profile の required/optional 契約が typed declaration として検出された",
          ]
        : status === "excluded"
          ? ["個人開発 tailoring profile で na として対象外にしたため missing にはしない"]
          : ["個人開発 tailoring profile の required 契約が未検出"];

    return {
      tailoringId: rule.tailoringId,
      category: rule.category,
      label: rule.label,
      detailLevel: rule.detailLevel,
      status,
      declarationIds,
      sourcePaths,
      docDependencies:
        sourcePaths.length > 0
          ? sourcePaths
          : ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
      implementationDependencies: ["design_declarations", "design_references"],
      reasons,
    };
  });
  const missingRequired = items.filter(
    (item) => item.category === "required" && item.status === "missing",
  ).length;

  return {
    status: missingRequired === 0 ? "pass" : "needs_tailoring",
    profile: "solo",
    items,
    required: items.filter((item) => item.category === "required" && item.status === "declared")
      .length,
    optional: items.filter((item) => item.category === "optional" && item.status === "declared")
      .length,
    excluded: items.filter((item) => item.status === "excluded").length,
    missing_required: missingRequired,
    sourceDocument: "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
    docDependencies: unique(items.flatMap((item) => item.docDependencies)),
    implementationDependencies: ["design_declarations", "design_references"],
  };
}

interface CoverageBucket {
  legacyLayers: string[];
  activePlanIds: string[];
  terminalPlanIds: string[];
  planIds: string[];
  designIds: string[];
  testDesignIds: string[];
  reasons: string[];
}

function emptyCoverageBucket(): CoverageBucket {
  return {
    legacyLayers: [],
    activePlanIds: [],
    terminalPlanIds: [],
    planIds: [],
    designIds: [],
    testDesignIds: [],
    reasons: [],
  };
}

function l12CoverageBucketMap(): Map<string, CoverageBucket> {
  return new Map(L12_LAYERS.map((layer) => [layer.layer, emptyCoverageBucket()]));
}

function buildL12Coverage(input: {
  db: HarnessDb;
  hasContradiction: boolean;
  unresolvedDesignReferences: number;
  implAheadObligations: number;
  operationScopeGaps: number;
  operationScope: ProjectCurrentLocationSnapshot["operation_scope"];
}): ProjectCurrentLocationSnapshot["coverage"] {
  const buckets = l12CoverageBucketMap();
  const bucketFor = (legacyLayer: string | null, planId = ""): CoverageBucket | null => {
    const l12Layer = planId
      ? mapPlanToL12Coverage(legacyLayer, planId).layer
      : mapLegacyLayerToL12Coverage(legacyLayer);
    return l12Layer ? (buckets.get(l12Layer) ?? null) : null;
  };

  for (const row of input.db
    .prepare("SELECT plan_id, layer, status FROM plan_registry WHERE layer <> ''")
    .all() as Array<Record<string, unknown>>) {
    const legacyLayer = String(row.layer ?? "");
    const planId = String(row.plan_id ?? "");
    const bucket = bucketFor(legacyLayer, planId);
    if (!bucket) continue;
    const status = String(row.status ?? "").toLowerCase();
    bucket.legacyLayers.push(legacyLayer);
    bucket.planIds.push(planId);
    if (ACTIVE_STATUSES.has(status)) bucket.activePlanIds.push(planId);
    if (TERMINAL_STATUSES.has(status)) bucket.terminalPlanIds.push(planId);
  }

  for (const row of input.db
    .prepare("SELECT defined_id, layer, source_path FROM design_declarations WHERE layer <> ''")
    .all() as Array<Record<string, unknown>>) {
    const legacyLayer = String(row.layer ?? "");
    const l12Layer = mapDeclarationLayerToL12Coverage(legacyLayer);
    const bucket = l12Layer ? (buckets.get(l12Layer) ?? null) : null;
    if (!bucket) continue;
    const definedId = String(row.defined_id ?? "");
    bucket.legacyLayers.push(legacyLayer);
    const sourcePath = String(row.source_path ?? "");
    if (sourcePath.startsWith("docs/test-design/")) bucket.testDesignIds.push(definedId);
    else bucket.designIds.push(definedId);
  }

  if (input.hasContradiction) {
    buckets.get("L6")?.reasons.push("L7 起票/実行中が L6 実装相当として残っている");
    buckets.get("L12")?.reasons.push("L14 到達済み claim と未了 L7 が同時に存在する");
  }
  if (input.unresolvedDesignReferences > 0) {
    buckets
      .get("L5")
      ?.reasons.push("未解決 design reference があり詳細設計/テスト設計へ戻す必要がある");
  }
  if (input.implAheadObligations > 0) {
    buckets
      .get("L5")
      ?.reasons.push("impl-ahead obligation があり詳細設計/テスト設計が不足している");
    buckets.get("L6")?.reasons.push("実装が設計/テスト設計より先行している");
  }
  if (input.operationScopeGaps > 0) {
    buckets
      .get("L12")
      ?.reasons.push(
        `log/KPI/runtime verification/operation test/class-method contract の未設計または未観測が ${input.operationScopeGaps} 件ある`,
      );
  }
  const operationDesignIds = unique(input.operationScope.items.flatMap((item) => item.designIds));
  if (operationDesignIds.length > 0) {
    const bucket = buckets.get("L12");
    if (bucket) {
      bucket.legacyLayers.push("L12");
      bucket.designIds.push(...operationDesignIds);
    }
  }

  const l12Layers = L12_LAYERS.map((layer): ProjectL12LayerCoverage => {
    const bucket = buckets.get(layer.layer) ?? emptyCoverageBucket();
    const coverageMetadata = coverageMetadataForL12Layer(layer.layer);
    const hasAnyEvidence =
      bucket.planIds.length > 0 ||
      bucket.designIds.length > 0 ||
      bucket.testDesignIds.length > 0 ||
      bucket.reasons.length > 0;
    const needsReverify = bucket.activePlanIds.length > 0 || bucket.reasons.length > 0;
    const status: ProjectL12CoverageStatus = !hasAnyEvidence
      ? "missing"
      : needsReverify
        ? "reverify"
        : "done";
    const reasons = [...bucket.reasons];
    if (bucket.activePlanIds.length > 0) reasons.push("open PLAN が残っている");
    if (status === "missing")
      reasons.push("旧成果物/typed declaration からの再投影 evidence がない");
    if (status === "done") reasons.push("terminal PLAN または typed declaration から再投影済み");
    reasons.push(
      `ZIP source bindings=${coverageMetadata.zipSourceBindingIds.join(",") || "-"}`,
      `tailoring=${coverageMetadata.tailoringRuleIds.join(",") || "-"} detail=${coverageMetadata.tailoringDetailLevels.join(",") || "-"}`,
    );
    return {
      layer: layer.layer,
      label: layer.label,
      status,
      zipSourceBindingIds: coverageMetadata.zipSourceBindingIds,
      tailoringRuleIds: coverageMetadata.tailoringRuleIds,
      tailoringDetailLevels: coverageMetadata.tailoringDetailLevels,
      legacyLayers: unique(bucket.legacyLayers),
      planIds: unique(bucket.planIds),
      designIds: unique(bucket.designIds),
      testDesignIds: unique(bucket.testDesignIds),
      reasons: unique(reasons),
    };
  });

  return {
    l12_layers: l12Layers,
    done: l12Layers.filter((layer) => layer.status === "done").length,
    missing: l12Layers.filter((layer) => layer.status === "missing").length,
    reverify: l12Layers.filter((layer) => layer.status === "reverify").length,
  };
}

function buildOperationScope(db: HarnessDb): ProjectCurrentLocationSnapshot["operation_scope"] {
  const declarationRows = db
    .prepare(
      "SELECT defined_id, declaration_kind, title, layer, source_path FROM design_declarations",
    )
    .all() as Array<Record<string, unknown>>;
  const runtimeTotal = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM runtime_verification_events",
  );
  const runtimeAccepted = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM runtime_verification_events WHERE verification_class = ? AND accept_status = ?",
    ["runtime_verified", "accepted"],
  );
  const runtimeAcceptedRows = db
    .prepare(
      `SELECT event_id, requirement_id, test_oracle_id, claim, source, runtime_surface, evidence_path
       FROM runtime_verification_events
       WHERE verification_class = ? AND accept_status = ?`,
    )
    .all("runtime_verified", "accepted") as Array<Record<string, unknown>>;

  const items = OPERATION_SCOPES.map((scope): ProjectOperationScopeCoverage => {
    const operationCoverage = designCoverageRuleForL12Layer("L12");
    const matched = declarationRows.filter((row) =>
      scope.patterns.some((pattern) => pattern.test(operationScopeText(row))),
    );
    const designIds = unique(matched.map((row) => String(row.defined_id ?? "")));
    const observedRows =
      scope.scope === "runtime_verification"
        ? runtimeAcceptedRows
        : runtimeAcceptedRows.filter((row) =>
            scope.patterns.some((pattern) => pattern.test(operationRuntimeEvidenceText(row))),
          );
    const observedCount = observedRows.length;
    const observationSources = unique(
      observedRows.map((row) => String(row.evidence_path || row.event_id || "")).filter(Boolean),
    );
    const evidenceTables = [...scope.tables];
    const reasons: string[] = [];
    let status: ProjectOperationScopeStatus;

    if (observedCount > 0) {
      status = "observed";
      reasons.push("runtime_verified + accepted の runtime evidence がある");
    } else if (designIds.length > 0) {
      status = scope.scope === "runtime_verification" && runtimeTotal > 0 ? "reverify" : "designed";
      reasons.push("typed declaration から設計済みとして検出した");
      if (scope.scope === "runtime_verification" && runtimeTotal > 0 && runtimeAccepted === 0) {
        reasons.push("runtime verification event はあるが accepted/runtime_verified ではない");
      }
      if (scope.scope !== "runtime_verification" && observedCount === 0) {
        reasons.push("runtime 観測は未接続。設計済みだが運用時 view では observed gap として扱う");
      }
    } else {
      status = "missing";
      reasons.push("typed declaration から検出できないため L12 運用後検証の gap とする");
      if (scope.scope === "runtime_verification" && runtimeTotal > 0) {
        reasons.push("runtime evidence はあるが設計宣言がない");
      }
    }

    return {
      scope: scope.scope,
      label: scope.label,
      coverageId: operationCoverage?.coverageId ?? "L12-operation-observability",
      coverageLabel: operationCoverage?.label ?? "運用テスト/ログ/KPI/runtime",
      status,
      designIds,
      observedCount,
      observationSources,
      evidenceTables,
      reasons: unique(reasons),
    };
  });

  return {
    items,
    designed: items.filter((item) => item.status === "designed").length,
    observed: items.filter((item) => item.status === "observed").length,
    observed_gap: items.filter((item) => item.status === "designed" && item.observedCount === 0).length,
    missing: items.filter((item) => item.status === "missing").length,
    reverify: items.filter((item) => item.status === "reverify").length,
  };
}

function buildClosureStatus(input: {
  db: HarnessDb;
  hasContradiction: boolean;
  plansTotal: number;
  openL7Plans: PlanRegistryRow[];
  terminalL14PlanIds: string[];
  closureEvidenceIds: string[];
}): ProjectClosureStatus {
  const openL7PlanIds = input.openL7Plans.map((plan) => plan.planId);
  const requiredEvidence = [
    "open L7 PLAN を 0 件にする",
    "L7 TDD closure / trace closure declaration を維持する",
    "L14 claim は L12 運用テスト evidence と矛盾しないこと",
  ];
  const status: ProjectClosureStatus["status"] =
    input.plansTotal === 0
      ? "unknown"
      : input.hasContradiction
        ? "contradicted"
        : openL7PlanIds.length > 0
          ? "open"
          : input.closureEvidenceIds.length > 0
            ? "closed"
            : "open";
  const remediation = buildClosureRemediation({
    hasContradiction: input.hasContradiction,
    openL7PlanIds,
    terminalL14PlanIds: input.terminalL14PlanIds,
    closureEvidenceIds: input.closureEvidenceIds,
  });
  const queueItems = buildClosureQueue(input.db, input.openL7Plans);
  const packets = buildClosurePackets(queueItems);
  const nextActionLedger = buildClosureNextActionLedger(packets);

  return {
    status,
    l7_open_plan_ids: unique(openL7PlanIds),
    terminal_l14_plan_ids: unique(input.terminalL14PlanIds),
    closure_evidence_ids: unique(input.closureEvidenceIds),
    required_evidence: requiredEvidence,
    remediation,
    queue: {
      items: queueItems,
      total: queueItems.length,
      route_counts: closureQueueRouteCounts(queueItems),
    },
    packets: {
      items: packets,
      total: packets.length,
    },
    next_action_ledger: {
      entries: nextActionLedger,
      total: nextActionLedger.length,
      status_counts: closureNextActionLedgerStatusCounts(nextActionLedger),
      write_policy: "read-only",
      source_command: "helix current-location --json",
      view_command: "helix progress tree-view --json",
    },
    docDependencies: ["docs/plans", "docs/design/**", "docs/test-design/**"],
    implementationDependencies: ["plan_registry", "design_declarations", "design_references"],
  };
}

function closureQueuePriority(plan: PlanRegistryRow): number {
  const id = plan.planId.toLowerCase();
  const kind = plan.kind.toLowerCase();
  if (id.includes("reverse") || id.includes("backprop") || id.includes("gate")) return 10;
  if (kind.includes("add-design") || kind.includes("design")) return 20;
  if (kind.includes("add-impl") || kind.includes("impl")) return 30;
  return 40;
}

function closureQueueRequiredAction(plan: PlanRegistryRow): string {
  const id = plan.planId.toLowerCase();
  const kind = plan.kind.toLowerCase();
  if (id.includes("reverse") || id.includes("backprop") || id.includes("gate")) {
    return "Reverse/backprop/gate 系の未閉鎖を設計・テスト設計依存へ戻して解消する";
  }
  if (kind.includes("add-design") || kind.includes("design")) {
    return "設計 delta を L5 詳細設計または L7 closure oracle に再投影して閉じる";
  }
  if (kind.includes("add-impl") || kind.includes("impl")) {
    return "実装 delta を対応する設計/テスト設計/Green evidence に照合して閉じる";
  }
  return "PLAN の未閉鎖理由を設計/テスト設計/実装証跡へ分類して閉じる";
}

function closureQueueNextAction(
  evidence: ProjectClosureEvidenceSummary,
): ProjectClosureQueueNextAction {
  if (evidence.status === "ready") return "close_ready";
  if (evidence.testRuns.failed > 0 || evidence.gateRuns.failed > 0) return "repair_failed_evidence";
  if (evidence.status === "partial") return "collect_evidence";
  return "reverse_design";
}

function closureEvidenceGaps(evidence: ProjectClosureEvidenceSummary): ProjectClosureEvidenceGap[] {
  const gaps: ProjectClosureEvidenceGap[] = [];
  if (evidence.artifactPaths.length === 0) {
    gaps.push({
      component: "artifact",
      status: "missing",
      evidenceTables: ["artifact_registry"],
      requiredAction: "対象 PLAN 自体または関連 artifact を artifact_registry に投影する",
    });
  }
  if (
    evidence.testRuns.passed === 0 &&
    evidence.gateRuns.passed === 0 &&
    evidence.runtimeVerification.accepted === 0
  ) {
    gaps.push({
      component: "execution",
      status: "missing",
      evidenceTables: ["test_runs", "gate_runs", "runtime_verification_events"],
      requiredAction:
        "passed test/gate/runtime verification のいずれかを追加して DB projection へ反映する",
    });
  }
  if (evidence.testRuns.failed > 0) {
    gaps.push({
      component: "test",
      status: "failed",
      evidenceTables: ["test_runs"],
      requiredAction: "failed test を保持したまま修正後の passed test evidence を追加する",
    });
  }
  if (evidence.gateRuns.failed > 0) {
    gaps.push({
      component: "gate",
      status: "failed",
      evidenceTables: ["gate_runs"],
      requiredAction: "failed gate を保持したまま修正後の passed gate evidence を追加する",
    });
  }
  if (evidence.runtimeVerification.total > 0 && evidence.runtimeVerification.accepted === 0) {
    gaps.push({
      component: "runtime",
      status: "not_accepted",
      evidenceTables: ["runtime_verification_events"],
      requiredAction: "runtime verification event を accepted として再取得する",
    });
  }
  return gaps;
}

function closureEvidenceAction(input: {
  nextAction: ProjectClosureQueueNextAction;
  gaps: ProjectClosureEvidenceGap[];
}): string {
  switch (input.nextAction) {
    case "close_ready":
      return "evidence は closure review 可能。approval_scope_digest 付き review-bundle へ進める";
    case "collect_evidence":
      return `不足 evidence を収集する: ${input.gaps
        .map((gap) => `${gap.component}:${gap.status}`)
        .join(",")}`;
    case "repair_failed_evidence":
      return `失敗 evidence を修復する: ${input.gaps
        .map((gap) => `${gap.component}:${gap.status}`)
        .join(",")}`;
    case "reverse_design":
      return "artifact と execution evidence の収集先を設計/テスト設計へ戻して定義する";
  }
}

function closureQueueRouteCounts(items: ProjectClosureQueueItem[]): ProjectClosureQueueRouteCounts {
  return {
    close_ready: items.filter((item) => item.nextAction === "close_ready").length,
    collect_evidence: items.filter((item) => item.nextAction === "collect_evidence").length,
    repair_failed_evidence: items.filter((item) => item.nextAction === "repair_failed_evidence")
      .length,
    reverse_design: items.filter((item) => item.nextAction === "reverse_design").length,
  };
}

function closureQueueNextActionReason(action: ProjectClosureQueueNextAction): string {
  switch (action) {
    case "close_ready":
      return "artifact と実行証跡が揃っているため closure claim の候補";
    case "collect_evidence":
      return "artifact はあるが実行証跡が不足しているため証跡収集が必要";
    case "repair_failed_evidence":
      return "失敗 test/gate evidence があるため修正と再検証が必要";
    case "reverse_design":
      return "artifact/trace/test/gate/runtime evidence が不足し、設計/テスト設計へ戻す必要がある";
  }
}

function closurePacketLabel(action: ProjectClosureQueueNextAction): string {
  switch (action) {
    case "close_ready":
      return "閉鎖候補 packet";
    case "collect_evidence":
      return "証跡収集 packet";
    case "repair_failed_evidence":
      return "修正/再検証 packet";
    case "reverse_design":
      return "設計/テスト設計戻し packet";
  }
}

function closurePacketRequiredAction(action: ProjectClosureQueueNextAction): string {
  switch (action) {
    case "close_ready":
      return "ready queue を closure claim に昇格できるか確認し、L14 claim との整合を閉じる";
    case "collect_evidence":
      return "artifact はあるが実行証跡が不足する PLAN へ green command / gate / runtime evidence を追加する";
    case "repair_failed_evidence":
      return "失敗 test/gate evidence を修正し、再実行した green evidence を DB へ投影する";
    case "reverse_design":
      return "証跡が無い PLAN を設計/テスト設計依存へ戻し、必要な typed declaration と oracle を補う";
  }
}

function closurePacketAcceptanceCriteria(action: ProjectClosureQueueNextAction): string[] {
  switch (action) {
    case "close_ready":
      return [
        "対象 PLAN の artifact と実行証跡が DB projection で確認できる",
        "L7 closure oracle と L12 claim が矛盾しない",
        "open L7 status を閉じる前に証跡 path が保持される",
      ];
    case "collect_evidence":
      return [
        "対象 PLAN に対応する test_runs / gate_runs / runtime_verification_events のいずれかが追加される",
        "追加証跡は evidence_path または output_digest を持つ",
        "証跡追加後に queue item が collect_evidence から close_ready または repair_failed_evidence へ移る",
      ];
    case "repair_failed_evidence":
      return [
        "失敗 test/gate の原因を修正する",
        "再実行後の test/gate が passed として DB projection される",
        "失敗証跡を隠さず、再検証証跡と併存させる",
      ];
    case "reverse_design":
      return [
        "対象 PLAN の設計/テスト設計依存を明示する",
        "必要な typed declaration または TDD closure oracle を追加する",
        "設計戻し後に implementation evidence の収集先が決まる",
      ];
  }
}

function closurePacketExpectedTransition(action: ProjectClosureQueueNextAction): string {
  switch (action) {
    case "close_ready":
      return "closure claim 候補として人間レビュー後に open L7 queue から除外される";
    case "collect_evidence":
      return "evidence 追加後に close_ready または repair_failed_evidence へ再分類される";
    case "repair_failed_evidence":
      return "修正と再検証後に close_ready へ再分類される";
    case "reverse_design":
      return "設計/テスト設計依存を補った後に collect_evidence へ再分類される";
  }
}

function closurePacketPromotionGate(action: ProjectClosureQueueNextAction): string {
  switch (action) {
    case "close_ready":
      return "artifact/trace/成功証跡/L7 closure oracle/L12 claim の整合";
    case "collect_evidence":
      return "artifact が存在し、test/gate/runtime evidence のいずれかが投影されている";
    case "repair_failed_evidence":
      return "失敗 evidence を保持したまま、最新の再実行 evidence が passed になっている";
    case "reverse_design":
      return "typed declaration、test oracle、実装証跡の収集先が宣言されている";
  }
}

function buildClosureAutomationGuide(input: {
  action: ProjectClosureQueueNextAction;
  sequence: number;
  items: ProjectClosureQueueItem[];
}): ProjectClosureAutomationGuide {
  return {
    batchId: `closure-batch:${input.sequence}:${input.action}`,
    sequence: input.sequence,
    machineFilter: `closure.queue.items[nextAction=${input.action}]`,
    detectionSource: "harness.db",
    reviewCommand: `helix closure batch --action ${input.action} --json`,
    viewCommand: "helix progress tree-view --json",
    writePolicy: "read-only",
    expectedTransition: closurePacketExpectedTransition(input.action),
    promotionGate: closurePacketPromotionGate(input.action),
    samplePlanIds: input.items.slice(0, 20).map((item) => item.planId),
  };
}

function buildClosurePackets(items: ProjectClosureQueueItem[]): ProjectClosurePacket[] {
  return PROJECT_CLOSURE_QUEUE_ACTIONS.map((action, index): ProjectClosurePacket | null => {
    const actionItems = items.filter((item) => item.nextAction === action);
    if (actionItems.length === 0) return null;
    return {
      packetId: `closure:${action}`,
      nextAction: action,
      label: closurePacketLabel(action),
      driveModel: "Reverse",
      l12Layer: "L6",
      count: actionItems.length,
      planIds: actionItems.map((item) => item.planId),
      sourcePaths: unique(actionItems.map((item) => item.sourcePath)),
      requiredAction: closurePacketRequiredAction(action),
      docDependencies: unique(actionItems.flatMap((item) => item.docDependencies)),
      implementationDependencies: unique(
        actionItems.flatMap((item) => item.implementationDependencies),
      ),
      acceptanceCriteria: closurePacketAcceptanceCriteria(action),
      automation: buildClosureAutomationGuide({
        action,
        sequence: index + 1,
        items: actionItems,
      }),
      reasons: unique(actionItems.flatMap((item) => item.reasons)),
    };
  }).filter((packet): packet is ProjectClosurePacket => packet !== null);
}

function closureBatchEvidenceSignature(item: ProjectClosureQueueItem): string {
  const gapKeys = item.evidenceGaps
    .map((gap) => `${gap.component}:${gap.status}`)
    .sort();
  return gapKeys.length > 0 ? gapKeys.join("+") : "no-gap";
}

function closureBatchWorkBucketRequiredAction(
  action: ProjectClosureQueueNextAction,
  signature: string,
): string {
  switch (action) {
    case "close_ready":
      return `同一 evidence signature (${signature}) の close_ready 候補を approval bundle で確認する`;
    case "collect_evidence":
      return `同一 evidence signature (${signature}) の不足証跡をまとめて収集し、DB projection へ反映する`;
    case "repair_failed_evidence":
      return `同一 evidence signature (${signature}) の失敗証跡を修復し、passed evidence を追加投影する`;
    case "reverse_design":
      return `同一 evidence signature (${signature}) の設計/テスト設計依存を補い、収集先を確定する`;
  }
}

function latestIso(values: Array<string | null | undefined>): string | null {
  const present = values.filter((value): value is string => typeof value === "string" && value.length > 0);
  return present.sort().at(-1) ?? null;
}

function closureFailedEvidenceRunnableCommand(command: string | null): string | null {
  if (!command) return null;
  if (/^(bun|npm|pnpm|yarn|node|deno|vitest|tsc|bash|sh)\b/.test(command)) return command;
  return null;
}

function closureFailedEvidenceCommandVerb(command: string): string | null {
  const match = /^Bash \(([^)]+)\)$/.exec(command.trim());
  return match?.[1] ?? null;
}

function closureCommandResolutionCandidates(
  command: string,
  action: ProjectClosureQueueNextAction,
): ProjectClosureBatchCommandResolutionCandidate[] {
  const verb = closureFailedEvidenceCommandVerb(command);
  const projectionBinding = closureCommandProjectionBinding(action);
  switch (verb) {
    case "vitest":
      return [
        {
          command: "bun run test:fast",
          source: "classified_verb",
          confidence: "medium",
          safe_to_run: true,
          projection_binding: projectionBinding,
          required_action:
            "session-log は引数を保持しないため、fast project 全体を再実行して green evidence を取得する",
        },
        {
          command: "bun run vitest run <targeted tests>",
          source: "classified_verb",
          confidence: "low",
          safe_to_run: false,
          projection_binding: projectionBinding,
          required_action:
            "対象テストファイルを evidence path / 変更範囲から人間または resolver が補完してから実行する",
        },
      ];
    case "tsc":
      return [
        {
          command: "bun run typecheck",
          source: "package_script",
          confidence: "high",
          safe_to_run: true,
          projection_binding: projectionBinding,
          required_action: "型検査を再実行し、exit_code=0 の test_runs を追加投影する",
        },
      ];
    case "doctor":
      return [
        {
          command: "bun src/cli.ts doctor",
          source: "known_helix_surface",
          confidence: "high",
          safe_to_run: true,
          projection_binding: projectionBinding,
          required_action: "doctor を再実行し、green gate/runtime evidence として追加投影する",
        },
      ];
    case "lint":
      return [
        {
          command: "bun run lint",
          source: "package_script",
          confidence: "high",
          safe_to_run: true,
          projection_binding: projectionBinding,
          required_action: "lint を再実行し、exit_code=0 の test_runs を追加投影する",
        },
      ];
    case "eslint":
      return [
        {
          command: "npx eslint <paths>",
          source: "classified_verb",
          confidence: "low",
          safe_to_run: false,
          projection_binding: projectionBinding,
          required_action: "対象 path を補完してから eslint を再実行する",
        },
      ];
    case "test":
      return [
        {
          command: "bun run test",
          source: "package_script",
          confidence: "medium",
          safe_to_run: true,
          projection_binding: projectionBinding,
          required_action: "test script を再実行し、exit_code=0 の test_runs を追加投影する",
        },
      ];
    default:
      return [];
  }
}

function closureCommandProjectionBinding(
  action: ProjectClosureQueueNextAction,
): ProjectClosureBatchCommandProjectionBinding {
  return {
    target_tables: ["test_runs", "gate_runs", "runtime_verification_events"],
    source_surfaces: [
      "docs/plans/<plan_id>.md review_evidence.green_commands",
      "docs/evidence/<plan_id>-test.json",
      "docs/evidence/<plan_id>-runtime.json",
    ],
    required_fields: [
      "plan_id",
      "command",
      "runner",
      "scope",
      "exit_code",
      "completed_at",
      "evidence_path",
      "output_digest",
    ],
    success_status: "passed_or_accepted",
    write_policy: "read-only_plan",
    postcheck_commands: closureEvidencePlanPostcheckCommands(action),
    required_action:
      "成功後は failed evidence を削除せず、review_evidence.green_commands または structured evidence を追加して harness.db rebuild で投影する",
  };
}

function collectEvidenceFallbackCommandCandidate(
  action: ProjectClosureQueueNextAction,
  itemCount: number,
): ProjectClosureBatchRepairCommandCandidate | null {
  if (action !== "collect_evidence" || itemCount === 0) return null;
  const projectionBinding = closureCommandProjectionBinding(action);
  return {
    command_label: "package script: test:fast",
    command_verb: "test:fast",
    runnable_command: "bun run test:fast",
    resolution_candidates: [
      {
        command: "bun run test:fast",
        source: "package_script",
        confidence: "medium",
        safe_to_run: true,
        projection_binding: projectionBinding,
        required_action:
          "不足 execution evidence の収集用に repository-wide fast suite を実行し、成功後は approval-required materialized evidence として投影候補にする",
      },
    ],
    count: itemCount,
    latest_observed_at: null,
    evidence_paths: [],
    sample_plan_ids: [],
    required_action:
      "既知の失敗 command が無い collect_evidence queue のため、repository-wide green command を probe として取得する",
    reasons: [
      "fallback=repository-wide-green-command",
      `count=${itemCount}`,
      "safe_to_run=true",
    ],
  };
}

function buildClosureBatchRepairPlan(
  action: ProjectClosureQueueNextAction,
  items: ProjectClosureQueueItem[],
  limit: number,
): ProjectClosureBatchRepairPlan {
  const failedEvidence = items.flatMap((item) =>
    (item.evidence.failedEvidence ?? []).map((evidence) => ({
      evidence,
      planId: item.planId,
    })),
  );
  const status: ProjectClosureBatchRepairPlan["status"] =
    failedEvidence.length > 0
      ? "needs_repair"
      : action === "close_ready"
        ? "not_required"
        : "needs_evidence";
  const byCommand = new Map<string, typeof failedEvidence>();
  for (const entry of failedEvidence) {
    const key = entry.evidence.command ?? "unknown";
    byCommand.set(key, [...(byCommand.get(key) ?? []), entry]);
  }
  const commandCandidates = [...byCommand.entries()]
    .sort(([aCommand, aEntries], [bCommand, bEntries]) => {
      return bEntries.length - aEntries.length || aCommand.localeCompare(bCommand);
    })
    .map(([command, entries]): ProjectClosureBatchRepairCommandCandidate => {
      const runnableCommand = closureFailedEvidenceRunnableCommand(command);
      const commandVerb = closureFailedEvidenceCommandVerb(command);
      const resolutionCandidates = runnableCommand === null
        ? closureCommandResolutionCandidates(command, action)
        : [];
      return {
        command_label: command,
        command_verb: commandVerb,
        runnable_command: runnableCommand,
        resolution_candidates: resolutionCandidates,
        count: entries.length,
        latest_observed_at: latestIso(entries.map((entry) => entry.evidence.observedAt)),
        evidence_paths: unique(
          entries
            .map((entry) => entry.evidence.evidencePath)
            .filter((path): path is string => path !== null),
        ),
        sample_plan_ids: unique(entries.map((entry) => entry.planId)).slice(0, 20),
        required_action:
          runnableCommand === null
            ? "adapter label のため直接実行せず、対応する green command を再取得して passed evidence を追加投影する"
            : "同じ command を再実行し、passed evidence を追加投影する",
        reasons: [
          `command_label=${command}`,
          `verb=${commandVerb ?? "-"}`,
          `runnable=${runnableCommand ?? "-"}`,
          `resolution_candidates=${resolutionCandidates.length}`,
          `count=${entries.length}`,
        ],
      };
    });
  const fallbackCommandCandidate = collectEvidenceFallbackCommandCandidate(action, items.length);
  if (fallbackCommandCandidate) commandCandidates.push(fallbackCommandCandidate);
  const projectionPlanIds = unique(items.map((item) => item.planId)).slice(0, 20);
  const templatePlanId = projectionPlanIds[0] ?? "<plan_id>";
  const requiredGreenTables = ["test_runs", "gate_runs", "runtime_verification_events"];
  const projectionItems = items.slice(0, limit).map((item): ProjectClosureBatchRepairProjectionItem => {
    const itemFailedEvidence = item.evidence.failedEvidence ?? [];
    const artifactTemplates = closureGreenEvidenceArtifactTemplates({
      action,
      planId: item.planId,
      sourcePath: item.sourcePath,
    });
    return {
      plan_id: item.planId,
      source_path: item.sourcePath,
      failed_evidence_count: itemFailedEvidence.length,
      latest_failed_at: latestIso(itemFailedEvidence.map((evidence) => evidence.observedAt)),
      command_labels: unique(
        itemFailedEvidence.map((evidence) => evidence.command ?? "unknown"),
      ),
      evidence_paths: unique(
        itemFailedEvidence
          .map((evidence) => evidence.evidencePath)
          .filter((path): path is string => path !== null),
      ),
      required_green_tables: requiredGreenTables,
      projection_templates: requiredGreenTables
        .map((table) => closureEvidenceRowTemplate({ table, planId: item.planId, action }))
        .filter((template): template is ProjectClosureEvidenceRowTemplate => template !== null),
      evidence_artifact_templates: artifactTemplates,
      evidence_patch_plan: closureGreenEvidencePatchPlan({
        action,
        planId: item.planId,
        templates: artifactTemplates,
      }),
      required_action:
        itemFailedEvidence.length > 0
          ? "この plan_id に passed test/gate または accepted runtime verification を追加投影し、failed evidence は保持する"
          : "この plan_id に不足している green evidence を追加投影する",
      postcheck_commands: closureEvidencePlanPostcheckCommands(action),
      reasons: [
        `plan=${item.planId}`,
        `failed_evidence=${itemFailedEvidence.length}`,
        `evidence_status=${item.evidence.status}`,
      ],
    };
  });
  const automation = buildClosureBatchRepairAutomation({
    action,
    status,
    commandCandidates,
    projectionItemCount: projectionItems.length,
  });
  return {
    status,
    failed_evidence_count: failedEvidence.length,
    latest_failed_at: latestIso(failedEvidence.map((entry) => entry.evidence.observedAt)),
    automation,
    command_candidates: commandCandidates,
    projection_plan_ids: projectionPlanIds,
    projection_items: projectionItems,
    required_green_tables: requiredGreenTables,
    required_green_status: "passed_or_accepted",
    projection_templates: requiredGreenTables
      .map((table) => closureEvidenceRowTemplate({ table, planId: templatePlanId, action }))
      .filter((template): template is ProjectClosureEvidenceRowTemplate => template !== null),
    projection_policy:
      "failed evidence は削除せず、同じ plan_id に passed test/gate または accepted runtime verification を追加投影する",
    safety_policy:
      "read-only plan。直接実行可能な command がない場合は実行せず、green command evidence の再取得対象として扱う",
    reasons: [
      `status=${status}`,
      `failed_evidence=${failedEvidence.length}`,
      `commands=${commandCandidates.length}`,
    ],
  };
}

function buildClosureBatchRepairAutomation(input: {
  action: ProjectClosureQueueNextAction;
  status: ProjectClosureBatchRepairPlan["status"];
  commandCandidates: ProjectClosureBatchRepairCommandCandidate[];
  projectionItemCount: number;
}): ProjectClosureBatchRepairAutomation {
  const runnableCandidates = input.commandCandidates.filter(
    (candidate) => candidate.runnable_command !== null,
  );
  const labelOnlyCandidates = input.commandCandidates.filter(
    (candidate) => candidate.runnable_command === null,
  );
  const resolutionCandidates = input.commandCandidates.flatMap(
    (candidate) => candidate.resolution_candidates,
  );
  const safeResolutionCandidates = resolutionCandidates.filter((candidate) => candidate.safe_to_run);
  if (input.status === "not_required") {
    return {
      status: "not_required",
      command_candidate_count: input.commandCandidates.length,
      runnable_command_count: runnableCandidates.length,
      label_only_command_count: labelOnlyCandidates.length,
      resolution_candidate_count: resolutionCandidates.length,
      safe_resolution_command_count: safeResolutionCandidates.length,
      projection_item_count: input.projectionItemCount,
      primary_next_command: null,
      blockers: [],
      required_action: "追加 repair automation は不要",
      reasons: ["repair_plan=not_required"],
    };
  }
  if (labelOnlyCandidates.length > 0) {
    return {
      status: "needs_command_resolution",
      command_candidate_count: input.commandCandidates.length,
      runnable_command_count: runnableCandidates.length,
      label_only_command_count: labelOnlyCandidates.length,
      resolution_candidate_count: resolutionCandidates.length,
      safe_resolution_command_count: safeResolutionCandidates.length,
      projection_item_count: input.projectionItemCount,
      primary_next_command:
        safeResolutionCandidates[0]?.command ??
        `helix closure evidence-plan --action ${input.action} --json`,
      blockers: labelOnlyCandidates.map((candidate) => candidate.command_label),
      required_action:
        "adapter label だけでは raw command を再実行できないため、green command を解決してから passed evidence を追加投影する",
      reasons: [
        `label_only=${labelOnlyCandidates.length}`,
        `runnable=${runnableCandidates.length}`,
        `resolution_candidates=${resolutionCandidates.length}`,
        `safe_resolution=${safeResolutionCandidates.length}`,
        `projection_items=${input.projectionItemCount}`,
      ],
    };
  }
  if (runnableCandidates.length > 0) {
    return {
      status: "ready_to_execute",
      command_candidate_count: input.commandCandidates.length,
      runnable_command_count: runnableCandidates.length,
      label_only_command_count: 0,
      resolution_candidate_count: resolutionCandidates.length,
      safe_resolution_command_count: safeResolutionCandidates.length,
      projection_item_count: input.projectionItemCount,
      primary_next_command: runnableCandidates[0]?.runnable_command ?? null,
      blockers: [],
      required_action:
        "runnable command を再実行し、成功した green evidence を test_runs/gate_runs/runtime_verification_events へ投影する",
      reasons: [
        `runnable=${runnableCandidates.length}`,
        `projection_items=${input.projectionItemCount}`,
      ],
    };
  }
  return {
    status: "needs_evidence_projection",
    command_candidate_count: input.commandCandidates.length,
    runnable_command_count: 0,
    label_only_command_count: 0,
    resolution_candidate_count: resolutionCandidates.length,
    safe_resolution_command_count: safeResolutionCandidates.length,
    projection_item_count: input.projectionItemCount,
    primary_next_command: `helix closure evidence-plan --action ${input.action} --json`,
    blockers: [],
    required_action:
      "既知の失敗 command は無い。evidence template に従って不足 green evidence を収集・投影する",
    reasons: [`projection_items=${input.projectionItemCount}`],
  };
}

function buildClosureBatchWorkBuckets(input: {
  action: ProjectClosureQueueNextAction;
  allItems: ProjectClosureQueueItem[];
  limit: number;
}): ProjectClosureBatchWorkBucket[] {
  const grouped = new Map<string, ProjectClosureQueueItem[]>();
  for (const item of input.allItems) {
    const signature = closureBatchEvidenceSignature(item);
    grouped.set(signature, [...(grouped.get(signature) ?? []), item]);
  }
  return [...grouped.entries()]
    .sort(([aSignature, aItems], [bSignature, bItems]) => {
      const priorityDelta = Math.min(...aItems.map((item) => item.priority)) -
        Math.min(...bItems.map((item) => item.priority));
      if (priorityDelta !== 0) return priorityDelta;
      return bItems.length - aItems.length || aSignature.localeCompare(bSignature);
    })
    .map(([signature, items], index): ProjectClosureBatchWorkBucket => {
      const listedItems = items.slice(0, input.limit);
      const gaps = items.flatMap((item) => item.evidenceGaps);
      const components = unique(gaps.map((gap) => gap.component));
      const statuses = unique(gaps.map((gap) => gap.status));
      return {
        bucket_id: `closure-bucket:${input.action}:${index + 1}:${signature}`,
        action: input.action,
        rank: index + 1,
        count: items.length,
        listed: listedItems.length,
        omitted: Math.max(0, items.length - listedItems.length),
        evidence_signature: signature,
        evidence_components: components,
        evidence_statuses: statuses,
        target_tables: unique(gaps.flatMap((gap) => gap.evidenceTables)),
        primary_command:
          input.action === "close_ready"
            ? "helix closure review-bundle --action close_ready --summary-json"
            : `helix closure batch --action ${input.action} --json`,
        evidence_plan_command: `helix closure evidence-plan --action ${input.action} --json`,
        postcheck_commands: closureEvidencePlanPostcheckCommands(input.action),
        repair_plan: buildClosureBatchRepairPlan(input.action, items, input.limit),
        required_action: closureBatchWorkBucketRequiredAction(input.action, signature),
        expected_transition: closurePacketExpectedTransition(input.action),
        sample_plan_ids: listedItems.map((item) => item.planId),
        doc_dependencies: unique(items.flatMap((item) => item.docDependencies)),
        implementation_dependencies: unique(items.flatMap((item) => item.implementationDependencies)),
        reasons: [
          `signature=${signature}`,
          `count=${items.length}`,
          `components=${components.join(",") || "-"}`,
          `statuses=${statuses.join(",") || "-"}`,
        ],
      };
    });
}

export function buildProjectClosureBatchReport(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
    offset?: number;
  } = {},
): ProjectClosureBatchReport {
  const selectedAction = input.action ?? snapshot.closure.packets.items[0]?.nextAction ?? null;
  const allItems = selectedAction
    ? snapshot.closure.queue.items.filter((item) => item.nextAction === selectedAction)
    : [];
  const limit = Math.max(0, input.limit ?? 20);
  const offset = Math.max(0, input.offset ?? 0);
  const queueItems = allItems.slice(offset, offset + limit);
  const pageCount = limit === 0 ? (allItems.length > 0 ? 1 : 0) : Math.ceil(allItems.length / limit);
  const pageIndex =
    allItems.length === 0
      ? 0
      : limit === 0
        ? 1
        : Math.min(Math.floor(offset / limit) + 1, Math.max(1, pageCount));
  const windowStart = queueItems.length === 0 ? 0 : offset + 1;
  const windowEnd = queueItems.length === 0 ? 0 : offset + queueItems.length;
  const packet = selectedAction
    ? (snapshot.closure.packets.items.find((item) => item.nextAction === selectedAction) ?? null)
    : null;
  const ledger = selectedAction
    ? (snapshot.closure.next_action_ledger.entries.find(
        (entry) => entry.nextAction === selectedAction,
      ) ?? null)
    : null;

  return {
    schema_version: "project-closure-batch.v1",
    source_clock: snapshot.source_clock,
    selected_action: selectedAction,
    available_actions: snapshot.closure.packets.items.map((item) => item.nextAction),
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    packet,
    ledger,
    work_buckets: selectedAction
      ? buildClosureBatchWorkBuckets({ action: selectedAction, allItems, limit })
      : [],
    queue_items: queueItems,
	    total: allItems.length,
	    listed: queueItems.length,
	    omitted: Math.max(0, allItems.length - queueItems.length),
	    limit,
    offset,
    window: {
      start: windowStart,
      end: windowEnd,
      page_index: pageIndex,
      page_count: pageCount,
      has_previous: offset > 0 && allItems.length > 0,
      has_next: offset + limit < allItems.length,
      previous_offset:
        offset > 0 && allItems.length > 0 ? Math.max(0, offset - Math.max(1, limit)) : null,
      next_offset: offset + limit < allItems.length ? offset + limit : null,
    },
	    write_policy: "read-only",
    source_command: "helix closure batch --json",
    view_command: "helix progress tree-view --json",
    findings: snapshot.findings,
  };
}

function defaultClosureEvidencePlanAction(
  snapshot: ProjectCurrentLocationSnapshot,
): ProjectClosureQueueNextAction | null {
  const routeCounts = snapshot.closure.queue.route_counts;
  if (routeCounts.repair_failed_evidence > 0) return "repair_failed_evidence";
  if (routeCounts.collect_evidence > 0) return "collect_evidence";
  if (routeCounts.reverse_design > 0) return "reverse_design";
  if (routeCounts.close_ready > 0) return "close_ready";
  return null;
}

function closureEvidencePlanPostcheckCommands(action: ProjectClosureQueueNextAction): string[] {
  return [
    "helix db rebuild",
    `helix closure batch --action ${action} --json`,
    "helix current-location --json",
    "helix vmodel fit",
  ];
}

function closureEvidencePlanAcceptanceCriteria(action: ProjectClosureQueueNextAction): string[] {
  return unique([
    ...closurePacketAcceptanceCriteria(action),
    "追加・修復した証跡が harness.db projection に取り込まれている",
    `再計算後に対象 queue が ${action} のまま停滞しない`,
    "工程表と DB の現在地が同じ drive route を指す",
  ]);
}

function digestLines(lines: string[]): string {
  return `sha256:${createHash("sha256").update(lines.join("\n")).digest("hex")}`;
}

function summarizeClosureEvidenceGaps(
  items: ProjectClosureQueueItem[],
): ProjectClosureEvidencePlanGapCount[] {
  const byKey = new Map<string, ProjectClosureEvidencePlanGapCount>();
  for (const gap of items.flatMap((item) => item.evidenceGaps)) {
    const key = `${gap.component}:${gap.status}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.count += 1;
      existing.evidence_tables = unique([...existing.evidence_tables, ...gap.evidenceTables]);
      if (!existing.required_action.includes(gap.requiredAction)) {
        existing.required_action = `${existing.required_action} / ${gap.requiredAction}`;
      }
      continue;
    }
    byKey.set(key, {
      component: gap.component,
      status: gap.status,
      count: 1,
      evidence_tables: [...gap.evidenceTables],
      required_action: gap.requiredAction,
    });
  }
  return [...byKey.values()].sort((a, b) => {
    const byComponent = a.component.localeCompare(b.component);
    if (byComponent !== 0) return byComponent;
    return a.status.localeCompare(b.status);
  });
}

function closureEvidenceRowTemplate(input: {
  table: string;
  planId: string;
  action: ProjectClosureQueueNextAction;
}): ProjectClosureEvidenceRowTemplate | null {
  const repairPrefix =
    input.action === "repair_failed_evidence"
      ? "失敗証跡を保持したまま、修正後の green evidence を追加する"
      : "不足している green evidence を追加する";
  switch (input.table) {
    case "test_runs":
      return {
        table: "test_runs",
        purpose: `${repairPrefix} test evidence template`,
        status_after_projection: "passed test_runs が同じ plan_id に追加される",
        required_fields: [
          "test_run_id",
          "session_id",
          "plan_id",
          "command",
          "runner",
          "runtime",
          "os",
          "shell",
          "scope",
          "started_at",
          "completed_at",
          "exit_code",
          "evidence_path",
          "output_digest",
          "green_definition_id",
          "status",
        ],
        example_row: {
          test_run_id: `test:${input.planId}:<timestamp>:passed`,
          session_id: "<session_id>",
          plan_id: input.planId,
          command: "<green command>",
          runner: "bun|vitest|shell",
          runtime: "test",
          os: "<os>",
          shell: "<shell>",
          scope: "unit|integration|acceptance",
          started_at: "<iso8601>",
          completed_at: "<iso8601>",
          exit_code: 0,
          evidence_path: `docs/evidence/${input.planId}-test.json`,
          output_digest: "sha256:<output>",
          green_definition_id: "<green_definition_id>",
          status: "passed",
        },
        required_action:
          "exit_code=0 かつ status=passed の test_runs を追加し、失敗 test を削除しない",
      };
    case "gate_runs":
      return {
        table: "gate_runs",
        purpose: `${repairPrefix} gate evidence template`,
        status_after_projection: "passed gate_runs が同じ plan_id に追加される",
        required_fields: ["gate_run_id", "gate_id", "plan_id", "status", "checked_at", "evidence_path"],
        example_row: {
          gate_run_id: `gate:${input.planId}:<gate_id>:<timestamp>`,
          gate_id: "<gate_id>",
          plan_id: input.planId,
          status: "passed",
          checked_at: "<iso8601>",
          evidence_path: `docs/evidence/${input.planId}-gate.json`,
        },
        required_action:
          "status=passed の gate_runs を追加し、失敗 gate を削除しない",
      };
    case "runtime_verification_events":
      return {
        table: "runtime_verification_events",
        purpose: `${repairPrefix} runtime verification template`,
        status_after_projection: "accepted runtime_verification_events が同じ plan_id に追加される",
        required_fields: [
          "event_id",
          "plan_id",
          "requirement_id",
          "test_oracle_id",
          "claim",
          "session_id",
          "source",
          "runtime_surface",
          "correlation_id",
          "evidence_path",
          "occurred_at",
          "redaction_policy",
          "verification_class",
          "accept_status",
        ],
        example_row: {
          event_id: `runtime:${input.planId}:<timestamp>`,
          plan_id: input.planId,
          requirement_id: "<requirement_id>",
          test_oracle_id: "<test_oracle_id>",
          claim: "<runtime verification claim>",
          session_id: "<session_id>",
          source: "helix recovery evidence",
          runtime_surface: "cli|vscode|operation",
          correlation_id: "<correlation_id>",
          evidence_path: `docs/evidence/${input.planId}-runtime.json`,
          occurred_at: "<iso8601>",
          redaction_policy: "none|redacted",
          verification_class: "runtime_verified",
          accept_status: "accepted",
        },
        required_action:
          "accept_status=accepted の runtime verification を追加し、運用後検証 scope へ接続する",
      };
    case "artifact_registry":
      return {
        table: "artifact_registry",
        purpose: "closure 対象 artifact を projection source として登録する",
        status_after_projection: "artifact path が同じ plan_id の closure evidence と join 可能になる",
        required_fields: [
          "artifact_id",
          "artifact_type",
          "path",
          "pair_artifact",
          "status",
          "updated_at",
        ],
        example_row: {
          artifact_id: `artifact:${input.planId}`,
          artifact_type: "markdown_doc",
          path: `docs/plans/${input.planId}.md`,
          pair_artifact: "",
          status: "current",
          updated_at: "<iso8601>",
        },
        required_action:
          "対象 PLAN または関連 artifact を artifact_registry に current として投影する",
      };
    default:
      return null;
  }
}

function closureGreenEvidenceArtifactTemplates(input: {
  action: ProjectClosureQueueNextAction;
  planId: string;
  sourcePath: string;
}): ProjectClosureGreenEvidenceArtifactTemplate[] {
  const evidencePath = `docs/evidence/${input.planId}-test.json`;
  const runtimeEvidencePath = `docs/evidence/${input.planId}-runtime.json`;
  const postcheck = closureEvidencePlanPostcheckCommands(input.action);
  return [
    {
      artifact_kind: "plan_review_evidence",
      artifact_path: input.sourcePath,
      projection_target_tables: ["review_evidence_registry", "test_runs"],
      template_format: "yaml_frontmatter",
      write_policy: "template_only",
      required_fields: [
        "review_evidence[].reviewer",
        "review_evidence[].review_kind",
        "review_evidence[].verdict",
        "review_evidence[].tests_green_at",
        "review_evidence[].green_commands[].command",
        "review_evidence[].green_commands[].exit_code",
        "review_evidence[].green_commands[].evidence_path",
        "review_evidence[].green_commands[].output_digest",
      ],
      example: {
        review_evidence: [
          {
            reviewer: "<reviewer>",
            review_kind: "intra_runtime_subagent",
            reviewed_at: "<iso8601>",
            tests_green_at: "<iso8601>",
            verdict: "approve",
            scope: "closure-repair",
            worker_model: "<worker_model>",
            reviewer_model: "<reviewer_model>",
            green_commands: [
              {
                kind: "unit_test",
                command: "<green command>",
                runner: "bun",
                scope: "fast|targeted",
                exit_code: 0,
                completed_at: "<iso8601>",
                evidence_path: evidencePath,
                output_digest: "sha256:<output>",
              },
            ],
          },
        ],
      },
      required_action:
        "PLAN frontmatter の review_evidence.green_commands に exit_code=0 の green command を追記し、失敗 evidence は削除しない",
      reasons: [
        `plan=${input.planId}`,
        "projection_writer は review_evidence.green_commands を test_runs へ投影する",
        `postcheck=${postcheck.join(" && ")}`,
      ],
    },
    {
      artifact_kind: "structured_test_evidence",
      artifact_path: evidencePath,
      projection_target_tables: ["test_cases", "test_results", "test_artifact_edges"],
      template_format: "json",
      write_policy: "template_only",
      required_fields: [
        "plan_id",
        "recorded_at",
        "cases[].name",
        "cases[].status",
        "cases[].oracle_id",
      ],
      example: {
        plan_id: input.planId,
        recorded_at: "<iso8601>",
        cases: [
          {
            name: "<test case name>",
            status: "passed",
            oracle_id: "<oracle_id>",
            duration_ms: 0,
            artifact_path: input.sourcePath,
          },
        ],
      },
      required_action:
        "green_commands[].evidence_path が指す structured test evidence を追加し、test case 粒度の検証証跡へ展開する",
      reasons: [
        `plan=${input.planId}`,
        "structured evidence は green command evidence_path から読み込まれる",
        `postcheck=${postcheck.join(" && ")}`,
      ],
    },
    {
      artifact_kind: "runtime_verification_evidence",
      artifact_path: runtimeEvidencePath,
      projection_target_tables: ["runtime_verification_events"],
      template_format: "json",
      write_policy: "template_only",
      required_fields: [
        "event_id",
        "plan_id",
        "claim",
        "runtime_surface",
        "occurred_at",
        "verification_class",
        "accept_status",
      ],
      example: {
        event_id: `runtime:${input.planId}:<timestamp>`,
        plan_id: input.planId,
        requirement_id: "<requirement_id>",
        test_oracle_id: "<test_oracle_id>",
        claim: "<runtime verification claim>",
        session_id: "<session_id>",
        source: "helix closure repair",
        runtime_surface: "cli",
        correlation_id: "<correlation_id>",
        evidence_path: runtimeEvidencePath,
        occurred_at: "<iso8601>",
        redaction_policy: "none",
        verification_class: "runtime_verified",
        accept_status: "accepted",
      },
      required_action:
        "運用後 scope の検証が必要な場合に accepted runtime verification evidence として追加する",
      reasons: [
        `plan=${input.planId}`,
        "operation scope / runtime verification を L12 右腕側の証跡として保持する",
        `postcheck=${postcheck.join(" && ")}`,
      ],
    },
  ];
}

function closureGreenEvidencePatchPlan(input: {
  action: ProjectClosureQueueNextAction;
  planId: string;
  templates: ProjectClosureGreenEvidenceArtifactTemplate[];
}): ProjectClosureGreenEvidencePatchPlan {
  const patchCandidates = input.templates.map((template): ProjectClosureGreenEvidencePatchCandidate => {
    const previewLines = closureGreenEvidencePatchPreviewLines(template);
    const unresolvedPlaceholders = closureEvidencePatchPlaceholders(previewLines);
    return {
      artifact_kind: template.artifact_kind,
      artifact_path: template.artifact_path,
      operation:
        template.template_format === "yaml_frontmatter"
          ? "append_yaml_frontmatter"
          : "create_json_artifact",
      template_format: template.template_format,
      projection_target_tables: [...template.projection_target_tables],
      preview_digest: digestLines(previewLines),
      preview_lines: previewLines,
      unresolved_placeholders: unresolvedPlaceholders,
      placeholder_count: unresolvedPlaceholders.length,
      real_evidence_required: unresolvedPlaceholders.length > 0,
      required_action: template.required_action,
    };
  });
  return {
    approval_required: true,
    write_policy: "approval-required",
    dry_run_command: `helix closure batch --action ${input.action} --json`,
    execute_command: null,
    patch_candidates: patchCandidates,
    postcheck_commands: closureEvidencePlanPostcheckCommands(input.action),
    safety_policy:
      "template-only dry-run。実ファイルへ書く場合は approval record と git diff review を別途要求する",
    reasons: [
      `plan=${input.planId}`,
      `action=${input.action}`,
      `patch_candidates=${patchCandidates.length}`,
    ],
  };
}

function closureGreenEvidencePatchPreviewLines(
  template: ProjectClosureGreenEvidenceArtifactTemplate,
): string[] {
  if (template.artifact_kind === "plan_review_evidence") {
    return [
      "review_evidence:",
      "  - reviewer: <reviewer>",
      "    review_kind: intra_runtime_subagent",
      '    reviewed_at: "<iso8601>"',
      '    tests_green_at: "<iso8601>"',
      "    verdict: approve",
      "    scope: closure-repair",
      "    green_commands:",
      "      - kind: unit_test",
      '        command: "<green command>"',
      "        runner: bun",
      "        scope: fast|targeted",
      "        exit_code: 0",
      '        completed_at: "<iso8601>"',
      `        evidence_path: ${String(
        (template.example.review_evidence as Array<{ green_commands?: Array<{ evidence_path?: string }> }> | undefined)?.[0]
          ?.green_commands?.[0]?.evidence_path ?? "<evidence_path>",
      )}`,
      '        output_digest: "sha256:<output>"',
    ];
  }
  return JSON.stringify(template.example, null, 2).split("\n");
}

function closureEvidenceRowTemplatesForItem(
  item: ProjectClosureQueueItem,
): ProjectClosureEvidenceRowTemplate[] {
  return unique(item.evidenceGaps.flatMap((gap) => gap.evidenceTables))
    .map((table) =>
      closureEvidenceRowTemplate({
        table,
        planId: item.planId,
        action: item.nextAction,
      }),
    )
    .filter((template): template is ProjectClosureEvidenceRowTemplate => template !== null);
}

export function buildProjectClosureEvidencePlan(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
  } = {},
): ProjectClosureEvidencePlan {
  const selectedAction = input.action ?? defaultClosureEvidencePlanAction(snapshot);
  const allItems = selectedAction
    ? snapshot.closure.queue.items.filter((item) => item.nextAction === selectedAction)
    : [];
  const limit = Math.max(0, input.limit ?? 20);
  const listedItems = allItems.slice(0, limit);
  const postcheckCommands = selectedAction
    ? closureEvidencePlanPostcheckCommands(selectedAction)
    : ["helix current-location --json"];

  return {
    schema_version: "project-closure-evidence-plan.v1",
    source_clock: snapshot.source_clock,
    selected_action: selectedAction,
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    total: allItems.length,
    listed: listedItems.length,
    omitted: Math.max(0, allItems.length - listedItems.length),
    limit,
    evidence_gap_counts: summarizeClosureEvidenceGaps(allItems),
    target_tables: unique(
      allItems.flatMap((item) => item.evidenceGaps.flatMap((gap) => gap.evidenceTables)),
    ),
    items: listedItems.map((item) => ({
      plan_id: item.planId,
      source_path: item.sourcePath,
      next_action: item.nextAction,
      remediation_status: item.remediationStatus,
      evidence_status: item.evidence.status,
      evidence_action: item.evidenceAction,
      target_tables: unique(item.evidenceGaps.flatMap((gap) => gap.evidenceTables)),
      evidence_gaps: item.evidenceGaps.map((gap) => ({
        component: gap.component,
        status: gap.status,
        evidenceTables: [...gap.evidenceTables],
        requiredAction: gap.requiredAction,
      })),
      repair_targets: (item.evidence.failedEvidence ?? []).map((target) => ({
        component: target.component,
        id: target.id,
        status: target.status,
        command: target.command,
        evidencePath: target.evidencePath,
        outputDigest: target.outputDigest,
        observedAt: target.observedAt,
        requiredAction: target.requiredAction,
      })),
      evidence_templates: closureEvidenceRowTemplatesForItem(item).map((template) => ({
        table: template.table,
        purpose: template.purpose,
        status_after_projection: template.status_after_projection,
        required_fields: [...template.required_fields],
        example_row: { ...template.example_row },
        required_action: template.required_action,
      })),
      expected_transition: closurePacketExpectedTransition(item.nextAction),
      required_action: item.requiredAction,
      doc_dependencies: [...item.docDependencies],
      implementation_dependencies: [...item.implementationDependencies],
      postcheck_commands: closureEvidencePlanPostcheckCommands(item.nextAction),
      reasons: [...item.reasons],
    })),
    acceptance_criteria: selectedAction
      ? closureEvidencePlanAcceptanceCriteria(selectedAction)
      : ["closure queue に evidence plan 対象が存在しない"],
    postcheck_commands: postcheckCommands,
    expected_transition: selectedAction ? closurePacketExpectedTransition(selectedAction) : null,
    write_policy: "read-only",
    source_command: "helix closure evidence-plan --json",
    view_command: "helix progress tree-view --json",
    findings: snapshot.findings,
  };
}

function closureEvidencePatchRollbackNote(
  candidate: ProjectClosureGreenEvidencePatchCandidate,
): string {
  if (candidate.operation === "append_yaml_frontmatter") {
    return "承認適用後に戻す場合は、追加した review_evidence entry だけを削除し、harness.db rebuild と current-location を再実行する";
  }
  return "承認適用後に戻す場合は、新規作成した evidence artifact を削除し、harness.db rebuild と current-location を再実行する";
}

function closureEvidencePatchPlaceholders(lines: string[]): string[] {
  return unique(
    lines.flatMap((line) =>
      [...line.matchAll(/<[^>\n]+>/g)].map((match) => match[0]),
    ),
  );
}

function buildClosureEvidencePatchApprovalDigest(input: {
  action: ProjectClosureQueueNextAction | null;
  candidates: ProjectClosureEvidencePatchPacketCandidate[];
}): string {
  const digestPayload = {
    action: input.action,
    candidates: input.candidates
      .map((candidate) => ({
        artifact_kind: candidate.artifact_kind,
        artifact_path: candidate.artifact_path,
        operation: candidate.operation,
        plan_id: candidate.plan_id,
        preview_digest: candidate.preview_digest,
        projection_target_tables: [...candidate.projection_target_tables].sort(),
        source_path: candidate.source_path,
      }))
      .sort((a, b) => {
        return (
          a.plan_id.localeCompare(b.plan_id) ||
          a.artifact_path.localeCompare(b.artifact_path) ||
          a.operation.localeCompare(b.operation)
        );
      }),
  };
  return `sha256:${createHash("sha256").update(JSON.stringify(digestPayload)).digest("hex")}`;
}

export function buildProjectClosureEvidencePatchPacket(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
  } = {},
): ProjectClosureEvidencePatchPacket {
  const selectedAction = input.action ?? defaultClosureEvidencePlanAction(snapshot);
  const batch = buildProjectClosureBatchReport(snapshot, {
    action: selectedAction ?? undefined,
    limit: input.limit,
  });
  const patchCandidates = batch.work_buckets.flatMap((bucket) =>
    bucket.repair_plan.projection_items.flatMap((item) =>
      item.evidence_patch_plan.patch_candidates.map((candidate, index): ProjectClosureEvidencePatchPacketCandidate => {
        return {
          candidate_id: `${item.plan_id}:${candidate.artifact_kind}:${index + 1}`,
          plan_id: item.plan_id,
          source_path: item.source_path,
          artifact_kind: candidate.artifact_kind,
          artifact_path: candidate.artifact_path,
          operation: candidate.operation,
          template_format: candidate.template_format,
          projection_target_tables: [...candidate.projection_target_tables],
          preview_digest: candidate.preview_digest,
          preview_lines: [...candidate.preview_lines],
          unresolved_placeholders: [...candidate.unresolved_placeholders],
          placeholder_count: candidate.placeholder_count,
          real_evidence_required: candidate.real_evidence_required,
          required_action: candidate.required_action,
          postcheck_commands: [...item.evidence_patch_plan.postcheck_commands],
          rollback_note: closureEvidencePatchRollbackNote(candidate),
          reasons: [
            `bucket=${bucket.bucket_id}`,
            `action=${bucket.action}`,
            `repair_status=${bucket.repair_plan.status}`,
            ...item.reasons,
          ],
        };
      }),
    ),
  );
  const placeholderCount = patchCandidates.reduce(
    (sum, candidate) => sum + candidate.placeholder_count,
    0,
  );
  const blockedCandidateCount = patchCandidates.filter(
    (candidate) => candidate.placeholder_count > 0,
  ).length;
  const approvalScopeDigest = buildClosureEvidencePatchApprovalDigest({
    action: selectedAction,
    candidates: patchCandidates,
  });
  const postcheckCommands = selectedAction
    ? closureEvidencePlanPostcheckCommands(selectedAction)
    : ["helix current-location --json"];

  return {
    schema_version: "project-closure-evidence-patch-packet.v1",
    source_clock: snapshot.source_clock,
    selected_action: selectedAction,
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    queue_total: batch.total,
    queue_listed: batch.listed,
    queue_omitted: batch.omitted,
    limit: batch.limit,
    patch_candidate_count: patchCandidates.length,
    patch_candidates: patchCandidates,
    apply_readiness: {
      status:
        patchCandidates.length === 0
          ? "no_candidates"
          : placeholderCount > 0
            ? "blocked_placeholders"
            : "ready_for_approval",
      allowed_to_apply: false,
      placeholder_count: placeholderCount,
      blocked_candidate_count: blockedCandidateCount,
      required_action:
        placeholderCount > 0
          ? "placeholder を含む template は証跡として適用しない。実行済み green command / accepted runtime evidence の実値で置換してから approval packet を再生成する"
          : "approval_scope_digest を含む approval record を確認してから別 apply surface で扱う",
      execute_command: null,
    },
    approval: {
      required: true,
      decision_id: `closure-evidence-patch:${selectedAction ?? "none"}`,
      approval_scope_digest: approvalScopeDigest,
      allowed_outcomes: [
        "approve_evidence_patch",
        "reject_evidence_patch",
        "request_targeted_command_resolution",
      ],
      required_record_fields: [
        `decision_id: closure-evidence-patch:${selectedAction ?? "none"}`,
        "outcome: <approve_evidence_patch | reject_evidence_patch | request_targeted_command_resolution>",
        `approval_scope_digest: ${approvalScopeDigest}`,
        "reviewed_candidate_count: <number>",
        "reason: <日本語で判断理由>",
      ],
    },
    safety_policy: {
      packet_write_policy: "read-only",
      patch_write_policy: "approval-required",
      execute_command: null,
      dry_run_command: selectedAction
        ? `helix closure evidence-patch --action ${selectedAction} --json`
        : "helix closure evidence-patch --json",
      safeguards: [
        "failed evidence は削除せず、passed/accepted evidence を追加投影する",
        "この packet は候補と digest の提示のみで、PLAN や evidence artifact を変更しない",
        "preview_lines に placeholder が残る candidate は実証跡ではないため apply 不可とする",
        "適用時は approval record、git diff review、harness.db rebuild、current-location 再計算を必須にする",
      ],
    },
    postcheck_commands: postcheckCommands,
    write_policy: "read-only",
    source_command: "helix closure evidence-patch --json",
    view_command: "helix progress tree-view --json",
    findings: snapshot.findings,
  };
}

function buildClosureEvidenceProbeCommand(
  batch: ProjectClosureBatchReport,
): {
  command: string | null;
  source: string | null;
  confidence: string | null;
  canExecute: boolean;
  projectionBinding: ProjectClosureBatchCommandProjectionBinding | null;
} {
  const bucket = batch.work_buckets[0] ?? null;
  if (bucket === null) {
    return {
      command: null,
      source: null,
      confidence: null,
      canExecute: false,
      projectionBinding: null,
    };
  }
  const safeResolution = bucket.repair_plan.command_candidates
    .flatMap((candidate) => candidate.resolution_candidates)
    .find((candidate) => candidate.safe_to_run);
  if (safeResolution) {
    return {
      command: safeResolution.command,
      source: safeResolution.source,
      confidence: safeResolution.confidence,
      canExecute: true,
      projectionBinding: safeResolution.projection_binding,
    };
  }
  const runnable = bucket.repair_plan.command_candidates.find(
    (candidate) => candidate.runnable_command !== null,
  );
  if (runnable?.runnable_command) {
    return {
      command: runnable.runnable_command,
      source: "classified_verb",
      confidence: "medium",
      canExecute: true,
      projectionBinding: closureCommandProjectionBinding(batch.selected_action ?? "collect_evidence"),
    };
  }
  return {
    command: bucket.repair_plan.automation.primary_next_command,
    source: null,
    confidence: null,
    canExecute: false,
    projectionBinding: null,
  };
}

function closureEvidenceProbeApplyReadiness(input: {
  command: string | null;
  canExecute: boolean;
  dryRun: boolean;
  execution: ProjectClosureEvidenceProbeExecution | null;
}): ProjectClosureEvidenceProbePacket["apply_readiness"] {
  if (input.command === null || !input.canExecute) {
    return {
      status: "command_not_available",
      allowed_to_materialize: false,
      required_action: "safe_to_run な green command resolution を確定してから probe を実行する",
    };
  }
  if (input.dryRun) {
    return {
      status: "dry_run",
      allowed_to_materialize: false,
      required_action: "probe --execute で green command の exit_code と output_digest を取得する",
    };
  }
  if (input.execution?.status !== "passed") {
    return {
      status: "command_failed",
      allowed_to_materialize: false,
      required_action: "command failure を修正し、exit_code=0 の probe を取り直す",
    };
  }
  return {
    status: "needs_artifact_values",
    allowed_to_materialize: false,
    required_action:
      "output_digest と completed_at は取得済み。reviewer / requirement_id / oracle_id / claim 等の artifact 固有値を補完して evidence-patch packet を再生成する",
  };
}

export function buildProjectClosureEvidenceProbePacket(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
    dryRun?: boolean;
    execution?: ProjectClosureEvidenceProbeExecution | null;
  } = {},
): ProjectClosureEvidenceProbePacket {
  const selectedAction = input.action ?? defaultClosureEvidencePlanAction(snapshot);
  const batch = buildProjectClosureBatchReport(snapshot, {
    action: selectedAction ?? undefined,
    limit: input.limit,
  });
  const command = buildClosureEvidenceProbeCommand(batch);
  const targetPlanIds = unique(
    batch.work_buckets.flatMap((bucket) =>
      bucket.repair_plan.projection_items.map((item) => item.plan_id),
    ),
  );
  const execution = input.execution ?? null;
  const dryRun = input.dryRun ?? execution === null;
  const fillablePlaceholders =
    execution?.status === "passed"
      ? [
          "<green command>",
          "<iso8601>",
          "<oracle_id>",
          "<output>",
          "<reviewer>",
          "<requirement_id>",
          "<runtime verification claim>",
          "<test case name>",
          "<test_oracle_id>",
          "<timestamp>",
        ]
      : [];
  const remainingPlaceholders =
    execution?.status === "passed"
      ? [
          ...(execution.session_id ? [] : ["<session_id>"]),
          ...(execution.correlation_id ? [] : ["<correlation_id>"]),
        ]
      : ["<green command>", "<iso8601>", "<output>"];

  return {
    schema_version: "project-closure-evidence-probe.v1",
    source_clock: snapshot.source_clock,
    selected_action: selectedAction,
    dry_run: dryRun,
    command: command.command,
    can_execute: command.canExecute,
    command_source: command.source,
    confidence: command.confidence,
    target_plan_ids: targetPlanIds,
    projection_binding: command.projectionBinding,
    execution,
      placeholder_resolution: {
        fillable_placeholders: fillablePlaceholders,
        remaining_placeholders: remainingPlaceholders,
        required_action:
          execution?.status === "passed"
            ? remainingPlaceholders.length === 0
              ? "probe result と deterministic closure rule で command/completed_at/output_digest/reviewer/oracle/claim/runtime provenance を実値化できる"
              : "probe result と deterministic closure rule で command/completed_at/output_digest/reviewer/oracle/claim を実値化し、runtime provenance 固有値だけを別途補完する"
            : "safe command を実行して command/completed_at/output_digest を取得する",
      },
    apply_readiness: closureEvidenceProbeApplyReadiness({
      command: command.command,
      canExecute: command.canExecute,
      dryRun,
      execution,
    }),
    postcheck_commands: selectedAction
      ? closureEvidencePlanPostcheckCommands(selectedAction)
      : ["helix current-location --json"],
    write_policy: "read-only",
    source_command: "helix closure evidence-probe --json",
    view_command: "helix progress tree-view --json",
    findings: snapshot.findings,
  };
}

function evidenceValueDigest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function escapeDoubleQuotedEvidenceValue(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function materializePreviewLines(
  candidate: ProjectClosureEvidencePatchPacketCandidate,
  action: ProjectClosureQueueNextAction | null,
  execution: ProjectClosureEvidenceProbeExecution,
): {
  lines: string[];
  filledPlaceholders: string[];
  resolutionSources: ProjectClosureEvidenceMaterializeCandidate["placeholder_resolution_sources"];
} {
  const digestValue = execution.output_digest.replace(/^sha256:/i, "");
  const oracleId = `oracle:${candidate.plan_id}:${action ?? "closure"}:${candidate.artifact_kind}`;
  const testCaseName = `closure evidence probe passed: ${execution.command}`;
  const runtimeClaim = `closure evidence probe passed for ${candidate.plan_id} with ${execution.command}`;
  const replacements: Array<{
    placeholder: string;
    value: string;
    source: "probe_execution" | "deterministic_closure_rule";
  }> = [
    {
      placeholder: "<green command>",
      value: escapeDoubleQuotedEvidenceValue(execution.command),
      source: "probe_execution",
    },
    { placeholder: "<iso8601>", value: execution.completed_at, source: "probe_execution" },
    { placeholder: "<output>", value: digestValue, source: "probe_execution" },
    { placeholder: "<timestamp>", value: execution.completed_at, source: "probe_execution" },
    ...(execution.session_id
      ? [
          {
            placeholder: "<session_id>",
            value: escapeDoubleQuotedEvidenceValue(execution.session_id),
            source: "probe_execution" as const,
          },
        ]
      : []),
    ...(execution.correlation_id
      ? [
          {
            placeholder: "<correlation_id>",
            value: escapeDoubleQuotedEvidenceValue(execution.correlation_id),
            source: "probe_execution" as const,
          },
        ]
      : []),
    {
      placeholder: "<reviewer>",
      value: "codex-intra-runtime",
      source: "deterministic_closure_rule",
    },
    {
      placeholder: "<oracle_id>",
      value: escapeDoubleQuotedEvidenceValue(oracleId),
      source: "deterministic_closure_rule",
    },
    {
      placeholder: "<test case name>",
      value: escapeDoubleQuotedEvidenceValue(testCaseName),
      source: "deterministic_closure_rule",
    },
    {
      placeholder: "<requirement_id>",
      value: candidate.plan_id,
      source: "deterministic_closure_rule",
    },
    {
      placeholder: "<test_oracle_id>",
      value: escapeDoubleQuotedEvidenceValue(oracleId),
      source: "deterministic_closure_rule",
    },
    {
      placeholder: "<runtime verification claim>",
      value: escapeDoubleQuotedEvidenceValue(runtimeClaim),
      source: "deterministic_closure_rule",
    },
  ];
  const filled = new Map<
    string,
    { placeholder: string; source: "probe_execution" | "deterministic_closure_rule"; value_digest: string }
  >();
  const materialized = candidate.preview_lines.map((line) => {
    let next = line;
    for (const { placeholder, value, source } of replacements) {
      if (next.includes(placeholder)) {
        filled.set(placeholder, {
          placeholder,
          source,
          value_digest: evidenceValueDigest(value),
        });
        next = next.split(placeholder).join(value);
      }
    }
    return next;
  });
  const resolutionSources = [...filled.values()].sort((a, b) =>
    a.placeholder.localeCompare(b.placeholder),
  );
  return {
    lines: materialized,
    filledPlaceholders: resolutionSources.map((source) => source.placeholder),
    resolutionSources,
  };
}

function materializeApprovalDigest(input: {
  action: ProjectClosureQueueNextAction | null;
  candidates: ProjectClosureEvidenceMaterializeCandidate[];
  execution: ProjectClosureEvidenceProbeExecution | null;
}): string {
  const payload = {
    action: input.action,
    execution: input.execution
      ? {
          command: input.execution.command,
          session_id: input.execution.session_id ?? null,
          correlation_id: input.execution.correlation_id ?? null,
          completed_at: input.execution.completed_at,
          exit_code: input.execution.exit_code,
          output_digest: input.execution.output_digest,
          status: input.execution.status,
        }
      : null,
    candidates: input.candidates.map((candidate) => ({
      candidate_id: candidate.candidate_id,
      digest: candidate.materialized_preview_digest,
      resolution_sources: candidate.placeholder_resolution_sources.map((source) => ({
        placeholder: source.placeholder,
        source: source.source,
        value_digest: source.value_digest,
      })),
      remaining_placeholders: [...candidate.remaining_placeholders].sort(),
    })),
  };
  return `sha256:${createHash("sha256").update(JSON.stringify(payload)).digest("hex")}`;
}

export function buildProjectClosureEvidenceMaterializePacket(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
    probeExecution?: ProjectClosureEvidenceProbeExecution | null;
  } = {},
): ProjectClosureEvidenceMaterializePacket {
  const selectedAction = input.action ?? defaultClosureEvidencePlanAction(snapshot);
  const patchPacket = buildProjectClosureEvidencePatchPacket(snapshot, {
    action: selectedAction ?? undefined,
    limit: input.limit,
  });
  const execution = input.probeExecution ?? null;
  const materializedCandidates =
    execution?.status === "passed"
      ? patchPacket.patch_candidates.map((candidate): ProjectClosureEvidenceMaterializeCandidate => {
          const materialized = materializePreviewLines(candidate, selectedAction, execution);
          const remaining = closureEvidencePatchPlaceholders(materialized.lines);
          return {
            candidate_id: candidate.candidate_id,
            plan_id: candidate.plan_id,
            artifact_path: candidate.artifact_path,
            operation: candidate.operation,
            projection_target_tables: [...candidate.projection_target_tables],
            materialized_preview_digest: digestLines(materialized.lines),
            materialized_preview_lines: materialized.lines,
            filled_placeholders: materialized.filledPlaceholders,
            placeholder_resolution_sources: materialized.resolutionSources,
            remaining_placeholders: remaining,
            remaining_placeholder_count: remaining.length,
            ready_for_approval: remaining.length === 0,
            required_action:
              remaining.length === 0
                ? "materialized preview を approval scope に含め、別 apply surface で扱う"
                : "残る runtime provenance placeholder を実値で補完してから approval packet を再生成する",
          };
        })
      : [];
  const remainingPlaceholderCount = materializedCandidates.reduce(
    (sum, candidate) => sum + candidate.remaining_placeholder_count,
    0,
  );
  const blockedCandidateCount = materializedCandidates.filter(
    (candidate) => !candidate.ready_for_approval,
  ).length;
  const readinessStatus: ProjectClosureEvidenceMaterializePacket["materialize_readiness"]["status"] =
    execution === null
      ? "no_probe_execution"
      : execution.status !== "passed"
        ? "probe_not_green"
        : remainingPlaceholderCount > 0
          ? "blocked_placeholders"
          : "ready_for_approval";
  const approvalScopeDigest = materializeApprovalDigest({
    action: selectedAction,
    candidates: materializedCandidates,
    execution,
  });

  return {
    schema_version: "project-closure-evidence-materialize.v1",
    source_clock: snapshot.source_clock,
    selected_action: selectedAction,
    probe_execution: execution,
    queue_total: patchPacket.queue_total,
    queue_listed: patchPacket.queue_listed,
    queue_omitted: patchPacket.queue_omitted,
    materialized_candidate_count: materializedCandidates.length,
    materialized_candidates: materializedCandidates,
    materialize_readiness: {
      status: readinessStatus,
      allowed_to_apply: false,
      remaining_placeholder_count: remainingPlaceholderCount,
      blocked_candidate_count: blockedCandidateCount,
      required_action:
        readinessStatus === "no_probe_execution"
          ? "closure evidence-probe --execute の JSON を --probe-record に渡して materialize preview を生成する"
          : readinessStatus === "probe_not_green"
            ? "green command が passed になるまで修正し、probe を取り直す"
            : readinessStatus === "blocked_placeholders"
              ? "session_id / correlation_id など実 runtime provenance を実値化してから approval packet を再生成する"
              : "approval_scope_digest を確認し、別 apply surface で扱う",
      execute_command: null,
    },
    approval: {
      required: true,
      decision_id: `closure-evidence-materialize:${selectedAction ?? "none"}`,
      approval_scope_digest: approvalScopeDigest,
      required_record_fields: [
        `decision_id: closure-evidence-materialize:${selectedAction ?? "none"}`,
        "outcome: <approve_materialized_evidence | reject_materialized_evidence>",
        `approval_scope_digest: ${approvalScopeDigest}`,
        "reason: <日本語で判断理由>",
      ],
    },
    postcheck_commands: patchPacket.postcheck_commands,
    write_policy: "read-only",
    source_command: "helix closure evidence-materialize --json",
    view_command: "helix progress tree-view --json",
    findings: snapshot.findings,
  };
}

export function buildProjectClosureEvidenceApprovalDraftPacket(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
    probeExecution?: ProjectClosureEvidenceProbeExecution | null;
  } = {},
): ProjectClosureEvidenceApprovalDraftPacket {
  const materialize = buildProjectClosureEvidenceMaterializePacket(snapshot, {
    action: input.action,
    limit: input.limit,
    probeExecution: input.probeExecution ?? null,
  });
  const approvalRecordTemplate = [
    `decision_id: ${materialize.approval.decision_id}`,
    "outcome: pending_human_review",
    `approval_scope_digest: ${materialize.approval.approval_scope_digest}`,
    "reviewed_candidate_count: " + String(materialize.materialized_candidate_count),
    "reason: <日本語で判断理由>",
  ];

  return {
    schema_version: "project-closure-evidence-approval-draft.v1",
    source_clock: snapshot.source_clock,
    selected_action: materialize.selected_action,
    plan_only: true,
    must_not_apply: true,
    approval_allowed: false,
    apply_authorized: false,
    materialize_readiness: materialize.materialize_readiness,
    materialized_candidate_count: materialize.materialized_candidate_count,
    approval: {
      required: true,
      decision_id: materialize.approval.decision_id,
      approval_scope_digest: materialize.approval.approval_scope_digest,
      draft_outcome: "pending_human_review",
      allowed_outcomes: ["approve_materialized_evidence", "reject_materialized_evidence"],
      non_authorizing: true,
      required_action:
        materialize.materialize_readiness.status === "ready_for_approval"
          ? "materialized candidate と approval_scope_digest を確認し、人間判断後に outcome を approve_materialized_evidence または reject_materialized_evidence へ変更する"
          : "materialize_readiness が ready_for_approval になるまで probe/materialize をやり直す",
    },
    candidate_digests: materialize.materialized_candidates.map((candidate) => ({
      candidate_id: candidate.candidate_id,
      plan_id: candidate.plan_id,
      artifact_path: candidate.artifact_path,
      operation: candidate.operation,
      materialized_preview_digest: candidate.materialized_preview_digest,
      ready_for_approval: candidate.ready_for_approval,
    })),
    approval_record_template: approvalRecordTemplate,
    approval_record_text: approvalRecordTemplate.join("\n"),
    postcheck_commands: materialize.postcheck_commands,
    write_policy: "read-only",
    source_command: "helix closure evidence-approval-draft --json",
    view_command: "helix progress tree-view --json",
    findings: snapshot.findings,
  };
}

function parseMaterializedEvidenceApprovalRecord(input: {
  text: string | null;
  expectedDecisionId: string;
  expectedApprovalScopeDigest: string;
}): {
  valid: boolean;
  decisionId: string | null;
  outcome: string | null;
  approvalScopeDigest: string | null;
  reasons: string[];
} {
  if (input.text === null || input.text.trim().length === 0) {
    return {
      valid: false,
      decisionId: null,
      outcome: null,
      approvalScopeDigest: null,
      reasons: ["approval record が指定されていない"],
    };
  }
  const decisionId = /^decision_id:\s*(.+)$/m.exec(input.text)?.[1]?.trim() ?? null;
  const outcome = /^outcome:\s*(.+)$/m.exec(input.text)?.[1]?.trim() ?? null;
  const approvalScopeDigest =
    /^approval_scope_digest:\s*(.+)$/m.exec(input.text)?.[1]?.trim() ?? null;
  const reasons: string[] = [];
  if (decisionId !== input.expectedDecisionId) {
    reasons.push(`decision_id が ${input.expectedDecisionId} ではない`);
  }
  if (outcome !== "approve_materialized_evidence") {
    reasons.push("outcome が approve_materialized_evidence ではない");
  }
  if (approvalScopeDigest === null) {
    reasons.push("approval_scope_digest が指定されていない");
  } else if (approvalScopeDigest !== input.expectedApprovalScopeDigest) {
    reasons.push("approval_scope_digest が materialize approval scope と一致しない");
  }
  return {
    valid: reasons.length === 0,
    decisionId,
    outcome,
    approvalScopeDigest,
    reasons,
  };
}

export function buildProjectClosureEvidenceApplyPlan(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
    probeExecution?: ProjectClosureEvidenceProbeExecution | null;
    approvalRecordPath?: string | null;
    approvalRecordText?: string | null;
  } = {},
): ProjectClosureEvidenceApplyPlan {
  const materialize = buildProjectClosureEvidenceMaterializePacket(snapshot, {
    action: input.action,
    limit: input.limit,
    probeExecution: input.probeExecution ?? null,
  });
  const approval = parseMaterializedEvidenceApprovalRecord({
    text: input.approvalRecordText ?? null,
    expectedDecisionId: materialize.approval.decision_id,
    expectedApprovalScopeDigest: materialize.approval.approval_scope_digest,
  });
  const blockedReasons = [
    ...(materialize.materialize_readiness.status === "ready_for_approval"
      ? []
      : [`materialize_readiness が ready_for_approval ではない: ${materialize.materialize_readiness.status}`]),
    ...(materialize.materialized_candidate_count > 0 ? [] : ["materialized candidate が 0 件"]),
    ...(approval.valid ? [] : approval.reasons),
  ];

  return {
    schema_version: "project-closure-evidence-apply-plan.v1",
    source_clock: snapshot.source_clock,
    dry_run: true,
    selected_action: materialize.selected_action,
    materialize_readiness: materialize.materialize_readiness,
    approval: {
      required: true,
      record_path: input.approvalRecordPath ?? null,
      valid: approval.valid,
      decision_id: approval.decisionId,
      outcome: approval.outcome,
      approval_scope_digest: approval.approvalScopeDigest,
      reasons: approval.reasons,
    },
    allowed_to_apply: blockedReasons.length === 0,
    blocked_reasons: blockedReasons,
    patch_candidates: materialize.materialized_candidates.map((candidate) => ({
      candidate_id: candidate.candidate_id,
      plan_id: candidate.plan_id,
      artifact_path: candidate.artifact_path,
      operation: candidate.operation,
      materialized_preview_digest: candidate.materialized_preview_digest,
      materialized_preview_lines: [...candidate.materialized_preview_lines],
      expected_effect:
        candidate.operation === "append_yaml_frontmatter"
          ? "PLAN frontmatter に materialized review_evidence を追記し、test_runs projection source にする"
          : "materialized evidence artifact を作成し、DB projection source にする",
      rollback_note:
        candidate.operation === "append_yaml_frontmatter"
          ? "追加した review_evidence block だけを削除し、harness.db rebuild と current-location を再実行する"
          : "作成した evidence artifact を削除し、harness.db rebuild と current-location を再実行する",
    })),
    postcheck_commands: materialize.postcheck_commands,
    write_policy: "read-only",
    source_command: "helix closure evidence-apply --dry-run --json",
    view_command: "helix progress tree-view --json",
  };
}

function artifactRemapDriveModel(item: ProjectArtifactRemap): ProjectDriveModel {
  if (item.status === "done") return "Forward";
  if (item.l12Layer === "L12") return "Recovery";
  return "Reverse";
}

function artifactRemapRequiredAction(item: ProjectArtifactRemap): string {
  if (item.status === "done") {
    return "再投影済み。Forward 継続時の参照根拠として使う";
  }
  if (item.status === "missing") {
    return "ZIP coverage に対応する typed declaration または PLAN evidence を追加する";
  }
  if (item.kind === "plan" && item.legacyLayer === "L7") {
    return "closure batch で evidence を照合し、必要なら設計/テスト設計依存へ戻して閉じる";
  }
  if (item.l12Layer === "L12") {
    return "L12 運用テスト/ログ/KPI/runtime evidence と照合して再検証する";
  }
  return "対象 artifact を設計/テスト設計依存へ戻し、ZIP coverage と evidence を再照合する";
}

function artifactRemapDocDependencies(item: ProjectArtifactRemap): string[] {
  if (item.sourcePath && item.sourcePath !== "docs/plans") return [item.sourcePath];
  if (item.kind === "plan" && item.artifactId) return [`docs/plans/${item.artifactId}.md`];
  return ["docs/design/**", "docs/test-design/**"];
}

function artifactRemapImplementationDependencies(item: ProjectArtifactRemap): string[] {
  const deps = ["artifact_remap", "design_declarations"];
  if (item.kind === "plan") deps.push("plan_registry", "test_runs", "gate_runs");
  if (item.status !== "done") deps.push("trace_edges", "runtime_verification_events");
  return unique(deps);
}

function buildProjectArtifactRemapBatchItem(
  item: ProjectArtifactRemap,
  closureByPlanId: Map<string, ProjectClosureQueueItem>,
): ProjectArtifactRemapBatchItem {
  const closureItem = item.kind === "plan" ? (closureByPlanId.get(item.artifactId) ?? null) : null;
  return {
    kind: item.kind,
    artifactId: item.artifactId,
    sourcePath: item.sourcePath,
    legacyLayer: item.legacyLayer,
    l12Layer: item.l12Layer,
    coverageId: item.coverageId,
    coverageLabel: item.coverageLabel,
    zipSourceBindingIds: [...(item.zipSourceBindingIds ?? [])],
    tailoringRuleIds: [...(item.tailoringRuleIds ?? [])],
    tailoringDetailLevels: [...(item.tailoringDetailLevels ?? [])],
    status: item.status,
    driveModel: artifactRemapDriveModel(item),
    requiredAction: artifactRemapRequiredAction(item),
    docDependencies: artifactRemapDocDependencies(item),
    implementationDependencies: artifactRemapImplementationDependencies(item),
    closureLink: closureItem
      ? {
          planId: closureItem.planId,
          nextAction: closureItem.nextAction,
          evidenceStatus: closureItem.evidence.status,
          remediationStatus: closureItem.remediationStatus,
          batchCommand: `helix closure batch --action ${closureItem.nextAction} --json`,
          reviewCommand: `helix closure review-bundle --action ${closureItem.nextAction} --summary-json`,
          transitionCommand: `helix closure transition-plan --action ${closureItem.nextAction} --json`,
          priority: closureItem.priority,
        }
      : null,
    reasons: [...item.reasons],
  };
}

function artifactRemapBatchRecommendedAction(
  items: ProjectArtifactRemapBatchItem[],
): ProjectArtifactRemapBatchReport["recommended_next_action"] {
  if (items.some((item) => item.driveModel === "Recovery")) {
    return {
      model: "Recovery",
      command: "helix artifact-remap batch --status reverify --layer L12 --json",
      human_required: false,
      reason: "L12 運用/復旧系の再検証 artifact が含まれる",
    };
  }
  const closureLinked = items.find((item) => item.closureLink !== null);
  if (closureLinked?.closureLink) {
    return {
      model: "Reverse",
      command: closureLinked.closureLink.batchCommand,
      human_required: false,
      reason: "L7/L6 再検証 artifact は closure queue の nextAction に接続済み",
    };
  }
  if (items.some((item) => item.status === "reverify")) {
    return {
      model: "Reverse",
      command: "helix artifact-remap batch --status reverify --json",
      human_required: false,
      reason: "再検証 artifact は設計/テスト設計依存へ戻して閉じる",
    };
  }
  if (items.some((item) => item.status === "missing")) {
    return {
      model: "Reverse",
      command: "helix artifact-remap batch --status missing --json",
      human_required: false,
      reason: "不足 artifact は ZIP coverage 対応 declaration/evidence の追加が必要",
    };
  }
  return {
    model: "Forward",
    command: "helix current-location --json",
    human_required: false,
    reason: "対象 artifact は再投影済み",
  };
}

export function buildProjectArtifactRemapBatchReport(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    layer?: string | null;
    status?: ProjectArtifactRemapStatus | null;
    limit?: number;
  } = {},
): ProjectArtifactRemapBatchReport {
  const selectedLayer = input.layer ?? null;
  const selectedStatus = input.status ?? null;
  const limit = Math.max(0, input.limit ?? 20);
  const filtered = snapshot.artifact_remap.items.filter(
    (item) =>
      (selectedLayer === null || item.l12Layer === selectedLayer) &&
      (selectedStatus === null || item.status === selectedStatus),
  );
  const closureByPlanId = new Map(
    snapshot.closure.queue.items.map((item) => [item.planId, item] as const),
  );
  const allBatchItems = filtered.map((item) =>
    buildProjectArtifactRemapBatchItem(item, closureByPlanId),
  );
  const items = allBatchItems.slice(0, limit);

  return {
    schema_version: "project-artifact-remap-batch.v1",
    source_clock: snapshot.source_clock,
    selected_layer: selectedLayer,
    selected_status: selectedStatus,
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    layers: summarizeArtifactRemapLayers(filtered),
    items,
    total: filtered.length,
    listed: items.length,
    omitted: Math.max(0, filtered.length - items.length),
    limit,
    counts: {
      done: filtered.filter((item) => item.status === "done").length,
      missing: filtered.filter((item) => item.status === "missing").length,
      reverify: filtered.filter((item) => item.status === "reverify").length,
    },
    recommended_next_action: artifactRemapBatchRecommendedAction(allBatchItems),
    write_policy: "read-only",
    source_command: "helix artifact-remap batch --json",
    view_command: "helix progress tree-view --json",
  };
}

export function buildProjectClosureOverview(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    limit?: number;
  } = {},
): ProjectClosureOverview {
  const limit = Math.max(0, input.limit ?? 5);
  const closeReadyCount = snapshot.closure.queue.route_counts.close_ready;
  const closeReadyReviewWindowCommand = `helix closure review-bundle --action close_ready --limit ${limit} --offset 0 --summary-json`;
  const closeReadyTransitionWindowCommand = `helix closure transition-plan --action close_ready --limit ${limit} --offset 0 --summary-json`;
  const closeReadyDecisionDraftCommand = `helix closure decision-draft --action close_ready --limit ${limit} --offset 0 --out .helix/tmp/closure/close_ready-decision-draft.yml --summary-json`;
  const closeReadyApplyDryRunCommand = `helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit ${limit} --json`;
  const closeReadyApplyExecuteCommand = `helix closure apply --execute --approval-record <approved-approval-record-path> --limit ${limit} --json`;
  const actions = PROJECT_CLOSURE_QUEUE_ACTIONS.map((action) => {
    const batch = buildProjectClosureBatchReport(snapshot, { action, limit });
    return {
      action,
      count: batch.total,
      listed: batch.listed,
      omitted: batch.omitted,
      batch_id: batch.packet?.automation.batchId ?? null,
      ledger_status: batch.ledger?.status ?? null,
      human_required: batch.ledger?.humanRequired ?? false,
      evidence_policy: batch.ledger?.evidencePolicy ?? null,
      review_command: `helix closure review-bundle --action ${action} --summary-json`,
      transition_command: `helix closure transition-plan --action ${action} --json`,
      sample_plan_ids: batch.queue_items.map((item) => item.planId),
      required_action: batch.packet?.requiredAction ?? null,
      promotion_gate: batch.packet?.automation.promotionGate ?? null,
    };
  });
  const recommendedAction = defaultClosureEvidencePlanAction(snapshot);
  const recommended = recommendedAction
    ? (actions.find((action) => action.action === recommendedAction && action.count > 0) ?? null)
    : null;

  return {
    schema_version: "project-closure-overview.v1",
    source_clock: snapshot.source_clock,
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    closure: {
      status: snapshot.closure.status,
      open_l7: snapshot.closure.l7_open_plan_ids.length,
      l14_claims: snapshot.closure.terminal_l14_plan_ids.length,
      closure_evidence: snapshot.closure.closure_evidence_ids.length,
      remediation: {
        done: snapshot.closure.remediation.done,
        missing: snapshot.closure.remediation.missing,
        reverify: snapshot.closure.remediation.reverify,
      },
      queue_total: snapshot.closure.queue.total,
      route_counts: snapshot.closure.queue.route_counts,
      ledger_status_counts: snapshot.closure.next_action_ledger.status_counts,
      apply_readiness: {
        close_ready_count: closeReadyCount,
        approval_required: closeReadyCount > 0,
        status: closeReadyCount > 0 ? "approval_required" : "no_close_ready_candidates",
        dry_run_command: closeReadyApplyDryRunCommand,
        execute_command: closeReadyApplyExecuteCommand,
        review_bundle_command: "helix closure review-bundle --action close_ready --summary-json",
        transition_plan_command: "helix closure transition-plan --action close_ready --summary-json",
        review_window_command: closeReadyReviewWindowCommand,
        transition_window_command: closeReadyTransitionWindowCommand,
        decision_draft_command: closeReadyDecisionDraftCommand,
        write_policy: "approval-required",
      },
    },
    actions,
    recommended_next_action: recommended
      ? {
          action: recommended.action,
          reason:
            recommended.action === "close_ready"
              ? "ready queue が存在するため、人間レビュー後に closure claim へ進める"
              : (recommended.required_action ?? "closure queue の次 action を処理する"),
          command: recommended.review_command,
          human_required: recommended.human_required,
        }
      : {
          action: null,
          reason: "closure queue に処理対象がない",
          command: "helix current-location --json",
          human_required: false,
        },
    findings: snapshot.findings,
    write_policy: "read-only",
    source_command: "helix closure overview --json",
    view_command: "helix progress tree-view --json",
  };
}

function closureReviewAllowedOutcomes(action: ProjectClosureQueueNextAction): string[] {
  if (action === "close_ready") {
    return [
      "approve_closure_claim",
      "reject_to_collect_evidence",
      "reject_to_repair_failed_evidence",
      "reject_to_reverse_design",
    ];
  }
  return ["keep_current_queue", "move_after_evidence_change", "return_to_reverse_design"];
}

function closureReviewRequiredEvidence(action: ProjectClosureQueueNextAction): string[] {
  if (action === "close_ready") {
    return [
      "対象 PLAN の artifact path が DB projection に存在する",
      "対象 PLAN の test/gate/runtime evidence のいずれかが passed/accepted である",
      "L7 closure oracle と L12 claim の矛盾を増やさない",
      "承認前に close 対象 PLAN ID と evidence path を記録する",
    ];
  }
  return [
    "対象 batch の不足 evidence または failed evidence を記録する",
    "再分類後の nextAction が DB projection で変化する",
  ];
}

function closureReviewApprovalTemplate(input: {
  action: ProjectClosureQueueNextAction;
  packet: ProjectClosurePacket | null;
  listed: number;
  omitted: number;
  approvalScopeDigest: string;
  coverageIds: string[];
  l12Layers: string[];
}): string[] {
  return [
    `decision_id: closure-review:${input.action}`,
    "outcome: <approve_closure_claim | reject_to_collect_evidence | reject_to_repair_failed_evidence | reject_to_reverse_design>",
    `packet_id: ${input.packet?.packetId ?? "none"}`,
    `batch_id: ${input.packet?.automation.batchId ?? "none"}`,
    `approval_scope_digest: ${input.approvalScopeDigest}`,
    `coverage_ids: ${input.coverageIds.join(",") || "none"}`,
    `l12_layers: ${input.l12Layers.join(",") || "none"}`,
    `reviewed_count: ${input.listed}`,
    `omitted_count: ${input.omitted}`,
    "evidence_basis: <DB projection paths / green command digest / runtime verification>",
    "reason: <日本語で判断理由>",
  ];
}

function buildClosureReviewScope(input: {
  action: ProjectClosureQueueNextAction;
  candidates: ProjectClosureQueueItem[];
  blockedByFindings: string[];
}): ProjectClosureReviewBundle["review_scope"] {
  const planIds = input.candidates.map((candidate) => candidate.planId);
  const sourcePaths = input.candidates.map((candidate) => candidate.sourcePath);
  const coverageIds = unique(
    input.candidates
      .map((candidate) => candidate.coverageId)
      .filter((coverageId): coverageId is string => coverageId !== null),
  );
  const l12Layers = unique(input.candidates.map((candidate) => candidate.l12Layer));
  const evidenceTotals = input.candidates.reduce(
    (totals, candidate) => {
      totals.artifact_paths += candidate.evidence.artifactPaths.length;
      totals.evidence_paths += candidate.evidence.evidencePaths.length;
      totals.trace_edges += candidate.evidence.traceEdges;
      totals.test_runs_total += candidate.evidence.testRuns.total;
      totals.test_runs_passed += candidate.evidence.testRuns.passed;
      totals.gate_runs_total += candidate.evidence.gateRuns.total;
      totals.gate_runs_passed += candidate.evidence.gateRuns.passed;
      totals.runtime_verification_total += candidate.evidence.runtimeVerification.total;
      totals.runtime_verification_accepted += candidate.evidence.runtimeVerification.accepted;
      return totals;
    },
    {
      artifact_paths: 0,
      evidence_paths: 0,
      trace_edges: 0,
      test_runs_total: 0,
      test_runs_passed: 0,
      gate_runs_total: 0,
      gate_runs_passed: 0,
      runtime_verification_total: 0,
      runtime_verification_accepted: 0,
    },
  );
  const digestPayload = {
    action: input.action,
    blocked_by_findings: [...input.blockedByFindings].sort(),
    evidence_totals: evidenceTotals,
    coverage_ids: [...coverageIds].sort(),
    l12_layers: [...l12Layers].sort(),
    plan_ids: [...planIds].sort(),
    source_paths: [...sourcePaths].sort(),
  };
  return {
    approval_scope_digest: `sha256:${createHash("sha256")
      .update(JSON.stringify(digestPayload))
      .digest("hex")}`,
    plan_ids: planIds,
    source_paths: sourcePaths,
    coverage_ids: coverageIds,
    l12_layers: l12Layers,
    evidence_totals: evidenceTotals,
    blocked_by_findings: [...input.blockedByFindings],
  };
}

export function buildProjectClosureReviewBundle(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
    offset?: number;
  } = {},
): ProjectClosureReviewBundle {
  const action = input.action ?? "close_ready";
  const batch = buildProjectClosureBatchReport(snapshot, {
    action,
    limit: input.limit,
    offset: input.offset,
  });
  const blockedByFindings =
    action === "close_ready"
      ? snapshot.findings
          .filter(
            (finding) => finding.severity === "error" && finding.code !== "l14_claim_with_l7_work",
          )
          .map((finding) => finding.code)
      : [];
  const reviewScope = buildClosureReviewScope({
    action,
    candidates: batch.queue_items,
    blockedByFindings,
  });

  return {
    schema_version: "project-closure-review-bundle.v1",
    source_clock: snapshot.source_clock,
    action,
    approval_required: action === "close_ready",
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    packet: batch.packet,
    ledger: batch.ledger,
    candidates: batch.queue_items,
    total: batch.total,
    listed: batch.listed,
    omitted: batch.omitted,
    limit: batch.limit,
    offset: batch.offset,
    window: batch.window,
    review_scope: reviewScope,
    decision: {
      decision_id: `closure-review:${action}`,
      allowed_outcomes: closureReviewAllowedOutcomes(action),
      outcome_routes: closureReviewAllowedOutcomes(action).map((outcome) =>
        closureDecisionOutcomeRoute({
          decisionOutcome: outcome,
          action,
          driveRoute: snapshot.drive_route,
          candidates: batch.queue_items,
        }),
      ),
      required_evidence: closureReviewRequiredEvidence(action),
      approval_record_template: closureReviewApprovalTemplate({
        action,
        packet: batch.packet,
        listed: batch.listed,
        omitted: batch.omitted,
        approvalScopeDigest: reviewScope.approval_scope_digest,
        coverageIds: reviewScope.coverage_ids,
        l12Layers: reviewScope.l12_layers,
      }),
      blocked_by_findings: blockedByFindings,
    },
    safeguards: [
      "note: review bundle は読み取り専用であり、PLAN status や harness.db を変更しない",
      "note: close_ready の昇格は人間承認と既存 gate/承認経路の後でのみ行う",
      "note: rejected candidate は collect_evidence / repair_failed_evidence / reverse_design のいずれかへ再分類する",
    ],
    write_policy: "read-only",
    source_command: "helix closure review-bundle --json",
    view_command: "helix progress tree-view --json",
  };
}

export function buildProjectClosureDecisionDraftPacket(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    limit?: number;
    offset?: number;
  } = {},
): ProjectClosureDecisionDraftPacket {
  const bundle = buildProjectClosureReviewBundle(snapshot, input);
  const approvalRecordTemplate = [
    `decision_id: ${bundle.decision.decision_id}`,
    "outcome: pending_human_review",
    `approval_scope_digest: ${bundle.review_scope.approval_scope_digest}`,
    `coverage_ids: ${bundle.review_scope.coverage_ids.join(",") || "none"}`,
    `l12_layers: ${bundle.review_scope.l12_layers.join(",") || "none"}`,
    `reviewed_count: ${bundle.listed}`,
    `omitted_count: ${bundle.omitted}`,
    `allowed_outcomes: ${bundle.decision.allowed_outcomes.join(",")}`,
    "evidence_basis: <DB projection paths / green command digest / runtime verification>",
    "reason: <日本語で判断理由>",
  ];
  return {
    schema_version: "project-closure-decision-draft.v1",
    source_clock: snapshot.source_clock,
    action: bundle.action,
    plan_only: true,
    must_not_apply: true,
    approval_allowed: false,
    apply_authorized: false,
    review: {
      total: bundle.total,
      listed: bundle.listed,
      omitted: bundle.omitted,
      limit: bundle.limit,
      offset: bundle.offset,
      window: { ...bundle.window },
    },
    decision: {
      decision_id: bundle.decision.decision_id,
      approval_scope_digest: bundle.review_scope.approval_scope_digest,
      draft_outcome: "pending_human_review",
      allowed_outcomes: [...bundle.decision.allowed_outcomes],
      outcome_routes: bundle.decision.outcome_routes.map((route) => ({
        ...route,
        doc_dependencies: [...route.doc_dependencies],
        implementation_dependencies: [...route.implementation_dependencies],
        postcheck_commands: [...route.postcheck_commands],
        reasons: [...route.reasons],
      })),
      non_authorizing: true,
      required_action:
        bundle.total === 0
          ? "review candidate が無いため decision record を承認 record として使わない"
          : "review candidate と approval_scope_digest を確認し、人間判断後に outcome を allowed_outcomes のいずれかへ変更する",
    },
    candidate_digests: bundle.candidates.map((candidate) => ({
      plan_id: candidate.planId,
      source_path: candidate.sourcePath,
      l12_layer: candidate.l12Layer,
      coverage_id: candidate.coverageId,
      coverage_label: candidate.coverageLabel,
      evidence_status: candidate.evidence.status,
      ready_for_approval: candidate.nextAction === "close_ready" && candidate.evidence.status === "ready",
    })),
    approval_record_template: approvalRecordTemplate,
    approval_record_text: approvalRecordTemplate.join("\n"),
    postcheck_commands:
      bundle.action === "close_ready"
        ? [
            "helix closure transition-plan --action close_ready --decision <outcome> --summary-json",
            `helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit ${bundle.listed} --json`,
            "helix current-location --json",
            "helix vmodel fit --json",
          ]
        : closureEvidencePlanPostcheckCommands(bundle.action),
    write_policy: "read-only",
    source_command: "helix closure decision-draft --json",
    view_command: "helix progress tree-view --json",
    findings: snapshot.findings,
  };
}

function closureTransitionBlockedReasons(input: {
  decisionOutcome: string;
  bundle: ProjectClosureReviewBundle;
}): string[] {
  const reasons: string[] = [];
  if (input.decisionOutcome !== "approve_closure_claim") {
    reasons.push("decision_outcome が approve_closure_claim ではない");
  }
  if (input.bundle.action !== "close_ready") {
    reasons.push("close_ready 以外は closure apply 対象ではなく再分類対象");
  }
  if (input.bundle.decision.blocked_by_findings.length > 0) {
    reasons.push(
      `blocker finding が残っている: ${input.bundle.decision.blocked_by_findings.join(",")}`,
    );
  }
  if (input.bundle.candidates.length === 0) {
    reasons.push("対象 candidate が 0 件");
  }
  return reasons;
}

function closureDecisionOutcomeRoute(input: {
  decisionOutcome: string;
  action: ProjectClosureQueueNextAction;
  driveRoute: ProjectDriveRouteDecision;
  candidates: ProjectClosureQueueItem[];
}): ProjectClosureOutcomeRoute {
  const commonDocDependencies = unique(
    input.candidates.flatMap((candidate) => candidate.docDependencies),
  );
  const commonImplementationDependencies = unique(
    input.candidates.flatMap((candidate) => candidate.implementationDependencies),
  );
  if (input.action !== "close_ready") {
    const targetAction = input.action;
    const driveModel: ProjectDriveModel = targetAction === "reverse_design" ? "Reverse" : "Recovery";
    return {
      outcome: input.decisionOutcome,
      projection_type: "reroute_closure_lane",
      target_action: targetAction,
      drive_model: driveModel,
      human_required: false,
      command:
        targetAction === "collect_evidence" || targetAction === "repair_failed_evidence"
          ? closureEvidenceProbeCommand(targetAction)
          : `helix closure evidence-plan --action ${targetAction} --json`,
      transition_command: `helix closure review-bundle --action ${targetAction} --summary-json`,
      expected_transition: closurePacketExpectedTransition(targetAction),
      required_action: closurePacketRequiredAction(targetAction),
      doc_dependencies: commonDocDependencies,
      implementation_dependencies: commonImplementationDependencies,
      postcheck_commands: closureEvidencePlanPostcheckCommands(targetAction),
      reasons: [
        `${targetAction} は closure apply 対象ではなく、同一 lane の evidence / reverse 処理を継続する`,
        `drive_model=${driveModel}`,
      ],
    };
  }

  if (input.decisionOutcome === "approve_closure_claim") {
    const candidateLimit = input.candidates.length;
    return {
      outcome: input.decisionOutcome,
      projection_type: "apply_closure",
      target_action: "accepted",
      drive_model: "Recovery",
      human_required: true,
      command: `helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit ${candidateLimit} --json`,
      transition_command: `helix closure apply --execute --approval-record <approved-approval-record-path> --limit ${candidateLimit} --json`,
      expected_transition: "承認済み close_ready candidate を accepted 化し、open L7 queue から除外する",
      required_action:
        "approval_scope_digest に一致する approval record を用意し、closure apply dry-run を確認してから execute する",
      doc_dependencies: commonDocDependencies,
      implementation_dependencies: commonImplementationDependencies,
      postcheck_commands: [
        "helix db rebuild",
        "helix current-location --json",
        "helix closure batch --action close_ready --json",
        "helix vmodel fit --json",
      ],
      reasons: [
        "approve_closure_claim は close_ready lane の terminal closure 承認として扱う",
        "人間承認 record が無い apply は fail-close する",
      ],
    };
  }

  const targetAction =
    input.decisionOutcome === "reject_to_collect_evidence"
      ? "collect_evidence"
      : input.decisionOutcome === "reject_to_repair_failed_evidence"
        ? "repair_failed_evidence"
        : input.decisionOutcome === "reject_to_reverse_design"
          ? "reverse_design"
          : null;
  if (targetAction === null) {
    return {
      outcome: input.decisionOutcome,
      projection_type: "unsupported_outcome",
      target_action: null,
      drive_model: input.driveRoute.selectedModel,
      human_required: true,
      command: "helix closure review-bundle --action close_ready --summary-json",
      transition_command: "helix closure transition-plan --action close_ready --summary-json",
      expected_transition: "未対応 outcome のため current-location は変更しない",
      required_action: "allowed_outcomes に含まれる outcome を指定する",
      doc_dependencies: commonDocDependencies,
      implementation_dependencies: commonImplementationDependencies,
      postcheck_commands: ["helix current-location --json"],
      reasons: [`unsupported decision_outcome=${input.decisionOutcome}`],
    };
  }

  const driveModel: ProjectDriveModel = targetAction === "reverse_design" ? "Reverse" : "Recovery";
  const evidenceChain = recoveryEvidenceCommandChain(targetAction);
  const command =
    targetAction === "collect_evidence" || targetAction === "repair_failed_evidence"
      ? (evidenceChain.evidence_probe_command ?? `helix closure batch --action ${targetAction} --json`)
      : `helix closure evidence-plan --action ${targetAction} --json`;
  return {
    outcome: input.decisionOutcome,
    projection_type: "reroute_closure_lane",
    target_action: targetAction,
    drive_model: driveModel,
    human_required: true,
    command,
    transition_command: `helix closure review-bundle --action ${targetAction} --summary-json`,
    expected_transition: closurePacketExpectedTransition(targetAction),
    required_action: closurePacketRequiredAction(targetAction),
    doc_dependencies:
      targetAction === "reverse_design"
        ? unique([
            ...commonDocDependencies,
            "docs/design/**",
            "docs/test-design/**",
          ])
        : commonDocDependencies,
    implementation_dependencies: commonImplementationDependencies,
    postcheck_commands: closureEvidencePlanPostcheckCommands(targetAction),
    reasons: [
      `${input.decisionOutcome} は close_ready claim を閉じず ${targetAction} lane へ戻す`,
      `drive_model=${driveModel}`,
      "approval_scope_digest と reviewed target PLAN IDs を rejection record に残す",
    ],
  };
}

function closureTransitionOutcomeProjection(input: {
  decisionOutcome: string;
  bundle: ProjectClosureReviewBundle;
}): ProjectClosureOutcomeRoute {
  return closureDecisionOutcomeRoute({
    decisionOutcome: input.decisionOutcome,
    action: input.bundle.action,
    driveRoute: input.bundle.drive_route,
    candidates: input.bundle.candidates,
  });
}

function closureTransitionPlannedSteps(input: {
  targetPlanIds: string[];
  outcomeProjection: ProjectClosureOutcomeRoute;
  approvalEvidence: string[];
  planStatusEvidence: string[];
}): ProjectClosureTransitionPlan["planned_steps"] {
  const target = input.targetPlanIds.join(",") || "-";
  if (input.outcomeProjection.projection_type === "reroute_closure_lane") {
    return [
      {
        step_id: "record-rejection",
        target: "closure decision record",
        operation: "却下 outcome と reroute basis を記録する",
        expected_effect: "close_ready claim を閉じず、戻し先 lane の判断根拠が追跡可能になる",
        evidence_required: input.approvalEvidence,
      },
      {
        step_id: "reroute-closure-lane",
        target,
        operation: `${input.outcomeProjection.target_action} lane へ再分類する patch / evidence plan を作る`,
        expected_effect: input.outcomeProjection.expected_transition,
        evidence_required: [
          "rejection outcome",
          "reviewed target PLAN IDs",
          ...input.outcomeProjection.doc_dependencies,
        ],
      },
      {
        step_id: "rebuild-projection",
        target: "harness.db",
        operation: "projection を再構築し current-location を再計算する",
        expected_effect: "closure queue / next-action ledger / artifact remap が戻し先 lane を反映する",
        evidence_required: ["helix db rebuild", "helix current-location --json"],
      },
      {
        step_id: "postcheck-drive-model",
        target: "project-current-location",
        operation: `${input.outcomeProjection.drive_model} と戻し先 queue を再評価する`,
        expected_effect: "設計/テスト設計依存または evidence lane の次 command が選択される",
        evidence_required: input.outcomeProjection.postcheck_commands,
      },
    ];
  }
  return [
    {
      step_id: "record-approval",
      target: "closure decision record",
      operation: "承認 outcome と evidence basis を記録する",
      expected_effect: "close_ready batch の人間承認根拠が追跡可能になる",
      evidence_required: input.approvalEvidence,
    },
    {
      step_id: "patch-plan-status",
      target,
      operation: "対象 PLAN の closure status を terminal 扱いへ更新する patch を作る",
      expected_effect: "open L7 queue から承認済み candidate が除外される",
      evidence_required: input.planStatusEvidence,
    },
    {
      step_id: "rebuild-projection",
      target: "harness.db",
      operation: "projection を再構築し current-location を再計算する",
      expected_effect: "closure queue / next-action ledger / artifact remap が更新される",
      evidence_required: ["helix db rebuild", "helix current-location --json"],
    },
    {
      step_id: "postcheck-drive-model",
      target: "project-current-location",
      operation: "L14/L7 矛盾と remaining queue を再評価する",
      expected_effect:
        "残件に応じて Forward / Reverse / collect_evidence / repair_failed_evidence が再選択される",
      evidence_required: ["helix current-location", "helix closure batch --json"],
    },
  ];
}

export function buildProjectClosureTransitionPlan(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    action?: ProjectClosureQueueNextAction;
    decisionOutcome?: string;
    limit?: number;
    offset?: number;
  } = {},
): ProjectClosureTransitionPlan {
  const action = input.action ?? "close_ready";
  const decisionOutcome = input.decisionOutcome ?? "approve_closure_claim";
  const bundle = buildProjectClosureReviewBundle(snapshot, {
    action,
    limit: input.limit,
    offset: input.offset,
  });
  const targetPlanIds = bundle.candidates.map((candidate) => candidate.planId);
  const blockedReasons = closureTransitionBlockedReasons({
    decisionOutcome,
    bundle,
  });
  const outcomeProjection = closureTransitionOutcomeProjection({
    decisionOutcome,
    bundle,
  });
  const approvalEvidence = [
    "closure review-bundle の decision_id",
    "reviewed target PLAN IDs",
    "承認 outcome と判断理由",
  ];
  const planStatusEvidence = [
    "対象 PLAN の artifact path",
    "対象 PLAN の passed test/gate/runtime evidence",
    "L7 closure oracle",
  ];

  return {
    schema_version: "project-closure-transition-plan.v1",
    source_clock: snapshot.source_clock,
    action,
    decision_outcome: decisionOutcome,
    dry_run: true,
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    target_plan_ids: targetPlanIds,
    total: bundle.total,
    listed: bundle.listed,
    omitted: bundle.omitted,
    limit: bundle.limit,
    offset: bundle.offset,
    window: bundle.window,
    approval_scope_digest: bundle.review_scope.approval_scope_digest,
    allowed_to_apply: blockedReasons.length === 0,
    blocked_reasons: blockedReasons,
    outcome_projection: outcomeProjection,
    planned_steps: closureTransitionPlannedSteps({
      targetPlanIds,
      outcomeProjection,
      approvalEvidence,
      planStatusEvidence,
    }),
    postcheck_commands: outcomeProjection.postcheck_commands,
    rollback_notes: [
      "note: dry-run はファイルも DB も変更しないため rollback 不要",
      "note: apply 実装時は対象 PLAN patch と承認記録を別 commit に分け、git diff で戻せる形にする",
    ],
    write_policy: "read-only",
    source_command: "helix closure transition-plan --summary-json",
    view_command: "helix progress tree-view --json",
  };
}

function parseApprovalRecord(
  text: string | null,
  expectedApprovalScopeDigest: string,
): {
  valid: boolean;
  decisionId: string | null;
  outcome: string | null;
  approvalScopeDigest: string | null;
  reasons: string[];
} {
  if (text === null || text.trim().length === 0) {
    return {
      valid: false,
      decisionId: null,
      outcome: null,
      approvalScopeDigest: null,
      reasons: ["approval record が指定されていない"],
    };
  }
  const decisionId = /^decision_id:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const outcome = /^outcome:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const approvalScopeDigest = /^approval_scope_digest:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const reasons: string[] = [];
  if (decisionId !== "closure-review:close_ready") {
    reasons.push("decision_id が closure-review:close_ready ではない");
  }
  if (outcome !== "approve_closure_claim") {
    reasons.push("outcome が approve_closure_claim ではない");
  }
  if (approvalScopeDigest === null) {
    reasons.push("approval_scope_digest が指定されていない");
  } else if (approvalScopeDigest !== expectedApprovalScopeDigest) {
    reasons.push("approval_scope_digest が current review scope と一致しない");
  }
  return {
    valid: reasons.length === 0,
    decisionId,
    outcome,
    approvalScopeDigest,
    reasons,
  };
}

export function buildProjectClosureApplyPlan(
  snapshot: ProjectCurrentLocationSnapshot,
  input: {
    approvalRecordPath?: string | null;
    approvalRecordText?: string | null;
    limit?: number;
  } = {},
): ProjectClosureApplyPlan {
  const limit = Math.max(0, input.limit ?? 20);
  const transition = buildProjectClosureTransitionPlan(snapshot, {
    action: "close_ready",
    decisionOutcome: "approve_closure_claim",
    limit,
  });
  const approval = parseApprovalRecord(
    input.approvalRecordText ?? null,
    transition.approval_scope_digest,
  );
  const blockedReasons = [
    ...transition.blocked_reasons,
    ...(approval.valid ? [] : approval.reasons),
  ];
  const closeReadyItems = snapshot.closure.queue.items
    .filter((item) => item.nextAction === "close_ready")
    .slice(0, limit);
  const sourceCommand = input.approvalRecordPath
    ? `helix closure apply --dry-run --approval-record ${input.approvalRecordPath} --limit ${limit} --json`
    : `helix closure apply --dry-run --limit ${limit} --json`;

  return {
    schema_version: "project-closure-apply-plan.v1",
    source_clock: snapshot.source_clock,
    dry_run: true,
    action: "close_ready",
    approval: {
      required: true,
      record_path: input.approvalRecordPath ?? null,
      valid: approval.valid,
      decision_id: approval.decisionId,
      outcome: approval.outcome,
      approval_scope_digest: approval.approvalScopeDigest,
      reasons: approval.reasons,
    },
    allowed_to_apply: blockedReasons.length === 0,
    blocked_reasons: blockedReasons,
    patch_candidates: closeReadyItems.map((item) => ({
      plan_id: item.planId,
      source_path: item.sourcePath,
      current_status: item.status,
      next_status: "accepted",
      operation: "frontmatter_status_update",
      expected_effect:
        "status を accepted にすることで ACTIVE_STATUSES から外し、L7 open queue から除外する",
      evidence_summary: {
        artifact_paths: [...item.evidence.artifactPaths],
        evidence_paths: [...item.evidence.evidencePaths],
        test_runs: { ...item.evidence.testRuns },
        gate_runs: { ...item.evidence.gateRuns },
        runtime_verification: { ...item.evidence.runtimeVerification },
      },
    })),
    postcheck_commands: [
      "helix db rebuild",
      "helix current-location",
      "helix closure batch --action close_ready --json",
      "helix doctor",
    ],
    write_policy: "read-only",
    source_command: sourceCommand,
    view_command: "helix progress tree-view --json",
  };
}

function closureNextActionLedgerStatus(
  action: ProjectClosureQueueNextAction,
): ProjectClosureNextActionLedgerStatus {
  switch (action) {
    case "close_ready":
      return "ready";
    case "collect_evidence":
      return "needs_evidence";
    case "repair_failed_evidence":
      return "needs_repair";
    case "reverse_design":
      return "needs_reverse";
  }
}

function closureNextActionEvidencePolicy(action: ProjectClosureQueueNextAction): string {
  switch (action) {
    case "close_ready":
      return "artifact + passed test/gate/runtime evidence を保持してから closure claim と照合する";
    case "collect_evidence":
      return "不足する green command / gate / runtime evidence を追加し、DB projection で再分類する";
    case "repair_failed_evidence":
      return "失敗 evidence を保持したまま修正後の passed evidence を追加し、再検証する";
    case "reverse_design":
      return "設計/テスト設計依存を先に補い、実装証跡の収集先を定義してからForwardへ戻す";
  }
}

function closureNextActionHumanRequired(action: ProjectClosureQueueNextAction): boolean {
  return action === "close_ready";
}

function buildClosureNextActionLedger(
  packets: ProjectClosurePacket[],
): ProjectClosureNextActionLedgerEntry[] {
  return packets.map((packet) => ({
    ledgerId: `next-action:${packet.packetId}`,
    packetId: packet.packetId,
    nextAction: packet.nextAction,
    status: closureNextActionLedgerStatus(packet.nextAction),
    driveModel: packet.driveModel,
    l12Layer: packet.l12Layer,
    count: packet.count,
    primaryCommand: "helix current-location --json",
    reviewSurface: "helix progress tree-view --json",
    writePolicy: "read-only",
    planIds: [...packet.planIds],
    samplePlanIds: packet.planIds.slice(0, 20),
    sourcePaths: [...packet.sourcePaths],
    requiredAction: packet.requiredAction,
    docDependencies: [...packet.docDependencies],
    implementationDependencies: [...packet.implementationDependencies],
    acceptanceCriteria: [...packet.acceptanceCriteria],
    evidencePolicy: closureNextActionEvidencePolicy(packet.nextAction),
    automation: packet.automation,
    humanRequired: closureNextActionHumanRequired(packet.nextAction),
    reasons: [
      ...packet.reasons,
      "note: next-action 台帳は読み取り専用の実行導線であり、状態変更そのものは既存 gate/承認経路で行う",
    ],
  }));
}

function closureNextActionLedgerStatusCounts(
  entries: ProjectClosureNextActionLedgerEntry[],
): ProjectClosureNextActionLedgerStatusCounts {
  return {
    ready: entries.filter((entry) => entry.status === "ready").length,
    needs_evidence: entries.filter((entry) => entry.status === "needs_evidence").length,
    needs_repair: entries.filter((entry) => entry.status === "needs_repair").length,
    needs_reverse: entries.filter((entry) => entry.status === "needs_reverse").length,
  };
}

function buildClosureQueue(
  db: HarnessDb,
  openL7Plans: PlanRegistryRow[],
): ProjectClosureQueueItem[] {
  return openL7Plans
    .map((plan): ProjectClosureQueueItem => {
      const priority = closureQueuePriority(plan);
      const sourcePath = `docs/plans/${plan.planId}.md`;
      const evidence = collectClosureEvidenceForPlan(db, plan);
      const nextAction = closureQueueNextAction(evidence);
      const evidenceGaps = closureEvidenceGaps(evidence);
      const coverageRule = designCoverageRuleForL12Layer("L6");
      return {
        planId: plan.planId,
        kind: plan.kind,
        status: plan.status,
        updatedAt: plan.updatedAt,
        sourcePath,
        l12Layer: "L6",
        coverageId: coverageRule?.coverageId ?? null,
        coverageLabel: coverageRule?.label ?? null,
        priority,
        driveModel: "Reverse",
        remediationStatus: "reverify",
        nextAction,
        requiredAction: closureQueueRequiredAction(plan),
        docDependencies: [sourcePath, "docs/design/**", "docs/test-design/**"],
        implementationDependencies: [
          "plan_registry",
          "design_declarations",
          "design_references",
          "artifact_registry",
          "trace_edges",
          "test_runs",
          "gate_runs",
          "runtime_verification_events",
        ],
        evidence,
        evidenceGaps,
        evidenceAction: closureEvidenceAction({ nextAction, gaps: evidenceGaps }),
        reasons: [
          "open L7 PLAN は L12 canonical では L6 実装相当の未閉鎖 queue item",
          "L14 claim と並存する場合は Reverse で設計/テスト設計へ戻して閉じる",
          evidence.status === "missing"
            ? "artifact/trace/test/gate/runtime evidence が DB から検出できない"
            : "artifact/trace/test/gate/runtime evidence の DB join 結果を保持している",
          closureQueueNextActionReason(nextAction),
        ],
      };
    })
    .sort((a, b) => {
      const byPriority = a.priority - b.priority;
      if (byPriority !== 0) return byPriority;
      return a.planId.localeCompare(b.planId);
    });
}

function buildClosureRemediation(input: {
  hasContradiction: boolean;
  openL7PlanIds: string[];
  terminalL14PlanIds: string[];
  closureEvidenceIds: string[];
}): ProjectClosureStatus["remediation"] {
  const items: ProjectClosureRemediation[] = [];
  const openL7PlanIds = unique(input.openL7PlanIds);
  if (openL7PlanIds.length > 0) {
    items.push({
      category: "l7_open_plan",
      label: "open L7 implementation/TDD work",
      status: "reverify",
      l12Layer: "L6",
      count: openL7PlanIds.length,
      subjectIds: openL7PlanIds,
      requiredAction:
        "各 L7 PLAN を設計/テスト設計依存へ戻し、実装・TDD closure・証跡の未閉鎖を解消する",
      docDependencies: ["docs/plans", "docs/design/**", "docs/test-design/**"],
      implementationDependencies: ["plan_registry"],
      reasons: ["open L7 PLAN は L12 canonical では L6 実装相当の再検証対象になる"],
    });
  }

  const closureEvidenceIds = unique(input.closureEvidenceIds);
  items.push({
    category: "closure_evidence",
    label: "L7 TDD/trace closure evidence",
    status: closureEvidenceIds.length > 0 ? "done" : "missing",
    l12Layer: "L7",
    count: closureEvidenceIds.length,
    subjectIds: closureEvidenceIds,
    requiredAction:
      closureEvidenceIds.length > 0
        ? "closure oracle を維持し、open L7 PLAN と実行証跡の照合に使う"
        : "L7 TDD closure / trace closure の typed declaration を追加する",
    docDependencies: ["docs/test-design/**"],
    implementationDependencies: ["design_declarations", "design_references"],
    reasons:
      closureEvidenceIds.length > 0
        ? ["L7 closure oracle は typed declaration として検出済み"]
        : ["L7 closure oracle が無いと L14 claim を閉じられない"],
  });

  const terminalL14PlanIds = unique(input.terminalL14PlanIds);
  if (terminalL14PlanIds.length > 0) {
    items.push({
      category: "l14_claim",
      label: "terminal L14 completion claims",
      status: input.hasContradiction ? "reverify" : "done",
      l12Layer: "L12",
      count: terminalL14PlanIds.length,
      subjectIds: terminalL14PlanIds,
      requiredAction: input.hasContradiction
        ? "L14 claim を L7 closure と L12 運用テスト evidence に再照合する"
        : "L14 claim を L12 運用テスト完了 evidence として保持する",
      docDependencies: ["docs/plans", "docs/test-design/**"],
      implementationDependencies: ["plan_registry", "runtime_verification_events"],
      reasons: input.hasContradiction
        ? ["L14 claim と open L7 PLAN が同時に存在するため完了 claim は再検証対象"]
        : ["open L7 PLAN と矛盾しない L14 claim"],
    });
  }

  const sorted = items.sort((a, b) => {
    const byStatus = artifactRemapStatusRank(a.status) - artifactRemapStatusRank(b.status);
    if (byStatus !== 0) return byStatus;
    const byLayer = layerRank(a.l12Layer) - layerRank(b.l12Layer);
    if (byLayer !== 0) return byLayer;
    return a.category.localeCompare(b.category);
  });

  return {
    items: sorted,
    done: sorted.filter((item) => item.status === "done").length,
    missing: sorted.filter((item) => item.status === "missing").length,
    reverify: sorted.filter((item) => item.status === "reverify").length,
  };
}

function artifactStatusFromPlanStatus(status: string): ProjectArtifactRemapStatus {
  const normalized = status.toLowerCase();
  if (TERMINAL_STATUSES.has(normalized)) return "done";
  return "reverify";
}

function artifactRemapStatusRank(status: ProjectArtifactRemapStatus): number {
  switch (status) {
    case "missing":
      return 0;
    case "reverify":
      return 1;
    case "done":
      return 2;
  }
}

function summarizeArtifactRemapLayers(
  items: ProjectArtifactRemap[],
): ProjectArtifactRemapLayerSummary[] {
  return L12_LAYERS.map((layer): ProjectArtifactRemapLayerSummary => {
    const layerItems = items.filter((item) => item.l12Layer === layer.layer);
    const done = layerItems.filter((item) => item.status === "done").length;
    const missing = layerItems.filter((item) => item.status === "missing").length;
    const reverify = layerItems.filter((item) => item.status === "reverify").length;
    const status: ProjectArtifactRemapStatus =
      missing > 0 || layerItems.length === 0 ? "missing" : reverify > 0 ? "reverify" : "done";
    const driveModel: ProjectDriveModel =
      status === "done" ? "Forward" : layer.layer === "L12" ? "Recovery" : "Reverse";
    const batchCommand =
      status === "done"
        ? `helix artifact-remap batch --layer ${layer.layer} --json`
        : `helix artifact-remap batch --status ${status} --layer ${layer.layer} --json`;
    const requiredAction =
      status === "done"
        ? "再投影済み。Forward 継続時の参照根拠として使う"
        : status === "reverify"
          ? "対象 artifact を設計/テスト設計依存へ戻し、ZIP coverage と evidence を再照合する"
          : "ZIP coverage に対応する typed declaration または PLAN evidence を追加する";
    const reasons =
      layerItems.length > 0
        ? unique(layerItems.flatMap((item) => item.reasons))
        : ["L12 canonical layer に再投影できる artifact が未検出"];

    return {
      layer: layer.layer,
      label: layer.label,
      status,
      driveModel,
      total: layerItems.length,
      done,
      missing,
      reverify,
      artifactIds: unique(layerItems.map((item) => item.artifactId)),
      batchCommand,
      requiredAction,
      reasons,
    };
  });
}

function buildArtifactRemap(input: {
  db: HarnessDb;
  coverage: ProjectCurrentLocationSnapshot["coverage"];
}): ProjectCurrentLocationSnapshot["artifact_remap"] {
  const items: ProjectArtifactRemap[] = [];

  for (const row of input.db
    .prepare("SELECT plan_id, layer, status FROM plan_registry WHERE layer <> ''")
    .all() as Array<Record<string, unknown>>) {
    const legacyLayer = String(row.layer ?? "");
    const planId = String(row.plan_id ?? "");
    const projected = mapPlanToL12Coverage(legacyLayer, planId);
    const l12Layer = projected.layer;
    const coverageRule = designCoverageRuleForL12Layer(l12Layer);
    const coverageMetadata = coverageMetadataForL12Layer(l12Layer);
    const status = l12Layer ? artifactStatusFromPlanStatus(String(row.status ?? "")) : "reverify";
    const reasons = l12Layer
      ? unique([
          projected.reason ?? "",
          `ZIP source bindings=${coverageMetadata.zipSourceBindingIds.join(",") || "-"}`,
          `tailoring=${coverageMetadata.tailoringRuleIds.join(",") || "-"} detail=${coverageMetadata.tailoringDetailLevels.join(",") || "-"}`,
          status === "done"
            ? "terminal PLAN として L12 canonical layer へ再投影済み"
            : "open PLAN のため L12 canonical layer では再検証要",
        ])
      : ["L12 canonical layer へ再投影できない legacy layer のため再検証要"];
    items.push({
      kind: "plan",
      artifactId: planId,
      sourcePath: "docs/plans",
      legacyLayer,
      l12Layer,
      coverageId: coverageRule?.coverageId ?? null,
      coverageLabel: coverageRule?.label ?? null,
      zipSourceBindingIds: coverageMetadata.zipSourceBindingIds,
      tailoringRuleIds: coverageMetadata.tailoringRuleIds,
      tailoringDetailLevels: coverageMetadata.tailoringDetailLevels,
      status,
      reasons,
    });
  }

  for (const row of input.db
    .prepare("SELECT defined_id, layer, source_path FROM design_declarations")
    .all() as Array<Record<string, unknown>>) {
    const legacyLayer = String(row.layer ?? "") || null;
    const sourcePath = String(row.source_path ?? "");
    const l12Layer = mapDeclarationLayerToL12Coverage(legacyLayer);
    const coverageRule = designCoverageRuleForL12Layer(l12Layer);
    const coverageMetadata = coverageMetadataForL12Layer(l12Layer);
    const hasLayer = legacyLayer !== null && l12Layer !== null;
    items.push({
      kind: sourcePath.startsWith("docs/test-design/") ? "test-design" : "design",
      artifactId: String(row.defined_id ?? ""),
      sourcePath,
      legacyLayer,
      l12Layer,
      coverageId: coverageRule?.coverageId ?? null,
      coverageLabel: coverageRule?.label ?? null,
      zipSourceBindingIds: coverageMetadata.zipSourceBindingIds,
      tailoringRuleIds: coverageMetadata.tailoringRuleIds,
      tailoringDetailLevels: coverageMetadata.tailoringDetailLevels,
      status: hasLayer ? "done" : "reverify",
      reasons: hasLayer
        ? unique([
            "typed declaration として L12 canonical layer へ再投影済み",
            `ZIP source bindings=${coverageMetadata.zipSourceBindingIds.join(",") || "-"}`,
            `tailoring=${coverageMetadata.tailoringRuleIds.join(",") || "-"} detail=${coverageMetadata.tailoringDetailLevels.join(",") || "-"}`,
          ])
        : ["typed declaration に L12 互換 layer が無いため再検証要"],
    });
  }

  for (const layer of input.coverage.l12_layers) {
    if (layer.status !== "missing") continue;
    const coverageRule = designCoverageRuleForL12Layer(layer.layer);
    const coverageMetadata = coverageMetadataForL12Layer(layer.layer);
    items.push({
      kind: "gap",
      artifactId: `missing:${layer.layer}`,
      sourcePath: "harness.db/current-location",
      legacyLayer: null,
      l12Layer: layer.layer,
      coverageId: coverageRule?.coverageId ?? null,
      coverageLabel: coverageRule?.label ?? null,
      zipSourceBindingIds: coverageMetadata.zipSourceBindingIds,
      tailoringRuleIds: coverageMetadata.tailoringRuleIds,
      tailoringDetailLevels: coverageMetadata.tailoringDetailLevels,
      status: "missing",
      reasons: unique([
        ...layer.reasons,
        `ZIP source bindings=${coverageMetadata.zipSourceBindingIds.join(",") || "-"}`,
        `tailoring=${coverageMetadata.tailoringRuleIds.join(",") || "-"} detail=${coverageMetadata.tailoringDetailLevels.join(",") || "-"}`,
      ]),
    });
  }

  const sorted = items.sort((a, b) => {
    const byStatus = artifactRemapStatusRank(a.status) - artifactRemapStatusRank(b.status);
    if (byStatus !== 0) return byStatus;
    const byLayer = String(a.l12Layer ?? "").localeCompare(String(b.l12Layer ?? ""));
    if (byLayer !== 0) return byLayer;
    return `${a.kind}:${a.artifactId}`.localeCompare(`${b.kind}:${b.artifactId}`);
  });

  return {
    items: sorted,
    layers: summarizeArtifactRemapLayers(sorted),
    done: sorted.filter((item) => item.status === "done").length,
    missing: sorted.filter((item) => item.status === "missing").length,
    reverify: sorted.filter((item) => item.status === "reverify").length,
  };
}

function buildRecommendation(input: {
  findings: ProjectCurrentLocationFinding[];
  hasContradiction: boolean;
  hasReverseNeed: boolean;
  hasRoadmapGap: boolean;
  hasDesignCoverageGap: boolean;
}): ProjectDriveRecommendation {
  const docDependencies = unique(input.findings.flatMap((finding) => finding.docDependencies));
  const implementationDependencies = unique(
    input.findings.flatMap((finding) => finding.implementationDependencies),
  );
  if (input.hasContradiction) {
    return {
      model: "Recovery",
      reason:
        "L14 claim と L7/open work が矛盾している。現在地を回復し、closure evidence と L12 claim を再照合してからForwardへ戻す",
      reverseTargets: ["docs/design/**", "docs/test-design/**"],
      docDependencies,
      implementationDependencies,
    };
  }
  if (input.hasReverseNeed || input.hasContradiction || input.hasDesignCoverageGap) {
    return {
      model: "Reverse",
      reason: input.hasDesignCoverageGap
        ? "L12 typed design coverage に不足がある。設計/テスト設計へ戻して coverage gate を満たしてからForwardへ戻す"
        : "設計/テスト設計へ戻す必要がある。該当範囲と文書依存・実装依存を解消してからForwardへ戻す",
      reverseTargets: ["docs/design/**", "docs/test-design/**"],
      docDependencies,
      implementationDependencies,
    };
  }
  if (input.hasRoadmapGap) {
    return {
      model: "Forward",
      reason: "工程表 frontier が残っているため、原則Forwardで不足層を進める",
      reverseTargets: [],
      docDependencies,
      implementationDependencies,
    };
  }
  return {
    model: "Forward",
    reason: "DB現在地と工程表に逆流要因がないため、原則Forwardを継続する",
    reverseTargets: [],
    docDependencies,
    implementationDependencies,
  };
}

function driveRouteStatus(input: {
  currentStatus: ProjectCurrentLocationSnapshot["current"]["status"];
  recommendation: ProjectDriveRecommendation;
  roadmapPosition: ProjectRoadmapPosition;
}): ProjectDriveRouteStatus {
  if (input.currentStatus === "unknown") return "unknown";
  if (input.recommendation.model === "Recovery") return "recovery_required";
  if (input.recommendation.model === "Reverse") {
    return input.currentStatus === "needs_recovery" ? "recovery_required" : "reverse_required";
  }
  if (input.roadmapPosition.status === "frontier" || input.roadmapPosition.status === "uncovered") {
    return "forward_frontier";
  }
  return "forward_ready";
}

function driveRouteId(status: ProjectDriveRouteStatus, model: ProjectDriveModel): string {
  switch (status) {
    case "recovery_required":
      return `drive:${model}:recover-current-location`;
    case "reverse_required":
      return `drive:${model}:repair-design-test-implementation`;
    case "forward_frontier":
      return `drive:${model}:advance-roadmap-frontier`;
    case "forward_ready":
      return `drive:${model}:continue-forward`;
    case "unknown":
      return `drive:${model}:unknown-current-location`;
  }
}

function driveRouteL12Layers(input: {
  closure: ProjectClosureStatus;
  roadmapPosition: ProjectRoadmapPosition;
  recommendation: ProjectDriveRecommendation;
}): string[] {
  if (input.recommendation.model === "Reverse" || input.recommendation.model === "Recovery") {
    return unique([
      "L5",
      "L7",
      ...input.closure.queue.items.map((item) => item.l12Layer),
      ...input.closure.remediation.items.map((item) => item.l12Layer),
    ]);
  }
  const forwardLayers = [
    ...input.roadmapPosition.bands.flatMap((band) => band.l12Layers),
    ...input.roadmapPosition.gates.flatMap((gate) => gate.l12Layers),
  ];
  return unique(forwardLayers);
}

function buildDriveRouteDecision(input: {
  currentStatus: ProjectCurrentLocationSnapshot["current"]["status"];
  recommendation: ProjectDriveRecommendation;
  roadmapPosition: ProjectRoadmapPosition;
  designCoverageGate: ProjectDesignCoverageGate;
  closure: ProjectClosureStatus;
  findings: ProjectCurrentLocationFinding[];
}): ProjectDriveRouteDecision {
  const status = driveRouteStatus({
    currentStatus: input.currentStatus,
    recommendation: input.recommendation,
    roadmapPosition: input.roadmapPosition,
  });
  const reverseRequired =
    input.recommendation.model === "Reverse" || input.recommendation.model === "Recovery";
  const reverseDocDependencies = unique([
    ...input.recommendation.docDependencies,
    ...input.designCoverageGate.items
      .filter((item) => item.returnRoute === "Reverse")
      .flatMap((item) => item.docDependencies),
    ...input.closure.docDependencies,
    ...input.closure.queue.items.flatMap((item) => item.docDependencies),
    ...input.closure.next_action_ledger.entries.flatMap((entry) => entry.docDependencies),
  ]);
  const reverseImplementationDependencies = unique([
    ...input.recommendation.implementationDependencies,
    ...input.designCoverageGate.items
      .filter((item) => item.returnRoute === "Reverse")
      .flatMap((item) => item.implementationDependencies),
    ...input.closure.implementationDependencies,
    ...input.closure.queue.items.flatMap((item) => item.implementationDependencies),
    ...input.closure.next_action_ledger.entries.flatMap(
      (entry) => entry.implementationDependencies,
    ),
  ]);
  const queueActions = unique(input.closure.queue.items.map((item) => item.nextAction)).filter(
    (action): action is ProjectClosureQueueNextAction =>
      action === "close_ready" ||
      action === "collect_evidence" ||
      action === "repair_failed_evidence" ||
      action === "reverse_design",
  );
  const forwardL12Layers = unique([
    ...input.roadmapPosition.current_band_ids.flatMap((id) => bandIdToL12Layers(id)),
    ...input.roadmapPosition.gates
      .filter((gate) => input.roadmapPosition.current_gate_ids.includes(`${gate.planId}:${gate.gateId}`))
      .flatMap((gate) => gate.l12Layers),
  ]);
  const reverseL12Layers = unique([
    ...driveRouteL12Layers({
      closure: input.closure,
      roadmapPosition: input.roadmapPosition,
      recommendation: input.recommendation,
    }),
    ...input.designCoverageGate.items
      .filter((item) => item.returnRoute === "Reverse")
      .map((item) => item.l12Layer),
  ]);
  const routeReasons = unique([
    input.recommendation.reason,
    ...input.findings.map((finding) => `${finding.severity}:${finding.code}`),
    input.roadmapPosition.status === "clear"
      ? "工程表 band/gate は clear"
      : `工程表 status=${input.roadmapPosition.status}`,
    input.designCoverageGate.status === "pass"
      ? "L12 typed design coverage gate は pass"
      : `L12 typed design coverage gate=${input.designCoverageGate.status}`,
    input.closure.status === "contradicted"
      ? "L14 claim と L7 closure が矛盾している"
      : `closure status=${input.closure.status}`,
  ]);

  return {
    routeId: driveRouteId(status, input.recommendation.model),
    status,
    selectedModel: input.recommendation.model,
    defaultModel: "Forward",
    reason: input.recommendation.reason,
    writePolicy: "read-only",
    sourceCommand: "helix current-location --json",
    viewCommand: "helix progress tree-view --json",
    mustReturnToDesign: reverseRequired,
    forward: {
      allowed: !reverseRequired,
      roadmapStatus: input.roadmapPosition.status,
      frontier: [...input.roadmapPosition.frontier],
      currentBandIds: [...input.roadmapPosition.current_band_ids],
      currentGateIds: [...input.roadmapPosition.current_gate_ids],
      coverageIds: designCoverageIdsForL12Layers(forwardL12Layers),
      coverageLabels: designCoverageLabelsForL12Layers(forwardL12Layers),
    },
    reverse: {
      required: reverseRequired,
      targets: [...input.recommendation.reverseTargets],
      l12Layers: reverseL12Layers,
      coverageIds: designCoverageIdsForL12Layers(reverseL12Layers),
      coverageLabels: designCoverageLabelsForL12Layers(reverseL12Layers),
      docDependencies: reverseRequired ? reverseDocDependencies : [],
      implementationDependencies: reverseRequired ? reverseImplementationDependencies : [],
      queueActions: reverseRequired ? queueActions : [],
      ledgerIds: reverseRequired
        ? input.closure.next_action_ledger.entries.map((entry) => entry.ledgerId)
        : [],
      acceptanceCriteria: reverseRequired
        ? unique(input.closure.packets.items.flatMap((packet) => packet.acceptanceCriteria))
        : [],
    },
    reasons: routeReasons,
  };
}

export function buildProjectCurrentLocationSnapshot(db: HarnessDb): ProjectCurrentLocationSnapshot {
  const openLayers = collectOpenPlanLayers(db);
  const reachedLayers = collectReachedPlanLayers(db);
  const currentLayer = highestLayer([...openLayers, ...reachedLayers]);
  const roadmapPosition = collectRoadmapPosition(db);
  const roadmap =
    roadmapPosition.frontier.length > 0 ? roadmapPosition.frontier : roadmapFrontier(db);
  const plansTotal = scalarNumber(db, "SELECT COUNT(*) AS value FROM plan_registry");
  const openL7PlanCount = scalarNumber(
    db,
    `SELECT COUNT(*) AS value FROM plan_registry
     WHERE layer = ? AND lower(status) IN ('draft', 'confirmed', 'in_progress', 'active')`,
    ["L7"],
  );
  const openL7PlanIds = collectPlanIds(
    db,
    `SELECT plan_id AS value FROM plan_registry
     WHERE layer = ? AND lower(status) IN ('draft', 'confirmed', 'in_progress', 'active')
     ORDER BY plan_id`,
    ["L7"],
  );
  const openL7Plans = collectOpenL7PlanRows(db);
  const terminalL14Plans = scalarNumber(
    db,
    `SELECT COUNT(*) AS value FROM plan_registry
     WHERE layer = ? AND lower(status) IN ('confirmed', 'completed', 'accepted')`,
    ["L14"],
  );
  const terminalL14PlanIds = collectPlanIds(
    db,
    `SELECT plan_id AS value FROM plan_registry
     WHERE layer = ? AND lower(status) IN ('confirmed', 'completed', 'accepted')
     ORDER BY plan_id`,
    ["L14"],
  );
  const designDeclarations = scalarNumber(db, "SELECT COUNT(*) AS value FROM design_declarations");
  const designReferences = scalarNumber(db, "SELECT COUNT(*) AS value FROM design_references");
  const designImpact = scalarNumber(db, "SELECT COUNT(*) AS value FROM design_impact");
  const unresolvedDesignReferences = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM design_references WHERE status <> ?",
    ["resolved"],
  );
  const designDeclarationDrifts = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM findings WHERE kind LIKE ? AND severity = ? AND status = ?",
    ["design-declaration-%", "error", "open"],
  );
  const implAheadObligations = scalarNumber(
    db,
    "SELECT COUNT(*) AS value FROM descent_obligations WHERE status = ?",
    ["impl-ahead"],
  );
  const uncoveredRoadmapBands = scalarNumber(
    db,
    "SELECT COALESCE(uncovered_bands, 0) AS value FROM roadmap_rollups WHERE rollup_id = ?",
    ["program"],
  );
  const operationScope = buildOperationScope(db);
  const closureEvidenceIds = collectClosureEvidenceIds(db);

  const findings: ProjectCurrentLocationFinding[] = [];
  const hasContradiction = terminalL14Plans > 0 && openL7PlanCount > 0;
  if (hasContradiction) {
    findings.push({
      code: "l14_claim_with_l7_work",
      severity: "error",
      detail: `L14 到達済み claim (${terminalL14Plans}) と L7 起票/実行中 (${openL7PlanCount}) が同時に存在する。open L7=${openL7PlanIds.slice(0, 5).join(",") || "-"} / L14=${terminalL14PlanIds.slice(0, 5).join(",") || "-"}`,
      docDependencies: ["docs/plans", "docs/design", "docs/test-design"],
      implementationDependencies: ["plan_registry"],
    });
  }
  const unresolvedDocs = collectUnresolvedDesignReferenceDocs(db);
  if (unresolvedDesignReferences > 0) {
    findings.push({
      code: "unresolved_design_reference",
      severity: "error",
      detail: `未解決 design reference が ${unresolvedDesignReferences} 件ある`,
      docDependencies: unresolvedDocs,
      implementationDependencies: ["design_references"],
    });
  }
  const designDeclarationDriftDocs = collectDesignDeclarationDriftDocs(db);
  if (designDeclarationDrifts > 0) {
    findings.push({
      code: "design_declaration_drift",
      severity: "error",
      detail: `typed design declaration と本文/参照の drift が ${designDeclarationDrifts} 件ある`,
      docDependencies: designDeclarationDriftDocs,
      implementationDependencies: ["findings", "design_declarations", "design_references"],
    });
  }
  const implAheadDocs = collectImplAheadDocs(db);
  if (implAheadObligations > 0) {
    findings.push({
      code: "impl_ahead_descent_obligation",
      severity: "error",
      detail: `実装が設計/テスト設計より先行している descent obligation が ${implAheadObligations} 件ある`,
      docDependencies: implAheadDocs,
      implementationDependencies: ["descent_obligations"],
    });
  }
  if (uncoveredRoadmapBands > 0) {
    findings.push({
      code: "roadmap_uncovered_frontier",
      severity: "warn",
      detail: `未被覆の工程表 band が ${uncoveredRoadmapBands} 件ある`,
      docDependencies: roadmapPosition.docDependencies,
      implementationDependencies: roadmapPosition.implementationDependencies,
    });
  }
  if (operationScope.missing > 0 || operationScope.reverify > 0) {
    const gapItems = operationScope.items
      .filter((item) => item.status === "missing" || item.status === "reverify")
      .map((item) => item.scope);
    findings.push({
      code: "operation_scope_gap",
      severity: "warn",
      detail: `L12 運用後検証 scope に未設計/要再検証が ${gapItems.length} 件ある: ${gapItems.join(", ")}`,
      docDependencies: ["docs/design/**", "docs/test-design/**"],
      implementationDependencies: unique(
        operationScope.items
          .filter((item) => item.status === "missing" || item.status === "reverify")
          .flatMap((item) => item.evidenceTables),
      ),
    });
  }

  const hasReverseNeed =
    unresolvedDesignReferences > 0 || designDeclarationDrifts > 0 || implAheadObligations > 0;
  const status =
    plansTotal === 0
      ? "unknown"
      : hasContradiction
        ? "needs_recovery"
        : hasReverseNeed
          ? "needs_reverse"
          : "forward";
  const completionBoundary = hasContradiction
    ? "contradicted"
    : plansTotal === 0 || openLayers.length > 0 || roadmap.length > 0
      ? "open"
      : "closed";
  const closure = buildClosureStatus({
    db,
    hasContradiction,
    plansTotal,
    openL7Plans,
    terminalL14PlanIds,
    closureEvidenceIds,
  });
  const designCoverageGate = buildDesignCoverageGate(db);
  const acceptanceTraceability = buildAcceptanceTraceability(db);
  const zipAdoption = buildZipAdoptionMatrix(db);
  const tailoringGate = buildTailoringGate(db);
  const scrumOperation = buildScrumOperation(db);
  if (designCoverageGate.status === "needs_design") {
    const gapItems = designCoverageGate.items.filter((item) => item.status !== "covered");
    findings.push({
      code: "design_coverage_gap",
      severity: "warn",
      detail: `L12 typed design coverage に不足/再検証が ${gapItems.length} 件ある: ${gapItems
        .map((item) => item.coverageId)
        .join(", ")}`,
      docDependencies: unique(gapItems.flatMap((item) => item.docDependencies)),
      implementationDependencies: designCoverageGate.implementationDependencies,
    });
  }
  if (tailoringGate.status === "needs_tailoring") {
    const gapItems = tailoringGate.items.filter(
      (item) => item.category === "required" && item.status === "missing",
    );
    findings.push({
      code: "tailoring_required_gap",
      severity: "warn",
      detail: `個人開発 tailoring required 契約に不足が ${gapItems.length} 件ある: ${gapItems
        .map((item) => item.tailoringId)
        .join(", ")}`,
      docDependencies: unique(gapItems.flatMap((item) => item.docDependencies)),
      implementationDependencies: tailoringGate.implementationDependencies,
    });
  }
  const coverage = buildL12Coverage({
    db,
    hasContradiction,
    unresolvedDesignReferences,
    implAheadObligations,
    operationScopeGaps: operationScope.missing + operationScope.reverify,
    operationScope,
  });
  const artifactRemap = buildArtifactRemap({ db, coverage });
  const unmappedArtifacts = artifactRemap.items.filter(
    (item) => item.kind !== "gap" && item.l12Layer === null,
  );
  if (unmappedArtifacts.length > 0) {
    findings.push({
      code: "artifact_remap_unmapped",
      severity: "warn",
      detail: `L12 canonical layer へ再投影できない既存成果物が ${unmappedArtifacts.length} 件ある`,
      docDependencies: unique(unmappedArtifacts.map((item) => item.sourcePath)),
      implementationDependencies: ["plan_registry", "design_declarations"],
    });
  }
  const driveRecommendation = buildRecommendation({
    findings,
    hasContradiction,
    hasReverseNeed,
    hasRoadmapGap: uncoveredRoadmapBands > 0 || roadmap.length > 0,
    hasDesignCoverageGap:
      designCoverageGate.status === "needs_design" || tailoringGate.status === "needs_tailoring",
  });
  const driveRoute = buildDriveRouteDecision({
    currentStatus: status,
    recommendation: driveRecommendation,
    roadmapPosition,
    designCoverageGate,
    closure,
    findings,
  });

  const snapshot: ProjectCurrentLocationSnapshot = {
    schema_version: "project-current-location.v1",
    source_clock: buildSourceClock(db),
    current: {
      layer: currentLayer,
      l12_layer: mapCurrentLayerToL12(currentLayer),
      status,
      completion_boundary: completionBoundary,
      roadmap_frontier: roadmap,
    },
    counts: {
      plans_total: plansTotal,
      open_l7_plans: openL7PlanCount,
      terminal_l14_plans: terminalL14Plans,
      design_declarations: designDeclarations,
      design_references: designReferences,
      design_impact: designImpact,
      unresolved_design_references: unresolvedDesignReferences,
      design_declaration_drifts: designDeclarationDrifts,
      impl_ahead_obligations: implAheadObligations,
      uncovered_roadmap_bands: uncoveredRoadmapBands,
    },
    roadmap_position: roadmapPosition,
    design_coverage_gate: designCoverageGate,
    acceptance_traceability: acceptanceTraceability,
    zip_adoption: zipAdoption,
    tailoring_gate: tailoringGate,
    scrum_operation: scrumOperation,
    closure,
    coverage,
    operation_scope: operationScope,
    artifact_remap: artifactRemap,
    findings,
    drive_recommendation: driveRecommendation,
    drive_route: driveRoute,
    skill_binding: undefined,
    recovery: null,
  };
  snapshot.skill_binding = buildProjectSkillBinding(db, snapshot);
  const recoveryPlan = buildProjectRecoveryPlan(snapshot);
  snapshot.recovery = {
    status: recoveryPlan.status,
    selected_closure_action: recoveryPlan.selected_closure_action,
    exit_forecast: recoveryPlan.exit_forecast,
    automation_runway: recoveryPlan.automation_runway,
    reentry_forecast: recoveryPlan.reentry_forecast,
    source_command: recoveryPlan.source_command,
    view_command: recoveryPlan.view_command,
  };
  return snapshot;
}
