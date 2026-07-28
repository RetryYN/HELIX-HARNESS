---
plan_id: PLAN-L6-82-route-action-approval-stage
title: "PLAN-L6-82 (add-design): route推薦とaction承認のstage分離"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 Issue #169 route推薦とaction承認の境界を分離する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 169
engineering_discipline_required: true
behavior_contract_id: U-RAAS-001
responsibility_owner: route-action-approval
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "routeは推薦、診断、証拠収集、plan、dry-run、scope decision、applyのいずれかにある"
contract_postconditions: "read-only段階は自律継続し、外部状態変更段階だけがaction-bound approvalを要求する"
contract_invariants: "security/production境界を保持し、approvalなしのapplyと自動実行を許可しない"
contract_failures: "未知stage、policy不足、approver不足、高影響applyをfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存boolean承認判定を7値stageへ置換し、routeごとの重複approval分岐を増やさない"
removal_trigger: "workflow action transactionが同じstage契約を所有した時点で統合する"
pair_artifact: docs/test-design/harness/L8-route-action-approval-stage.md
agent_slots:
  - { role: se, slot_label: "SE — action stageとapproval条件設計" }
  - { role: qa, slot_label: "QA — read-only/apply境界mutation" }
  - { role: tl, slot_label: "TL — production/security境界レビュー" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-82-route-action-approval-stage.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/route-action-approval-stage.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-route-action-approval-stage.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/helix-objective-evidence-audit.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L7-124-route-approval-gate.md
  requires:
    - docs/governance/drive-route-catalog.md
  references:
    - docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md
  blocks:
    - docs/plans/PLAN-L7-477-route-action-approval-stage.md
---

# PLAN-L6-82: route推薦とaction承認のstage分離

## 完了条件

- 7 stageの意味とmode別承認境界がL6/L8 pairで閉じる。
- route entry自体を承認actionとして扱わない。
- applyのfail-closeと`auto_apply=false`を維持する。
