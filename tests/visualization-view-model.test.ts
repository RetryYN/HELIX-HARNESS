import { describe, expect, it } from "vitest";
import type { ProjectCurrentLocationSnapshot } from "../src/state-db/current-location";
import type { VisualizationSnapshot } from "../src/state-db/visualization-read-model";
import {
  buildGraphIr,
  buildVisualizationViewModel,
} from "../src/state-db/visualization-view-model";

function zipAdoptionMatrix(): ProjectCurrentLocationSnapshot["zip_adoption"] {
  return {
    status: "complete",
    adopted: 5,
    complemented: 3,
    rejected: 1,
    missing: 0,
    sourcePackage: "ハイブリッド設計ドキュメントv1-fixed.zip",
    sourceDocument: "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
    docDependencies: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
    implementationDependencies: [
      "design_declarations",
      "design_references",
      "vmodel_zip_source_bindings",
      "project_current_location",
      "visualization_view_model",
      "visualization_tree_view",
    ],
    items: [
      {
        adoptionId: "HVM-ADOPT-01",
        category: "adopt",
        label: "YAML source and typed spec",
        status: "declared",
        declarationIds: ["HVM-ADOPT-01"],
        sourcePaths: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
        docDependencies: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
        implementationDependencies: [
          "design_declarations",
          "design_references",
          "vmodel_zip_source_bindings",
        ],
        reasons: ["ZIP 採用/補完/非採用判断が typed declaration として検出された"],
      },
      {
        adoptionId: "HVM-COMP-02",
        category: "complement",
        label: "Project view dynamic rendering",
        status: "declared",
        declarationIds: ["HVM-COMP-02"],
        sourcePaths: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
        docDependencies: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
        implementationDependencies: [
          "project_current_location",
          "visualization_view_model",
          "visualization_tree_view",
          "vmodel_zip_source_bindings",
        ],
        reasons: ["ZIP 採用/補完/非採用判断が typed declaration として検出された"],
      },
      {
        adoptionId: "HVM-REJECT-01",
        category: "reject",
        label: "Python and Excel generator are reference only",
        status: "declared",
        declarationIds: ["HVM-REJECT-01"],
        sourcePaths: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
        docDependencies: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
        implementationDependencies: ["design_declarations", "design_references"],
        reasons: ["ZIP 採用/補完/非採用判断が typed declaration として検出された"],
      },
    ],
  };
}

function tailoringGate(): ProjectCurrentLocationSnapshot["tailoring_gate"] {
  return {
    status: "pass",
    profile: "solo",
    required: 4,
    optional: 2,
    excluded: 2,
    missing_required: 0,
    sourceDocument: "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
    docDependencies: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
    implementationDependencies: ["design_declarations", "design_references"],
    items: [
      {
        tailoringId: "HVM-TAILOR-DETAIL-CONTRACT",
        category: "required",
        label: "detailed design contract",
        detailLevel: "詳細",
        status: "declared",
        declarationIds: ["HVM-TAILOR-DETAIL-CONTRACT"],
        sourcePaths: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
        docDependencies: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
        implementationDependencies: ["design_declarations", "design_references"],
        reasons: [
          "個人開発 tailoring profile の required/optional 契約が typed declaration として検出された",
        ],
      },
      {
        tailoringId: "HVM-TAILOR-DIAGRAMS",
        category: "optional",
        label: "diagrams",
        detailLevel: "簡易",
        status: "declared",
        declarationIds: ["HVM-TAILOR-DIAGRAMS"],
        sourcePaths: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
        docDependencies: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
        implementationDependencies: ["design_declarations", "design_references"],
        reasons: [
          "個人開発 tailoring profile の required/optional 契約が typed declaration として検出された",
        ],
      },
      {
        tailoringId: "HVM-TAILOR-MOBILE-DESKTOP-NA",
        category: "na",
        label: "mobile and desktop specific documents",
        detailLevel: "省略",
        status: "excluded",
        declarationIds: ["HVM-TAILOR-MOBILE-DESKTOP-NA"],
        sourcePaths: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
        docDependencies: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
        implementationDependencies: ["design_declarations", "design_references"],
        reasons: ["個人開発 tailoring profile で na として対象外にしたため missing にはしない"],
      },
    ],
  };
}

function acceptanceTraceability(
  status: ProjectCurrentLocationSnapshot["acceptance_traceability"]["status"] = "needs_trace",
): ProjectCurrentLocationSnapshot["acceptance_traceability"] {
  const items: ProjectCurrentLocationSnapshot["acceptance_traceability"]["items"] = [
    {
      acceptanceId: "HAC-VMFIT-01a",
      requirementId: "HR-FR-VMFIT-01",
      status: "linked",
      declarationIds: ["decl:HAC-VMFIT-01a"],
      sourcePaths: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      referenceIds: ["ref:HAC-VMFIT-01a:HR-FR-VMFIT-01"],
      referenceStatuses: ["resolved"],
      docDependencies: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      implementationDependencies: ["design_declarations", "design_references"],
      reasons: ["acceptance criteria が対象要件へ resolved reference で接続されている"],
    },
    {
      acceptanceId: "HAC-VMFIT-02a",
      requirementId: "HR-FR-VMFIT-02",
      status: status === "pass" ? "linked" : "declared",
      declarationIds: ["decl:HAC-VMFIT-02a"],
      sourcePaths: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      referenceIds: status === "pass" ? ["ref:HAC-VMFIT-02a:HR-FR-VMFIT-02"] : [],
      referenceStatuses: status === "pass" ? ["resolved"] : [],
      docDependencies: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      implementationDependencies: ["design_declarations", "design_references"],
      reasons:
        status === "pass"
          ? ["acceptance criteria が対象要件へ resolved reference で接続されている"]
          : ["acceptance criteria は宣言済みだが対象要件への resolved reference が無い"],
    },
    {
      acceptanceId: "HAC-VMFIT-03a",
      requirementId: "HR-FR-VMFIT-03",
      status: status === "pass" ? "linked" : "missing",
      declarationIds: status === "pass" ? ["decl:HAC-VMFIT-03a"] : [],
      sourcePaths:
        status === "pass" ? ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"] : [],
      referenceIds: status === "pass" ? ["ref:HAC-VMFIT-03a:HR-FR-VMFIT-03"] : [],
      referenceStatuses: status === "pass" ? ["resolved"] : [],
      docDependencies: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      implementationDependencies: ["design_declarations", "design_references"],
      reasons:
        status === "pass"
          ? ["acceptance criteria が対象要件へ resolved reference で接続されている"]
          : ["acceptance criteria の typed declaration が無い"],
    },
  ];
  return {
    status,
    items,
    total: items.length,
    linked: items.filter((item) => item.status === "linked").length,
    declared: items.filter((item) => item.status === "declared").length,
    missing: items.filter((item) => item.status === "missing").length,
    sourceDocument: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
    docDependencies: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
    implementationDependencies: ["design_declarations", "design_references"],
  };
}

