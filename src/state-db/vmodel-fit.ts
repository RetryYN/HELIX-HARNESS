import { createHash } from "node:crypto";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import {
  buildProjectClosureBatchReport,
  buildProjectClosureEvidenceMaterializePacket,
  buildProjectClosureReviewBundle,
  buildProjectDriveModelReport,
  buildProjectRecoveryPlan,
  buildProjectRoadmapCurrentReport,
  closureEvidenceApplyDryRunCommand,
  closureEvidenceApplyExecuteCommand,
  closureEvidenceApprovalDraftCommand,
  closureEvidenceApprovalDraftRefreshPath,
  closureEvidenceHandoffArtifacts,
  closureEvidenceMaterializeCommand,
  closureEvidenceProbeCommand,
  isProjectClosureQueueNextAction,
  projectClosureActionCommandLimit,
  type ProjectClosureEvidenceProbeExecution,
  type ProjectClosureOutcomeRoute,
  type ProjectClosureQueueNextAction,
  type ProjectCurrentLocationSnapshot,
} from "./current-location";
import {
  buildVmodelZipSourceBindings,
  VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE,
  VMODEL_ZIP_FILENAME,
  type VmodelZipInventorySignature,
  type VmodelZipManifestResult,
} from "../schema/hybrid-vmodel-manifest";

export type VmodelFitStatus = "pass" | "needs_fit";
export type VmodelZipManifestStatus = "ok" | "advisory_missing" | "violation";
export type VmodelCurrentLocationGateStatus = "pass" | "needs_recovery";
export type VmodelZipSourceBindingFitStatus = "complete" | "advisory_missing" | "missing";
export type VmodelFunctionDesignAbsorptionStatus = "pass" | "needs_absorption";
export type VmodelRoadmapCurrentGateStatus = "pass" | "needs_sync" | "contradicted";
export type VmodelDriveModelGateStatus = "pass" | "needs_drive_model";
export type VmodelAcceptanceTraceabilityGateStatus = "pass" | "needs_trace";

export interface VmodelZipManifestFitView {
  status: VmodelZipManifestStatus;
  present: boolean;
  root_prefix: string | null;
  entries_total: number;
  by_extension: Record<string, number>;
  inventory_signature: VmodelZipInventorySignature;
  required_present: number;
  required_total: number;
  required: Array<{
    path: string;
    present: boolean;
    actualPath: string | null;
  }>;
  findings: Array<{
    code: string;
    severity: string;
    detail: string;
  }>;
}

export interface VmodelZipSourceBindingFitView {
  status: VmodelZipSourceBindingFitStatus;
  bound: number;
  missing: number;
  advisory: number;
  evidence_tables: string[];
  bindings: Array<{
    binding_id: string;
    source_path: string;
    source_category: string;
    status: string;
    source_present: boolean;
    actual_path: string | null;
    l12_layers: string[];
    helix_surfaces: string[];
    evidence_tables: string[];
    required_action: string;
  }>;
}

export interface VmodelCurrentLocationGate {
  status: VmodelCurrentLocationGateStatus;
  current_status: ProjectCurrentLocationSnapshot["current"]["status"];
  completion_boundary: ProjectCurrentLocationSnapshot["current"]["completion_boundary"];
  drive_route_status: ProjectCurrentLocationSnapshot["drive_route"]["status"];
  route_id: string;
  recommended_model: ProjectCurrentLocationSnapshot["drive_recommendation"]["model"];
  reason: string;
  recovery_runway: {
    status: string;
    machine_actionable_count: number;
    human_approval_count: number;
    design_reverse_count: number;
    remaining_after_machine_lanes: number;
    next_machine_action: string | null;
    next_machine_command: string | null;
    next_machine_probe_command: string | null;
    next_machine_materialize_command: string | null;
    next_machine_approval_draft_command: string | null;
    next_machine_apply_dry_run_command: string | null;
    phases: VmodelRecoveryRunwayPhase[];
  };
  reentry_forecast: {
    status: string;
    current_blocking_count: number;
    blocking_after_machine_lanes: number;
    required_phase_count: number;
    next_phase_action: string | null;
    next_phase_type: string | null;
    next_gate: string;
    next_command: string;
    next_execution_command: string;
  };
}

export interface VmodelFunctionDesignAbsorptionGate {
  status: VmodelFunctionDesignAbsorptionStatus;
  independent_layer_policy: "abolished";
  detail_contract_coverage_status: string;
  tailoring_detail_contract_status: string;
  accepted_layers: string[];
  absorbed_surfaces: string[];
  command: "helix current-location --json";
  required_action: string;
  reasons: string[];
}

export interface VmodelRoadmapCurrentGate {
  status: VmodelRoadmapCurrentGateStatus;
  roadmap_status: string;
  aligned: boolean;
  recovery_correlation: "independent" | "current_location_recovery";
  db_current_l12_layer: string | null;
  roadmap_current_l12_layers: string[];
  roadmap_projected_l12_layers: string[];
  roadmap_terminal_l12_layers: string[];
  alignment_basis: string;
  blocker_count: number;
  command: "helix roadmap current --json";
  required_action: string;
  reasons: string[];
}

export interface VmodelDriveModelGate {
  status: VmodelDriveModelGateStatus;
  selected_model: string;
  default_model: "Forward";
  selection_status: string;
  selected_route_id: string;
  selected_command: string;
  selected_coverage_ids: string[];
  selected_coverage_labels: string[];
  candidate_count: number;
  blocked_models: string[];
  available_models: string[];
  command: "helix drive model --json";
  required_action: string;
  reasons: string[];
}

export interface VmodelAcceptanceTraceabilityGate {
  status: VmodelAcceptanceTraceabilityGateStatus;
  total: number;
  linked: number;
  declared: number;
  missing: number;
  command: "helix current-location --json";
  required_action: string;
  reasons: string[];
}

export interface VmodelFitBlocker {
  code:
    | "design_coverage"
    | "acceptance_traceability"
    | "function_design_absorption"
    | "roadmap_current"
    | "drive_model"
    | "zip_adoption"
    | "zip_manifest"
    | "zip_inventory_signature"
    | "zip_source_bindings"
    | "tailoring"
    | "operation_scope"
    | "scrum_operation_gap"
    | "current_location"
    | "design_integrity";
  status: string;
  count: number;
  command: string;
  required_action: string;
  doc_dependencies: string[];
  implementation_dependencies: string[];
}

export interface VmodelSynthesisReport {
  status: "integrated" | "needs_fit";
  source_package: string;
  source_document: string;
  common_adopted: number;
  helix_complemented: number;
  rejected: number;
  missing_decisions: number;
  adopted_ids: string[];
  complemented_ids: string[];
  rejected_ids: string[];
  tailoring_status: ProjectCurrentLocationSnapshot["tailoring_gate"]["status"];
  function_design_policy: VmodelFunctionDesignAbsorptionGate["independent_layer_policy"];
  current_reentry_status: string;
  effective_reentry_status: string;
  next_command: string;
  reasons: string[];
}

export interface VmodelNextAction {
  priority: number;
  action_id: string;
  blocker_code: VmodelFitBlocker["code"] | "none";
  status: string;
  command: string;
  gate: string;
  automation_class: "machine" | "approval" | "design" | "verification" | "none";
  count: number;
  required_action: string;
  doc_dependencies: string[];
  implementation_dependencies: string[];
  reasons: string[];
  work_bucket: VmodelNextActionWorkBucket | null;
}

export interface VmodelNextActionWorkBucket {
  bucket_id: string;
  action: string;
  evidence_signature: string;
  count: number;
  listed: number;
  omitted: number;
  target_tables: string[];
  primary_command: string;
  evidence_patch_command: string;
  evidence_patch_write_policy: "approval-required";
  evidence_patch_candidate_count: number;
  evidence_probe_command: string;
  evidence_materialize_command: string;
  evidence_approval_draft_command: string;
  evidence_apply_dry_run_command: string;
  evidence_apply_execute_command: string;
  evidence_apply_write_policy: "approval-required";
  evidence_handoff_artifacts: {
    probe_record_path: string;
    approval_draft_path: string;
    write_policy: string;
  } | null;
  evidence_handoff_status: VmodelHandoffStatus | null;
  evidence_handoff_next: VmodelHandoffNextStep | null;
  repair_status: string;
  repair_automation_status: string;
  repair_primary_next_command: string | null;
  failed_evidence_count: number;
  projection_item_count: number;
  projection_plan_ids: string[];
  required_green_tables: string[];
  command_candidates: Array<{
    command_label: string;
    command_verb: string | null;
    runnable_command: string | null;
    resolution_candidates: Array<{
      command: string;
      source: string;
      confidence: string;
      safe_to_run: boolean;
      projection_binding: {
        target_tables: string[];
        source_surfaces: string[];
        required_fields: string[];
        success_status: string;
        write_policy: string;
        postcheck_commands: string[];
        required_action: string;
      };
      required_action: string;
    }>;
    count: number;
    latest_observed_at: string | null;
  }>;
  sample_plan_ids: string[];
  postcheck_commands: string[];
}

export interface VmodelHandoffStatus {
  present: number;
  missing: number;
  unchecked: number;
  items: VmodelHandoffArtifactStatus[];
  approval_record: VmodelApprovalRecordStatus | null;
  approval_record_path: string | null;
}

export interface VmodelHandoffArtifactStatus {
  kind: "probe_record" | "approval_draft";
  path: string;
  status: "present" | "missing" | "unchecked";
  generation_status: "present" | "ready_to_generate" | "waiting_for_probe" | "unchecked";
  generation_command: string;
  bytes: number | null;
  sha256: string | null;
  write_policy: string;
  reasons: string[];
}

export interface VmodelHandoffNextStep {
  status:
    | "generate_probe"
    | "generate_approval_draft"
    | "refresh_approval_draft"
    | "approval_pending"
    | "approval_rejected"
    | "apply_dry_run"
    | "approval_required"
    | "unchecked"
    | "unavailable";
  approval_state: VmodelApprovalRecordStatus["status"] | "not_required";
  scope_status: VmodelApprovalRecordStatus["scope_status"] | null;
  valid_for_apply: boolean;
  command: string;
  label: string;
  required_action: string;
  reason_codes: string[];
  reasons: string[];
}

export interface VmodelApprovalRecordStatus {
  status: "pending_human_review" | "approved" | "rejected" | "invalid" | "missing" | "unchecked";
  decision_id: string | null;
  outcome: string | null;
  approval_scope_digest: string | null;
  expected_approval_scope_digest: string | null;
  scope_status: "match" | "mismatch" | "missing" | "not_checked";
  materialize_status: string | null;
  reviewed_candidate_count: number | null;
  valid_for_apply: boolean;
  reasons: string[];
}

export interface VmodelRegressionGuard {
  guard_id: string;
  status: "pass" | "watch" | "fail";
  scope: string;
  command: string;
  protected_surface: string[];
  count: number;
  required_action: string;
  reasons: string[];
}

export interface VmodelRegressionGuardReport {
  status: "pass" | "needs_attention";
  pass: number;
  watch: number;
  fail: number;
  guards: VmodelRegressionGuard[];
}

export interface VmodelRecoveryHandoffGate {
  status: VmodelHandoffNextStep["status"] | "none";
  effective_phase: "machine" | "approval" | "none";
  action_id: string | null;
  blocker_code: VmodelNextAction["blocker_code"] | null;
  command: string;
  required_action: string;
  handoff_present: number;
  handoff_missing: number;
  approval_status: VmodelApprovalRecordStatus["status"] | null;
  scope_status: VmodelApprovalRecordStatus["scope_status"] | null;
  decision_id: string | null;
  outcome: string | null;
  approval_record_path: string | null;
  approval_scope_digest: string | null;
  expected_approval_scope_digest: string | null;
  materialize_status: string | null;
  reviewed_candidate_count: number | null;
  valid_for_apply: boolean;
  approval_state: VmodelHandoffNextStep["approval_state"];
  reason_codes: string[];
  reasons: string[];
}

