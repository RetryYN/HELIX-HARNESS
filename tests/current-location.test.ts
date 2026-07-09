import { describe, expect, it } from "vitest";
import {
  buildProjectArtifactRemapBatchReport,
  buildProjectClosureApplyPlan,
  buildProjectClosureBatchReport,
  buildProjectClosureDecisionDraftPacket,
  buildProjectClosureEvidenceApprovalDraftPacket,
  buildProjectClosureEvidenceApplyPlan,
  buildProjectClosureEvidencePlan,
  buildProjectClosureEvidenceMaterializePacket,
  buildProjectClosureEvidencePatchPacket,
  buildProjectClosureEvidenceProbePacket,
  buildProjectClosureOverview,
  buildProjectClosureReviewBundle,
  buildProjectClosureTransitionPlan,
  buildProjectCurrentLocationSnapshot,
  buildProjectDriveModelReport,
  buildProjectRecoveryPlan,
  buildProjectRoadmapCurrentReport,
  mapCurrentLayerToL12,
} from "../src/state-db/current-location";
import { openHarnessDb, upsertRow } from "../src/state-db/index";
import { migrate } from "../src/state-db/migration";
import { buildVmodelFitReport } from "../src/vmodel/fit";

function withDb<T>(fn: (db: ReturnType<typeof openHarnessDb>) => T): T {
  const db = openHarnessDb(":memory:");
  try {
    migrate(db);
    return fn(db);
  } finally {
    db.close();
  }
}

