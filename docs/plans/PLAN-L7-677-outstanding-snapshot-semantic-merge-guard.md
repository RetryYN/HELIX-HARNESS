---
plan_id: PLAN-L7-677-outstanding-snapshot-semantic-merge-guard
title: "PLAN-L7-677 (impl): outstanding snapshotのsemantic merge driftをpush前に拒否する"
kind: impl
layer: L7
drive: db
status: draft
completion_claim_allowed: false
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: RECOVERY
entry_signals:
  - "po_directive:Issue #1052 outstanding snapshotのsemantic merge driftをpush前に拒否する"
created: 2026-08-26
updated: 2026-08-26
owner: Codex / TL
github_issue_id: 1052
behavior_contract_id: OUTSTANDING-SNAPSHOT-SEMANTIC-GUARD-001
responsibility_owner: outstanding-snapshot-guard
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: pure_function
contract_preconditions: "committed outstanding snapshotとlive db rebuild projectionを同一repo rootで読める"
contract_postconditions: "count/list、exact PLAN set、blockers、required_actionsのsemantic mismatchをpush/PR作成前にfail-closeし、明示修復commandを返す"
contract_invariants: "guard自身はsnapshot/DBを書き換えず、previous/legacy snapshotでcurrent failureを相殺しない"
contract_failures: "JSON parse成功、Git conflict 0、または片側採用でもsemantic driftを見逃さない"
tdd_red_required: true
red_test: "U-OUTMERGE-001/002がcount/listまたはblocker/action片側採用とlive duplicateを検出する"
complexity_effect: net_neutral
complexity_justification: "既存snapshot writer/verifyとmerge-readinessへ同一pure guardを接続し、別owner/state/jobを増やさない"
removal_trigger: "outstanding snapshotがDB projectionへ完全統合され、独立generated surfaceが廃止された時"
parent_design: docs/design/harness/L6-function-design/governance-enforcement.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OUTMERGE-001, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OUTMERGE-002, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OUTMERGE-003, test_path: tests/outstanding.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OUTMERGE-004, test_path: tests/github-merge-readiness.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-677-outstanding-snapshot-semantic-merge-guard.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: src/lint/outstanding-snapshot.ts, artifact_type: source_module }
  - { artifact_path: src/audit/github-merge-readiness.ts, artifact_type: source_module }
  - { artifact_path: src/cli.ts, artifact_type: source_module }
  - { artifact_path: tests/outstanding.test.ts, artifact_type: test_code }
  - { artifact_path: tests/github-merge-readiness.test.ts, artifact_type: test_code }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
dependencies:
  parent: PLAN-L7-408-objective-decision-count-binding
  requires:
    - docs/plans/PLAN-L7-408-objective-decision-count-binding.md
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — semantic merge mutation oracle" }
  - { role: se, slot_label: "SE — push前 early surface接続" }
  - { role: tl, slot_label: "TL — current/legacy snapshot authority確認" }
---

# outstanding snapshot semantic merge guard（意味照合）

## 目的

Issue #1052で確認された、JSONとしては妥当でも`decision_count`、`plan_ids`、blocker、required actionが異なる
投影元から混在するsemantic merge driftを、pushやPR作成より前に検出する。live projectionの算出は既存の
`computeOutstandingWork`へ集約し、snapshotの修復や新しいDB／state／jobの追加は行わない。

## 対象契約

- `decision_count`と`plan_ids.length`、およびliveの件数をexact一致させる。
- `plan_ids`は重複なしのexact PLAN集合としてlive projectionと比較する。
- `blockers`と`required_actions`は重複なしのsorted exact集合として比較する。
- 不一致時は`helix db rebuild`を修復commandとして提示し、guardは自動書込みしない。
- previous／legacy側のsnapshotがgreenでも、current projectionの失敗を相殺しない。

## 実装順

1. count/list、blocker/action、live duplicateの反例をRed固定する。
2. `inspectOutstandingSnapshot`へ既存live projectionとcommitted snapshotのsemantic照合を集約する。
3. `helix guard outstanding-snapshot`へ早期surfaceを追加する。
4. GitHub merge-readinessとPR作成前判定へ同じviolationをAND接続する。
5. snapshot再生成後にtargeted test、typecheck、Biome、PLAN lint、DB rebuild／replayを実測する。
6. current HEADのClaude独立検収、CI、main read-afterで終端する。

## 受入条件

- JSON parse成功、Git conflict markerなし、片側採用のいずれでもsemantic driftをgreenにしない。
- live projectionの件数、exact PLAN集合、blockers、required_actionsがcommitted snapshotと一致する。
- guardは自動修復せず、再生成commandと違反を返す。
- `helix github merge-readiness`およびPR作成前判定がguard違反時にfail-closeする。
- 既存のsnapshot writer、DB rebuild、projection／replay、authorityを二重実装しない。