export interface VmodelRecoveryRunwayPhase {
  sequence: number;
  action: string;
  phase_type: string;
  count: number;
  listed: number;
  omitted: number;
  selected: boolean;
  status: string;
  human_required: boolean;
  command: string;
  evidence_signature: string | null;
  evidence_components: string[];
  evidence_statuses: string[];
  sample_plan_ids: string[];
  sample_source_paths: string[];
  evidence_probe_command: string | null;
  evidence_materialize_command: string | null;
  evidence_approval_draft_command: string | null;
  evidence_apply_dry_run_command: string | null;
  evidence_apply_execute_command: string | null;
  evidence_apply_write_policy: string | null;
  target_tables: string[];
  postcheck_commands: string[];
  remaining_after_phase: number;
  next_gate: string;
  expected_transition: string;
}

export interface VmodelRecoveryRunwayGate {
  status: string;
  current_blocking_count: number;
  machine_actionable_count: number;
  human_approval_count: number;
  design_reverse_count: number;
  remaining_after_machine_lanes: number;
  required_phase_count: number;
  next_phase_action: string | null;
  next_phase_type: string | null;
  next_gate: string;
  next_command: string;
  next_execution_command: string;
  next_machine_action: string | null;
  next_machine_command: string | null;
  next_machine_probe_command: string | null;
  next_machine_materialize_command: string | null;
  next_machine_approval_draft_command: string | null;
  next_machine_apply_dry_run_command: string | null;
  phases: VmodelRecoveryRunwayPhase[];
  command: string;
  required_action: string;
  reasons: string[];
}

export interface VmodelApprovalReviewGate {
  status: "none" | "approval_required" | "blocked_by_findings";
  action: "close_ready";
  count: number;
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
  approval_required: boolean;
  decision_id: string;
  approval_scope_digest: string;
  sample_plan_ids: string[];
  sample_source_paths: string[];
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
  review_command: "helix closure review-bundle --action close_ready --summary-json";
  current_window_command: string;
  previous_window_command: string | null;
  next_window_command: string | null;
  transition_command: "helix closure transition-plan --action close_ready --summary-json";
  transition_window_command: string;
  previous_transition_window_command: string | null;
  next_transition_window_command: string | null;
  outcome_routes: ProjectClosureOutcomeRoute[];
  approval_record_template: string[];
  required_action: string;
  reasons: string[];
}

export interface VmodelFitReport {
  schema_version: "vmodel-fit.v1";
  status: VmodelFitStatus;
  source_clock: string | null;
  design_coverage_gate: ProjectCurrentLocationSnapshot["design_coverage_gate"];
  acceptance_traceability_gate: VmodelAcceptanceTraceabilityGate;
  zip_adoption: ProjectCurrentLocationSnapshot["zip_adoption"];
  zip_manifest: VmodelZipManifestFitView;
  zip_source_bindings: VmodelZipSourceBindingFitView;
  tailoring_gate: ProjectCurrentLocationSnapshot["tailoring_gate"];
  function_design_absorption: VmodelFunctionDesignAbsorptionGate;
  roadmap_current_gate: VmodelRoadmapCurrentGate;
  drive_model_gate: VmodelDriveModelGate;
  skill_binding: ProjectCurrentLocationSnapshot["skill_binding"];
  operation_scope: ProjectCurrentLocationSnapshot["operation_scope"];
  current_location_gate: VmodelCurrentLocationGate;
  design_integrity: {
    declarations: number;
    references: number;
    impact: number;
    unresolved_references: number;
    declaration_drifts: number;
  };
  current: ProjectCurrentLocationSnapshot["current"];
  drive_route: ProjectCurrentLocationSnapshot["drive_route"];
  synthesis: VmodelSynthesisReport;
  next_actions: VmodelNextAction[];
  recovery_runway_gate: VmodelRecoveryRunwayGate;
  recovery_handoff_gate: VmodelRecoveryHandoffGate;
  approval_review_gate: VmodelApprovalReviewGate;
  regression_guards: VmodelRegressionGuardReport;
  blockers: VmodelFitBlocker[];
  reasons: string[];
  write_policy: "read-only";
  source_command: "helix vmodel fit --json";
  current_location_command: "helix current-location --json";
  view_command: "helix progress tree-view --json";
}

const SCRUM_OPERATION_FIT_REQUIRED_ACTION =
  "Scrum 運営層の missing source を typed declaration に投影し、current-location / roadmap / skill binding を再計算する";

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim().length > 0))];
}

function scrumOperationGapItems(snapshot: ProjectCurrentLocationSnapshot) {
  const scrumOperation = snapshot.scrum_operation;
  if (!scrumOperation || scrumOperation.status === "not_observed") return [];
  return scrumOperation.items.filter(
    (item) => item.category !== "plan" && item.status === "missing",
  );
}

function scrumOperationGapFinding(snapshot: ProjectCurrentLocationSnapshot) {
  return snapshot.findings.find((finding) => finding.code === "scrum_operation_gap") ?? null;
}

function scrumOperationGapDocDependencies(snapshot: ProjectCurrentLocationSnapshot): string[] {
  const finding = scrumOperationGapFinding(snapshot);
  if (finding) return [...finding.docDependencies];
  return uniqueStrings(scrumOperationGapItems(snapshot).flatMap((item) => item.docDependencies));
}

function scrumOperationGapImplementationDependencies(
  snapshot: ProjectCurrentLocationSnapshot,
): string[] {
  const finding = scrumOperationGapFinding(snapshot);
  if (finding) return [...finding.implementationDependencies];
  return uniqueStrings([
    "design_declarations",
    "project_current_location",
    ...scrumOperationGapItems(snapshot).flatMap((item) => item.implementationDependencies),
  ]);
}

function zipManifestStatus(zipManifest?: VmodelZipManifestResult): VmodelZipManifestStatus {
  if (!zipManifest?.present) return "advisory_missing";
  return zipManifest.ok ? "ok" : "violation";
}

function zipManifestView(zipManifest?: VmodelZipManifestResult): VmodelZipManifestFitView {
  const expectedSignature = VMODEL_ZIP_EXPECTED_INVENTORY_SIGNATURE;
  return {
    status: zipManifestStatus(zipManifest),
    present: zipManifest?.present ?? false,
    root_prefix: zipManifest?.rootPrefix ?? null,
    entries_total: zipManifest?.entriesTotal ?? 0,
    by_extension: { ...(zipManifest?.byExtension ?? {}) },
    inventory_signature: zipManifest?.inventorySignature ?? {
      status: "advisory_missing",
      expected_root_prefix: expectedSignature.rootPrefix,
      actual_root_prefix: null,
      expected_entries_total: expectedSignature.entriesTotal,
      actual_entries_total: 0,
      expected_by_extension: { ...expectedSignature.byExtension },
      actual_by_extension: Object.fromEntries(
        Object.keys(expectedSignature.byExtension).map((extension) => [extension, 0]),
      ),
      mismatches: [],
    },
    required_present: zipManifest?.required.filter((entry) => entry.present).length ?? 0,
    required_total: zipManifest?.required.length ?? 0,
    required:
      zipManifest?.required.map((entry) => ({
        path: entry.path,
        present: entry.present,
        actualPath: entry.actualPath,
      })) ?? [],
    findings:
      zipManifest?.findings.map((finding) => ({
        code: finding.code,
        severity: finding.severity,
        detail: finding.detail,
      })) ?? [],
  };
}

function zipSourceBindingView(
  zipManifest?: VmodelZipManifestResult,
): VmodelZipSourceBindingFitView {
  if (!zipManifest) {
    return {
      status: "advisory_missing",
      bound: 0,
      missing: 0,
      advisory: 0,
      evidence_tables: [],
      bindings: [],
    };
  }
  const bindings = zipManifest ? buildVmodelZipSourceBindings(zipManifest) : [];
  const bound = bindings.filter((binding) => binding.status === "bound").length;
  const missing = bindings.filter((binding) => binding.status === "missing").length;
  const advisory = bindings.filter((binding) => binding.status === "advisory_missing").length;
  const status: VmodelZipSourceBindingFitStatus =
    missing > 0 ? "missing" : advisory > 0 ? "advisory_missing" : "complete";
  return {
    status,
    bound,
    missing,
    advisory,
    evidence_tables: [...new Set(bindings.flatMap((binding) => binding.evidenceTables))],
    bindings: bindings.map((binding) => ({
      binding_id: binding.bindingId,
      source_path: binding.sourcePath,
      source_category: binding.sourceCategory,
      status: binding.status,
      source_present: binding.sourcePresent,
      actual_path: binding.actualPath,
      l12_layers: [...binding.l12Layers],
      helix_surfaces: [...binding.helixSurfaces],
      evidence_tables: [...binding.evidenceTables],
      required_action: binding.requiredAction,
    })),
  };
}

function currentLocationGate(snapshot: ProjectCurrentLocationSnapshot): VmodelCurrentLocationGate {
  const recoveryPlan = buildProjectRecoveryPlan(snapshot, { limit: 3 });
  const status =
    snapshot.current.status === "forward" && snapshot.current.completion_boundary !== "contradicted"
      ? "pass"
      : "needs_recovery";
  return {
    status,
    current_status: snapshot.current.status,
    completion_boundary: snapshot.current.completion_boundary,
    drive_route_status: snapshot.drive_route.status,
    route_id: snapshot.drive_route.routeId,
    recommended_model: snapshot.drive_recommendation.model,
    reason:
      status === "pass"
        ? "DB現在地と工程表に逆流要因がない"
        : "DB現在地または closure 境界に recovery/reverse 要因がある",
    recovery_runway: {
      status: recoveryPlan.automation_runway.status,
      machine_actionable_count: recoveryPlan.automation_runway.machine_actionable_count,
      human_approval_count: recoveryPlan.automation_runway.human_approval_count,
      design_reverse_count: recoveryPlan.automation_runway.design_reverse_count,
      remaining_after_machine_lanes: recoveryPlan.automation_runway.remaining_after_machine_lanes,
      next_machine_action: recoveryPlan.automation_runway.next_machine_action,
      next_machine_command: recoveryPlan.automation_runway.next_machine_command,
      next_machine_probe_command: recoveryPlan.automation_runway.next_machine_probe_command,
      next_machine_materialize_command:
        recoveryPlan.automation_runway.next_machine_materialize_command,
      next_machine_approval_draft_command:
        recoveryPlan.automation_runway.next_machine_approval_draft_command,
      next_machine_apply_dry_run_command:
        recoveryPlan.automation_runway.next_machine_apply_dry_run_command,
      phases: recoveryPlan.automation_runway.phases.map((phase) => {
        const batch = buildProjectClosureBatchReport(snapshot, {
          action: phase.action,
          limit: 3,
        });
        const bucket = batch.work_buckets[0] ?? null;
        return {
          sequence: phase.sequence,
          action: phase.action,
          phase_type: phase.phase_type,
          count: phase.count,
          listed: batch.listed,
          omitted: batch.omitted,
          selected: phase.selected,
          status: phase.status,
          human_required: phase.human_required,
          command: phase.command,
          evidence_signature: bucket?.evidence_signature ?? null,
          evidence_components: bucket ? [...bucket.evidence_components] : [],
          evidence_statuses: bucket ? [...bucket.evidence_statuses] : [],
          sample_plan_ids: bucket ? [...bucket.sample_plan_ids] : [],
          sample_source_paths: batch.queue_items.slice(0, 3).map((item) => item.sourcePath),
          evidence_probe_command: phase.evidence_probe_command,
          evidence_materialize_command: phase.evidence_materialize_command,
          evidence_approval_draft_command: phase.evidence_approval_draft_command,
          evidence_apply_dry_run_command: phase.evidence_apply_dry_run_command,
          evidence_apply_execute_command: phase.evidence_apply_execute_command,
          evidence_apply_write_policy: phase.evidence_apply_write_policy,
          target_tables: [...phase.target_tables],
          postcheck_commands: [...phase.postcheck_commands],
          remaining_after_phase: phase.remaining_after_phase,
          next_gate: phase.next_gate,
          expected_transition: phase.expected_transition,
        };
      }),
    },
    reentry_forecast: {
      status: recoveryPlan.reentry_forecast.status,
      current_blocking_count: recoveryPlan.reentry_forecast.current_blocking_count,
      blocking_after_machine_lanes: recoveryPlan.reentry_forecast.blocking_after_machine_lanes,
      required_phase_count: recoveryPlan.reentry_forecast.required_phase_count,
      next_phase_action: recoveryPlan.reentry_forecast.next_phase_action,
      next_phase_type: recoveryPlan.reentry_forecast.next_phase_type,
      next_gate: recoveryPlan.reentry_forecast.next_gate,
      next_command: recoveryPlan.reentry_forecast.next_command,
      next_execution_command: recoveryPlan.reentry_forecast.next_execution_command,
    },
  };
}