function forwardCurrentLocation(): ProjectCurrentLocationSnapshot {
  return {
    schema_version: "project-current-location.v1",
    source_clock: "2026-07-01T00:00:00.000Z",
    current: {
      layer: "L7",
      l12_layer: "L6",
      status: "forward",
      completion_boundary: "open",
      roadmap_frontier: ["impl"],
    },
    counts: {
      plans_total: 4,
      open_l7_plans: 1,
      terminal_l14_plans: 0,
      design_declarations: 2,
      design_references: 1,
      design_impact: 2,
      unresolved_design_references: 0,
      design_declaration_drifts: 0,
      impl_ahead_obligations: 0,
      uncovered_roadmap_bands: 0,
    },
    coverage: {
      done: 1,
      missing: 10,
      reverify: 1,
      l12_layers: [
        {
          layer: "L1",
          label: "企画",
          status: "done",
          legacyLayers: ["L1"],
          planIds: ["PLAN-L1-fixture"],
          designIds: [],
          testDesignIds: [],
          reasons: ["terminal PLAN または typed declaration から再投影済み"],
        },
        {
          layer: "L6",
          label: "実装",
          status: "reverify",
          legacyLayers: ["L7"],
          planIds: ["PLAN-L7-fixture"],
          designIds: [],
          testDesignIds: [],
          reasons: ["open PLAN が残っている"],
        },
      ],
    },
    design_coverage_gate: {
      status: "needs_design",
      covered: 2,
      missing: 1,
      reverify: 0,
      docDependencies: ["docs/design/**", "docs/test-design/**"],
      implementationDependencies: ["design_declarations", "design_references"],
      items: [
        {
          coverageId: "L3-requirements-freeze",
          l12Layer: "L3",
          label: "要件凍結/機能要件",
          requiredKinds: ["機能要件", "要件", "要求"],
          acceptedLayers: ["L3"],
          status: "covered",
          declarationIds: ["HR-FR-001"],
          sourcePaths: ["docs/design/helix/L3-requirements/fixture.md"],
          returnRoute: "Forward",
          docDependencies: ["docs/design/helix/L3-requirements/fixture.md"],
          implementationDependencies: ["design_declarations", "design_references"],
          reasons: ["typed declaration が必須 coverage rule と accepted layer を満たしている"],
        },
        {
          coverageId: "L7-tdd-closure",
          l12Layer: "L7",
          label: "TDD closure / trace closure",
          requiredKinds: ["TDD closure", "closure", "trace"],
          acceptedLayers: ["L7"],
          status: "covered",
          declarationIds: ["HAT-VMFIT-L7-CLOSURE"],
          sourcePaths: ["docs/test-design/helix/fixture.md"],
          returnRoute: "Forward",
          docDependencies: ["docs/test-design/helix/fixture.md"],
          implementationDependencies: ["design_declarations", "design_references"],
          reasons: ["typed declaration が必須 coverage rule と accepted layer を満たしている"],
        },
        {
          coverageId: "L6-implementation-binding",
          l12Layer: "L6",
          label: "実装契約/implementation binding",
          requiredKinds: ["実装契約", "implementation contract", "implementation binding"],
          acceptedLayers: ["L6"],
          status: "missing",
          declarationIds: [],
          sourcePaths: [],
          returnRoute: "Reverse",
          docDependencies: ["docs/design/**", "docs/test-design/**"],
          implementationDependencies: ["design_declarations", "design_references"],
          reasons: ["必須 typed declaration が無く、heuristic-only では coverage 根拠にしない"],
        },
      ],
    },
    acceptance_traceability: acceptanceTraceability(),
    zip_adoption: zipAdoptionMatrix(),
    tailoring_gate: tailoringGate(),
    roadmap_position: {
      status: "frontier",
      rollup: {
        total_bands: 5,
        covered_bands: 4,
        parked_bands: 0,
        uncovered_bands: 0,
        total_gates: 2,
        reached_gates: 1,
        total_spans: 3,
        confirmed_spans: 2,
      },
      frontier: ["PLAN-L7-fixture"],
      current_band_ids: [],
      current_gate_ids: ["PLAN-L7-fixture:G-IMPL"],
      bands: [
        {
          bandId: "impl",
          name: "実装+谷 (L7)",
          status: "covered",
          l12Layers: ["L6", "L7"],
          coverageIds: ["L6-implementation-binding", "L7-tdd-closure"],
          coverageLabels: ["実装契約/implementation binding", "TDD closure / trace closure"],
          roadmapIds: ["PLAN-L7-fixture"],
          reasons: ["登録工程表が band を被覆している"],
        },
      ],
      gates: [
        {
          roadmapGateId: "roadmap-gate:fixture",
          planId: "PLAN-L7-fixture",
          gateId: "G-IMPL",
          totalSpans: 2,
          confirmedSpans: 1,
          reached: false,
          l12Layers: ["L6", "L7"],
          coverageIds: ["L6-implementation-binding", "L7-tdd-closure"],
          coverageLabels: ["実装契約/implementation binding", "TDD closure / trace closure"],
          status: "pending",
          reasons: ["gate 配下 span 1/2 のため工程表 frontier になる"],
        },
      ],
      docDependencies: ["docs/plans/PLAN-L7-fixture.md"],
      implementationDependencies: [
        "roadmap_rollups",
        "roadmap_band_coverage",
        "roadmap_gate_progress",
      ],
    },
    closure: {
      status: "open",
      l7_open_plan_ids: ["PLAN-L7-fixture"],
      terminal_l14_plan_ids: [],
      closure_evidence_ids: ["HAT-VMFIT-L7-CLOSURE"],
      required_evidence: [
        "open L7 PLAN を 0 件にする",
        "L7 TDD closure / trace closure declaration を維持する",
        "L14 claim は L12 運用テスト evidence と矛盾しないこと",
      ],
      docDependencies: ["docs/plans", "docs/design/**", "docs/test-design/**"],
      implementationDependencies: ["plan_registry", "design_declarations", "design_references"],
      remediation: {
        done: 1,
        missing: 0,
        reverify: 1,
        items: [
          {
            category: "l7_open_plan",
            label: "open L7 implementation/TDD work",
            status: "reverify",
            l12Layer: "L6",
            count: 1,
            subjectIds: ["PLAN-L7-fixture"],
            requiredAction:
              "各 L7 PLAN を設計/テスト設計依存へ戻し、実装・TDD closure・証跡の未閉鎖を解消する",
            docDependencies: ["docs/plans", "docs/design/**", "docs/test-design/**"],
            implementationDependencies: ["plan_registry"],
            reasons: ["open L7 PLAN は L12 canonical では L6 実装相当の再検証対象になる"],
          },
          {
            category: "closure_evidence",
            label: "L7 TDD/trace closure evidence",
            status: "done",
            l12Layer: "L7",
            count: 1,
            subjectIds: ["HAT-VMFIT-L7-CLOSURE"],
            requiredAction: "closure oracle を維持し、open L7 PLAN と実行証跡の照合に使う",
            docDependencies: ["docs/test-design/**"],
            implementationDependencies: ["design_declarations", "design_references"],
            reasons: ["L7 closure oracle は typed declaration として検出済み"],
          },
        ],
      },
      queue: {
        total: 1,
        items: [
          {
            planId: "PLAN-L7-fixture",
            kind: "add-impl",
            status: "draft",
            updatedAt: "2026-07-01T00:00:00.000Z",
            sourcePath: "docs/plans/PLAN-L7-fixture.md",
            l12Layer: "L6",
            coverageId: "L6-implementation-binding",
            coverageLabel: "実装契約/implementation binding",
            priority: 30,
            driveModel: "Reverse",
            remediationStatus: "reverify",
            nextAction: "repair_failed_evidence",
            requiredAction: "実装 delta を対応する設計/テスト設計/Green evidence に照合して閉じる",
            docDependencies: [
              "docs/plans/PLAN-L7-fixture.md",
              "docs/design/**",
              "docs/test-design/**",
            ],
            implementationDependencies: [
              "plan_registry",
              "design_declarations",
              "design_references",
            ],
            evidence: {
              status: "partial",
              artifactPaths: ["docs/plans/PLAN-L7-fixture.md"],
              traceEdges: 1,
              testRuns: {
                total: 1,
                passed: 0,
                failed: 1,
              },
              gateRuns: {
                total: 0,
                passed: 0,
                failed: 0,
              },
              runtimeVerification: {
                total: 0,
                accepted: 0,
              },
              evidencePaths: ["docs/evidence/PLAN-L7-fixture-test.json"],
            },
            evidenceGaps: [
              {
                component: "execution",
                status: "missing",
                evidenceTables: ["test_runs", "gate_runs", "runtime_verification_events"],
                requiredAction:
                  "passed test/gate/runtime verification のいずれかを追加して DB projection へ反映する",
              },
              {
                component: "test",
                status: "failed",
                evidenceTables: ["test_runs"],
                requiredAction:
                  "failed test を保持したまま修正後の passed test evidence を追加する",
              },
            ],
            evidenceAction: "失敗 evidence を修復する: execution:missing,test:failed",
            reasons: ["open L7 PLAN は L12 canonical では L6 実装相当の未閉鎖 queue item"],
          },
        ],
        route_counts: {
          close_ready: 0,
          collect_evidence: 0,
          repair_failed_evidence: 1,
          reverse_design: 0,
        },
      },
      packets: {
        total: 1,
        items: [
          {
            packetId: "closure:repair_failed_evidence",
            nextAction: "repair_failed_evidence",
            label: "修正/再検証 packet",
            driveModel: "Reverse",
            l12Layer: "L6",
            count: 1,
            planIds: ["PLAN-L7-fixture"],
            sourcePaths: ["docs/plans/PLAN-L7-fixture.md"],
            requiredAction:
              "失敗 test/gate evidence を修正し、再実行した green evidence を DB へ投影する",
            docDependencies: [
              "docs/plans/PLAN-L7-fixture.md",
              "docs/design/**",
              "docs/test-design/**",
            ],
            implementationDependencies: [
              "plan_registry",
              "design_declarations",
              "design_references",
            ],
            acceptanceCriteria: [
              "失敗 test/gate の原因を修正する",
              "再実行後の test/gate が passed として DB projection される",
              "失敗証跡を隠さず、再検証証跡と併存させる",
            ],
            automation: {
              batchId: "closure-batch:3:repair_failed_evidence",
              sequence: 3,
              machineFilter: "closure.queue.items[nextAction=repair_failed_evidence]",
              detectionSource: "harness.db",
              reviewCommand: "helix closure batch --action repair_failed_evidence --json",
              viewCommand: "helix progress tree-view --json",
              writePolicy: "read-only",
              expectedTransition: "修正と再検証後に close_ready へ再分類される",
              promotionGate:
                "失敗 evidence を保持したまま、最新の再実行 evidence が passed になっている",
              samplePlanIds: ["PLAN-L7-fixture"],
            },
            reasons: ["失敗 test/gate evidence があるため修正と再検証が必要"],
          },
        ],
      },
      next_action_ledger: {
        total: 1,
        status_counts: {
          ready: 0,
          needs_evidence: 0,
          needs_repair: 1,
          needs_reverse: 0,
        },
        write_policy: "read-only",
        source_command: "helix current-location --json",
        view_command: "helix progress tree-view --json",
        entries: [
          {
            ledgerId: "next-action:closure:repair_failed_evidence",
            packetId: "closure:repair_failed_evidence",
            nextAction: "repair_failed_evidence",
            status: "needs_repair",
            driveModel: "Reverse",
            l12Layer: "L6",
            count: 1,
            primaryCommand: "helix current-location --json",
            reviewSurface: "helix progress tree-view --json",
            writePolicy: "read-only",
            planIds: ["PLAN-L7-fixture"],
            samplePlanIds: ["PLAN-L7-fixture"],
            sourcePaths: ["docs/plans/PLAN-L7-fixture.md"],
            requiredAction:
              "失敗 test/gate evidence を修正し、再実行した green evidence を DB へ投影する",
            docDependencies: [
              "docs/plans/PLAN-L7-fixture.md",
              "docs/design/**",
              "docs/test-design/**",
            ],
            implementationDependencies: [
              "plan_registry",
              "design_declarations",
              "design_references",
            ],
            acceptanceCriteria: [
              "失敗 test/gate の原因を修正する",
              "再実行後の test/gate が passed として DB projection される",
              "失敗証跡を隠さず、再検証証跡と併存させる",
            ],
            evidencePolicy:
              "失敗 evidence を保持したまま修正後の passed evidence を追加し、再検証する",
            automation: {
              batchId: "closure-batch:3:repair_failed_evidence",
              sequence: 3,
              machineFilter: "closure.queue.items[nextAction=repair_failed_evidence]",
              detectionSource: "harness.db",
              reviewCommand: "helix closure batch --action repair_failed_evidence --json",
              viewCommand: "helix progress tree-view --json",
              writePolicy: "read-only",
              expectedTransition: "修正と再検証後に close_ready へ再分類される",
              promotionGate:
                "失敗 evidence を保持したまま、最新の再実行 evidence が passed になっている",
              samplePlanIds: ["PLAN-L7-fixture"],
            },
            humanRequired: false,
            reasons: ["失敗 test/gate evidence があるため修正と再検証が必要"],
          },
        ],
      },
    },
    operation_scope: {
      designed: 3,
      observed: 1,
      observed_gap: 3,
      missing: 1,
      reverify: 1,
      items: [
        {
          scope: "log_design",
          label: "ログ設計",
          coverageId: "L12-operation-observability",
          coverageLabel: "運用テスト/ログ/KPI/runtime",
          status: "designed",
          designIds: ["HOPS-LOG-01"],
          observedCount: 0,
          observationSources: [],
          evidenceTables: ["design_declarations", "runtime_verification_events"],
          reasons: ["typed declaration から設計済みとして検出した"],
        },
        {
          scope: "runtime_verification",
          label: "runtime verification",
          coverageId: "L12-operation-observability",
          coverageLabel: "運用テスト/ログ/KPI/runtime",
          status: "observed",
          designIds: ["HOPS-RUNTIME-01"],
          observedCount: 1,
          observationSources: ["docs/state/logs/runtime-verification.jsonl"],
          evidenceTables: ["design_declarations", "runtime_verification_events"],
          reasons: ["runtime_verified + accepted の runtime evidence がある"],
        },
        {
          scope: "operation_test",
          label: "運用テスト",
          coverageId: "L12-operation-observability",
          coverageLabel: "運用テスト/ログ/KPI/runtime",
          status: "missing",
          designIds: [],
          observedCount: 0,
          observationSources: [],
          evidenceTables: [
            "design_declarations",
            "test_runs",
            "gate_runs",
            "runtime_verification_events",
          ],
          reasons: ["typed declaration から検出できないため L12 運用後検証の gap とする"],
        },
        {
          scope: "class_method_contract",
          label: "class/method contract",
          coverageId: "L12-operation-observability",
          coverageLabel: "運用テスト/ログ/KPI/runtime",
          status: "reverify",
          designIds: ["HOPS-CONTRACT-01"],
          observedCount: 0,
          observationSources: [],
          evidenceTables: ["design_declarations", "runtime_verification_events"],
          reasons: ["runtime verification event はあるが accepted/runtime_verified ではない"],
        },
        {
          scope: "incident_recovery_route",
          label: "incident Recovery/Reverse route",
          coverageId: "L12-operation-observability",
          coverageLabel: "運用テスト/ログ/KPI/runtime",
          status: "designed",
          designIds: ["HOPS-VMFIT-INCIDENT-ROUTE-01"],
          observedCount: 0,
          observationSources: [],
          evidenceTables: [
            "design_declarations",
            "closure_next_action_ledger",
            "runtime_verification_events",
          ],
          reasons: ["typed declaration から設計済みとして検出した"],
        },
      ],
    },
    artifact_remap: {
      done: 1,
      missing: 1,
      reverify: 1,
      layers: [
        {
          layer: "L3",
          label: "要件凍結",
          status: "done",
          driveModel: "Forward",
          total: 1,
          done: 1,
          missing: 0,
          reverify: 0,
          artifactIds: ["HR-FR-001"],
          batchCommand: "helix artifact-remap batch --layer L3 --json",
          requiredAction: "再投影済み。Forward 継続時の参照根拠として使う",
          reasons: ["typed declaration として L12 canonical layer へ再投影済み"],
        },
        {
          layer: "L6",
          label: "実装",
          status: "reverify",
          driveModel: "Reverse",
          total: 1,
          done: 0,
          missing: 0,
          reverify: 1,
          artifactIds: ["PLAN-L7-fixture"],
          batchCommand: "helix artifact-remap batch --status reverify --layer L6 --json",
          requiredAction:
            "対象 artifact を設計/テスト設計依存へ戻し、ZIP coverage と evidence を再照合する",
          reasons: ["open PLAN のため L12 canonical layer では再検証要"],
        },
        {
          layer: "L7",
          label: "TDD closure",
          status: "missing",
          driveModel: "Reverse",
          total: 1,
          done: 0,
          missing: 1,
          reverify: 0,
          artifactIds: ["missing:L7"],
          batchCommand: "helix artifact-remap batch --status missing --layer L7 --json",
          requiredAction:
            "ZIP coverage に対応する typed declaration または PLAN evidence を追加する",
          reasons: ["旧成果物/typed declaration からの再投影 evidence がない"],
        },
      ],
      items: [
        {
          kind: "design",
          artifactId: "HR-FR-001",
          sourcePath: "docs/design/helix/L3-requirements/fixture.md",
          legacyLayer: "L3",
          l12Layer: "L3",
          coverageId: "L3-requirements-freeze",
          coverageLabel: "要件凍結/機能要件",
          status: "done",
          reasons: ["typed declaration として L12 canonical layer へ再投影済み"],
        },
        {
          kind: "gap",
          artifactId: "missing:L7",
          sourcePath: "harness.db/current-location",
          legacyLayer: null,
          l12Layer: "L7",
          coverageId: "L7-tdd-closure",
          coverageLabel: "TDD closure / trace closure",
          status: "missing",
          reasons: ["旧成果物/typed declaration からの再投影 evidence がない"],
        },
        {
          kind: "plan",
          artifactId: "PLAN-L7-fixture",
          sourcePath: "docs/plans",
          legacyLayer: "L7",
          l12Layer: "L6",
          coverageId: "L6-implementation-binding",
          coverageLabel: "実装契約/implementation binding",
          status: "reverify",
          reasons: ["open PLAN のため L12 canonical layer では再検証要"],
        },
      ],
    },
    findings: [],
    drive_recommendation: {
      model: "Forward",
      reason: "DB現在地と工程表に逆流要因がないため、原則Forwardを継続する",
      reverseTargets: [],
      docDependencies: [],
      implementationDependencies: [],
    },
    drive_route: {
      routeId: "drive:Forward:advance-roadmap-frontier",
      status: "forward_frontier",
      selectedModel: "Forward",
      defaultModel: "Forward",
      reason: "DB現在地と工程表に逆流要因がないため、原則Forwardを継続する",
      writePolicy: "read-only",
      sourceCommand: "helix current-location --json",
      viewCommand: "helix progress tree-view --json",
      mustReturnToDesign: false,
      forward: {
        allowed: true,
        roadmapStatus: "frontier",
        frontier: ["PLAN-L7-fixture"],
        currentBandIds: [],
        currentGateIds: ["PLAN-L7-fixture:G-IMPL"],
        coverageIds: ["L6-implementation-binding", "L7-tdd-closure"],
        coverageLabels: ["実装契約/implementation binding", "TDD closure / trace closure"],
      },
      reverse: {
        required: false,
        targets: [],
        l12Layers: ["L6", "L7"],
        coverageIds: ["L6-implementation-binding", "L7-tdd-closure"],
        coverageLabels: ["実装契約/implementation binding", "TDD closure / trace closure"],
        docDependencies: [],
        implementationDependencies: [],
        queueActions: [],
        ledgerIds: [],
        acceptanceCriteria: [],
      },
      reasons: ["工程表 status=frontier"],
    },
  };
}

