import { describe, expect, it } from "vitest";
import type { ProjectCurrentLocationSnapshot } from "../src/state-db/current-location";
import type { VisualizationSnapshot } from "../src/state-db/visualization-read-model";
import { buildVisualizationViewModel } from "../src/state-db/visualization-view-model";
import { buildVisualizationTreeView } from "../src/vscode/tree-view-provider";

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

function acceptanceTraceability(): ProjectCurrentLocationSnapshot["acceptance_traceability"] {
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
      status: "declared",
      declarationIds: ["decl:HAC-VMFIT-02a"],
      sourcePaths: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      referenceIds: [],
      referenceStatuses: [],
      docDependencies: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      implementationDependencies: ["design_declarations", "design_references"],
      reasons: ["acceptance criteria は宣言済みだが対象要件への resolved reference が無い"],
    },
    {
      acceptanceId: "HAC-VMFIT-03a",
      requirementId: "HR-FR-VMFIT-03",
      status: "missing",
      declarationIds: [],
      sourcePaths: [],
      referenceIds: [],
      referenceStatuses: [],
      docDependencies: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
      implementationDependencies: ["design_declarations", "design_references"],
      reasons: ["acceptance criteria の typed declaration が無い"],
    },
  ];
  return {
    status: "needs_trace",
    items,
    total: items.length,
    linked: 1,
    declared: 1,
    missing: 1,
    sourceDocument: "docs/test-design/helix/vmodel-docgen-fit-acceptance.md",
    docDependencies: ["docs/test-design/helix/vmodel-docgen-fit-acceptance.md"],
    implementationDependencies: ["design_declarations", "design_references"],
  };
}