function buildVmodelRecoveryRunwayGate(
  currentGate: VmodelCurrentLocationGate,
): VmodelRecoveryRunwayGate {
  const runway = currentGate.recovery_runway;
  const reentry = currentGate.reentry_forecast;
  const command = reentry.next_execution_command || reentry.next_command;
  const requiredAction =
    currentGate.status === "pass"
      ? "Recovery runway は不要。Forward / selected drive model を継続できる"
      : runway.machine_actionable_count > 0
        ? "machine lane を順に処理し、harness.db/current-location/vmodel fit を再計算して human approval lane まで圧縮する"
        : runway.human_approval_count > 0
          ? "machine lane は残っていない。close_ready approval lane を人間レビューで閉じる"
          : runway.design_reverse_count > 0
            ? "設計/テスト設計へ Reverse し、依存文書と実装依存を再照合する"
            : "Recovery blocking lane を再計算し、次の drive model を選び直す";
  return {
    status: runway.status,
    current_blocking_count: reentry.current_blocking_count,
    machine_actionable_count: runway.machine_actionable_count,
    human_approval_count: runway.human_approval_count,
    design_reverse_count: runway.design_reverse_count,
    remaining_after_machine_lanes: runway.remaining_after_machine_lanes,
    required_phase_count: reentry.required_phase_count,
    next_phase_action: reentry.next_phase_action,
    next_phase_type: reentry.next_phase_type,
    next_gate: reentry.next_gate,
    next_command: reentry.next_command,
    next_execution_command: reentry.next_execution_command,
    next_machine_action: runway.next_machine_action,
    next_machine_command: runway.next_machine_command,
    next_machine_probe_command: runway.next_machine_probe_command,
    next_machine_materialize_command: runway.next_machine_materialize_command,
    next_machine_approval_draft_command: runway.next_machine_approval_draft_command,
    next_machine_apply_dry_run_command: runway.next_machine_apply_dry_run_command,
    phases: runway.phases.map((phase) => ({
      sequence: phase.sequence,
      action: phase.action,
      phase_type: phase.phase_type,
      count: phase.count,
      listed: phase.listed,
      omitted: phase.omitted,
      selected: phase.selected,
      status: phase.status,
      human_required: phase.human_required,
      command: phase.command,
      evidence_signature: phase.evidence_signature,
      evidence_components: [...phase.evidence_components],
      evidence_statuses: [...phase.evidence_statuses],
      sample_plan_ids: [...phase.sample_plan_ids],
      sample_source_paths: [...phase.sample_source_paths],
      evidence_probe_command: phase.evidence_probe_command,
      evidence_materialize_command: phase.evidence_materialize_command,
      evidence_approval_draft_command: phase.evidence_approval_draft_command,
      evidence_apply_dry_run_command: phase.evidence_apply_dry_run_command,
      evidence_apply_execute_command: phase.evidence_apply_execute_command,
      evidence_apply_write_policy: phase.evidence_apply_write_policy,
      target_tables: [...phase.target_tables],
      postcheck_commands: [...phase.postcheck_commands],
      remaining_after_phase: phase.remaining_after_phase,
      next_gate: phase.next_gate,
      expected_transition: phase.expected_transition,
    })),
    command,
    required_action: requiredAction,
    reasons: [
      `current_blocking=${reentry.current_blocking_count}`,
      `machine=${runway.machine_actionable_count}`,
      `approval=${runway.human_approval_count}`,
      `reverse=${runway.design_reverse_count}`,
      `after_machine=${runway.remaining_after_machine_lanes}`,
      `phases=${reentry.required_phase_count}`,
      `next=${reentry.next_phase_action ?? "-"}`,
      `phase=${reentry.next_phase_type ?? "-"}`,
      `gate=${reentry.next_gate}`,
    ],
  };
}

function functionDesignAbsorptionGate(
  snapshot: ProjectCurrentLocationSnapshot,
): VmodelFunctionDesignAbsorptionGate {
  const detailCoverage = snapshot.design_coverage_gate.items.find(
    (item) => item.coverageId === "L5-detailed-contract",
  );
  const tailoringDetail = snapshot.tailoring_gate.items.find(
    (item) => item.tailoringId === "HVM-TAILOR-DETAIL-CONTRACT",
  );
  const detailCovered = detailCoverage?.status === "covered";
  const tailoringDeclared = tailoringDetail?.status === "declared";
  const status: VmodelFunctionDesignAbsorptionStatus =
    detailCovered && tailoringDeclared ? "pass" : "needs_absorption";

  return {
    status,
    independent_layer_policy: "abolished",
    detail_contract_coverage_status: detailCoverage?.status ?? "missing",
    tailoring_detail_contract_status: tailoringDetail?.status ?? "missing",
    accepted_layers: ["L5", "L7", "typed declaration", "runtime evidence"],
    absorbed_surfaces: [
      "L5 detailed design",
      "design_declarations",
      "L7 TDD closure",
      "test_runs",
      "gate_runs",
      "runtime_verification_events",
    ],
    command: "helix current-location --json",
    required_action:
      "独立した重い機能設計層を要求せず、必要な契約を L5 詳細設計・typed declaration・L7 TDD closure・runtime evidence へ吸収する",
    reasons:
      status === "pass"
        ? [
            "L5 detailed contract coverage is covered",
            "HVM-TAILOR-DETAIL-CONTRACT is declared",
            "function design remains abolished as an independent required layer",
          ]
        : [
            `L5 detailed contract coverage is ${detailCoverage?.status ?? "missing"}`,
            `HVM-TAILOR-DETAIL-CONTRACT is ${tailoringDetail?.status ?? "missing"}`,
            "function design cannot be removed safely until detailed contract absorption is detectable",
          ],
  };
}

function acceptanceTraceabilityGate(
  snapshot: ProjectCurrentLocationSnapshot,
): VmodelAcceptanceTraceabilityGate {
  const trace = snapshot.acceptance_traceability;
  return {
    status: trace.status,
    total: trace.total,
    linked: trace.linked,
    declared: trace.declared,
    missing: trace.missing,
    command: "helix current-location --json",
    required_action:
      trace.status === "pass"
        ? "VMFIT acceptance criteria は対象要件へ resolved reference で接続済み"
        : "HAC-VMFIT acceptance criteria を typed declaration と resolved reference で HR-FR-VMFIT 要件へ接続する",
    reasons: [
      `linked=${trace.linked}`,
      `declared_only=${trace.declared}`,
      `missing=${trace.missing}`,
      `total=${trace.total}`,
    ],
  };
}

function roadmapCurrentGate(snapshot: ProjectCurrentLocationSnapshot): VmodelRoadmapCurrentGate {
  const report = buildProjectRoadmapCurrentReport(snapshot);
  const status: VmodelRoadmapCurrentGateStatus = !report.consistency.aligned
    ? "needs_sync"
    : report.counts.blockers > 0 || report.status === "contradicted"
      ? "contradicted"
      : "pass";
  const recoveryCorrelation =
    status === "contradicted" && report.consistency.aligned
      ? "current_location_recovery"
      : "independent";
  const requiredAction =
    status === "needs_sync"
      ? "工程表 frontier と harness.db current-location を同じ L12 現在地へ同期し、blocking action を解消する"
      : status === "contradicted"
        ? "工程表と DB は同じ L12 現在地を指している。blocking finding を Recovery/closure route で解消する"
        : "工程表と DB current-location は同期済み";
  return {
    status,
    roadmap_status: report.status,
    aligned: report.consistency.aligned,
    recovery_correlation: recoveryCorrelation,
    db_current_l12_layer: report.consistency.db_current_l12_layer,
    roadmap_current_l12_layers: [...report.consistency.roadmap_current_l12_layers],
    roadmap_projected_l12_layers: [...report.consistency.roadmap_projected_l12_layers],
    roadmap_terminal_l12_layers: [...report.consistency.roadmap_terminal_l12_layers],
    alignment_basis: report.consistency.alignment_basis,
    blocker_count: report.counts.blockers,
    command: report.source_command,
    required_action: requiredAction,
    reasons: [
      ...report.consistency.reasons,
      `recovery_correlation=${recoveryCorrelation}`,
      `roadmap_blockers=${report.counts.blockers}`,
      `roadmap_actions=${report.counts.actions}`,
    ],
  };
}

function driveModelGate(snapshot: ProjectCurrentLocationSnapshot): VmodelDriveModelGate {
  const report = buildProjectDriveModelReport(snapshot);
  const selectedCandidateMatches =
    report.selected_candidate.model === report.selected_model &&
    report.selected_candidate.status === "selected";
  const routeMatches = report.selected_candidate.route_id.length > 0;
  const status: VmodelDriveModelGateStatus =
    selectedCandidateMatches && routeMatches ? "pass" : "needs_drive_model";
  return {
    status,
    selected_model: report.selected_model,
    default_model: report.default_model,
    selection_status: report.selection_status,
    selected_route_id: report.selected_candidate.route_id,
    selected_command: report.selected_candidate.command,
    selected_coverage_ids: [...report.selected_candidate.coverage_ids],
    selected_coverage_labels: [...report.selected_candidate.coverage_labels],
    candidate_count: report.candidates.length,
    blocked_models: [...report.blocked_models],
    available_models: [...report.available_models],
    command: report.source_command,
    required_action:
      "current-location から選ばれた drive model candidate と route を再計算し、selected candidate の不整合を解消する",
    reasons: [
      `selected_model=${report.selected_model}`,
      `selected_route=${report.selected_candidate.route_id}`,
      `selected_coverage=${report.selected_candidate.coverage_ids.join(",") || "-"}`,
      `selection_status=${report.selection_status}`,
      `blocked=${report.blocked_models.join(",") || "-"}`,
      `available=${report.available_models.join(",") || "-"}`,
    ],
  };
}

