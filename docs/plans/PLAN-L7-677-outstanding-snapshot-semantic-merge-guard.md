---
plan_id: PLAN-L7-677-outstanding-snapshot-semantic-merge-guard
title: "PLAN-L7-677 (impl): outstanding snapshotのsemantic merge driftをpush前に拒否する"
kind: impl
layer: L7
drive: db
status: confirmed
backfill_state: complete
completion_claim_allowed: true
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
red_at: "2026-08-26T01:35:54Z"
green_at: "2026-08-26T02:08:44Z"
mutation_oracle_evidence: "U-OUTMERGE-005が、inspectOutstandingSnapshotのokを常にtrueへ変異したseeded mutantをkillする（1 failed / 39 passed）。U-OUTMERGE-001/002はverifyOutstandingSnapshotTextのcount/list、blocker/action、live duplicateのsemantic driftを個別にkillする（各変異で1 failed）。レビュー記録: https://github.com/RetryYN/HELIX-HARNESS/pull/1053#issuecomment-5419389093。"
red_test: "U-OUTMERGE-001/002/005がcount/listまたはblocker/action片側採用、live duplicate、guard ok値の退行を検出する"
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
  - { parent_design: docs/design/harness/L6-function-design/governance-enforcement.md, oracle_id: U-OUTMERGE-005, test_path: tests/outstanding.test.ts }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-08-26T02:10:24Z"
    tests_green_at: "2026-08-26T02:08:44Z"
    verdict: approve
    worker_model: gpt-5.4-codex
    reviewer_model: claude-opus-5
    reviewer_session_id: c7895aff-da7e-47a0-944a-36c68bb4f251
    scope: "PR #1053 final HEAD 5a5cce880a11b530d0f137ef0b2faad191427677をClaude Code Opusが独立検収し、semantic snapshot guard、negative mutation oracle、merge-readiness接続、DB projection／replayを確認してblocker 0 approveとした。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/1053#issuecomment-5419627426"
    green_commands:
      - kind: smoke
        command: "gh run view 32920383182 --json status,conclusion,headSha,updatedAt,url"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-08-26T02:08:44Z"
        evidence_path: tests/outstanding.test.ts
        output_digest: "sha256:2a46b5fb9aab3e3755dca7deff5cd6de9af789ca965a846646147abb959d28d9"
        result: "terminal success / HEAD 5a5cce880a11b530d0f137ef0b2faad191427677"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-08-26T02:10:24Z"
  review_binding:
    reviewer: "Claude Code / claude-opus-5"
    reviewed_at: "2026-08-26T02:10:24Z"
    evidence_digest: "sha256:fae311674d259603d3308321efb355c340c55adac61a898aec719e3f36115113"
  entries: []
generates:
  - { artifact_path: docs/plans/PLAN-L7-677-outstanding-snapshot-semantic-merge-guard.md, artifact_type: markdown_doc }
modifies:
  - { artifact_path: docs/design/harness/L6-function-design/governance-enforcement.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/worker-wrapper-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/governance/feedback-refactor-disposition.json, artifact_type: json_config }
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

## main read-after 終端証拠

Claudeのcurrent-HEADレビュー証拠と、後続のmain read-after証拠は別の時系列として保持する。
main post-merge harness-check run `32935749811` は `2026-08-26T06:15:47Z` に
main HEAD `2ef1d3bffa5c9d6a49a3110e5e260b957ce97b2b` でterminal successとなり、
`docs/governance/generated/outstanding-snapshot.json` の検証を完了した。

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
5. CLI command追加で変動した既存source digest ownerだけを正本値へ更新し、他のrefactor候補や設計意味論は変更しない。
6. snapshot再生成後にtargeted test、typecheck、Biome、PLAN lint、DB rebuild／replayを実測する。
7. current HEADのClaude独立検収、CI、main read-afterで終端する。

## 受入条件

- JSON parse成功、Git conflict markerなし、片側採用のいずれでもsemantic driftをgreenにしない。
- live projectionの件数、exact PLAN集合、blockers、required_actionsがcommitted snapshotと一致する。
- guardは自動修復せず、再生成commandと違反を返す。
- `helix github merge-readiness`およびPR作成前判定がguard違反時にfail-closeする。
- 既存のsnapshot writer、DB rebuild、projection／replay、authorityを二重実装しない。
