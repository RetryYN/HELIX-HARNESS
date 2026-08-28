---
plan_id: PLAN-REVERSE-696-windows-canary-policy-lease
title: "PLAN-REVERSE-696: Windows canary policy／lease bindingのfullback"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: fullback
forward_routing: L3
promotion_strategy: reuse-as-is
drive: agent
status: draft
completion_claim_allowed: false
backfill_state: pending_reverse
created: 2026-08-28
updated: 2026-08-28
owner: Codex / TL
github_issue_id: 1134
behavior_contract_id: WINDOWS-LITE-CANARY-POLICY-LEASE-001
responsibility_owner: windows-lite-canary-admission
change_slice: atomic
refactor_step: add_behavior
no_code_decision: no_change
legacy_retirement_state: retained
workflow_identity:
  schema_version: helix-plan-workflow-identity.v1
  registry_version: 1.1.5
  registry_source_digest: sha256:26815116aff167badab605071e73320e5269ba62c9f6545acbe9525af00259db
  target_axis: workflow_model
  target_id: REVERSE
entry_signals:
  - "implementation_complete:PLAN-L7-696 Windows canary policy／lease binding"
contract_preconditions: "PLAN-L7-696の実装、targeted／full CI、独立review、DB convergenceが同一HEADへ束縛される"
contract_postconditions: "policy／lease validatorの実測をL3／L6／L8へ再接着し、Forward PLANとIssueの終端判断がmain read-afterと一致する"
contract_invariants: "#1141のversioned policy instanceを先取りせず、schema validatorとpolicy値authorityを混同しない"
contract_failures: "wrong HEAD、stale review、Reverse双方向link欠落、DB divergence、#1141責務混載をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward側のU-WLCA-001／005／009／014とmutationを再利用する終端fullbackであり、別kernelを追加しない"
mutation_oracle_evidence: "PLAN-L7-696のheartbeat>=TTL mutationとexact schema oracleを再利用し、Reverse固有のlink欠落はbackfill-pairing gateで拒否する"
complexity_effect: net_neutral
complexity_justification: "Forward実装を再実装せず、requirements／design／test／main evidenceの再接着だけを所有する"
removal_trigger: "#1106全sliceのterminal Reverseが本証拠を統合し、個別fullback参照が不要になった時"
parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
pair_artifact: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md
backprop_scope:
  - layer: requirements
    decision: impacted
    evidence_path: docs/design/helix/L3-requirements/windows-lite-canary-admission-requirements.md
    reason: "WLCA-R-01／03のschema／lease境界へ実測を戻す。初期policy値は#1141へ分離する。"
  - layer: L6-function-design
    decision: impacted
    evidence_path: docs/design/helix/L6-function-design/windows-lite-canary-admission.md
    reason: "exact schema、canonical digest、WorkGraph fence再利用を実装と照合する。"
  - layer: verification-design
    decision: impacted
    evidence_path: docs/test-design/helix/L8-windows-lite-canary-admission-unit-test-design.md
    reason: "U-WLCA-001／005／009／014とmutation evidenceをcurrent HEADへ束縛する。"
verification_bindings:
  - { parent_design: docs/design/helix/L6-function-design/windows-lite-canary-admission.md, oracle_id: U-WLCA-001, test_path: tests/windows-lite-canary-admission.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-696-windows-canary-policy-lease.md, artifact_type: markdown_doc }
modifies: []
dependencies:
  parent: docs/plans/PLAN-L7-696-windows-canary-policy-lease.md
  requires:
    - docs/plans/PLAN-L7-696-windows-canary-policy-lease.md
  references:
    - docs/plans/PLAN-L7-696-windows-canary-policy-lease.md
    - src/runtime/windows-lite-canary-admission.ts
    - tests/windows-lite-canary-admission.test.ts
  blocks: []
agent_slots:
  - { role: qa, slot_label: "QA — Forward／Reverse証拠とmain read-after" }
  - { role: tl, slot_label: "TL — #1134終端と#1141責務境界" }
---

# Windows canary policy／lease bindingの再接着

## R0 現状採取

Forward実装のexact HEAD、CI、review、DB projectionを取得し、作業treeや古いreceiptを終端根拠にしない。

## R1〜R3 再接着

L3のschema／lease要求、L6 value object、L8 oracleと実装を双方向に照合する。初期policy instanceは#1141へ残し、
本Reverseから値を補完しない。

## R4 終端条件

current HEADのClaude独立review、required CI、DB convergence、canonical merge、post-main read-afterが揃った後だけ
Forward／Reverse PLANとIssue #1134を終端化する。
