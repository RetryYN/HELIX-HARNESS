import { buildVmodelFitReport } from "../vmodel/fit";
import {
  buildProjectClosureBatchReport,
  buildProjectClosureEvidenceApplyPlan,
  buildProjectClosureEvidenceMaterializePacket,
  buildProjectClosureEvidencePlan,
  buildProjectClosureEvidenceProbePacket,
  buildProjectClosureOverview,
  buildProjectDriveModelReport,
  buildProjectRecoveryPlan,
  closureEvidenceApplyDryRunCommand,
  closureEvidenceApplyExecuteCommand,
  closureEvidenceApprovalDraftCommand,
  closureEvidenceHandoffArtifacts,
  closureEvidenceMaterializeCommand,
  closureEvidenceProbeCommand,
  isProjectClosureQueueNextAction,
  type ProjectScrumOperation,
  type ProjectSkillBinding,
} from "./current-location";
import type { VisualizationSnapshot } from "./visualization-read-model";

/**
 * L6 view-model layer for the visualization surface (PLAN-L6-58 / PLAN-L7-372).
 *
 * `buildVisualizationViewModel` is a pure function: `VisualizationSnapshot` in,
 * `VisualizationViewModel` out. No DB access, no clock reads, no LLM-generated
 * prose in any authoritative field. All numeric fields are derived directly from
 * the input snapshot. Fields the current snapshot cannot honestly populate
 * (pair-filtered graph counts, raw node/edge lists, growth history) are
 * represented as `null` / empty with an explicit warning instead of a
 * fabricated value ("honest degrade").
 */

export type DrilldownKind = "cli" | "table" | "docs";

export interface Drilldown {
  kind: DrilldownKind;
  pointer: string;
}

export interface MetricRow {
  label: string;
  value: number;
  drilldown: Drilldown | null;
}

export interface GraphIrNode {
  id: string;
  label: string;
  group: string;
}

export interface GraphIrEdgeInput {
  from: string;
  to: string;
  kind: string;
}

export interface GraphIrEdge {
  from: string;
  to: string;
  kind: string;
}

export interface GraphIr {
  nodes: GraphIrNode[];
  edges: GraphIrEdge[];
}

export interface LayerProgressView {
  artifacts: MetricRow[];
  plans: MetricRow[];
  gates: MetricRow[];
}

export interface DesignTestPairView {
  pair_edges: number | null;
  orphan_nodes: number | null;
  graph: GraphIr;
}

export interface RelationGraphView {
  node_count: number;
  edge_count: number;
  latest_snapshot_id: string | null;
  latest_snapshot_hash: string | null;
  graph: GraphIr;
  drilldown: Drilldown | null;
}

export interface RuntimeEvidenceView {
  test_runs: MetricRow[];
  runtime_verification: MetricRow[];
  guardrail_decisions: MetricRow[];
}

function emptyScrumOperation(): ProjectScrumOperation {
  return {
    status: "not_observed",
    sourcePackage: "",
    sourceBindings: [],
    backlogItems: 0,
    sprintItems: 0,
    acceptanceItems: 0,
    activeSprintPlans: 0,
    items: [],
    docDependencies: [],
    implementationDependencies: [],
    reasons: ["Scrum 運営層 projection は未提供"],
  };
}

function emptySkillBinding(): ProjectSkillBinding {
  return {
    status: "catalog_missing",
    sourcePackage: "",
    selectedModel: "Forward",
    workflowModes: [],
    l12Layers: [],
    requiredSkills: 0,
    recommendedSkills: 0,
    optionalSkills: 0,
    items: [],
    command: "helix skill suggest --plan <active-plan-path>",
    sourceBindings: [],
    docDependencies: [],
    implementationDependencies: [],
    reasons: ["skill binding projection は未提供"],
  };
}