function buildVmodelFitBlockers(input: {
  snapshot: ProjectCurrentLocationSnapshot;
  zip: VmodelZipManifestFitView;
  zipBindings: VmodelZipSourceBindingFitView;
  acceptanceTraceability: VmodelAcceptanceTraceabilityGate;
  functionAbsorption: VmodelFunctionDesignAbsorptionGate;
  roadmapGate: VmodelRoadmapCurrentGate;
  driveGate: VmodelDriveModelGate;
  currentGate: VmodelCurrentLocationGate;
}): VmodelFitBlocker[] {
  const {
    snapshot,
    zip,
    zipBindings,
    acceptanceTraceability,
    functionAbsorption,
    roadmapGate,
    driveGate,
    currentGate,
  } = input;
  const blockers: VmodelFitBlocker[] = [];
  if (snapshot.design_coverage_gate.status !== "pass") {
    blockers.push({
      code: "design_coverage",
      status: snapshot.design_coverage_gate.status,
      count: snapshot.design_coverage_gate.missing + snapshot.design_coverage_gate.reverify,
      command: "helix current-location --json",
      required_action: "missing/reverify の L12 design coverage を typed declaration で補う",
      doc_dependencies: [...snapshot.design_coverage_gate.docDependencies],
      implementation_dependencies: [...snapshot.design_coverage_gate.implementationDependencies],
    });
  }
  if (acceptanceTraceability.status !== "pass") {
    blockers.push({
      code: "acceptance_traceability",
      status: acceptanceTraceability.status,
      count: acceptanceTraceability.declared + acceptanceTraceability.missing,
      command: acceptanceTraceability.command,
      required_action: acceptanceTraceability.required_action,
      doc_dependencies: [...snapshot.acceptance_traceability.docDependencies],
      implementation_dependencies: [...snapshot.acceptance_traceability.implementationDependencies],
    });
  }
  if (functionAbsorption.status !== "pass") {
    const missingCount = [
      functionAbsorption.detail_contract_coverage_status === "covered",
      functionAbsorption.tailoring_detail_contract_status === "declared",
    ].filter((passed) => !passed).length;
    blockers.push({
      code: "function_design_absorption",
      status: functionAbsorption.status,
      count: missingCount,
      command: functionAbsorption.command,
      required_action: functionAbsorption.required_action,
      doc_dependencies: [
        "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
        "docs/design/helix/L12-vmodel/vmodel-layer-coverage.md",
        "docs/design/helix/L5-detailed-design/",
        "docs/test-design/**",
      ],
      implementation_dependencies: [
        "design_declarations",
        "design_references",
        "test_runs",
        "gate_runs",
        "runtime_verification_events",
      ],
    });
  }
  if (
    roadmapGate.status !== "pass" &&
    roadmapGate.recovery_correlation !== "current_location_recovery"
  ) {
    blockers.push({
      code: "roadmap_current",
      status: roadmapGate.status,
      count: roadmapGate.blocker_count,
      command: roadmapGate.command,
      required_action: roadmapGate.required_action,
      doc_dependencies: ["docs/plans/**", "docs/design/**", "docs/test-design/**"],
      implementation_dependencies: [
        "roadmap_rollups",
        "roadmap_band_coverage",
        "roadmap_gate_progress",
        "plan_registry",
      ],
    });
  }
  if (driveGate.status !== "pass") {
    blockers.push({
      code: "drive_model",
      status: driveGate.status,
      count: 1,
      command: driveGate.command,
      required_action: driveGate.required_action,
      doc_dependencies: ["docs/design/**", "docs/test-design/**", "docs/plans/**"],
      implementation_dependencies: ["plan_registry", "roadmap_rollups", "design_declarations"],
    });
  }
  if (snapshot.zip_adoption.status !== "complete") {
    blockers.push({
      code: "zip_adoption",
      status: snapshot.zip_adoption.status,
      count: snapshot.zip_adoption.missing,
      command: "helix current-location --json",
      required_action: "ZIP 採用/補完/非採用判断を adoption matrix に明示する",
      doc_dependencies: [...snapshot.zip_adoption.docDependencies],
      implementation_dependencies: [...snapshot.zip_adoption.implementationDependencies],
    });
  }
  if (zip.status === "violation") {
    blockers.push({
      code: "zip_manifest",
      status: zip.status,
      count: zip.required_total - zip.required_present,
      command: "helix doctor",
      required_action: "必須 ZIP source を確認し、manifest violation を解消する",
      doc_dependencies: [VMODEL_ZIP_FILENAME],
      implementation_dependencies: ["src/vmodel/zip-manifest.ts"],
    });
  }
  if (zip.inventory_signature.status === "mismatch") {
    blockers.push({
      code: "zip_inventory_signature",
      status: zip.inventory_signature.status,
      count: zip.inventory_signature.mismatches.length,
      command: "helix doctor",
      required_action:
        "ZIP の entries/root/拡張子分布が採用済み source package signature と一致するか確認する",
      doc_dependencies: [VMODEL_ZIP_FILENAME],
      implementation_dependencies: ["src/vmodel/zip-manifest.ts"],
    });
  }
  if (zipBindings.status === "missing") {
    blockers.push({
      code: "zip_source_bindings",
      status: zipBindings.status,
      count: zipBindings.missing,
      command: "helix vmodel fit --json",
      required_action: "ZIP source binding を HELIX evidence surface へ接続する",
      doc_dependencies: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
      implementation_dependencies: zipBindings.evidence_tables,
    });
  }
  if (snapshot.tailoring_gate.status !== "pass") {
    blockers.push({
      code: "tailoring",
      status: snapshot.tailoring_gate.status,
      count: snapshot.tailoring_gate.missing_required,
      command: "helix current-location --json",
      required_action:
        "required tailoring item を typed declaration で満たす。na は missing と扱わない",
      doc_dependencies: [...snapshot.tailoring_gate.docDependencies],
      implementation_dependencies: [...snapshot.tailoring_gate.implementationDependencies],
    });
  }
  if (snapshot.operation_scope.missing > 0 || snapshot.operation_scope.reverify > 0) {
    blockers.push({
      code: "operation_scope",
      status: "needs_operation_design",
      count: snapshot.operation_scope.missing + snapshot.operation_scope.reverify,
      command: "helix current-location --json",
      required_action:
        "ログ/KPI/runtime verification/運用テスト/class-method contract を L12 operation scope として typed declaration または accepted runtime evidence へ投影する",
      doc_dependencies: [
        "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
        "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
      ],
      implementation_dependencies: [
        "design_declarations",
        "runtime_verification_events",
        "src/state-db/current-location.ts",
      ],
    });
  }
  const scrumGapItems = scrumOperationGapItems(snapshot);
  if (scrumGapItems.length > 0 || scrumOperationGapFinding(snapshot)) {
    blockers.push({
      code: "scrum_operation_gap",
      status: "needs_scrum_operation_projection",
      count: scrumGapItems.length || scrumOperationGapDocDependencies(snapshot).length,
      command: "helix roadmap current --json",
      required_action: SCRUM_OPERATION_FIT_REQUIRED_ACTION,
      doc_dependencies: scrumOperationGapDocDependencies(snapshot),
      implementation_dependencies: scrumOperationGapImplementationDependencies(snapshot),
    });
  }
  if (currentGate.status !== "pass") {
    blockers.push({
      code: "current_location",
      status: currentGate.status,
      count: snapshot.closure.queue.total,
      command:
        snapshot.drive_recommendation.model === "Recovery"
          ? "helix recovery plan --json"
          : "helix current-location --json",
      required_action:
        "current-location の contradiction/recovery queue を解消し、drive model を再計算する",
      doc_dependencies: [...snapshot.drive_route.reverse.docDependencies],
      implementation_dependencies: [...snapshot.drive_route.reverse.implementationDependencies],
    });
  }
  const designIntegrityCount =
    snapshot.counts.unresolved_design_references + snapshot.counts.design_declaration_drifts;
  if (designIntegrityCount > 0) {
    blockers.push({
      code: "design_integrity",
      status: "unresolved",
      count: designIntegrityCount,
      command: "helix current-location --json",
      required_action: "未解決 design reference と declaration drift を解消する",
      doc_dependencies: ["docs/design/**", "docs/test-design/**"],
      implementation_dependencies: ["design_references", "findings"],
    });
  }
  return blockers;
}

function buildVmodelSynthesisReport(input: {
  snapshot: ProjectCurrentLocationSnapshot;
  currentGate: VmodelCurrentLocationGate;
  recoveryHandoffGate: VmodelRecoveryHandoffGate;
  functionAbsorption: VmodelFunctionDesignAbsorptionGate;
  status: VmodelFitStatus;
  blockers: VmodelFitBlocker[];
  nextCommandOverride?: string;
}): VmodelSynthesisReport {
  const declared = input.snapshot.zip_adoption.items.filter((item) => item.status === "declared");
  const byCategory = (category: "adopt" | "complement" | "reject"): string[] =>
    declared
      .filter((item) => item.category === category)
      .map((item) => item.adoptionId)
      .sort();
  const adoptedIds = byCategory("adopt");
  const complementedIds = byCategory("complement");
  const rejectedIds = byCategory("reject");
  const nextCommand =
    input.nextCommandOverride ??
    (input.currentGate.status === "needs_recovery"
      ? input.currentGate.reentry_forecast.next_execution_command
      : "helix drive model --json");
  return {
    status: input.status === "pass" ? "integrated" : "needs_fit",
    source_package: input.snapshot.zip_adoption.sourcePackage,
    source_document: input.snapshot.zip_adoption.sourceDocument,
    common_adopted: adoptedIds.length,
    helix_complemented: complementedIds.length,
    rejected: rejectedIds.length,
    missing_decisions: input.snapshot.zip_adoption.missing,
    adopted_ids: adoptedIds,
    complemented_ids: complementedIds,
    rejected_ids: rejectedIds,
    tailoring_status: input.snapshot.tailoring_gate.status,
    function_design_policy: input.functionAbsorption.independent_layer_policy,
    current_reentry_status: input.currentGate.reentry_forecast.status,
    effective_reentry_status: effectiveVmodelRecoveryReentryStatus(
      input.currentGate.reentry_forecast.status,
      input.recoveryHandoffGate,
    ),
    next_command: nextCommand,
    reasons: [
      `common_adopted=${adoptedIds.length}`,
      `helix_complemented=${complementedIds.length}`,
      `rejected=${rejectedIds.length}`,
      `missing_decisions=${input.snapshot.zip_adoption.missing}`,
      `tailoring=${input.snapshot.tailoring_gate.status}`,
      `function_design_policy=${input.functionAbsorption.independent_layer_policy}`,
      `blockers=${input.blockers.length}`,
    ],
  };
}

function effectiveVmodelRecoveryReentryStatus(
  rawStatus: string,
  handoffGate: Pick<VmodelRecoveryHandoffGate, "status" | "effective_phase"> | null,
): string {
  if (!handoffGate || handoffGate.status === "none") return rawStatus;
  if (handoffGate.effective_phase === "approval") return handoffGate.status;
  if (handoffGate.status === "apply_dry_run") return "apply_ready";
  return rawStatus;
}

function vmodelNextActionPriority(blocker: VmodelFitBlocker): number {
  switch (blocker.code) {
    case "zip_manifest":
    case "zip_inventory_signature":
      return 5;
    case "zip_source_bindings":
      return 10;
    case "current_location":
      return 20;
    case "roadmap_current":
      return 30;
    case "zip_adoption":
    case "tailoring":
      return 40;
    case "acceptance_traceability":
      return 45;
    case "function_design_absorption":
    case "design_coverage":
      return 50;
    case "operation_scope":
      return 60;
    case "scrum_operation_gap":
      return 62;
    case "drive_model":
      return 70;
    case "design_integrity":
      return 80;
  }
}

function vmodelNextActionAutomationClass(
  blocker: VmodelFitBlocker,
  currentGate: VmodelCurrentLocationGate,
  workBucket?: VmodelNextActionWorkBucket | null,
): VmodelNextAction["automation_class"] {
  if (blocker.code === "current_location") {
    const handoffStatus = workBucket?.evidence_handoff_next?.status;
    if (
      handoffStatus === "approval_pending" ||
      handoffStatus === "approval_required" ||
      handoffStatus === "approval_rejected"
    ) {
      return "approval";
    }
    if (handoffStatus) return "machine";
    return currentGate.reentry_forecast.next_phase_type === "approval" ? "approval" : "machine";
  }
  if (blocker.code === "roadmap_current" || blocker.code === "drive_model") return "verification";
  if (blocker.code === "zip_manifest" || blocker.code === "zip_inventory_signature") {
    return "verification";
  }
  if (
    blocker.code === "design_coverage" ||
    blocker.code === "acceptance_traceability" ||
    blocker.code === "function_design_absorption" ||
    blocker.code === "tailoring" ||
    blocker.code === "operation_scope" ||
    blocker.code === "scrum_operation_gap"
  ) {
    return "design";
  }
  return "machine";
}

function inspectVmodelHandoffArtifact(input: {
  repoRoot?: string;
  kind: VmodelHandoffArtifactStatus["kind"];
  path: string;
  generationCommand: string;
  generationStatus: VmodelHandoffArtifactStatus["generation_status"];
  writePolicy: string;
  reasons: string[];
}): VmodelHandoffArtifactStatus {
  if (!input.repoRoot) {
    return {
      kind: input.kind,
      path: input.path,
      status: "unchecked",
      generation_status: "unchecked",
      generation_command: input.generationCommand,
      bytes: null,
      sha256: null,
      write_policy: input.writePolicy,
      reasons: ["repoRoot が無いため handoff artifact の実在は未検査"],
    };
  }
  const absolutePath = join(input.repoRoot, input.path);
  if (!existsSync(absolutePath)) {
    return {
      kind: input.kind,
      path: input.path,
      status: "missing",
      generation_status: input.generationStatus,
      generation_command: input.generationCommand,
      bytes: null,
      sha256: null,
      write_policy: input.writePolicy,
      reasons: input.reasons,
    };
  }
  return {
    kind: input.kind,
    path: input.path,
    status: "present",
    generation_status: "present",
    generation_command: input.generationCommand,
    bytes: statSync(absolutePath).size,
    sha256: `sha256:${createHash("sha256").update(readFileSync(absolutePath)).digest("hex")}`,
    write_policy: input.writePolicy,
    reasons: ["handoff artifact を repoRoot から検出した"],
  };
}

