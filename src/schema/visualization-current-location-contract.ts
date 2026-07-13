/** Adapter-neutral current-location DTO contract. */
import type { ClosureReviewScopeView, ClosureReviewWindowView } from "./visualization-contract";

export interface ProjectCurrentLocationView {
  layer: string | null;
  l12_layer: string | null;
  status: string;
  completion_boundary: string;
  roadmap_frontier: string[];
  current_location_frontier: {
    schema_version: "current-location-frontier-summary.v1";
    frontier_type: "recovery_frontier" | "forward_frontier";
    status: "recovery_required" | "current";
    classification:
      | "l14_claim_with_l7_work"
      | "recovery_queue"
      | "no_current_location_contradiction";
    completion_boundary: string;
    selected_model: string;
    route_id: string;
    must_return_to_design: boolean;
    open_l7_count: number;
    terminal_l14_claim_count: number;
    sample_open_l7_plan_ids: string[];
    sample_terminal_l14_plan_ids: string[];
    finding_codes: string[];
    selected_closure_action: string | null;
    queue_total: number;
    route_counts: {
      close_ready: number;
      collect_evidence: number;
      repair_failed_evidence: number;
      reverse_design: number;
    };
    automation: {
      status: string;
      machine_actionable_count: number;
      human_approval_count: number;
      design_reverse_count: number;
      remaining_after_machine_lanes: number;
    };
    reentry: {
      status: string;
      next_gate: string;
      next_phase_action: string | null;
      next_command: string;
      next_execution_command: string;
    };
    commands: {
      current_location: "helix current-location --summary-json";
      drive_model: "helix drive model --summary-json";
      recovery_plan: "helix recovery plan --summary-json";
      roadmap_current: "helix roadmap current --summary-json";
      vmodel_fit: "helix vmodel fit --summary-json";
      project_frontier: "helix progress frontier --summary-json";
    };
    required_action: string;
  };
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
    handoff_gate: {
      status: string;
      effective_phase: string;
      approval_status: string | null;
      scope_status: string | null;
      decision_id: string | null;
      outcome: string | null;
      approval_record_path: string | null;
      approval_scope_digest: string | null;
      expected_approval_scope_digest: string | null;
      materialize_status: string | null;
      valid_for_apply: boolean;
      approval_state: string;
      command: string;
      required_action: string;
      reasons: string[];
    };
    reentry_forecast: {
      status: string;
      effective_status: string;
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
      effective_reentry_status: string;
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
            | "refresh_approval_draft"
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
      approval_record_path: string | null;
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
      attention_boundary: {
        status: "none" | "human_approval" | "design_or_runtime_regression" | "machine_reentry";
        completion_claim_blocked_by: "none" | "human_approval" | "machine_or_design_work";
        machine_guard_count: number;
        human_approval_guard_count: number;
        machine_actionable_count: number;
        human_approval_count: number;
        design_reverse_count: number;
        blocked_by_findings_count: number;
        next_command: string;
      };
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
      effective_status: string;
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
      boundary: {
        status: "none" | "human_approval" | "design_or_runtime_regression" | "machine_reentry";
        completion_claim_blocked_by: "none" | "human_approval" | "machine_or_design_work";
        automation_class: "none" | "approval" | "machine";
        machine_actionable_count: number;
        human_approval_count: number;
        design_reverse_count: number;
        next_command: string;
      };
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
    planning_items: number;
    ceremony_items: number;
    metric_items: number;
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
      approval_window_count: number;
      dry_run_command: string;
      execute_command: string;
      review_bundle_command: string;
      transition_plan_command: string;
      decision_draft_command: string;
      review_window_command: string;
      transition_window_command: string;
      review_window_index: ClosureReviewWindowView[];
      aggregate_review_scope: ClosureReviewScopeView;
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
      approval_window_count: number;
      dry_run_command: string;
      execute_command: string;
      review_bundle_command: string;
      transition_plan_command: string;
      decision_draft_command: string;
      review_window_command: string;
      transition_window_command: string;
      review_window_index: ClosureReviewWindowView[];
      aggregate_review_scope: ClosureReviewScopeView;
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