export interface ProjectCurrentLocationView {
  layer: string | null;
  l12_layer: string | null;
  status: string;
  completion_boundary: string;
  roadmap_frontier: string[];
  projection_counts: {
    design_declarations: number;
    design_references: number;
    design_impact: number;
    unresolved_design_references: number;
    design_declaration_drifts: number;
  };
  l12_coverage: Array<{
    layer: string;
    label: string;
    status: string;
    zip_source_binding_ids: string[];
    tailoring_rule_ids: string[];
    tailoring_detail_levels: string[];
    legacy_layers: string[];
    plan_ids: string[];
    design_ids: string[];
    test_design_ids: string[];
    reasons: string[];
  }>;
  l12_compatibility: {
    status: "pass" | "partial" | "violation";
    layers: number;
    expected_layers: 12;
    command: "helix current-location --json";
    pairs: Array<{
      label: string;
      legacy_layer: string;
      l12_layer: string;
      status: "bound" | "not_observed" | "mismatch";
      observed: number;
      matched: number;
      sample_artifact_ids: string[];
      reasons: string[];
    }>;
    reasons: string[];
  };
  coverage_counts: {
    done: number;
    missing: number;
    reverify: number;
  };
  design_coverage_gate: {
    status: string;
    items: Array<{
      coverage_id: string;
      l12_layer: string;
      label: string;
      zip_source_binding_ids: string[];
      tailoring_rule_ids: string[];
      tailoring_detail_levels: string[];
      required_kinds: string[];
      accepted_layers: string[];
      status: string;
      declaration_ids: string[];
      source_paths: string[];
      return_route: string;
      doc_dependencies: string[];
      implementation_dependencies: string[];
      reasons: string[];
    }>;
    covered: number;
    missing: number;
    reverify: number;
    doc_dependencies: string[];
    implementation_dependencies: string[];
  };
  acceptance_traceability: {
    status: string;
    total: number;
    linked: number;
    declared: number;
    missing: number;
    source_document: string;
    doc_dependencies: string[];
    implementation_dependencies: string[];
    items: Array<{
      acceptance_id: string;
      requirement_id: string;
      status: string;
      declaration_ids: string[];
      source_paths: string[];
      reference_ids: string[];
      reference_statuses: string[];
      reasons: string[];
    }>;
  };
  recovery_exit: {
    status: string;
    remaining_queue_items: number;
    blocking_lanes: string[];
    blockers: string[];
    next_command: string;
    expected_transition: string;
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
      recompute_commands: string[];
      expected_transition: string;
      reasons: string[];
    };
    automation_runway: {
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
      approval_actions: string[];
      phases: Array<{
        sequence: number;
        action: string;
        phase_type: string;
        count: number;
        selected: boolean;
        status: string;
        human_required: boolean;
        command: string;
        evidence_probe_command: string | null;
        evidence_materialize_command: string | null;
        evidence_approval_draft_command: string | null;
        evidence_apply_dry_run_command: string | null;
        evidence_apply_execute_command: string | null;
        evidence_apply_write_policy: string | null;
        evidence_handoff_artifacts: {
          probe_record_path: string;
          approval_draft_path: string;
          write_policy: string;
        } | null;
        target_tables: string[];
        postcheck_commands: string[];
        remaining_after_phase: number;
        next_gate: string;
        expected_transition: string;
      }>;
      target_tables: string[];
      postcheck_commands: string[];
      expected_transition: string;
      reasons: string[];
    };
    automation_boundaries: Array<{
      action: string;
      lane_type: string;
      automation_class: string;
      count: number;
      selected: boolean;
      status: string;
      mutation_allowed: boolean;
      approval_required: boolean;
      dry_run_command: string;
      review_command: string;
      batch_command: string;
      evidence_plan_command: string;
      evidence_patch_command: string | null;
      evidence_patch_write_policy: string | null;
      evidence_probe_command: string | null;
      evidence_materialize_command: string | null;
      evidence_approval_draft_command: string | null;
      evidence_apply_dry_run_command: string | null;
      evidence_apply_execute_command: string | null;
      evidence_apply_write_policy: string | null;
      evidence_handoff_artifacts: {
        probe_record_path: string;
        approval_draft_path: string;
        write_policy: string;
      } | null;
      execute_command: string | null;
      required_record: string | null;
      safety_policy: string;
    }>;
  };
  recovery_handoff_artifacts: {
    present: number;
    missing: number;
    unchecked: number;
    items: Array<{
      action: string;
      kind: string;
      path: string;
      status: string;
      generation_status: string;
      generation_command: string | null;
      bytes: number | null;
      sha256: string | null;
      write_policy: string;
      approval_record: {
        status: string;
        decision_id: string | null;
        outcome: string | null;
        approval_scope_digest: string | null;
        expected_approval_scope_digest: string | null;
        scope_status: string;
        materialize_status: string | null;
        reviewed_candidate_count: number | null;
        valid_for_apply: boolean;
        reasons: string[];
      } | null;
      reasons: string[];
    }>;
  };
  vmodel_fit: {
    status: "pass" | "needs_fit";
    design_coverage_status: string;
    acceptance_traceability_status: string;
    zip_adoption_status: string;
    zip_manifest_status: string;
    tailoring_gate_status: string;
    synthesis: {
      status: string;
      source_package: string;
      source_document: string;
      common_adopted: number;
      helix_complemented: number;
      rejected: number;
      missing_decisions: number;
      adopted_ids: string[];
      complemented_ids: string[];
      rejected_ids: string[];
      tailoring_status: string;
      function_design_policy: string;
      current_reentry_status: string;
      next_command: string;
      reasons: string[];
    };
    next_actions: Array<{
      priority: number;
      action_id: string;
      blocker_code: string;
      status: string;
      command: string;
      gate: string;
      automation_class: string;
      count: number;
      required_action: string;
      doc_dependencies: string[];
      implementation_dependencies: string[];
      reasons: string[];
      work_bucket: {
        bucket_id: string;
        action: string;
        evidence_signature: string;
        count: number;
        listed: number;
        omitted: number;
        target_tables: string[];
        primary_command: string;
        evidence_patch_command: string;
        evidence_patch_write_policy: string;
        evidence_patch_candidate_count: number;
        evidence_probe_command: string;
        evidence_materialize_command: string;
        evidence_approval_draft_command: string;
        evidence_apply_dry_run_command: string;
        evidence_apply_execute_command: string;
        evidence_apply_write_policy: string;
        evidence_handoff_artifacts: {
          probe_record_path: string;
          approval_draft_path: string;
          write_policy: string;
        } | null;
        evidence_handoff_status: {
          present: number;
          missing: number;
          unchecked: number;
          items: Array<{
            kind: string;
            path: string;
            status: string;
            generation_status: string;
            generation_command: string | null;
            bytes: number | null;
            sha256: string | null;
            write_policy: string;
            approval_record: {
              status: string;
              decision_id: string | null;
              outcome: string | null;
              approval_scope_digest: string | null;
              expected_approval_scope_digest: string | null;
              scope_status: string;
              materialize_status: string | null;
              reviewed_candidate_count: number | null;
              valid_for_apply: boolean;
              reasons: string[];
            } | null;
            reasons: string[];
          }>;
        } | null;
        evidence_handoff_next: {
          status:
            | "generate_probe"
            | "generate_approval_draft"
            | "approval_pending"
            | "approval_rejected"
            | "apply_dry_run"
            | "approval_required"
            | "unchecked"
            | "unavailable";
          approval_state: string;
          scope_status: string | null;
          valid_for_apply: boolean;
          command: string;
          label: string;
          required_action: string;
          reason_codes: string[];
          reasons: string[];
        } | null;
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
      } | null;
    }>;
    handoff_summary: {
      status: "none" | "machine_pending" | "approval_pending" | "approval_blocked" | "apply_ready";
      total: number;
      machine_pending: number;
      approval_pending: number;
      approval_required: number;
      approval_rejected: number;
      apply_ready: number;
      unchecked: number;
      unavailable: number;
      scope_match: number;
      scope_mismatch: number;
      scope_missing: number;
      valid_for_apply: number;
      invalid_for_apply: number;
      commands: string[];
      reason_codes: string[];
      reasons: string[];
    };
    recovery_handoff_gate: {
      status: string;
      effective_phase: string;
      action_id: string | null;
      blocker_code: string | null;
      command: string;
      required_action: string;
      handoff_present: number;
      handoff_missing: number;
      approval_status: string | null;
      scope_status: string | null;
      decision_id: string | null;
      outcome: string | null;
      approval_scope_digest: string | null;
      expected_approval_scope_digest: string | null;
      materialize_status: string | null;
      reviewed_candidate_count: number | null;
      valid_for_apply: boolean;
      approval_state: string;
      reason_codes: string[];
      reasons: string[];
    };
    approval_review_gate: {
      status: string;
      action: string;
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
      review_command: string;
      current_window_command: string;
      previous_window_command: string | null;
      next_window_command: string | null;
      transition_command: string;
      transition_window_command: string;
      previous_transition_window_command: string | null;
      next_transition_window_command: string | null;
      outcome_routes: Array<{
        outcome: string;
        projection_type: string;
        target_action: string | null;
        drive_model: string;
        human_required: boolean;
        command: string;
        transition_command: string;
        expected_transition: string;
        required_action: string;
        doc_dependencies: string[];
        implementation_dependencies: string[];
        postcheck_commands: string[];
        reasons: string[];
      }>;
      approval_record_template: string[];
      required_action: string;
      reasons: string[];
    };
    recovery_runway_gate: {
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
      phases: Array<{
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
      }>;
      command: string;
      required_action: string;
      reasons: string[];
    };
    regression_guards: {
      status: string;
      pass: number;
      watch: number;
      fail: number;
      guards: Array<{
        guard_id: string;
        status: string;
        scope: string;
        command: string;
        protected_surface: string[];
        count: number;
        required_action: string;
        reasons: string[];
      }>;
    };
    function_design_absorption: {
      status: string;
      independent_layer_policy: string;
      detail_contract_coverage_status: string;
      tailoring_detail_contract_status: string;
      accepted_layers: string[];
      absorbed_surfaces: string[];
      command: string;
      required_action: string;
      reasons: string[];
    };
    roadmap_current_gate: {
      status: string;
      roadmap_status: string;
      aligned: boolean;
      recovery_correlation: string;
      db_current_l12_layer: string | null;
      roadmap_current_l12_layers: string[];
      roadmap_projected_l12_layers: string[];
      roadmap_terminal_l12_layers: string[];
      alignment_basis: string;
      blocker_count: number;
      command: string;
      required_action: string;
      reasons: string[];
    };
    drive_model_gate: {
      status: string;
      selected_model: string;
      default_model: string;
      selection_status: string;
      selected_route_id: string;
      selected_command: string;
      selected_coverage_ids: string[];
      selected_coverage_labels: string[];
      candidate_count: number;
      blocked_models: string[];
      available_models: string[];
      command: string;
      required_action: string;
      reasons: string[];
    };
    current_location_status: string;
    completion_boundary: string;
    drive_route_status: string;
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
    unresolved_design_references: number;
    design_declaration_drifts: number;
    blockers: Array<{
      code: string;
      status: string;
      count: number;
      command: string;
      required_action: string;
      doc_dependencies: string[];
      implementation_dependencies: string[];
    }>;
    reasons: string[];
    source_command: string;
    current_location_command: string;
    view_command: string;
  };
  zip_adoption: {
    status: string;
    adopted: number;
    complemented: number;
    rejected: number;
    missing: number;
    source_package: string;
    source_document: string;
    items: Array<{
      adoption_id: string;
      category: string;
      label: string;
      status: string;
      declaration_ids: string[];
      source_paths: string[];
      doc_dependencies: string[];
      implementation_dependencies: string[];
      reasons: string[];
    }>;
    doc_dependencies: string[];
    implementation_dependencies: string[];
  };
  scrum_operation: {
    status: string;
    source_package: string;
    source_bindings: string[];
    backlog_items: number;
    sprint_items: number;
    acceptance_items: number;
    active_sprint_plans: number;
    doc_dependencies: string[];
    implementation_dependencies: string[];
    reasons: string[];
    items: Array<{
      operation_id: string;
      category: string;
      status: string;
      declaration_ids: string[];
      plan_ids: string[];
      source_paths: string[];
      doc_dependencies: string[];
      implementation_dependencies: string[];
      reasons: string[];
    }>;
  };
  skill_binding: {
    status: string;
    source_package: string;
    selected_model: string;
    workflow_modes: string[];
    l12_layers: string[];
    required_skills: number;
    recommended_skills: number;
    optional_skills: number;
    command: string;
    source_bindings: string[];
    doc_dependencies: string[];
    implementation_dependencies: string[];
    reasons: string[];
    items: Array<{
      skill_id: string;
      skill_path: string;
      tier: string;
      inject_at: string;
      rank: number;
      score: number;
      matched_drive_models: string[];
      matched_layers: string[];
      source_drive_models: string[];
      source_layers: string[];
      reasons: string[];
    }>;
  };
  zip_manifest: {
    status: "ok" | "advisory_missing" | "violation";
    present: boolean;
    root_prefix: string | null;
    entries_total: number;
    required_present: number;
    required_total: number;
    by_extension: Record<string, number>;
    inventory_signature: {
      status: string;
      expected_root_prefix: string;
      actual_root_prefix: string | null;
      expected_entries_total: number;
      actual_entries_total: number;
      expected_by_extension: Record<string, number>;
      actual_by_extension: Record<string, number>;
      mismatches: Array<{
        field: string;
        expected: string | number;
        actual: string | number;
      }>;
    };
    required: Array<{
      path: string;
      present: boolean;
      actual_path: string | null;
    }>;
    findings: Array<{
      code: string;
      severity: string;
      detail: string;
    }>;
    source_bindings: {
      status: "complete" | "advisory_missing" | "missing";
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
    };
    source_command: string;
  };
  tailoring_gate: {
    status: string;
    profile: string;
    required: number;
    optional: number;
    excluded: number;
    missing_required: number;
    source_document: string;
    items: Array<{
      tailoring_id: string;
      category: string;
      label: string;
      detail_level: string;
      status: string;
      declaration_ids: string[];
      source_paths: string[];
      doc_dependencies: string[];
      implementation_dependencies: string[];
      reasons: string[];
    }>;
    doc_dependencies: string[];
    implementation_dependencies: string[];
  };
  roadmap_position: {
    status: string;
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
    bands: Array<{
      band_id: string;
      name: string;
      status: string;
      l12_layers: string[];
      coverage_ids: string[];
      coverage_labels: string[];
      roadmap_ids: string[];
      reasons: string[];
    }>;
    gates: Array<{
      roadmap_gate_id: string;
      plan_id: string;
      gate_id: string;
      total_spans: number;
      confirmed_spans: number;
      reached: boolean;
      l12_layers: string[];
      coverage_ids: string[];
      coverage_labels: string[];
      status: string;
      reasons: string[];
    }>;
    doc_dependencies: string[];
    implementation_dependencies: string[];
  };
  closure_overview: {
    schema_version: "project-closure-overview.v1";
    status: string;
    open_l7: number;
    l14_claims: number;
    closure_evidence: number;
    remediation: {
      done: number;
      missing: number;
      reverify: number;
    };
    queue_total: number;
    route_counts: {
      close_ready: number;
      collect_evidence: number;
      repair_failed_evidence: number;
      reverse_design: number;
    };
    ledger_status_counts: {
      ready: number;
      needs_evidence: number;
      needs_repair: number;
      needs_reverse: number;
    };
    apply_readiness: {
      close_ready_count: number;
      approval_required: boolean;
      status: string;
      dry_run_command: string;
      execute_command: string;
      review_bundle_command: string;
      transition_plan_command: string;
      decision_draft_command: string;
      review_window_command: string;
      transition_window_command: string;
      write_policy: string;
    };
    actions: Array<{
      action: string;
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
    work_buckets: Array<{
      bucket_id: string;
      action: string;
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
      evidence_patch_command: string;
      evidence_probe_command: string;
      evidence_materialize_command: string;
      evidence_approval_draft_command: string;
      evidence_apply_dry_run_command: string;
      evidence_apply_execute_command: string;
      evidence_apply_write_policy: string;
      evidence_handoff_artifacts: {
        probe_record_path: string;
        approval_draft_path: string;
        write_policy: string;
      } | null;
      postcheck_commands: string[];
      repair_plan: {
        status: string;
        failed_evidence_count: number;
        latest_failed_at: string | null;
        automation: {
          status: string;
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
        };
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
          evidence_paths: string[];
          sample_plan_ids: string[];
          required_action: string;
          reasons: string[];
        }>;
        projection_plan_ids: string[];
        projection_items: Array<{
          plan_id: string;
          source_path: string;
          failed_evidence_count: number;
          latest_failed_at: string | null;
          command_labels: string[];
          evidence_paths: string[];
          required_green_tables: string[];
          projection_templates: Array<{
            table: string;
            status_after_projection: string;
            required_fields: string[];
            example_status: string;
            required_action: string;
          }>;
          evidence_artifact_templates: Array<{
            artifact_kind: string;
            artifact_path: string;
            projection_target_tables: string[];
            template_format: string;
            write_policy: string;
            required_fields: string[];
            example: Record<string, unknown>;
            required_action: string;
            reasons: string[];
          }>;
          evidence_patch_plan: {
            approval_required: boolean;
            write_policy: string;
            dry_run_command: string;
            execute_command: string | null;
            patch_candidates: Array<{
              artifact_kind: string;
              artifact_path: string;
              operation: string;
              template_format: string;
              projection_target_tables: string[];
              preview_digest: string;
              preview_lines: string[];
              unresolved_placeholders: string[];
              placeholder_count: number;
              real_evidence_required: boolean;
              required_action: string;
            }>;
            postcheck_commands: string[];
            safety_policy: string;
            reasons: string[];
          };
          required_action: string;
          postcheck_commands: string[];
          reasons: string[];
        }>;
        required_green_tables: string[];
        required_green_status: string;
        projection_templates: Array<{
          table: string;
          status_after_projection: string;
          required_fields: string[];
          example_status: string;
          required_action: string;
        }>;
        projection_policy: string;
        safety_policy: string;
        reasons: string[];
      };
      required_action: string;
      expected_transition: string;
      sample_plan_ids: string[];
      doc_dependencies: string[];
      implementation_dependencies: string[];
      reasons: string[];
    }>;
    recommended_next_action: {
      action: string | null;
      reason: string;
      command: string;
      human_required: boolean;
    };
    findings: Array<{
      code: string;
      severity: string;
      detail: string;
    }>;
    write_policy: string;
    source_command: string;
    view_command: string;
  };
  closure: {
    status: string;
    l7_open_plan_ids: string[];
    terminal_l14_plan_ids: string[];
    closure_evidence_ids: string[];
    required_evidence: string[];
    evidence_templates: Array<{
      action: string;
      count: number;
      command: string;
      target_tables: string[];
      sample_plan_id: string | null;
      templates: Array<{
        table: string;
        status_after_projection: string;
        required_fields: string[];
        example_status: string;
        required_action: string;
      }>;
    }>;
    evidence_materialize: {
      action: string | null;
      status: string;
      probe_command: string;
      materialize_command: string;
      materialized_candidate_count: number;
      remaining_placeholder_count: number;
      blocked_candidate_count: number;
      fillable_placeholders: string[];
      remaining_placeholders: string[];
      write_policy: string;
      required_action: string;
    };
    evidence_apply: {
      action: string | null;
      status: "ready" | "blocked";
      materialize_readiness_status: string;
      allowed_to_apply: boolean;
      approval_required: true;
      approval_valid: boolean;
      patch_candidate_count: number;
      blocked_reasons: string[];
      dry_run_command: string;
      execute_command: string;
      approval_draft_command: string;
      approval_record_fields: string[];
      write_policy: "approval-required";
    };
    remediation: {
      items: Array<{
        category: string;
        label: string;
        status: string;
        l12_layer: string;
        count: number;
        subject_ids: string[];
        required_action: string;
        reasons: string[];
      }>;
      done: number;
      missing: number;
      reverify: number;
    };
    queue: {
      items: Array<{
        plan_id: string;
        kind: string;
        status: string;
        updated_at: string | null;
        source_path: string;
        l12_layer: string;
        coverage_id: string | null;
        coverage_label: string | null;
        priority: number;
        drive_model: string;
        remediation_status: string;
        next_action: string;
        required_action: string;
        doc_dependencies: string[];
        implementation_dependencies: string[];
        evidence_action: string;
        evidence_gaps: Array<{
          component: string;
          status: string;
          evidence_tables: string[];
          required_action: string;
        }>;
        evidence: {
          status: string;
          artifact_paths: string[];
          trace_edges: number;
          test_runs: {
            total: number;
            passed: number;
            failed: number;
          };
          gate_runs: {
            total: number;
            passed: number;
            failed: number;
          };
          runtime_verification: {
            total: number;
            accepted: number;
          };
          evidence_paths: string[];
        };
        reasons: string[];
      }>;
      total: number;
      route_counts: {
        close_ready: number;
        collect_evidence: number;
        repair_failed_evidence: number;
        reverse_design: number;
      };
    };
    packets: {
      items: Array<{
        packet_id: string;
        next_action: string;
        label: string;
        drive_model: string;
        l12_layer: string;
        count: number;
        plan_ids: string[];
        source_paths: string[];
        required_action: string;
        doc_dependencies: string[];
        implementation_dependencies: string[];
        acceptance_criteria: string[];
        automation: {
          batch_id: string;
          sequence: number;
          machine_filter: string;
          detection_source: string;
          review_command: string;
          view_command: string;
          write_policy: string;
          expected_transition: string;
          promotion_gate: string;
          sample_plan_ids: string[];
        };
        reasons: string[];
      }>;
      total: number;
    };
    next_action_ledger: {
      entries: Array<{
        ledger_id: string;
        packet_id: string;
        next_action: string;
        status: string;
        drive_model: string;
        l12_layer: string;
        count: number;
        primary_command: string;
        review_surface: string;
        write_policy: string;
        plan_ids: string[];
        sample_plan_ids: string[];
        source_paths: string[];
        required_action: string;
        doc_dependencies: string[];
        implementation_dependencies: string[];
        acceptance_criteria: string[];
        evidence_policy: string;
        automation: {
          batch_id: string;
          sequence: number;
          machine_filter: string;
          detection_source: string;
          review_command: string;
          view_command: string;
          write_policy: string;
          expected_transition: string;
          promotion_gate: string;
          sample_plan_ids: string[];
        };
        human_required: boolean;
        reasons: string[];
      }>;
      total: number;
      status_counts: {
        ready: number;
        needs_evidence: number;
        needs_repair: number;
        needs_reverse: number;
      };
      write_policy: string;
      source_command: string;
      view_command: string;
    };
    apply_readiness: {
      close_ready_count: number;
      approval_required: boolean;
      dry_run_command: string;
      execute_command: string;
      review_bundle_command: string;
      transition_plan_command: string;
      decision_draft_command: string;
      review_window_command: string;
      transition_window_command: string;
      write_policy: string;
      status: string;
      reasons: string[];
    };
  };
  operation_scope: {
    items: Array<{
      scope: string;
      label: string;
      coverage_id: string;
      coverage_label: string;
      status: string;
      design_ids: string[];
      observed_count: number;
      observation_sources: string[];
      evidence_tables: string[];
      reasons: string[];
    }>;
    designed: number;
    observed: number;
    observed_gap: number;
    missing: number;
    reverify: number;
  };
  artifact_remap: {
    items: Array<{
      kind: string;
      artifact_id: string;
      source_path: string;
      legacy_layer: string | null;
      l12_layer: string | null;
      coverage_id: string | null;
      coverage_label: string | null;
      zip_source_binding_ids: string[];
      tailoring_rule_ids: string[];
      tailoring_detail_levels: string[];
      status: string;
      reasons: string[];
    }>;
    layers: Array<{
      layer: string;
      label: string;
      status: string;
      drive_model: string;
      total: number;
      done: number;
      missing: number;
      reverify: number;
      artifact_ids: string[];
      batch_command: string;
      required_action: string;
      reasons: string[];
    }>;
    done: number;
    missing: number;
    reverify: number;
  };
  drive_model: string;
  drive_reason: string;
  drive_model_candidates: Array<{
    model: string;
    rank: number;
    status: string;
    route_id: string;
    trigger: string;
    required_action: string;
    command: string;
    coverage_ids: string[];
    coverage_labels: string[];
    doc_dependencies: string[];
    implementation_dependencies: string[];
    reasons: string[];
  }>;
  reverse_targets: string[];
  drive_route: {
    route_id: string;
    status: string;
    selected_model: string;
    default_model: string;
    reason: string;
    write_policy: string;
    source_command: string;
    view_command: string;
    must_return_to_design: boolean;
    forward: {
      allowed: boolean;
      roadmap_status: string;
      frontier: string[];
      current_band_ids: string[];
      current_gate_ids: string[];
      coverage_ids: string[];
      coverage_labels: string[];
    };
    reverse: {
      required: boolean;
      targets: string[];
      l12_layers: string[];
      coverage_ids: string[];
      coverage_labels: string[];
      doc_dependencies: string[];
      implementation_dependencies: string[];
      queue_actions: string[];
      ledger_ids: string[];
      acceptance_criteria: string[];
    };
    reasons: string[];
  };
  findings: Array<{
    code: string;
    severity: string;
    detail: string;
  }>;
}

export interface GrowthSeriesPoint {
  at: string;
  class: string;
  value: number;
  recorded: boolean;
}

export interface HarnessGrowthCurrentSections {
  artifacts: MetricRow[];
  plans: MetricRow[];
  gates: MetricRow[];
}

export interface HarnessGrowthView {
  current_sections: HarnessGrowthCurrentSections;
  current: MetricRow[];
  growth_series: GrowthSeriesPoint[];
}

export interface SkillAgentTelemetryView {
  skill_invocations: MetricRow[];
  model_runs: MetricRow[];
}

export interface VisualizationRootBoundary {
  root: "project" | "harness";
  label: string;
  scope: string;
  owned_views: string[];
  source_fields: string[];
  excluded_fields: string[];
  view_command: "helix progress tree-view --json";
}

export interface VisualizationViewModel {
  generated_from: "visualization-snapshot.v1";
  source_clock: string | null;
  view_boundaries: {
    project: VisualizationRootBoundary;
    harness: VisualizationRootBoundary;
  };
  project: {
    current_location: ProjectCurrentLocationView;
    layer_progress: LayerProgressView;
    design_test_pair: DesignTestPairView;
    relation_graph: RelationGraphView;
    runtime_evidence: RuntimeEvidenceView;
  };
  harness: {
    harness_growth: HarnessGrowthView;
    skill_agent_telemetry: SkillAgentTelemetryView;
  };
  shared_warnings: string[];
}

const WARN_DESIGN_TEST_PAIR_UNAVAILABLE =
  "design_test_pair: pair-filtered edge/orphan counts are not available in the current snapshot; showing null instead of a fabricated count.";
const WARN_RELATION_GRAPH_RAW_LIST_UNAVAILABLE =
  "relation_graph: raw node/edge lists are not available in the current snapshot; showing aggregate counts only.";
const WARN_RELATION_GRAPH_EMPTY = "relation_graph has no recorded nodes, edges, or snapshots.";
const WARN_RUNTIME_EVIDENCE_EMPTY =
  "runtime_evidence has no recorded test runs, verification events, or guardrail decisions.";