function parseVmodelApprovalRecord(text: string | null): VmodelApprovalRecordStatus {
  if (text === null) {
    return {
      status: "missing",
      decision_id: null,
      outcome: null,
      approval_scope_digest: null,
      expected_approval_scope_digest: null,
      scope_status: "not_checked",
      materialize_status: null,
      reviewed_candidate_count: null,
      valid_for_apply: false,
      reasons: ["approval draft artifact が存在しない"],
    };
  }
  const decisionId = /^decision_id:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const outcome = /^outcome:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const approvalScopeDigest = /^approval_scope_digest:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const reviewedCandidateCountRaw =
    /^reviewed_candidate_count:\s*(.+)$/m.exec(text)?.[1]?.trim() ?? null;
  const reviewedCandidateCount =
    reviewedCandidateCountRaw === null ? null : Number(reviewedCandidateCountRaw);
  const missing: string[] = [];
  if (decisionId === null) missing.push("decision_id");
  if (outcome === null) missing.push("outcome");
  if (approvalScopeDigest === null) missing.push("approval_scope_digest");
  if (reviewedCandidateCountRaw !== null && !Number.isFinite(reviewedCandidateCount)) {
    missing.push("reviewed_candidate_count:number");
  }
  if (missing.length > 0) {
    return {
      status: "invalid",
      decision_id: decisionId,
      outcome,
      approval_scope_digest: approvalScopeDigest,
      expected_approval_scope_digest: null,
      scope_status: approvalScopeDigest === null ? "missing" : "not_checked",
      materialize_status: null,
      reviewed_candidate_count: Number.isFinite(reviewedCandidateCount)
        ? reviewedCandidateCount
        : null,
      valid_for_apply: false,
      reasons: [`approval record fields invalid: ${missing.join(",")}`],
    };
  }
  if (outcome === "pending_human_review") {
    return {
      status: "pending_human_review",
      decision_id: decisionId,
      outcome,
      approval_scope_digest: approvalScopeDigest,
      expected_approval_scope_digest: null,
      scope_status: "not_checked",
      materialize_status: null,
      reviewed_candidate_count: Number.isFinite(reviewedCandidateCount)
        ? reviewedCandidateCount
        : null,
      valid_for_apply: false,
      reasons: ["人間レビュー待ちの non-authorizing approval draft"],
    };
  }
  if (outcome === "approve_materialized_evidence") {
    return {
      status: "approved",
      decision_id: decisionId,
      outcome,
      approval_scope_digest: approvalScopeDigest,
      expected_approval_scope_digest: null,
      scope_status: "not_checked",
      materialize_status: null,
      reviewed_candidate_count: Number.isFinite(reviewedCandidateCount)
        ? reviewedCandidateCount
        : null,
      valid_for_apply: true,
      reasons: ["approval outcome は approve_materialized_evidence"],
    };
  }
  if (outcome === "reject_materialized_evidence") {
    return {
      status: "rejected",
      decision_id: decisionId,
      outcome,
      approval_scope_digest: approvalScopeDigest,
      expected_approval_scope_digest: null,
      scope_status: "not_checked",
      materialize_status: null,
      reviewed_candidate_count: Number.isFinite(reviewedCandidateCount)
        ? reviewedCandidateCount
        : null,
      valid_for_apply: false,
      reasons: ["approval outcome は reject_materialized_evidence"],
    };
  }
  return {
    status: "invalid",
    decision_id: decisionId,
    outcome,
    approval_scope_digest: approvalScopeDigest,
    expected_approval_scope_digest: null,
    scope_status: approvalScopeDigest === null ? "missing" : "not_checked",
    materialize_status: null,
    reviewed_candidate_count: Number.isFinite(reviewedCandidateCount)
      ? reviewedCandidateCount
      : null,
    valid_for_apply: false,
    reasons: [`unknown approval outcome: ${outcome}`],
  };
}

function readVmodelProbeExecution(input: {
  repoRoot?: string;
  path: string;
}): ProjectClosureEvidenceProbeExecution | null {
  if (!input.repoRoot) return null;
  const absolutePath = join(input.repoRoot, input.path);
  if (!existsSync(absolutePath)) return null;
  try {
    const parsed = JSON.parse(readFileSync(absolutePath, "utf8")) as {
      execution?: ProjectClosureEvidenceProbeExecution | null;
    };
    return parsed.execution ?? null;
  } catch {
    return null;
  }
}

function withVmodelApprovalScopeCheck(input: {
  approval: VmodelApprovalRecordStatus;
  snapshot: ProjectCurrentLocationSnapshot;
  action: ProjectClosureQueueNextAction;
  probeExecution: ProjectClosureEvidenceProbeExecution | null;
}): VmodelApprovalRecordStatus {
  if (input.probeExecution === null) {
    return {
      ...input.approval,
      reasons: [...input.approval.reasons, "probe execution が読めないため scope digest は未照合"],
    };
  }
  const commandLimit = projectClosureActionCommandLimit(input.snapshot, input.action, 3);
  const materialize = buildProjectClosureEvidenceMaterializePacket(input.snapshot, {
    action: input.action,
    limit: commandLimit,
    probeExecution: input.probeExecution,
  });
  const expected = materialize.approval.approval_scope_digest;
  const scopeStatus: VmodelApprovalRecordStatus["scope_status"] =
    input.approval.approval_scope_digest === null
      ? "missing"
      : input.approval.approval_scope_digest === expected
        ? "match"
        : "mismatch";
  const scopeReasons =
    scopeStatus === "match"
      ? ["approval_scope_digest は current materialize scope と一致"]
      : scopeStatus === "mismatch"
        ? ["approval_scope_digest が current materialize scope と一致しない"]
        : ["approval_scope_digest が指定されていない"];
  return {
    ...input.approval,
    expected_approval_scope_digest: expected,
    scope_status: scopeStatus,
    materialize_status: materialize.materialize_readiness.status,
    valid_for_apply: input.approval.valid_for_apply && scopeStatus === "match",
    reasons: [...input.approval.reasons, ...scopeReasons],
  };
}

function buildVmodelHandoffStatus(input: {
  snapshot: ProjectCurrentLocationSnapshot;
  action: ProjectClosureQueueNextAction;
  repoRoot?: string;
  artifacts: NonNullable<VmodelNextActionWorkBucket["evidence_handoff_artifacts"]>;
  evidenceProbeCommand: string;
  evidenceApprovalDraftCommand: string;
}): VmodelHandoffStatus {
  const probe = inspectVmodelHandoffArtifact({
    repoRoot: input.repoRoot,
    kind: "probe_record",
    path: input.artifacts.probe_record_path,
    generationCommand: input.evidenceProbeCommand,
    generationStatus: "ready_to_generate",
    writePolicy: input.artifacts.write_policy,
    reasons: ["safe command resolution がある場合に probe artifact を生成できる"],
  });
  const draft = inspectVmodelHandoffArtifact({
    repoRoot: input.repoRoot,
    kind: "approval_draft",
    path: input.artifacts.approval_draft_path,
    generationCommand: input.evidenceApprovalDraftCommand,
    generationStatus: probe.status === "present" ? "ready_to_generate" : "waiting_for_probe",
    writePolicy: input.artifacts.write_policy,
    reasons:
      probe.status === "present"
        ? ["probe record があるため approval draft artifact を生成できる"]
        : ["approval draft 生成には probe record が必要"],
  });
  const rawApprovalRecord =
    input.repoRoot && draft.status === "present"
      ? parseVmodelApprovalRecord(readFileSync(join(input.repoRoot, draft.path), "utf8"))
      : draft.status === "unchecked"
        ? {
            status: "unchecked" as const,
            decision_id: null,
            outcome: null,
            approval_scope_digest: null,
            expected_approval_scope_digest: null,
            scope_status: "not_checked" as const,
            materialize_status: null,
            reviewed_candidate_count: null,
            valid_for_apply: false,
            reasons: ["repoRoot が無いため approval draft の内容は未検査"],
          }
        : parseVmodelApprovalRecord(null);
  const approvalRecord =
    rawApprovalRecord.status === "missing" || rawApprovalRecord.status === "unchecked"
      ? rawApprovalRecord
      : withVmodelApprovalScopeCheck({
          approval: rawApprovalRecord,
          snapshot: input.snapshot,
          action: input.action,
          probeExecution: readVmodelProbeExecution({
            repoRoot: input.repoRoot,
            path: input.artifacts.probe_record_path,
          }),
        });
  let activeApprovalRecord = approvalRecord;
  let activeApprovalRecordPath: string | null =
    draft.status === "present" ? input.artifacts.approval_draft_path : null;
  if (
    input.repoRoot &&
    approvalRecord.scope_status === "mismatch" &&
    approvalRecord.expected_approval_scope_digest
  ) {
    const refreshPath = closureEvidenceApprovalDraftRefreshPath(
      input.action,
      approvalRecord.expected_approval_scope_digest,
    );
    const refreshAbsolutePath = join(input.repoRoot, refreshPath);
    if (existsSync(refreshAbsolutePath)) {
      const refreshApprovalRecord = withVmodelApprovalScopeCheck({
        approval: parseVmodelApprovalRecord(readFileSync(refreshAbsolutePath, "utf8")),
        snapshot: input.snapshot,
        action: input.action,
        probeExecution: readVmodelProbeExecution({
          repoRoot: input.repoRoot,
          path: input.artifacts.probe_record_path,
        }),
      });
      if (refreshApprovalRecord.scope_status === "match") {
        activeApprovalRecord = {
          ...refreshApprovalRecord,
          reasons: [
            ...refreshApprovalRecord.reasons,
            `active_approval_record_path=${refreshPath}`,
            `canonical_approval_draft_path=${input.artifacts.approval_draft_path}`,
          ],
        };
        activeApprovalRecordPath = refreshPath;
      }
    }
  }
  const items = [probe, draft];
  return {
    present: items.filter((item) => item.status === "present").length,
    missing: items.filter((item) => item.status === "missing").length,
    unchecked: items.filter((item) => item.status === "unchecked").length,
    items,
    approval_record: activeApprovalRecord,
    approval_record_path: activeApprovalRecordPath,
  };
}

function vmodelApprovalState(
  approval: VmodelApprovalRecordStatus | null | undefined,
): VmodelHandoffNextStep["approval_state"] {
  return approval?.status ?? "not_required";
}

function vmodelHandoffReasonCodes(input: {
  status: VmodelHandoffNextStep["status"];
  approval?: VmodelApprovalRecordStatus | null;
  extras?: string[];
}): string[] {
  const approval = input.approval ?? null;
  return [
    `handoff.status.${input.status}`,
    `approval.${vmodelApprovalState(approval)}`,
    `approval.scope.${approval?.scope_status ?? "none"}`,
    `approval.valid_for_apply.${approval?.valid_for_apply ?? false}`,
    ...(input.extras ?? []),
  ];
}