function unknownCurrentLocation(): ProjectCurrentLocationSnapshot {
  return {
    ...forwardCurrentLocation(),
    source_clock: null,
    current: {
      layer: null,
      l12_layer: null,
      status: "unknown",
      completion_boundary: "open",
      roadmap_frontier: [],
    },
    counts: {
      plans_total: 0,
      open_l7_plans: 0,
      terminal_l14_plans: 0,
      design_declarations: 0,
      design_references: 0,
      design_impact: 0,
      unresolved_design_references: 0,
      design_declaration_drifts: 0,
      impl_ahead_obligations: 0,
      uncovered_roadmap_bands: 0,
    },
    coverage: {
      done: 0,
      missing: 0,
      reverify: 0,
      l12_layers: [],
    },
    design_coverage_gate: {
      status: "unknown",
      covered: 0,
      missing: 0,
      reverify: 0,
      items: [],
      docDependencies: [],
      implementationDependencies: [],
    },
    acceptance_traceability: {
      ...acceptanceTraceability(),
      status: "needs_trace",
      linked: 0,
      declared: 0,
      missing: 3,
      items: acceptanceTraceability().items.map((item) => ({
        ...item,
        status: "missing",
        declarationIds: [],
        sourcePaths: [],
        referenceIds: [],
        referenceStatuses: [],
        reasons: ["acceptance criteria の typed declaration が無い"],
      })),
    },
    zip_adoption: {
      ...zipAdoptionMatrix(),
      status: "missing",
      adopted: 0,
      complemented: 0,
      rejected: 0,
      missing: 9,
      items: [],
      docDependencies: [],
    },
    tailoring_gate: {
      ...tailoringGate(),
      status: "needs_tailoring",
      required: 0,
      optional: 0,
      excluded: 0,
      missing_required: 4,
      items: [],
      docDependencies: [],
    },
    roadmap_position: {
      status: "unknown",
      rollup: {
        total_bands: 0,
        covered_bands: 0,
        parked_bands: 0,
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
      docDependencies: [],
      implementationDependencies: [
        "roadmap_rollups",
        "roadmap_band_coverage",
        "roadmap_gate_progress",
      ],
    },
    closure: {
      status: "unknown",
      l7_open_plan_ids: [],
      terminal_l14_plan_ids: [],
      closure_evidence_ids: [],
      required_evidence: [],
      docDependencies: [],
      implementationDependencies: [],
      remediation: {
        done: 0,
        missing: 0,
        reverify: 0,
        items: [],
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
    },
    operation_scope: {
      designed: 0,
      observed: 0,
      observed_gap: 0,
      missing: 0,
      reverify: 0,
      items: [],
    },
    artifact_remap: {
      done: 0,
      missing: 0,
      reverify: 0,
      layers: [],
      items: [],
    },
    drive_route: {
      routeId: "drive:Forward:unknown-current-location",
      status: "unknown",
      selectedModel: "Forward",
      defaultModel: "Forward",
      reason: "DB現在地と工程表に逆流要因がないため、原則Forwardを継続する",
      writePolicy: "read-only",
      sourceCommand: "helix current-location --json",
      viewCommand: "helix progress tree-view --json",
      mustReturnToDesign: false,
      forward: {
        allowed: true,
        roadmapStatus: "unknown",
        frontier: [],
        currentBandIds: [],
        currentGateIds: [],
        coverageIds: [],
        coverageLabels: [],
      },
      reverse: {
        required: false,
        targets: [],
        l12Layers: [],
        coverageIds: [],
        coverageLabels: [],
        docDependencies: [],
        implementationDependencies: [],
        queueActions: [],
        ledgerIds: [],
        acceptanceCriteria: [],
      },
      reasons: ["current location is unknown"],
    },
  };
}

function nonZeroSnapshot(): VisualizationSnapshot {
  return {
    schema_version: "visualization-snapshot.v1",
    source_clock: "2026-07-01T00:00:00.000Z",
    progress: {
      artifacts: { total: 10, red: 2, yellow: 3, green: 5, unknown: 0 },
      plans: { total: 4, by_status: { confirmed: 3, draft: 1 } },
      gates: {
        total: 6,
        passed: 4,
        failed: 1,
        blocked: 1,
        other: 0,
        by_status: { passed: 4, failed: 1, blocked: 1 },
      },
    },
    graph: {
      nodes: 12,
      edges: 8,
      snapshots: 2,
      latest_snapshot_id: "snap-2",
      latest_snapshot_hash: "hash-2",
      latest_node_count: 12,
      latest_edge_count: 8,
    },
    evidence: {
      test_runs: { total: 20, passed: 18, failed: 2, other: 0 },
      runtime_verification: {
        total: 5,
        runtime_verified: 3,
        projection_only_unverified: 1,
        missing_runtime_provenance: 1,
        accepted: 3,
        blocked: 0,
        other: 2,
      },
      skill_invocations: { total: 7, accepted: 6 },
      model_runs: { total: 4 },
      guardrail_decisions: { total: 9, block: 1, allow: 7, human_required: 1 },
    },
    project_current_location: forwardCurrentLocation(),
    recovery_handoff_artifacts: {
      items: [],
      present: 0,
      missing: 0,
      unchecked: 0,
    },
    drilldowns: {
      artifact_progress_command: "helix progress artifacts --json",
      relation_graph_command: "helix graph export --format mermaid",
      runtime_verification_table: "runtime_verification_events",
      search_command: "helix find <query> --json",
    },
    warnings: [],
  };
}

function withThreeRepairQueueItems(snapshot: VisualizationSnapshot): VisualizationSnapshot {
  const current = snapshot.project_current_location;
  const base = current.closure.queue.items[0];
  const clone = (suffix: string): typeof base => ({
    ...base,
    planId: `PLAN-L7-fixture-${suffix}`,
    sourcePath: `docs/plans/PLAN-L7-fixture-${suffix}.md`,
    docDependencies: [`docs/plans/PLAN-L7-fixture-${suffix}.md`, "docs/design/**"],
    evidence: {
      ...base.evidence,
      artifactPaths: [`docs/plans/PLAN-L7-fixture-${suffix}.md`],
      evidencePaths: [`docs/evidence/PLAN-L7-fixture-${suffix}-test.json`],
    },
    reasons: [`fixture ${suffix} は同一 nextAction の multi-item 表示検査用`],
  });
  current.closure.queue.items = [base, clone("a"), clone("b")];
  current.closure.queue.total = 3;
  current.closure.queue.route_counts = {
    ...current.closure.queue.route_counts,
    repair_failed_evidence: 3,
  };
  return snapshot;
}

function emptySnapshot(): VisualizationSnapshot {
  return {
    schema_version: "visualization-snapshot.v1",
    source_clock: null,
    progress: {
      artifacts: { total: 0, red: 0, yellow: 0, green: 0, unknown: 0 },
      plans: { total: 0, by_status: {} },
      gates: { total: 0, passed: 0, failed: 0, blocked: 0, other: 0, by_status: {} },
    },
    graph: {
      nodes: 0,
      edges: 0,
      snapshots: 0,
      latest_snapshot_id: null,
      latest_snapshot_hash: null,
      latest_node_count: null,
      latest_edge_count: null,
    },
    evidence: {
      test_runs: { total: 0, passed: 0, failed: 0, other: 0 },
      runtime_verification: {
        total: 0,
        runtime_verified: 0,
        projection_only_unverified: 0,
        missing_runtime_provenance: 0,
        accepted: 0,
        blocked: 0,
        other: 0,
      },
      skill_invocations: { total: 0, accepted: 0 },
      model_runs: { total: 0 },
      guardrail_decisions: { total: 0, block: 0, allow: 0, human_required: 0 },
    },
    project_current_location: unknownCurrentLocation(),
    recovery_handoff_artifacts: {
      items: [],
      present: 0,
      missing: 0,
      unchecked: 0,
    },
    drilldowns: {
      artifact_progress_command: "helix progress artifacts --json",
      relation_graph_command: "helix graph export --format mermaid",
      runtime_verification_table: "runtime_verification_events",
      search_command: "helix find <query> --json",
    },
    warnings: ["artifact_progress is empty; run `helix db rebuild`"],
  };
}

describe("buildVisualizationViewModel", () => {
  it("U-VVM-001: returns 6 views + shared_warnings deterministically for a non-zero fixture snapshot", () => {
    const snapshot = nonZeroSnapshot();
    const first = buildVisualizationViewModel(snapshot);
    const second = buildVisualizationViewModel(nonZeroSnapshot());

    expect(first).toEqual(second);
    expect(first.project.current_location).toBeDefined();
    expect(first.project.layer_progress).toBeDefined();
    expect(first.project.design_test_pair).toBeDefined();
    expect(first.project.relation_graph).toBeDefined();
    expect(first.project.runtime_evidence).toBeDefined();
    expect(first.harness.harness_growth).toBeDefined();
    expect(first.harness.skill_agent_telemetry).toBeDefined();
    expect(first.view_boundaries.project).toMatchObject({
      root: "project",
      owned_views: expect.arrayContaining(["current_location", "layer_progress"]),
      source_fields: expect.arrayContaining([
        "project_current_location",
        "vmodel_zip_manifest",
        "vmodel_zip_source_bindings",
        "project_zip_adoption_decisions",
        "project_tailoring_decisions",
        "project_vmodel_regression_guards",
        "project_vmodel_fit_blockers",
        "project_vmodel_handoff_summary",
      ]),
      excluded_fields: expect.arrayContaining(["evidence.skill_invocations"]),
    });
    expect(first.view_boundaries.harness).toMatchObject({
      root: "harness",
      owned_views: expect.arrayContaining(["harness_growth", "skill_agent_telemetry"]),
      source_fields: expect.arrayContaining(["evidence.skill_invocations", "evidence.model_runs"]),
      excluded_fields: expect.arrayContaining([
        "project_current_location.vmodel_fit",
        "vmodel_zip_source_bindings",
        "project_zip_adoption_decisions",
        "project_tailoring_decisions",
        "project_vmodel_regression_guards",
        "project_vmodel_fit_blockers",
        "project_vmodel_handoff_summary",
      ]),
    });
    expect(Array.isArray(first.shared_warnings)).toBe(true);
    // input snapshot must remain untouched (no mutation side effect)
    expect(snapshot).toEqual(nonZeroSnapshot());
  });

  it("U-VVM-002: view counts match the corresponding snapshot fields", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);

    const artifactsTotalRow = vm.project.layer_progress.artifacts.find((r) => r.label === "total");
    expect(artifactsTotalRow?.value).toBe(snapshot.progress.artifacts.total);

    const gatesTotalRow = vm.project.layer_progress.gates.find((r) => r.label === "total");
    expect(gatesTotalRow?.value).toBe(snapshot.progress.gates.total);

    expect(vm.project.relation_graph.node_count).toBe(snapshot.graph.latest_node_count);
    expect(vm.project.relation_graph.edge_count).toBe(snapshot.graph.latest_edge_count);
    expect(vm.project.current_location).toMatchObject({
      layer: "L7",
      l12_layer: "L6",
      drive_model: "OperationVerification",
      drive_route: expect.objectContaining({
        route_id: "drive:Forward:advance-roadmap-frontier",
        status: "forward_frontier",
        selected_model: "Forward",
        default_model: "Forward",
        write_policy: "read-only",
        must_return_to_design: false,
        forward: {
          allowed: true,
          roadmap_status: "frontier",
          frontier: ["PLAN-L7-fixture"],
          current_band_ids: [],
          current_gate_ids: ["PLAN-L7-fixture:G-IMPL"],
          coverage_ids: ["L6-implementation-binding", "L7-tdd-closure"],
          coverage_labels: ["実装契約/implementation binding", "TDD closure / trace closure"],
        },
        reverse: expect.objectContaining({
          required: false,
          targets: [],
          coverage_ids: ["L6-implementation-binding", "L7-tdd-closure"],
          queue_actions: [],
          ledger_ids: [],
        }),
      }),
      roadmap_frontier: ["impl"],
      projection_counts: {
        design_declarations: 2,
        design_references: 1,
        design_impact: 2,
        unresolved_design_references: 0,
        design_declaration_drifts: 0,
      },
      coverage_counts: { done: 1, missing: 10, reverify: 1 },
      drive_model_candidates: expect.arrayContaining([
        expect.objectContaining({
          model: "OperationVerification",
          status: "selected",
          trigger:
            "ログ設計、runtime verification、class/method contract など L12 運用 scope の不足",
          command: "helix current-location --json",
          coverage_ids: ["L12-operation-observability"],
        }),
        expect.objectContaining({
          model: "Forward",
          trigger: "原則駆動モデル。blocker が無ければ工程表 frontier を前進させる",
          required_action:
            "roadmap current と design coverage が一致している範囲を Forward で進める",
          command: "helix roadmap current --json",
        }),
      ]),
      design_coverage_gate: expect.objectContaining({
        status: "needs_design",
        covered: 2,
        missing: 1,
        reverify: 0,
        items: [
          expect.objectContaining({
            coverage_id: "L3-requirements-freeze",
            status: "covered",
            return_route: "Forward",
          }),
          expect.objectContaining({
            coverage_id: "L7-tdd-closure",
            status: "covered",
            return_route: "Forward",
          }),
          expect.objectContaining({
            coverage_id: "L6-implementation-binding",
            status: "missing",
            return_route: "Reverse",
          }),
        ],
      }),
      acceptance_traceability: expect.objectContaining({
        status: "needs_trace",
        total: 3,
        linked: 1,
        declared: 1,
        missing: 1,
        items: [
          expect.objectContaining({
            acceptance_id: "HAC-VMFIT-01a",
            requirement_id: "HR-FR-VMFIT-01",
            status: "linked",
          }),
          expect.objectContaining({
            acceptance_id: "HAC-VMFIT-02a",
            requirement_id: "HR-FR-VMFIT-02",
            status: "declared",
          }),
          expect.objectContaining({
            acceptance_id: "HAC-VMFIT-03a",
            requirement_id: "HR-FR-VMFIT-03",
            status: "missing",
          }),
        ],
      }),
      recovery_exit: {
        status: "not_required",
        remaining_queue_items: 0,
        blocking_lanes: [],
        blockers: [],
        next_command: "helix drive model --json",
        expected_transition: "Recovery 以外の drive model selection に従う",
      },
      vmodel_fit: expect.objectContaining({
        status: "needs_fit",
        design_coverage_status: "needs_design",
        acceptance_traceability_status: "needs_trace",
        zip_adoption_status: "complete",
        zip_manifest_status: "advisory_missing",
        tailoring_gate_status: "pass",
        function_design_absorption: expect.objectContaining({
          status: "needs_absorption",
          independent_layer_policy: "abolished",
          detail_contract_coverage_status: "missing",
          tailoring_detail_contract_status: "declared",
          command: "helix current-location --json",
        }),
        roadmap_current_gate: expect.objectContaining({
          status: "pass",
          aligned: true,
          alignment_basis: "frontier",
          db_current_l12_layer: "L6",
          roadmap_current_l12_layers: ["L6", "L7"],
          roadmap_projected_l12_layers: ["L6", "L7"],
          roadmap_terminal_l12_layers: [],
          command: "helix roadmap current --json",
        }),
        drive_model_gate: expect.objectContaining({
          status: "pass",
          selected_model: "OperationVerification",
          selected_route_id: "drive:OperationVerification:verify-runtime-scope",
          selected_command: "helix current-location --json",
          selected_coverage_ids: expect.arrayContaining(["L12-operation-observability"]),
          candidate_count: 6,
          command: "helix drive model --json",
        }),
        current_location_status: "forward",
        completion_boundary: "open",
        drive_route_status: "forward_frontier",
        unresolved_design_references: 0,
        design_declaration_drifts: 0,
        regression_guards: expect.objectContaining({
          status: "needs_attention",
          pass: 3,
          watch: 1,
          fail: 4,
          guards: expect.arrayContaining([
            expect.objectContaining({
              guard_id: "zip-source-integrity",
              status: "watch",
              command: "helix doctor",
            }),
            expect.objectContaining({
              guard_id: "acceptance-traceability",
              status: "fail",
              command: "helix current-location --json",
            }),
            expect.objectContaining({
              guard_id: "operation-scope",
              status: "fail",
              command: "helix current-location --json",
            }),
          ]),
        }),
        handoff_summary: expect.objectContaining({
          status: "none",
          total: 0,
          machine_pending: 0,
          approval_pending: 0,
          scope_mismatch: 0,
          apply_ready: 0,
          reason_codes: [],
        }),
        blockers: [
          expect.objectContaining({
            code: "design_coverage",
            status: "needs_design",
            count: 1,
            command: "helix current-location --json",
          }),
          expect.objectContaining({
            code: "acceptance_traceability",
            status: "needs_trace",
            count: 2,
            command: "helix current-location --json",
          }),
          expect.objectContaining({
            code: "function_design_absorption",
            status: "needs_absorption",
            count: 1,
            command: "helix current-location --json",
          }),
          expect.objectContaining({
            code: "operation_scope",
            status: "needs_operation_design",
            count: 2,
            command: "helix current-location --json",
          }),
        ],
        source_command: "helix vmodel fit --summary-json",
        current_location_command: "helix current-location --summary-json",
        view_command: "helix progress tree-view --json",
        reasons: [
          "design coverage gate is needs_design",
          "ZIP adoption matrix is complete",
          "ZIP source archive is absent; manifest check is advisory",
          "ZIP inventory signature is advisory because source archive is absent",
          "ZIP source bindings are advisory because source archive is absent",
          "solo tailoring gate passed",
          "acceptance traceability gate is needs_trace",
          "function design absorption is needs_absorption",
          "roadmap current gate passed",
          "drive model gate passed selected=OperationVerification",
          "skill binding is missing",
          "operation scope gaps missing=1 reverify=1",
          "Scrum operation projection gate passed",
          "current location is forward-consistent",
          "design references resolved",
          "design declaration drift is zero",
        ],
      }),
      zip_adoption: expect.objectContaining({
        status: "complete",
        adopted: 5,
        complemented: 3,
        rejected: 1,
        missing: 0,
        source_package: "ハイブリッド設計ドキュメントv1-fixed.zip",
        source_document: "docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md",
        items: [
          expect.objectContaining({
            adoption_id: "HVM-ADOPT-01",
            category: "adopt",
            status: "declared",
          }),
          expect.objectContaining({
            adoption_id: "HVM-COMP-02",
            category: "complement",
            status: "declared",
          }),
          expect.objectContaining({
            adoption_id: "HVM-REJECT-01",
            category: "reject",
            status: "declared",
          }),
        ],
      }),
      zip_manifest: expect.objectContaining({
        status: "advisory_missing",
        present: false,
        entries_total: 0,
        required_present: 0,
        required_total: 0,
        source_bindings: expect.objectContaining({
          status: "advisory_missing",
          bound: 0,
          missing: 0,
          advisory: 0,
          evidence_tables: [],
          bindings: [],
        }),
        source_command: "helix doctor --json",
      }),
      tailoring_gate: expect.objectContaining({
        status: "pass",
        profile: "solo",
        required: 4,
        optional: 2,
        excluded: 2,
        missing_required: 0,
        source_document: "docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md",
        items: [
          expect.objectContaining({
            tailoring_id: "HVM-TAILOR-DETAIL-CONTRACT",
            category: "required",
            detail_level: "詳細",
            status: "declared",
          }),
          expect.objectContaining({
            tailoring_id: "HVM-TAILOR-DIAGRAMS",
            category: "optional",
            detail_level: "簡易",
            status: "declared",
          }),
          expect.objectContaining({
            tailoring_id: "HVM-TAILOR-MOBILE-DESKTOP-NA",
            category: "na",
            detail_level: "省略",
            status: "excluded",
          }),
        ],
      }),
      roadmap_position: expect.objectContaining({
        status: "frontier",
        frontier: ["PLAN-L7-fixture"],
        current_gate_ids: ["PLAN-L7-fixture:G-IMPL"],
        rollup: expect.objectContaining({
          total_bands: 5,
          reached_gates: 1,
          total_gates: 2,
        }),
        bands: [
          expect.objectContaining({
            band_id: "impl",
            status: "covered",
            l12_layers: ["L6", "L7"],
            coverage_ids: ["L6-implementation-binding", "L7-tdd-closure"],
            roadmap_ids: ["PLAN-L7-fixture"],
          }),
        ],
        gates: [
          expect.objectContaining({
            plan_id: "PLAN-L7-fixture",
            gate_id: "G-IMPL",
            status: "pending",
            reached: false,
            coverage_ids: ["L6-implementation-binding", "L7-tdd-closure"],
          }),
        ],
      }),
      closure_overview: expect.objectContaining({
        schema_version: "project-closure-overview.v1",
        status: "open",
        queue_total: 1,
        route_counts: {
          close_ready: 0,
          collect_evidence: 0,
          repair_failed_evidence: 1,
          reverse_design: 0,
        },
        ledger_status_counts: {
          ready: 0,
          needs_evidence: 0,
          needs_repair: 1,
          needs_reverse: 0,
        },
        recommended_next_action: {
          action: "repair_failed_evidence",
          reason: "失敗 test/gate evidence を修正し、再実行した green evidence を DB へ投影する",
          command: "helix closure review-bundle --action repair_failed_evidence --summary-json",
          human_required: false,
        },
        work_buckets: [
          expect.objectContaining({
            action: "repair_failed_evidence",
            evidence_signature: "execution:missing+test:failed",
            count: 1,
            primary_command: "helix closure batch --action repair_failed_evidence --json",
            evidence_handoff_artifacts: {
              probe_record_path: ".helix/tmp/closure/repair_failed_evidence-probe-record.json",
              approval_draft_path: ".helix/tmp/closure/repair_failed_evidence-approval-draft.yml",
              write_policy: "local-artifact-new-file",
            },
            repair_plan: expect.objectContaining({
              status: "needs_evidence",
              failed_evidence_count: 0,
              command_candidates: [],
              projection_items: [
                expect.objectContaining({
                  plan_id: "PLAN-L7-fixture",
                  failed_evidence_count: 0,
                  evidence_artifact_templates: expect.arrayContaining([
                    expect.objectContaining({
                      artifact_kind: "plan_review_evidence",
                      artifact_path: "docs/plans/PLAN-L7-fixture.md",
                    }),
                    expect.objectContaining({
                      artifact_kind: "structured_test_evidence",
                      artifact_path: "docs/evidence/PLAN-L7-fixture-test.json",
                    }),
                  ]),
                  projection_templates: expect.arrayContaining([
                    expect.objectContaining({ table: "test_runs" }),
                    expect.objectContaining({ table: "gate_runs" }),
                    expect.objectContaining({ table: "runtime_verification_events" }),
                  ]),
                }),
              ],
              projection_templates: expect.arrayContaining([
                expect.objectContaining({
                  table: "test_runs",
                  example_status: "passed",
                }),
                expect.objectContaining({
                  table: "gate_runs",
                  example_status: "passed",
                }),
                expect.objectContaining({
                  table: "runtime_verification_events",
                  example_status: "accepted",
                }),
              ]),
            }),
            sample_plan_ids: ["PLAN-L7-fixture"],
          }),
        ],
        source_command: "helix closure overview --summary-json",
        view_command: "helix progress tree-view --json",
      }),
      closure: expect.objectContaining({
        status: "open",
        l7_open_plan_ids: ["PLAN-L7-fixture"],
        closure_evidence_ids: ["HAT-VMFIT-L7-CLOSURE"],
        evidence_templates: expect.arrayContaining([
          expect.objectContaining({
            action: "repair_failed_evidence",
            count: 1,
            command: "helix closure evidence-plan --action repair_failed_evidence --summary-json",
            target_tables: expect.arrayContaining(["test_runs", "gate_runs"]),
            sample_plan_id: "PLAN-L7-fixture",
            templates: expect.arrayContaining([
              expect.objectContaining({
                table: "test_runs",
                example_status: "passed",
                required_fields: expect.arrayContaining(["plan_id", "status", "exit_code"]),
              }),
            ]),
          }),
        ]),
        evidence_apply: expect.objectContaining({
          action: "repair_failed_evidence",
          status: "blocked",
          materialize_readiness_status: "no_probe_execution",
          allowed_to_apply: false,
          approval_required: true,
          approval_valid: false,
          patch_candidate_count: 0,
          dry_run_command:
            "helix closure evidence-apply --dry-run --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
          execute_command:
            "helix closure evidence-apply --execute --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
          approval_draft_command:
            "helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
          write_policy: "approval-required",
        }),
        remediation: expect.objectContaining({
          done: 1,
          missing: 0,
          reverify: 1,
        }),
        queue: expect.objectContaining({
          total: 1,
          items: [
            expect.objectContaining({
              plan_id: "PLAN-L7-fixture",
              source_path: "docs/plans/PLAN-L7-fixture.md",
              l12_layer: "L6",
              coverage_id: "L6-implementation-binding",
              coverage_label: "実装契約/implementation binding",
              priority: 30,
              next_action: "repair_failed_evidence",
              evidence_action: "失敗 evidence を修復する: execution:missing,test:failed",
              evidence_gaps: [
                expect.objectContaining({
                  component: "execution",
                  status: "missing",
                }),
                expect.objectContaining({
                  component: "test",
                  status: "failed",
                }),
              ],
              evidence: expect.objectContaining({
                status: "partial",
                artifact_paths: ["docs/plans/PLAN-L7-fixture.md"],
                trace_edges: 1,
                test_runs: {
                  total: 1,
                  passed: 0,
                  failed: 1,
                },
              }),
            }),
          ],
        }),
        packets: expect.objectContaining({
          total: 1,
          items: [
            expect.objectContaining({
              packet_id: "closure:repair_failed_evidence",
              next_action: "repair_failed_evidence",
              count: 1,
            }),
          ],
        }),
        next_action_ledger: expect.objectContaining({
          total: 1,
          write_policy: "read-only",
          source_command: "helix current-location --json",
          view_command: "helix progress tree-view --json",
          status_counts: {
            ready: 0,
            needs_evidence: 0,
            needs_repair: 1,
            needs_reverse: 0,
          },
          entries: [
            expect.objectContaining({
              ledger_id: "next-action:closure:repair_failed_evidence",
              packet_id: "closure:repair_failed_evidence",
              next_action: "repair_failed_evidence",
              status: "needs_repair",
              primary_command: "helix current-location --json",
              review_surface: "helix progress tree-view --json",
              write_policy: "read-only",
              sample_plan_ids: ["PLAN-L7-fixture"],
            }),
          ],
        }),
        apply_readiness: {
          close_ready_count: 0,
          approval_required: false,
          dry_run_command:
            "helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit 20 --json",
          execute_command:
            "helix closure apply --execute --approval-record <approved-approval-record-path> --limit 20 --json",
          review_bundle_command: "helix closure review-bundle --action close_ready --summary-json",
          transition_plan_command:
            "helix closure transition-plan --action close_ready --summary-json",
          decision_draft_command:
            "helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft.yml --summary-json",
          review_window_command:
            "helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
          transition_window_command:
            "helix closure transition-plan --action close_ready --limit 20 --offset 0 --summary-json",
          write_policy: "approval-required",
          status: "no_close_ready_candidates",
          reasons: ["close_ready candidate が無いため apply 対象なし"],
        },
      }),
      operation_scope: expect.objectContaining({
        designed: 3,
        observed: 1,
        missing: 1,
        reverify: 1,
      }),
      artifact_remap: expect.objectContaining({
        done: 1,
        missing: 1,
        reverify: 1,
      }),
    });
    expect(vm.project.current_location.artifact_remap.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          artifact_id: "PLAN-L7-fixture",
          legacy_layer: "L7",
          l12_layer: "L6",
          coverage_id: "L6-implementation-binding",
          coverage_label: "実装契約/implementation binding",
          status: "reverify",
        }),
      ]),
    );
    expect(vm.project.current_location.artifact_remap.layers).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          layer: "L6",
          status: "reverify",
          drive_model: "Reverse",
          artifact_ids: ["PLAN-L7-fixture"],
          batch_command: "helix artifact-remap batch --status reverify --layer L6 --json",
        }),
        expect.objectContaining({
          layer: "L7",
          status: "missing",
          drive_model: "Reverse",
          artifact_ids: ["missing:L7"],
          batch_command: "helix artifact-remap batch --status missing --layer L7 --json",
        }),
      ]),
    );
    expect(vm.project.current_location.operation_scope.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          scope: "runtime_verification",
          status: "observed",
          coverage_id: "L12-operation-observability",
          coverage_label: "運用テスト/ログ/KPI/runtime",
          observed_count: 1,
          observation_sources: ["docs/state/logs/runtime-verification.jsonl"],
          evidence_tables: ["design_declarations", "runtime_verification_events"],
        }),
        expect.objectContaining({
          scope: "incident_recovery_route",
          status: "designed",
          coverage_id: "L12-operation-observability",
          design_ids: ["HOPS-VMFIT-INCIDENT-ROUTE-01"],
          evidence_tables: [
            "design_declarations",
            "closure_next_action_ledger",
            "runtime_verification_events",
          ],
        }),
      ]),
    );
    expect(vm.project.current_location.l12_coverage).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          layer: "L6",
          status: "reverify",
          legacy_layers: ["L7"],
        }),
      ]),
    );
    expect(vm.project.current_location.l12_compatibility).toMatchObject({
      status: "partial",
      layers: 2,
      expected_layers: 12,
      command: "helix current-location --json",
      pairs: expect.arrayContaining([
        expect.objectContaining({
          label: "implementation",
          legacy_layer: "L7",
          l12_layer: "L6",
          status: "bound",
          observed: 1,
          matched: 1,
          sample_artifact_ids: ["PLAN-L7-fixture"],
        }),
        expect.objectContaining({
          label: "l0_slide",
          legacy_layer: "L0",
          l12_layer: "L1",
          status: "not_observed",
        }),
      ]),
    });

    // §4 point 1: pair-filtered counts are not provided by the current
    // snapshot schema; must be null, not a fabricated 0 or total.
    expect(vm.project.design_test_pair.pair_edges).toBeNull();
    expect(vm.project.design_test_pair.orphan_nodes).toBeNull();
  });

  it("U-VVM-003: graph IR is deterministic, id-ordered, count-consistent, and marks cycle edges", () => {
    const nodes = [
      { id: "c", label: "C", group: "g" },
      { id: "a", label: "A", group: "g" },
      { id: "b", label: "B", group: "g" },
    ];
    const edges = [
      { from: "a", to: "b", kind: "dependency" },
      { from: "b", to: "c", kind: "dependency" },
      { from: "c", to: "a", kind: "dependency" },
    ];

    const first = buildGraphIr(nodes, edges);
    const second = buildGraphIr(nodes, edges);
    expect(first).toEqual(second);

    expect(first.nodes.map((n) => n.id)).toEqual(["a", "b", "c"]);
    expect(first.nodes.length).toBe(nodes.length);
    expect(first.edges.length).toBe(edges.length);
    expect(first.edges.every((e) => e.kind === "cycle")).toBe(true);

    const noCycle = buildGraphIr(nodes, [{ from: "a", to: "b", kind: "dependency" }]);
    expect(noCycle.edges[0]?.kind).toBe("dependency");

    // Relation view honestly degrades: raw lists unavailable in the current
    // snapshot schema, so its IR is empty and flagged via shared_warnings
    // rather than fabricated to match the declared counts.
    const vm = buildVisualizationViewModel(nonZeroSnapshot());
    expect(vm.project.relation_graph.graph).toEqual({ nodes: [], edges: [] });
    expect(
      vm.shared_warnings.some((w) => w.startsWith("relation_graph: raw node/edge lists")),
    ).toBe(true);
  });

  it("U-VVM-004: empty snapshot yields all-zero views plus shared empty-state banners, no fabricated data", () => {
    const snapshot = emptySnapshot();
    const vm = buildVisualizationViewModel(snapshot);

    for (const r of vm.project.layer_progress.artifacts) expect(r.value).toBe(0);
    expect(vm.project.relation_graph.node_count).toBe(0);
    expect(vm.project.relation_graph.edge_count).toBe(0);
    for (const r of vm.project.runtime_evidence.test_runs) expect(r.value).toBe(0);
    for (const r of vm.harness.skill_agent_telemetry.skill_invocations) expect(r.value).toBe(0);

    // existing snapshot warning preserved, not overwritten
    expect(vm.shared_warnings).toContain("artifact_progress is empty; run `helix db rebuild`");
    // graph/evidence/skill empty-state banners appended to the shared banner
    expect(vm.shared_warnings.some((w) => w.startsWith("relation_graph has no recorded"))).toBe(
      true,
    );
    expect(vm.shared_warnings.some((w) => w.startsWith("runtime_evidence has no recorded"))).toBe(
      true,
    );
    expect(
      vm.shared_warnings.some((w) => w.startsWith("skill_agent_telemetry has no recorded")),
    ).toBe(true);
  });

  it("U-VVM-005: runtime evidence view separates runtime_verified / projection_only_unverified / missing_runtime_provenance from accepted", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);
    const rows = vm.project.runtime_evidence.runtime_verification;

    const find = (label: string) => rows.find((r) => r.label === label)?.value;
    expect(find("runtime_verified")).toBe(snapshot.evidence.runtime_verification.runtime_verified);
    expect(find("projection_only_unverified")).toBe(
      snapshot.evidence.runtime_verification.projection_only_unverified,
    );
    expect(find("missing_runtime_provenance")).toBe(
      snapshot.evidence.runtime_verification.missing_runtime_provenance,
    );
    expect(find("accepted")).toBe(snapshot.evidence.runtime_verification.accepted);
    // accepted must not silently absorb projection-only / missing-provenance rows
    expect(find("accepted")).not.toBe(snapshot.evidence.runtime_verification.total);
  });

  it("U-VVM-006: growth series is empty with a warning when snapshot has no history, and current values are reproducible from snapshot", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);

    expect(vm.harness.harness_growth.growth_series).toEqual([]);
    expect(
      vm.shared_warnings.some((w) => w.startsWith("harness_growth: historical growth series")),
    ).toBe(true);

    const currentTotal = vm.harness.harness_growth.current.find(
      (r) => r.label === "total" && r.value === snapshot.progress.artifacts.total,
    );
    expect(currentTotal).toBeDefined();
    expect(vm.harness.harness_growth.current_sections.artifacts[0]).toMatchObject({
      label: "total",
      value: snapshot.progress.artifacts.total,
    });
  });

  it("uses current repair queue count for Project view evidence commands", () => {
    const vm = buildVisualizationViewModel(withThreeRepairQueueItems(nonZeroSnapshot()));
    const currentLocation = vm.project.current_location;

    expect(currentLocation.closure_overview.work_buckets[0]).toMatchObject({
      action: "repair_failed_evidence",
      count: 3,
      listed: 3,
      evidence_probe_command:
        "helix closure evidence-probe --action repair_failed_evidence --limit 3 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
      evidence_materialize_command:
        "helix closure evidence-materialize --action repair_failed_evidence --limit 3 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json",
      evidence_apply_dry_run_command:
        "helix closure evidence-apply --dry-run --action repair_failed_evidence --limit 3 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
    });
    expect(currentLocation.closure.evidence_apply).toMatchObject({
      action: "repair_failed_evidence",
      dry_run_command:
        "helix closure evidence-apply --dry-run --action repair_failed_evidence --limit 3 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
      execute_command:
        "helix closure evidence-apply --execute --action repair_failed_evidence --limit 3 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
      approval_draft_command:
        "helix closure evidence-approval-draft --action repair_failed_evidence --limit 3 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
    });
  });

  it("U-VVM-007: every drilldown is either a snapshot-defined pointer or explicitly null, never an absolute path", () => {
    const snapshot = nonZeroSnapshot();
    const vm = buildVisualizationViewModel(snapshot);
    const knownPointers = new Set<string>(Object.values(snapshot.drilldowns));

    const allRows: Array<{ drilldown: { kind: string; pointer: string } | null }> = [
      ...vm.project.layer_progress.artifacts,
      ...vm.project.layer_progress.plans,
      ...vm.project.layer_progress.gates,
      ...vm.project.runtime_evidence.test_runs,
      ...vm.project.runtime_evidence.runtime_verification,
      ...vm.project.runtime_evidence.guardrail_decisions,
      ...vm.harness.skill_agent_telemetry.skill_invocations,
      ...vm.harness.skill_agent_telemetry.model_runs,
      ...vm.harness.harness_growth.current,
      { drilldown: vm.project.relation_graph.drilldown },
    ];

    for (const r of allRows) {
      if (r.drilldown === null) continue;
      expect(knownPointers.has(r.drilldown.pointer)).toBe(true);
      expect(r.drilldown.pointer.startsWith("/")).toBe(false);
    }
  });
});
