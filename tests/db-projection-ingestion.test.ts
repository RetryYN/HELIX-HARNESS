import { describe, expect, it } from "vitest";
import {
  AUTOMATIC_DB_PROJECTION_REQUIREMENTS,
  analyzeDbProjectionIngestion,
  dbProjectionIngestionMessages,
  EVIDENCE_GATED_DB_PROJECTION_TABLES,
} from "../src/lint/db-projection-ingestion";
import { openHarnessDb } from "../src/state-db/index";
import { rebuildHarnessDb } from "../src/state-db/projection-writer";

describe("db projection ingestion detector", () => {
  it("passes when rebuildHarnessDb auto-populates catalog and graph projection tables", () => {
    const db = openHarnessDb(":memory:");
    try {
      const rebuilt = rebuildHarnessDb({ repoRoot: process.cwd(), db });
      const result = analyzeDbProjectionIngestion(rebuilt.rowCounts);

      expect(result.ok).toBe(true);
      expect(result.missingRows).toEqual([]);
      expect(result.rowCounts.graph_nodes).toBeGreaterThan(0);
      expect(result.rowCounts.trace_edges).toBeGreaterThan(0);
      expect(result.rowCounts.mcp_server_profiles).toBeGreaterThan(0);
      expect(result.rowCounts.document_export_profiles).toBeGreaterThan(0);
      expect(result.rowCounts.design_declarations).toBeGreaterThan(0);
      expect(result.rowCounts.design_references).toBeGreaterThan(0);
      expect(result.rowCounts.design_impact).toBeGreaterThan(0);
      expect(result.rowCounts.test_cases).toBeGreaterThan(0);
      expect(result.rowCounts.project_current_location).toBeGreaterThan(0);
      expect(result.rowCounts.project_drive_model_candidates).toBeGreaterThan(0);
      expect(result.rowCounts.project_roadmap_current_actions).toBeGreaterThan(0);
      expect(result.rowCounts.project_zip_adoption_decisions).toBe(11);
      expect(result.rowCounts.project_tailoring_decisions).toBe(8);
      expect(result.rowCounts.project_vmodel_regression_guards).toBe(8);
      expect(result.rowCounts.project_vmodel_fit_blockers).toBeGreaterThan(0);
      expect(result.rowCounts.project_vmodel_handoff_summary).toBe(1);
      expect(result.rowCounts.project_l12_layer_coverage).toBeGreaterThan(0);
      expect(result.rowCounts.design_coverage_gate).toBeGreaterThan(0);
      expect(result.rowCounts.project_operation_scopes).toBeGreaterThan(0);
      expect(result.rowCounts.project_artifact_remap).toBeGreaterThan(0);
      expect(result.rowCounts.vmodel_zip_manifest).toBeGreaterThan(0);
      expect(result.rowCounts.vmodel_zip_source_bindings).toBeGreaterThanOrEqual(8);
      expect(result.rowCounts.visualization_view_model).toBeGreaterThan(0);
      expect(result.rowCounts.visualization_tree_view).toBeGreaterThan(0);
      const l12Coverage = db
        .prepare(
          `SELECT zip_source_binding_ids, tailoring_rule_ids, tailoring_detail_levels
           FROM project_l12_layer_coverage
           WHERE layer = ?`,
        )
        .get("L12") as
        | {
            zip_source_binding_ids?: string;
            tailoring_rule_ids?: string;
            tailoring_detail_levels?: string;
          }
        | undefined;
      expect(l12Coverage?.zip_source_binding_ids).toContain("zip-source:profiles");
      expect(l12Coverage?.tailoring_rule_ids).toContain("HVM-TAILOR-OPERATION");
      expect(l12Coverage?.tailoring_detail_levels).toContain("標準");
      const l12Remap = db
        .prepare(
          `SELECT zip_source_binding_ids, tailoring_rule_ids
           FROM project_artifact_remap
           WHERE l12_layer = ? AND zip_source_binding_ids <> ''
           LIMIT 1`,
        )
        .get("L12") as
        | {
            zip_source_binding_ids?: string;
            tailoring_rule_ids?: string;
          }
        | undefined;
      expect(l12Remap?.zip_source_binding_ids).toContain("zip-source:l12-level-definition");
      expect(l12Remap?.tailoring_rule_ids).toContain("HVM-TAILOR-OPERATION");
      const reverseDriveCandidate = db
        .prepare(
          `SELECT doc_dependencies, implementation_dependencies
           FROM project_drive_model_candidates
           WHERE model = ?`,
        )
        .get("Reverse") as
        | {
            doc_dependencies?: string;
            implementation_dependencies?: string;
          }
        | undefined;
      const recoveryDriveCandidate = db
        .prepare(
          `SELECT doc_dependencies, implementation_dependencies
           FROM project_drive_model_candidates
           WHERE model = ?`,
        )
        .get("Recovery") as
        | {
            doc_dependencies?: string;
            implementation_dependencies?: string;
          }
        | undefined;
      for (const candidate of [reverseDriveCandidate, recoveryDriveCandidate]) {
        expect(candidate?.doc_dependencies).toContain("docs/design/**");
        expect(candidate?.doc_dependencies).toContain("docs/test-design/**");
        expect(candidate?.implementation_dependencies).toContain("design_declarations");
        expect(candidate?.implementation_dependencies).toContain("design_references");
      }
      const driveRouteAction = db
        .prepare(
          `SELECT category, status, automation_class, command, doc_dependencies, implementation_dependencies
           FROM project_roadmap_current_actions
           WHERE category = ?`,
        )
        .get("drive_route") as
        | {
            category?: string;
            status?: string;
            automation_class?: string;
            command?: string;
            doc_dependencies?: string;
            implementation_dependencies?: string;
          }
        | undefined;
      expect(driveRouteAction).toMatchObject({
        category: "drive_route",
        command: "helix current-location --json",
      });
      expect(driveRouteAction?.status).toMatch(/blocked|current/);
      expect(driveRouteAction?.automation_class).toMatch(/design|machine/);
      expect(driveRouteAction?.doc_dependencies).toContain("docs/design/**");
      expect(driveRouteAction?.doc_dependencies).toContain("docs/test-design/**");
      expect(driveRouteAction?.implementation_dependencies).toContain("design_declarations");
      expect(driveRouteAction?.implementation_dependencies).toContain("design_references");
      const zipAdoptionDecisions = db
        .prepare(
          `SELECT adoption_id, category, status, source_package, source_document, implementation_dependencies
           FROM project_zip_adoption_decisions
           ORDER BY adoption_id`,
        )
        .all() as Array<{
        adoption_id: string;
        category: string;
        status: string;
        source_package: string;
        source_document: string;
        implementation_dependencies: string;
      }>;
      expect(zipAdoptionDecisions).toHaveLength(11);
      expect(zipAdoptionDecisions.filter((row) => row.category === "adopt")).toHaveLength(5);
      expect(zipAdoptionDecisions.filter((row) => row.category === "complement")).toHaveLength(3);
      expect(zipAdoptionDecisions.filter((row) => row.category === "reject")).toHaveLength(3);
      expect(zipAdoptionDecisions.every((row) => row.status === "declared")).toBe(true);
      expect(
        zipAdoptionDecisions.every(
          (row) => row.source_package === "ハイブリッド設計ドキュメントv1-fixed.zip",
        ),
      ).toBe(true);
      expect(
        zipAdoptionDecisions.every(
          (row) =>
            row.source_document === "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
        ),
      ).toBe(true);
      expect(
        zipAdoptionDecisions.find((row) => row.adoption_id === "HVM-COMP-02")
          ?.implementation_dependencies,
      ).toContain("visualization_tree_view");
      expect(
        zipAdoptionDecisions.find((row) => row.adoption_id === "HVM-REJECT-01")
          ?.implementation_dependencies,
      ).toContain("vmodel_zip_manifest");
      const tailoringDecisions = db
        .prepare(
          `SELECT tailoring_id, category, detail_level, status, profile, source_document, implementation_dependencies
           FROM project_tailoring_decisions
           ORDER BY tailoring_id`,
        )
        .all() as Array<{
        tailoring_id: string;
        category: string;
        detail_level: string;
        status: string;
        profile: string;
        source_document: string;
        implementation_dependencies: string;
      }>;
      expect(tailoringDecisions).toHaveLength(8);
      expect(tailoringDecisions.filter((row) => row.category === "required")).toHaveLength(4);
      expect(tailoringDecisions.filter((row) => row.category === "optional")).toHaveLength(2);
      expect(tailoringDecisions.filter((row) => row.category === "na")).toHaveLength(2);
      expect(tailoringDecisions.every((row) => row.profile === "solo")).toBe(true);
      expect(
        tailoringDecisions.every(
          (row) =>
            row.source_document === "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
        ),
      ).toBe(true);
      expect(
        tailoringDecisions.find((row) => row.tailoring_id === "HVM-TAILOR-DETAIL-CONTRACT"),
      ).toMatchObject({
        category: "required",
        detail_level: "詳細",
        status: "declared",
      });
      expect(
        tailoringDecisions.find((row) => row.tailoring_id === "HVM-TAILOR-MOBILE-DESKTOP-NA"),
      ).toMatchObject({
        category: "na",
        detail_level: "省略",
        status: "excluded",
      });
      expect(
        tailoringDecisions.find((row) => row.tailoring_id === "HVM-TAILOR-DETAIL-CONTRACT")
          ?.implementation_dependencies,
      ).toContain("design_declarations");
      const vmodelRegressionGuards = db
        .prepare(
          `SELECT guard_id, status, command, protected_surface, guard_count
           FROM project_vmodel_regression_guards
           ORDER BY guard_id`,
        )
        .all() as Array<{
        guard_id: string;
        status: string;
        command: string;
        protected_surface: string;
        guard_count: number;
      }>;
      expect(vmodelRegressionGuards).toHaveLength(8);
      expect(
        vmodelRegressionGuards.find((row) => row.guard_id === "zip-source-integrity"),
      ).toMatchObject({
        command: "helix doctor",
      });
      expect(
        vmodelRegressionGuards.find((row) => row.guard_id === "implementation-binding")
          ?.protected_surface,
      ).toContain("function_design_absorption");
      expect(
        vmodelRegressionGuards.find((row) => row.guard_id === "current-location-reentry")
          ?.protected_surface,
      ).toContain("drive_model");
      expect(
        vmodelRegressionGuards.find((row) => row.guard_id === "scrum-operation"),
      ).toMatchObject({
        status: "pass",
        guard_count: 0,
      });
      const vmodelFitBlockers = db
        .prepare(
          `SELECT blocker_code, status, blocker_count, doc_dependencies, implementation_dependencies
           FROM project_vmodel_fit_blockers
           ORDER BY blocker_code`,
        )
        .all() as Array<{
        blocker_code: string;
        status: string;
        blocker_count: number;
        doc_dependencies: string;
        implementation_dependencies: string;
      }>;
      expect(vmodelFitBlockers.length).toBeGreaterThan(0);
      const currentLocationBlocker = vmodelFitBlockers.find(
        (row) => row.blocker_code === "current_location",
      );
      expect(currentLocationBlocker?.doc_dependencies).toContain("docs/design/**");
      expect(currentLocationBlocker?.implementation_dependencies).toContain("plan_registry");
      expect(currentLocationBlocker?.implementation_dependencies).toContain("trace_edges");
      const handoffSummary = db
        .prepare(
          `SELECT status, approval_pending, scope_mismatch, recovery_gate_status, effective_phase,
                  approval_state, approval_status, scope_status, valid_for_apply, reason_codes
           FROM project_vmodel_handoff_summary
           WHERE summary_id = ?`,
        )
        .get("recovery_handoff") as
        | {
            status: string;
            approval_pending: number;
            scope_mismatch: number;
            recovery_gate_status: string;
            effective_phase: string;
            approval_state: string;
            approval_status: string | null;
            scope_status: string | null;
            valid_for_apply: number;
            reason_codes: string;
          }
        | undefined;
      expect(handoffSummary).toBeDefined();
      expect(handoffSummary?.approval_state).toMatch(/^(missing|pending_human_review)$/);
      expect(handoffSummary?.approval_status).toBe(handoffSummary?.approval_state);
      expect(handoffSummary?.valid_for_apply).toBe(0);
      if (handoffSummary?.scope_status === "match") {
        expect(handoffSummary).toMatchObject({
          status: "approval_pending",
          approval_pending: 1,
          scope_mismatch: 0,
          recovery_gate_status: "approval_pending",
          effective_phase: "approval",
        });
      } else if (handoffSummary?.scope_status === "mismatch") {
        expect(handoffSummary).toMatchObject({
          status: "approval_blocked",
          scope_mismatch: 1,
          scope_status: "mismatch",
        });
        expect([0, 1]).toContain(handoffSummary?.approval_pending);
        expect(["refresh_approval_draft", "approval_pending"]).toContain(
          handoffSummary?.recovery_gate_status,
        );
        expect(["machine", "approval"]).toContain(handoffSummary?.effective_phase);
      } else {
        expect(handoffSummary).toMatchObject({
          status: "approval_pending",
          approval_pending: 0,
          scope_mismatch: 0,
          scope_status: "missing",
          recovery_gate_status: "approval_required",
          effective_phase: "approval",
        });
      }
      expect(handoffSummary?.reason_codes).toContain(
        handoffSummary?.approval_state === "missing"
          ? "approval.missing"
          : "approval.pending_human_review",
      );
      expect(handoffSummary?.reason_codes).toContain(
        `approval.scope.${handoffSummary?.scope_status}`,
      );
      expect(handoffSummary?.reason_codes).toContain(
        `handoff.phase.${handoffSummary?.effective_phase}`,
      );
      expect(handoffSummary?.reason_codes).toContain("action.vmodel-fit:current_location");
      expect(handoffSummary?.reason_codes).toContain(
        `automation.${handoffSummary?.effective_phase}`,
      );
      const operationScopes = db
        .prepare(
          `SELECT scope, status, observed_gap, design_ids, evidence_tables
           FROM project_operation_scopes
           ORDER BY scope`,
        )
        .all() as Array<{
        scope: string;
        status: string;
        observed_gap: number;
        design_ids: string;
        evidence_tables: string;
      }>;
      expect(operationScopes.map((row) => row.scope)).toEqual([
        "class_method_contract",
        "incident_recovery_route",
        "kpi_metric",
        "log_design",
        "operation_test",
        "runtime_verification",
      ]);
      expect(
        operationScopes.every((row) => row.evidence_tables.includes("design_declarations")),
      ).toBe(true);
      expect(
        operationScopes
          .filter((row) => row.status === "designed")
          .every((row) => row.observed_gap === 1),
      ).toBe(true);
      const incidentScope = operationScopes.find((row) => row.scope === "incident_recovery_route");
      expect(incidentScope?.design_ids).toContain("HOPS-VMFIT-INCIDENT-ROUTE-01");
      expect(incidentScope?.evidence_tables).toContain("closure_next_action_ledger");
      expect(incidentScope?.evidence_tables).toContain("runtime_verification_events");
      const typedSpecBinding = db
        .prepare(
          `SELECT status, source_present, l12_layers, evidence_tables
           FROM vmodel_zip_source_bindings
           WHERE binding_id = ?`,
        )
        .get("zip-source:typed-spec") as
        | {
            status?: string;
            source_present?: number;
            l12_layers?: string;
            evidence_tables?: string;
          }
        | undefined;
      expect(typedSpecBinding?.status).toBe("bound");
      expect(typedSpecBinding?.source_present).toBe(1);
      expect(typedSpecBinding?.l12_layers).toContain("L5");
      expect(typedSpecBinding?.evidence_tables).toContain("design_declarations");
      expect(typedSpecBinding?.evidence_tables).toContain("design_references");
      const scrumZipDeclarations = db
        .prepare(
          `SELECT defined_id, source_path, source
           FROM design_declarations
           WHERE source = ?
           ORDER BY defined_id`,
        )
        .all("zip_source_binding") as Array<{
        defined_id: string;
        source_path: string;
        source: string;
      }>;
      expect(scrumZipDeclarations).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            defined_id: "HSC-STORY-MAPPING-01",
            source_path: "docs/113_ユーザーストーリーマッピング.yaml",
          }),
          expect.objectContaining({
            defined_id: "HSC-DOR-DOD-01",
            source_path: "docs/117_DoR・DoD.yaml",
          }),
          expect.objectContaining({
            defined_id: "HSC-BURNDOWN-VELOCITY-01",
            source_path: "docs/121_バーンダウン・ベロシティ実績.yaml",
          }),
        ]),
      );
      expect(scrumZipDeclarations).toHaveLength(10);
      const fitBlockers = db
        .prepare("SELECT blocker_code FROM project_vmodel_fit_blockers ORDER BY blocker_code")
        .all() as Array<{ blocker_code: string }>;
      expect(fitBlockers.map((row) => row.blocker_code)).not.toContain("scrum_operation_gap");
      const scrumOperationGuard = db
        .prepare(
          "SELECT status, guard_count FROM project_vmodel_regression_guards WHERE guard_id = ?",
        )
        .get("scrum-operation") as { status?: string; guard_count?: number } | undefined;
      expect(scrumOperationGuard).toMatchObject({
        status: "pass",
        guard_count: 0,
      });
    } finally {
      db.close();
    }
  });

  it("fails closed when an automatic projection table is empty", () => {
    const result = analyzeDbProjectionIngestion({
      graph_nodes: 1,
      dependency_edges: 1,
      trace_edges: 1,
      graph_snapshots: 1,
      diagram_artifacts: 1,
      impact_rules: 1,
      verification_profiles: 1,
      mcp_server_profiles: 0,
      mcp_profile_triggers: 1,
      document_export_profiles: 1,
      document_export_triggers: 1,
      document_export_runs: 1,
      document_export_datasets: 1,
      design_declarations: 1,
      design_references: 1,
      design_impact: 1,
      test_cases: 1,
      test_artifact_edges: 1,
      artifact_progress: 1,
      project_current_location: 1,
      project_drive_model_candidates: 1,
      project_roadmap_current_actions: 1,
      project_zip_adoption_decisions: 1,
      project_tailoring_decisions: 1,
      project_vmodel_regression_guards: 1,
      project_vmodel_fit_blockers: 1,
      project_vmodel_handoff_summary: 1,
      project_l12_layer_coverage: 1,
      design_coverage_gate: 1,
      project_operation_scopes: 1,
      project_artifact_remap: 1,
      vmodel_zip_manifest: 1,
      vmodel_zip_source_bindings: 1,
      visualization_view_model: 1,
      visualization_tree_view: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.missingRows.map((row) => row.table)).toEqual(["mcp_server_profiles"]);
    expect(dbProjectionIngestionMessages(result).join("\n")).toContain(
      "empty automatic projection table mcp_server_profiles",
    );
  });

  it("treats trace_edges as automatic and telemetry-only tables as explicit evidence-gated zeros", () => {
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain("trace_edges");
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "design_declarations",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "design_impact",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "project_current_location",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "project_roadmap_current_actions",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "project_zip_adoption_decisions",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "project_tailoring_decisions",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "project_vmodel_regression_guards",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "project_vmodel_fit_blockers",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "project_vmodel_handoff_summary",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "visualization_tree_view",
    );
    expect(AUTOMATIC_DB_PROJECTION_REQUIREMENTS.map((item) => item.table)).toContain(
      "vmodel_zip_source_bindings",
    );
    expect(EVIDENCE_GATED_DB_PROJECTION_TABLES).toEqual(
      expect.arrayContaining(["model_evaluations", "retry_events"]),
    );
  });

  it("fails closed when trace_edges is not populated", () => {
    const result = analyzeDbProjectionIngestion({
      graph_nodes: 1,
      dependency_edges: 1,
      trace_edges: 0,
      graph_snapshots: 1,
      diagram_artifacts: 1,
      impact_rules: 1,
      verification_profiles: 1,
      mcp_server_profiles: 1,
      mcp_profile_triggers: 1,
      document_export_profiles: 1,
      document_export_triggers: 1,
      document_export_runs: 1,
      document_export_datasets: 1,
      design_declarations: 1,
      design_references: 1,
      design_impact: 1,
      test_cases: 1,
      test_artifact_edges: 1,
      artifact_progress: 1,
      project_current_location: 1,
      project_drive_model_candidates: 1,
      project_roadmap_current_actions: 1,
      project_zip_adoption_decisions: 1,
      project_tailoring_decisions: 1,
      project_vmodel_regression_guards: 1,
      project_vmodel_fit_blockers: 1,
      project_vmodel_handoff_summary: 1,
      project_l12_layer_coverage: 1,
      design_coverage_gate: 1,
      project_operation_scopes: 1,
      project_artifact_remap: 1,
      vmodel_zip_manifest: 1,
      vmodel_zip_source_bindings: 1,
      visualization_view_model: 1,
      visualization_tree_view: 1,
    });

    expect(result.ok).toBe(false);
    expect(result.missingRows.map((row) => row.table)).toEqual(["trace_edges"]);
  });
});
