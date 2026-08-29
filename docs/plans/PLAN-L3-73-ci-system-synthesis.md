---
plan_id: PLAN-L3-73-ci-system-synthesis
title: "PLAN-L3-73 (add-design): CI System SynthesisをL3/L10へ分解する"
kind: add-design
layer: L3
drive: agent
status: confirmed
completion_claim_allowed: false
l3_human_approval:
  schema_version: helix-l3-human-approval.v1
  approval_kind: human_po
  decision: approve
  approver: RetryYN
  approved_at: "2026-08-29T14:23:37Z"
  plan_id: PLAN-L3-73-ci-system-synthesis
  approval_record_id: L3-PO-1034-001
  approval_source: github_pr_comment
  approval_source_url: "https://github.com/RetryYN/HELIX-HARNESS/pull/1209#issuecomment-5462941573"
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.6
  registry_source_digest: sha256:5cc5ea83dbfa2c1f1e4d7559d4be839292e38be40222d2925f34ae45c0766a89
  target_axis: workflow_model
  target_id: PERFORMANCE_REFACTOR
entry_signals:
  - "po_directive:2026-08-29 CI責務分離、作業単位CI導出、局所最適、critical-path全体統制によるCI改革を要求化する"
created: 2026-08-29
updated: 2026-08-29
owner: Codex / TL
github_issue_id: 1034
behavior_contract_id: CI-SYSTEM-SYNTHESIS-001
responsibility_owner: ci-system-synthesis
engineering_discipline_required: true
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: no_change
ddd_modeling_decision: aggregate
contract_preconditions: "System Synthesis、Impact CI、Module Registry、Lite selector、full regression shard authorityが存在する"
contract_postconditions: "CIS-FR-001..005、CIS-R-01..15、CIS-AC-001..015と#1204..1208の責務がL3↔L10でexact対応する"
contract_invariants: "required verificationを最適化対象から外し、selector／scheduler／LLMが証明義務を削除しない"
contract_failures: "unknown impact、orphan obligation、wrong HEAD、stale digest、unauthorized skip、deferred回収欠落をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "本sliceはL3/L10要求とnegative oracle設計だけを追加し、runtime実装を#1204..1208へ分離する"
complexity_effect: justified_positive
complexity_justification: "個別selectorとworkflow分岐を一つの責務registry／verification planへ収束させるための最小追加aggregate"
removal_trigger: "CI compositionがSystem Synthesis正本へ完全吸収され、本差分authorityが不要になった時"
parent_design: docs/design/helix/L3-requirements/system-synthesis-requirements.md
pair_artifact: docs/test-design/helix/ci-system-synthesis-acceptance.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
dependencies:
  parent: docs/design/helix/L3-requirements/system-synthesis-requirements.md
  requires: []
  blocks:
    - issue:1204
    - issue:1205
    - issue:1206
    - issue:1207
    - issue:1208
  references:
    - issue:1033
    - issue:1002
    - issue:1084
    - docs/design/helix/L3-requirements/github-ci-performance-requirements.md
agent_slots:
  - { role: tl, slot_label: "TL — CI責務境界、既存selector再利用、依存順" }
  - { role: qa, slot_label: "QA — obligation omission、stale receipt、deferred欠落mutation" }
generates:
  - { artifact_path: docs/plans/PLAN-L3-73-ci-system-synthesis.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/ci-system-synthesis-requirements.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/ci-system-synthesis-acceptance.md, artifact_type: test_design }
modifies:
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: yaml_config }
  - { artifact_path: docs/governance/generated/outstanding-snapshot.json, artifact_type: json_config }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/design-coverage.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
---

# CI System Synthesis要求差分

## 工程表

| Step | 作業 | 完了条件 |
|---|---|---|
| 1 | 現行Impact CI／Lite／Module／shard責務を棚卸し | 重複ownerと不足責務が分類される |
| 2 | telemetry、registry、plan、scheduler、recoveryを分離 | 5 FR／15 R／15 ACがexact対応する |
| 3 | #1204〜#1208へ原子分割 | 実装順と非対象がmachine-readableになる |
| 4 | L3人間確認 | PO承認を`l3_human_approval`へ束縛しconfirmedへ進める |
| 5 | child実装／mutation／GitHub read-after | 安全性を縮退せずwall-clockを短縮する |

本PLANはCI高速化を検査削減と同義にしない。required verification exact setの導出と実行配置を分離し、
省略した義務を後段で回収できない場合は高速化を拒否する。