function buildVmodelHandoffNextStep(input: {
  action: ProjectClosureQueueNextAction;
  commandLimit: number;
  status: VmodelHandoffStatus | null;
  evidenceProbeCommand: string;
  evidenceApprovalDraftCommand: string;
  evidenceMaterializeCommand: string;
  evidenceApplyDryRunCommand: string;
  approvalRecordPath: string;
}): VmodelHandoffNextStep | null {
  if (!input.status) return null;
  const probe = input.status.items.find((item) => item.kind === "probe_record");
  const draft = input.status.items.find((item) => item.kind === "approval_draft");
  if (probe?.status === "unchecked" || draft?.status === "unchecked") {
    return {
      status: "unchecked",
      approval_state: vmodelApprovalState(input.status.approval_record),
      scope_status: input.status.approval_record?.scope_status ?? null,
      valid_for_apply: input.status.approval_record?.valid_for_apply ?? false,
      command: input.evidenceProbeCommand,
      label: "handoff unchecked",
      required_action: "repoRoot 付き fit gate で handoff artifact の実在を再検査する",
      reason_codes: vmodelHandoffReasonCodes({
        status: "unchecked",
        approval: input.status.approval_record,
        extras: ["handoff.artifact.unchecked"],
      }),
      reasons: [
        `present=${input.status.present}`,
        `missing=${input.status.missing}`,
        `unchecked=${input.status.unchecked}`,
      ],
    };
  }
  if (probe?.status !== "present") {
    return {
      status: "generate_probe",
      approval_state: vmodelApprovalState(input.status.approval_record),
      scope_status: input.status.approval_record?.scope_status ?? null,
      valid_for_apply: input.status.approval_record?.valid_for_apply ?? false,
      command: probe?.generation_command ?? input.evidenceProbeCommand,
      label: "generate probe record",
      required_action: "verification command を実行し、probe record artifact を生成する",
      reason_codes: vmodelHandoffReasonCodes({
        status: "generate_probe",
        approval: input.status.approval_record,
        extras: ["handoff.probe_record.missing"],
      }),
      reasons: probe?.reasons ?? ["probe_record is not present"],
    };
  }
  if (draft?.status !== "present") {
    return {
      status: "generate_approval_draft",
      approval_state: vmodelApprovalState(input.status.approval_record),
      scope_status: input.status.approval_record?.scope_status ?? null,
      valid_for_apply: input.status.approval_record?.valid_for_apply ?? false,
      command: draft?.generation_command ?? input.evidenceApprovalDraftCommand,
      label: "generate approval draft",
      required_action: "probe record から non-authorizing approval draft を生成する",
      reason_codes: vmodelHandoffReasonCodes({
        status: "generate_approval_draft",
        approval: input.status.approval_record,
        extras: ["handoff.approval_draft.missing"],
      }),
      reasons: draft?.reasons ?? ["approval_draft is not present"],
    };
  }
  const approval = input.status.approval_record;
  const approvalRecordPath = input.status.approval_record_path ?? input.approvalRecordPath;
  if (approval?.scope_status === "mismatch" && approval.expected_approval_scope_digest) {
    const refreshPath = closureEvidenceApprovalDraftRefreshPath(
      input.action,
      approval.expected_approval_scope_digest,
    );
    return {
      status: "refresh_approval_draft",
      approval_state: vmodelApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: false,
      command: closureEvidenceApprovalDraftCommand(input.action, input.commandLimit, refreshPath),
      label: "refresh approval draft",
      required_action:
        "既存 approval draft は current materialize scope と不一致。既存ファイルを上書きせず refresh draft を再生成する",
      reason_codes: vmodelHandoffReasonCodes({
        status: "refresh_approval_draft",
        approval,
        extras: [
          "approval.scope.mismatch",
          "approval.draft.stale",
          "approval.refresh.non_destructive",
        ],
      }),
      reasons: [
        ...approval.reasons,
        `canonical_approval_draft_path=${input.approvalRecordPath}`,
        `refresh_approval_draft_path=${refreshPath}`,
      ],
    };
  }
  if (approval?.status === "approved" && approval.valid_for_apply) {
    return {
      status: "apply_dry_run",
      approval_state: vmodelApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.evidenceApplyDryRunCommand.replace(
        "<approved-approval-record-path>",
        approvalRecordPath,
      ),
      label: "apply dry-run approved evidence",
      required_action:
        "承認済み record を使って apply dry-run を実行し、digest/approval scope と patch candidate を照合する",
      reason_codes: vmodelHandoffReasonCodes({
        status: "apply_dry_run",
        approval,
        extras: ["handoff.apply.dry_run_ready", "approval.record.approved"],
      }),
      reasons: [...approval.reasons, "execute remains separate approval-required surface"],
    };
  }
  if (approval?.status === "pending_human_review") {
    return {
      status: "approval_pending",
      approval_state: vmodelApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.evidenceMaterializeCommand,
      label: "approval pending",
      required_action:
        "materialized preview と approval_scope_digest を確認し、人間判断で outcome を approve/reject に更新する",
      reason_codes: vmodelHandoffReasonCodes({
        status: "approval_pending",
        approval,
        extras: ["approval.waiting_for_human_review"],
      }),
      reasons: approval.reasons,
    };
  }
  if (approval?.status === "rejected") {
    return {
      status: "approval_rejected",
      approval_state: vmodelApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.evidenceMaterializeCommand,
      label: "approval rejected",
      required_action: "reject 理由に従って evidence projection または設計/テスト設計へ戻す",
      reason_codes: vmodelHandoffReasonCodes({
        status: "approval_rejected",
        approval,
        extras: ["approval.record.rejected"],
      }),
      reasons: approval.reasons,
    };
  }
  if (approval?.status === "invalid") {
    return {
      status: "approval_required",
      approval_state: vmodelApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.evidenceApprovalDraftCommand,
      label: "approval record invalid",
      required_action: "approval record の必須 field/outcome を修正してから dry-run する",
      reason_codes: vmodelHandoffReasonCodes({
        status: "approval_required",
        approval,
        extras: ["approval.record.invalid"],
      }),
      reasons: approval.reasons,
    };
  }
  return {
    status: "approval_required",
    approval_state: vmodelApprovalState(approval),
    scope_status: approval?.scope_status ?? null,
    valid_for_apply: approval?.valid_for_apply ?? false,
    command: input.evidenceMaterializeCommand,
    label: "review materialized evidence",
    required_action:
      "materialized preview と approval_scope_digest を確認し、人間承認後に apply dry-run/execute を扱う",
    reason_codes: vmodelHandoffReasonCodes({
      status: "approval_required",
      approval,
      extras: [
        "handoff.probe_record.present",
        "handoff.approval_draft.present",
        "approval.apply_requires_human",
      ],
    }),
    reasons: ["probe_record=present", "approval_draft=present", "apply remains approval-required"],
  };
}

function buildVmodelNextActions(input: {
  snapshot: ProjectCurrentLocationSnapshot;
  blockers: VmodelFitBlocker[];
  currentGate: VmodelCurrentLocationGate;
  repoRoot?: string;
}): VmodelNextAction[] {
  if (input.blockers.length === 0) {
    return [
      {
        priority: 100,
        action_id: "vmodel-fit:accept",
        blocker_code: "none",
        status: "pass",
        command: "helix drive model --json",
        gate: "accept",
        automation_class: "none",
        count: 0,
        required_action: "V-model fit は pass。次の drive model selection に従う",
        doc_dependencies: [],
        implementation_dependencies: [],
        reasons: ["no blockers"],
        work_bucket: null,
      },
    ];
  }
  return input.blockers
    .map((blocker): VmodelNextAction => {
      const isCurrent = blocker.code === "current_location";
      const gate = isCurrent ? input.currentGate.reentry_forecast.next_gate : blocker.code;
      const reentryAction = input.currentGate.reentry_forecast.next_phase_action ?? "";
      const workBucket =
        isCurrent && isProjectClosureQueueNextAction(reentryAction)
          ? buildVmodelNextActionWorkBucket({
              snapshot: input.snapshot,
              action: reentryAction,
              repoRoot: input.repoRoot,
            })
          : null;
      const command = isCurrent
        ? (workBucket?.evidence_handoff_next?.command ??
          input.currentGate.reentry_forecast.next_execution_command)
        : blocker.command;
      return {
        priority: vmodelNextActionPriority(blocker),
        action_id: `vmodel-fit:${blocker.code}`,
        blocker_code: blocker.code,
        status: blocker.status,
        command,
        gate,
        automation_class: vmodelNextActionAutomationClass(blocker, input.currentGate, workBucket),
        count: blocker.count,
        required_action: isCurrent
          ? `Recovery reentry phase を進める: ${input.currentGate.reentry_forecast.next_phase_action ?? "-"}`
          : blocker.required_action,
        doc_dependencies: [...blocker.doc_dependencies],
        implementation_dependencies: [...blocker.implementation_dependencies],
        reasons: [
          `blocker=${blocker.code}`,
          `count=${blocker.count}`,
          `gate=${gate}`,
          ...(workBucket
            ? [
                `work_bucket=${workBucket.evidence_signature}`,
                `failed_evidence=${workBucket.failed_evidence_count}`,
                `projection_items=${workBucket.projection_item_count}`,
                `handoff_next=${workBucket.evidence_handoff_next?.status ?? "none"}`,
              ]
            : []),
          isCurrent
            ? `reentry=${input.currentGate.reentry_forecast.status}`
            : `status=${blocker.status}`,
        ],
        work_bucket: workBucket,
      };
    })
    .sort((a, b) => a.priority - b.priority || a.action_id.localeCompare(b.action_id));
}

function buildVmodelNextActionWorkBucket(input: {
  snapshot: ProjectCurrentLocationSnapshot;
  action: ProjectClosureQueueNextAction;
  repoRoot?: string;
}): VmodelNextActionWorkBucket | null {
  const batch = buildProjectClosureBatchReport(input.snapshot, {
    action: input.action,
    limit: 3,
  });
  const bucket = batch.work_buckets[0];
  if (!bucket) return null;
  const evidencePatchCandidateCount = bucket.repair_plan.projection_items.reduce(
    (sum, item) => sum + item.evidence_patch_plan.patch_candidates.length,
    0,
  );
  const evidenceCommandLimit = Math.max(1, bucket.listed);
  const evidenceProbeCommand = closureEvidenceProbeCommand(bucket.action, evidenceCommandLimit);
  const evidenceMaterializeCommand = closureEvidenceMaterializeCommand(
    bucket.action,
    evidenceCommandLimit,
  );
  const evidenceApprovalDraftCommand = closureEvidenceApprovalDraftCommand(
    bucket.action,
    evidenceCommandLimit,
  );
  const evidenceApplyDryRunCommand = closureEvidenceApplyDryRunCommand(
    bucket.action,
    evidenceCommandLimit,
  );
  const evidenceHandoffArtifacts = closureEvidenceHandoffArtifacts(bucket.action);
  const evidenceHandoffStatus = evidenceHandoffArtifacts
    ? buildVmodelHandoffStatus({
        snapshot: input.snapshot,
        action: input.action,
        repoRoot: input.repoRoot,
        artifacts: evidenceHandoffArtifacts,
        evidenceProbeCommand,
        evidenceApprovalDraftCommand,
      })
    : null;
  const evidenceHandoffNext = evidenceHandoffArtifacts
    ? buildVmodelHandoffNextStep({
        action: bucket.action,
        commandLimit: evidenceCommandLimit,
        status: evidenceHandoffStatus,
        evidenceProbeCommand,
        evidenceApprovalDraftCommand,
        evidenceMaterializeCommand,
        evidenceApplyDryRunCommand,
        approvalRecordPath: evidenceHandoffArtifacts.approval_draft_path,
      })
    : null;
  return {
    bucket_id: bucket.bucket_id,
    action: bucket.action,
    evidence_signature: bucket.evidence_signature,
    count: bucket.count,
    listed: bucket.listed,
    omitted: bucket.omitted,
    target_tables: [...bucket.target_tables],
    primary_command: bucket.primary_command,
    evidence_patch_command: `helix closure evidence-patch --action ${bucket.action} --summary-json`,
    evidence_patch_write_policy: "approval-required",
    evidence_patch_candidate_count: evidencePatchCandidateCount,
    evidence_probe_command: evidenceProbeCommand,
    evidence_materialize_command: evidenceMaterializeCommand,
    evidence_approval_draft_command: evidenceApprovalDraftCommand,
    evidence_apply_dry_run_command: evidenceApplyDryRunCommand,
    evidence_apply_execute_command: closureEvidenceApplyExecuteCommand(
      bucket.action,
      evidenceCommandLimit,
    ),
    evidence_apply_write_policy: "approval-required",
    evidence_handoff_artifacts: evidenceHandoffArtifacts,
    evidence_handoff_status: evidenceHandoffStatus,
    evidence_handoff_next: evidenceHandoffNext,
    repair_status: bucket.repair_plan.status,
    repair_automation_status: bucket.repair_plan.automation.status,
    repair_primary_next_command: bucket.repair_plan.automation.primary_next_command,
    failed_evidence_count: bucket.repair_plan.failed_evidence_count,
    projection_item_count: bucket.repair_plan.projection_items.length,
    projection_plan_ids: [...bucket.repair_plan.projection_plan_ids],
    required_green_tables: [...bucket.repair_plan.required_green_tables],
    command_candidates: bucket.repair_plan.command_candidates.slice(0, 3).map((candidate) => ({
      command_label: candidate.command_label,
      command_verb: candidate.command_verb,
      runnable_command: candidate.runnable_command,
      resolution_candidates: candidate.resolution_candidates.map((resolution) => ({
        command: resolution.command,
        source: resolution.source,
        confidence: resolution.confidence,
        safe_to_run: resolution.safe_to_run,
        projection_binding: {
          target_tables: [...resolution.projection_binding.target_tables],
          source_surfaces: [...resolution.projection_binding.source_surfaces],
          required_fields: [...resolution.projection_binding.required_fields],
          success_status: resolution.projection_binding.success_status,
          write_policy: resolution.projection_binding.write_policy,
          postcheck_commands: [...resolution.projection_binding.postcheck_commands],
          required_action: resolution.projection_binding.required_action,
        },
        required_action: resolution.required_action,
      })),
      count: candidate.count,
      latest_observed_at: candidate.latest_observed_at,
    })),
    sample_plan_ids: [...bucket.sample_plan_ids],
    postcheck_commands: [...bucket.postcheck_commands],
  };
}