const WARN_SKILL_AGENT_TELEMETRY_EMPTY =
  "skill_agent_telemetry has no recorded skill invocations or model runs.";
const WARN_HARNESS_GROWTH_SERIES_UNAVAILABLE =
  "harness_growth: historical growth series is not recorded in the current snapshot; showing current values only.";

const VIEW_BOUNDARIES: VisualizationViewModel["view_boundaries"] = {
  project: {
    root: "project",
    label: "Project view",
    scope:
      "対象プロジェクトの現在地、工程表、L12設計カバレッジ、駆動モデル、closure/evidence、runtime evidence を描画する read-only view",
    owned_views: [
      "current_location",
      "layer_progress",
      "design_test_pair",
      "relation_graph",
      "runtime_evidence",
    ],
    source_fields: [
      "project_current_location",
      "progress",
      "graph",
      "evidence.test_runs",
      "evidence.runtime_verification",
      "evidence.guardrail_decisions",
      "vmodel_zip_manifest",
      "vmodel_zip_source_bindings",
      "project_zip_adoption_decisions",
      "project_tailoring_decisions",
      "project_vmodel_regression_guards",
      "project_vmodel_fit_blockers",
      "project_vmodel_handoff_summary",
    ],
    excluded_fields: ["evidence.skill_invocations", "evidence.model_runs", "harness_growth"],
    view_command: "helix progress tree-view --json",
  },
  harness: {
    root: "harness",
    label: "HARNESS view",
    scope:
      "HELIX/HARNESS 自体の成長、skill/model telemetry、ハーネス運用メトリクスを描画する read-only view",
    owned_views: ["harness_growth", "skill_agent_telemetry"],
    source_fields: ["progress", "graph", "evidence.skill_invocations", "evidence.model_runs"],
    excluded_fields: [
      "project_current_location.vmodel_fit",
      "project_current_location.drive_route",
      "project_current_location.closure",
      "vmodel_zip_manifest",
      "vmodel_zip_source_bindings",
      "project_zip_adoption_decisions",
      "project_tailoring_decisions",
      "project_vmodel_regression_guards",
      "project_vmodel_fit_blockers",
      "project_vmodel_handoff_summary",
    ],
    view_command: "helix progress tree-view --json",
  },
};

function row(label: string, value: number, drilldown: Drilldown | null): MetricRow {
  return { label, value, drilldown };
}

/**
 * Builds a Mermaid-compatible graph IR (§3): nodes/edges normalized by id
 * ascending order for determinism, and cycle-participant edges marked with
 * `kind: "cycle"`. Pure and deterministic — no dependency on Map iteration
 * order, randomness, or wall-clock time.
 */
export function buildGraphIr(nodes: GraphIrNode[], edges: GraphIrEdgeInput[]): GraphIr {
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const sortedEdges = [...edges].sort((a, b) => {
    const byFrom = a.from.localeCompare(b.from);
    if (byFrom !== 0) return byFrom;
    const byTo = a.to.localeCompare(b.to);
    if (byTo !== 0) return byTo;
    return a.kind.localeCompare(b.kind);
  });

  const adjacency = new Map<string, string[]>();
  for (const edge of sortedEdges) {
    const existing = adjacency.get(edge.from) ?? [];
    existing.push(edge.to);
    adjacency.set(edge.from, existing);
  }

  function canReach(start: string, target: string): boolean {
    const visited = new Set<string>();
    const stack = [start];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === undefined) continue;
      if (current === target) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      const neighbors = adjacency.get(current) ?? [];
      for (const neighbor of neighbors) stack.push(neighbor);
    }
    return false;
  }

  const outEdges: GraphIrEdge[] = sortedEdges.map((edge) => {
    const participatesInCycle = edge.from !== edge.to && canReach(edge.to, edge.from);
    const selfLoop = edge.from === edge.to;
    return {
      from: edge.from,
      to: edge.to,
      kind: participatesInCycle || selfLoop ? "cycle" : edge.kind,
    };
  });

  return { nodes: sortedNodes, edges: outEdges };
}

function requireSnapshotSchema(snapshot: VisualizationSnapshot): void {
  if (snapshot.schema_version !== "visualization-snapshot.v1") {
    throw new Error(
      `buildVisualizationViewModel: unsupported snapshot schema_version "${String(
        (snapshot as { schema_version?: unknown }).schema_version,
      )}"; expected "visualization-snapshot.v1"`,
    );
  }
}

export function buildLayerProgressView(snapshot: VisualizationSnapshot): LayerProgressView {
  const artifactDrilldown: Drilldown = {
    kind: "cli",
    pointer: snapshot.drilldowns.artifact_progress_command,
  };
  const artifacts: MetricRow[] = [
    row("total", snapshot.progress.artifacts.total, artifactDrilldown),
    row("red", snapshot.progress.artifacts.red, artifactDrilldown),
    row("yellow", snapshot.progress.artifacts.yellow, artifactDrilldown),
    row("green", snapshot.progress.artifacts.green, artifactDrilldown),
    row("unknown", snapshot.progress.artifacts.unknown, artifactDrilldown),
  ];

  const planStatusRows: MetricRow[] = Object.entries(snapshot.progress.plans.by_status)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([status, value]) => row(status, value, null));
  const plans: MetricRow[] = [row("total", snapshot.progress.plans.total, null), ...planStatusRows];

  const gates: MetricRow[] = [
    row("total", snapshot.progress.gates.total, null),
    row("passed", snapshot.progress.gates.passed, null),
    row("failed", snapshot.progress.gates.failed, null),
    row("blocked", snapshot.progress.gates.blocked, null),
    row("other", snapshot.progress.gates.other, null),
  ];

  return { artifacts, plans, gates };
}

export function buildDesignTestPairView(_snapshot: VisualizationSnapshot): DesignTestPairView {
  return {
    pair_edges: null,
    orphan_nodes: null,
    graph: buildGraphIr([], []),
  };
}

export function buildRelationGraphView(snapshot: VisualizationSnapshot): RelationGraphView {
  const nodeCount = snapshot.graph.latest_node_count ?? snapshot.graph.nodes;
  const edgeCount = snapshot.graph.latest_edge_count ?? snapshot.graph.edges;
  return {
    node_count: nodeCount,
    edge_count: edgeCount,
    latest_snapshot_id: snapshot.graph.latest_snapshot_id,
    latest_snapshot_hash: snapshot.graph.latest_snapshot_hash,
    graph: buildGraphIr([], []),
    drilldown: { kind: "cli", pointer: snapshot.drilldowns.relation_graph_command },
  };
}

export function buildRuntimeEvidenceView(snapshot: VisualizationSnapshot): RuntimeEvidenceView {
  const testRuns: MetricRow[] = [
    row("total", snapshot.evidence.test_runs.total, null),
    row("passed", snapshot.evidence.test_runs.passed, null),
    row("failed", snapshot.evidence.test_runs.failed, null),
    row("other", snapshot.evidence.test_runs.other, null),
  ];

  const runtimeDrilldown: Drilldown = {
    kind: "table",
    pointer: snapshot.drilldowns.runtime_verification_table,
  };
  const runtimeVerification: MetricRow[] = [
    row("total", snapshot.evidence.runtime_verification.total, runtimeDrilldown),
    row(
      "runtime_verified",
      snapshot.evidence.runtime_verification.runtime_verified,
      runtimeDrilldown,
    ),
    row(
      "projection_only_unverified",
      snapshot.evidence.runtime_verification.projection_only_unverified,
      runtimeDrilldown,
    ),
    row(
      "missing_runtime_provenance",
      snapshot.evidence.runtime_verification.missing_runtime_provenance,
      runtimeDrilldown,
    ),
    row("accepted", snapshot.evidence.runtime_verification.accepted, runtimeDrilldown),
    row("blocked", snapshot.evidence.runtime_verification.blocked, runtimeDrilldown),
    row("other", snapshot.evidence.runtime_verification.other, runtimeDrilldown),
  ];

  const guardrailDecisions: MetricRow[] = [
    row("total", snapshot.evidence.guardrail_decisions.total, null),
    row("block", snapshot.evidence.guardrail_decisions.block, null),
    row("allow", snapshot.evidence.guardrail_decisions.allow, null),
    row("human_required", snapshot.evidence.guardrail_decisions.human_required, null),
  ];

  return {
    test_runs: testRuns,
    runtime_verification: runtimeVerification,
    guardrail_decisions: guardrailDecisions,
  };
}

function l12CompatibilityView(
  current: VisualizationSnapshot["project_current_location"],
): ProjectCurrentLocationView["l12_compatibility"] {
  const expectedLayers = 12;
  const pairs = [
    { label: "l0_slide", legacyLayer: "L0", l12Layer: "L1" },
    { label: "function_design", legacyLayer: "L6", l12Layer: "L5" },
    { label: "implementation", legacyLayer: "L7", l12Layer: "L6" },
    { label: "acceptance", legacyLayer: "L12", l12Layer: "L11" },
    { label: "operation", legacyLayer: "L14", l12Layer: "L12" },
    { label: "recovery", legacyLayer: "cross", l12Layer: "L12" },
  ] as const;
  const projectedPairs = pairs.map((pair) => {
    const observed = current.artifact_remap.items.filter(
      (item) => item.legacyLayer === pair.legacyLayer,
    );
    const matched = observed.filter((item) => item.l12Layer === pair.l12Layer);
    const status: "bound" | "not_observed" | "mismatch" =
      observed.length === 0 ? "not_observed" : matched.length > 0 ? "bound" : "mismatch";
    return {
      label: pair.label,
      legacy_layer: pair.legacyLayer,
      l12_layer: pair.l12Layer,
      status,
      observed: observed.length,
      matched: matched.length,
      sample_artifact_ids: matched.slice(0, 8).map((item) => item.artifactId),
      reasons:
        status === "bound"
          ? [`${pair.legacyLayer} は L12 canonical ${pair.l12Layer} へ再投影済み`]
          : status === "not_observed"
            ? [`${pair.legacyLayer} artifact は現在の projection では未観測`]
            : [`${pair.legacyLayer} artifact はあるが ${pair.l12Layer} への再投影が無い`],
    };
  });
  const hasMismatch = projectedPairs.some((pair) => pair.status === "mismatch");
  const hasUnobserved = projectedPairs.some((pair) => pair.status === "not_observed");
  const hasLayerMismatch = current.coverage.l12_layers.length !== expectedLayers;
  const status = hasMismatch ? "violation" : hasUnobserved || hasLayerMismatch ? "partial" : "pass";
  return {
    status,
    layers: current.coverage.l12_layers.length,
    expected_layers: expectedLayers,
    command: "helix current-location --json",
    pairs: projectedPairs,
    reasons: [
      `layers=${current.coverage.l12_layers.length}/${expectedLayers}`,
      `current=${current.current.layer ?? "-"}->${current.current.l12_layer ?? "-"}`,
      ...projectedPairs.map(
        (pair) => `${pair.label}=${pair.status === "bound" ? pair.l12_layer : pair.status}`,
      ),
    ],
  };
}

