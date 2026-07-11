---
plan_id: PLAN-L7-397-vmodel-current-location-projection
title: "PLAN-L7-397 (impl): ZIP/L12 typed declaration と current-location projection の実装接続"
kind: impl
layer: L7
drive: be
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-08 ハイブリッド設計ドキュメントv1-fixed.zip を基に、工程表と harness.db 現在地を結び、厳格な機械検出と駆動モデル選択へ接続する"
created: 2026-07-08
updated: 2026-07-10
backprop_decision: not_required
backprop_decision_reason: "L3 構想と L12 採用マトリクスを実装 projection へ接続する L7 実装であり、L0/L1 の意味変更や runtime state 名称変更は行わない。"
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/function-spec.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL - ZIP/L12 適合、設計カバレッジ、駆動モデル境界のレビュー"
  - role: se
    slot_label: "SE - typed declaration、harness.db design tables、current-location projection の実装"
  - role: qa
    slot_label: "QA - current-location、design declaration、Project view の機械検出検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
    artifact_type: markdown_doc
  - artifact_path: src/vmodel/design-declarations.ts
    artifact_type: source_module
  - artifact_path: src/schema/design-declarations.ts
    artifact_type: source_module
  - artifact_path: src/vmodel/zip-manifest.ts
    artifact_type: source_module
  - artifact_path: src/schema/hybrid-vmodel-manifest.ts
    artifact_type: source_module
  - artifact_path: src/vmodel/fit.ts
    artifact_type: source_module
  - artifact_path: src/state-db/vmodel-fit.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-tables-design.ts
    artifact_type: source_module
  - artifact_path: src/schema/harness-db-types.ts
    artifact_type: source_module
  - artifact_path: src/state-db/current-location.ts
    artifact_type: source_module
  - artifact_path: src/doctor/index.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: src/state-db/visualization-read-model.ts
    artifact_type: source_module
  - artifact_path: src/state-db/projection-writer.ts
    artifact_type: source_module
  - artifact_path: src/runtime/summary-surface-audit.ts
    artifact_type: source_module
  - artifact_path: docs/design/helix/L5-detail/operation-scope.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/operation-scope.md
    artifact_type: test_design
  - artifact_path: tests/design-declarations.test.ts
    artifact_type: test_code
  - artifact_path: tests/current-location.test.ts
    artifact_type: test_code
  - artifact_path: tests/cli-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/db-projection-ingestion.test.ts
    artifact_type: test_code
  - artifact_path: tests/vmodel-zip-manifest.test.ts
    artifact_type: test_code
  - artifact_path: tests/visualization-view-model.test.ts
    artifact_type: test_code
  - artifact_path: tests/visualization-treeview.test.ts
    artifact_type: test_code
  - artifact_path: tests/slow/doctor.test.ts
    artifact_type: test_code
  - artifact_path: docs/design/harness/L6-function-design/function-spec.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L7-44-harness-db-master.md
  requires:
    - docs/plans/PLAN-L7-44-harness-db-master.md
    - docs/plans/PLAN-L7-205-run-debug-db-projection.md
    - docs/plans/PLAN-L7-372-visualization-view-model-impl.md
  references:
    - docs/plans/PLAN-L3-13-vmodel-docgen-fit.md
    - docs/design/helix/L3-requirements/vmodel-docgen-fit.md
    - docs/design/harness/L6-function-design/function-spec.md
    - docs/design/helix/L12-vmodel/vmodel-layer-coverage.md
    - docs/design/helix/L12-vmodel/vmodel-docgen-adoption-matrix.md
    - docs/design/helix/L12-vmodel/vmodel-solo-tailoring-profile.md
    - docs/test-design/harness/L8-unit-test-design.md
    - docs/test-design/helix/vmodel-docgen-fit-acceptance.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T02:30:00+09:00"
    tests_green_at: "2026-07-11T02:20:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-subagents
    scope: "既存の operation/skill binding 証跡を再検証し、ZIP typed ID 一意性に従って同一 section の本文定義 ID 重複を fail-close 化した。採用マトリクスの非採用判断を HVM-REJECT-01..03 に分離し、current-location / doctor / DB projection / view の件数契約を11判断へ追従させた。"
    green_commands:
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:f10702d6c0a2f8740b976a7124304473cb52a5d1dc35b60139c770b7554b1412"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/design-declarations.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: tests/summary-surface-audit.test.ts
        output_digest: "sha256:22da4a15efa3b193af46847de6a70f682531df06d36bfbcf49c8bbc648aac828"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"skill binding|exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:c3e95385caed0b2357c5137535d07d9e764d1728ab504316f379d71a28176b0d"
      - kind: smoke
        command: "bun src/cli.ts current-location --summary-json | skill/drift/approval smoke"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: docs/design/helix/L5-detail/operation-scope.md
        output_digest: "sha256:65f30ed77d0848772508503a1baf0d33e5c1c24e7499662f3186f0e9168207b6"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json | scrum/skill/drift smoke"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b330186383a99165590ce6edaa8f0e4ac5884b03bf576afa8d53abcab6e38efb"
      - kind: smoke
        command: "bun src/cli.ts closure review-bundle --action close_ready --limit 1 --summary-json | approval checklist smoke"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:8899f492785594b1ecb309e3b8f85f84ca46def0dca93a21b5f98fd033cd0a0e"
      - kind: lint
        command: "bun src/cli.ts plan lint"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:7c17187d16234db0cbe313108457acd3efc4697382ce92948f93653bc8208964"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-11T02:00:00+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-10T01:01:45+09:00"
    tests_green_at: "2026-07-10T01:01:45+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-subagents
    scope: "`operation_scope` summary を counts-only から item 単位へ拡張し、current-location / vmodel fit / project frontier の3面で `log_design`、`kpi_metric`、`runtime_verification`、`operation_test`、`class_method_contract`、`incident_recovery_route` の status、design count、observed count、evidence tables を機械検出できるようにした。VSCode Project tree の operation scope 子ノードにも design/observed count を出し、L5 詳細設計 `docs/design/helix/L5-detail/operation-scope.md` で ZIP由来の運用後 scope 契約を typed declaration 化した。"
    green_commands:
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T01:01:20+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:101c0e9d9514c52ae835196c495a092b15ce14929febd4febf037c4325c9111c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:59:04+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T01:00:48+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:0fa2d957b4fa2a784beeb79a539f6113d509b0a1d0ab08d452f237fa3e59eb0d"
      - kind: unit_test
        command: "bun run test:fast -- tests/visualization-treeview.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:59:04+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:070a891db1ae320e4dc7d971c2237427f4fce7a9832bfe95577a3f535a9aac52"
      - kind: unit_test
        command: "bun run test:fast -- tests/db-projection-ingestion.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T01:01:05+09:00"
        evidence_path: tests/db-projection-ingestion.test.ts
        output_digest: "sha256:bc20b01006213d5a4b313ac5b9ed38cf364ca7ef5917d5366ec87b49a8558650"
      - kind: unit_test
        command: "bun run test:fast -- tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T01:01:00+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:95d8c9f91965c964c7154f33fab5cbd7df9d8f448324acdb0e2d1f32612d5e10"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T01:01:01+09:00"
        evidence_path: tests/summary-surface-audit.test.ts
        output_digest: "sha256:c8864456eef0b12abed4c768a85aa59c0520c0ddb8f0f91fc14d8f3bbea92cd1"
      - kind: smoke
        command: "bun src/cli.ts current-location --summary-json | operation_scope.items smoke"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-10T01:01:10+09:00"
        evidence_path: docs/design/helix/L5-detail/operation-scope.md
        output_digest: "sha256:ee6975ba499ac93155250010b8a19133b6e6c7ff04f3282af1347f3d4c3527d8"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json | operation_scope.items smoke"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-10T01:01:11+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:c353765326c06bc771390d01d95c67137c3289e1ef918938a7f58ce67fb3b297"
      - kind: smoke
        command: "bun src/cli.ts progress frontier --summary-json | operation_scope.items smoke"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-10T01:01:11+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:12e9c58250ea0cd630b29f4f79316a70a4b9a33e662318075c1fdd8eaa3a6980"
      - kind: lint
        command: "bun src/cli.ts plan lint"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T01:01:22+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:6ec26e087de8a95b82fd4f686e4a6e5c6e3a5a6b2eb0d086ef98d7a3a217570c"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-10T01:01:23+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-10T00:50:17+09:00"
    tests_green_at: "2026-07-10T00:50:17+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-subagents
    scope: "`current-location --summary-json` に close_ready `approval_review_gate`、decision draft record command、skill binding command/top items を追加し、default handoff surface から承認 review と skill injection へ 1 hop で戻れるようにした。`progress frontier --summary-json` には `operation_scope` と `scrum_operation` を追加し、V+Scrum 工程表/運用後 scope が current-location 専用 surface に閉じないようにした。VSCode/Project tree-view の `vmodel-fit/approval-review` には current/next window、evidence totals、transition、outcome routes、record template の子ノードを追加し、doctor/current-location text には `closure-approval-frontier` 行を追加した。"
    green_commands:
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:48:43+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:101c0e9d9514c52ae835196c495a092b15ce14929febd4febf037c4325c9111c"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:48:43+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast -- tests/visualization-treeview.test.ts -t current-location"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:48:43+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:6807aae1ae9b2125c2cdbb4bb26986e2c385ad8c7ec4ce5df643a2938dc59a82"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:49:04+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:d9937c6ee2f3c068d13fee7be2c09595426d12c5d7c6958d9c082943ea42feee"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:48:43+09:00"
        evidence_path: tests/summary-surface-audit.test.ts
        output_digest: "sha256:9dae572473b9ce6fba6f13450ea25a2e0e9b5131df2897d0f539ca41942c9d3f"
      - kind: unit_test
        command: "bun run vitest run tests/slow/doctor.test.ts -t \"surfaces Project current-location as an advisory doctor check\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:49:04+09:00"
        evidence_path: tests/slow/doctor.test.ts
        output_digest: "sha256:b0d2a425f30e3998a2028b68e9e1a9f08e04eadf1c866d394103a3c45fbed0bd"
      - kind: smoke
        command: "bun src/cli.ts current-location --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:49:04+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8151dac76e32c8fe9d8bb513a3f7d1f660f24313f15f5b0120388386e0b69623"
      - kind: smoke
        command: "bun src/cli.ts progress frontier --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:49:04+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:b5d60fbdd4a557a9866d68ae487fde33069a795c9a448945b174d410069f7b61"
      - kind: lint
        command: "bun src/cli.ts plan lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:50:17+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:7c17187d16234db0cbe313108457acd3efc4697382ce92948f93653bc8208964"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-10T00:27:10+09:00"
    tests_green_at: "2026-07-10T00:27:10+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "`current_location_frontier` を Project current-location view-model、VSCode/Project tree-view、doctor 表示へ投影し、`project/current-location/drive/current-location-frontier` から open L7 / terminal L14 claim / reentry command を機械検出できるようにした。doctor は既知 frontier 状態で exit 1 のまま、`project-current-location - frontier:` 行を出して現在地矛盾と Recovery 導線を通常確認面へ露出する。"
    green_commands:
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:21:25+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:66a7968bb5f6b8e128df6e850ea96b03da9cc4d18aca5d138e90ac35959957ff"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:21:25+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast -- tests/visualization-treeview.test.ts -t current-location"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:21:25+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:35dcf3574628918b91ede4685388977efc7da8f2fc692bba1b07c2910b08d8ed"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:26:21+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:1e65117c2f989e2479bc823c368b7895f38335a66a2a5a300404cf2d2ab6f443"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:21:25+09:00"
        evidence_path: tests/summary-surface-audit.test.ts
        output_digest: "sha256:c2e12f2a061bd37a1d446124701a5ac7a959c2b0aa9189d7895e6fdc59f2b349"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:26:21+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:608018b7bd2a916868a006a0484c7ba1fd6a45b3a23b297ff66c46b4643eba26"
      - kind: smoke
        command: "bun src/cli.ts progress frontier --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:26:21+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:56815bae244c571494e46f7223a4541a7414aea10a4db024e649f0e09e988a85"
      - kind: doctor
        command: "bun src/cli.ts doctor (expected exit 1) + rg \"project-current-location - frontier\""
        runner: bash
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:27:10+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:a24c0245c4fbffefb7164e179c1e382d975bf46a3b45e5f1a954ab6de5e45a8a"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-10T00:09:25+09:00"
    tests_green_at: "2026-07-10T00:09:25+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "`current_location_frontier` を `current-location --summary-json` / `progress frontier --summary-json` / `vmodel fit --summary-json` へ投影し、L14 claim と open L7 の矛盾を `frontier_type=recovery_frontier` / `classification=l14_claim_with_l7_work` として機械検出できるようにした。`drive model --summary-json` には `blocking_finding_codes` を追加し、Recovery 選択理由が summary 単体で追跡できることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:08:01+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-10T00:07:55+09:00"
        evidence_path: src/runtime/summary-surface-audit.ts
        output_digest: "sha256:b95c354f92aae05a11638b7a1e883301934de06803b3a8d3963533c7a5175335"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:08:22+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:5f94a68f96b5cace99f674b08622615afa66260a4ac56ec387652766f8f1c22d"
      - kind: unit_test
        command: "bun run test:fast -- tests/current-location.test.ts -t \"L14到達済みclaim\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:08:59+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:3270e2ef99ed966aa51e0e296048efd93aec91db93dce4d3e720818a2fd6f53d"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:08:59+09:00"
        evidence_path: tests/summary-surface-audit.test.ts
        output_digest: "sha256:16f270a9eb010f607317b5d364d68d2de9dae85ec7966182f9428a68f06e86e1"
      - kind: smoke
        command: "bun src/cli.ts current-location --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:09:06+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:ccadc1fa4678c87d89a49b16f804426bdfffbea64ceb447042b80d5ff616dcf3"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:09:06+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:1673050dea0f1df5984d747eb0a232cedb2af4ebc7ecbfdae6e87540aed1d8f6"
      - kind: smoke
        command: "bun src/cli.ts drive model --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:09:15+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:97090e30688603b440453272724e58dda695fece86e16bc65a8c2a87d8cc8681"
      - kind: smoke
        command: "bun src/cli.ts progress frontier --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-10T00:09:15+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:428c49605a526c1d6848a30f359bdfb61ae215d0ce8f3de2263139e05909fdc8"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T23:54:52+09:00"
    tests_green_at: "2026-07-09T23:54:52+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "`progress frontier --summary-json` を Project frontier の独立 read-only summary surface として追加し、tree-view / completion frontier / summary catalog が `helix progress frontier --summary-json` を正本 command として指すようにした。ZIP/L12 方針の現在地、駆動モデル、機能設計廃止境界、close-ready approval frontier、V-model fit、skill binding を tree-view 描画に依存せず機械検出できることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T23:53:54+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T23:53:54+09:00"
        evidence_path: src/runtime/summary-surface-audit.ts
        output_digest: "sha256:4dcef3f51425192567bedb43f283f14dca9063ad797c0ecb3e956d79be50ee5a"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:54:20+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:4638cfc3a13e697bb7f804c2835a32ccb0a036f77f9b42dc28e90d8bed056d62"
      - kind: unit_test
        command: "bun run test:fast -- tests/summary-surface-audit.test.ts tests/goal-evidence-audit.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:54:35+09:00"
        evidence_path: tests/summary-surface-audit.test.ts
        output_digest: "sha256:b1a1811e5f6da7921def39ffdb5a1279b6a05ea4d805a7fce16608cccd413f04"
      - kind: smoke
        command: "bun src/cli.ts progress frontier --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:54:52+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:76791346ab0a34c2806736d490288edd218a9f2319eb021c16a11e6175ba996d"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:54:51+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:90c24508a44aebe58a0a49d119a6a7fc69a5f41c9885f427ed4247e8aba73aec"
      - kind: smoke
        command: "bun src/cli.ts completion decision-packet --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:54:51+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:ebca9b2fc8df04fcd495dfc120ca0369f452c2f6c113c0365788befd54ec1b13"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T23:45:33+09:00"
    tests_green_at: "2026-07-09T23:45:33+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "`current-location --summary-json` と Project frontier summary に `function_design_policy` を投影し、独立機能設計廃止方針を `vmodel fit` 専用 field から常用 current-location surface へ引き上げた。live repo では status=pass、independent_layer_policy=abolished、detail_contract_coverage_status=covered、tailoring_detail_contract_status=declared、absorbed_surfaces に L5 detailed design / design_declarations / L7 TDD closure / runtime evidence を確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T23:44:47+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T23:44:47+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:4c20c762cc8fe7ccfe9444ce76d70876ff81d9ac6831160fa72f69ad66c63328"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:45:33+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:ce1eef761277168c2f93034ab523a41fd7c5e71e7a244729b9607d568e57a34b"
      - kind: smoke
        command: "bun src/cli.ts current-location --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:44:47+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:38efb3d03ee75b36f62b58fc1d0d1a79b22af7d2bacfc0b559c20d45fb0e2f36"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:45:33+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:005c42035039cecd262a037b203f3bf1fc3210cde8f33e8038e1f37b608877e3"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T23:39:00+09:00"
    tests_green_at: "2026-07-09T23:38:31+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "`current-location --summary-json` に `scrum_operation` を first-class field として追加し、ハイブリッド版 V+Scrum の運営層投影状態を raw JSON や Project view に回らず機械検出できるようにした。live repo では status=active、source_package=ハイブリッド設計ドキュメントv1-fixed.zip、source_binding_count=11、observed_count=12、missing_count=0 を確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T23:38:04+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: lint
        command: "bun run lint"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T23:38:04+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:f3f70f86d4dd70f8f995011d06705e1daa8478116058dd1b441acd7b608891e3"
      - kind: unit_test
        command: "bun run test:fast -- tests/cli-surface.test.ts -t \"Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:38:31+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:ea21f4b616bdc21ce55693300e19c3ee1361d567220dd9cfda21bb7979ad3baa"
      - kind: smoke
        command: "bun src/cli.ts current-location --summary-json"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T23:38:04+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:3c1c0bf27fe3e98b643fefc18e9acb4966b43cfcdb9341e6d3470fa110161c8c"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-08T07:57:06+09:00"
    tests_green_at: "2026-07-08T07:57:06+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "ZIP の typed spec / impact / tailoring / 工程表 current-location 境界を TS/Bun 実装へ接続し、design declarations、design references、design impact、L12 coverage、closure queue、drive route、vmodel fit が DB projection から再計算されることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:58d6182559414d8a12831ddad23bfb949d51944c5a78f49628e432870c90e0bd"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/design-declarations.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:973b345a06682be9837cef500c59358d9ddcbf54c4fd91d09fefdb1c6bda47e0"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/design-declarations.test.ts tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/vscode-extension-adapter.test.ts tests/cli-surface.test.ts tests/db-projection-ingestion.test.ts tests/projection-writer.test.ts tests/state-db.test.ts tests/slow/doctor.test.ts"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-08T07:57:06+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:ed4b4184dc553905a02b1c3a75d2158f0d1d20963f4668caa32692cbccbecb8a"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T09:59:42+09:00"
    tests_green_at: "2026-07-09T09:59:42+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Scrum 運営層の missing source を vmodel fit の blocker / regression guard / next action に接続し、current-location / roadmap / skill binding で検出済みの gap が fit 合否から漏れないことを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T09:55:14+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T09:55:30+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:c8f1cca259c4991c6788355ee5e4323f92f95cd2996af04c73211543bcc0872a"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T09:57:01+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:455f23d1a4c3445890b716583044990ada6b8db249e6c6e9361dc4ee26357009"
      - kind: doctor
        command: "bun run vitest run tests/slow/doctor.test.ts -t \"surfaces Project current-location|vmodel fit\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T09:57:57+09:00"
        evidence_path: tests/slow/doctor.test.ts
        output_digest: "sha256:955524e9cf869cac1c8d978ab1114fbf27179758f6d98944c70f0e298276422c"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-09T09:57:09+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T10:11:17+09:00"
    tests_green_at: "2026-07-09T10:11:17+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "ZIP source binding で bound になった Scrum 運営ソースを design_declarations へ synthetic typed declaration として自動投影し、scrum_operation_gap が current-location / vmodel fit から消えることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T10:08:04+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: unit_test
        command: "bun run vitest run tests/db-projection-ingestion.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:08:10+09:00"
        evidence_path: tests/db-projection-ingestion.test.ts
        output_digest: "sha256:d179f519d51c65ac497ceef01dd13a36550a23f8f5b31d8cd0461f2e8cadba0e"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:09:36+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:c8f1cca259c4991c6788355ee5e4323f92f95cd2996af04c73211543bcc0872a"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:11:04+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:455f23d1a4c3445890b716583044990ada6b8db249e6c6e9361dc4ee26357009"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-09T10:09:36+09:00"
        evidence_path: src/state-db/projection-writer.ts
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
      - kind: smoke
        command: "bun src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:08:40+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:38bfec99fe1001139dfa83a28224dc7fbc5c34d2a7c5e78d371ceee742a3c55c"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T10:32:30+09:00"
    tests_green_at: "2026-07-09T10:32:30+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "repair_failed_evidence の label-only failed command を、安全な解決候補ありと未解決に分離し、Recovery machine lane の次手を `safe_resolution_available` として DB/read-model/Project view に投影する。自動承認はせず、evidence patch/apply は approval-required のまま維持した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T10:29:11+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:02074e3546a575a65f7d28671ede367b7fc60dafef8625bc0952ef8b19ad36e1"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:31:27+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:c8f1cca259c4991c6788355ee5e4323f92f95cd2996af04c73211543bcc0872a"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-treeview.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:29:11+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:4ce2586a99efe303b304cf10cf4439dfb023cd7b0b5ad8b4301ecf282d4281a4"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:28:14+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:455f23d1a4c3445890b716583044990ada6b8db249e6c6e9361dc4ee26357009"
      - kind: smoke
        command: "bun src/cli.ts db rebuild"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:28:39+09:00"
        evidence_path: .helix/harness.db
        output_digest: "sha256:38bfec99fe1001139dfa83a28224dc7fbc5c34d2a7c5e78d371ceee742a3c55c"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-09T10:26:00+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:466c2f308b48c7661d646fdd068fbecea974c665fe65dbf8ed508f224180ce0b"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:04:21+09:00"
    tests_green_at: "2026-07-09T11:04:21+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "safe_resolution_available の probe が `bun run test:fast` を実行できることを確認し、probe が検出した impl-plan-trace orphan と V-model fit 表示期待値のズレを是正した。materialize は read-only のまま `ready_for_approval` まで進み、closure 適用は人間承認待ちとして保持した。"
    green_commands:
      - kind: unit_test
        command: "bun run vitest run tests/impl-plan-trace.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T10:57:59+09:00"
        evidence_path: tests/impl-plan-trace.test.ts
        output_digest: "sha256:5cb2945d8198ec8770564bbeb3cd3326eea48a20f11cda7d7bf4b587eae1b431"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T10:58:04+09:00"
        evidence_path: src/runtime/summary-surface-audit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:02:07+09:00"
        evidence_path: tests/visualization-view-model.test.ts
        output_digest: "sha256:de6bb6153739431a2d7f8aeae6ab603acf132577a2b45f65964c3b8e05ea0795"
      - kind: smoke
        command: "bun src/cli.ts closure evidence-probe --action repair_failed_evidence --limit 1 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record-20260709-safe-resolution-green.json --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:49:57+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:a9bc18fa90ceb65c3ac61d3f322dae4d74da747016ed2170c1f7223ebe7ce865"
      - kind: smoke
        command: "bun src/cli.ts closure evidence-materialize --action repair_failed_evidence --limit 1 --probe-record .helix/tmp/closure/repair_failed_evidence-probe-record-20260709-safe-resolution-green.json --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T10:55:00+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:6319931d83ce366476efa910a646af33acdf282ba68b2998da29e2288d9ce989"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:31:36+09:00"
    tests_green_at: "2026-07-09T11:31:36+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "repair_failed_evidence の machine lane を `limit 1` 誘導から、現在の repair queue 3件を一括 materialize / approval draft できる `limit 3` 誘導へ拡張した。apply は引き続き approval-required とし、承認前の自動化範囲を read-only materialize と approval draft までに限定した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:28:50+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:28:50+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:66a542bbd48fb8543127c87e065733618d3560068b75aa6745d98277f6a6e9c3"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:30:53+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:ec9fdc4100fb6498e54dc675c61989f09c9a7b7fc1a72226fadd1ac2d1fab92f"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:39:49+09:00"
    tests_green_at: "2026-07-09T11:39:49+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Recovery automation boundary で evidence lane の mutation 境界を `approval_required=true` / `execute_command=evidence-apply --execute` にそろえた。machine phase は probe/materialize/approval draft までを read-only で進め、patch/apply は approval record 必須として機械可読に固定した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:39:29+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:37:38+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:eab6ac72af1242ba8ed3523629ca5662a187ee8b292fdf4d880d21b0a6080b3c"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:39:04+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:68e0c11a83e83ad289b78a2eeeb9b729decb9b21a8fe32a33e57033f574a96b8"
      - kind: smoke
        command: "bun src/cli.ts recovery plan --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:39:29+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:3d8acfe9ba8d9cf2b8b496816eb0c1b3643ef06779864451bb7a0f2cdea8133a"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:39:29+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:1093614711e624e6a103261b66ec5f7210e11c7c6bef2512bc5af051d478df3e"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T11:53:04+09:00"
    tests_green_at: "2026-07-09T11:53:04+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view / read-model / vmodel handoff scope の evidence command limit を closure queue の現在件数に追従させた。実プロジェクトの repair_failed_evidence 3件では tree-view 上位コマンド、work bucket、materialize/apply 表示、close_ready reject ルートが `limit 3` になり、古い `limit 1` approval draft は scope mismatch として検出される。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T11:50:44+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:50:44+09:00"
        evidence_path: tests/visualization-view-model.test.ts
        output_digest: "sha256:2a797ac6b613c88ab68e26d7cfaa7cc44c335951ac5ab508f0ad1f326a2c1e66"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/cli-surface.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T11:52:26+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:151d320829a0b11e1773c37cc15cfcd8460725907c13381c4abfd52ab7bcd724"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:51:03+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:da2fcf9b255a6fe2ddfb0f90fa497b7c405d1da5eeb46eacee46b9b4be1dda52"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T11:51:03+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:e5a946c27a17160c838296350bdb90c5bf08dcd4f2a9a8fe16126a6ba8a717aa"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:04:02+09:00"
    tests_green_at: "2026-07-09T12:04:02+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "approval draft の approval_scope_digest が current materialize scope と不一致になった場合、既存 draft を上書きせず digest 付き refresh draft へ再発行する handoff next を vmodel fit と Project view に投影する。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:03:56+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:03:57+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:140f9612fb038b3718d444edf1938a2fc1a9afe42d4965b1da7141c1fea67b98"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:04:02+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:daef7db4012e9319b992f77642aed3f13f19286e80093a4eafbd76d41a6b38aa"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:21:00+09:00"
    tests_green_at: "2026-07-09T12:21:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "refresh approval draft を生成後、canonical stale draft ではなく matching refresh draft を active approval record として採用し、vmodel fit / Project view が approval_pending へ進むことを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:19:00+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:19:01+09:00"
        evidence_path: tests/visualization-read-model.test.ts
        output_digest: "sha256:d8c77dcaf558b8e90ba1c7949ccc4b3a9ed9c788c6f6d05268708d562b281d9a"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:19:06+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:b98f6a61aa236d5d83cbd23aeedaa2306b4f5083d2a7832f911816d5cc0ed76d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:34:00+09:00"
    tests_green_at: "2026-07-09T12:34:00+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "approval_pending に到達した後、人間承認者が stale canonical ではなく active refresh approval record を機械的に開けるよう、vmodel fit / Project view / CLI summary に approval_record_path を投影した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:32:10+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts tests/cli-surface.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:33:39+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:386058ebc9cc55f28d8a4602fef1e5a00174cf5aa9280c59a9022a528b665be6"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:33:45+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:4abdac235b064b5781e4430a3d5450edb317f81dc7aec82594a2e0c723790b11"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:42:43+09:00"
    tests_green_at: "2026-07-09T12:42:43+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view の recovery handoff gate が repoRoot 非依存の view-model 経路でも active refresh approval draft の実 path を採用し、vmodel fit と同じ approval_record_path を機械表示できることを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts tests/cli-surface.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:2b06fa546cc67897c7f00cccbf29aea8d769dd587cb53f1bea1c1a7527b29b75"
      - kind: smoke
        command: "bun src/cli.ts progress view-model --json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:3c1629b0619c04b737e2b10073edee3e194404c19a0756b393dd7acef85dedd1"
      - kind: smoke
        command: "bun src/cli.ts vmodel fit --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:42:43+09:00"
        evidence_path: src/vmodel/fit.ts
        output_digest: "sha256:acc4b4cc35d8bc030e3c8a375f915cf4b07254d96e1f3fbb1c59561ad9457b00"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T12:52:16+09:00"
    tests_green_at: "2026-07-09T12:52:16+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view の recovery plan 配下へ handoff gate を追加し、DB recovery reentry が machine_phase_pending のままでも active refresh approval draft により local handoff が approval_pending へ進んだことを同じ recovery plan surface で確認できるようにした。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/current-location.test.ts tests/cli-surface.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:482e828509c63f370c7bf2c09c39f2f6da22c30b26d1d5aac4f762e8cfe446cc"
      - kind: smoke
        command: "bun src/cli.ts progress view-model --json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:65f784e967005601092051fe32c147c7fde1be4c87f79fd169fd9eff44108c10"
      - kind: smoke
        command: "bun src/cli.ts progress tree-view --json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T12:52:16+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:870e58393cdd1417c3f85d6804ffbe131ed3d1d4cd3055be0fadf21db0614063"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:16:26+09:00"
    tests_green_at: "2026-07-09T13:16:26+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Vモデルfit の実体を state-db read-model 側へ移し、旧 vmodel path は証跡アンカーへ縮退した。ZIP manifest と design declaration parser は schema 側の中立検出器へ寄せ、current-location / Project view / projection-writer が vmodel module へ戻る静的依存を持たないことを dependency-drift で確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:16:26+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/plan-entry-routing.test.ts tests/dependency-drift.test.ts tests/current-location.test.ts tests/vmodel-zip-manifest.test.ts tests/design-declarations.test.ts tests/goal-evidence-audit.test.ts tests/coding-rules.test.ts tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/projection-writer.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:16:26+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:f21b53bb1a371126766a3b459467aa1351093454bd9fdd10cf92495d9edede58"
      - kind: smoke
        command: "bun -e 'import { analyzeDependencyDrift, loadDependencyDriftInput } from \"./src/lint/dependency-drift\"; const r=analyzeDependencyDrift(loadDependencyDriftInput(process.cwd())); console.log(JSON.stringify({ok:r.ok,count:r.findings.length,errors:r.findings.filter(f=>f.severity===\"error\").length,warnings:r.findings.filter(f=>f.severity===\"warn\").length,findings:r.findings}, null, 2));'"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:16:26+09:00"
        evidence_path: src/lint/dependency-drift.ts
        output_digest: "sha256:f6fa5ac850c768a325485423ae0809b688ea5dc6413ba55f8d1ab8df05b9e42e"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:34:28+09:00"
    tests_green_at: "2026-07-09T13:34:28+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Recovery machine lane の `closure evidence-probe --execute --out` が既存 probe record を検出した場合、DB rebuild や `bun run test:fast` 実行前に fail-fast するようにした。既存 record 上書きは引き続き拒否し、承認前の evidence handoff artifact を壊さない。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:34:28+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"writes executed evidence probe records\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:34:28+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:63d893a4e6bee60bcb2544a33ccbe6de1fc677266ac7608636fee2b5121c481f"
      - kind: smoke
        command: "bash -lc 'bun src/cli.ts closure evidence-probe --action repair_failed_evidence --limit 3 --execute --out .helix/tmp/closure/repair_failed_evidence-probe-record.json --summary-json; test $? -eq 2'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:34:28+09:00"
        evidence_path: .helix/evidence/green-command/20260711-plan-l7-397-retired-closure-evidence.json
        output_digest: "sha256:ed343eadd4087e6df0e5fd8018496826c7c4d486d2866df782f94c8ba83f123d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:41:36+09:00"
    tests_green_at: "2026-07-09T13:41:36+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "DB current-location が machine_phase_pending のままでも、ローカル handoff artifact が approval_pending まで進んでいる状態を `current-location --summary-json` と `recovery plan --summary-json` に併記した。Project view / vmodel fit だけでなく、工程表・駆動モデル summary でも承認待ちの現在地を機械判定できる。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:41:36+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:41:36+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:cd82ad72adc04f47dade95b7344d6cff12a7a6a71824b08a40cd6e89117c23f5"
      - kind: smoke
        command: "bash -lc 'bun src/cli.ts current-location --summary-json | rg -n \"local_handoff|approval_pending|approval_record_path\" -C 1 && bun src/cli.ts recovery plan --summary-json | rg -n \"recovery_handoff_gate|approval_pending|approval_record_path\" -C 1'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:41:36+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:c0bde01688a1349ddd96f3d3563323a6639344543c149a2305861227cfca23fe"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T13:51:45+09:00"
    tests_green_at: "2026-07-09T13:51:45+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "Project view の work bucket / automation runway / closure overview が stale canonical approval draft ではなく、scope match 済み active refresh approval draft をコピー対象にするよう修正した。承認者が同じ `approval_record_path` を handoff gate、V-model next action、closure work bucket のどこからでも辿れる。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:50:08+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-read-model.test.ts tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts tests/vscode-extension-adapter.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:50:08+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:07aadf8395cc65cf707e9b9f4b73623fb22c4d3ff037be0444937c5384163724"
      - kind: smoke
        command: "bash -lc 'bun src/cli.ts progress tree-view --json | rg -n \"automation-runway/1-repair_failed_evidence/approval-draft|work-bucket/approval-draft-artifact|repair_failed_evidence-approval-draft-refresh-0735\" -C 1'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:50:08+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:7838416b720cf27b18c7aaa9d582e7c9ca5374fda4d1167c00781d2518ce80e2"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:51:45+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:448e2bc9d56c672f93673405f5deacbe7deaaf36a190d83c71f7674ffc3fea5b"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:05:57+09:00"
    tests_green_at: "2026-07-09T14:05:57+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "`reentry_status=machine_phase_pending` を raw DB forecast として残しつつ、local handoff が approval_pending へ進んだ場合の実効現在地を `effective_reentry_status` / `effective_status` として `current-location --summary-json`、`recovery plan --summary-json`、`vmodel fit --summary-json` に投影した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:8e5b0e462ad8e72ad5a10bf945d81792774c853cbb68e8d2b3af86b425d456bd"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-view-model.test.ts tests/visualization-treeview.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: tests/visualization-view-model.test.ts
        output_digest: "sha256:1389eeae9f776b5c34537f04c0ed5c136b3508af556d67d3d53a4670c374b6a8"
      - kind: smoke
        command: "bash -lc '{ bun src/cli.ts current-location --summary-json | rg -n \"reentry_status|effective_reentry_status|local_handoff|approval_pending|machine_phase_pending\" -C 1; bun src/cli.ts recovery plan --summary-json | rg -n \"reentry_forecast|effective_status|recovery_handoff_gate|approval_pending|machine_phase_pending\" -C 1; bun src/cli.ts vmodel fit --summary-json | rg -n \"current_reentry_status|effective_reentry_status|effective_status|recovery_handoff_gate|approval_pending|machine_phase_pending\" -C 1; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T13:59:21+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:242600338707fb7f7950bb4427cdf4585c56c09e5630255a370addd689e45512"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:05:57+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:077a0faa8bad8b38c49af98d2867636d2454b32e20ac21e2bddda7ffa871aab6"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:21:25+09:00"
    tests_green_at: "2026-07-09T14:21:25+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "raw `machine_phase_pending` を保持しながら、CLI 通常テキスト、doctor、Project view / VSCode tree view の reentry 表示を handoff-aware な `effective=approval_pending` へ揃えた。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: src/vscode/tree-view-provider.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:4f31abcee6eb81ed650e4bd0bb373ffad21157f72fe971858c629aeb3102de43"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:db1e1c912b21ee5b5248abcd337429eb464c624605121426e419b391a3db06cb"
      - kind: smoke
        command: "bash -lc '{ bun src/cli.ts current-location | rg -n \"recovery-reentry: status=machine_phase_pending effective=approval_pending\"; bun src/cli.ts recovery plan --limit 3 | rg -n \"reentry-forecast: status=machine_phase_pending effective=approval_pending\"; bun src/cli.ts vmodel fit | rg -n \"synthesis: .*reentry=machine_phase_pending effective=approval_pending|recovery-reentry: status=machine_phase_pending effective=approval_pending\"; bun src/cli.ts progress tree-view --json | rg -n \"approval_pending raw=machine_phase_pending|reentry=approval_pending|effective=approval_pending\" -C 1; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:18:58+09:00"
        evidence_path: src/state-db/visualization-view-model.ts
        output_digest: "sha256:621c5eff1be0f1d4ac682136c15720d2b3ad321a119e7afa47204817ece3ba61"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:21:25+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:95b00909dcec11dad11776208b34da1153a5f8a752bd44500444ac203c274772"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:29:49+09:00"
    tests_green_at: "2026-07-09T14:29:49+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "L12 operation scope の `observed_gap` を regression guard へ昇格し、missing/reverify が無い設計済み未観測 scope を `operation-scope:watch` として CLI / doctor / Project view read-model に投影するようにした。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts -t \"operation\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:fbc3675959fd9d93802f44abed3bda7070837b940d52e1db544b58855f067154"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:8e5f6ed25f0ccdeb479bb43d3cb986de4856ed736a1de050ea8ec912ab5eeaad"
      - kind: unit_test
        command: "bun run vitest run tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: tests/visualization-treeview.test.ts
        output_digest: "sha256:e3e46c89c822ea109423aeca7ce339801020234758987ccdcac022d4a8f6953f"
      - kind: smoke
        command: "bash -lc 'set -o pipefail; { bun src/cli.ts vmodel fit | rg \"regression-guard: operation-scope watch count=5|operation-scope: designed=5 observed=1 observed_gap=5\"; bun src/cli.ts doctor | rg \"operation-scope:watch:5|vmodel-fit - operation-scope: designed=5 observed=1 observed_gap=5\"; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: src/state-db/vmodel-fit.ts
        output_digest: "sha256:9b1b40924c8980587120e3775c06b83a4d8b34022419729eb64b3a0291c63fd2"
      - kind: doctor
        command: "bun src/cli.ts doctor"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:29:49+09:00"
        evidence_path: src/doctor/index.ts
        output_digest: "sha256:36607a366efda9954059a2ff7d84e3ea265c8a617ff47bbe67c3f27d38893f29"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:38:06+09:00"
    tests_green_at: "2026-07-09T14:38:06+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "`vmodel fit --summary-json` の regression guard 要約で pass 先頭5件が watch/fail を隠す問題を解消し、`attention_guards` と非pass優先 `sample_guards` で operation-scope / current-location-reentry を機械的に見えるようにした。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:38:06+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:38:06+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:e971e1d66b2e61d3212f4f5d2c7f18933e409dafbb07b181baa01e4e8216fbb4"
      - kind: smoke
        command: "bash -lc 'set -o pipefail; bun src/cli.ts vmodel fit --summary-json | rg \"attention_guards|operation-scope|current-location-reentry|sample_guards\" -C 2'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:38:06+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:6b3015e3964d0797d221dc11fa09ba02d0e4f0b0d0f82e2ab683018edcd6ebe3"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:47:09+09:00"
    tests_green_at: "2026-07-09T14:47:09+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "L12 operation scope の KPI/metric 観測を `quality_signals` へ接続し、既存 telemetry / skill metric 証跡を `kpi_metric` observed として Project current-location / vmodel fit に投影した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:47:09+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/db-projection-ingestion.test.ts tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:47:09+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:1b6bdef98b68c3ac956492e740fc7243f77e5c20d9ba796a36e7e92b22e9b345"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:47:09+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:de8c7cee6b6843e6be9117155db41ff7218cf57d9041ff4746f9b379659db807"
      - kind: smoke
        command: "bash -lc 'set -o pipefail; { bun src/cli.ts current-location --summary-json | rg \"\\\"operation_scope\\\"|\\\"observed\\\": 2|\\\"observed_gap\\\": 4\" -A 8; bun src/cli.ts vmodel fit | rg \"regression-guard: operation-scope watch count=4|operation-scope: designed=4 observed=2 observed_gap=4\"; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:47:09+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:b0b193e87bc4efb9c1fe0a6e1a0d430f6c43f1837e83b91141d70e3af36a909d"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T14:55:32+09:00"
    tests_green_at: "2026-07-09T14:55:32+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "L12 operation scope のログ設計観測を `hook_events` / session log 証跡へ接続し、既存 hook events を `log_design` observed として Project current-location / vmodel fit に投影した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T14:55:32+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run vitest run tests/current-location.test.ts tests/db-projection-ingestion.test.ts tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:55:32+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:cbbe85a7cf83e1eca086a9b11478aaa21e0f9d8b0964b3dcd1d96af901b46e07"
      - kind: unit_test
        command: "bun run vitest run tests/cli-surface.test.ts -t \"exposes Project view current-location\""
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T14:55:32+09:00"
        evidence_path: tests/cli-surface.test.ts
        output_digest: "sha256:9ff88ed4ba75d313f1bfb4225664adc15159badf1e494fab1fdb286f582d2bba"
      - kind: smoke
        command: "bash -lc 'set -o pipefail; { bun src/cli.ts current-location --summary-json | rg \"\\\"operation_scope\\\"|\\\"observed\\\": 3|\\\"observed_gap\\\": 3\" -A 8; bun src/cli.ts vmodel fit | rg \"regression-guard: operation-scope watch count=3|operation-scope: designed=3 observed=3 observed_gap=3\"; }'"
        runner: bash
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T14:55:32+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:36c0f103841e02028111ce952e14d1cd6fa6ffc2f53059d41f851260f8252226"
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-09T19:17:11+09:00"
    tests_green_at: "2026-07-09T19:17:11+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex
    scope: "closure queue の failed evidence 判定を latest failure / latest passed evidence の時刻比較へ厳格化した。失敗履歴は DB に保持しつつ、最新 pass が failure 以降なら修復済みとして `evidenceGaps` / `repair_targets` / `repair_plan` から除外し、未修復 component だけを `repair_failed_evidence` に送る。version-up parked / live backlog boundary 除外と合わせ、Project current-location の次手が履歴ノイズで誤描画されないことを確認した。"
    green_commands:
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-09T19:16:56+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:8366207267355d3e3d5bf3bf6e8c94c5f93f6078c34f08973fa2b38cdda6cc92"
      - kind: unit_test
        command: "bun run test:fast -- tests/current-location.test.ts tests/visualization-treeview.test.ts tests/visualization-view-model.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-09T19:16:56+09:00"
        evidence_path: tests/current-location.test.ts
        output_digest: "sha256:bb63c9af4bf44ab1d9f11f6de55824df4422b5c82f2fe77493d007070babf0ea"
      - kind: smoke
        command: "bun run src/cli.ts closure batch --action close_ready --limit 5 --summary-json"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-09T19:17:11+09:00"
        evidence_path: src/state-db/current-location.ts
        output_digest: "sha256:402601a9d25a1e4c16ab3cfec96a6a121890761db16b9d5011912aabe3455e82"
      - kind: smoke
        command: "git diff --check"
        runner: bash
        scope: changed-files
        exit_code: 0
        completed_at: "2026-07-09T19:16:56+09:00"
        evidence_path: docs/plans/PLAN-L7-397-vmodel-current-location-projection.md
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-397: ZIP/L12 current-location projection 実装