function buildVmodelRegressionGuards(input: {
  snapshot: ProjectCurrentLocationSnapshot;
  zip: VmodelZipManifestFitView;
  zipBindings: VmodelZipSourceBindingFitView;
  acceptanceTraceability: VmodelAcceptanceTraceabilityGate;
  functionAbsorption: VmodelFunctionDesignAbsorptionGate;
  currentGate: VmodelCurrentLocationGate;
  recoveryHandoffGate: VmodelRecoveryHandoffGate;
  currentLocationReentryCommand?: string;
}): VmodelRegressionGuardReport {
  const runtimeVerificationScope = input.snapshot.operation_scope.items.find(
    (item) => item.scope === "runtime_verification",
  );
  const unobservedRuntimeVerification =
    runtimeVerificationScope?.status === "designed" && runtimeVerificationScope.observedCount === 0;
  const scrumGapItems = scrumOperationGapItems(input.snapshot);
  const scrumGapFinding = scrumOperationGapFinding(input.snapshot);
  const guards: VmodelRegressionGuard[] = [
    {
      guard_id: "zip-source-integrity",
      status:
        input.zip.status === "violation" ||
        input.zip.inventory_signature.status === "mismatch" ||
        input.zipBindings.status === "missing"
          ? "fail"
          : input.zip.status === "advisory_missing" ||
              input.zip.inventory_signature.status === "advisory_missing" ||
              input.zipBindings.status === "advisory_missing"
            ? "watch"
            : "pass",
      scope: "ZIP source manifest and HELIX bindings",
      command: "helix doctor",
      protected_surface: [VMODEL_ZIP_FILENAME, "zip_source_bindings"],
      count:
        input.zip.findings.length +
        input.zip.inventory_signature.mismatches.length +
        input.zipBindings.missing,
      required_action: "ZIP source と HELIX evidence binding の欠落・不一致を解消する",
      reasons: [
        `manifest=${input.zip.status}`,
        `inventory=${input.zip.inventory_signature.status}`,
        `bindings=${input.zipBindings.status}`,
      ],
    },
    {
      guard_id: "acceptance-traceability",
      status: input.acceptanceTraceability.status === "pass" ? "pass" : "fail",
      scope: "VMFIT requirement to acceptance criteria trace",
      command: input.acceptanceTraceability.command,
      protected_surface: ["design_declarations", "design_references", "acceptance criteria"],
      count: input.acceptanceTraceability.declared + input.acceptanceTraceability.missing,
      required_action: input.acceptanceTraceability.required_action,
      reasons: [...input.acceptanceTraceability.reasons],
    },
    {
      guard_id: "design-coverage",
      status: input.snapshot.design_coverage_gate.status === "pass" ? "pass" : "fail",
      scope: "L12 design coverage",
      command: "helix current-location --json",
      protected_surface: ["design_coverage_gate", "design_declarations"],
      count:
        input.snapshot.design_coverage_gate.missing + input.snapshot.design_coverage_gate.reverify,
      required_action:
        "missing/reverify coverage を typed declaration と設計・テスト設計へ戻して補う",
      reasons: [`status=${input.snapshot.design_coverage_gate.status}`],
    },
    {
      guard_id: "implementation-binding",
      status:
        input.functionAbsorption.status === "pass" &&
        input.snapshot.counts.design_declaration_drifts === 0
          ? "pass"
          : "fail",
      scope: "L5 contract to implementation/runtime evidence",
      command: "helix current-location --json",
      protected_surface: ["function_design_absorption", "design_declarations", "runtime evidence"],
      count:
        (input.functionAbsorption.status === "pass" ? 0 : 1) +
        input.snapshot.counts.design_declaration_drifts,
      required_action: "独立機能設計を復活させず、L5 詳細契約と typed/runtime evidence へ吸収する",
      reasons: [
        `function_absorption=${input.functionAbsorption.status}`,
        `drift=${input.snapshot.counts.design_declaration_drifts}`,
      ],
    },
    {
      guard_id: "trace-impact-integrity",
      status:
        input.snapshot.counts.unresolved_design_references === 0 &&
        input.snapshot.counts.design_declaration_drifts === 0
          ? "pass"
          : "fail",
      scope: "design reference and impact graph",
      command: "helix current-location --json",
      protected_surface: ["design_references", "design_impact", "relation graph"],
      count:
        input.snapshot.counts.unresolved_design_references +
        input.snapshot.counts.design_declaration_drifts,
      required_action: "未解決 reference と declaration drift を解消する",
      reasons: [
        `unresolved=${input.snapshot.counts.unresolved_design_references}`,
        `drift=${input.snapshot.counts.design_declaration_drifts}`,
      ],
    },
    {
      guard_id: "operation-scope",
      status:
        input.snapshot.operation_scope.missing > 0 || input.snapshot.operation_scope.reverify > 0
          ? "fail"
          : unobservedRuntimeVerification
            ? "watch"
            : "pass",
      scope: "L12 operation/log/KPI/runtime verification scope",
      command: "helix current-location --json",
      protected_surface: ["operation_scope", "runtime_verification_events"],
      count:
        input.snapshot.operation_scope.missing +
        input.snapshot.operation_scope.reverify +
        (unobservedRuntimeVerification ? 1 : 0),
      required_action: unobservedRuntimeVerification
        ? "runtime verification を accepted runtime evidence として観測し、運用時の可視化基盤を実証する"
        : "ログ/KPI/runtime verification/運用テストを L12 coverage へ投影する",
      reasons: [
        `missing=${input.snapshot.operation_scope.missing}`,
        `reverify=${input.snapshot.operation_scope.reverify}`,
        `runtime_observed=${runtimeVerificationScope?.observedCount ?? 0}`,
      ],
    },
    {
      guard_id: "scrum-operation",
      status: scrumGapItems.length > 0 || scrumGapFinding ? "fail" : "pass",
      scope: "Hybrid Scrum operation sources to DB/read-model projections",
      command: "helix roadmap current --json",
      protected_surface: [
        "scrum_operation",
        "project_current_location",
        "roadmap_current",
        "project_skill_binding",
      ],
      count: scrumGapItems.length || scrumOperationGapDocDependencies(input.snapshot).length,
      required_action: SCRUM_OPERATION_FIT_REQUIRED_ACTION,
      reasons: [
        `status=${input.snapshot.scrum_operation?.status ?? "missing"}`,
        `missing=${scrumGapItems.length}`,
        `finding=${scrumGapFinding?.severity ?? "none"}`,
        `planning=${input.snapshot.scrum_operation?.planningItems ?? 0}`,
        `ceremony=${input.snapshot.scrum_operation?.ceremonyItems ?? 0}`,
        `metric=${input.snapshot.scrum_operation?.metricItems ?? 0}`,
        `missing_ids=${scrumGapItems.map((item) => item.operationId).join(",") || "-"}`,
      ],
    },
    {
      guard_id: "current-location-reentry",
      status: input.currentGate.status === "pass" ? "pass" : "watch",
      scope: "DB current-location and drive reentry",
      command:
        input.currentLocationReentryCommand ??
        input.currentGate.reentry_forecast.next_execution_command,
      protected_surface: ["current_location", "recovery_runway", "drive_model"],
      count: input.currentGate.reentry_forecast.current_blocking_count,
      required_action:
        "Recovery reentry forecast の next phase を処理して drive model を再計算する",
      reasons: [
        `current=${input.currentGate.current_status}/${input.currentGate.completion_boundary}`,
        `reentry=${input.currentGate.reentry_forecast.status}`,
        `handoff=${input.recoveryHandoffGate.status}`,
        `effective_phase=${input.recoveryHandoffGate.effective_phase}`,
      ],
    },
  ];
  const pass = guards.filter((guard) => guard.status === "pass").length;
  const watch = guards.filter((guard) => guard.status === "watch").length;
  const fail = guards.filter((guard) => guard.status === "fail").length;
  return {
    status: watch === 0 && fail === 0 ? "pass" : "needs_attention",
    pass,
    watch,
    fail,
    guards,
  };
}

function buildVmodelApprovalReviewGate(
  snapshot: ProjectCurrentLocationSnapshot,
): VmodelApprovalReviewGate {
  const bundle = buildProjectClosureReviewBundle(snapshot, {
    action: "close_ready",
  });
  const status: VmodelApprovalReviewGate["status"] =
    bundle.total === 0
      ? "none"
      : bundle.review_scope.blocked_by_findings.length > 0
        ? "blocked_by_findings"
        : "approval_required";
  const requiredAction =
    bundle.total === 0
      ? "close_ready approval lane は未検出。machine / reverse lane を先に処理する"
      : status === "blocked_by_findings"
        ? "blocking finding を解消してから close_ready approval bundle を人間レビューする"
        : "close_ready approval bundle の approval_scope_digest と evidence totals を確認し、人間判断で approve/reject を記録する";
  return {
    status,
    action: "close_ready",
    count: bundle.total,
    listed: bundle.listed,
    omitted: bundle.omitted,
    limit: bundle.limit,
    offset: bundle.offset,
    window: { ...bundle.window },
    approval_required: bundle.approval_required,
    decision_id: bundle.decision.decision_id,
    approval_scope_digest: bundle.review_scope.approval_scope_digest,
    sample_plan_ids: bundle.review_scope.plan_ids.slice(0, 5),
    sample_source_paths: bundle.review_scope.source_paths.slice(0, 5),
    evidence_totals: { ...bundle.review_scope.evidence_totals },
    blocked_by_findings: [...bundle.review_scope.blocked_by_findings],
    review_command: "helix closure review-bundle --action close_ready --summary-json",
    current_window_command: `helix closure review-bundle --action close_ready --limit ${bundle.limit} --offset ${bundle.offset} --summary-json`,
    previous_window_command:
      bundle.window.previous_offset === null
        ? null
        : `helix closure review-bundle --action close_ready --limit ${bundle.limit} --offset ${bundle.window.previous_offset} --summary-json`,
    next_window_command:
      bundle.window.next_offset === null
        ? null
        : `helix closure review-bundle --action close_ready --limit ${bundle.limit} --offset ${bundle.window.next_offset} --summary-json`,
    transition_command: "helix closure transition-plan --action close_ready --summary-json",
    transition_window_command: `helix closure transition-plan --action close_ready --limit ${bundle.limit} --offset ${bundle.offset} --summary-json`,
    previous_transition_window_command:
      bundle.window.previous_offset === null
        ? null
        : `helix closure transition-plan --action close_ready --limit ${bundle.limit} --offset ${bundle.window.previous_offset} --summary-json`,
    next_transition_window_command:
      bundle.window.next_offset === null
        ? null
        : `helix closure transition-plan --action close_ready --limit ${bundle.limit} --offset ${bundle.window.next_offset} --summary-json`,
    outcome_routes: bundle.decision.outcome_routes.map((route) => ({
      ...route,
      doc_dependencies: [...route.doc_dependencies],
      implementation_dependencies: [...route.implementation_dependencies],
      postcheck_commands: [...route.postcheck_commands],
      reasons: [...route.reasons],
    })),
    approval_record_template: [...bundle.decision.approval_record_template],
    required_action: requiredAction,
    reasons: [
      `count=${bundle.total}`,
      `listed=${bundle.listed}`,
      `omitted=${bundle.omitted}`,
      `digest=${bundle.review_scope.approval_scope_digest}`,
      `blocked=${bundle.review_scope.blocked_by_findings.length}`,
      `tests=${bundle.review_scope.evidence_totals.test_runs_passed}/${bundle.review_scope.evidence_totals.test_runs_total}`,
      `gates=${bundle.review_scope.evidence_totals.gate_runs_passed}/${bundle.review_scope.evidence_totals.gate_runs_total}`,
      `runtime=${bundle.review_scope.evidence_totals.runtime_verification_accepted}/${bundle.review_scope.evidence_totals.runtime_verification_total}`,
    ],
  };
}

