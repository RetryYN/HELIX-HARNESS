import type { IndexDef } from "./harness-db-types";

export const HARNESS_DB_INDEXES: IndexDef[] = [
  {
    name: "idx_plan_layer_drive_status",
    table: "plan_registry",
    // physical-data §9.3 準拠: (plan_id, layer, drive, status)。plan_id は PK だが doc 宣言に整合させる。
    columns: ["plan_id", "layer", "drive", "status"],
  },
  { name: "idx_trace_from_to", table: "trace_edges", columns: ["from_artifact", "to_artifact"] },
  {
    name: "idx_findings_subject_status",
    table: "findings",
    columns: ["subject_id", "status", "severity"],
  },
  {
    name: "idx_hook_session_plan",
    table: "hook_events",
    columns: ["session_id", "plan_id", "occurred_at"],
  },
  {
    name: "idx_route_modes_plan_mode",
    table: "route_modes",
    columns: ["plan_id", "mode", "drive_run_id"],
  },
  {
    name: "idx_skill_plan_skill",
    table: "skill_invocations",
    columns: ["plan_id", "skill_id", "fired_at"],
  },
  {
    name: "idx_issue_queue_plan_status",
    table: "issue_queue",
    columns: ["plan_id", "status", "created_at"],
  },
  {
    name: "idx_trouble_events_plan_category",
    table: "trouble_events",
    columns: ["plan_id", "category", "created_at"],
  },
  {
    name: "idx_retry_events_plan_phase",
    table: "retry_events",
    columns: ["plan_id", "workflow", "phase"],
  },
  {
    name: "idx_improvement_log_status",
    table: "improvement_log",
    columns: ["status", "created_at"],
  },
  { name: "idx_search_subject", table: "search_index", columns: ["subject_type", "subject_id"] },
  {
    name: "idx_design_declarations_defined",
    table: "design_declarations",
    columns: ["defined_id", "declaration_kind"],
  },
  {
    name: "idx_design_references_from_to",
    table: "design_references",
    columns: ["from_id", "to_id", "reference_kind"],
  },
  {
    name: "idx_design_impact_root",
    table: "design_impact",
    columns: ["root_id", "direction", "status"],
  },
  {
    name: "idx_design_impact_impacted",
    table: "design_impact",
    columns: ["impacted_id", "impact_kind", "status"],
  },
  {
    name: "idx_project_current_location_status",
    table: "project_current_location",
    columns: ["current_status", "selected_drive_model", "drive_route_status"],
  },
  {
    name: "idx_project_drive_model_candidates_status",
    table: "project_drive_model_candidates",
    columns: ["snapshot_id", "status", "rank"],
  },
  {
    name: "idx_project_roadmap_current_actions_status",
    table: "project_roadmap_current_actions",
    columns: ["snapshot_id", "status", "category"],
  },
  {
    name: "idx_project_zip_adoption_decisions_status",
    table: "project_zip_adoption_decisions",
    columns: ["snapshot_id", "category", "status"],
  },
  {
    name: "idx_project_tailoring_decisions_status",
    table: "project_tailoring_decisions",
    columns: ["snapshot_id", "category", "status"],
  },
  {
    name: "idx_project_vmodel_regression_guards_status",
    table: "project_vmodel_regression_guards",
    columns: ["snapshot_id", "status", "guard_count"],
  },
  {
    name: "idx_project_vmodel_fit_blockers_status",
    table: "project_vmodel_fit_blockers",
    columns: ["snapshot_id", "status", "blocker_count"],
  },
  {
    name: "idx_project_vmodel_handoff_summary_status",
    table: "project_vmodel_handoff_summary",
    columns: ["snapshot_id", "status", "effective_phase"],
  },
  {
    name: "idx_project_l12_layer_coverage_status",
    table: "project_l12_layer_coverage",
    columns: ["snapshot_id", "layer", "status"],
  },
  {
    name: "idx_design_coverage_gate_status",
    table: "design_coverage_gate",
    columns: ["snapshot_id", "l12_layer", "status"],
  },
  {
    name: "idx_project_operation_scopes_status",
    table: "project_operation_scopes",
    columns: ["snapshot_id", "scope", "status"],
  },
  {
    name: "idx_project_artifact_remap_status",
    table: "project_artifact_remap",
    columns: ["snapshot_id", "status", "l12_layer"],
  },
  {
    name: "idx_vmodel_zip_manifest_status",
    table: "vmodel_zip_manifest",
    columns: ["source_package", "inventory_status", "ok"],
  },
  {
    name: "idx_vmodel_zip_source_bindings_status",
    table: "vmodel_zip_source_bindings",
    columns: ["status", "source_category", "source_present"],
  },
  {
    name: "idx_visualization_view_model_schema",
    table: "visualization_view_model",
    columns: ["schema_version", "generated_from"],
  },
  {
    name: "idx_visualization_tree_view_schema",
    table: "visualization_tree_view",
    columns: ["schema_version", "root_count"],
  },
  {
    name: "idx_graph_node_type_subject",
    table: "graph_nodes",
    columns: ["node_type", "subject_id"],
  },
  { name: "idx_graph_path", table: "graph_nodes", columns: ["path"] },
  {
    name: "idx_dependency_from_kind",
    table: "dependency_edges",
    columns: ["from_node_id", "edge_kind"],
  },
  {
    name: "idx_dependency_to_kind",
    table: "dependency_edges",
    columns: ["to_node_id", "edge_kind"],
  },
  {
    name: "idx_impact_change_status",
    table: "impact_results",
    columns: ["change_set_id", "status"],
  },
  {
    name: "idx_artifact_progress_color",
    table: "artifact_progress",
    columns: ["color", "state"],
  },
  {
    name: "idx_artifact_progress_tests",
    table: "artifact_progress",
    columns: ["passed_test_run_count", "dependency_checked"],
  },
  {
    name: "idx_artifact_progress_events_path",
    table: "artifact_progress_events",
    columns: ["artifact_path", "occurred_at"],
  },
  {
    name: "idx_feedback_source",
    table: "feedback_events",
    columns: ["source_table", "source_id"],
  },
  {
    name: "idx_tool_name_scope",
    table: "tool_runs",
    columns: ["tool_name", "input_scope"],
  },
  {
    name: "idx_runtime_verification_plan",
    table: "runtime_verification_events",
    columns: ["plan_id", "claim", "accept_status"],
  },
  {
    name: "idx_diagram_scope_format",
    table: "diagram_artifacts",
    columns: ["scope", "format"],
  },
  {
    name: "idx_mcp_profile_name",
    table: "mcp_server_profiles",
    columns: ["name"],
  },
  {
    name: "idx_mcp_triggers_signal",
    table: "mcp_profile_triggers",
    columns: ["signal", "workflow", "gate"],
  },
  {
    name: "idx_mcp_runs_profile_plan",
    table: "mcp_server_runs",
    columns: ["mcp_profile_id", "plan_id", "started_at"],
  },
  {
    name: "idx_verification_profile_type",
    table: "verification_profiles",
    columns: ["profile_type", "enabled"],
  },
  {
    name: "idx_verification_recommendations_change",
    table: "verification_recommendations",
    columns: ["change_set_id", "profile_kind", "accepted"],
  },
  {
    name: "idx_external_tool_findings_subject",
    table: "external_tool_findings",
    columns: ["subject_id", "status", "severity"],
  },
  {
    name: "idx_document_export_run_family",
    table: "document_export_runs",
    columns: ["source_doc_family", "plan_id"],
  },
  {
    name: "idx_document_export_run_snapshot",
    table: "document_export_runs",
    columns: ["source_snapshot_hash"],
  },
  {
    name: "idx_document_export_artifact_format",
    table: "document_export_artifacts",
    columns: ["format", "stale_status"],
  },
  {
    name: "idx_document_export_profile_family",
    table: "document_export_profiles",
    columns: ["source_doc_family", "format", "enabled"],
  },
  {
    name: "idx_document_export_triggers_signal",
    table: "document_export_triggers",
    columns: ["signal", "workflow", "gate"],
  },
  {
    name: "idx_roadmap_band_status",
    table: "roadmap_band_coverage",
    columns: ["status", "band_id"],
  },
  {
    name: "idx_roadmap_gate_plan",
    table: "roadmap_gate_progress",
    columns: ["plan_id", "reached"],
  },
  {
    name: "idx_review_evidence_plan",
    table: "review_evidence_registry",
    columns: ["plan_id", "has_evidence"],
  },
  {
    name: "idx_descent_obligation_trace_status",
    table: "descent_obligations",
    columns: ["trace_key", "status", "required_layer"],
  },
  {
    name: "idx_skill_evaluations_unused",
    table: "skill_evaluations",
    columns: ["unused_flag", "skill_rating"],
  },
  {
    name: "idx_poc_evaluations_rate",
    table: "poc_evaluations",
    columns: ["poc_success_rate", "evaluated_at"],
  },
  {
    name: "idx_model_evaluations_rate",
    table: "model_evaluations",
    columns: ["success_rate", "evaluated_at"],
  },
  { name: "idx_screens_category", table: "screens", columns: ["category", "screen_id"] },
  {
    name: "idx_screen_trace_screen",
    table: "screen_trace",
    columns: ["screen_id", "requirement_kind"],
  },
  {
    name: "idx_loop_iterations_plan",
    table: "loop_iterations",
    columns: ["plan_id", "iteration"],
  },
];