function currentLocation(): ProjectCurrentLocationSnapshot {
  return {
    schema_version: "project-current-location.v1",
    source_clock: "2026-07-08T00:00:00.000Z",
    current: {
      layer: "L14",
      l12_layer: "L12",
      status: "needs_recovery",
      completion_boundary: "contradicted",
      roadmap_frontier: [],
    },
    counts: {
      plans_total: 2,
      open_l7_plans: 1,
      terminal_l14_plans: 1,
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
      missing: 1,
      reverify: 2,
      l12_layers: [
        {
          layer: "L3",
          label: "要件凍結",
          status: "done",
          legacyLayers: ["L3"],
          planIds: ["PLAN-L3-fixture"],
          designIds: ["HR-FR-001"],
          testDesignIds: [],
          reasons: ["terminal PLAN または typed declaration から再投影済み"],
        },
        {
          layer: "L6",
          label: "実装",
          status: "reverify",
          legacyLayers: ["L7"],
          planIds: ["PLAN-L7-open"],
          designIds: [],
          testDesignIds: [],
          reasons: ["open PLAN が残っている"],
        },
        {
          layer: "L7",
          label: "TDD closure",
          status: "missing",
          legacyLayers: [],
          planIds: [],
          designIds: [],
          testDesignIds: [],
          reasons: ["旧成果物/typed declaration からの再投影 evidence がない"],
        },
        {
          layer: "L12",
          label: "運用テスト",
          status: "reverify",
          legacyLayers: ["L14"],
          planIds: ["PLAN-L14-close"],
          designIds: [],
          testDesignIds: ["HAT-OPS-001"],
          reasons: ["L14 到達済み claim と未了 L7 が同時に存在する"],
        },
      ],
    },
    design_coverage_gate: {
      status: "needs_design",
      covered: 1,
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
    scrum_operation: {
      status: "active",
      sourcePackage: "ハイブリッド設計ドキュメントv1-fixed.zip",
      sourceBindings: [
        "zip-source:scrum-product-backlog",
        "zip-source:scrum-sprint-plan",
        "zip-source:scrum-acceptance",
      ],
      backlogItems: 2,
      sprintItems: 1,
      acceptanceItems: 2,
      activeSprintPlans: 1,
      docDependencies: [
        "docs/112_プロダクトバックログ.yaml",
        "docs/116_スプリント計画.yaml",
        "docs/29_受入基準・BDDシナリオ.yaml",
      ],
      implementationDependencies: [
        "design_declarations",
        "plan_registry",
        "project_current_location",
      ],
      reasons: ["ハイブリッド版の Scrum 運営層を DB 現在地の補助軸として検出した"],
      items: [
        {
          operationId: "scrum:product-backlog",
          category: "backlog",
          status: "observed",
          declarationIds: ["US-03", "US-04"],
          planIds: [],
          sourcePaths: ["docs/112_プロダクトバックログ.yaml"],
          docDependencies: ["docs/112_プロダクトバックログ.yaml"],
          implementationDependencies: ["design_declarations"],
          reasons: ["Scrum 運営層の typed declaration を DB から検出した"],
        },
        {
          operationId: "scrum:active-plan",
          category: "plan",
          status: "observed",
          declarationIds: [],
          planIds: ["PLAN-DISCOVERY-99-hybrid-sprint"],
          sourcePaths: ["docs/plans/PLAN-DISCOVERY-99-hybrid-sprint.md"],
          docDependencies: ["docs/plans/PLAN-DISCOVERY-99-hybrid-sprint.md"],
          implementationDependencies: ["plan_registry"],
          reasons: ["active Scrum/Discovery PLAN を plan_registry から検出した"],
        },
      ],
    },
    skill_binding: {
      status: "ready",
      sourcePackage: "ハイブリッド設計ドキュメントv1-fixed.zip",
      selectedModel: "Recovery",
      workflowModes: ["Recovery", "Scrum"],
      l12Layers: ["L3", "L7", "L12"],
      requiredSkills: 2,
      recommendedSkills: 0,
      optionalSkills: 0,
      command: "helix skill suggest --plan <active-plan-path>",
      sourceBindings: [
        "zip-source:scrum-product-backlog",
        "zip-source:scrum-sprint-plan",
        "zip-source:scrum-acceptance",
      ],
      docDependencies: [
        "docs/skills/SKILL_MAP.md",
        "docs/skills/planning-and-task-breakdown.md",
        "docs/skills/harness-observability.md",
      ],
      implementationDependencies: [
        "automation_assets",
        "skill_recommendations",
        "design_declarations",
        "plan_registry",
      ],
      reasons: [
        "selected_model=Recovery",
        "workflow_modes=Recovery,Scrum",
        "skill 本文を一括 load せず catalog metadata から read-only 推奨を生成した",
      ],
      items: [
        {
          skillId: "skill:planning-and-task-breakdown",
          skillPath: "docs/skills/planning-and-task-breakdown.md",
          tier: "required",
          injectAt: "before_work",
          rank: 1,
          score: 0.95,
          matchedDriveModels: ["Scrum"],
          matchedLayers: ["L3", "L7"],
          sourceDriveModels: ["Forward", "Scrum", "Discovery"],
          sourceLayers: ["L1", "L3", "L5", "L6", "L7"],
          reasons: ["drive_model=Scrum", "l12_layer=L3,L7", "scrum_or_planning_signal"],
        },
        {
          skillId: "skill:harness-observability",
          skillPath: "docs/skills/harness-observability.md",
          tier: "required",
          injectAt: "before_work",
          rank: 2,
          score: 0.9,
          matchedDriveModels: ["Recovery"],
          matchedLayers: ["L12"],
          sourceDriveModels: ["Forward", "Add-feature", "Discovery", "Recovery"],
          sourceLayers: ["L5", "L6", "L7", "L8", "L11", "L12", "L13", "L14"],
          reasons: ["drive_model=Recovery", "l12_layer=L12", "quality_or_verification_signal"],
        },
      ],
    },
    roadmap_position: {
      status: "uncovered",
      rollup: {
        total_bands: 5,
        covered_bands: 4,
        parked_bands: 0,
        uncovered_bands: 1,
        total_gates: 2,
        reached_gates: 1,
        total_spans: 3,
        confirmed_spans: 2,
      },
      frontier: ["impl", "PLAN-L7-open"],
      current_band_ids: ["impl"],
      current_gate_ids: ["PLAN-L7-open:G-IMPL"],
      bands: [
        {
          bandId: "impl",
          name: "実装+谷 (L7)",
          status: "uncovered",
          l12Layers: ["L6", "L7"],
          coverageIds: ["L6-implementation-binding", "L7-tdd-closure"],
          coverageLabels: ["実装契約/implementation binding", "TDD closure / trace closure"],
          roadmapIds: [],
          reasons: ["工程表未登録の forward work として current frontier になる"],
        },
        {
          bandId: "verification",
          name: "検証 (結合〜運用 L8-L14)",
          status: "covered",
          l12Layers: ["L8", "L9", "L10", "L11", "L12"],
          coverageIds: [
            "L8-unit-test-design",
            "L9-integration-test-design",
            "L10-system-test-design",
            "L11-acceptance-test-design",
            "L12-operation-observability",
          ],
          coverageLabels: [
            "単体テスト設計",
            "結合テスト設計",
            "総合テスト設計",
            "受入テスト設計",
            "運用テスト/ログ/KPI/runtime",
          ],
          roadmapIds: ["PLAN-L14-close"],
          reasons: ["登録工程表が band を被覆している"],
        },
      ],
      gates: [
        {
          roadmapGateId: "roadmap-gate:open",
          planId: "PLAN-L7-open",
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
      docDependencies: ["docs/plans/PLAN-L7-open.md", "docs/plans/PLAN-L14-close.md"],
      implementationDependencies: [
        "roadmap_rollups",
        "roadmap_band_coverage",
        "roadmap_gate_progress",
      ],
    },
    closure: {
      status: "contradicted",
      l7_open_plan_ids: ["PLAN-L7-open"],
      terminal_l14_plan_ids: ["PLAN-L14-close"],
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
        reverify: 2,
        items: [
          {
            category: "l7_open_plan",
            label: "open L7 implementation/TDD work",
            status: "reverify",
            l12Layer: "L6",
            count: 1,
            subjectIds: ["PLAN-L7-open"],
            requiredAction:
              "各 L7 PLAN を設計/テスト設計依存へ戻し、実装・TDD closure・証跡の未閉鎖を解消する",
            docDependencies: ["docs/plans", "docs/design/**", "docs/test-design/**"],
            implementationDependencies: ["plan_registry"],
            reasons: ["open L7 PLAN は L12 canonical では L6 実装相当の再検証対象になる"],
          },
          {
            category: "l14_claim",
            label: "terminal L14 completion claims",
            status: "reverify",
            l12Layer: "L12",
            count: 1,
            subjectIds: ["PLAN-L14-close"],
            requiredAction: "L14 claim を L7 closure と L12 運用テスト evidence に再照合する",
            docDependencies: ["docs/plans", "docs/test-design/**"],
            implementationDependencies: ["plan_registry", "runtime_verification_events"],
            reasons: ["L14 claim と open L7 PLAN が同時に存在するため完了 claim は再検証対象"],
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
            planId: "PLAN-L7-open",
            kind: "add-impl",
            status: "draft",
            updatedAt: "2026-07-08T00:00:00.000Z",
            sourcePath: "docs/plans/PLAN-L7-open.md",
            l12Layer: "L6",
            coverageId: "L6-implementation-binding",
            coverageLabel: "実装契約/implementation binding",
            priority: 30,
            driveModel: "Reverse",
            remediationStatus: "reverify",
            nextAction: "repair_failed_evidence",
            requiredAction: "実装 delta を対応する設計/テスト設計/Green evidence に照合して閉じる",
            docDependencies: [
              "docs/plans/PLAN-L7-open.md",
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
              artifactPaths: ["docs/plans/PLAN-L7-open.md"],
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
              evidencePaths: ["docs/evidence/PLAN-L7-open-test.json"],
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
            planIds: ["PLAN-L7-open"],
            sourcePaths: ["docs/plans/PLAN-L7-open.md"],
            requiredAction:
              "失敗 test/gate evidence を修正し、再実行した green evidence を DB へ投影する",
            docDependencies: [
              "docs/plans/PLAN-L7-open.md",
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
              samplePlanIds: ["PLAN-L7-open"],
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
            planIds: ["PLAN-L7-open"],
            samplePlanIds: ["PLAN-L7-open"],
            sourcePaths: ["docs/plans/PLAN-L7-open.md"],
            requiredAction:
              "失敗 test/gate evidence を修正し、再実行した green evidence を DB へ投影する",
            docDependencies: [
              "docs/plans/PLAN-L7-open.md",
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
              samplePlanIds: ["PLAN-L7-open"],
            },
            humanRequired: false,
            reasons: ["失敗 test/gate evidence があるため修正と再検証が必要"],
          },
        ],
      },
    },
    operation_scope: {
      designed: 2,
      observed: 1,
      observed_gap: 2,
      missing: 1,
      reverify: 0,
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
          scope: "class_method_contract",
          label: "class/method contract",
          coverageId: "L12-operation-observability",
          coverageLabel: "運用テスト/ログ/KPI/runtime",
          status: "missing",
          designIds: [],
          observedCount: 0,
          observationSources: [],
          evidenceTables: ["design_declarations", "runtime_verification_events"],
          reasons: ["typed declaration から検出できないため L12 運用後検証の gap とする"],
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
          layer: "L1",
          label: "企画",
          status: "missing",
          driveModel: "Reverse",
          total: 0,
          done: 0,
          missing: 0,
          reverify: 0,
          artifactIds: [],
          batchCommand: "helix artifact-remap batch --status missing --layer L1 --json",
          requiredAction:
            "ZIP coverage に対応する typed declaration または PLAN evidence を追加する",
          reasons: ["L12 canonical layer に再投影できる artifact が未検出"],
        },
        {
          layer: "L2",
          label: "要求+画面",
          status: "missing",
          driveModel: "Reverse",
          total: 0,
          done: 0,
          missing: 0,
          reverify: 0,
          artifactIds: [],
          batchCommand: "helix artifact-remap batch --status missing --layer L2 --json",
          requiredAction:
            "ZIP coverage に対応する typed declaration または PLAN evidence を追加する",
          reasons: ["L12 canonical layer に再投影できる artifact が未検出"],
        },
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
          layer: "L4",
          label: "基本設計",
          status: "missing",
          driveModel: "Reverse",
          total: 0,
          done: 0,
          missing: 0,
          reverify: 0,
          artifactIds: [],
          batchCommand: "helix artifact-remap batch --status missing --layer L4 --json",
          requiredAction:
            "ZIP coverage に対応する typed declaration または PLAN evidence を追加する",
          reasons: ["L12 canonical layer に再投影できる artifact が未検出"],
        },
        {
          layer: "L5",
          label: "詳細設計+テスト設計",
          status: "missing",
          driveModel: "Reverse",
          total: 0,
          done: 0,
          missing: 0,
          reverify: 0,
          artifactIds: [],
          batchCommand: "helix artifact-remap batch --status missing --layer L5 --json",
          requiredAction:
            "ZIP coverage に対応する typed declaration または PLAN evidence を追加する",
          reasons: ["L12 canonical layer に再投影できる artifact が未検出"],
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
          artifactIds: ["PLAN-L7-open"],
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
        ...["L8", "L9", "L10", "L11", "L12"].map((layer) => ({
          layer,
          label:
            layer === "L8"
              ? "単体テスト"
              : layer === "L9"
                ? "結合テスト"
                : layer === "L10"
                  ? "総合テスト"
                  : layer === "L11"
                    ? "受入テスト"
                    : "運用テスト",
          status: "missing" as const,
          driveModel: (layer === "L12" ? "Recovery" : "Reverse") as "Recovery" | "Reverse",
          total: 0,
          done: 0,
          missing: 0,
          reverify: 0,
          artifactIds: [],
          batchCommand: `helix artifact-remap batch --status missing --layer ${layer} --json`,
          requiredAction:
            "ZIP coverage に対応する typed declaration または PLAN evidence を追加する",
          reasons: ["L12 canonical layer に再投影できる artifact が未検出"],
        })),
      ],
      items: [
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
          artifactId: "PLAN-L7-open",
          sourcePath: "docs/plans",
          legacyLayer: "L7",
          l12Layer: "L6",
          coverageId: "L6-implementation-binding",
          coverageLabel: "実装契約/implementation binding",
          status: "reverify",
          reasons: ["open PLAN のため L12 canonical layer では再検証要"],
        },
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
      ],
    },
    findings: [
      {
        code: "l14_claim_with_l7_work",
        severity: "error",
        detail: "L14 claim and L7 work coexist",
        docDependencies: ["docs/plans"],
        implementationDependencies: ["plan_registry"],
      },
    ],
    drive_recommendation: {
      model: "Recovery",
      reason:
        "L14 claim と L7/open work が矛盾している。現在地を回復し、closure evidence と L12 claim を再照合してからForwardへ戻す",
      reverseTargets: ["docs/design/**", "docs/test-design/**"],
      docDependencies: ["docs/design", "docs/test-design"],
      implementationDependencies: ["plan_registry"],
    },
    drive_route: {
      routeId: "drive:Recovery:recover-current-location",
      status: "recovery_required",
      selectedModel: "Recovery",
      defaultModel: "Forward",
      reason:
        "L14 claim と L7/open work が矛盾している。現在地を回復し、closure evidence と L12 claim を再照合してからForwardへ戻す",
      writePolicy: "read-only",
      sourceCommand: "helix current-location --json",
      viewCommand: "helix progress tree-view --json",
      mustReturnToDesign: true,
      forward: {
        allowed: false,
        roadmapStatus: "uncovered",
        frontier: ["impl", "PLAN-L7-open"],
        currentBandIds: ["impl"],
        currentGateIds: ["PLAN-L7-open:G-IMPL"],
        coverageIds: ["L6-implementation-binding", "L7-tdd-closure"],
        coverageLabels: ["実装契約/implementation binding", "TDD closure / trace closure"],
      },
      reverse: {
        required: true,
        targets: ["docs/design/**", "docs/test-design/**"],
        l12Layers: ["L5", "L6", "L7", "L12"],
        coverageIds: [
          "L5-detailed-contract",
          "L6-implementation-binding",
          "L7-tdd-closure",
          "L12-operation-observability",
        ],
        coverageLabels: [
          "詳細設計/class-method contract",
          "実装契約/implementation binding",
          "TDD closure / trace closure",
          "運用テスト/ログ/KPI/runtime",
        ],
        docDependencies: ["docs/plans/PLAN-L7-open.md", "docs/design/**", "docs/test-design/**"],
        implementationDependencies: ["plan_registry", "design_declarations"],
        queueActions: ["repair_failed_evidence"],
        ledgerIds: ["next-action:closure:repair_failed_evidence"],
        acceptanceCriteria: ["失敗 test/gate の原因を修正する"],
      },
      reasons: ["error:l14_claim_with_l7_work"],
    },
  };
}

function snapshot(): VisualizationSnapshot {
  return {
    schema_version: "visualization-snapshot.v1",
    source_clock: "2026-07-08T00:00:00.000Z",
    progress: {
      artifacts: { total: 3, red: 1, yellow: 1, green: 1, unknown: 0 },
      plans: { total: 2, by_status: { confirmed: 1, draft: 1 } },
      gates: { total: 1, passed: 1, failed: 0, blocked: 0, other: 0, by_status: { passed: 1 } },
    },
    graph: {
      nodes: 2,
      edges: 1,
      snapshots: 1,
      latest_snapshot_id: "graph:latest",
      latest_snapshot_hash: "sha256:graph",
      latest_node_count: 2,
      latest_edge_count: 1,
    },
    evidence: {
      test_runs: { total: 1, passed: 1, failed: 0, other: 0 },
      runtime_verification: {
        total: 1,
        runtime_verified: 1,
        projection_only_unverified: 0,
        missing_runtime_provenance: 0,
        accepted: 1,
        blocked: 0,
        other: 0,
      },
      skill_invocations: { total: 1, accepted: 1 },
      model_runs: { total: 1 },
      guardrail_decisions: { total: 1, block: 0, allow: 1, human_required: 0 },
    },
    project_current_location: currentLocation(),
    recovery_handoff_artifacts: {
      items: [
        {
          action: "repair_failed_evidence",
          kind: "probe_record",
          path: ".helix/tmp/closure/repair_failed_evidence-probe-record.json",
          status: "present",
          generation_status: "present",
          generation_command:
            "helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
          bytes: 20164,
          sha256: "sha256:probe",
          write_policy: "local-artifact-new-file",
          approval_record: null,
          reasons: ["handoff artifact を repoRoot から検出した"],
        },
        {
          action: "repair_failed_evidence",
          kind: "approval_draft",
          path: ".helix/tmp/closure/repair_failed_evidence-approval-draft.yml",
          status: "missing",
          generation_status: "ready_to_generate",
          generation_command:
            "helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
          bytes: null,
          sha256: null,
          write_policy: "local-artifact-new-file",
          approval_record: {
            status: "missing",
            decision_id: null,
            outcome: null,
            approval_scope_digest: null,
            expected_approval_scope_digest: null,
            scope_status: "missing",
            materialize_status: null,
            reviewed_candidate_count: null,
            valid_for_apply: false,
            reasons: ["approval draft artifact が存在しない"],
          },
          reasons: ["handoff artifact はまだ生成されていない"],
        },
      ],
      present: 1,
      missing: 1,
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

function findTreeNode(
  tree: ReturnType<typeof buildVisualizationTreeView>,
  id: string,
): ReturnType<typeof buildVisualizationTreeView>["roots"][number] | undefined {
  const queue = [...tree.roots];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;
    if (current.id === id) return current;
    queue.push(...current.children);
  }
  return undefined;
}

describe("visualization Tree View adapter", () => {
  it("U-VTREE-001: builds deterministic Project/HARNESS roots with current-location and L12 coverage nodes", () => {
    const vm = buildVisualizationViewModel(snapshot());
    const first = buildVisualizationTreeView(vm);
    const second = buildVisualizationTreeView(buildVisualizationViewModel(snapshot()));

    expect(first).toEqual(second);
    expect(first.schema_version).toBe("visualization-tree-view.v1");
    expect(first.roots.map((root) => root.id)).toEqual(["project", "harness"]);

    const project = first.roots[0];
    expect(project?.label).toBe("Project");
    const projectBoundary = project?.children.find((child) => child.id === "project/view-boundary");
    expect(projectBoundary).toMatchObject({
      label: "View boundary",
      contextValue: "view-boundary.project",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix progress tree-view --summary-json"],
      },
    });
    expect(projectBoundary?.tooltip).toContain("source=project_current_location");
    expect(projectBoundary?.tooltip).toContain("excluded=evidence.skill_invocations");
    const harness = first.roots[1];
    expect(harness?.label).toBe("HARNESS");
    const harnessBoundary = harness?.children.find((child) => child.id === "harness/view-boundary");
    expect(harnessBoundary).toMatchObject({
      label: "View boundary",
      contextValue: "view-boundary.harness",
    });
    expect(harnessBoundary?.tooltip).toContain(
      "source=progress,graph,evidence.skill_invocations,evidence.model_runs",
    );
    expect(harnessBoundary?.tooltip).toContain("excluded=project_current_location.vmodel_fit");

    const current = project?.children.find((child) => child.id === "project/current-location");
    expect(current).toMatchObject({
      label: "Current location",
      description: "L14 -> L12 / needs_recovery",
      contextValue: "current-location.needs_recovery",
      collapsibleState: "expanded",
    });
    const drive = current?.children.find((child) => child.id === "project/current-location/drive");
    expect(drive).toMatchObject({
      label: "Drive model",
      description: "Recovery / recovery_required",
    });
    expect(drive?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/drive/model-candidates:helix drive model --json",
      "project/current-location/drive/recovery-plan:blocked remaining=1",
      "project/current-location/drive/route:return-to-design L5-detailed-contract,L6-implementation-binding,L7-tdd-closure,L12-operation-observability",
      "project/current-location/drive/reverse:L5/L6/L7/L12 L5-detailed-contract,L6-implementation-binding,L7-tdd-closure,L12-operation-observability actions=repair_failed_evidence",
      "project/current-location/drive/forward:blocked",
    ]);
    expect(drive?.children[2]?.tooltip).toContain(
      "reverse_coverage=L5-detailed-contract,L6-implementation-binding,L7-tdd-closure,L12-operation-observability",
    );
    expect(drive?.children[3]?.tooltip).toContain(
      "coverage=L5-detailed-contract,L6-implementation-binding,L7-tdd-closure,L12-operation-observability",
    );
    expect(drive?.children[3]?.children.map((child) => `${child.id}:${child.description}`)).toEqual(
      [
        "project/current-location/drive/reverse/doc-dependencies:3",
        "project/current-location/drive/reverse/implementation-dependencies:2",
        "project/current-location/drive/reverse/closure-links:1/1",
      ],
    );
    expect(drive?.children[3]?.children[0]?.tooltip).toContain("docs/design/**");
    expect(drive?.children[3]?.children[1]?.tooltip).toContain("design_declarations");
    expect(drive?.children[3]?.children[2]?.tooltip).toContain("action=repair_failed_evidence");
    expect(drive?.children[0]?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: ["helix drive model --summary-json"],
    });
    expect(drive?.children[0]?.children.map((child) => `${child.id}:${child.description}`)).toEqual(
      [
        "project/current-location/drive/model-candidates/1-Recovery:selected L5-detailed-contract,L6-implementation-binding,L7-tdd-closure,L12-operation-observability",
        "project/current-location/drive/model-candidates/2-Reverse:blocked L5-detailed-contract,L6-implementation-binding,L7-tdd-closure,L12-operation-observability",
        "project/current-location/drive/model-candidates/3-OperationVerification:blocked L12-operation-observability",
        "project/current-location/drive/model-candidates/4-Forward:blocked L6-implementation-binding,L7-tdd-closure",
        "project/current-location/drive/model-candidates/5-Additive:blocked L3-requirements-freeze,L6-implementation-binding,L7-tdd-closure",
        "project/current-location/drive/model-candidates/6-Refactor:blocked L5-detailed-contract",
      ],
    );
    expect(drive?.children[0]?.children[0]?.tooltip).toContain(
      "trigger=L14 claim と L7/open evidence の矛盾",
    );
    expect(drive?.children[0]?.children[3]?.tooltip).toContain(
      "action=roadmap current と design coverage が一致している範囲を Forward で進める",
    );
    expect(drive?.children[1]?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: ["helix recovery plan --summary-json"],
    });
    expect(drive?.children[1]?.children.map((child) => `${child.id}:${child.description}`)).toEqual(
      [
        "project/current-location/drive/recovery-plan/exit-forecast:blocked remaining=1 lanes=repair_failed_evidence",
        "project/current-location/drive/recovery-plan/reentry-forecast:machine_phase_pending blocking=1",
        "project/current-location/drive/recovery-plan/automation-runway:machine_work_available machine=1 approval=0",
        "project/current-location/drive/recovery-plan/automation-boundaries:evidence_required:1",
        "project/current-location/drive/recovery-plan/repair_failed_evidence:1 needs_repair human=false",
      ],
    );
    const automationRunway = drive?.children[1]?.children.find(
      (child) => child.id === "project/current-location/drive/recovery-plan/automation-runway",
    );
    expect(automationRunway?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/drive/recovery-plan/automation-runway/1-repair_failed_evidence:machine count=1 remaining=0",
    ]);
    expect(drive?.children[2]?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: ["helix current-location --summary-json"],
    });
    expect(drive?.children[4]?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: ["helix progress tree-view --summary-json"],
    });

    const coverage = current?.children.find(
      (child) => child.id === "project/current-location/coverage",
    );
    expect(coverage?.description).toBe("done=1 missing=1 reverify=2");
    expect(coverage?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/coverage/L3:done",
      "project/current-location/coverage/L6:reverify",
      "project/current-location/coverage/L7:missing",
      "project/current-location/coverage/L12:reverify",
    ]);
    const handoff = current?.children.find(
      (child) => child.id === "project/current-location/recovery-handoff-artifacts",
    );
    expect(handoff).toMatchObject({
      label: "Recovery handoff artifacts",
      description: "present=1 missing=1 unchecked=0",
    });
    expect(handoff?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/recovery-handoff-artifacts/repair_failed_evidence/probe_record:present present 20164B",
      "project/current-location/recovery-handoff-artifacts/repair_failed_evidence/approval_draft:missing ready_to_generate -B",
    ]);
    const designGate = current?.children.find(
      (child) => child.id === "project/current-location/design-coverage-gate",
    );
    expect(designGate).toMatchObject({
      label: "Design coverage gate",
      description: "needs_design covered=1 missing=1 reverify=0",
      contextValue: "design-coverage-gate.needs_design",
    });
    expect(designGate?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/design-coverage-gate/L3-requirements-freeze:covered route=Forward",
      "project/current-location/design-coverage-gate/L6-implementation-binding:missing route=Reverse",
    ]);
    const acceptanceTrace = current?.children.find(
      (child) => child.id === "project/current-location/acceptance-traceability",
    );
    expect(acceptanceTrace).toMatchObject({
      label: "Acceptance traceability",
      description: "needs_trace linked=1/3 declared=1 missing=1",
      contextValue: "current-location.acceptance-traceability.needs_trace",
    });
    expect(acceptanceTrace?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/acceptance-traceability/HAC-VMFIT-01a:linked -> HR-FR-VMFIT-01",
      "project/current-location/acceptance-traceability/HAC-VMFIT-02a:declared -> HR-FR-VMFIT-02",
      "project/current-location/acceptance-traceability/HAC-VMFIT-03a:missing -> HR-FR-VMFIT-03",
    ]);
    const designImpact = current?.children.find(
      (child) => child.id === "project/current-location/design-impact",
    );
    expect(designImpact).toMatchObject({
      label: "Design impact",
      description: "impact=2 refs=1",
      contextValue: "current-location.design-impact.resolved",
    });
    expect(designImpact?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/design-impact/declarations:2",
      "project/current-location/design-impact/references:1",
      "project/current-location/design-impact/impact:2",
      "project/current-location/design-impact/unresolved:0",
      "project/current-location/design-impact/drift:0",
    ]);
    const vmodelFit = current?.children.find(
      (child) => child.id === "project/current-location/vmodel-fit",
    );
    expect(vmodelFit).toMatchObject({
      label: "V-model fit",
      description:
        "needs_fit design=needs_design ac=needs_trace zip=complete manifest=advisory_missing tailoring=pass function=needs_absorption roadmap=needs_sync drive=Recovery current=needs_recovery handoff=machine_pending",
      contextValue: "current-location.vmodel-fit.needs_fit",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix vmodel fit --summary-json"],
      },
    });
    expect(vmodelFit?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/vmodel-fit/synthesis:needs_fit common=1 complement=1 reject=1",
      "project/current-location/vmodel-fit/next-actions:6",
      "project/current-location/vmodel-fit/handoff-summary:machine_pending total=1 approval=0 mismatch=0 apply=0",
      "project/current-location/vmodel-fit/regression-guards:needs_attention pass=1 watch=2 fail=4",
      "project/current-location/vmodel-fit/design-coverage:needs_design",
      "project/current-location/vmodel-fit/zip-adoption:complete",
      "project/current-location/vmodel-fit/zip-manifest:advisory_missing",
      "project/current-location/vmodel-fit/tailoring-gate:pass",
      "project/current-location/vmodel-fit/function-design-absorption:needs_absorption policy=abolished",
      "project/current-location/vmodel-fit/roadmap-current:needs_sync aligned=false correlation=independent basis=frontier",
      "project/current-location/vmodel-fit/drive-model:Recovery/pass L5-detailed-contract,L6-implementation-binding,L7-tdd-closure,L12-operation-observability",
      "project/current-location/vmodel-fit/current-location:needs_recovery/contradicted",
      "project/current-location/vmodel-fit/recovery-runway:machine_work_available machine=1 approval=0",
      "project/current-location/vmodel-fit/recovery-handoff:generate_approval_draft phase=machine approval=missing scope=missing valid=false",
      "project/current-location/vmodel-fit/approval-review:none count=0 listed=0",
      "project/current-location/vmodel-fit/design-integrity:unresolved=0 drift=0",
      "project/current-location/vmodel-fit/blockers:6",
    ]);
    const approvalReview = vmodelFit?.children.find(
      (child) => child.id === "project/current-location/vmodel-fit/approval-review",
    );
    expect(approvalReview?.tooltip).toContain("close_ready approval lane は未検出");
    expect(approvalReview?.tooltip).toContain("decision=closure-review:close_ready");
    expect(approvalReview?.tooltip).toContain("tests=0/0");
    expect(approvalReview?.tooltip).toContain(
      "transition-window=helix closure transition-plan --action close_ready --limit 20 --offset 0 --summary-json",
    );
    expect(approvalReview?.tooltip).toContain(
      "outcome-route=reject_to_collect_evidence->collect_evidence drive=Recovery",
    );
    const recoveryRunway = vmodelFit?.children.find(
      (child) => child.id === "project/current-location/vmodel-fit/recovery-runway",
    );
    expect(recoveryRunway?.tooltip).toContain("blocking=1");
    expect(recoveryRunway?.tooltip).toContain("after_machine=0");
    expect(recoveryRunway?.tooltip).toContain("next=repair_failed_evidence");
    expect(recoveryRunway?.children?.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/vmodel-fit/recovery-runway/1-repair_failed_evidence:machine count=1 listed=1 remaining=0",
    ]);
    expect(recoveryRunway?.children?.[0]?.tooltip).toContain(
      "signature=execution:missing+test:failed",
    );
    expect(recoveryRunway?.children?.[0]?.tooltip).toContain("plans=PLAN-L7-open");
    expect(recoveryRunway?.children?.[0]?.tooltip).toContain(
      "probe=helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
    );
    const vmodelNextActions = vmodelFit?.children.find(
      (child) => child.id === "project/current-location/vmodel-fit/next-actions",
    );
    const currentLocationNextAction = vmodelNextActions?.children.find(
      (child) =>
        child.id === "project/current-location/vmodel-fit/next-actions/20-current_location",
    );
    expect(currentLocationNextAction?.children[0]).toMatchObject({
      id: "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket",
      label: "work bucket",
      contextValue: "vmodel-fit.next-action.work-bucket.needs_evidence",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: [
          "helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
        ],
      },
    });
    expect(
      currentLocationNextAction?.children[0]?.children?.map(
        (child) => `${child.id}:${child.description}`,
      ),
    ).toEqual([
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/handoff-next:generate_approval_draft approval=missing scope=missing valid=false",
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/probe:helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/probe-record:present present 20164B",
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/approval-draft-artifact:missing ready_to_generate -B",
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/materialize:helix closure evidence-materialize --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json",
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/approval-draft:helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/apply-dry-run:helix closure evidence-apply --dry-run --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
    ]);
    const vmodelRegressionGuards = vmodelFit?.children.find(
      (child) => child.id === "project/current-location/vmodel-fit/regression-guards",
    );
    expect(vmodelRegressionGuards?.tooltip).toContain("db=project_vmodel_regression_guards");
    expect(
      vmodelRegressionGuards?.children.map((child) => `${child.id}:${child.description}`),
    ).toEqual([
      "project/current-location/vmodel-fit/regression-guards/zip-source-integrity:watch count=0",
      "project/current-location/vmodel-fit/regression-guards/acceptance-traceability:fail count=2",
      "project/current-location/vmodel-fit/regression-guards/design-coverage:fail count=1",
      "project/current-location/vmodel-fit/regression-guards/implementation-binding:fail count=1",
      "project/current-location/vmodel-fit/regression-guards/trace-impact-integrity:pass count=0",
      "project/current-location/vmodel-fit/regression-guards/operation-scope:fail count=1",
      "project/current-location/vmodel-fit/regression-guards/current-location-reentry:watch count=1",
    ]);
    expect(vmodelRegressionGuards?.children[3]?.tooltip).toContain(
      "db=project_vmodel_regression_guards",
    );
    const vmodelBlockers = vmodelFit?.children.find(
      (child) => child.id === "project/current-location/vmodel-fit/blockers",
    );
    expect(vmodelBlockers?.tooltip).toContain("db=project_vmodel_fit_blockers");
    expect(vmodelBlockers?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/vmodel-fit/blockers/design_coverage:needs_design count=1",
      "project/current-location/vmodel-fit/blockers/acceptance_traceability:needs_trace count=2",
      "project/current-location/vmodel-fit/blockers/function_design_absorption:needs_absorption count=1",
      "project/current-location/vmodel-fit/blockers/roadmap_current:needs_sync count=3",
      "project/current-location/vmodel-fit/blockers/operation_scope:needs_operation_design count=1",
      "project/current-location/vmodel-fit/blockers/current_location:needs_recovery count=1",
    ]);
    expect(vmodelBlockers?.children[5]?.tooltip).toContain("db=project_vmodel_fit_blockers");
    const zipAdoption = current?.children.find(
      (child) => child.id === "project/current-location/zip-adoption",
    );
    expect(zipAdoption).toMatchObject({
      label: "ZIP adoption",
      description: "complete adopt=5 complement=3 reject=1 missing=0",
      contextValue: "current-location.zip-adoption.complete",
      tooltip: expect.stringContaining("db=project_zip_adoption_decisions"),
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md"],
      },
    });
    expect(zipAdoption?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/zip-adoption/adopt/HVM-ADOPT-01:adopt/declared",
      "project/current-location/zip-adoption/complement/HVM-COMP-02:complement/declared",
      "project/current-location/zip-adoption/reject/HVM-REJECT-01:reject/declared",
    ]);
    expect(zipAdoption?.children[1]?.tooltip).toContain("db=project_zip_adoption_decisions");
    expect(zipAdoption?.children[1]?.tooltip).toContain("visualization_tree_view");
    const skillBinding = current?.children.find(
      (child) => child.id === "project/current-location/skill-binding",
    );
    expect(skillBinding).toMatchObject({
      label: "Skill binding",
      description: "ready req=2 rec=0 opt=0",
      contextValue: "current-location.skill-binding.ready",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix skill suggest --plan <active-plan-path>"],
      },
    });
    expect(skillBinding?.tooltip).toContain("workflow=Recovery,Scrum");
    expect(skillBinding?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/skill-binding/1-skill:planning-and-task-breakdown:required 0.95 before_work",
      "project/current-location/skill-binding/2-skill:harness-observability:required 0.90 before_work",
    ]);
    expect(skillBinding?.children[0]?.tooltip).toContain(
      "docs/skills/planning-and-task-breakdown.md",
    );
    const scrumOperation = current?.children.find(
      (child) => child.id === "project/current-location/scrum-operation",
    );
    expect(scrumOperation).toMatchObject({
      label: "Scrum operation",
      description: "active backlog=2 sprint=1 ac=2 active=1",
      contextValue: "current-location.scrum-operation.active",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix current-location --summary-json"],
      },
    });
    expect(scrumOperation?.tooltip).toContain("zip-source:scrum-product-backlog");
    expect(scrumOperation?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/scrum-operation/scrum:product-backlog:backlog/observed",
      "project/current-location/scrum-operation/scrum:active-plan:plan/observed",
    ]);
    expect(scrumOperation?.children[0]?.tooltip).toContain("docs/112_プロダクトバックログ.yaml");
    const zipManifest = current?.children.find(
      (child) => child.id === "project/current-location/zip-manifest",
    );
    expect(zipManifest).toMatchObject({
      label: "ZIP manifest",
      description: "advisory_missing entries=0 required=0/0",
      contextValue: "current-location.zip-manifest.advisory_missing",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix doctor --summary-json"],
      },
    });
    const zipSourceBindings = zipManifest?.children.find(
      (child) => child.id === "project/current-location/zip-manifest/source-bindings",
    );
    expect(zipSourceBindings).toMatchObject({
      label: "source bindings",
      description: "advisory_missing bound=0 missing=0",
      contextValue: "zip-manifest.source-bindings.advisory_missing",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix vmodel fit --summary-json"],
      },
    });
    const tailoring = current?.children.find(
      (child) => child.id === "project/current-location/tailoring-gate",
    );
    expect(tailoring).toMatchObject({
      label: "Tailoring gate",
      description: "pass required=4 optional=2 na=2 missing=0",
      contextValue: "current-location.tailoring-gate.pass",
      tooltip: expect.stringContaining("db=project_tailoring_decisions"),
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md"],
      },
    });
    expect(tailoring?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/tailoring-gate/required/HVM-TAILOR-DETAIL-CONTRACT:required/詳細/declared",
      "project/current-location/tailoring-gate/optional/HVM-TAILOR-DIAGRAMS:optional/簡易/declared",
      "project/current-location/tailoring-gate/na/HVM-TAILOR-MOBILE-DESKTOP-NA:na/省略/excluded",
    ]);
    expect(tailoring?.children[0]?.tooltip).toContain("db=project_tailoring_decisions");
    expect(tailoring?.children[0]?.tooltip).toContain("design_declarations");
    const roadmap = current?.children.find(
      (child) => child.id === "project/current-location/roadmap-position",
    );
    expect(roadmap).toMatchObject({
      label: "Roadmap position",
      description: "uncovered bands=4/5 gates=1/2",
      contextValue: "current-location.roadmap-position.uncovered",
    });
    expect(roadmap?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/roadmap-position/current-sync:route=drive:Recovery:recover-current-location",
      "project/current-location/roadmap-position/bands:current=impl",
      "project/current-location/roadmap-position/gates:current=1",
    ]);
    expect(roadmap?.children[0]).toMatchObject({
      label: "current sync",
      contextValue: "roadmap-position.current-sync",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix roadmap current --summary-json"],
      },
    });
    expect(
      roadmap?.children[1]?.children.map((child) => `${child.id}:${child.description}`),
    ).toEqual([
      "project/current-location/roadmap-position/bands/impl:uncovered @L6/L7 L6-implementation-binding,L7-tdd-closure",
      "project/current-location/roadmap-position/bands/verification:covered @L8/L9/L10/L11/L12 L8-unit-test-design,L9-integration-test-design,L10-system-test-design,L11-acceptance-test-design,L12-operation-observability",
    ]);
    expect(roadmap?.children[1]?.children[0]?.tooltip).toContain(
      "coverage=L6-implementation-binding,L7-tdd-closure",
    );
    expect(roadmap?.children[2]?.children[0]).toMatchObject({
      id: "project/current-location/roadmap-position/gates/PLAN-L7-open/G-IMPL",
      label: "PLAN-L7-open:G-IMPL",
      description: "pending 1/2",
      contextValue: "roadmap-gate.pending",
    });
    expect(roadmap?.children[2]?.children[0]?.tooltip).toContain(
      "coverage=L6-implementation-binding,L7-tdd-closure",
    );

    const findings = current?.children.find(
      (child) => child.id === "project/current-location/findings",
    );
    expect(findings?.children[0]).toMatchObject({
      label: "l14_claim_with_l7_work",
      description: "error",
      tooltip: "L14 claim and L7 work coexist",
    });
    const closure = current?.children.find(
      (child) => child.id === "project/current-location/closure",
    );
    expect(closure).toMatchObject({
      label: "L7 closure",
      description: "contradicted",
    });
    expect(closure?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/closure/open-l7:1",
      "project/current-location/closure/l14-claims:1",
      "project/current-location/closure/evidence:1",
      "project/current-location/closure/overview:queue=1 close=0 collect=0 repair=1 reverse=0",
      "project/current-location/closure/remediation:done=1 missing=0 reverify=2",
      "project/current-location/closure/evidence-plan:collect=0 repair=1 reverse=0",
      "project/current-location/closure/evidence-materialize:no_probe_execution candidates=0 remaining=0 blocked=0",
      "project/current-location/closure/evidence-apply:blocked candidates=0 allowed=false",
      "project/current-location/closure/packets:1",
      "project/current-location/closure/next-action-ledger:ready=0 evidence=0 repair=1 reverse=0",
      "project/current-location/closure/apply-readiness:no_close_ready_candidates close_ready=0",
      "project/current-location/closure/queue:close=0 collect=0 repair=1 reverse=0",
    ]);
    const remediation = closure?.children.find(
      (child) => child.id === "project/current-location/closure/remediation",
    );
    expect(remediation?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/closure/remediation/reverify/l7_open_plan:reverify 1 @L6",
      "project/current-location/closure/remediation/reverify/l14_claim:reverify 1 @L12",
      "project/current-location/closure/remediation/done/closure_evidence:done 1 @L7",
    ]);
    const evidencePlan = closure?.children.find(
      (child) => child.id === "project/current-location/closure/evidence-plan",
    );
    expect(evidencePlan).toMatchObject({
      label: "evidence plan",
      description: "collect=0 repair=1 reverse=0",
      contextValue: "current-location.closure.evidence-plan",
    });
    expect(evidencePlan?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/closure/evidence-plan/collect:helix closure evidence-plan --action collect_evidence --summary-json",
      "project/current-location/closure/evidence-plan/repair:helix closure evidence-plan --action repair_failed_evidence --summary-json",
      "project/current-location/closure/evidence-plan/reverse:helix closure evidence-plan --action reverse_design --summary-json",
    ]);
    const repairEvidencePlan = evidencePlan?.children.find(
      (child) => child.id === "project/current-location/closure/evidence-plan/repair",
    );
    expect(repairEvidencePlan?.children.map((child) => `${child.id}:${child.description}`)).toEqual(
      [
        "project/current-location/closure/evidence-plan/repair/gate_runs:passed",
        "project/current-location/closure/evidence-plan/repair/runtime_verification_events:accepted",
        "project/current-location/closure/evidence-plan/repair/test_runs:passed",
      ],
    );
    const evidenceMaterialize = closure?.children.find(
      (child) => child.id === "project/current-location/closure/evidence-materialize",
    );
    expect(evidenceMaterialize).toMatchObject({
      label: "evidence materialize",
      description: "no_probe_execution candidates=0 remaining=0 blocked=0",
      contextValue: "current-location.closure.evidence-materialize.no_probe_execution",
    });
    expect(evidenceMaterialize?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: [
        "helix closure evidence-materialize --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json",
      ],
    });
    expect(
      evidenceMaterialize?.children.map((child) => `${child.id}:${child.description}`),
    ).toEqual([
      "project/current-location/closure/evidence-materialize/probe:helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
      "project/current-location/closure/evidence-materialize/preview:helix closure evidence-materialize --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json",
    ]);
    const closureOverview = closure?.children.find(
      (child) => child.id === "project/current-location/closure/overview",
    );
    expect(closureOverview).toMatchObject({
      label: "closure overview",
      description: "queue=1 close=0 collect=0 repair=1 reverse=0",
      contextValue: "current-location.closure.overview.contradicted",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix closure overview --summary-json"],
      },
    });
    expect(closureOverview?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/closure/overview/recommended:repair_failed_evidence human=false",
      "project/current-location/closure/overview/actions/close_ready:0 untracked human=false",
      "project/current-location/closure/overview/actions/collect_evidence:0 untracked human=false",
      "project/current-location/closure/overview/actions/repair_failed_evidence:1 needs_repair human=false",
      "project/current-location/closure/overview/actions/reverse_design:0 untracked human=false",
      "project/current-location/closure/overview/work-buckets:1",
    ]);
    const workBuckets = closureOverview?.children.find(
      (child) => child.id === "project/current-location/closure/overview/work-buckets",
    );
    expect(workBuckets?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/closure/overview/work-buckets/1:count=1 automation=needs_evidence_projection",
    ]);
    expect(workBuckets?.children[0]?.contextValue).toBe(
      "closure-work-bucket.repair_failed_evidence.needs_evidence_projection",
    );
    expect(workBuckets?.children[0]?.tooltip).toContain(
      "templates=test_runs:passed,gate_runs:passed,runtime_verification_events:accepted",
    );
    expect(workBuckets?.children[0]?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: [
        "helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
      ],
    });
    expect(
      workBuckets?.children[0]?.children?.map((child) => `${child.id}:${child.description}`),
    ).toEqual([
      "project/current-location/closure/overview/work-buckets/1/evidence-probe:helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
      "project/current-location/closure/overview/work-buckets/1/probe-record:.helix/tmp/closure/repair_failed_evidence-probe-record.json",
      "project/current-location/closure/overview/work-buckets/1/approval-draft-artifact:.helix/tmp/closure/repair_failed_evidence-approval-draft.yml",
      "project/current-location/closure/overview/work-buckets/1/evidence-materialize:helix closure evidence-materialize --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json",
      "project/current-location/closure/overview/work-buckets/1/evidence-approval-draft:helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
      "project/current-location/closure/overview/work-buckets/1/evidence-apply-dry-run:helix closure evidence-apply --dry-run --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
      "project/current-location/closure/overview/work-buckets/1/evidence-patch:approval-required candidates=3",
      "project/current-location/closure/overview/work-buckets/1/PLAN-L7-open:failed=0 patches=3",
    ]);
    expect(workBuckets?.children[0]?.children?.[0]?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: [
        "helix closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --json",
      ],
    });
    const packets = closure?.children.find(
      (child) => child.id === "project/current-location/closure/packets",
    );
    expect(packets).toMatchObject({
      label: "closure packets",
      description: "1",
    });
    expect(packets?.children[0]).toMatchObject({
      id: "project/current-location/closure/packets/repair_failed_evidence",
      label: "修正/再検証 packet",
      description: "1 @L6",
      contextValue: "closure-packet.repair_failed_evidence",
    });
    const ledger = closure?.children.find(
      (child) => child.id === "project/current-location/closure/next-action-ledger",
    );
    expect(ledger).toMatchObject({
      label: "next-action ledger",
      description: "ready=0 evidence=0 repair=1 reverse=0",
    });
    expect(ledger?.children[0]).toMatchObject({
      id: "project/current-location/closure/next-action-ledger/repair_failed_evidence",
      label: "next-action:closure:repair_failed_evidence",
      description: "needs_repair 1 @L6",
      contextValue: "closure-next-action.needs_repair.repair_failed_evidence",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["docs/plans/PLAN-L7-open.md"],
      },
    });
    const evidenceApply = closure?.children.find(
      (child) => child.id === "project/current-location/closure/evidence-apply",
    );
    expect(evidenceApply).toMatchObject({
      label: "evidence apply",
      description: "blocked candidates=0 allowed=false",
      contextValue: "current-location.closure.evidence-apply.blocked",
    });
    expect(evidenceApply?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/closure/evidence-apply/dry-run:helix closure evidence-apply --dry-run --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
      "project/current-location/closure/evidence-apply/execute:helix closure evidence-apply --execute --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record <approved-approval-record-path> --summary-json",
      "project/current-location/closure/evidence-apply/approval:decision_id: closure-evidence-materialize:repair_failed_evidence, outcome: <approve_materialized_evidence | reject_materialized_evidence>, approval_scope_digest: sha256:6125218508883c82bcf433f3cb7ebbeb6f5f6d258443f7f4f4bc9e4c8d5af749, reason: <日本語で判断理由>",
      "project/current-location/closure/evidence-apply/approval-draft:helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
    ]);
    const applyReadiness = closure?.children.find(
      (child) => child.id === "project/current-location/closure/apply-readiness",
    );
    expect(applyReadiness).toMatchObject({
      label: "closure apply",
      description: "no_close_ready_candidates close_ready=0",
      contextValue: "current-location.closure.apply.no_close_ready_candidates",
    });
    expect(applyReadiness?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/closure/apply-readiness/review-bundle:helix closure review-bundle --action close_ready --limit 20 --offset 0 --summary-json",
      "project/current-location/closure/apply-readiness/transition-plan:helix closure transition-plan --action close_ready --limit 20 --offset 0 --summary-json",
      "project/current-location/closure/apply-readiness/decision-draft:helix closure decision-draft --action close_ready --limit 20 --offset 0 --out .helix/tmp/closure/close_ready-decision-draft.yml --summary-json",
      "project/current-location/closure/apply-readiness/dry-run:helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit 20 --json",
    ]);
    expect(
      applyReadiness?.children.find(
        (child) => child.id === "project/current-location/closure/apply-readiness/dry-run",
      )?.command?.arguments[0],
    ).toBe(
      "helix closure apply --dry-run --approval-record <approved-approval-record-path> --limit 20 --summary-json",
    );
    const queue = closure?.children.find(
      (child) => child.id === "project/current-location/closure/queue",
    );
    expect(queue).toMatchObject({
      label: "closure queue",
      description: "close=0 collect=0 repair=1 reverse=0",
    });
    expect(queue?.children[0]).toMatchObject({
      id: "project/current-location/closure/queue/30/PLAN-L7-open",
      label: "PLAN-L7-open",
      description: "repair_failed_evidence reverify/partial add-impl @L6 L6-implementation-binding",
      contextValue: "closure-queue.repair_failed_evidence.reverify.partial",
    });
    expect(queue?.children[0]?.tooltip).toContain(
      "coverage=L6-implementation-binding 実装契約/implementation binding",
    );
    expect(queue?.children[0]?.tooltip).toContain(
      "失敗 evidence を修復する: execution:missing,test:failed",
    );
    expect(queue?.children[0]?.tooltip).toContain("gaps=execution:missing,test:failed");
    const operationScope = current?.children.find(
      (child) => child.id === "project/current-location/operation-scope",
    );
    expect(operationScope?.description).toBe(
      "designed=2 observed=1 observed_gap=2 missing=1 reverify=0",
    );
    expect(operationScope?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/operation-scope/log_design:designed L12-operation-observability",
      "project/current-location/operation-scope/runtime_verification:observed L12-operation-observability",
      "project/current-location/operation-scope/class_method_contract:missing L12-operation-observability",
      "project/current-location/operation-scope/incident_recovery_route:designed L12-operation-observability",
    ]);
    expect(operationScope?.children[0]?.tooltip).toContain(
      "coverage=L12-operation-observability 運用テスト/ログ/KPI/runtime",
    );
    expect(
      operationScope?.children[0]?.children.map((child) => `${child.id}:${child.description}`),
    ).toEqual([
      "project/current-location/operation-scope/log_design/design:1",
      "project/current-location/operation-scope/log_design/observed:0",
      "project/current-location/operation-scope/log_design/observation-gap:watch",
      "project/current-location/operation-scope/log_design/tables:design_declarations,runtime_verification_events",
    ]);
    expect(operationScope?.children[1]?.children[2]?.description).toBe("clear");
    expect(operationScope?.children[3]?.children[2]?.description).toBe("watch");
    const l12Compatibility = current?.children.find(
      (child) => child.id === "project/current-location/l12-compatibility",
    );
    expect(l12Compatibility).toMatchObject({
      label: "L12 compatibility",
      description: "partial layers=4/12",
      contextValue: "current-location.l12-compatibility.partial",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix current-location --summary-json"],
      },
    });
    expect(l12Compatibility?.children.map((child) => `${child.id}:${child.description}`)).toEqual([
      "project/current-location/l12-compatibility/l0_slide:not_observed L0->L1 0/0",
      "project/current-location/l12-compatibility/function_design:not_observed L6->L5 0/0",
      "project/current-location/l12-compatibility/implementation:bound L7->L6 1/1",
      "project/current-location/l12-compatibility/acceptance:not_observed L12->L11 0/0",
      "project/current-location/l12-compatibility/operation:not_observed L14->L12 0/0",
      "project/current-location/l12-compatibility/recovery:not_observed cross->L12 0/0",
    ]);
    const artifactRemap = current?.children.find(
      (child) => child.id === "project/current-location/artifact-remap",
    );
    expect(artifactRemap?.description).toBe("done=1 missing=1 reverify=1");
    const artifactRemapLayers = artifactRemap?.children.find(
      (child) => child.id === "project/current-location/artifact-remap/layers",
    );
    expect(artifactRemapLayers).toMatchObject({
      label: "L12 remap layers",
      description:
        "L1:missing L2:missing L3:done L4:missing L5:missing L6:reverify L7:missing L8:missing L9:missing L10:missing L11:missing L12:missing",
    });
    expect(
      artifactRemapLayers?.children
        .filter((child) =>
          [
            "project/current-location/artifact-remap/layers/L3",
            "project/current-location/artifact-remap/layers/L6",
            "project/current-location/artifact-remap/layers/L7",
          ].includes(child.id),
        )
        .map((child) => `${child.id}:${child.description}`),
    ).toEqual([
      "project/current-location/artifact-remap/layers/L3:done Forward total=1 done=1 missing=0 reverify=0",
      "project/current-location/artifact-remap/layers/L6:reverify Reverse total=1 done=0 missing=0 reverify=1",
      "project/current-location/artifact-remap/layers/L7:missing Reverse total=1 done=0 missing=1 reverify=0",
    ]);
    expect(artifactRemap?.children[1]).toMatchObject({
      id: "project/current-location/artifact-remap/batch/reverify",
      label: "reverify batch",
      description: "count=1",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix artifact-remap batch --status reverify --summary-json"],
      },
    });
    expect(artifactRemap?.children[2]).toMatchObject({
      id: "project/current-location/artifact-remap/batch/missing",
      label: "missing batch",
      description: "count=1",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: ["helix artifact-remap batch --status missing --summary-json"],
      },
    });
    expect(
      artifactRemapLayers?.children
        .filter((child) => child.id === "project/current-location/artifact-remap/layers/L6")
        .map((child) => child.command?.arguments[0]),
    ).toEqual(["helix artifact-remap batch --status reverify --layer L6 --summary-json"]);
    expect(
      artifactRemap?.children.slice(3).map((child) => `${child.id}:${child.description}`),
    ).toEqual([
      "project/current-location/artifact-remap/missing/gap/missing:L7:missing -->L7 L7-tdd-closure",
      "project/current-location/artifact-remap/reverify/plan/PLAN-L7-open:reverify L7->L6 L6-implementation-binding",
      "project/current-location/artifact-remap/done/design/HR-FR-001:done L3->L3 L3-requirements-freeze",
    ]);

    const ids: string[] = [];
    const collectIds = (nodes: typeof first.roots) => {
      for (const node of nodes) {
        ids.push(node.id);
        collectIds(node.children);
      }
    };
    collectIds(first.roots);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("U-VTREE-002: keeps Tree View actions read-only copy pointers only", () => {
    const tree = buildVisualizationTreeView(buildVisualizationViewModel(snapshot()));
    const project = tree.roots.find((root) => root.id === "project");
    const relation = project?.children.find((child) => child.id === "project/relation-graph");
    const artifactTotal = project?.children
      .find((child) => child.id === "project/layer-progress")
      ?.children.find((child) => child.id === "project/layer-progress/artifacts")
      ?.children.find((child) => child.id === "project/layer-progress/artifacts/total");

    expect(relation?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: ["helix graph export --format mermaid"],
    });
    expect(artifactTotal?.command).toEqual({
      title: "Copy pointer",
      command: "helix.copyPointer",
      arguments: ["helix progress artifacts --summary-json"],
    });
    expect(JSON.stringify(tree)).not.toContain("/home/");
    expect(JSON.stringify(tree)).not.toContain("C:\\Users\\");
  });

  it("U-VTREE-003: caps long Project view tooltips while preserving JSON drilldown pointers", () => {
    const raw = snapshot();
    const l6Coverage = raw.project_current_location.coverage.l12_layers.find(
      (layer) => layer.layer === "L6",
    );
    if (!l6Coverage) throw new Error("L6 coverage fixture missing");
    l6Coverage.planIds = Array.from({ length: 30 }, (_, index) => `PLAN-L7-${index + 1}`);
    raw.project_current_location.drive_route.reverse.docDependencies = Array.from(
      { length: 30 },
      (_, index) => `docs/plans/PLAN-L7-${index + 1}.md`,
    );

    const tree = buildVisualizationTreeView(buildVisualizationViewModel(raw));
    const l6Plans = findTreeNode(tree, "project/current-location/coverage/L6/plans");
    const reverseScope = findTreeNode(tree, "project/current-location/drive/reverse");

    expect(l6Plans?.tooltip).toContain("PLAN-L7-24");
    expect(l6Plans?.tooltip).not.toContain("PLAN-L7-25");
    expect(l6Plans?.tooltip).toContain("... 6 more (helix current-location --summary-json)");
    expect(reverseScope?.tooltip).toContain("coverage=L5-detailed-contract");
    expect(reverseScope?.tooltip).toContain("doc=docs/plans/PLAN-L7-22.md");
    expect(reverseScope?.tooltip).not.toContain("doc=docs/plans/PLAN-L7-23.md");
    expect(reverseScope?.tooltip).toContain("... 10 more (helix current-location --json)");
  });

  it("U-VTREE-004: renders approval-pending handoff as an approval next action", () => {
    const raw = snapshot();
    const approvalDraft = raw.recovery_handoff_artifacts.items.find(
      (item) => item.kind === "approval_draft",
    );
    if (!approvalDraft) throw new Error("approval draft fixture missing");
    approvalDraft.status = "present";
    approvalDraft.generation_status = "present";
    approvalDraft.bytes = 253;
    approvalDraft.sha256 = "sha256:approval";
    approvalDraft.approval_record = {
      status: "pending_human_review",
      decision_id: "closure-evidence-materialize:repair_failed_evidence",
      outcome: "pending_human_review",
      approval_scope_digest: "sha256:test",
      expected_approval_scope_digest: "sha256:test",
      scope_status: "match",
      materialize_status: "ready_for_approval",
      reviewed_candidate_count: 3,
      valid_for_apply: false,
      reasons: ["人間レビュー待ちの non-authorizing approval draft"],
    };

    const tree = buildVisualizationTreeView(buildVisualizationViewModel(raw));
    const nextAction = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location",
    );
    const handoffNext = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/handoff-next",
    );
    const approvalDraftArtifact = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/approval-draft-artifact",
    );
    const recoveryHandoff = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/recovery-handoff",
    );
    const handoffSummary = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/handoff-summary",
    );

    expect(nextAction).toMatchObject({
      description: "approval count=1",
      contextValue: "vmodel-fit.next-action.approval",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: [
          "helix closure evidence-materialize --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json",
        ],
      },
    });
    expect(handoffNext).toMatchObject({
      description: "approval_pending approval=pending_human_review scope=match valid=false",
      contextValue:
        "vmodel-fit.work-bucket.handoff-next.approval_pending.approval-pending_human_review.scope-match.valid-false",
    });
    expect(handoffNext?.tooltip).toContain("approval.waiting_for_human_review");
    expect(handoffNext?.tooltip).toContain("approval.scope.match");
    expect(handoffSummary).toMatchObject({
      description: "approval_pending total=1 approval=1 mismatch=0 apply=0",
      contextValue: "vmodel-fit.handoff-summary.approval_pending.mismatch-0.apply-0",
    });
    expect(handoffSummary?.tooltip).toContain("approval_pending=1");
    expect(handoffSummary?.tooltip).toContain("approval.scope.match");
    expect(approvalDraftArtifact).toMatchObject({
      description: "present present 253B",
      contextValue: "vmodel-fit.work-bucket.handoff.approval-draft",
    });
    expect(approvalDraftArtifact?.tooltip).toContain("scope=match");
    expect(approvalDraftArtifact?.tooltip).toContain("approval_scope_digest=sha256:test");
    expect(approvalDraftArtifact?.tooltip).toContain("expected=sha256:test");
    expect(recoveryHandoff).toMatchObject({
      description:
        "approval_pending phase=approval approval=pending_human_review scope=match valid=false",
      contextValue:
        "vmodel-fit.recovery-handoff.approval.approval_pending.approval-pending_human_review.scope-match.valid-false",
    });
    expect(recoveryHandoff?.tooltip).toContain("approval_state=pending_human_review");
    expect(recoveryHandoff?.tooltip).toContain("approval=pending_human_review");
    expect(recoveryHandoff?.tooltip).toContain("scope=match");
    expect(recoveryHandoff?.tooltip).toContain("handoff.phase.approval");
    expect(recoveryHandoff?.tooltip).toContain(
      "decision=closure-evidence-materialize:repair_failed_evidence",
    );
    expect(recoveryHandoff?.tooltip).toContain("approval_scope_digest=sha256:test");
    expect(recoveryHandoff?.tooltip).toContain("materialize=ready_for_approval");
    expect(recoveryHandoff?.tooltip).toContain("reviewed=3");
    expect(recoveryHandoff?.tooltip).toContain("valid_for_apply=false");
  });

  it("U-VTREE-004: renders rejected handoff as blocked approval state", () => {
    const raw = snapshot();
    const approvalDraft = raw.recovery_handoff_artifacts.items.find(
      (item) => item.kind === "approval_draft",
    );
    if (!approvalDraft) throw new Error("approval draft fixture missing");
    approvalDraft.status = "present";
    approvalDraft.generation_status = "present";
    approvalDraft.bytes = 253;
    approvalDraft.sha256 = "sha256:approval";
    approvalDraft.approval_record = {
      status: "rejected",
      decision_id: "closure-evidence-materialize:repair_failed_evidence",
      outcome: "reject_materialized_evidence",
      approval_scope_digest: "sha256:test",
      expected_approval_scope_digest: "sha256:test",
      scope_status: "match",
      materialize_status: "ready_for_approval",
      reviewed_candidate_count: 3,
      valid_for_apply: false,
      reasons: ["fixture rejected by reviewer"],
    };

    const tree = buildVisualizationTreeView(buildVisualizationViewModel(raw));
    const nextAction = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location",
    );
    const handoffNext = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/handoff-next",
    );
    const recoveryHandoff = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/recovery-handoff",
    );
    const handoffSummary = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/handoff-summary",
    );

    expect(nextAction).toMatchObject({
      description: "approval count=1",
      contextValue: "vmodel-fit.next-action.approval",
    });
    expect(handoffNext).toMatchObject({
      description: "approval_rejected approval=rejected scope=match valid=false",
      contextValue:
        "vmodel-fit.work-bucket.handoff-next.approval_rejected.approval-rejected.scope-match.valid-false",
    });
    expect(handoffNext?.tooltip).toContain("approval.record.rejected");
    expect(handoffSummary).toMatchObject({
      description: "approval_blocked total=1 approval=1 mismatch=0 apply=0",
      contextValue: "vmodel-fit.handoff-summary.approval_blocked.mismatch-0.apply-0",
    });
    expect(recoveryHandoff).toMatchObject({
      description: "approval_rejected phase=approval approval=rejected scope=match valid=false",
      contextValue:
        "vmodel-fit.recovery-handoff.approval.approval_rejected.approval-rejected.scope-match.valid-false",
    });
    expect(recoveryHandoff?.tooltip).toContain("outcome=reject_materialized_evidence");
    expect(recoveryHandoff?.tooltip).toContain("approval.record.rejected");
    expect(recoveryHandoff?.tooltip).toContain("handoff_next=approval_rejected");
  });

  it("U-VTREE-004: renders invalid approval record as approval-required state", () => {
    const raw = snapshot();
    const approvalDraft = raw.recovery_handoff_artifacts.items.find(
      (item) => item.kind === "approval_draft",
    );
    if (!approvalDraft) throw new Error("approval draft fixture missing");
    approvalDraft.status = "present";
    approvalDraft.generation_status = "present";
    approvalDraft.bytes = 253;
    approvalDraft.sha256 = "sha256:approval";
    approvalDraft.approval_record = {
      status: "invalid",
      decision_id: "closure-evidence-materialize:repair_failed_evidence",
      outcome: "unknown_outcome",
      approval_scope_digest: "sha256:test",
      expected_approval_scope_digest: "sha256:test",
      scope_status: "match",
      materialize_status: "ready_for_approval",
      reviewed_candidate_count: 3,
      valid_for_apply: false,
      reasons: ["approval record の必須 field/outcome を修正する"],
    };

    const tree = buildVisualizationTreeView(buildVisualizationViewModel(raw));
    const nextAction = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location",
    );
    const handoffNext = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/handoff-next",
    );
    const recoveryHandoff = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/recovery-handoff",
    );
    const handoffSummary = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/handoff-summary",
    );

    expect(nextAction).toMatchObject({
      description: "approval count=1",
      contextValue: "vmodel-fit.next-action.approval",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: [
          "helix closure evidence-approval-draft --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --out .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
        ],
      },
    });
    expect(handoffNext).toMatchObject({
      description: "approval_required approval=invalid scope=match valid=false",
      contextValue:
        "vmodel-fit.work-bucket.handoff-next.approval_required.approval-invalid.scope-match.valid-false",
    });
    expect(handoffNext?.tooltip).toContain("approval.record.invalid");
    expect(handoffSummary).toMatchObject({
      description: "approval_pending total=1 approval=1 mismatch=0 apply=0",
      contextValue: "vmodel-fit.handoff-summary.approval_pending.mismatch-0.apply-0",
    });
    expect(handoffSummary?.tooltip).toContain("approval_required=1");
    expect(recoveryHandoff).toMatchObject({
      description: "approval_required phase=approval approval=invalid scope=match valid=false",
      contextValue:
        "vmodel-fit.recovery-handoff.approval.approval_required.approval-invalid.scope-match.valid-false",
    });
    expect(recoveryHandoff?.tooltip).toContain("approval record の必須 field/outcome");
    expect(recoveryHandoff?.tooltip).toContain("approval.record.invalid");
    expect(recoveryHandoff?.tooltip).toContain("handoff_next=approval_required");
  });

  it("U-VTREE-004: renders approved handoff as apply dry-run machine step", () => {
    const raw = snapshot();
    const approvalDraft = raw.recovery_handoff_artifacts.items.find(
      (item) => item.kind === "approval_draft",
    );
    if (!approvalDraft) throw new Error("approval draft fixture missing");
    approvalDraft.status = "present";
    approvalDraft.generation_status = "present";
    approvalDraft.bytes = 253;
    approvalDraft.sha256 = "sha256:approval";
    approvalDraft.approval_record = {
      status: "approved",
      decision_id: "closure-evidence-materialize:repair_failed_evidence",
      outcome: "approve_materialized_evidence",
      approval_scope_digest: "sha256:test",
      expected_approval_scope_digest: "sha256:test",
      scope_status: "match",
      materialize_status: "ready_for_approval",
      reviewed_candidate_count: 3,
      valid_for_apply: true,
      reasons: ["fixture approved by reviewer"],
    };

    const tree = buildVisualizationTreeView(buildVisualizationViewModel(raw));
    const nextAction = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location",
    );
    const handoffNext = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/next-actions/20-current_location/work-bucket/handoff-next",
    );
    const recoveryHandoff = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/recovery-handoff",
    );
    const handoffSummary = findTreeNode(
      tree,
      "project/current-location/vmodel-fit/handoff-summary",
    );

    expect(nextAction).toMatchObject({
      description: "machine count=1",
      contextValue: "vmodel-fit.next-action.machine",
      command: {
        title: "Copy pointer",
        command: "helix.copyPointer",
        arguments: [
          "helix closure evidence-apply --dry-run --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record.json --approval-record .helix/tmp/closure/repair_failed_evidence-approval-draft.yml --summary-json",
        ],
      },
    });
    expect(handoffNext).toMatchObject({
      description: "apply_dry_run approval=approved scope=match valid=true",
      contextValue:
        "vmodel-fit.work-bucket.handoff-next.apply_dry_run.approval-approved.scope-match.valid-true",
    });
    expect(handoffNext?.tooltip).toContain("handoff.apply.dry_run_ready");
    expect(handoffNext?.tooltip).toContain("approval.record.approved");
    expect(handoffSummary).toMatchObject({
      description: "apply_ready total=1 approval=0 mismatch=0 apply=1",
      contextValue: "vmodel-fit.handoff-summary.apply_ready.mismatch-0.apply-1",
    });
    expect(recoveryHandoff).toMatchObject({
      description: "apply_dry_run phase=machine approval=approved scope=match valid=true",
      contextValue:
        "vmodel-fit.recovery-handoff.machine.apply_dry_run.approval-approved.scope-match.valid-true",
    });
    expect(recoveryHandoff?.tooltip).toContain("outcome=approve_materialized_evidence");
    expect(recoveryHandoff?.tooltip).toContain("valid_for_apply=true");
    expect(recoveryHandoff?.tooltip).toContain("handoff.apply.dry_run_ready");
  });
});