function buildVmodelRecoveryHandoffGate(
  nextActions: VmodelNextAction[],
): VmodelRecoveryHandoffGate {
  const action = nextActions.find((item) => item.blocker_code === "current_location");
  const handoffNext = action?.work_bucket?.evidence_handoff_next ?? null;
  const handoffStatus = action?.work_bucket?.evidence_handoff_status ?? null;
  if (!action || !handoffNext) {
    return {
      status: "none",
      effective_phase: "none",
      action_id: action?.action_id ?? null,
      blocker_code: action?.blocker_code ?? null,
      command: action?.command ?? "helix vmodel fit --json",
      required_action: "current-location recovery handoff は未検出",
      handoff_present: handoffStatus?.present ?? 0,
      handoff_missing: handoffStatus?.missing ?? 0,
      approval_status: handoffStatus?.approval_record?.status ?? null,
      scope_status: handoffStatus?.approval_record?.scope_status ?? null,
      decision_id: handoffStatus?.approval_record?.decision_id ?? null,
      outcome: handoffStatus?.approval_record?.outcome ?? null,
      approval_record_path: handoffStatus?.approval_record_path ?? null,
      approval_scope_digest: handoffStatus?.approval_record?.approval_scope_digest ?? null,
      expected_approval_scope_digest:
        handoffStatus?.approval_record?.expected_approval_scope_digest ?? null,
      materialize_status: handoffStatus?.approval_record?.materialize_status ?? null,
      reviewed_candidate_count: handoffStatus?.approval_record?.reviewed_candidate_count ?? null,
      valid_for_apply: handoffStatus?.approval_record?.valid_for_apply ?? false,
      approval_state: vmodelApprovalState(handoffStatus?.approval_record),
      reason_codes: ["handoff.status.none", "handoff.next.missing"],
      reasons: ["current_location next action に handoff_next が無い"],
    };
  }
  const effectivePhase: VmodelRecoveryHandoffGate["effective_phase"] =
    handoffNext.status === "approval_pending" ||
    handoffNext.status === "approval_required" ||
    handoffNext.status === "approval_rejected"
      ? "approval"
      : "machine";
  return {
    status: handoffNext.status,
    effective_phase: effectivePhase,
    action_id: action.action_id,
    blocker_code: action.blocker_code,
    command: handoffNext.command,
    required_action: handoffNext.required_action,
    handoff_present: handoffStatus?.present ?? 0,
    handoff_missing: handoffStatus?.missing ?? 0,
    approval_status: handoffStatus?.approval_record?.status ?? null,
    scope_status: handoffStatus?.approval_record?.scope_status ?? null,
    decision_id: handoffStatus?.approval_record?.decision_id ?? null,
    outcome: handoffStatus?.approval_record?.outcome ?? null,
    approval_record_path: handoffStatus?.approval_record_path ?? null,
    approval_scope_digest: handoffStatus?.approval_record?.approval_scope_digest ?? null,
    expected_approval_scope_digest:
      handoffStatus?.approval_record?.expected_approval_scope_digest ?? null,
    materialize_status: handoffStatus?.approval_record?.materialize_status ?? null,
    reviewed_candidate_count: handoffStatus?.approval_record?.reviewed_candidate_count ?? null,
    valid_for_apply: handoffStatus?.approval_record?.valid_for_apply ?? false,
    approval_state: handoffNext.approval_state,
    reason_codes: [
      ...handoffNext.reason_codes,
      `handoff.phase.${effectivePhase}`,
      `action.${action.action_id}`,
      `automation.${action.automation_class}`,
    ],
    reasons: [
      `action=${action.action_id}`,
      `automation=${action.automation_class}`,
      `handoff_next=${handoffNext.status}`,
      `approval=${handoffStatus?.approval_record?.status ?? "-"}`,
      `scope=${handoffStatus?.approval_record?.scope_status ?? "-"}`,
      `decision=${handoffStatus?.approval_record?.decision_id ?? "-"}`,
      `approval_record_path=${handoffStatus?.approval_record_path ?? "-"}`,
      `digest=${handoffStatus?.approval_record?.approval_scope_digest ?? "-"}`,
      `expected_digest=${handoffStatus?.approval_record?.expected_approval_scope_digest ?? "-"}`,
      `materialize=${handoffStatus?.approval_record?.materialize_status ?? "-"}`,
      `valid_for_apply=${handoffStatus?.approval_record?.valid_for_apply ?? false}`,
      ...handoffNext.reasons,
    ],
  };
}

export function buildVmodelFitReport(
  snapshot: ProjectCurrentLocationSnapshot,
  zipManifest?: VmodelZipManifestResult,
  options: { repoRoot?: string } = {},
): VmodelFitReport {
  const zip = zipManifestView(zipManifest);
  const zipBindings = zipSourceBindingView(zipManifest);
  const acceptanceTraceability = acceptanceTraceabilityGate(snapshot);
  const functionAbsorption = functionDesignAbsorptionGate(snapshot);
  const roadmapGate = roadmapCurrentGate(snapshot);
  const driveGate = driveModelGate(snapshot);
  const currentGate = currentLocationGate(snapshot);
  const scrumGapItems = scrumOperationGapItems(snapshot);
  const scrumGapFinding = scrumOperationGapFinding(snapshot);
  const blockers = buildVmodelFitBlockers({
    snapshot,
    zip,
    zipBindings,
    acceptanceTraceability,
    functionAbsorption,
    roadmapGate,
    driveGate,
    currentGate,
  });
  const reasons = [
    snapshot.design_coverage_gate.status === "pass"
      ? "design coverage gate passed"
      : `design coverage gate is ${snapshot.design_coverage_gate.status}`,
    snapshot.zip_adoption.status === "complete"
      ? "ZIP adoption matrix is complete"
      : `ZIP adoption matrix is ${snapshot.zip_adoption.status}`,
    zip.status === "ok"
      ? "ZIP source manifest verified"
      : zip.status === "advisory_missing"
        ? "ZIP source archive is absent; manifest check is advisory"
        : "ZIP source manifest has violations",
    zip.inventory_signature.status === "match"
      ? "ZIP inventory signature matched"
      : zip.inventory_signature.status === "advisory_missing"
        ? "ZIP inventory signature is advisory because source archive is absent"
        : `ZIP inventory signature mismatches=${zip.inventory_signature.mismatches.length}`,
    zipBindings.status === "complete"
      ? "ZIP source bindings are connected to HELIX evidence surfaces"
      : zipBindings.status === "advisory_missing"
        ? "ZIP source bindings are advisory because source archive is absent"
        : `ZIP source bindings missing=${zipBindings.missing}`,
    snapshot.tailoring_gate.status === "pass"
      ? "solo tailoring gate passed"
      : `solo tailoring gate is ${snapshot.tailoring_gate.status}`,
    acceptanceTraceability.status === "pass"
      ? "acceptance traceability gate passed"
      : `acceptance traceability gate is ${acceptanceTraceability.status}`,
    functionAbsorption.status === "pass"
      ? "function design absorption gate passed"
      : `function design absorption is ${functionAbsorption.status}`,
    roadmapGate.status === "pass"
      ? "roadmap current gate passed"
      : roadmapGate.recovery_correlation === "current_location_recovery"
        ? "roadmap current contradiction is correlated with current-location recovery"
        : `roadmap current gate is ${roadmapGate.status}`,
    driveGate.status === "pass"
      ? `drive model gate passed selected=${driveGate.selected_model}`
      : `drive model gate is ${driveGate.status}`,
    snapshot.skill_binding?.status === "ready"
      ? `skill binding ready required=${snapshot.skill_binding.requiredSkills} recommended=${snapshot.skill_binding.recommendedSkills} optional=${snapshot.skill_binding.optionalSkills}`
      : `skill binding is ${snapshot.skill_binding?.status ?? "missing"}`,
    snapshot.operation_scope.missing === 0 && snapshot.operation_scope.reverify === 0
      ? "operation scope gate passed"
      : `operation scope gaps missing=${snapshot.operation_scope.missing} reverify=${snapshot.operation_scope.reverify}`,
    scrumGapItems.length === 0 && !scrumGapFinding
      ? "Scrum operation projection gate passed"
      : `Scrum operation gaps missing=${scrumGapItems.length} finding=${scrumGapFinding?.severity ?? "none"}`,
    currentGate.status === "pass"
      ? "current location is forward-consistent"
      : `current location is ${snapshot.current.status}/${snapshot.current.completion_boundary}`,
    snapshot.counts.unresolved_design_references === 0
      ? "design references resolved"
      : `unresolved design references=${snapshot.counts.unresolved_design_references}`,
    snapshot.counts.design_declaration_drifts === 0
      ? "design declaration drift is zero"
      : `design declaration drift=${snapshot.counts.design_declaration_drifts}`,
  ];
  const status: VmodelFitStatus =
    snapshot.design_coverage_gate.status === "pass" &&
    snapshot.zip_adoption.status === "complete" &&
    zip.status !== "violation" &&
    zip.inventory_signature.status !== "mismatch" &&
    snapshot.tailoring_gate.status === "pass" &&
    acceptanceTraceability.status === "pass" &&
    functionAbsorption.status === "pass" &&
    (roadmapGate.status === "pass" ||
      roadmapGate.recovery_correlation === "current_location_recovery") &&
    driveGate.status === "pass" &&
    snapshot.operation_scope.missing === 0 &&
    snapshot.operation_scope.reverify === 0 &&
    scrumGapItems.length === 0 &&
    !scrumGapFinding &&
    currentGate.status === "pass" &&
    snapshot.counts.unresolved_design_references === 0 &&
    snapshot.counts.design_declaration_drifts === 0
      ? "pass"
      : "needs_fit";
  const nextActions = buildVmodelNextActions({
    snapshot,
    blockers,
    currentGate,
    repoRoot: options.repoRoot,
  });
  const currentLocationNextAction = nextActions.find(
    (action) => action.blocker_code === "current_location",
  );
  const recoveryRunwayGate = buildVmodelRecoveryRunwayGate(currentGate);
  const recoveryHandoffGate = buildVmodelRecoveryHandoffGate(nextActions);
  const approvalReviewGate = buildVmodelApprovalReviewGate(snapshot);
  const synthesis = buildVmodelSynthesisReport({
    snapshot,
    currentGate,
    recoveryHandoffGate,
    functionAbsorption,
    status,
    blockers,
    nextCommandOverride: currentLocationNextAction?.command,
  });
  const regressionGuards = buildVmodelRegressionGuards({
    snapshot,
    zip,
    zipBindings,
    acceptanceTraceability,
    functionAbsorption,
    currentGate,
    recoveryHandoffGate,
    currentLocationReentryCommand: currentLocationNextAction?.command,
  });

  return {
    schema_version: "vmodel-fit.v1",
    status,
    source_clock: snapshot.source_clock,
    design_coverage_gate: snapshot.design_coverage_gate,
    acceptance_traceability_gate: acceptanceTraceability,
    zip_adoption: snapshot.zip_adoption,
    zip_manifest: zip,
    zip_source_bindings: zipBindings,
    tailoring_gate: snapshot.tailoring_gate,
    function_design_absorption: functionAbsorption,
    roadmap_current_gate: roadmapGate,
    drive_model_gate: driveGate,
    skill_binding: snapshot.skill_binding,
    operation_scope: snapshot.operation_scope,
    current_location_gate: currentGate,
    design_integrity: {
      declarations: snapshot.counts.design_declarations,
      references: snapshot.counts.design_references,
      impact: snapshot.counts.design_impact,
      unresolved_references: snapshot.counts.unresolved_design_references,
      declaration_drifts: snapshot.counts.design_declaration_drifts,
    },
    current: snapshot.current,
    drive_route: snapshot.drive_route,
    synthesis,
    next_actions: nextActions,
    recovery_runway_gate: recoveryRunwayGate,
    recovery_handoff_gate: recoveryHandoffGate,
    approval_review_gate: approvalReviewGate,
    regression_guards: regressionGuards,
    blockers,
    reasons,
    write_policy: "read-only",
    source_command: "helix vmodel fit --json",
    current_location_command: "helix current-location --json",
    view_command: "helix progress tree-view --json",
  };
}