describe("project current-location read model", () => {
  it("旧 L7 実装現在地を L12 canonical の単一 L6 layer へ正規化する", () => {
    expect(mapCurrentLayerToL12("L7")).toBe("L6");
    expect(mapCurrentLayerToL12("L14")).toBe("L12");
  });

  it("工程表とDB現在地を結び、逆流要因がなければForwardを推奨する", () =>
    withDb((db) => {
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L3-13-vmodel-docgen-fit",
          kind: "add-design",
          layer: "L3",
          drive: "agent",
          status: "draft",
          updated_at: "2026-07-08T00:00:00.000Z",
        },
      });
      upsertRow(db, {
        table: "roadmap_rollups",
        primaryKey: "rollup_id",
        row: {
          rollup_id: "program",
          total_bands: 5,
          covered_bands: 4,
          parked_bands: 1,
          uncovered_bands: 0,
          frontier: "",
          computed_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "design_declarations",
        primaryKey: "declaration_id",
        row: {
          declaration_id: "decl:HR-FR-VMFIT-04",
          defined_id: "HR-FR-VMFIT-04",
          declaration_kind: "機能要件",
          layer: "L3",
          source_path: "docs/design/helix/L3-requirements/vmodel-docgen-fit.md",
          source: "frontmatter",
          indexed_at: "2026-07-08T00:02:00.000Z",
        },
      });
      upsertRow(db, {
        table: "design_references",
        primaryKey: "reference_id",
        row: {
          reference_id: "ref:HAT-VMFIT-04:HR-FR-VMFIT-04",
          from_id: "HAT-VMFIT-04",
          to_id: "HR-FR-VMFIT-04",
          reference_kind: "accepts",
          status: "resolved",
          source_path: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
          source: "frontmatter",
          indexed_at: "2026-07-08T00:03:00.000Z",
        },
      });
      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.current).toMatchObject({
        layer: "L3",
        l12_layer: "L3",
        status: "forward",
        completion_boundary: "open",
        roadmap_frontier: [],
      });
      expect(snapshot.drive_recommendation).toMatchObject({
        model: "Reverse",
        reverseTargets: ["docs/design/**", "docs/test-design/**"],
      });
      expect(snapshot.drive_route).toMatchObject({
        routeId: "drive:Reverse:repair-design-test-implementation",
        status: "reverse_required",
        selectedModel: "Reverse",
        defaultModel: "Forward",
        mustReturnToDesign: true,
        forward: {
          allowed: false,
          roadmapStatus: "clear",
          frontier: [],
          currentBandIds: [],
          currentGateIds: [],
          coverageIds: [],
        },
        reverse: {
          required: true,
          targets: ["docs/design/**", "docs/test-design/**"],
          l12Layers: expect.arrayContaining([
            "L1",
            "L2",
            "L4",
            "L5",
            "L6",
            "L7",
            "L8",
            "L9",
            "L10",
            "L11",
            "L12",
          ]),
          coverageIds: expect.arrayContaining([
            "L1-planning-intent",
            "L2-requirements-screen",
            "L4-basic-design",
            "L5-detailed-contract",
            "L6-implementation-binding",
            "L7-tdd-closure",
            "L8-unit-test-design",
            "L9-integration-test-design",
            "L10-system-test-design",
            "L11-acceptance-test-design",
            "L12-operation-observability",
          ]),
          docDependencies: expect.arrayContaining(["docs/design/**", "docs/test-design/**"]),
          implementationDependencies: expect.arrayContaining([
            "design_declarations",
            "design_references",
          ]),
          queueActions: [],
          ledgerIds: [],
        },
      });
      expect(snapshot.design_coverage_gate).toMatchObject({
        status: "needs_design",
        covered: 1,
        missing: 11,
        reverify: 0,
      });
      expect(snapshot.design_coverage_gate.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            coverageId: "L3-requirements-freeze",
            status: "covered",
            returnRoute: "Forward",
          }),
          expect.objectContaining({
            coverageId: "L5-detailed-contract",
            status: "missing",
            returnRoute: "Reverse",
          }),
        ]),
      );
      expect(snapshot.roadmap_position).toMatchObject({
        status: "clear",
        rollup: {
          total_bands: 5,
          covered_bands: 4,
          parked_bands: 1,
          uncovered_bands: 0,
          total_gates: 0,
          reached_gates: 0,
          total_spans: 0,
          confirmed_spans: 0,
        },
        frontier: [],
        current_band_ids: [],
        current_gate_ids: [],
        bands: [],
        gates: [],
        implementationDependencies: [
          "roadmap_rollups",
          "roadmap_band_coverage",
          "roadmap_gate_progress",
        ],
      });
      expect(snapshot.closure).toMatchObject({
        status: "open",
        l7_open_plan_ids: [],
        terminal_l14_plan_ids: [],
        closure_evidence_ids: [],
        remediation: {
          done: 0,
          missing: 1,
          reverify: 0,
        },
        queue: {
          total: 0,
          items: [],
          route_counts: {
            close_ready: 0,
            collect_evidence: 0,
            repair_failed_evidence: 0,
            reverse_design: 0,
          },
        },
        packets: {
          total: 0,
          items: [],
        },
        next_action_ledger: {
          total: 0,
          entries: [],
          status_counts: {
            ready: 0,
            needs_evidence: 0,
            needs_repair: 0,
            needs_reverse: 0,
          },
          write_policy: "read-only",
          source_command: "helix current-location --json",
          view_command: "helix progress tree-view --json",
        },
      });
      expect(snapshot.counts.design_declarations).toBe(1);
      expect(snapshot.counts.design_references).toBe(1);
      expect(snapshot.zip_adoption).toMatchObject({
        status: "missing",
        adopted: 0,
        complemented: 0,
        rejected: 0,
        missing: 9,
        sourcePackage: "ハイブリッド設計ドキュメントv1-fixed.zip",
        sourceDocument: "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
      });
      expect(snapshot.tailoring_gate).toMatchObject({
        status: "needs_tailoring",
        profile: "solo",
        required: 0,
        optional: 0,
        excluded: 2,
        missing_required: 4,
        sourceDocument: "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
      });
      expect(snapshot.coverage.l12_layers).toHaveLength(12);
      expect(snapshot.coverage.l12_layers.find((layer) => layer.layer === "L3")).toMatchObject({
        status: "reverify",
        legacyLayers: ["L3"],
        planIds: ["PLAN-L3-13-vmodel-docgen-fit"],
        designIds: ["HR-FR-VMFIT-04"],
      });
      expect(snapshot.coverage.reverify).toBe(2);
      expect(snapshot.findings).toEqual([
        expect.objectContaining({
          code: "operation_scope_gap",
          severity: "warn",
        }),
        expect.objectContaining({
          code: "design_coverage_gap",
          severity: "warn",
        }),
        expect.objectContaining({
          code: "tailoring_required_gap",
          severity: "warn",
        }),
      ]);
      expect(snapshot.operation_scope).toMatchObject({
        designed: 0,
        observed: 0,
        observed_gap: 0,
        missing: 6,
        reverify: 0,
      });
      const fit = buildVmodelFitReport(snapshot);
      expect(fit.blockers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "function_design_absorption",
            status: "needs_absorption",
            count: 2,
            command: "helix current-location --json",
          }),
          expect.objectContaining({
            code: "operation_scope",
            status: "needs_operation_design",
            count: 6,
            command: "helix current-location --json",
          }),
        ]),
      );
      expect(fit.reasons).toContain("operation scope gaps missing=6 reverify=0");
      expect(snapshot.artifact_remap).toMatchObject({
        done: 1,
        missing: 10,
        reverify: 1,
      });
      expect(snapshot.artifact_remap.layers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            layer: "L3",
            status: "reverify",
            total: 2,
            done: 1,
            reverify: 1,
            artifactIds: expect.arrayContaining(["HR-FR-VMFIT-04", "PLAN-L3-13-vmodel-docgen-fit"]),
          }),
          expect.objectContaining({
            layer: "L1",
            status: "missing",
            total: 1,
            missing: 1,
            artifactIds: ["missing:L1"],
          }),
        ]),
      );
      expect(snapshot.artifact_remap.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            kind: "plan",
            artifactId: "PLAN-L3-13-vmodel-docgen-fit",
            legacyLayer: "L3",
            l12Layer: "L3",
            status: "reverify",
          }),
          expect.objectContaining({
            kind: "design",
            artifactId: "HR-FR-VMFIT-04",
            legacyLayer: "L3",
            l12Layer: "L3",
            status: "done",
          }),
          expect.objectContaining({
            kind: "gap",
            artifactId: "missing:L1",
            l12Layer: "L1",
            status: "missing",
          }),
        ]),
      );
    }));

  it("ハイブリッド版の Scrum 運営層を DB 現在地に投影する", () =>
    withDb((db) => {
      for (const row of [
        {
          declaration_id: "decl:US-03",
          defined_id: "US-03",
          declaration_kind: "ストーリー",
          title: "通知設定 Story",
          layer: "L3",
          source_path: "docs/112_プロダクトバックログ.yaml",
        },
        {
          declaration_id: "decl:AC-03-1",
          defined_id: "AC-03-1",
          declaration_kind: "受入基準",
          title: "通知設定 BDD",
          layer: "L11",
          source_path: "docs/29_受入基準・BDDシナリオ.yaml",
        },
        {
          declaration_id: "decl:MAP-01",
          defined_id: "MAP-01",
          declaration_kind: "ユーザーストーリーマッピング",
          title: "通知 Story Mapping",
          layer: "L3",
          source_path: "docs/113_ユーザーストーリーマッピング.yaml",
        },
        {
          declaration_id: "decl:VEL-01",
          defined_id: "VEL-01",
          declaration_kind: "見積り・ベロシティ",
          title: "通知 velocity design",
          layer: "L7",
          source_path: "docs/114_見積り・ベロシティ設計.yaml",
        },
        {
          declaration_id: "decl:REL-01",
          defined_id: "REL-01",
          declaration_kind: "リリースプラン",
          title: "通知 release plan",
          layer: "L12",
          source_path: "docs/115_リリースプラン.yaml",
        },
        {
          declaration_id: "decl:SP-2",
          defined_id: "SP-2",
          declaration_kind: "スプリント計画",
          title: "通知スプリント",
          layer: "L7",
          source_path: "docs/116_スプリント計画.yaml",
        },
        {
          declaration_id: "decl:DOD-01",
          defined_id: "DOD-01",
          declaration_kind: "DoR/DoD",
          title: "Definition of Done",
          layer: "L11",
          source_path: "docs/117_DoR・DoD.yaml",
        },
        {
          declaration_id: "decl:DAILY-01",
          defined_id: "DAILY-01",
          declaration_kind: "デイリースクラム",
          title: "daily blocker record",
          layer: "L12",
          source_path: "docs/118_デイリースクラム・進行記録.yaml",
        },
        {
          declaration_id: "decl:INC-01",
          defined_id: "INC-01",
          declaration_kind: "スプリントレビュー",
          title: "increment feedback",
          layer: "L12",
          source_path: "docs/119_スプリントレビュー記録.yaml",
        },
        {
          declaration_id: "decl:RETRO-01",
          defined_id: "RETRO-01",
          declaration_kind: "レトロスペクティブ",
          title: "KPT improvement action",
          layer: "L12",
          source_path: "docs/120_レトロスペクティブ記録.yaml",
        },
        {
          declaration_id: "decl:BURNDOWN-01",
          defined_id: "BURNDOWN-01",
          declaration_kind: "バーンダウン・ベロシティ",
          title: "burndown velocity actual",
          layer: "L12",
          source_path: "docs/121_バーンダウン・ベロシティ実績.yaml",
        },
      ]) {
        upsertRow(db, {
          table: "design_declarations",
          primaryKey: "declaration_id",
          row: {
            ...row,
            owner: "TL",
            status: "draft",
            source: "frontmatter",
            indexed_at: "2026-07-08T00:04:00.000Z",
          },
        });
      }
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-DISCOVERY-99-hybrid-sprint",
          kind: "poc",
          layer: "cross",
          drive: "agent",
          status: "confirmed",
          updated_at: "2026-07-08T00:05:00.000Z",
        },
      });
      upsertRow(db, {
        table: "automation_assets",
        primaryKey: "asset_id",
        row: {
          asset_id: "skill:planning-and-task-breakdown",
          asset_type: "skill",
          path: "docs/skills/planning-and-task-breakdown.md",
          trigger: "Scrum sprint planning and task breakdown",
          role: "",
          capability: "scrum sprint backlog planning task breakdown",
          skill_type: "orchestration",
          applies_layers: "L3,L7",
          applies_drive_models: "Forward,Scrum,Discovery",
          drift_status: "ok",
          indexed_at: "2026-07-08T00:06:00.000Z",
        },
      });
      upsertRow(db, {
        table: "automation_assets",
        primaryKey: "asset_id",
        row: {
          asset_id: "skill:harness-observability",
          asset_type: "skill",
          path: "docs/skills/harness-observability.md",
          trigger: "runtime verification and harness db observability",
          role: "",
          capability: "runtime verification harness db observability",
          skill_type: "verification",
          applies_layers: "L12",
          applies_drive_models: "Recovery,Forward",
          drift_status: "ok",
          indexed_at: "2026-07-08T00:06:00.000Z",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);
      expect(snapshot.scrum_operation).toBeDefined();
      const scrumOperation = snapshot.scrum_operation!;

      expect(scrumOperation).toMatchObject({
        status: "active",
        sourcePackage: "ハイブリッド設計ドキュメントv1-fixed.zip",
        backlogItems: 1,
        sprintItems: 1,
        acceptanceItems: 1,
        planningItems: 3,
        ceremonyItems: 4,
        metricItems: 1,
        activeSprintPlans: 1,
      });
      expect(scrumOperation.sourceBindings).toEqual(
        expect.arrayContaining([
          "zip-source:scrum-product-backlog",
          "zip-source:scrum-story-mapping",
          "zip-source:scrum-estimation-velocity",
          "zip-source:scrum-release-plan",
          "zip-source:scrum-sprint-plan",
          "zip-source:scrum-dor-dod",
          "zip-source:scrum-daily-record",
          "zip-source:scrum-sprint-review",
          "zip-source:scrum-retrospective",
          "zip-source:scrum-burndown-velocity",
          "zip-source:scrum-acceptance",
        ]),
      );
      expect(scrumOperation.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            operationId: "scrum:product-backlog",
            category: "backlog",
            status: "observed",
            declarationIds: ["US-03"],
          }),
          expect.objectContaining({
            operationId: "scrum:dor-dod",
            category: "readiness",
            status: "observed",
          }),
          expect.objectContaining({
            operationId: "scrum:retrospective",
            category: "retro",
            status: "observed",
          }),
          expect.objectContaining({
            operationId: "scrum:burndown-velocity",
            category: "metric",
            status: "observed",
          }),
          expect.objectContaining({
            operationId: "scrum:active-plan",
            category: "plan",
            status: "observed",
            planIds: ["PLAN-DISCOVERY-99-hybrid-sprint"],
          }),
        ]),
      );
      expect(snapshot.skill_binding).toBeDefined();
      expect(snapshot.skill_binding).toMatchObject({
        status: "ready",
        sourcePackage: "ハイブリッド設計ドキュメントv1-fixed.zip",
      });
      expect(snapshot.skill_binding?.workflowModes).toContain("Scrum");
      expect(snapshot.skill_binding?.items[0]).toMatchObject({
        skillId: "skill:planning-and-task-breakdown",
        tier: "required",
        injectAt: "before_work",
        matchedDriveModels: expect.arrayContaining(["Scrum"]),
        matchedLayers: expect.arrayContaining(["L3", "L7"]),
      });
      expect(
        snapshot.operation_scope.items.find((item) => item.scope === "log_design")?.designIds,
      ).not.toContain("US-03");
    }));

  it("typed design declaration drift を current-location の Reverse 要因にする", () =>
    withDb((db) => {
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L3-13-vmodel-docgen-fit",
          kind: "add-design",
          layer: "L3",
          drive: "agent",
          status: "draft",
          updated_at: "2026-07-08T00:00:00.000Z",
        },
      });
      upsertRow(db, {
        table: "findings",
        primaryKey: "finding_id",
        row: {
          finding_id: "finding:design-declaration-declaration_only",
          kind: "design-declaration-declaration_only",
          severity: "error",
          subject_id: "docs/design/helix/L3-requirements/vmodel-docgen-fit.md:HR-FR-VMFIT-01",
          source: "design-declaration-projection",
          status: "open",
          evidence_path: "docs/design/helix/L3-requirements/vmodel-docgen-fit.md",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.counts.design_declaration_drifts).toBe(1);
      expect(snapshot.findings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            code: "design_declaration_drift",
            severity: "error",
            docDependencies: ["docs/design/helix/L3-requirements/vmodel-docgen-fit.md"],
            implementationDependencies: ["findings", "design_declarations", "design_references"],
          }),
        ]),
      );
      expect(snapshot.current.status).toBe("needs_reverse");
      expect(snapshot.drive_recommendation.model).toBe("Reverse");
    }));

  it("L14到達済みclaimとL7起票をRecoveryに昇格し、設計戻し範囲を保持する", () =>
    withDb((db) => {
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L14-01-close",
          kind: "impl",
          layer: "L14",
          drive: "agent",
          status: "confirmed",
          updated_at: "2026-07-08T00:00:00.000Z",
        },
      });
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L7-999-new-impl",
          kind: "add-impl",
          layer: "L7",
          drive: "agent",
          status: "draft",
          updated_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "artifact_registry",
        primaryKey: "artifact_id",
        row: {
          artifact_id: "artifact:PLAN-L7-999-new-impl",
          artifact_type: "markdown_doc",
          path: "docs/plans/PLAN-L7-999-new-impl.md",
          pair_artifact: "",
          status: "current",
          updated_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "test_runs",
        primaryKey: "test_run_id",
        row: {
          test_run_id: "tr:PLAN-L7-999-new-impl",
          session_id: "session",
          plan_id: "PLAN-L7-999-new-impl",
          command: "bun test",
          runner: "bun",
          runtime: "test",
          os: "linux",
          shell: "bash",
          scope: "unit",
          started_at: "2026-07-08T00:01:10.000Z",
          completed_at: "2026-07-08T00:01:20.000Z",
          exit_code: 0,
          evidence_path: "docs/evidence/PLAN-L7-999-new-impl-test.json",
          output_digest: "sha256:test",
          green_definition_id: "green",
          status: "passed",
        },
      });
      upsertRow(db, {
        table: "gate_runs",
        primaryKey: "gate_run_id",
        row: {
          gate_run_id: "gate:PLAN-L7-999-new-impl",
          gate_id: "closure",
          plan_id: "PLAN-L7-999-new-impl",
          status: "passed",
          checked_at: "2026-07-08T00:01:30.000Z",
          evidence_path: "docs/evidence/PLAN-L7-999-new-impl-gate.json",
        },
      });
      upsertRow(db, {
        table: "runtime_verification_events",
        primaryKey: "event_id",
        row: {
          event_id: "rv:PLAN-L7-999-new-impl",
          plan_id: "PLAN-L7-999-new-impl",
          requirement_id: "HR-FR-VMFIT-05",
          test_oracle_id: "HAT-VMFIT-05",
          claim: "runtime closure checked",
          session_id: "session",
          source: "test",
          runtime_surface: "cli",
          correlation_id: "corr",
          evidence_path: "docs/evidence/PLAN-L7-999-new-impl-runtime.json",
          occurred_at: "2026-07-08T00:01:40.000Z",
          redaction_policy: "none",
          verification_class: "runtime_verified",
          accept_status: "accepted",
        },
      });
      upsertRow(db, {
        table: "roadmap_rollups",
        primaryKey: "rollup_id",
        row: {
          rollup_id: "program",
          total_bands: 5,
          covered_bands: 4,
          parked_bands: 0,
          uncovered_bands: 1,
          frontier: "impl,verification",
          computed_at: "2026-07-08T00:02:00.000Z",
        },
      });
      upsertRow(db, {
        table: "roadmap_band_coverage",
        primaryKey: "band_id",
        row: {
          band_id: "impl",
          name: "実装+谷 (L7)",
          status: "uncovered",
          roadmap_ids: "",
          computed_at: "2026-07-08T00:02:00.000Z",
        },
      });
      upsertRow(db, {
        table: "roadmap_band_coverage",
        primaryKey: "band_id",
        row: {
          band_id: "verification",
          name: "検証 (結合〜運用 L8-L14)",
          status: "covered",
          roadmap_ids: "PLAN-L14-01-close",
          computed_at: "2026-07-08T00:02:00.000Z",
        },
      });
      upsertRow(db, {
        table: "roadmap_gate_progress",
        primaryKey: "roadmap_gate_id",
        row: {
          roadmap_gate_id: "gate:PLAN-L14-01-close:G-OPS",
          plan_id: "PLAN-L14-01-close",
          gate_id: "G-OPS",
          total_spans: 2,
          confirmed_spans: 1,
          reached: 0,
          computed_at: "2026-07-08T00:02:00.000Z",
        },
      });
      upsertRow(db, {
        table: "design_references",
        primaryKey: "reference_id",
        row: {
          reference_id: "ref:missing",
          from_id: "HAT-VMFIT-05",
          to_id: "HR-FR-VMFIT-05",
          reference_kind: "accepts",
          status: "unresolved",
          source_path: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
          source: "frontmatter",
          indexed_at: "2026-07-08T00:03:00.000Z",
        },
      });
      upsertRow(db, {
        table: "design_declarations",
        primaryKey: "declaration_id",
        row: {
          declaration_id: "decl:HAT-VMFIT-L7-CLOSURE",
          defined_id: "HAT-VMFIT-L7-CLOSURE",
          declaration_kind: "TDD closure oracle",
          title: "L7 TDD closure / trace closure",
          layer: "L7",
          source_path: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
          source: "frontmatter",
          indexed_at: "2026-07-08T00:05:00.000Z",
        },
      });
      upsertRow(db, {
        table: "descent_obligations",
        primaryKey: "descent_obligation_id",
        row: {
          descent_obligation_id: "obl:impl-ahead",
          trace_key: "HR-FR-VMFIT-05",
          from_layer: "L7",
          required_layer: "L5",
          kind: "impl-guard",
          status: "impl-ahead",
          reason: "implementation is ahead of detailed design",
          defer_owner: "TL",
          defer_spec: "docs/design/helix/L5-detailed-design/",
          source: "test",
          indexed_at: "2026-07-08T00:04:00.000Z",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.current).toMatchObject({
        layer: "L14",
        l12_layer: "L12",
        status: "needs_recovery",
        completion_boundary: "contradicted",
        roadmap_frontier: ["impl", "verification"],
      });
      const roadmapCurrent = buildProjectRoadmapCurrentReport(snapshot);
      expect(roadmapCurrent).toMatchObject({
        schema_version: "project-roadmap-current.v1",
        status: "contradicted",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        consistency: {
          aligned: true,
          db_current_l12_layer: "L12",
          roadmap_current_l12_layers: expect.arrayContaining(["L6", "L7", "L12"]),
          roadmap_projected_l12_layers: expect.arrayContaining(["L6", "L7", "L12"]),
          roadmap_terminal_l12_layers: [],
          alignment_basis: "frontier",
          blocking_findings: expect.arrayContaining(["l14_claim_with_l7_work"]),
        },
        counts: expect.objectContaining({
          current_bands: 2,
          current_gates: 1,
        }),
        postcheck_commands: [
          "helix db rebuild",
          "helix roadmap current --json",
          "helix current-location --json",
          "helix vmodel fit",
        ],
        write_policy: "read-only",
        source_command: "helix roadmap current --json",
      });
      expect(roadmapCurrent.actions.map((action) => action.action_id)).toEqual(
        expect.arrayContaining([
          "drive:Recovery:recover-current-location",
          "closure-queue",
          "roadmap-band:impl",
          "roadmap-gate:PLAN-L14-01-close:G-OPS",
          "finding:l14_claim_with_l7_work",
        ]),
      );
      expect(roadmapCurrent.counts.blockers).toBeGreaterThanOrEqual(3);
      const fit = buildVmodelFitReport(snapshot);
      expect(fit.roadmap_current_gate).toMatchObject({
        status: "contradicted",
        roadmap_status: "contradicted",
        aligned: true,
        recovery_correlation: "current_location_recovery",
        alignment_basis: "frontier",
        db_current_l12_layer: "L12",
        blocker_count: expect.any(Number),
        required_action:
          "工程表と DB は同じ L12 現在地を指している。blocking finding を Recovery/closure route で解消する",
      });
      expect(fit.blockers.map((blocker) => blocker.code)).not.toContain("roadmap_current");
      expect(fit.blockers.map((blocker) => blocker.code)).toContain("current_location");
      const driveModel = buildProjectDriveModelReport(snapshot);
      expect(driveModel).toMatchObject({
        schema_version: "project-drive-model.v1",
        selected_model: "Recovery",
        default_model: "Forward",
        selection_status: "recovery_required",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        selected_candidate: {
          model: "Recovery",
          status: "selected",
          route_id: "drive:Recovery:recover-current-location",
          command: "helix closure evidence-plan --summary-json",
          coverage_ids: expect.arrayContaining([
            "L12-operation-observability",
            "L5-detailed-contract",
            "L6-implementation-binding",
            "L7-tdd-closure",
          ]),
        },
        blocked_models: expect.arrayContaining(["Reverse", "Forward"]),
        available_models: expect.arrayContaining(["Recovery"]),
        write_policy: "read-only",
        source_command: "helix drive model --json",
      });
      expect(driveModel.candidates.map((candidate) => candidate.model)).toEqual([
        "Recovery",
        "Reverse",
        "OperationVerification",
        "Forward",
        "Additive",
        "Refactor",
      ]);
      for (const model of ["Recovery", "Reverse"]) {
        const candidate = driveModel.candidates.find((item) => item.model === model);
        expect(candidate?.doc_dependencies).toEqual(
          expect.arrayContaining(["docs/design/**", "docs/test-design/**"]),
        );
        expect(candidate?.implementation_dependencies).toEqual(
          expect.arrayContaining(["design_declarations", "design_references"]),
        );
      }
      expect(
        driveModel.candidates.find((candidate) => candidate.model === "OperationVerification"),
      ).toMatchObject({
        route_id: "drive:OperationVerification:verify-runtime-scope",
        coverage_ids: ["L12-operation-observability"],
        doc_dependencies: ["docs/design/**", "docs/test-design/**"],
        implementation_dependencies: expect.arrayContaining([
          "design_declarations",
          "runtime_verification_events",
          "closure_next_action_ledger",
        ]),
      });
      const recoveryPlan = buildProjectRecoveryPlan(snapshot, { limit: 1 });
      expect(recoveryPlan).toMatchObject({
        schema_version: "project-recovery-plan.v1",
        status: "active",
        selected_closure_action: "close_ready",
        current: {
          layer: "L14",
          l12_layer: "L12",
          status: "needs_recovery",
        },
        drive_model: {
          selected_model: "Recovery",
        },
        closure_evidence_plan: expect.objectContaining({
          schema_version: "project-closure-evidence-plan.v1",
          selected_action: "close_ready",
          total: 1,
          listed: 1,
        }),
        exit_forecast: {
          status: "blocked",
          remaining_queue_items: 1,
          blocking_lanes: ["close_ready"],
          blockers: ["completion_boundary=contradicted", "close_ready:1:human"],
          next_command: "helix closure review-bundle --action close_ready --summary-json",
          expected_transition:
            "blocking lanes を 0 件へ減らし、current-location を再計算する",
          lanes: [
            {
              action: "close_ready",
              count: 1,
              blocking: true,
              human_required: true,
              command: "helix closure review-bundle --action close_ready --summary-json",
              required_action:
                "ready queue を closure claim に昇格できるか確認し、L14 claim との整合を閉じる",
            },
          ],
        },
        action_lanes: [
          expect.objectContaining({
            action: "close_ready",
            count: 1,
            selected: true,
            lane_type: "approval",
            status: "blocked",
            human_required: true,
            primary_command: "helix closure review-bundle --action close_ready --summary-json",
            evidence_plan_command: "helix closure evidence-plan --action close_ready --summary-json",
            target_tables: [],
            sample_plan_ids: ["PLAN-L7-999-new-impl"],
          }),
          expect.objectContaining({
            action: "collect_evidence",
            count: 0,
            selected: false,
            status: "not_required",
          }),
          expect.objectContaining({
            action: "repair_failed_evidence",
            count: 0,
            selected: false,
            status: "not_required",
          }),
          expect.objectContaining({
            action: "reverse_design",
            count: 0,
            selected: false,
            status: "not_required",
          }),
        ],
        automation_boundaries: [
          expect.objectContaining({
            action: "close_ready",
            automation_class: "approval_required",
            count: 1,
            selected: true,
            mutation_allowed: false,
            approval_required: true,
            dry_run_command:
              "helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit 1 --json",
            execute_command:
              "helix closure apply --execute --approval-record <approved-approval-record-path> --limit 1 --json",
            required_record: "approval_scope_digest",
          }),
          expect.objectContaining({
            action: "collect_evidence",
            automation_class: "not_required",
            mutation_allowed: false,
            approval_required: false,
          }),
          expect.objectContaining({
            action: "repair_failed_evidence",
            automation_class: "not_required",
          }),
          expect.objectContaining({
            action: "reverse_design",
            automation_class: "not_required",
          }),
        ],
        automation_runway: {
          status: "approval_required",
          machine_actionable_count: 0,
          human_approval_count: 1,
          design_reverse_count: 0,
          remaining_after_machine_lanes: 1,
          next_machine_action: null,
          next_machine_command: null,
          approval_actions: ["close_ready"],
          phases: [
            {
              sequence: 1,
              action: "close_ready",
              phase_type: "approval",
              count: 1,
              selected: true,
              status: "blocked",
              human_required: true,
              command: "helix closure review-bundle --action close_ready --summary-json",
              target_tables: [],
              postcheck_commands: [
                "helix db rebuild",
                "helix closure batch --action close_ready --json",
                "helix current-location --json",
                "helix vmodel fit",
              ],
              remaining_after_phase: 0,
              next_gate: "recompute_drive_model",
              expected_transition:
                "closure claim 候補として人間レビュー後に open L7 queue から除外される",
            },
          ],
          target_tables: [],
          postcheck_commands: [],
          expected_transition:
            "approval bundle を確認し、承認済み close_ready だけを closure apply へ進める",
          reasons: [
            "machine_actionable=0",
            "human_approval=1",
            "design_reverse=0",
            "remaining_after_machine=1",
            "next_machine_action=-",
          ],
        },
        reentry_forecast: {
          status: "approval_gate_pending",
          current_blocking_count: 1,
          blocking_after_machine_lanes: 1,
          required_phase_count: 1,
          next_phase_action: "close_ready",
          next_phase_type: "approval",
          next_gate: "recompute_drive_model",
          next_command: "helix closure review-bundle --action close_ready --summary-json",
          recompute_commands: [
            "helix current-location --json",
            "helix drive model --json",
            "helix roadmap current --json",
            "helix vmodel fit",
          ],
        },
        steps: [
          expect.objectContaining({
            step_id: "detect-current-location",
            status: "ready",
            command: "helix current-location --json",
          }),
          expect.objectContaining({
            step_id: "plan-closure-evidence",
            status: "ready",
            command: "helix closure evidence-plan --action close_ready --summary-json",
          }),
          expect.objectContaining({
            step_id: "review-or-repair-closure",
            status: "blocked",
            command: "helix closure review-bundle --action close_ready --summary-json",
          }),
          expect.objectContaining({
            step_id: "recompute-drive-model",
            status: "pending",
          }),
          expect.objectContaining({
            step_id: "verify-vmodel-fit",
            status: "pending",
          }),
        ],
        write_policy: "read-only",
        source_command: "helix recovery plan --json",
      });
      expect(snapshot.closure).toMatchObject({
        status: "contradicted",
        l7_open_plan_ids: ["PLAN-L7-999-new-impl"],
        terminal_l14_plan_ids: ["PLAN-L14-01-close"],
        closure_evidence_ids: ["HAT-VMFIT-L7-CLOSURE"],
        remediation: {
          done: 1,
          missing: 0,
          reverify: 2,
        },
        queue: {
          total: 1,
          route_counts: {
            close_ready: 1,
            collect_evidence: 0,
            repair_failed_evidence: 0,
            reverse_design: 0,
          },
          items: [
            expect.objectContaining({
              planId: "PLAN-L7-999-new-impl",
              kind: "add-impl",
              status: "draft",
              sourcePath: "docs/plans/PLAN-L7-999-new-impl.md",
              l12Layer: "L6",
              priority: 30,
              driveModel: "Reverse",
              remediationStatus: "reverify",
              nextAction: "close_ready",
              evidence: expect.objectContaining({
                status: "ready",
                artifactPaths: ["docs/plans/PLAN-L7-999-new-impl.md"],
                traceEdges: 0,
                testRuns: {
                  total: 1,
                  passed: 1,
                  failed: 0,
                },
                gateRuns: {
                  total: 1,
                  passed: 1,
                  failed: 0,
                },
                runtimeVerification: {
                  total: 1,
                  accepted: 1,
                },
                evidencePaths: [
                  "docs/evidence/PLAN-L7-999-new-impl-gate.json",
                  "docs/evidence/PLAN-L7-999-new-impl-runtime.json",
                  "docs/evidence/PLAN-L7-999-new-impl-test.json",
                ],
              }),
            }),
          ],
        },
        packets: {
          total: 1,
          items: [
            expect.objectContaining({
              packetId: "closure:close_ready",
              nextAction: "close_ready",
              count: 1,
              planIds: ["PLAN-L7-999-new-impl"],
            }),
          ],
        },
        next_action_ledger: {
          total: 1,
          status_counts: {
            ready: 1,
            needs_evidence: 0,
            needs_repair: 0,
            needs_reverse: 0,
          },
          write_policy: "read-only",
          source_command: "helix current-location --json",
          view_command: "helix progress tree-view --json",
          entries: [
            expect.objectContaining({
              ledgerId: "next-action:closure:close_ready",
              packetId: "closure:close_ready",
              nextAction: "close_ready",
              status: "ready",
              driveModel: "Reverse",
              l12Layer: "L6",
              count: 1,
              primaryCommand: "helix current-location --json",
              reviewSurface: "helix progress tree-view --json",
              writePolicy: "read-only",
              planIds: ["PLAN-L7-999-new-impl"],
              samplePlanIds: ["PLAN-L7-999-new-impl"],
              humanRequired: true,
            }),
          ],
        },
      });
      expect(snapshot.closure.remediation.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            category: "l7_open_plan",
            status: "reverify",
            l12Layer: "L6",
            count: 1,
            subjectIds: ["PLAN-L7-999-new-impl"],
          }),
          expect.objectContaining({
            category: "l14_claim",
            status: "reverify",
            l12Layer: "L12",
            count: 1,
            subjectIds: ["PLAN-L14-01-close"],
          }),
          expect.objectContaining({
            category: "closure_evidence",
            status: "done",
            l12Layer: "L7",
            count: 1,
            subjectIds: ["HAT-VMFIT-L7-CLOSURE"],
          }),
        ]),
      );
      const overview = buildProjectClosureOverview(snapshot, { limit: 1 });
      expect(overview).toMatchObject({
        schema_version: "project-closure-overview.v1",
        closure: {
          status: "contradicted",
          open_l7: 1,
          l14_claims: 1,
          closure_evidence: 1,
          queue_total: 1,
          route_counts: {
            close_ready: 1,
            collect_evidence: 0,
            repair_failed_evidence: 0,
            reverse_design: 0,
          },
          ledger_status_counts: {
            ready: 1,
            needs_evidence: 0,
            needs_repair: 0,
            needs_reverse: 0,
          },
        },
        recommended_next_action: {
          action: "close_ready",
          command: "helix closure review-bundle --action close_ready --summary-json",
          human_required: true,
        },
        write_policy: "read-only",
        source_command: "helix closure overview --summary-json",
      });
      expect(overview.actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            action: "close_ready",
            count: 1,
            listed: 1,
            omitted: 0,
            batch_id: "closure-batch:1:close_ready",
            ledger_status: "ready",
            human_required: true,
            sample_plan_ids: ["PLAN-L7-999-new-impl"],
          }),
          expect.objectContaining({
            action: "collect_evidence",
            count: 0,
          }),
        ]),
      );
      const batch = buildProjectClosureBatchReport(snapshot, {
        action: "close_ready",
        limit: 1,
      });
      expect(batch).toMatchObject({
        schema_version: "project-closure-batch.v1",
        selected_action: "close_ready",
        available_actions: ["close_ready"],
        total: 1,
        listed: 1,
        omitted: 0,
        limit: 1,
        write_policy: "read-only",
        source_command: "helix closure batch --json",
        packet: expect.objectContaining({
          packetId: "closure:close_ready",
          automation: expect.objectContaining({
            batchId: "closure-batch:1:close_ready",
            reviewCommand: "helix closure batch --action close_ready --json",
          }),
        }),
        ledger: expect.objectContaining({
          ledgerId: "next-action:closure:close_ready",
          humanRequired: true,
        }),
        queue_items: [
          expect.objectContaining({
            planId: "PLAN-L7-999-new-impl",
            nextAction: "close_ready",
            evidenceGaps: [],
            evidenceAction:
              "evidence は closure review 可能。approval_scope_digest 付き review-bundle へ進める",
          }),
        ],
      });
      const evidencePlan = buildProjectClosureEvidencePlan(snapshot, {
        action: "close_ready",
        limit: 1,
      });
      expect(evidencePlan).toMatchObject({
        schema_version: "project-closure-evidence-plan.v1",
        selected_action: "close_ready",
        total: 1,
        listed: 1,
        omitted: 0,
        target_tables: [],
        evidence_gap_counts: [],
        expected_transition:
          "closure claim 候補として人間レビュー後に open L7 queue から除外される",
        postcheck_commands: [
          "helix db rebuild",
          "helix closure batch --action close_ready --json",
          "helix current-location --json",
          "helix vmodel fit",
        ],
        items: [
          expect.objectContaining({
            plan_id: "PLAN-L7-999-new-impl",
            next_action: "close_ready",
            evidence_status: "ready",
            target_tables: [],
            evidence_action:
              "evidence は closure review 可能。approval_scope_digest 付き review-bundle へ進める",
          }),
        ],
      });
      const bundle = buildProjectClosureReviewBundle(snapshot, {
        action: "close_ready",
        limit: 1,
      });
      expect(bundle).toMatchObject({
        schema_version: "project-closure-review-bundle.v1",
        action: "close_ready",
        approval_required: true,
        total: 1,
        listed: 1,
        omitted: 0,
        limit: 1,
        offset: 0,
        window: {
          start: 1,
          end: 1,
          page_index: 1,
          page_count: 1,
          has_previous: false,
          has_next: false,
          previous_offset: null,
          next_offset: null,
        },
        write_policy: "read-only",
        source_command: "helix closure review-bundle --json",
        decision: {
          decision_id: "closure-review:close_ready",
          allowed_outcomes: [
            "approve_closure_claim",
            "reject_to_collect_evidence",
            "reject_to_repair_failed_evidence",
            "reject_to_reverse_design",
          ],
          outcome_routes: expect.arrayContaining([
            expect.objectContaining({
              outcome: "approve_closure_claim",
              projection_type: "apply_closure",
              target_action: "accepted",
              drive_model: "Recovery",
            }),
            expect.objectContaining({
              outcome: "reject_to_reverse_design",
              projection_type: "reroute_closure_lane",
              target_action: "reverse_design",
              drive_model: "Reverse",
              command: "helix closure evidence-plan --action reverse_design --summary-json",
            }),
          ]),
          blocked_by_findings: ["unresolved_design_reference", "impl_ahead_descent_obligation"],
          approval_record_template: expect.arrayContaining([
            expect.stringMatching(/^approval_scope_digest: sha256:/),
          ]),
        },
        review_scope: {
          plan_ids: ["PLAN-L7-999-new-impl"],
          source_paths: ["docs/plans/PLAN-L7-999-new-impl.md"],
          coverage_ids: ["L6-implementation-binding"],
          l12_layers: ["L6"],
          evidence_totals: expect.objectContaining({
            artifact_paths: 1,
            evidence_paths: 3,
            test_runs_total: 1,
            test_runs_passed: 1,
          }),
          approval_scope_digest: expect.stringMatching(/^sha256:/),
        },
        candidates: [
          expect.objectContaining({
            planId: "PLAN-L7-999-new-impl",
            nextAction: "close_ready",
            coverageId: "L6-implementation-binding",
            coverageLabel: "実装契約/implementation binding",
          }),
        ],
      });
      const decisionDraft = buildProjectClosureDecisionDraftPacket(snapshot, {
        action: "close_ready",
        limit: 1,
      });
      expect(decisionDraft).toMatchObject({
        schema_version: "project-closure-decision-draft.v1",
        action: "close_ready",
        plan_only: true,
        must_not_apply: true,
        approval_allowed: false,
        apply_authorized: false,
        review: {
          total: 1,
          listed: 1,
          omitted: 0,
          limit: 1,
          offset: 0,
        },
        decision: {
          decision_id: "closure-review:close_ready",
          draft_outcome: "pending_human_review",
          allowed_outcomes: [
            "approve_closure_claim",
            "reject_to_collect_evidence",
            "reject_to_repair_failed_evidence",
            "reject_to_reverse_design",
          ],
          non_authorizing: true,
          outcome_routes: expect.arrayContaining([
            expect.objectContaining({
              outcome: "reject_to_reverse_design",
              target_action: "reverse_design",
              drive_model: "Reverse",
            }),
          ]),
        },
        write_policy: "read-only",
        source_command: "helix closure decision-draft --json",
      });
      expect(decisionDraft.approval_record_text).toContain("outcome: pending_human_review");
      expect(decisionDraft.approval_record_text).toContain(
        "coverage_ids: L6-implementation-binding",
      );
      expect(decisionDraft.approval_record_text).toContain("l12_layers: L6");
      expect(decisionDraft.candidate_digests).toEqual([
        expect.objectContaining({
          plan_id: "PLAN-L7-999-new-impl",
          l12_layer: "L6",
          coverage_id: "L6-implementation-binding",
          coverage_label: "実装契約/implementation binding",
        }),
      ]);
      const draftApply = buildProjectClosureApplyPlan(snapshot, {
        approvalRecordPath: "docs/evidence/closure-decision-draft.yaml",
        approvalRecordText: decisionDraft.approval_record_text,
        limit: 1,
      });
      expect(draftApply.approval).toMatchObject({
        valid: false,
        outcome: "pending_human_review",
        reasons: ["outcome が approve_closure_claim ではない"],
      });
      const emptyReviewWindow = buildProjectClosureReviewBundle(snapshot, {
        action: "close_ready",
        limit: 1,
        offset: 1,
      });
      expect(emptyReviewWindow).toMatchObject({
        total: 1,
        listed: 0,
        omitted: 1,
        limit: 1,
        offset: 1,
        window: {
          start: 0,
          end: 0,
          page_index: 1,
          page_count: 1,
          has_previous: true,
          has_next: false,
          previous_offset: 0,
          next_offset: null,
        },
        candidates: [],
        review_scope: {
          plan_ids: [],
          source_paths: [],
          coverage_ids: [],
          l12_layers: [],
          evidence_totals: expect.objectContaining({
            artifact_paths: 0,
            evidence_paths: 0,
            test_runs_total: 0,
            test_runs_passed: 0,
          }),
        },
      });
      const transitionPlan = buildProjectClosureTransitionPlan(snapshot, {
        action: "close_ready",
        decisionOutcome: "approve_closure_claim",
        limit: 1,
      });
      expect(transitionPlan).toMatchObject({
        schema_version: "project-closure-transition-plan.v1",
        action: "close_ready",
        decision_outcome: "approve_closure_claim",
        dry_run: true,
        target_plan_ids: ["PLAN-L7-999-new-impl"],
        total: 1,
        listed: 1,
        omitted: 0,
        limit: 1,
        offset: 0,
        window: {
          start: 1,
          end: 1,
          page_index: 1,
          page_count: 1,
          has_previous: false,
          has_next: false,
          previous_offset: null,
          next_offset: null,
        },
        allowed_to_apply: false,
        blocked_reasons: [
          "blocker finding が残っている: unresolved_design_reference,impl_ahead_descent_obligation",
        ],
        outcome_projection: {
          projection_type: "apply_closure",
          target_action: "accepted",
          drive_model: "Recovery",
          human_required: true,
          command:
            "helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit 1 --json",
          transition_command:
            "helix closure apply --execute --approval-record <approved-approval-record-path> --limit 1 --json",
        },
        write_policy: "read-only",
        source_command: "helix closure transition-plan --summary-json",
      });
      expect(transitionPlan.planned_steps.map((step) => step.step_id)).toEqual([
        "record-approval",
        "patch-plan-status",
        "rebuild-projection",
        "postcheck-drive-model",
      ]);
      const emptyTransitionWindow = buildProjectClosureTransitionPlan(snapshot, {
        action: "close_ready",
        decisionOutcome: "approve_closure_claim",
        limit: 1,
        offset: 1,
      });
      expect(emptyTransitionWindow).toMatchObject({
        target_plan_ids: [],
        total: 1,
        listed: 0,
        omitted: 1,
        limit: 1,
        offset: 1,
        window: {
          start: 0,
          end: 0,
          page_index: 1,
          page_count: 1,
          has_previous: true,
          has_next: false,
          previous_offset: 0,
          next_offset: null,
        },
        allowed_to_apply: false,
        blocked_reasons: [
          "blocker finding が残っている: unresolved_design_reference,impl_ahead_descent_obligation",
          "対象 candidate が 0 件",
        ],
      });
      const rejectedTransition = buildProjectClosureTransitionPlan(snapshot, {
        action: "close_ready",
        decisionOutcome: "reject_to_reverse_design",
        limit: 1,
      });
      expect(rejectedTransition).toMatchObject({
        decision_outcome: "reject_to_reverse_design",
        allowed_to_apply: false,
        blocked_reasons: expect.arrayContaining([
          "decision_outcome が approve_closure_claim ではない",
        ]),
        outcome_projection: {
          projection_type: "reroute_closure_lane",
          target_action: "reverse_design",
          drive_model: "Reverse",
          human_required: true,
          command: "helix closure evidence-plan --action reverse_design --summary-json",
          transition_command: "helix closure review-bundle --action reverse_design --summary-json",
          expected_transition: expect.stringContaining("設計"),
          required_action: expect.stringContaining("設計"),
          postcheck_commands: [
            "helix db rebuild",
            "helix closure batch --action reverse_design --json",
            "helix current-location --json",
            "helix vmodel fit",
          ],
        },
      });
      expect(rejectedTransition.planned_steps.map((step) => step.step_id)).toEqual([
        "record-rejection",
        "reroute-closure-lane",
        "rebuild-projection",
        "postcheck-drive-model",
      ]);
      const blockedApply = buildProjectClosureApplyPlan(snapshot, {
        limit: 1,
      });
      expect(blockedApply).toMatchObject({
        schema_version: "project-closure-apply-plan.v1",
        dry_run: true,
        action: "close_ready",
        allowed_to_apply: false,
        approval: {
          required: true,
          valid: false,
          reasons: ["approval record が指定されていない"],
        },
        patch_candidates: [
          expect.objectContaining({
            plan_id: "PLAN-L7-999-new-impl",
            current_status: "draft",
            next_status: "accepted",
            operation: "frontmatter_status_update",
          }),
        ],
      });
      const missingDigestApply = buildProjectClosureApplyPlan(snapshot, {
        approvalRecordPath: "docs/evidence/closure-approval.yaml",
        approvalRecordText: [
          "decision_id: closure-review:close_ready",
          "outcome: approve_closure_claim",
          "reason: fixture approval",
        ].join("\n"),
        limit: 1,
      });
      expect(missingDigestApply.approval).toMatchObject({
        valid: false,
        approval_scope_digest: null,
        reasons: ["approval_scope_digest が指定されていない"],
      });
      const staleDigestApply = buildProjectClosureApplyPlan(snapshot, {
        approvalRecordPath: "docs/evidence/closure-approval.yaml",
        approvalRecordText: [
          "decision_id: closure-review:close_ready",
          "outcome: approve_closure_claim",
          "approval_scope_digest: sha256:stale",
          "reason: fixture approval",
        ].join("\n"),
        limit: 1,
      });
      expect(staleDigestApply.approval).toMatchObject({
        valid: false,
        approval_scope_digest: "sha256:stale",
        reasons: ["approval_scope_digest が current review scope と一致しない"],
      });
      const approvedApply = buildProjectClosureApplyPlan(snapshot, {
        approvalRecordPath: "docs/evidence/closure-approval.yaml",
        approvalRecordText: [
          "decision_id: closure-review:close_ready",
          "outcome: approve_closure_claim",
          `approval_scope_digest: ${bundle.review_scope.approval_scope_digest}`,
          "reason: fixture approval",
        ].join("\n"),
        limit: 1,
      });
      expect(approvedApply).toMatchObject({
        dry_run: true,
        allowed_to_apply: false,
        approval: {
          record_path: "docs/evidence/closure-approval.yaml",
          valid: true,
          decision_id: "closure-review:close_ready",
          outcome: "approve_closure_claim",
        },
        blocked_reasons: [
          "blocker finding が残っている: unresolved_design_reference,impl_ahead_descent_obligation",
        ],
      });
      expect(snapshot.roadmap_position).toMatchObject({
        status: "uncovered",
        rollup: {
          total_bands: 5,
          covered_bands: 4,
          parked_bands: 0,
          uncovered_bands: 1,
        },
        frontier: ["impl", "verification"],
        current_band_ids: ["impl", "verification"],
        current_gate_ids: ["PLAN-L14-01-close:G-OPS"],
        bands: [
          expect.objectContaining({
            bandId: "impl",
            status: "uncovered",
            l12Layers: ["L6", "L7"],
            coverageIds: ["L6-implementation-binding", "L7-tdd-closure"],
          }),
          expect.objectContaining({
            bandId: "verification",
            status: "covered",
            roadmapIds: ["PLAN-L14-01-close"],
            l12Layers: ["L8", "L9", "L10", "L11", "L12"],
            coverageIds: expect.arrayContaining([
              "L8-unit-test-design",
              "L9-integration-test-design",
              "L10-system-test-design",
              "L11-acceptance-test-design",
              "L12-operation-observability",
            ]),
          }),
        ],
        gates: [
          expect.objectContaining({
            planId: "PLAN-L14-01-close",
            gateId: "G-OPS",
            totalSpans: 2,
            confirmedSpans: 1,
            reached: false,
            status: "pending",
            l12Layers: ["L12"],
            coverageIds: ["L12-operation-observability"],
          }),
        ],
      });
      expect(snapshot.findings.map((finding) => finding.code)).toEqual([
        "l14_claim_with_l7_work",
        "unresolved_design_reference",
        "impl_ahead_descent_obligation",
        "roadmap_uncovered_frontier",
        "operation_scope_gap",
        "design_coverage_gap",
        "tailoring_required_gap",
      ]);
      expect(snapshot.drive_recommendation).toMatchObject({
        model: "Recovery",
        reverseTargets: ["docs/design/**", "docs/test-design/**"],
      });
      expect(snapshot.drive_route).toMatchObject({
        routeId: "drive:Recovery:recover-current-location",
        status: "recovery_required",
        selectedModel: "Recovery",
        defaultModel: "Forward",
        mustReturnToDesign: true,
        forward: {
          allowed: false,
          roadmapStatus: "uncovered",
          frontier: ["impl", "verification"],
          currentBandIds: ["impl", "verification"],
          currentGateIds: ["PLAN-L14-01-close:G-OPS"],
          coverageIds: expect.arrayContaining([
            "L6-implementation-binding",
            "L7-tdd-closure",
            "L8-unit-test-design",
            "L9-integration-test-design",
            "L10-system-test-design",
            "L11-acceptance-test-design",
            "L12-operation-observability",
          ]),
        },
        reverse: {
          required: true,
          targets: ["docs/design/**", "docs/test-design/**"],
          l12Layers: expect.arrayContaining(["L5", "L6", "L7", "L12"]),
          coverageIds: expect.arrayContaining([
            "L5-detailed-contract",
            "L6-implementation-binding",
            "L7-tdd-closure",
            "L12-operation-observability",
          ]),
          queueActions: ["close_ready"],
          ledgerIds: ["next-action:closure:close_ready"],
        },
      });
      expect(snapshot.drive_recommendation.docDependencies).toEqual(
        expect.arrayContaining([
          "docs/design",
          "docs/test-design",
          "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
          "docs/design/helix/L5-detailed-design/",
        ]),
      );
      expect(snapshot.drive_recommendation.implementationDependencies).toEqual(
        expect.arrayContaining(["plan_registry", "design_references", "descent_obligations"]),
      );
      expect(snapshot.coverage.l12_layers.find((layer) => layer.layer === "L6")).toMatchObject({
        status: "reverify",
        legacyLayers: ["L7"],
        planIds: ["PLAN-L7-999-new-impl"],
      });
      expect(snapshot.coverage.l12_layers.find((layer) => layer.layer === "L12")).toMatchObject({
        status: "reverify",
        legacyLayers: ["L14"],
        planIds: ["PLAN-L14-01-close"],
      });
      expect(snapshot.artifact_remap.layers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            layer: "L6",
            status: "reverify",
            artifactIds: expect.arrayContaining(["PLAN-L7-999-new-impl"]),
          }),
          expect.objectContaining({
            layer: "L12",
            status: "done",
            artifactIds: expect.arrayContaining(["PLAN-L14-01-close"]),
          }),
        ]),
      );
      expect(snapshot.artifact_remap.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            artifactId: "PLAN-L14-01-close",
            legacyLayer: "L14",
            l12Layer: "L12",
            status: "done",
          }),
          expect.objectContaining({
            artifactId: "PLAN-L7-999-new-impl",
            legacyLayer: "L7",
            l12Layer: "L6",
            status: "reverify",
          }),
        ]),
      );
      const l6RemapBatch = buildProjectArtifactRemapBatchReport(snapshot, {
        layer: "L6",
        status: "reverify",
      });
      expect(l6RemapBatch).toMatchObject({
        selected_layer: "L6",
        selected_status: "reverify",
        total: 1,
        recommended_next_action: {
          model: "Reverse",
          command: "helix closure batch --action close_ready --json",
          reason: "L7/L6 再検証 artifact は closure queue の nextAction に接続済み",
        },
        items: [
          expect.objectContaining({
            artifactId: "PLAN-L7-999-new-impl",
            driveModel: "Reverse",
            zipSourceBindingIds: expect.arrayContaining([
              "zip-source:l12-level-definition",
              "zip-source:catalog",
            ]),
            tailoringRuleIds: ["HVM-TAILOR-DETAIL-CONTRACT"],
            tailoringDetailLevels: ["詳細"],
            closureLink: expect.objectContaining({
              planId: "PLAN-L7-999-new-impl",
              nextAction: "close_ready",
              evidenceStatus: "ready",
              batchCommand: "helix closure batch --action close_ready --json",
              reviewCommand: "helix closure review-bundle --action close_ready --summary-json",
            }),
          }),
        ],
      });
      const emptyListedRemapBatch = buildProjectArtifactRemapBatchReport(snapshot, {
        layer: "L6",
        status: "reverify",
        limit: 0,
      });
      expect(emptyListedRemapBatch).toMatchObject({
        total: 1,
        listed: 0,
        recommended_next_action: {
          command: "helix closure batch --action close_ready --json",
        },
      });
    }));

  it("failed test/gateをrepair_failed_evidenceの修復対象として機械抽出する", () =>
    withDb((db) => {
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L7-777-failed-evidence",
          kind: "add-impl",
          layer: "L7",
          drive: "agent",
          status: "draft",
          updated_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "artifact_registry",
        primaryKey: "artifact_id",
        row: {
          artifact_id: "artifact:PLAN-L7-777-failed-evidence",
          artifact_type: "markdown_doc",
          path: "docs/plans/PLAN-L7-777-failed-evidence.md",
          pair_artifact: "",
          status: "current",
          updated_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "test_runs",
        primaryKey: "test_run_id",
        row: {
          test_run_id: "tr:failed",
          session_id: "session",
          plan_id: "PLAN-L7-777-failed-evidence",
          command: "bun test failing",
          runner: "bun",
          runtime: "test",
          os: "linux",
          shell: "bash",
          scope: "unit",
          started_at: "2026-07-08T00:02:00.000Z",
          completed_at: "2026-07-08T00:02:10.000Z",
          exit_code: 1,
          evidence_path: "docs/evidence/failed-test.json",
          output_digest: "sha256:failed-test",
          green_definition_id: "green",
          status: "failed",
        },
      });
      upsertRow(db, {
        table: "gate_runs",
        primaryKey: "gate_run_id",
        row: {
          gate_run_id: "gate:failed",
          gate_id: "design-coverage",
          plan_id: "PLAN-L7-777-failed-evidence",
          status: "failed",
          checked_at: "2026-07-08T00:02:20.000Z",
          evidence_path: "docs/evidence/failed-gate.json",
        },
      });
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L7-779-ready-for-review",
          kind: "add-impl",
          layer: "L7",
          drive: "agent",
          status: "draft",
          updated_at: "2026-07-08T00:03:00.000Z",
        },
      });
      upsertRow(db, {
        table: "artifact_registry",
        primaryKey: "artifact_id",
        row: {
          artifact_id: "artifact:PLAN-L7-779-ready-for-review",
          artifact_type: "markdown_doc",
          path: "docs/plans/PLAN-L7-779-ready-for-review.md",
          pair_artifact: "",
          status: "current",
          updated_at: "2026-07-08T00:03:00.000Z",
        },
      });
      upsertRow(db, {
        table: "test_runs",
        primaryKey: "test_run_id",
        row: {
          test_run_id: "tr:ready",
          session_id: "session",
          plan_id: "PLAN-L7-779-ready-for-review",
          command: "bun test ready",
          runner: "bun",
          runtime: "test",
          os: "linux",
          shell: "bash",
          scope: "unit",
          started_at: "2026-07-08T00:03:00.000Z",
          completed_at: "2026-07-08T00:03:10.000Z",
          exit_code: 0,
          evidence_path: "docs/evidence/ready-test.json",
          output_digest: "sha256:ready-test",
          green_definition_id: "green",
          status: "passed",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const evidencePlan = buildProjectClosureEvidencePlan(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
      });
      const overview = buildProjectClosureOverview(snapshot, { limit: 1 });

      expect(snapshot.closure.queue.route_counts.repair_failed_evidence).toBe(1);
      expect(snapshot.closure.queue.route_counts.close_ready).toBe(1);
      expect(overview).toMatchObject({
        recommended_next_action: {
          action: "repair_failed_evidence",
          command: "helix closure review-bundle --action repair_failed_evidence --summary-json",
          human_required: false,
        },
      });
      expect(evidencePlan).toMatchObject({
        selected_action: "repair_failed_evidence",
        total: 1,
        listed: 1,
        target_tables: expect.arrayContaining(["test_runs", "gate_runs"]),
        items: [
          expect.objectContaining({
            plan_id: "PLAN-L7-777-failed-evidence",
            next_action: "repair_failed_evidence",
            evidence_status: "partial",
            evidence_templates: expect.arrayContaining([
              expect.objectContaining({
                table: "test_runs",
                status_after_projection: "passed test_runs が同じ plan_id に追加される",
                required_fields: expect.arrayContaining(["plan_id", "status", "exit_code"]),
                example_row: expect.objectContaining({
                  plan_id: "PLAN-L7-777-failed-evidence",
                  status: "passed",
                  exit_code: 0,
                }),
              }),
              expect.objectContaining({
                table: "gate_runs",
                status_after_projection: "passed gate_runs が同じ plan_id に追加される",
                example_row: expect.objectContaining({
                  plan_id: "PLAN-L7-777-failed-evidence",
                  status: "passed",
                }),
              }),
            ]),
            repair_targets: [
              expect.objectContaining({
                component: "test",
                id: "tr:failed",
                status: "failed",
                command: "bun test failing",
                evidencePath: "docs/evidence/failed-test.json",
                outputDigest: "sha256:failed-test",
                observedAt: "2026-07-08T00:02:10.000Z",
              }),
              expect.objectContaining({
                component: "gate",
                id: "gate:failed",
                status: "failed",
                command: "helix gate design-coverage",
                evidencePath: "docs/evidence/failed-gate.json",
                outputDigest: null,
                observedAt: "2026-07-08T00:02:20.000Z",
              }),
            ],
          }),
        ],
      });
    }));

  it("label-only verification commandを安全なresolution candidateへ変換する", () =>
    withDb((db) => {
      upsertRow(db, {
        table: "plan_registry",
        primaryKey: "plan_id",
        row: {
          plan_id: "PLAN-L7-778-label-only",
          kind: "add-impl",
          layer: "L7",
          drive: "agent",
          status: "draft",
          updated_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "artifact_registry",
        primaryKey: "artifact_id",
        row: {
          artifact_id: "artifact:PLAN-L7-778-label-only",
          artifact_type: "markdown_doc",
          path: "docs/plans/PLAN-L7-778-label-only.md",
          pair_artifact: "",
          status: "current",
          updated_at: "2026-07-08T00:01:00.000Z",
        },
      });
      upsertRow(db, {
        table: "test_runs",
        primaryKey: "test_run_id",
        row: {
          test_run_id: "tr:label-only",
          session_id: "session",
          plan_id: "PLAN-L7-778-label-only",
          command: "Bash (vitest)",
          runner: "bash",
          runtime: "hook-session-log",
          os: "linux",
          shell: "bash",
          scope: "runtime-hook",
          started_at: "",
          completed_at: "2026-07-08T00:02:10.000Z",
          exit_code: 1,
          evidence_path: ".helix/logs/session/session.jsonl",
          output_digest: "error",
          green_definition_id: "",
          status: "failed",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const batch = buildProjectClosureBatchReport(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
      });

      expect(batch.work_buckets[0]?.repair_plan.automation).toMatchObject({
        status: "needs_command_resolution",
        runnable_command_count: 0,
        label_only_command_count: 1,
        resolution_candidate_count: 2,
        safe_resolution_command_count: 1,
        primary_next_command: "bun run test:fast",
        blockers: ["Bash (vitest)"],
      });
      expect(batch.work_buckets[0]?.repair_plan.command_candidates[0]).toMatchObject({
        command_label: "Bash (vitest)",
        command_verb: "vitest",
        runnable_command: null,
        resolution_candidates: [
          expect.objectContaining({
            command: "bun run test:fast",
            confidence: "medium",
            safe_to_run: true,
            projection_binding: expect.objectContaining({
              target_tables: ["test_runs", "gate_runs", "runtime_verification_events"],
              source_surfaces: expect.arrayContaining([
                "docs/plans/<plan_id>.md review_evidence.green_commands",
                "docs/evidence/<plan_id>-test.json",
              ]),
              required_fields: expect.arrayContaining([
                "plan_id",
                "command",
                "exit_code",
                "evidence_path",
                "output_digest",
              ]),
              success_status: "passed_or_accepted",
              write_policy: "read-only_plan",
              postcheck_commands: [
                "helix db rebuild",
                "helix closure batch --action repair_failed_evidence --json",
                "helix current-location --json",
                "helix vmodel fit",
              ],
            }),
          }),
          expect.objectContaining({
            command: "bun run vitest run <targeted tests>",
            confidence: "low",
            safe_to_run: false,
          }),
        ],
      });
      expect(batch.work_buckets[0]?.repair_plan.projection_items[0]).toMatchObject({
        plan_id: "PLAN-L7-778-label-only",
        evidence_artifact_templates: [
          expect.objectContaining({
            artifact_kind: "plan_review_evidence",
            artifact_path: "docs/plans/PLAN-L7-778-label-only.md",
            projection_target_tables: ["review_evidence_registry", "test_runs"],
            template_format: "yaml_frontmatter",
            write_policy: "template_only",
            required_fields: expect.arrayContaining([
              "review_evidence[].green_commands[].command",
              "review_evidence[].green_commands[].exit_code",
            ]),
          }),
          expect.objectContaining({
            artifact_kind: "structured_test_evidence",
            artifact_path: "docs/evidence/PLAN-L7-778-label-only-test.json",
            projection_target_tables: ["test_cases", "test_results", "test_artifact_edges"],
            template_format: "json",
          }),
          expect.objectContaining({
            artifact_kind: "runtime_verification_evidence",
            artifact_path: "docs/evidence/PLAN-L7-778-label-only-runtime.json",
            projection_target_tables: ["runtime_verification_events"],
            template_format: "json",
          }),
        ],
        evidence_patch_plan: expect.objectContaining({
          approval_required: true,
          write_policy: "approval-required",
          dry_run_command: "helix closure batch --action repair_failed_evidence --json",
          execute_command: null,
          postcheck_commands: [
            "helix db rebuild",
            "helix closure batch --action repair_failed_evidence --json",
            "helix current-location --json",
            "helix vmodel fit",
          ],
          patch_candidates: [
            expect.objectContaining({
              artifact_kind: "plan_review_evidence",
              artifact_path: "docs/plans/PLAN-L7-778-label-only.md",
              operation: "append_yaml_frontmatter",
              preview_digest: expect.stringMatching(/^sha256:/),
              placeholder_count: expect.any(Number),
              unresolved_placeholders: expect.arrayContaining(["<green command>", "<iso8601>"]),
              real_evidence_required: true,
            }),
            expect.objectContaining({
              artifact_kind: "structured_test_evidence",
              artifact_path: "docs/evidence/PLAN-L7-778-label-only-test.json",
              operation: "create_json_artifact",
              preview_digest: expect.stringMatching(/^sha256:/),
              placeholder_count: expect.any(Number),
              real_evidence_required: true,
            }),
            expect.objectContaining({
              artifact_kind: "runtime_verification_evidence",
              artifact_path: "docs/evidence/PLAN-L7-778-label-only-runtime.json",
              operation: "create_json_artifact",
              preview_digest: expect.stringMatching(/^sha256:/),
            }),
          ],
        }),
      });
      const patchPacket = buildProjectClosureEvidencePatchPacket(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
      });
      expect(patchPacket).toMatchObject({
        schema_version: "project-closure-evidence-patch-packet.v1",
        selected_action: "repair_failed_evidence",
        queue_total: 1,
        queue_listed: 1,
        queue_omitted: 0,
        patch_candidate_count: 3,
        apply_readiness: {
          status: "blocked_placeholders",
          allowed_to_apply: false,
          blocked_candidate_count: 3,
          execute_command: null,
        },
        write_policy: "read-only",
        source_command: "helix closure evidence-patch --json",
        approval: {
          required: true,
          decision_id: "closure-evidence-patch:repair_failed_evidence",
          approval_scope_digest: expect.stringMatching(/^sha256:/),
          allowed_outcomes: [
            "approve_evidence_patch",
            "reject_evidence_patch",
            "request_targeted_command_resolution",
          ],
        },
        safety_policy: {
          packet_write_policy: "read-only",
          patch_write_policy: "approval-required",
          execute_command: null,
          dry_run_command: "helix closure evidence-patch --action repair_failed_evidence --json",
        },
        patch_candidates: [
          expect.objectContaining({
            candidate_id: "PLAN-L7-778-label-only:plan_review_evidence:1",
            plan_id: "PLAN-L7-778-label-only",
            artifact_path: "docs/plans/PLAN-L7-778-label-only.md",
            operation: "append_yaml_frontmatter",
            projection_target_tables: ["review_evidence_registry", "test_runs"],
            preview_digest: expect.stringMatching(/^sha256:/),
            placeholder_count: expect.any(Number),
            unresolved_placeholders: expect.arrayContaining(["<green command>", "<iso8601>"]),
            real_evidence_required: true,
            rollback_note: expect.stringContaining("review_evidence entry"),
            postcheck_commands: [
              "helix db rebuild",
              "helix closure batch --action repair_failed_evidence --json",
              "helix current-location --json",
              "helix vmodel fit",
            ],
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-778-label-only-test.json",
            operation: "create_json_artifact",
            rollback_note: expect.stringContaining("evidence artifact"),
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-778-label-only-runtime.json",
            operation: "create_json_artifact",
          }),
        ],
      });
      expect(patchPacket.apply_readiness.placeholder_count).toBeGreaterThan(0);
      const probeDryRun = buildProjectClosureEvidenceProbePacket(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
      });
      expect(probeDryRun).toMatchObject({
        schema_version: "project-closure-evidence-probe.v1",
        selected_action: "repair_failed_evidence",
        dry_run: true,
        command: "bun run test:fast",
        can_execute: true,
        command_source: "classified_verb",
        confidence: "medium",
        target_plan_ids: ["PLAN-L7-778-label-only"],
        apply_readiness: {
          status: "dry_run",
          allowed_to_materialize: false,
        },
        placeholder_resolution: {
          fillable_placeholders: [],
          remaining_placeholders: ["<green command>", "<iso8601>", "<output>"],
        },
        write_policy: "read-only",
        source_command: "helix closure evidence-probe --json",
      });
      const probeExecuted = buildProjectClosureEvidenceProbePacket(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
        dryRun: false,
        execution: {
          command: "bun run test:fast",
          started_at: "2026-07-08T00:03:00.000Z",
          completed_at: "2026-07-08T00:03:10.000Z",
          exit_code: 0,
          status: "passed",
          output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          stdout_bytes: 10,
          stderr_bytes: 0,
          output_excerpt: {
            stdout_head: "passed output",
            stdout_tail: "passed output",
            stderr_head: "",
            stderr_tail: "",
            truncated: false,
            limit: 4000,
          },
          error_message: null,
        },
      });
      expect(probeExecuted).toMatchObject({
        dry_run: false,
        execution: {
          status: "passed",
          exit_code: 0,
          output_excerpt: {
            stdout_head: "passed output",
            stdout_tail: "passed output",
            stderr_head: "",
            stderr_tail: "",
            truncated: false,
            limit: 4000,
          },
        },
        placeholder_resolution: {
          fillable_placeholders: [
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
          ],
          remaining_placeholders: ["<session_id>", "<correlation_id>"],
        },
        apply_readiness: {
          status: "needs_artifact_values",
          allowed_to_materialize: false,
        },
      });
      const materialize = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
        probeExecution: {
          command: "bun run test:fast",
          started_at: "2026-07-08T00:03:00.000Z",
          completed_at: "2026-07-08T00:03:10.000Z",
          exit_code: 0,
          status: "passed",
          output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          stdout_bytes: 10,
          stderr_bytes: 0,
          error_message: null,
        },
      });
      expect(materialize).toMatchObject({
        schema_version: "project-closure-evidence-materialize.v1",
        selected_action: "repair_failed_evidence",
        materialized_candidate_count: 3,
        materialize_readiness: {
          status: "blocked_placeholders",
          allowed_to_apply: false,
          remaining_placeholder_count: 2,
          blocked_candidate_count: 1,
          execute_command: null,
        },
        approval: {
          required: true,
          decision_id: "closure-evidence-materialize:repair_failed_evidence",
          approval_scope_digest: expect.stringMatching(/^sha256:/),
        },
        write_policy: "read-only",
        source_command: "helix closure evidence-materialize --json",
      });
      expect(materialize.materialized_candidates[0]).toMatchObject({
        candidate_id: "PLAN-L7-778-label-only:plan_review_evidence:1",
        filled_placeholders: ["<green command>", "<iso8601>", "<output>", "<reviewer>"],
        remaining_placeholders: [],
        ready_for_approval: true,
        materialized_preview_digest: expect.stringMatching(/^sha256:/),
      });
      expect(materialize.materialized_candidates[0]?.placeholder_resolution_sources).toContainEqual({
        placeholder: "<reviewer>",
        source: "deterministic_closure_rule",
        value_digest: expect.stringMatching(/^sha256:/),
      });
      expect(materialize.materialized_candidates[0]?.materialized_preview_lines.join("\n")).toContain(
        "bun run test:fast",
      );
      expect(materialize.materialized_candidates[0]?.materialized_preview_lines.join("\n")).toContain(
        "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      );
      expect(materialize.materialized_candidates[2]).toMatchObject({
        remaining_placeholders: expect.arrayContaining(["<session_id>", "<correlation_id>"]),
        ready_for_approval: false,
      });
      const materializeWithProvenance = buildProjectClosureEvidenceMaterializePacket(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
        probeExecution: {
          command: "bun run test:fast",
          session_id: "closure-probe:session1234",
          correlation_id: "closure-correlation:corr1234",
          started_at: "2026-07-08T00:03:00.000Z",
          completed_at: "2026-07-08T00:03:10.000Z",
          exit_code: 0,
          status: "passed",
          output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          stdout_bytes: 10,
          stderr_bytes: 0,
          error_message: null,
        },
      });
      expect(materializeWithProvenance).toMatchObject({
        materialize_readiness: {
          status: "ready_for_approval",
          allowed_to_apply: false,
          remaining_placeholder_count: 0,
          blocked_candidate_count: 0,
        },
      });
      expect(materializeWithProvenance.materialized_candidates[2]).toMatchObject({
        filled_placeholders: expect.arrayContaining(["<session_id>", "<correlation_id>"]),
        remaining_placeholders: [],
        ready_for_approval: true,
      });
      expect(
        materializeWithProvenance.materialized_candidates[2]?.materialized_preview_lines.join("\n"),
      ).toContain('"session_id": "closure-probe:session1234"');
      expect(
        materializeWithProvenance.materialized_candidates[2]?.materialized_preview_lines.join("\n"),
      ).toContain('"correlation_id": "closure-correlation:corr1234"');
      const approvalDraft = buildProjectClosureEvidenceApprovalDraftPacket(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
        probeExecution: {
          command: "bun run test:fast",
          session_id: "closure-probe:session1234",
          correlation_id: "closure-correlation:corr1234",
          started_at: "2026-07-08T00:03:00.000Z",
          completed_at: "2026-07-08T00:03:10.000Z",
          exit_code: 0,
          status: "passed",
          output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          stdout_bytes: 10,
          stderr_bytes: 0,
          error_message: null,
        },
      });
      expect(approvalDraft).toMatchObject({
        schema_version: "project-closure-evidence-approval-draft.v1",
        selected_action: "repair_failed_evidence",
        plan_only: true,
        must_not_apply: true,
        approval_allowed: false,
        apply_authorized: false,
        materialize_readiness: {
          status: "ready_for_approval",
        },
        materialized_candidate_count: 3,
        approval: {
          decision_id: "closure-evidence-materialize:repair_failed_evidence",
          draft_outcome: "pending_human_review",
          non_authorizing: true,
          approval_scope_digest: materializeWithProvenance.approval.approval_scope_digest,
        },
        write_policy: "read-only",
        source_command: "helix closure evidence-approval-draft --json",
      });
      expect(approvalDraft.approval_record_text).toContain("outcome: pending_human_review");
      const applyPlan = buildProjectClosureEvidenceApplyPlan(snapshot, {
        action: "repair_failed_evidence",
        limit: 1,
        probeExecution: {
          command: "bun run test:fast",
          session_id: "closure-probe:session1234",
          correlation_id: "closure-correlation:corr1234",
          started_at: "2026-07-08T00:03:00.000Z",
          completed_at: "2026-07-08T00:03:10.000Z",
          exit_code: 0,
          status: "passed",
          output_digest: "sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
          stdout_bytes: 10,
          stderr_bytes: 0,
          error_message: null,
        },
        approvalRecordPath: "approval.yaml",
        approvalRecordText: [
          "decision_id: closure-evidence-materialize:repair_failed_evidence",
          "outcome: approve_materialized_evidence",
          `approval_scope_digest: ${materializeWithProvenance.approval.approval_scope_digest}`,
          "reason: fixture approval",
        ].join("\n"),
      });
      expect(applyPlan).toMatchObject({
        schema_version: "project-closure-evidence-apply-plan.v1",
        selected_action: "repair_failed_evidence",
        allowed_to_apply: true,
        blocked_reasons: [],
        approval: {
          record_path: "approval.yaml",
          valid: true,
          decision_id: "closure-evidence-materialize:repair_failed_evidence",
          outcome: "approve_materialized_evidence",
        },
        write_policy: "read-only",
        source_command: "helix closure evidence-apply --dry-run --json",
      });
      expect(applyPlan.patch_candidates).toHaveLength(3);
      expect(applyPlan.patch_candidates).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            candidate_id: "PLAN-L7-778-label-only:plan_review_evidence:1",
            operation: "append_yaml_frontmatter",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-778-label-only-test.json",
            operation: "create_json_artifact",
          }),
          expect.objectContaining({
            artifact_path: "docs/evidence/PLAN-L7-778-label-only-runtime.json",
            operation: "create_json_artifact",
          }),
        ]),
      );
    }));

  it("log/KPI/runtime verification/operation test/class-method contract/incident routeをL12運用後scopeとして検出する", () =>
    withDb((db) => {
      const declarations = [
        ["decl:log", "HOPS-LOG-01", "ログ設計", "L12", "operation log design"],
        ["decl:kpi", "HOPS-KPI-01", "KPI", "L12", "operation KPI metric"],
        ["decl:runtime", "HOPS-RUNTIME-01", "runtime verification", "L12", "runtime evidence"],
        ["decl:optest", "HOPS-OPTEST-01", "運用テスト", "L12", "operation test"],
        ["decl:contract", "HOPS-CONTRACT-01", "class/method contract", "L5", "class method"],
        [
          "decl:incident",
          "HOPS-VMFIT-INCIDENT-ROUTE-01",
          "障害時逆流 route",
          "L12",
          "incident recovery reverse route",
        ],
      ];
      for (const [declarationId, definedId, kind, layer, title] of declarations) {
        upsertRow(db, {
          table: "design_declarations",
          primaryKey: "declaration_id",
          row: {
            declaration_id: declarationId,
            defined_id: definedId,
            declaration_kind: kind,
            title,
            layer,
            source_path: "docs/design/helix/L5-detailed-design/operation-scope.md",
            source: "frontmatter",
            indexed_at: "2026-07-08T00:00:00.000Z",
          },
        });
      }
      upsertRow(db, {
        table: "runtime_verification_events",
        primaryKey: "event_id",
        row: {
          event_id: "rv:accepted",
          plan_id: "PLAN-L12-OPS",
          requirement_id: "HOPS-RUNTIME-01",
          test_oracle_id: "HAT-OPS-01",
          claim: "runtime verified",
          session_id: "session",
          source: "test",
          runtime_surface: "cli",
          correlation_id: "corr",
          evidence_path: "docs/state/logs/runtime-verification.jsonl",
          occurred_at: "2026-07-08T00:01:00.000Z",
          redaction_policy: "none",
          verification_class: "runtime_verified",
          accept_status: "accepted",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.operation_scope).toMatchObject({
        designed: 5,
        observed: 1,
        observed_gap: 5,
        missing: 0,
        reverify: 0,
      });
      expect(snapshot.operation_scope.items.map((item) => `${item.scope}:${item.status}`)).toEqual([
        "log_design:designed",
        "kpi_metric:designed",
        "runtime_verification:observed",
        "operation_test:designed",
        "class_method_contract:designed",
        "incident_recovery_route:designed",
      ]);
      expect(snapshot.operation_scope.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            scope: "runtime_verification",
            coverageId: "L12-operation-observability",
            coverageLabel: "運用テスト/ログ/KPI/runtime",
            observationSources: [
              "runtime_verification_events:docs/state/logs/runtime-verification.jsonl",
            ],
          }),
          expect.objectContaining({
            scope: "class_method_contract",
            coverageId: "L12-operation-observability",
          }),
          expect.objectContaining({
            scope: "incident_recovery_route",
            coverageId: "L12-operation-observability",
            evidenceTables: expect.arrayContaining([
              "closure_next_action_ledger",
              "runtime_verification_events",
            ]),
          }),
        ]),
      );
      expect(snapshot.findings.map((finding) => finding.code)).not.toContain("operation_scope_gap");
      const fit = buildVmodelFitReport(snapshot);
      expect(fit.blockers.map((blocker) => blocker.code)).not.toContain("operation_scope");
      expect(fit.reasons).toContain("operation scope gate passed");
      expect(snapshot.coverage.l12_layers.find((layer) => layer.layer === "L12")).toMatchObject({
        status: "done",
        designIds: expect.arrayContaining([
          "HOPS-LOG-01",
          "HOPS-KPI-01",
          "HOPS-RUNTIME-01",
          "HOPS-OPTEST-01",
          "HOPS-VMFIT-INCIDENT-ROUTE-01",
        ]),
      });
      expect(snapshot.artifact_remap).toMatchObject({
        done: 6,
        missing: 10,
        reverify: 0,
      });
      expect(snapshot.artifact_remap.layers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            layer: "L12",
            status: "done",
            total: 5,
            artifactIds: expect.arrayContaining([
              "HOPS-LOG-01",
              "HOPS-KPI-01",
              "HOPS-RUNTIME-01",
              "HOPS-OPTEST-01",
              "HOPS-VMFIT-INCIDENT-ROUTE-01",
            ]),
          }),
        ]),
      );
    }));

  it("runtime verificationは対象設計IDに結合しないaccepted evidenceでobservedへ誤昇格しない", () =>
    withDb((db) => {
      for (const [declarationId, definedId, kind, layer, title] of [
        ["decl:log", "HOPS-LOG-01", "ログ設計", "L12", "operation log design"],
        ["decl:kpi", "HOPS-KPI-01", "KPI", "L12", "operation KPI metric"],
        ["decl:runtime", "HOPS-RUNTIME-01", "runtime verification", "L12", "runtime evidence"],
        ["decl:optest", "HOPS-OPTEST-01", "運用テスト", "L12", "operation test"],
        ["decl:contract", "HOPS-CONTRACT-01", "class/method contract", "L5", "class method"],
        [
          "decl:incident",
          "HOPS-VMFIT-INCIDENT-ROUTE-01",
          "障害時逆流 route",
          "L12",
          "incident recovery reverse route",
        ],
      ]) {
        upsertRow(db, {
          table: "design_declarations",
          primaryKey: "declaration_id",
          row: {
            declaration_id: declarationId,
            defined_id: definedId,
            declaration_kind: kind,
            title,
            layer,
            source_path: "docs/design/helix/L5-detailed-design/operation-scope.md",
            source: "frontmatter",
            indexed_at: "2026-07-08T00:00:00.000Z",
          },
        });
      }
      upsertRow(db, {
        table: "runtime_verification_events",
        primaryKey: "event_id",
        row: {
          event_id: "rv:unbound",
          plan_id: "PLAN-L12-OPS",
          requirement_id: "UNRELATED-REQ",
          test_oracle_id: "UNRELATED-ORACLE",
          claim: "runtime verified but unrelated to the runtime verification design id",
          session_id: "session",
          source: "test",
          runtime_surface: "cli",
          correlation_id: "corr",
          evidence_path: "docs/state/logs/runtime-verification-unbound.jsonl",
          occurred_at: "2026-07-08T00:01:00.000Z",
          redaction_policy: "none",
          verification_class: "runtime_verified",
          accept_status: "accepted",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.operation_scope).toMatchObject({
        designed: 5,
        observed: 0,
        observed_gap: 6,
        missing: 0,
        reverify: 1,
      });
      expect(snapshot.operation_scope.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            scope: "runtime_verification",
            status: "reverify",
            observedCount: 0,
            observationSources: [],
            reasons: expect.arrayContaining([
              "accepted runtime evidence はあるが runtime_verification 設計IDへ結合していない",
            ]),
          }),
        ]),
      );
    }));

  it("class/method contractは単語一致だけではobservedへ誤昇格しない", () =>
    withDb((db) => {
      upsertRow(db, {
        table: "design_declarations",
        primaryKey: "declaration_id",
        row: {
          declaration_id: "decl:contract",
          defined_id: "HOPS-CONTRACT-01",
          declaration_kind: "class/method contract",
          title: "class method contract",
          layer: "L5",
          source_path: "docs/design/helix/L5-detailed-design/operation-scope.md",
          source: "frontmatter",
          indexed_at: "2026-07-08T00:00:00.000Z",
        },
      });
      upsertRow(db, {
        table: "runtime_verification_events",
        primaryKey: "event_id",
        row: {
          event_id: "rv:class-only",
          plan_id: "PLAN-L12-OPS",
          requirement_id: "UNRELATED-REQ",
          test_oracle_id: "UNRELATED-ORACLE",
          claim: "class loader runtime check",
          session_id: "session",
          source: "test",
          runtime_surface: "cli",
          correlation_id: "corr",
          evidence_path: "docs/state/logs/class-only.jsonl",
          occurred_at: "2026-07-08T00:01:00.000Z",
          redaction_policy: "none",
          verification_class: "runtime_verified",
          accept_status: "accepted",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.operation_scope.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            scope: "class_method_contract",
            status: "designed",
            observedCount: 0,
            observationSources: [],
          }),
        ]),
      );
    }));

  it("operation testはpassed test_runs/gate_runsから観測source付きでobservedに昇格する", () =>
    withDb((db) => {
      upsertRow(db, {
        table: "design_declarations",
        primaryKey: "declaration_id",
        row: {
          declaration_id: "decl:optest",
          defined_id: "HOPS-OPTEST-01",
          declaration_kind: "運用テスト",
          title: "operation test",
          layer: "L12",
          source_path: "docs/design/helix/L5-detailed-design/operation-scope.md",
          source: "frontmatter",
          indexed_at: "2026-07-08T00:00:00.000Z",
        },
      });
      upsertRow(db, {
        table: "test_runs",
        primaryKey: "test_run_id",
        row: {
          test_run_id: "tr:operation-test",
          session_id: "session",
          plan_id: "PLAN-L12-OPS",
          command: "bun run operation-test",
          runner: "bun",
          runtime: "test",
          os: "linux",
          shell: "bash",
          scope: "operation_test",
          started_at: "2026-07-08T00:01:10.000Z",
          completed_at: "2026-07-08T00:01:20.000Z",
          exit_code: 0,
          evidence_path: "docs/evidence/operation-test.json",
          output_digest: "sha256:operation-test",
          green_definition_id: "operation-test",
          status: "passed",
        },
      });
      upsertRow(db, {
        table: "gate_runs",
        primaryKey: "gate_run_id",
        row: {
          gate_run_id: "gate:operation-test",
          gate_id: "operation_test",
          plan_id: "PLAN-L12-OPS",
          status: "passed",
          checked_at: "2026-07-08T00:01:30.000Z",
          evidence_path: "docs/evidence/operation-test-gate.json",
        },
      });

      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.operation_scope.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            scope: "operation_test",
            status: "observed",
            observedCount: 2,
            observationSources: [
              "gate_runs:docs/evidence/operation-test-gate.json",
              "test_runs:docs/evidence/operation-test.json",
            ],
          }),
        ]),
      );
    }));

  it("runtime verificationが設計済みでも未観測ならoperation regression guardをwatchにする", () =>
    withDb((db) => {
      for (const [declarationId, definedId, kind, layer, title] of [
        ["decl:log", "HOPS-LOG-01", "ログ設計", "L12", "operation log design"],
        ["decl:kpi", "HOPS-KPI-01", "KPI", "L12", "operation KPI metric"],
        ["decl:runtime", "HOPS-RUNTIME-01", "runtime verification", "L12", "runtime evidence"],
        ["decl:optest", "HOPS-OPTEST-01", "運用テスト", "L12", "operation test"],
        ["decl:contract", "HOPS-CONTRACT-01", "class/method contract", "L5", "class method"],
        [
          "decl:incident",
          "HOPS-VMFIT-INCIDENT-ROUTE-01",
          "障害時逆流 route",
          "L12",
          "incident recovery reverse route",
        ],
      ]) {
        upsertRow(db, {
          table: "design_declarations",
          primaryKey: "declaration_id",
          row: {
            declaration_id: declarationId,
            defined_id: definedId,
            declaration_kind: kind,
            title,
            layer,
            source_path: "docs/design/helix/L5-detailed-design/operation-scope.md",
            source: "frontmatter",
            indexed_at: "2026-07-08T00:00:00.000Z",
          },
        });
      }

      const snapshot = buildProjectCurrentLocationSnapshot(db);
      const fit = buildVmodelFitReport(snapshot);

      expect(snapshot.operation_scope).toMatchObject({
        designed: 6,
        observed: 0,
        observed_gap: 6,
        missing: 0,
        reverify: 0,
      });
      expect(fit.blockers.map((blocker) => blocker.code)).not.toContain("operation_scope");
      expect(fit.regression_guards.guards).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            guard_id: "operation-scope",
            status: "watch",
            count: 1,
            required_action:
              "runtime verification を accepted runtime evidence として観測し、運用時の可視化基盤を実証する",
            reasons: expect.arrayContaining(["runtime_observed=0"]),
          }),
        ]),
      );
    }));

  it("cross layerのDiscovery/Reverse/Recovery PLANをL12 canonicalへ機械再投影する", () =>
    withDb((db) => {
      const plans = [
        ["PLAN-DISCOVERY-01-workflow-metamodel", "completed"],
        ["PLAN-REVERSE-01-process-docs", "draft"],
        ["PLAN-RECOVERY-01-internal-asset-recovery", "completed"],
      ];
      for (const [planId, status] of plans) {
        upsertRow(db, {
          table: "plan_registry",
          primaryKey: "plan_id",
          row: {
            plan_id: planId,
            kind: "reverse",
            layer: "cross",
            drive: "agent",
            status,
            updated_at: "2026-07-08T00:00:00.000Z",
          },
        });
      }

      const snapshot = buildProjectCurrentLocationSnapshot(db);

      expect(snapshot.findings.map((finding) => finding.code)).not.toContain(
        "artifact_remap_unmapped",
      );
      expect(snapshot.artifact_remap.items).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            artifactId: "PLAN-DISCOVERY-01-workflow-metamodel",
            legacyLayer: "cross",
            l12Layer: "L3",
            status: "done",
            zipSourceBindingIds: expect.arrayContaining([
              "zip-source:l12-level-definition",
              "zip-source:catalog",
            ]),
            tailoringRuleIds: ["HVM-TAILOR-CORE-DESIGN"],
            tailoringDetailLevels: ["標準"],
          }),
          expect.objectContaining({
            artifactId: "PLAN-REVERSE-01-process-docs",
            legacyLayer: "cross",
            l12Layer: "L5",
            status: "reverify",
            zipSourceBindingIds: expect.arrayContaining([
              "zip-source:tailoring-design",
              "zip-source:spec-check-reference",
            ]),
            tailoringRuleIds: ["HVM-TAILOR-DETAIL-CONTRACT"],
            tailoringDetailLevels: ["詳細"],
          }),
          expect.objectContaining({
            artifactId: "PLAN-RECOVERY-01-internal-asset-recovery",
            legacyLayer: "cross",
            l12Layer: "L12",
            status: "done",
            zipSourceBindingIds: expect.arrayContaining([
              "zip-source:l12-level-definition",
              "zip-source:catalog",
              "zip-source:profiles",
            ]),
            tailoringRuleIds: ["HVM-TAILOR-OPERATION"],
            tailoringDetailLevels: ["標準"],
          }),
        ]),
      );
      expect(snapshot.artifact_remap.layers).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            layer: "L3",
            status: "done",
            artifactIds: ["PLAN-DISCOVERY-01-workflow-metamodel"],
          }),
          expect.objectContaining({
            layer: "L5",
            status: "reverify",
            artifactIds: ["PLAN-REVERSE-01-process-docs"],
          }),
          expect.objectContaining({
            layer: "L12",
            status: "done",
            artifactIds: ["PLAN-RECOVERY-01-internal-asset-recovery"],
          }),
        ]),
      );
      const reverifyBatch = buildProjectArtifactRemapBatchReport(snapshot, {
        layer: "L5",
        status: "reverify",
        limit: 5,
      });
      expect(reverifyBatch).toMatchObject({
        schema_version: "project-artifact-remap-batch.v1",
        selected_layer: "L5",
        selected_status: "reverify",
        total: 1,
        listed: 1,
        omitted: 0,
        counts: {
          done: 0,
          missing: 0,
          reverify: 1,
        },
        recommended_next_action: {
          model: "Reverse",
          command: "helix artifact-remap batch --status reverify --json",
          human_required: false,
        },
        write_policy: "read-only",
        source_command: "helix artifact-remap batch --json",
      });
      expect(reverifyBatch.items).toEqual([
        expect.objectContaining({
          artifactId: "PLAN-REVERSE-01-process-docs",
          legacyLayer: "cross",
          l12Layer: "L5",
          status: "reverify",
          zipSourceBindingIds: expect.arrayContaining([
            "zip-source:tailoring-design",
            "zip-source:spec-check-reference",
          ]),
          tailoringRuleIds: ["HVM-TAILOR-DETAIL-CONTRACT"],
          tailoringDetailLevels: ["詳細"],
          driveModel: "Reverse",
          docDependencies: ["docs/plans/PLAN-REVERSE-01-process-docs.md"],
        }),
      ]);
      expect(snapshot.coverage.l12_layers.find((layer) => layer.layer === "L3")).toMatchObject({
        status: "done",
        legacyLayers: ["cross"],
        planIds: ["PLAN-DISCOVERY-01-workflow-metamodel"],
      });
      expect(snapshot.coverage.l12_layers.find((layer) => layer.layer === "L5")).toMatchObject({
        status: "reverify",
        legacyLayers: ["cross"],
        planIds: ["PLAN-REVERSE-01-process-docs"],
      });
      expect(snapshot.coverage.l12_layers.find((layer) => layer.layer === "L12")).toMatchObject({
        status: "reverify",
        legacyLayers: ["cross"],
        planIds: ["PLAN-RECOVERY-01-internal-asset-recovery"],
      });
    }));
});
