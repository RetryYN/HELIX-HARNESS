---
plan_id: PLAN-L7-583-workflow-classification-drive-run-projection
title: "PLAN-L7-583 (impl): typed workflow identityをdrive_runsへ投影し旧modeをcompatibilityへ隔離する"
kind: impl
layer: L7
drive: db
status: confirmed
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RETROFIT
entry_signals: ["po_directive:Issue #694 typed DB projection migration slice"]
created: 2026-08-18
updated: 2026-08-18
owner: Codex / TL
github_issue_id: 694
behavior_contract_id: WORKFLOW-CLASSIFICATION-DRIVE-RUN-PROJECTION-001
responsibility_owner: workflow-classification-drive-run-projection
engineering_discipline_required: true
change_slice: atomic
refactor_step: migrate_one_consumer
legacy_retirement_state: consumer_migration
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "typed PLAN identityはplan_registryへ投影済みだが、drive_runsとroute_modesが旧modeをcurrent identityとして再出力している"
contract_postconditions: "typed PLAN identityはdrive_runsの独立5列へexact投影され、legacy mode／route_modesはtyped PLANから隔離される"
contract_invariants: "requirements registryとPLAN sourceがauthorityであり、legacy identityをtyped PLANのcurrent DB outputへ再出力しない"
contract_failures: "typed identityのschema／registry／entity不整合をidentity欠落やlegacy modeへのfallbackで隠さずrebuildをfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "既存projection writerの実測gapを同一atomic patchのschema・projection・oracleで是正し、テストを先に記録したふりをしない"
complexity_effect: justified_positive
complexity_justification: "既存drive_runsへtyped identity列を追加し、別resolverや旧modeの意味正本を増やさない"
removal_trigger: "legacy PLANの互換inventory利用が0になり、route_modesとmodeのcurrent consumerが廃止された時点"
parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md
pair_artifact: docs/test-design/helix/L8-workflow-classification-drive-run-projection-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md, oracle_id: U-DBWID-007, test_path: tests/slow/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md, oracle_id: U-DBWID-008, test_path: tests/slow/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md, oracle_id: U-DBWID-009, test_path: tests/slow/projection-writer.test.ts }
  - { parent_design: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md, oracle_id: U-DBWID-010, test_path: tests/slow/projection-writer.test.ts }
review_evidence:
  - reviewer: Codex TL
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-08-17T21:02:50.922Z"
    tests_green_at: "2026-08-17T21:02:26.096Z"
    verdict: pass
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: typecheck
        command: "npx --no-install tsc --noEmit"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T21:00:35.491Z"
        evidence_path: tsconfig.json
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
      - kind: unit_test
        command: "npx --no-install vitest run tests/state-db-schema-authority.test.ts tests/l3-g3-freeze-packet-v2.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T21:01:34.222Z"
        evidence_path: tests/l3-g3-freeze-packet-v2.test.ts
        output_digest: "sha256:948ecb999d92938474b25c47c86b7a7dade287cdf2647f79802cdc8389e3c23f"
      - kind: unit_test
        command: "npx --no-install vitest run tests/slow/projection-writer.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-08-17T21:02:26.096Z"
        evidence_path: tests/slow/projection-writer.test.ts
        output_digest: "sha256:79b310d4627e614b7dc5e7828de2af17ce7154c0ade80e39658fbbfb56239eb0"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-17T21:02:40.000Z"
  review_binding:
    reviewer: Codex TL
    reviewed_at: "2026-08-17T21:02:50.922Z"
    evidence_digest: "sha256:0baf1a47749519bd96b27b49d9946a339ee4b5005d89582eabaab75c119bf88e"
  entries: []
agent_slots:
  - { role: se, slot_label: "SE — typed drive_runs projection boundary" }
  - { role: qa, slot_label: "QA — typed／legacy DB replay反例" }
  - { role: tl, slot_label: "TL — requirements authorityと#694 consumer migration境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-583-workflow-classification-drive-run-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-classification-drive-run-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-classification-drive-run-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/schema/harness-db-tables-core.ts, artifact_type: source_module }
  - { artifact_path: src/state-db/projection-writer.ts, artifact_type: source_module }
  - { artifact_path: tests/slow/projection-writer.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: docs/plans/PLAN-L3-55-workflow-classification-registry.md
  requires:
    - docs/plans/PLAN-L7-575-plan-registry-workflow-identity-projection.md
    - docs/plans/PLAN-L7-568-workflow-classification-legacy-adapter.md
  references:
    - docs/plans/PLAN-L7-580-workflow-classification-catalog-doctor.md
  blocks: []
---

# typed workflow identity drive_runs投影

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | L6/L8 pairと#694のDB consumer境界を確定 | [直列] | U-DBWID-007..010がexact trace |
| 2 | `drive_runs` schemaとprojectionを実装 | [直列] | targeted tests green、legacy互換green |
| 3 | DB rebuild／replay／doctorを検証 | [直列] | current typed identityとlegacy inventoryが相殺なしでgreen |
| 4 | Claude Codeによるcurrent HEAD独立レビュー | [review] | blocker 0、sealed receipt |

`routeSignalToMode` consumer、CLI help、README／process文書、物理`route_modes`削除は後続の#694原子的sliceへ分離する。

## 技術レビュー境界

Codex TLが、current implementation sliceに対してtypecheckとtyped projectionのtargeted testを実測し、上記の`intra_runtime_subagent` review evidenceを記録した。これは実装sliceの技術的freezeであり、全体完了やPR受入れの主張ではない。`completion_claim_allowed: false`を維持し、Step 4のClaude Codeによるcurrent HEAD独立レビューとsealed receiptが成立するまでPRはdraft・merge不可とする。