## §0 目的

`ハイブリッド設計ドキュメントv1-fixed.zip` の採用判断を、設計 prose だけでなく harness.db の projection と
Project view に接続する。設計から typed declaration、参照、影響範囲、現在地、closure queue、駆動モデルを
機械的に再計算し、L14 到達 claim と open L7 のような矛盾を見逃さないようにする。

## §1 実装範囲

- `src/schema/design-declarations.ts` で Markdown/YAML frontmatter と `spec.defines` 相当の typed declaration を読み、`src/vmodel/design-declarations.ts` は証跡互換の re-export とする。
- `src/schema/harness-db-tables-design.ts` と `src/schema/harness-db-types.ts` で design projection table を schema registry へ登録する。
- `src/state-db/projection-writer.ts` で ZIP source binding が bound になった Scrum 運営ソースを `design_declarations` へ自動投影する。
- `src/state-db/current-location.ts` で L0-L14 既存成果物を L12 へ再投影し、設計カバレッジ、ZIP 採用、tailoring、operation scope、closure queue、drive route を返す。
- CLI は `helix current-location --json`、`helix vmodel fit --json`、`helix closure ...`、`helix progress tree-view --json` から同じ read-model を参照する。`buildVmodelFitReport` の実体は `src/state-db/vmodel-fit.ts` に置き、`src/vmodel/fit.ts` は証跡アンカーとして dependency-free に保つ。
- 2026-07-09 追補: Scrum 運営層の `scrum_operation_gap` を `vmodel fit` の blocker、`scrum-operation` regression guard、next action に接続し、roadmap / skill binding で見えている欠落が fit 合否から漏れないようにする。

## §2 受入条件

- design declaration / reference / impact が harness.db projection に登録される。
- L12 design coverage gate が typed declaration を根拠に `pass / needs_design` を返す。
- ZIP adoption と solo tailoring gate が missing / na / declared を区別する。
- L14 到達 claim と open L7 が併存する場合、current-location は `needs_recovery` と Reverse drive route を返す。
- Project view は DB/read-model 由来で `V-model fit`、ZIP adoption、tailoring gate、closure queue、operation scope を表示する。
- `scrum_operation_gap` が存在する場合、`helix vmodel fit --json` は `scrum_operation_gap` blocker、`scrum-operation` guard、`vmodel-fit:scrum_operation_gap` next action を返す。
- ZIP source binding が bound の Scrum 運営ソースは `source=zip_source_binding` の `design_declarations` として DB に投影され、`scrum_operation_gap` を解消する。

## §3 スケジュール

- step 1 (mode: serial): typed declaration parser と design projection table を実装する。
- step 2 (mode: serial): current-location / closure queue / drive route を harness.db projection へ接続する。
- step 3 (mode: serial): Project view と CLI surface を接続し、関連回帰で確認する。