export function buildProjectCurrentLocationView(
  snapshot: VisualizationSnapshot,
): ProjectCurrentLocationView {
  const current = snapshot.project_current_location;
  const scrumOperation = current.scrum_operation ?? emptyScrumOperation();
  const skillBinding = current.skill_binding ?? emptySkillBinding();
  const closureOverview = buildProjectClosureOverview(current);
  const driveModel = buildProjectDriveModelReport(current);
  const recoveryPlan = buildProjectRecoveryPlan(current, { limit: 1 });
  const closureBucketAction = isProjectClosureQueueNextAction(
    recoveryPlan.reentry_forecast.next_phase_action ?? "",
  )
    ? recoveryPlan.reentry_forecast.next_phase_action
    : closureOverview.recommended_next_action.action;
  const closureBucketPreview = closureBucketAction
    ? buildProjectClosureBatchReport(current, {
        action: closureBucketAction,
        limit: 3,
      }).work_buckets
    : [];
  const evidenceProbePacket = closureBucketAction
    ? buildProjectClosureEvidenceProbePacket(current, {
        action: closureBucketAction,
        limit: 1,
        dryRun: true,
      })
    : null;
  const evidenceMaterializePacket = closureBucketAction
    ? buildProjectClosureEvidenceMaterializePacket(current, {
        action: closureBucketAction,
        limit: 1,
      })
    : null;
  const evidenceApplyPlan = closureBucketAction
    ? buildProjectClosureEvidenceApplyPlan(current, {
        action: closureBucketAction,
        limit: 1,
      })
    : null;
  const zipManifest = snapshot.vmodel_zip_manifest;
  const vmodelFit = buildVmodelFitReport(current, zipManifest);
  const recoveryHandoffGate = recoveryHandoffGateForView(snapshot, vmodelFit);
  const vmodelHandoffSummary = vmodelHandoffSummaryForView(snapshot, vmodelFit.next_actions);
  const closureEvidenceTemplates = (
    ["collect_evidence", "repair_failed_evidence", "reverse_design"] as const
  ).map((action) => {
    const plan = buildProjectClosureEvidencePlan(current, { action, limit: 1 });
    return {
      action,
      count: plan.total,
      command: `helix closure evidence-plan --action ${action} --summary-json`,
      target_tables: [...plan.target_tables],
      sample_plan_id: plan.items[0]?.plan_id ?? null,
      templates:
        plan.items[0]?.evidence_templates.map((template) => ({
          table: template.table,
          status_after_projection: template.status_after_projection,
          required_fields: [...template.required_fields],
          example_status: String(
            template.example_row.status ??
              template.example_row.accept_status ??
              template.example_row.artifact_type ??
              "row",
          ),
          required_action: template.required_action,
        })) ?? [],
    };
  });
  return {
    layer: current.current.layer,
    l12_layer: current.current.l12_layer,
    status: current.current.status,
    completion_boundary: current.current.completion_boundary,
    roadmap_frontier: [...current.current.roadmap_frontier],
    projection_counts: {
      design_declarations: current.counts.design_declarations,
      design_references: current.counts.design_references,
      design_impact: current.counts.design_impact,
      unresolved_design_references: current.counts.unresolved_design_references,
      design_declaration_drifts: current.counts.design_declaration_drifts,
    },
    l12_coverage: current.coverage.l12_layers.map((layer) => ({
      layer: layer.layer,
      label: layer.label,
      status: layer.status,
      zip_source_binding_ids: [...(layer.zipSourceBindingIds ?? [])],
      tailoring_rule_ids: [...(layer.tailoringRuleIds ?? [])],
      tailoring_detail_levels: [...(layer.tailoringDetailLevels ?? [])],
      legacy_layers: [...layer.legacyLayers],
      plan_ids: [...layer.planIds],
      design_ids: [...layer.designIds],
      test_design_ids: [...layer.testDesignIds],
      reasons: [...layer.reasons],
    })),
    l12_compatibility: l12CompatibilityView(current),
    coverage_counts: {
      done: current.coverage.done,
      missing: current.coverage.missing,
      reverify: current.coverage.reverify,
    },
    design_coverage_gate: {
      status: current.design_coverage_gate.status,
      items: current.design_coverage_gate.items.map((item) => ({
        coverage_id: item.coverageId,
        l12_layer: item.l12Layer,
        label: item.label,
        zip_source_binding_ids: [...(item.zipSourceBindingIds ?? [])],
        tailoring_rule_ids: [...(item.tailoringRuleIds ?? [])],
        tailoring_detail_levels: [...(item.tailoringDetailLevels ?? [])],
        required_kinds: [...item.requiredKinds],
        accepted_layers: [...item.acceptedLayers],
        status: item.status,
        declaration_ids: [...item.declarationIds],
        source_paths: [...item.sourcePaths],
        return_route: item.returnRoute,
        doc_dependencies: [...item.docDependencies],
        implementation_dependencies: [...item.implementationDependencies],
        reasons: [...item.reasons],
      })),
      covered: current.design_coverage_gate.covered,
      missing: current.design_coverage_gate.missing,
      reverify: current.design_coverage_gate.reverify,
      doc_dependencies: [...current.design_coverage_gate.docDependencies],
      implementation_dependencies: [...current.design_coverage_gate.implementationDependencies],
    },
    acceptance_traceability: {
      status: current.acceptance_traceability.status,
      total: current.acceptance_traceability.total,
      linked: current.acceptance_traceability.linked,
      declared: current.acceptance_traceability.declared,
      missing: current.acceptance_traceability.missing,
      source_document: current.acceptance_traceability.sourceDocument,
      doc_dependencies: [...current.acceptance_traceability.docDependencies],
      implementation_dependencies: [...current.acceptance_traceability.implementationDependencies],
      items: current.acceptance_traceability.items.map((item) => ({
        acceptance_id: item.acceptanceId,
        requirement_id: item.requirementId,
        status: item.status,
        declaration_ids: [...item.declarationIds],
        source_paths: [...item.sourcePaths],
        reference_ids: [...item.referenceIds],
        reference_statuses: [...item.referenceStatuses],
        reasons: [...item.reasons],
      })),
    },
    recovery_exit: {
      status: recoveryPlan.exit_forecast.status,
      remaining_queue_items: recoveryPlan.exit_forecast.remaining_queue_items,
      blocking_lanes: [...recoveryPlan.exit_forecast.blocking_lanes],
      blockers: [...recoveryPlan.exit_forecast.blockers],
      next_command: recoveryPlan.exit_forecast.next_command,
      expected_transition: recoveryPlan.exit_forecast.expected_transition,
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
        recompute_commands: [...recoveryPlan.reentry_forecast.recompute_commands],
        expected_transition: recoveryPlan.reentry_forecast.expected_transition,
        reasons: [...recoveryPlan.reentry_forecast.reasons],
      },
      automation_runway: {
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
        approval_actions: [...recoveryPlan.automation_runway.approval_actions],
        phases: recoveryPlan.automation_runway.phases.map((phase) => ({
          sequence: phase.sequence,
          action: phase.action,
          phase_type: phase.phase_type,
          count: phase.count,
          selected: phase.selected,
          status: phase.status,
          human_required: phase.human_required,
          command: phase.command,
          evidence_probe_command: phase.evidence_probe_command,
          evidence_materialize_command: phase.evidence_materialize_command,
          evidence_approval_draft_command: phase.evidence_approval_draft_command,
          evidence_apply_dry_run_command: phase.evidence_apply_dry_run_command,
          evidence_apply_execute_command: phase.evidence_apply_execute_command,
          evidence_apply_write_policy: phase.evidence_apply_write_policy,
          evidence_handoff_artifacts: phase.evidence_handoff_artifacts,
          target_tables: [...phase.target_tables],
          postcheck_commands: [...phase.postcheck_commands],
          remaining_after_phase: phase.remaining_after_phase,
          next_gate: phase.next_gate,
          expected_transition: phase.expected_transition,
        })),
        target_tables: [...recoveryPlan.automation_runway.target_tables],
        postcheck_commands: [...recoveryPlan.automation_runway.postcheck_commands],
        expected_transition: recoveryPlan.automation_runway.expected_transition,
        reasons: [...recoveryPlan.automation_runway.reasons],
      },
      automation_boundaries: recoveryPlan.automation_boundaries.map((boundary) => ({
        action: boundary.action,
        lane_type: boundary.lane_type,
        automation_class: boundary.automation_class,
        count: boundary.count,
        selected: boundary.selected,
        status: boundary.status,
        mutation_allowed: boundary.mutation_allowed,
        approval_required: boundary.approval_required,
        dry_run_command: boundary.dry_run_command,
        review_command: boundary.review_command,
        batch_command: boundary.batch_command,
        evidence_plan_command: boundary.evidence_plan_command,
        evidence_patch_command: boundary.evidence_patch_command,
        evidence_patch_write_policy: boundary.evidence_patch_write_policy,
        evidence_probe_command: boundary.evidence_probe_command,
        evidence_materialize_command: boundary.evidence_materialize_command,
        evidence_approval_draft_command: boundary.evidence_approval_draft_command,
        evidence_apply_dry_run_command: boundary.evidence_apply_dry_run_command,
        evidence_apply_execute_command: boundary.evidence_apply_execute_command,
        evidence_apply_write_policy: boundary.evidence_apply_write_policy,
        evidence_handoff_artifacts: boundary.evidence_handoff_artifacts,
        execute_command: boundary.execute_command,
        required_record: boundary.required_record,
        safety_policy: boundary.safety_policy,
      })),
    },
    recovery_handoff_artifacts: {
      present: snapshot.recovery_handoff_artifacts.present,
      missing: snapshot.recovery_handoff_artifacts.missing,
      unchecked: snapshot.recovery_handoff_artifacts.unchecked,
      items: snapshot.recovery_handoff_artifacts.items.map((item) => ({
        action: item.action,
        kind: item.kind,
        path: item.path,
        status: item.status,
        generation_status: item.generation_status,
        generation_command: item.generation_command,
        bytes: item.bytes,
        sha256: item.sha256,
        write_policy: item.write_policy,
        approval_record: item.approval_record
          ? {
              status: item.approval_record.status,
              decision_id: item.approval_record.decision_id,
              outcome: item.approval_record.outcome,
              approval_scope_digest: item.approval_record.approval_scope_digest,
              expected_approval_scope_digest: item.approval_record.expected_approval_scope_digest,
              scope_status: item.approval_record.scope_status,
              materialize_status: item.approval_record.materialize_status,
              reviewed_candidate_count: item.approval_record.reviewed_candidate_count,
              valid_for_apply: item.approval_record.valid_for_apply,
              reasons: [...item.approval_record.reasons],
            }
          : null,
        reasons: [...item.reasons],
      })),
    },
    vmodel_fit: {
      status: vmodelFit.status,
      design_coverage_status: vmodelFit.design_coverage_gate.status,
      acceptance_traceability_status: vmodelFit.acceptance_traceability_gate.status,
      zip_adoption_status: vmodelFit.zip_adoption.status,
      zip_manifest_status: vmodelFit.zip_manifest.status,
      tailoring_gate_status: vmodelFit.tailoring_gate.status,
      synthesis: {
        status: vmodelFit.synthesis.status,
        source_package: vmodelFit.synthesis.source_package,
        source_document: vmodelFit.synthesis.source_document,
        common_adopted: vmodelFit.synthesis.common_adopted,
        helix_complemented: vmodelFit.synthesis.helix_complemented,
        rejected: vmodelFit.synthesis.rejected,
        missing_decisions: vmodelFit.synthesis.missing_decisions,
        adopted_ids: [...vmodelFit.synthesis.adopted_ids],
        complemented_ids: [...vmodelFit.synthesis.complemented_ids],
        rejected_ids: [...vmodelFit.synthesis.rejected_ids],
        tailoring_status: vmodelFit.synthesis.tailoring_status,
        function_design_policy: vmodelFit.synthesis.function_design_policy,
        current_reentry_status: vmodelFit.synthesis.current_reentry_status,
        next_command: vmodelFit.synthesis.next_command,
        reasons: [...vmodelFit.synthesis.reasons],
      },
      next_actions: vmodelFit.next_actions.map((action) => ({
        priority: action.priority,
        action_id: action.action_id,
        blocker_code: action.blocker_code,
        status: action.status,
        command: action.work_bucket?.evidence_handoff_artifacts
          ? (evidenceHandoffNextStep({
              bucket: action.work_bucket,
              status: evidenceHandoffStatusForAction(snapshot, action.work_bucket.action),
            })?.command ?? action.command)
          : action.command,
        gate: action.gate,
        automation_class: handoffAwareAutomationClass(
          action.automation_class,
          action.work_bucket?.evidence_handoff_artifacts
            ? evidenceHandoffNextStep({
                bucket: action.work_bucket,
                status: evidenceHandoffStatusForAction(snapshot, action.work_bucket.action),
              })
            : null,
        ),
        count: action.count,
        required_action: action.required_action,
        doc_dependencies: [...action.doc_dependencies],
        implementation_dependencies: [...action.implementation_dependencies],
        reasons: [...action.reasons],
        work_bucket: action.work_bucket
          ? {
              bucket_id: action.work_bucket.bucket_id,
              action: action.work_bucket.action,
              evidence_signature: action.work_bucket.evidence_signature,
              count: action.work_bucket.count,
              listed: action.work_bucket.listed,
              omitted: action.work_bucket.omitted,
              target_tables: [...action.work_bucket.target_tables],
              primary_command: action.work_bucket.primary_command,
              evidence_patch_command: action.work_bucket.evidence_patch_command,
              evidence_patch_write_policy: action.work_bucket.evidence_patch_write_policy,
              evidence_patch_candidate_count: action.work_bucket.evidence_patch_candidate_count,
              evidence_probe_command: action.work_bucket.evidence_probe_command,
              evidence_materialize_command: action.work_bucket.evidence_materialize_command,
              evidence_approval_draft_command: action.work_bucket.evidence_approval_draft_command,
              evidence_apply_dry_run_command: action.work_bucket.evidence_apply_dry_run_command,
              evidence_apply_execute_command: action.work_bucket.evidence_apply_execute_command,
              evidence_apply_write_policy: action.work_bucket.evidence_apply_write_policy,
              evidence_handoff_artifacts: action.work_bucket.evidence_handoff_artifacts,
              evidence_handoff_status: action.work_bucket.evidence_handoff_artifacts
                ? evidenceHandoffStatusForAction(snapshot, action.work_bucket.action)
                : null,
              evidence_handoff_next: action.work_bucket.evidence_handoff_artifacts
                ? evidenceHandoffNextStep({
                    bucket: action.work_bucket,
                    status: evidenceHandoffStatusForAction(snapshot, action.work_bucket.action),
                  })
                : null,
              repair_status: action.work_bucket.repair_status,
              repair_automation_status: action.work_bucket.repair_automation_status,
              repair_primary_next_command: action.work_bucket.repair_primary_next_command,
              failed_evidence_count: action.work_bucket.failed_evidence_count,
              projection_item_count: action.work_bucket.projection_item_count,
              projection_plan_ids: [...action.work_bucket.projection_plan_ids],
              required_green_tables: [...action.work_bucket.required_green_tables],
              command_candidates: action.work_bucket.command_candidates.map((candidate) => ({
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
              sample_plan_ids: [...action.work_bucket.sample_plan_ids],
              postcheck_commands: [...action.work_bucket.postcheck_commands],
            }
          : null,
      })),
      handoff_summary: {
        status: vmodelHandoffSummary.status,
        total: vmodelHandoffSummary.total,
        machine_pending: vmodelHandoffSummary.machine_pending,
        approval_pending: vmodelHandoffSummary.approval_pending,
        approval_required: vmodelHandoffSummary.approval_required,
        approval_rejected: vmodelHandoffSummary.approval_rejected,
        apply_ready: vmodelHandoffSummary.apply_ready,
        unchecked: vmodelHandoffSummary.unchecked,
        unavailable: vmodelHandoffSummary.unavailable,
        scope_match: vmodelHandoffSummary.scope_match,
        scope_mismatch: vmodelHandoffSummary.scope_mismatch,
        scope_missing: vmodelHandoffSummary.scope_missing,
        valid_for_apply: vmodelHandoffSummary.valid_for_apply,
        invalid_for_apply: vmodelHandoffSummary.invalid_for_apply,
        commands: [...vmodelHandoffSummary.commands],
        reason_codes: [...vmodelHandoffSummary.reason_codes],
        reasons: [...vmodelHandoffSummary.reasons],
      },
      recovery_handoff_gate: {
        status: recoveryHandoffGate.status,
        effective_phase: recoveryHandoffGate.effective_phase,
        action_id: recoveryHandoffGate.action_id,
        blocker_code: recoveryHandoffGate.blocker_code,
        command: recoveryHandoffGate.command,
        required_action: recoveryHandoffGate.required_action,
        handoff_present: recoveryHandoffGate.handoff_present,
        handoff_missing: recoveryHandoffGate.handoff_missing,
        approval_status: recoveryHandoffGate.approval_status,
        scope_status: recoveryHandoffGate.scope_status,
        decision_id: recoveryHandoffGate.decision_id,
        outcome: recoveryHandoffGate.outcome,
        approval_scope_digest: recoveryHandoffGate.approval_scope_digest,
        expected_approval_scope_digest: recoveryHandoffGate.expected_approval_scope_digest,
        materialize_status: recoveryHandoffGate.materialize_status,
        reviewed_candidate_count: recoveryHandoffGate.reviewed_candidate_count,
        valid_for_apply: recoveryHandoffGate.valid_for_apply,
        approval_state: recoveryHandoffGate.approval_state,
        reason_codes: [...recoveryHandoffGate.reason_codes],
        reasons: [...recoveryHandoffGate.reasons],
      },
      approval_review_gate: {
        status: vmodelFit.approval_review_gate.status,
        action: vmodelFit.approval_review_gate.action,
        count: vmodelFit.approval_review_gate.count,
        listed: vmodelFit.approval_review_gate.listed,
        omitted: vmodelFit.approval_review_gate.omitted,
        limit: vmodelFit.approval_review_gate.limit,
        offset: vmodelFit.approval_review_gate.offset,
        window: { ...vmodelFit.approval_review_gate.window },
        approval_required: vmodelFit.approval_review_gate.approval_required,
        decision_id: vmodelFit.approval_review_gate.decision_id,
        approval_scope_digest: vmodelFit.approval_review_gate.approval_scope_digest,
        sample_plan_ids: [...vmodelFit.approval_review_gate.sample_plan_ids],
        sample_source_paths: [...vmodelFit.approval_review_gate.sample_source_paths],
        evidence_totals: { ...vmodelFit.approval_review_gate.evidence_totals },
        blocked_by_findings: [...vmodelFit.approval_review_gate.blocked_by_findings],
        review_command: vmodelFit.approval_review_gate.review_command,
        current_window_command: vmodelFit.approval_review_gate.current_window_command,
        previous_window_command: vmodelFit.approval_review_gate.previous_window_command,
        next_window_command: vmodelFit.approval_review_gate.next_window_command,
        transition_command: vmodelFit.approval_review_gate.transition_command,
        transition_window_command: vmodelFit.approval_review_gate.transition_window_command,
        previous_transition_window_command:
          vmodelFit.approval_review_gate.previous_transition_window_command,
        next_transition_window_command:
          vmodelFit.approval_review_gate.next_transition_window_command,
        outcome_routes: vmodelFit.approval_review_gate.outcome_routes.map((route) => ({
          outcome: route.outcome,
          projection_type: route.projection_type,
          target_action: route.target_action,
          drive_model: route.drive_model,
          human_required: route.human_required,
          command: route.command,
          transition_command: route.transition_command,
          expected_transition: route.expected_transition,
          required_action: route.required_action,
          doc_dependencies: [...route.doc_dependencies],
          implementation_dependencies: [...route.implementation_dependencies],
          postcheck_commands: [...route.postcheck_commands],
          reasons: [...route.reasons],
        })),
        approval_record_template: [...vmodelFit.approval_review_gate.approval_record_template],
        required_action: vmodelFit.approval_review_gate.required_action,
        reasons: [...vmodelFit.approval_review_gate.reasons],
      },
      recovery_runway_gate: {
        status: vmodelFit.recovery_runway_gate.status,
        current_blocking_count: vmodelFit.recovery_runway_gate.current_blocking_count,
        machine_actionable_count: vmodelFit.recovery_runway_gate.machine_actionable_count,
        human_approval_count: vmodelFit.recovery_runway_gate.human_approval_count,
        design_reverse_count: vmodelFit.recovery_runway_gate.design_reverse_count,
        remaining_after_machine_lanes: vmodelFit.recovery_runway_gate.remaining_after_machine_lanes,
        required_phase_count: vmodelFit.recovery_runway_gate.required_phase_count,
        next_phase_action: vmodelFit.recovery_runway_gate.next_phase_action,
        next_phase_type: vmodelFit.recovery_runway_gate.next_phase_type,
        next_gate: vmodelFit.recovery_runway_gate.next_gate,
        next_command: vmodelFit.recovery_runway_gate.next_command,
        next_execution_command: vmodelFit.recovery_runway_gate.next_execution_command,
        next_machine_action: vmodelFit.recovery_runway_gate.next_machine_action,
        next_machine_command: vmodelFit.recovery_runway_gate.next_machine_command,
        next_machine_probe_command: vmodelFit.recovery_runway_gate.next_machine_probe_command,
        next_machine_materialize_command:
          vmodelFit.recovery_runway_gate.next_machine_materialize_command,
        next_machine_approval_draft_command:
          vmodelFit.recovery_runway_gate.next_machine_approval_draft_command,
        next_machine_apply_dry_run_command:
          vmodelFit.recovery_runway_gate.next_machine_apply_dry_run_command,
        phases: vmodelFit.recovery_runway_gate.phases.map((phase) => ({
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
        command: vmodelFit.recovery_runway_gate.command,
        required_action: vmodelFit.recovery_runway_gate.required_action,
        reasons: [...vmodelFit.recovery_runway_gate.reasons],
      },
      regression_guards: {
        status: vmodelFit.regression_guards.status,
        pass: vmodelFit.regression_guards.pass,
        watch: vmodelFit.regression_guards.watch,
        fail: vmodelFit.regression_guards.fail,
        guards: vmodelFit.regression_guards.guards.map((guard) => ({
          guard_id: guard.guard_id,
          status: guard.status,
          scope: guard.scope,
          command: guard.command,
          protected_surface: [...guard.protected_surface],
          count: guard.count,
          required_action: guard.required_action,
          reasons: [...guard.reasons],
        })),
      },
      function_design_absorption: {
        status: vmodelFit.function_design_absorption.status,
        independent_layer_policy: vmodelFit.function_design_absorption.independent_layer_policy,
        detail_contract_coverage_status:
          vmodelFit.function_design_absorption.detail_contract_coverage_status,
        tailoring_detail_contract_status:
          vmodelFit.function_design_absorption.tailoring_detail_contract_status,
        accepted_layers: [...vmodelFit.function_design_absorption.accepted_layers],
        absorbed_surfaces: [...vmodelFit.function_design_absorption.absorbed_surfaces],
        command: vmodelFit.function_design_absorption.command,
        required_action: vmodelFit.function_design_absorption.required_action,
        reasons: [...vmodelFit.function_design_absorption.reasons],
      },
      roadmap_current_gate: {
        status: vmodelFit.roadmap_current_gate.status,
        roadmap_status: vmodelFit.roadmap_current_gate.roadmap_status,
        aligned: vmodelFit.roadmap_current_gate.aligned,
        recovery_correlation: vmodelFit.roadmap_current_gate.recovery_correlation,
        db_current_l12_layer: vmodelFit.roadmap_current_gate.db_current_l12_layer,
        roadmap_current_l12_layers: [...vmodelFit.roadmap_current_gate.roadmap_current_l12_layers],
        roadmap_projected_l12_layers: [
          ...vmodelFit.roadmap_current_gate.roadmap_projected_l12_layers,
        ],
        roadmap_terminal_l12_layers: [
          ...vmodelFit.roadmap_current_gate.roadmap_terminal_l12_layers,
        ],
        alignment_basis: vmodelFit.roadmap_current_gate.alignment_basis,
        blocker_count: vmodelFit.roadmap_current_gate.blocker_count,
        command: vmodelFit.roadmap_current_gate.command,
        required_action: vmodelFit.roadmap_current_gate.required_action,
        reasons: [...vmodelFit.roadmap_current_gate.reasons],
      },
      drive_model_gate: {
        status: vmodelFit.drive_model_gate.status,
        selected_model: vmodelFit.drive_model_gate.selected_model,
        default_model: vmodelFit.drive_model_gate.default_model,
        selection_status: vmodelFit.drive_model_gate.selection_status,
        selected_route_id: vmodelFit.drive_model_gate.selected_route_id,
        selected_command: vmodelFit.drive_model_gate.selected_command,
        selected_coverage_ids: [...vmodelFit.drive_model_gate.selected_coverage_ids],
        selected_coverage_labels: [...vmodelFit.drive_model_gate.selected_coverage_labels],
        candidate_count: vmodelFit.drive_model_gate.candidate_count,
        blocked_models: [...vmodelFit.drive_model_gate.blocked_models],
        available_models: [...vmodelFit.drive_model_gate.available_models],
        command: vmodelFit.drive_model_gate.command,
        required_action: vmodelFit.drive_model_gate.required_action,
        reasons: [...vmodelFit.drive_model_gate.reasons],
      },
      current_location_status: vmodelFit.current_location_gate.current_status,
      completion_boundary: vmodelFit.current_location_gate.completion_boundary,
      drive_route_status: vmodelFit.current_location_gate.drive_route_status,
      recovery_runway: {
        status: vmodelFit.current_location_gate.recovery_runway.status,
        machine_actionable_count:
          vmodelFit.current_location_gate.recovery_runway.machine_actionable_count,
        human_approval_count: vmodelFit.current_location_gate.recovery_runway.human_approval_count,
        design_reverse_count: vmodelFit.current_location_gate.recovery_runway.design_reverse_count,
        remaining_after_machine_lanes:
          vmodelFit.current_location_gate.recovery_runway.remaining_after_machine_lanes,
        next_machine_action: vmodelFit.current_location_gate.recovery_runway.next_machine_action,
        next_machine_command: vmodelFit.current_location_gate.recovery_runway.next_machine_command,
        next_machine_probe_command:
          vmodelFit.current_location_gate.recovery_runway.next_machine_probe_command,
        next_machine_materialize_command:
          vmodelFit.current_location_gate.recovery_runway.next_machine_materialize_command,
        next_machine_approval_draft_command:
          vmodelFit.current_location_gate.recovery_runway.next_machine_approval_draft_command,
        next_machine_apply_dry_run_command:
          vmodelFit.current_location_gate.recovery_runway.next_machine_apply_dry_run_command,
      },
      reentry_forecast: {
        status: vmodelFit.current_location_gate.reentry_forecast.status,
        current_blocking_count:
          vmodelFit.current_location_gate.reentry_forecast.current_blocking_count,
        blocking_after_machine_lanes:
          vmodelFit.current_location_gate.reentry_forecast.blocking_after_machine_lanes,
        required_phase_count: vmodelFit.current_location_gate.reentry_forecast.required_phase_count,
        next_phase_action: vmodelFit.current_location_gate.reentry_forecast.next_phase_action,
        next_phase_type: vmodelFit.current_location_gate.reentry_forecast.next_phase_type,
        next_gate: vmodelFit.current_location_gate.reentry_forecast.next_gate,
        next_command: vmodelFit.current_location_gate.reentry_forecast.next_command,
        next_execution_command:
          vmodelFit.current_location_gate.reentry_forecast.next_execution_command,
      },
      unresolved_design_references: vmodelFit.design_integrity.unresolved_references,
      design_declaration_drifts: vmodelFit.design_integrity.declaration_drifts,
      blockers: vmodelFit.blockers.map((blocker) => ({
        code: blocker.code,
        status: blocker.status,
        count: blocker.count,
        command: blocker.command,
        required_action: blocker.required_action,
        doc_dependencies: [...blocker.doc_dependencies],
        implementation_dependencies: [...blocker.implementation_dependencies],
      })),
      reasons: [...vmodelFit.reasons],
      source_command: vmodelFit.source_command,
      current_location_command: vmodelFit.current_location_command,
      view_command: vmodelFit.view_command,
    },
    zip_adoption: {
      status: current.zip_adoption.status,
      adopted: current.zip_adoption.adopted,
      complemented: current.zip_adoption.complemented,
      rejected: current.zip_adoption.rejected,
      missing: current.zip_adoption.missing,
      source_package: current.zip_adoption.sourcePackage,
      source_document: current.zip_adoption.sourceDocument,
      items: current.zip_adoption.items.map((item) => ({
        adoption_id: item.adoptionId,
        category: item.category,
        label: item.label,
        status: item.status,
        declaration_ids: [...item.declarationIds],
        source_paths: [...item.sourcePaths],
        doc_dependencies: [...item.docDependencies],
        implementation_dependencies: [...item.implementationDependencies],
        reasons: [...item.reasons],
      })),
      doc_dependencies: [...current.zip_adoption.docDependencies],
      implementation_dependencies: [...current.zip_adoption.implementationDependencies],
    },
    scrum_operation: {
      status: scrumOperation.status,
      source_package: scrumOperation.sourcePackage,
      source_bindings: [...scrumOperation.sourceBindings],
      backlog_items: scrumOperation.backlogItems,
      sprint_items: scrumOperation.sprintItems,
      acceptance_items: scrumOperation.acceptanceItems,
      active_sprint_plans: scrumOperation.activeSprintPlans,
      doc_dependencies: [...scrumOperation.docDependencies],
      implementation_dependencies: [...scrumOperation.implementationDependencies],
      reasons: [...scrumOperation.reasons],
      items: scrumOperation.items.map((item) => ({
        operation_id: item.operationId,
        category: item.category,
        status: item.status,
        declaration_ids: [...item.declarationIds],
        plan_ids: [...item.planIds],
        source_paths: [...item.sourcePaths],
        doc_dependencies: [...item.docDependencies],
        implementation_dependencies: [...item.implementationDependencies],
        reasons: [...item.reasons],
      })),
    },
    skill_binding: {
      status: skillBinding.status,
      source_package: skillBinding.sourcePackage,
      selected_model: skillBinding.selectedModel,
      workflow_modes: [...skillBinding.workflowModes],
      l12_layers: [...skillBinding.l12Layers],
      required_skills: skillBinding.requiredSkills,
      recommended_skills: skillBinding.recommendedSkills,
      optional_skills: skillBinding.optionalSkills,
      command: skillBinding.command,
      source_bindings: [...skillBinding.sourceBindings],
      doc_dependencies: [...skillBinding.docDependencies],
      implementation_dependencies: [...skillBinding.implementationDependencies],
      reasons: [...skillBinding.reasons],
      items: skillBinding.items.map((item) => ({
        skill_id: item.skillId,
        skill_path: item.skillPath,
        tier: item.tier,
        inject_at: item.injectAt,
        rank: item.rank,
        score: item.score,
        matched_drive_models: [...item.matchedDriveModels],
        matched_layers: [...item.matchedLayers],
        source_drive_models: [...item.sourceDriveModels],
        source_layers: [...item.sourceLayers],
        reasons: [...item.reasons],
      })),
    },
    zip_manifest: {
      status: vmodelFit.zip_manifest.status,
      present: vmodelFit.zip_manifest.present,
      root_prefix: vmodelFit.zip_manifest.root_prefix,
      entries_total: vmodelFit.zip_manifest.entries_total,
      required_present: vmodelFit.zip_manifest.required_present,
      required_total: vmodelFit.zip_manifest.required_total,
      by_extension: { ...vmodelFit.zip_manifest.by_extension },
      inventory_signature: {
        status: vmodelFit.zip_manifest.inventory_signature.status,
        expected_root_prefix: vmodelFit.zip_manifest.inventory_signature.expected_root_prefix,
        actual_root_prefix: vmodelFit.zip_manifest.inventory_signature.actual_root_prefix,
        expected_entries_total: vmodelFit.zip_manifest.inventory_signature.expected_entries_total,
        actual_entries_total: vmodelFit.zip_manifest.inventory_signature.actual_entries_total,
        expected_by_extension: {
          ...vmodelFit.zip_manifest.inventory_signature.expected_by_extension,
        },
        actual_by_extension: {
          ...vmodelFit.zip_manifest.inventory_signature.actual_by_extension,
        },
        mismatches: vmodelFit.zip_manifest.inventory_signature.mismatches.map((mismatch) => ({
          field: mismatch.field,
          expected: mismatch.expected,
          actual: mismatch.actual,
        })),
      },
      required: vmodelFit.zip_manifest.required.map((entry) => ({
        path: entry.path,
        present: entry.present,
        actual_path: entry.actualPath,
      })),
      findings: vmodelFit.zip_manifest.findings.map((finding) => ({
        code: finding.code,
        severity: finding.severity,
        detail: finding.detail,
      })),
      source_bindings: {
        status: vmodelFit.zip_source_bindings.status,
        bound: vmodelFit.zip_source_bindings.bound,
        missing: vmodelFit.zip_source_bindings.missing,
        advisory: vmodelFit.zip_source_bindings.advisory,
        evidence_tables: [...vmodelFit.zip_source_bindings.evidence_tables],
        bindings: vmodelFit.zip_source_bindings.bindings.map((binding) => ({
          binding_id: binding.binding_id,
          source_path: binding.source_path,
          source_category: binding.source_category,
          status: binding.status,
          source_present: binding.source_present,
          actual_path: binding.actual_path,
          l12_layers: [...binding.l12_layers],
          helix_surfaces: [...binding.helix_surfaces],
          evidence_tables: [...binding.evidence_tables],
          required_action: binding.required_action,
        })),
      },
      source_command: "helix doctor --json",
    },
    tailoring_gate: {
      status: current.tailoring_gate.status,
      profile: current.tailoring_gate.profile,
      required: current.tailoring_gate.required,
      optional: current.tailoring_gate.optional,
      excluded: current.tailoring_gate.excluded,
      missing_required: current.tailoring_gate.missing_required,
      source_document: current.tailoring_gate.sourceDocument,
      items: current.tailoring_gate.items.map((item) => ({
        tailoring_id: item.tailoringId,
        category: item.category,
        label: item.label,
        detail_level: item.detailLevel,
        status: item.status,
        declaration_ids: [...item.declarationIds],
        source_paths: [...item.sourcePaths],
        doc_dependencies: [...item.docDependencies],
        implementation_dependencies: [...item.implementationDependencies],
        reasons: [...item.reasons],
      })),
      doc_dependencies: [...current.tailoring_gate.docDependencies],
      implementation_dependencies: [...current.tailoring_gate.implementationDependencies],
    },
    roadmap_position: {
      status: current.roadmap_position.status,
      rollup: {
        total_bands: current.roadmap_position.rollup.total_bands,
        covered_bands: current.roadmap_position.rollup.covered_bands,
        parked_bands: current.roadmap_position.rollup.parked_bands,
        uncovered_bands: current.roadmap_position.rollup.uncovered_bands,
        total_gates: current.roadmap_position.rollup.total_gates,
        reached_gates: current.roadmap_position.rollup.reached_gates,
        total_spans: current.roadmap_position.rollup.total_spans,
        confirmed_spans: current.roadmap_position.rollup.confirmed_spans,
      },
      frontier: [...current.roadmap_position.frontier],
      current_band_ids: [...current.roadmap_position.current_band_ids],
      current_gate_ids: [...current.roadmap_position.current_gate_ids],
      bands: current.roadmap_position.bands.map((band) => ({
        band_id: band.bandId,
        name: band.name,
        status: band.status,
        l12_layers: [...band.l12Layers],
        coverage_ids: [...band.coverageIds],
        coverage_labels: [...band.coverageLabels],
        roadmap_ids: [...band.roadmapIds],
        reasons: [...band.reasons],
      })),
      gates: current.roadmap_position.gates.map((gate) => ({
        roadmap_gate_id: gate.roadmapGateId,
        plan_id: gate.planId,
        gate_id: gate.gateId,
        total_spans: gate.totalSpans,
        confirmed_spans: gate.confirmedSpans,
        reached: gate.reached,
        l12_layers: [...gate.l12Layers],
        coverage_ids: [...gate.coverageIds],
        coverage_labels: [...gate.coverageLabels],
        status: gate.status,
        reasons: [...gate.reasons],
      })),
      doc_dependencies: [...current.roadmap_position.docDependencies],
      implementation_dependencies: [...current.roadmap_position.implementationDependencies],
    },
    closure_overview: {
      schema_version: closureOverview.schema_version,
      status: closureOverview.closure.status,
      open_l7: closureOverview.closure.open_l7,
      l14_claims: closureOverview.closure.l14_claims,
      closure_evidence: closureOverview.closure.closure_evidence,
      remediation: {
        done: closureOverview.closure.remediation.done,
        missing: closureOverview.closure.remediation.missing,
        reverify: closureOverview.closure.remediation.reverify,
      },
      queue_total: closureOverview.closure.queue_total,
      route_counts: {
        close_ready: closureOverview.closure.route_counts.close_ready,
        collect_evidence: closureOverview.closure.route_counts.collect_evidence,
        repair_failed_evidence: closureOverview.closure.route_counts.repair_failed_evidence,
        reverse_design: closureOverview.closure.route_counts.reverse_design,
      },
      ledger_status_counts: {
        ready: closureOverview.closure.ledger_status_counts.ready,
        needs_evidence: closureOverview.closure.ledger_status_counts.needs_evidence,
        needs_repair: closureOverview.closure.ledger_status_counts.needs_repair,
        needs_reverse: closureOverview.closure.ledger_status_counts.needs_reverse,
      },
      apply_readiness: {
        close_ready_count: closureOverview.closure.apply_readiness.close_ready_count,
        approval_required: closureOverview.closure.apply_readiness.approval_required,
        status: closureOverview.closure.apply_readiness.status,
        dry_run_command: closureOverview.closure.apply_readiness.dry_run_command,
        execute_command: closureOverview.closure.apply_readiness.execute_command,
        review_bundle_command: closureOverview.closure.apply_readiness.review_bundle_command,
        transition_plan_command: closureOverview.closure.apply_readiness.transition_plan_command,
        decision_draft_command: closureOverview.closure.apply_readiness.decision_draft_command,
        review_window_command: closureOverview.closure.apply_readiness.review_window_command,
        transition_window_command:
          closureOverview.closure.apply_readiness.transition_window_command,
        write_policy: closureOverview.closure.apply_readiness.write_policy,
      },
      actions: closureOverview.actions.map((action) => ({
        action: action.action,
        count: action.count,
        listed: action.listed,
        omitted: action.omitted,
        batch_id: action.batch_id,
        ledger_status: action.ledger_status,
        human_required: action.human_required,
        evidence_policy: action.evidence_policy,
        review_command: action.review_command,
        transition_command: action.transition_command,
        sample_plan_ids: [...action.sample_plan_ids],
        required_action: action.required_action,
        promotion_gate: action.promotion_gate,
      })),
      work_buckets: closureBucketPreview.map((bucket) => ({
        bucket_id: bucket.bucket_id,
        action: bucket.action,
        rank: bucket.rank,
        count: bucket.count,
        listed: bucket.listed,
        omitted: bucket.omitted,
        evidence_signature: bucket.evidence_signature,
        evidence_components: [...bucket.evidence_components],
        evidence_statuses: [...bucket.evidence_statuses],
        target_tables: [...bucket.target_tables],
        primary_command: bucket.primary_command,
        evidence_plan_command: bucket.evidence_plan_command,
        evidence_patch_command: `helix closure evidence-patch --action ${bucket.action} --json`,
        evidence_probe_command: closureEvidenceProbeCommand(bucket.action),
        evidence_materialize_command: closureEvidenceMaterializeCommand(bucket.action),
        evidence_approval_draft_command: closureEvidenceApprovalDraftCommand(bucket.action),
        evidence_apply_dry_run_command: closureEvidenceApplyDryRunCommand(bucket.action),
        evidence_apply_execute_command: closureEvidenceApplyExecuteCommand(bucket.action),
        evidence_apply_write_policy: "approval-required",
        evidence_handoff_artifacts: closureEvidenceHandoffArtifacts(bucket.action),
        postcheck_commands: [...bucket.postcheck_commands],
        repair_plan: {
          status: bucket.repair_plan.status,
          failed_evidence_count: bucket.repair_plan.failed_evidence_count,
          latest_failed_at: bucket.repair_plan.latest_failed_at,
          automation: {
            status: bucket.repair_plan.automation.status,
            command_candidate_count: bucket.repair_plan.automation.command_candidate_count,
            runnable_command_count: bucket.repair_plan.automation.runnable_command_count,
            label_only_command_count: bucket.repair_plan.automation.label_only_command_count,
            resolution_candidate_count: bucket.repair_plan.automation.resolution_candidate_count,
            safe_resolution_command_count:
              bucket.repair_plan.automation.safe_resolution_command_count,
            projection_item_count: bucket.repair_plan.automation.projection_item_count,
            primary_next_command: bucket.repair_plan.automation.primary_next_command,
            blockers: [...bucket.repair_plan.automation.blockers],
            required_action: bucket.repair_plan.automation.required_action,
            reasons: [...bucket.repair_plan.automation.reasons],
          },
          command_candidates: bucket.repair_plan.command_candidates.map((candidate) => ({
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
            evidence_paths: [...candidate.evidence_paths],
            sample_plan_ids: [...candidate.sample_plan_ids],
            required_action: candidate.required_action,
            reasons: [...candidate.reasons],
          })),
          projection_plan_ids: [...bucket.repair_plan.projection_plan_ids],
          projection_items: bucket.repair_plan.projection_items.map((item) => ({
            plan_id: item.plan_id,
            source_path: item.source_path,
            failed_evidence_count: item.failed_evidence_count,
            latest_failed_at: item.latest_failed_at,
            command_labels: [...item.command_labels],
            evidence_paths: [...item.evidence_paths],
            required_green_tables: [...item.required_green_tables],
            projection_templates: item.projection_templates.map((template) => ({
              table: template.table,
              status_after_projection: template.status_after_projection,
              required_fields: [...template.required_fields],
              example_status: String(
                template.example_row.status ??
                  template.example_row.accept_status ??
                  template.example_row.artifact_type ??
                  "row",
              ),
              required_action: template.required_action,
            })),
            evidence_artifact_templates: item.evidence_artifact_templates.map((template) => ({
              artifact_kind: template.artifact_kind,
              artifact_path: template.artifact_path,
              projection_target_tables: [...template.projection_target_tables],
              template_format: template.template_format,
              write_policy: template.write_policy,
              required_fields: [...template.required_fields],
              example: { ...template.example },
              required_action: template.required_action,
              reasons: [...template.reasons],
            })),
            evidence_patch_plan: {
              approval_required: item.evidence_patch_plan.approval_required,
              write_policy: item.evidence_patch_plan.write_policy,
              dry_run_command: item.evidence_patch_plan.dry_run_command,
              execute_command: item.evidence_patch_plan.execute_command,
              patch_candidates: item.evidence_patch_plan.patch_candidates.map((candidate) => ({
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
              })),
              postcheck_commands: [...item.evidence_patch_plan.postcheck_commands],
              safety_policy: item.evidence_patch_plan.safety_policy,
              reasons: [...item.evidence_patch_plan.reasons],
            },
            required_action: item.required_action,
            postcheck_commands: [...item.postcheck_commands],
            reasons: [...item.reasons],
          })),
          required_green_tables: [...bucket.repair_plan.required_green_tables],
          required_green_status: bucket.repair_plan.required_green_status,
          projection_templates: bucket.repair_plan.projection_templates.map((template) => ({
            table: template.table,
            status_after_projection: template.status_after_projection,
            required_fields: [...template.required_fields],
            example_status: String(
              template.example_row.status ??
                template.example_row.accept_status ??
                template.example_row.artifact_type ??
                "row",
            ),
            required_action: template.required_action,
          })),
          projection_policy: bucket.repair_plan.projection_policy,
          safety_policy: bucket.repair_plan.safety_policy,
          reasons: [...bucket.repair_plan.reasons],
        },
        required_action: bucket.required_action,
        expected_transition: bucket.expected_transition,
        sample_plan_ids: [...bucket.sample_plan_ids],
        doc_dependencies: [...bucket.doc_dependencies],
        implementation_dependencies: [...bucket.implementation_dependencies],
        reasons: [...bucket.reasons],
      })),
      recommended_next_action: {
        action: closureOverview.recommended_next_action.action,
        reason: closureOverview.recommended_next_action.reason,
        command: closureOverview.recommended_next_action.command,
        human_required: closureOverview.recommended_next_action.human_required,
      },
      findings: closureOverview.findings.map((finding) => ({
        code: finding.code,
        severity: finding.severity,
        detail: finding.detail,
      })),
      write_policy: closureOverview.write_policy,
      source_command: closureOverview.source_command,
      view_command: closureOverview.view_command,
    },
    closure: {
      status: current.closure.status,
      l7_open_plan_ids: [...current.closure.l7_open_plan_ids],
      terminal_l14_plan_ids: [...current.closure.terminal_l14_plan_ids],
      closure_evidence_ids: [...current.closure.closure_evidence_ids],
      required_evidence: [...current.closure.required_evidence],
      evidence_templates: closureEvidenceTemplates,
      evidence_materialize: {
        action: closureBucketAction,
        status: evidenceMaterializePacket?.materialize_readiness.status ?? "no_action",
        probe_command: closureBucketAction
          ? closureEvidenceProbeCommand(closureBucketAction)
          : "helix closure evidence-probe --json",
        materialize_command: closureBucketAction
          ? closureEvidenceMaterializeCommand(closureBucketAction)
          : "helix closure evidence-materialize --summary-json",
        materialized_candidate_count: evidenceMaterializePacket?.materialized_candidate_count ?? 0,
        remaining_placeholder_count:
          evidenceMaterializePacket?.materialize_readiness.remaining_placeholder_count ?? 0,
        blocked_candidate_count:
          evidenceMaterializePacket?.materialize_readiness.blocked_candidate_count ?? 0,
        fillable_placeholders: [
          ...(evidenceProbePacket?.placeholder_resolution.fillable_placeholders ?? []),
        ],
        remaining_placeholders: [
          ...(evidenceProbePacket?.placeholder_resolution.remaining_placeholders ?? []),
        ],
        write_policy: evidenceMaterializePacket?.write_policy ?? "read-only",
        required_action:
          evidenceMaterializePacket?.materialize_readiness.required_action ??
          "closure queue に materialize 対象が存在しない",
      },
      evidence_apply: {
        action: closureBucketAction,
        status: evidenceApplyPlan?.allowed_to_apply ? "ready" : "blocked",
        materialize_readiness_status:
          evidenceApplyPlan?.materialize_readiness.status ?? "no_action",
        allowed_to_apply: evidenceApplyPlan?.allowed_to_apply ?? false,
        approval_required: true,
        approval_valid: evidenceApplyPlan?.approval.valid ?? false,
        patch_candidate_count: evidenceApplyPlan?.patch_candidates.length ?? 0,
        blocked_reasons: [
          ...(evidenceApplyPlan?.blocked_reasons ?? [
            "closure queue に evidence apply 対象が存在しない",
          ]),
        ],
        dry_run_command: closureBucketAction
          ? closureEvidenceApplyDryRunCommand(closureBucketAction)
          : "helix closure evidence-apply --dry-run --summary-json",
        execute_command: closureBucketAction
          ? closureEvidenceApplyExecuteCommand(closureBucketAction)
          : "helix closure evidence-apply --execute --summary-json",
        approval_draft_command: closureBucketAction
          ? closureEvidenceApprovalDraftCommand(closureBucketAction)
          : "helix closure evidence-approval-draft --summary-json",
        approval_record_fields: [
          ...(evidenceMaterializePacket?.approval.required_record_fields ?? [
            "decision_id: closure-evidence-materialize:<action>",
            "outcome: approve_materialized_evidence",
            "approval_scope_digest: <materialize approval scope>",
          ]),
        ],
        write_policy: "approval-required",
      },
      remediation: {
        items: current.closure.remediation.items.map((item) => ({
          category: item.category,
          label: item.label,
          status: item.status,
          l12_layer: item.l12Layer,
          count: item.count,
          subject_ids: [...item.subjectIds],
          required_action: item.requiredAction,
          reasons: [...item.reasons],
        })),
        done: current.closure.remediation.done,
        missing: current.closure.remediation.missing,
        reverify: current.closure.remediation.reverify,
      },
      queue: {
        items: current.closure.queue.items.map((item) => ({
          plan_id: item.planId,
          kind: item.kind,
          status: item.status,
          updated_at: item.updatedAt,
          source_path: item.sourcePath,
          l12_layer: item.l12Layer,
          coverage_id: item.coverageId,
          coverage_label: item.coverageLabel,
          priority: item.priority,
          drive_model: item.driveModel,
          remediation_status: item.remediationStatus,
          next_action: item.nextAction,
          required_action: item.requiredAction,
          doc_dependencies: [...item.docDependencies],
          implementation_dependencies: [...item.implementationDependencies],
          evidence_action: item.evidenceAction,
          evidence_gaps: item.evidenceGaps.map((gap) => ({
            component: gap.component,
            status: gap.status,
            evidence_tables: [...gap.evidenceTables],
            required_action: gap.requiredAction,
          })),
          evidence: {
            status: item.evidence.status,
            artifact_paths: [...item.evidence.artifactPaths],
            trace_edges: item.evidence.traceEdges,
            test_runs: {
              total: item.evidence.testRuns.total,
              passed: item.evidence.testRuns.passed,
              failed: item.evidence.testRuns.failed,
            },
            gate_runs: {
              total: item.evidence.gateRuns.total,
              passed: item.evidence.gateRuns.passed,
              failed: item.evidence.gateRuns.failed,
            },
            runtime_verification: {
              total: item.evidence.runtimeVerification.total,
              accepted: item.evidence.runtimeVerification.accepted,
            },
            evidence_paths: [...item.evidence.evidencePaths],
          },
          reasons: [...item.reasons],
        })),
        total: current.closure.queue.total,
        route_counts: {
          close_ready: current.closure.queue.route_counts.close_ready,
          collect_evidence: current.closure.queue.route_counts.collect_evidence,
          repair_failed_evidence: current.closure.queue.route_counts.repair_failed_evidence,
          reverse_design: current.closure.queue.route_counts.reverse_design,
        },
      },
      packets: {
        items: current.closure.packets.items.map((packet) => ({
          packet_id: packet.packetId,
          next_action: packet.nextAction,
          label: packet.label,
          drive_model: packet.driveModel,
          l12_layer: packet.l12Layer,
          count: packet.count,
          plan_ids: [...packet.planIds],
          source_paths: [...packet.sourcePaths],
          required_action: packet.requiredAction,
          doc_dependencies: [...packet.docDependencies],
          implementation_dependencies: [...packet.implementationDependencies],
          acceptance_criteria: [...packet.acceptanceCriteria],
          automation: {
            batch_id: packet.automation.batchId,
            sequence: packet.automation.sequence,
            machine_filter: packet.automation.machineFilter,
            detection_source: packet.automation.detectionSource,
            review_command: packet.automation.reviewCommand,
            view_command: packet.automation.viewCommand,
            write_policy: packet.automation.writePolicy,
            expected_transition: packet.automation.expectedTransition,
            promotion_gate: packet.automation.promotionGate,
            sample_plan_ids: [...packet.automation.samplePlanIds],
          },
          reasons: [...packet.reasons],
        })),
        total: current.closure.packets.total,
      },
      next_action_ledger: {
        entries: current.closure.next_action_ledger.entries.map((entry) => ({
          ledger_id: entry.ledgerId,
          packet_id: entry.packetId,
          next_action: entry.nextAction,
          status: entry.status,
          drive_model: entry.driveModel,
          l12_layer: entry.l12Layer,
          count: entry.count,
          primary_command: entry.primaryCommand,
          review_surface: entry.reviewSurface,
          write_policy: entry.writePolicy,
          plan_ids: [...entry.planIds],
          sample_plan_ids: [...entry.samplePlanIds],
          source_paths: [...entry.sourcePaths],
          required_action: entry.requiredAction,
          doc_dependencies: [...entry.docDependencies],
          implementation_dependencies: [...entry.implementationDependencies],
          acceptance_criteria: [...entry.acceptanceCriteria],
          evidence_policy: entry.evidencePolicy,
          automation: {
            batch_id: entry.automation.batchId,
            sequence: entry.automation.sequence,
            machine_filter: entry.automation.machineFilter,
            detection_source: entry.automation.detectionSource,
            review_command: entry.automation.reviewCommand,
            view_command: entry.automation.viewCommand,
            write_policy: entry.automation.writePolicy,
            expected_transition: entry.automation.expectedTransition,
            promotion_gate: entry.automation.promotionGate,
            sample_plan_ids: [...entry.automation.samplePlanIds],
          },
          human_required: entry.humanRequired,
          reasons: [...entry.reasons],
        })),
        total: current.closure.next_action_ledger.total,
        status_counts: {
          ready: current.closure.next_action_ledger.status_counts.ready,
          needs_evidence: current.closure.next_action_ledger.status_counts.needs_evidence,
          needs_repair: current.closure.next_action_ledger.status_counts.needs_repair,
          needs_reverse: current.closure.next_action_ledger.status_counts.needs_reverse,
        },
        write_policy: current.closure.next_action_ledger.write_policy,
        source_command: current.closure.next_action_ledger.source_command,
        view_command: current.closure.next_action_ledger.view_command,
      },
      apply_readiness: {
        close_ready_count: current.closure.queue.route_counts.close_ready,
        approval_required: current.closure.queue.route_counts.close_ready > 0,
        dry_run_command:
          "helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit 20 --json",
        execute_command:
          "helix closure apply --execute --approval-record <approved-approval-record-path> --limit 20 --json",
        review_bundle_command: "helix closure review-bundle --action close_ready --summary-json",
        transition_plan_command: "helix closure transition-plan --action close_ready --summary-json",
        decision_draft_command:
          "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft.yml --summary-json",
        review_window_command:
          "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
        transition_window_command:
          "helix closure transition-plan --action close_ready --limit 20 --offset 0 --summary-json",
        write_policy: "approval-required",
        status:
          current.closure.queue.route_counts.close_ready > 0
            ? "ready_for_approval"
            : "no_close_ready_candidates",
        reasons:
          current.closure.queue.route_counts.close_ready > 0
            ? [
                "close_ready candidate は承認後に closure apply --execute で accepted 化できる",
                "approval record が無い apply は fail-close する",
              ]
            : ["close_ready candidate が無いため apply 対象なし"],
      },
    },
    operation_scope: {
      items: current.operation_scope.items.map((item) => ({
        scope: item.scope,
        label: item.label,
        coverage_id: item.coverageId,
        coverage_label: item.coverageLabel,
        status: item.status,
        design_ids: [...item.designIds],
        observed_count: item.observedCount,
        observation_sources: [...item.observationSources],
        evidence_tables: [...item.evidenceTables],
        reasons: [...item.reasons],
      })),
      designed: current.operation_scope.designed,
      observed: current.operation_scope.observed,
      observed_gap: current.operation_scope.observed_gap,
      missing: current.operation_scope.missing,
      reverify: current.operation_scope.reverify,
    },
    artifact_remap: {
      items: current.artifact_remap.items.map((item) => ({
        kind: item.kind,
        artifact_id: item.artifactId,
        source_path: item.sourcePath,
        legacy_layer: item.legacyLayer,
        l12_layer: item.l12Layer,
        coverage_id: item.coverageId,
        coverage_label: item.coverageLabel,
        zip_source_binding_ids: [...(item.zipSourceBindingIds ?? [])],
        tailoring_rule_ids: [...(item.tailoringRuleIds ?? [])],
        tailoring_detail_levels: [...(item.tailoringDetailLevels ?? [])],
        status: item.status,
        reasons: [...item.reasons],
      })),
      layers: (current.artifact_remap.layers ?? []).map((layer) => ({
        layer: layer.layer,
        label: layer.label,
        status: layer.status,
        drive_model: layer.driveModel,
        total: layer.total,
        done: layer.done,
        missing: layer.missing,
        reverify: layer.reverify,
        artifact_ids: [...layer.artifactIds],
        batch_command: layer.batchCommand,
        required_action: layer.requiredAction,
        reasons: [...layer.reasons],
      })),
      done: current.artifact_remap.done,
      missing: current.artifact_remap.missing,
      reverify: current.artifact_remap.reverify,
    },
    drive_model: driveModel.selected_model,
    drive_reason: driveModel.selected_candidate.required_action,
    drive_model_candidates: driveModel.candidates.map((candidate) => ({
      model: candidate.model,
      rank: candidate.rank,
      status: candidate.status,
      route_id: candidate.route_id,
      trigger: candidate.trigger,
      required_action: candidate.required_action,
      command: candidate.command,
      coverage_ids: [...candidate.coverage_ids],
      coverage_labels: [...candidate.coverage_labels],
      doc_dependencies: [...candidate.doc_dependencies],
      implementation_dependencies: [...candidate.implementation_dependencies],
      reasons: [...candidate.reasons],
    })),
    reverse_targets: [...current.drive_recommendation.reverseTargets],
    drive_route: {
      route_id: current.drive_route.routeId,
      status: current.drive_route.status,
      selected_model: current.drive_route.selectedModel,
      default_model: current.drive_route.defaultModel,
      reason: current.drive_route.reason,
      write_policy: current.drive_route.writePolicy,
      source_command: current.drive_route.sourceCommand,
      view_command: current.drive_route.viewCommand,
      must_return_to_design: current.drive_route.mustReturnToDesign,
      forward: {
        allowed: current.drive_route.forward.allowed,
        roadmap_status: current.drive_route.forward.roadmapStatus,
        frontier: [...current.drive_route.forward.frontier],
        current_band_ids: [...current.drive_route.forward.currentBandIds],
        current_gate_ids: [...current.drive_route.forward.currentGateIds],
        coverage_ids: [...current.drive_route.forward.coverageIds],
        coverage_labels: [...current.drive_route.forward.coverageLabels],
      },
      reverse: {
        required: current.drive_route.reverse.required,
        targets: [...current.drive_route.reverse.targets],
        l12_layers: [...current.drive_route.reverse.l12Layers],
        coverage_ids: [...current.drive_route.reverse.coverageIds],
        coverage_labels: [...current.drive_route.reverse.coverageLabels],
        doc_dependencies: [...current.drive_route.reverse.docDependencies],
        implementation_dependencies: [...current.drive_route.reverse.implementationDependencies],
        queue_actions: [...current.drive_route.reverse.queueActions],
        ledger_ids: [...current.drive_route.reverse.ledgerIds],
        acceptance_criteria: [...current.drive_route.reverse.acceptanceCriteria],
      },
      reasons: [...current.drive_route.reasons],
    },
    findings: current.findings.map((finding) => ({
      code: finding.code,
      severity: finding.severity,
      detail: finding.detail,
    })),
  };
}

export function buildSkillAgentTelemetryView(
  snapshot: VisualizationSnapshot,
): SkillAgentTelemetryView {
  return {
    skill_invocations: [
      row("total", snapshot.evidence.skill_invocations.total, null),
      row("accepted", snapshot.evidence.skill_invocations.accepted, null),
    ],
    model_runs: [row("total", snapshot.evidence.model_runs.total, null)],
  };
}

export function buildHarnessGrowthView(snapshot: VisualizationSnapshot): HarnessGrowthView {
  const layerProgress = buildLayerProgressView(snapshot);
  const currentSections = {
    artifacts: [...layerProgress.artifacts],
    plans: [...layerProgress.plans],
    gates: [...layerProgress.gates],
  };
  return {
    current_sections: currentSections,
    current: [...currentSections.artifacts, ...currentSections.plans, ...currentSections.gates],
    // Current snapshot schema (visualization-snapshot.v1) holds no historical
    // series; interpolating one would fabricate growth data (HAC-VIS-07b), so
    // the series is honestly empty and flagged via shared_warnings instead.
    growth_series: [],
  };
}

function isGraphEmpty(snapshot: VisualizationSnapshot): boolean {
  return snapshot.graph.nodes === 0 && snapshot.graph.edges === 0 && snapshot.graph.snapshots === 0;
}

function isRuntimeEvidenceEmpty(snapshot: VisualizationSnapshot): boolean {
  return (
    snapshot.evidence.test_runs.total === 0 &&
    snapshot.evidence.runtime_verification.total === 0 &&
    snapshot.evidence.guardrail_decisions.total === 0
  );
}

function isSkillAgentTelemetryEmpty(snapshot: VisualizationSnapshot): boolean {
  return (
    snapshot.evidence.skill_invocations.total === 0 && snapshot.evidence.model_runs.total === 0
  );
}

function buildSharedWarnings(snapshot: VisualizationSnapshot): string[] {
  const warnings: string[] = [...snapshot.warnings];
  warnings.push(WARN_DESIGN_TEST_PAIR_UNAVAILABLE);
  warnings.push(WARN_RELATION_GRAPH_RAW_LIST_UNAVAILABLE);
  if (isGraphEmpty(snapshot)) warnings.push(WARN_RELATION_GRAPH_EMPTY);
  if (isRuntimeEvidenceEmpty(snapshot)) warnings.push(WARN_RUNTIME_EVIDENCE_EMPTY);
  if (isSkillAgentTelemetryEmpty(snapshot)) warnings.push(WARN_SKILL_AGENT_TELEMETRY_EMPTY);
  warnings.push(WARN_HARNESS_GROWTH_SERIES_UNAVAILABLE);
  return warnings;
}

type ProjectCurrentLocationWorkBucket = NonNullable<
  ProjectCurrentLocationView["vmodel_fit"]["next_actions"][number]["work_bucket"]
>;
type ProjectEvidenceHandoffStatus = NonNullable<
  ProjectCurrentLocationWorkBucket["evidence_handoff_status"]
>;
type ProjectEvidenceApprovalRecord = NonNullable<
  ProjectEvidenceHandoffStatus["items"][number]["approval_record"]
>;
type ProjectEvidenceHandoffNext = NonNullable<
  ProjectCurrentLocationWorkBucket["evidence_handoff_next"]
>;

function projectApprovalState(approval: ProjectEvidenceApprovalRecord | null | undefined): string {
  return approval?.status ?? "not_required";
}

function projectHandoffReasonCodes(input: {
  status: ProjectEvidenceHandoffNext["status"];
  approval?: ProjectEvidenceApprovalRecord | null;
  extras?: string[];
}): string[] {
  const approval = input.approval ?? null;
  return [
    `handoff.status.${input.status}`,
    `approval.${projectApprovalState(approval)}`,
    `approval.scope.${approval?.scope_status ?? "none"}`,
    `approval.valid_for_apply.${approval?.valid_for_apply ?? false}`,
    ...(input.extras ?? []),
  ];
}

function vmodelHandoffSummaryForView(
  snapshot: VisualizationSnapshot,
  nextActions: ReturnType<typeof buildVmodelFitReport>["next_actions"],
): ProjectCurrentLocationView["vmodel_fit"]["handoff_summary"] {
  const steps = nextActions
    .map((action) => {
      const bucket = action.work_bucket;
      if (!bucket?.evidence_handoff_artifacts) return null;
      return evidenceHandoffNextStep({
        bucket,
        status: evidenceHandoffStatusForAction(snapshot, bucket.action),
      });
    })
    .filter((step): step is ProjectEvidenceHandoffNext => step !== null);
  const machinePendingStatuses = new Set<ProjectEvidenceHandoffNext["status"]>([
    "generate_probe",
    "generate_approval_draft",
    "unchecked",
    "unavailable",
  ]);
  const approvalPending = steps.filter((step) => step.status === "approval_pending").length;
  const approvalRequired = steps.filter((step) => step.status === "approval_required").length;
  const approvalRejected = steps.filter((step) => step.status === "approval_rejected").length;
  const applyReady = steps.filter((step) => step.status === "apply_dry_run").length;
  const scopeMismatch = steps.filter((step) => step.scope_status === "mismatch").length;
  const scopeMissing = steps.filter((step) => step.scope_status === "missing").length;
  const machinePending = steps.filter((step) => machinePendingStatuses.has(step.status)).length;
  const status: ProjectCurrentLocationView["vmodel_fit"]["handoff_summary"]["status"] =
    approvalRejected > 0 || scopeMismatch > 0
      ? "approval_blocked"
      : approvalPending > 0 || approvalRequired > 0
        ? "approval_pending"
        : applyReady > 0
          ? "apply_ready"
          : machinePending > 0
            ? "machine_pending"
            : "none";
  return {
    status,
    total: steps.length,
    machine_pending: machinePending,
    approval_pending: approvalPending,
    approval_required: approvalRequired,
    approval_rejected: approvalRejected,
    apply_ready: applyReady,
    unchecked: steps.filter((step) => step.status === "unchecked").length,
    unavailable: steps.filter((step) => step.status === "unavailable").length,
    scope_match: steps.filter((step) => step.scope_status === "match").length,
    scope_mismatch: scopeMismatch,
    scope_missing: scopeMissing,
    valid_for_apply: steps.filter((step) => step.valid_for_apply).length,
    invalid_for_apply: steps.filter((step) => !step.valid_for_apply).length,
    commands: [...new Set(steps.map((step) => step.command))],
    reason_codes: [...new Set(steps.flatMap((step) => step.reason_codes))],
    reasons: [
      `total=${steps.length}`,
      `machine_pending=${machinePending}`,
      `approval_pending=${approvalPending}`,
      `approval_required=${approvalRequired}`,
      `approval_rejected=${approvalRejected}`,
      `apply_ready=${applyReady}`,
      `scope_mismatch=${scopeMismatch}`,
      `scope_missing=${scopeMissing}`,
    ],
  };
}

function evidenceHandoffStatusForAction(
  snapshot: VisualizationSnapshot,
  action: string,
): NonNullable<
  NonNullable<
    ProjectCurrentLocationView["vmodel_fit"]["next_actions"][number]["work_bucket"]
  >["evidence_handoff_status"]
> | null {
  const items = snapshot.recovery_handoff_artifacts.items
    .filter((item) => item.action === action)
    .map((item) => ({
      kind: item.kind,
      path: item.path,
      status: item.status,
      generation_status: item.generation_status,
      generation_command: item.generation_command,
      bytes: item.bytes,
      sha256: item.sha256,
      write_policy: item.write_policy,
      approval_record: item.approval_record
        ? {
            status: item.approval_record.status,
            decision_id: item.approval_record.decision_id,
            outcome: item.approval_record.outcome,
            approval_scope_digest: item.approval_record.approval_scope_digest,
            expected_approval_scope_digest: item.approval_record.expected_approval_scope_digest,
            scope_status: item.approval_record.scope_status,
            materialize_status: item.approval_record.materialize_status,
            reviewed_candidate_count: item.approval_record.reviewed_candidate_count,
            valid_for_apply: item.approval_record.valid_for_apply,
            reasons: [...item.approval_record.reasons],
          }
        : null,
      reasons: [...item.reasons],
    }));
  if (items.length === 0) return null;
  return {
    present: items.filter((item) => item.status === "present").length,
    missing: items.filter((item) => item.status === "missing").length,
    unchecked: items.filter((item) => item.status === "unchecked").length,
    items,
  };
}

function evidenceHandoffNextStep(input: {
  bucket: Pick<
    NonNullable<ProjectCurrentLocationView["vmodel_fit"]["next_actions"][number]["work_bucket"]>,
    | "evidence_handoff_artifacts"
    | "evidence_probe_command"
    | "evidence_approval_draft_command"
    | "evidence_materialize_command"
    | "evidence_apply_dry_run_command"
  >;
  status: NonNullable<
    NonNullable<
      ProjectCurrentLocationView["vmodel_fit"]["next_actions"][number]["work_bucket"]
    >["evidence_handoff_status"]
  > | null;
}): NonNullable<
  NonNullable<
    ProjectCurrentLocationView["vmodel_fit"]["next_actions"][number]["work_bucket"]
  >["evidence_handoff_next"]
> | null {
  if (!input.bucket.evidence_handoff_artifacts) return null;
  if (!input.status) {
    return {
      status: "unavailable",
      approval_state: "not_required",
      scope_status: null,
      valid_for_apply: false,
      command: input.bucket.evidence_probe_command,
      label: "handoff unavailable",
      required_action: "handoff artifact の実在状態を取得できないため probe 生成から確認する",
      reason_codes: projectHandoffReasonCodes({
        status: "unavailable",
        extras: ["handoff.status.missing"],
      }),
      reasons: ["handoff_status=missing"],
    };
  }
  const probe = input.status.items.find((item) => item.kind === "probe_record");
  const draft = input.status.items.find((item) => item.kind === "approval_draft");
  if (probe?.status === "unchecked" || draft?.status === "unchecked") {
    return {
      status: "unchecked",
      approval_state: projectApprovalState(
        input.status.items.find((item) => item.approval_record)?.approval_record,
      ),
      scope_status:
        input.status.items.find((item) => item.approval_record)?.approval_record?.scope_status ??
        null,
      valid_for_apply:
        input.status.items.find((item) => item.approval_record)?.approval_record?.valid_for_apply ??
        false,
      command: input.bucket.evidence_probe_command,
      label: "handoff unchecked",
      required_action: "repoRoot 付き view で handoff artifact の実在を再検査する",
      reason_codes: projectHandoffReasonCodes({
        status: "unchecked",
        approval: input.status.items.find((item) => item.approval_record)?.approval_record,
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
      approval_state: projectApprovalState(
        input.status.items.find((item) => item.approval_record)?.approval_record,
      ),
      scope_status:
        input.status.items.find((item) => item.approval_record)?.approval_record?.scope_status ??
        null,
      valid_for_apply:
        input.status.items.find((item) => item.approval_record)?.approval_record?.valid_for_apply ??
        false,
      command: probe?.generation_command ?? input.bucket.evidence_probe_command,
      label: "generate probe record",
      required_action: "verification command を実行し、probe record artifact を生成する",
      reason_codes: projectHandoffReasonCodes({
        status: "generate_probe",
        approval: input.status.items.find((item) => item.approval_record)?.approval_record,
        extras: ["handoff.probe_record.missing"],
      }),
      reasons: probe?.reasons ?? ["probe_record is not present"],
    };
  }
  if (draft?.status !== "present") {
    return {
      status: "generate_approval_draft",
      approval_state: projectApprovalState(
        input.status.items.find((item) => item.approval_record)?.approval_record,
      ),
      scope_status:
        input.status.items.find((item) => item.approval_record)?.approval_record?.scope_status ??
        null,
      valid_for_apply:
        input.status.items.find((item) => item.approval_record)?.approval_record?.valid_for_apply ??
        false,
      command: draft?.generation_command ?? input.bucket.evidence_approval_draft_command,
      label: "generate approval draft",
      required_action: "probe record から non-authorizing approval draft を生成する",
      reason_codes: projectHandoffReasonCodes({
        status: "generate_approval_draft",
        approval: input.status.items.find((item) => item.approval_record)?.approval_record,
        extras: ["handoff.approval_draft.missing"],
      }),
      reasons: draft?.reasons ?? ["approval_draft is not present"],
    };
  }
  const approval = draft.approval_record;
  if (approval?.status === "approved" && approval.valid_for_apply) {
    return {
      status: "apply_dry_run",
      approval_state: projectApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.bucket.evidence_apply_dry_run_command.replace(
        "<approved-approval-record-path>",
        input.bucket.evidence_handoff_artifacts.approval_draft_path,
      ),
      label: "apply dry-run approved evidence",
      required_action:
        "承認済み record を使って apply dry-run を実行し、digest/approval scope と patch candidate を照合する",
      reason_codes: projectHandoffReasonCodes({
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
      approval_state: projectApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.bucket.evidence_materialize_command,
      label: "approval pending",
      required_action:
        "materialized preview と approval_scope_digest を確認し、人間判断で outcome を approve/reject に更新する",
      reason_codes: projectHandoffReasonCodes({
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
      approval_state: projectApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.bucket.evidence_materialize_command,
      label: "approval rejected",
      required_action: "reject 理由に従って evidence projection または設計/テスト設計へ戻す",
      reason_codes: projectHandoffReasonCodes({
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
      approval_state: projectApprovalState(approval),
      scope_status: approval.scope_status,
      valid_for_apply: approval.valid_for_apply,
      command: input.bucket.evidence_approval_draft_command,
      label: "approval record invalid",
      required_action: "approval record の必須 field/outcome を修正してから dry-run する",
      reason_codes: projectHandoffReasonCodes({
        status: "approval_required",
        approval,
        extras: ["approval.record.invalid"],
      }),
      reasons: approval.reasons,
    };
  }
  return {
    status: "approval_required",
    approval_state: projectApprovalState(approval),
    scope_status: approval?.scope_status ?? null,
    valid_for_apply: approval?.valid_for_apply ?? false,
    command: input.bucket.evidence_materialize_command,
    label: "review materialized evidence",
    required_action:
      "materialized preview と approval_scope_digest を確認し、人間承認後に apply dry-run/execute を扱う",
    reason_codes: projectHandoffReasonCodes({
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

function handoffAwareAutomationClass(
  fallback: string,
  handoffNext: ReturnType<typeof evidenceHandoffNextStep>,
): string {
  if (
    handoffNext?.status === "approval_pending" ||
    handoffNext?.status === "approval_required" ||
    handoffNext?.status === "approval_rejected"
  ) {
    return "approval";
  }
  return fallback;
}

function effectiveHandoffPhase(status: string): "machine" | "approval" | "none" {
  if (
    status === "approval_pending" ||
    status === "approval_required" ||
    status === "approval_rejected"
  ) {
    return "approval";
  }
  return status === "none" ? "none" : "machine";
}

function recoveryHandoffGateForView(
  snapshot: VisualizationSnapshot,
  vmodelFit: ReturnType<typeof buildVmodelFitReport>,
): ProjectCurrentLocationView["vmodel_fit"]["recovery_handoff_gate"] {
  const action = vmodelFit.next_actions.find((item) => item.blocker_code === "current_location");
  const bucket = action?.work_bucket ?? null;
  if (!action || !bucket?.evidence_handoff_artifacts) {
    return {
      status: vmodelFit.recovery_handoff_gate.status,
      effective_phase: vmodelFit.recovery_handoff_gate.effective_phase,
      action_id: vmodelFit.recovery_handoff_gate.action_id,
      blocker_code: vmodelFit.recovery_handoff_gate.blocker_code,
      command: vmodelFit.recovery_handoff_gate.command,
      required_action: vmodelFit.recovery_handoff_gate.required_action,
      handoff_present: vmodelFit.recovery_handoff_gate.handoff_present,
      handoff_missing: vmodelFit.recovery_handoff_gate.handoff_missing,
      approval_status: vmodelFit.recovery_handoff_gate.approval_status,
      scope_status: vmodelFit.recovery_handoff_gate.scope_status,
      decision_id: vmodelFit.recovery_handoff_gate.decision_id,
      outcome: vmodelFit.recovery_handoff_gate.outcome,
      approval_scope_digest: vmodelFit.recovery_handoff_gate.approval_scope_digest,
      expected_approval_scope_digest:
        vmodelFit.recovery_handoff_gate.expected_approval_scope_digest,
      materialize_status: vmodelFit.recovery_handoff_gate.materialize_status,
      reviewed_candidate_count: vmodelFit.recovery_handoff_gate.reviewed_candidate_count,
      valid_for_apply: vmodelFit.recovery_handoff_gate.valid_for_apply,
      approval_state: vmodelFit.recovery_handoff_gate.approval_state,
      reason_codes: [...vmodelFit.recovery_handoff_gate.reason_codes],
      reasons: [...vmodelFit.recovery_handoff_gate.reasons],
    };
  }
  const handoffStatus = evidenceHandoffStatusForAction(snapshot, bucket.action);
  const handoffNext = evidenceHandoffNextStep({ bucket, status: handoffStatus });
  if (!handoffNext) {
    return {
      status: "none",
      effective_phase: "none",
      action_id: action.action_id,
      blocker_code: action.blocker_code,
      command: action.command,
      required_action: "current-location recovery handoff は未検出",
      handoff_present: handoffStatus?.present ?? 0,
      handoff_missing: handoffStatus?.missing ?? 0,
      approval_status:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record?.status ?? null,
      scope_status:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record?.scope_status ??
        null,
      decision_id:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record?.decision_id ??
        vmodelFit.recovery_handoff_gate.decision_id,
      outcome:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record?.outcome ??
        vmodelFit.recovery_handoff_gate.outcome,
      approval_scope_digest:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record
          ?.approval_scope_digest ?? vmodelFit.recovery_handoff_gate.approval_scope_digest,
      expected_approval_scope_digest:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record
          ?.expected_approval_scope_digest ??
        vmodelFit.recovery_handoff_gate.expected_approval_scope_digest,
      materialize_status:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record
          ?.materialize_status ?? vmodelFit.recovery_handoff_gate.materialize_status,
      reviewed_candidate_count:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record
          ?.reviewed_candidate_count ?? vmodelFit.recovery_handoff_gate.reviewed_candidate_count,
      valid_for_apply:
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record
          ?.valid_for_apply ?? vmodelFit.recovery_handoff_gate.valid_for_apply,
      approval_state: projectApprovalState(
        handoffStatus?.items.find((item) => item.approval_record)?.approval_record,
      ),
      reason_codes: ["handoff.status.none", "handoff.next.missing"],
      reasons: ["current_location next action に handoff_next が無い"],
    };
  }
  const approvalRecord = handoffStatus?.items.find((item) => item.approval_record)?.approval_record;
  return {
    status: handoffNext.status,
    effective_phase: effectiveHandoffPhase(handoffNext.status),
    action_id: action.action_id,
    blocker_code: action.blocker_code,
    command: handoffNext.command,
    required_action: handoffNext.required_action,
    handoff_present: handoffStatus?.present ?? 0,
    handoff_missing: handoffStatus?.missing ?? 0,
    approval_status: approvalRecord?.status ?? null,
    scope_status: approvalRecord?.scope_status ?? null,
    decision_id: approvalRecord?.decision_id ?? vmodelFit.recovery_handoff_gate.decision_id,
    outcome: approvalRecord?.outcome ?? vmodelFit.recovery_handoff_gate.outcome,
    approval_scope_digest:
      approvalRecord?.approval_scope_digest ??
      vmodelFit.recovery_handoff_gate.approval_scope_digest,
    expected_approval_scope_digest:
      approvalRecord?.expected_approval_scope_digest ??
      vmodelFit.recovery_handoff_gate.expected_approval_scope_digest,
    materialize_status:
      approvalRecord?.materialize_status ?? vmodelFit.recovery_handoff_gate.materialize_status,
    reviewed_candidate_count:
      approvalRecord?.reviewed_candidate_count ??
      vmodelFit.recovery_handoff_gate.reviewed_candidate_count,
    valid_for_apply:
      approvalRecord?.valid_for_apply ?? vmodelFit.recovery_handoff_gate.valid_for_apply,
    approval_state: handoffNext.approval_state,
    reason_codes: [
      ...handoffNext.reason_codes,
      `handoff.phase.${effectiveHandoffPhase(handoffNext.status)}`,
      `action.${action.action_id}`,
      `automation.${handoffAwareAutomationClass(action.automation_class, handoffNext)}`,
    ],
    reasons: [
      `action=${action.action_id}`,
      `automation=${handoffAwareAutomationClass(action.automation_class, handoffNext)}`,
      `handoff_next=${handoffNext.status}`,
      `approval=${approvalRecord?.status ?? "-"}`,
      `scope=${approvalRecord?.scope_status ?? "-"}`,
      `decision=${approvalRecord?.decision_id ?? vmodelFit.recovery_handoff_gate.decision_id ?? "-"}`,
      `digest=${approvalRecord?.approval_scope_digest ?? vmodelFit.recovery_handoff_gate.approval_scope_digest ?? "-"}`,
      `expected_digest=${approvalRecord?.expected_approval_scope_digest ?? vmodelFit.recovery_handoff_gate.expected_approval_scope_digest ?? "-"}`,
      `materialize=${approvalRecord?.materialize_status ?? vmodelFit.recovery_handoff_gate.materialize_status ?? "-"}`,
      `valid_for_apply=${approvalRecord?.valid_for_apply ?? vmodelFit.recovery_handoff_gate.valid_for_apply}`,
      ...handoffNext.reasons,
    ],
  };
}

export function buildVisualizationViewModel(
  snapshot: VisualizationSnapshot,
): VisualizationViewModel {
  requireSnapshotSchema(snapshot);

  return {
    generated_from: snapshot.schema_version,
    source_clock: snapshot.source_clock,
    view_boundaries: {
      project: {
        ...VIEW_BOUNDARIES.project,
        owned_views: [...VIEW_BOUNDARIES.project.owned_views],
        source_fields: [...VIEW_BOUNDARIES.project.source_fields],
        excluded_fields: [...VIEW_BOUNDARIES.project.excluded_fields],
      },
      harness: {
        ...VIEW_BOUNDARIES.harness,
        owned_views: [...VIEW_BOUNDARIES.harness.owned_views],
        source_fields: [...VIEW_BOUNDARIES.harness.source_fields],
        excluded_fields: [...VIEW_BOUNDARIES.harness.excluded_fields],
      },
    },
    project: {
      current_location: buildProjectCurrentLocationView(snapshot),
      layer_progress: buildLayerProgressView(snapshot),
      design_test_pair: buildDesignTestPairView(snapshot),
      relation_graph: buildRelationGraphView(snapshot),
      runtime_evidence: buildRuntimeEvidenceView(snapshot),
    },
    harness: {
      harness_growth: buildHarnessGrowthView(snapshot),
      skill_agent_telemetry: buildSkillAgentTelemetryView(snapshot),
    },
    shared_warnings: buildSharedWarnings(snapshot),
  };
}
