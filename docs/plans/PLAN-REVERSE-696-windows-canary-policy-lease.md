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
github_issue_id: 1144
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
  - "po_directive:Issue #1144 Windows canary policy／lease bindingのReverse vehicle"
contract_preconditions: "PLAN-L3-70のconfirmed authorityと#1134の原子実装scopeが存在する"
contract_postconditions: "将来のPLAN-L7-696実装証拠をL3／L6／L8へ再接着するReverse vehicleがmain上で一意になる"
contract_invariants: "Forward実装や#1141の初期policy値を先取りせず、status draft／pending_reverseを維持する"
contract_failures: "wrong HEAD、stale review、双方向link欠落、DB divergence、#1141責務混載をfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "Forward実装前にReverse pairing vehicleだけを登録するdocs-only sliceであり、未実装kernelのRedを捏造しない"
mutation_oracle_evidence: "Forward合流時にbackfill-pairing gateの双方向link欠落mutationを使用し、本sliceでは実装成功を主張しない"
complexity_effect: net_neutral
complexity_justification: "Forward実装を再実装せず、requirements／design／test／main evidenceの再接着vehicleだけを所有する"
removal_trigger: "#1106 terminal Reverseが本証拠を統合し、個別fullback参照が不要になった時"
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
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-696-windows-canary-policy-lease.md, artifact_type: markdown_doc }
modifies: []
dependencies:
  parent: docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
  requires:
    - docs/plans/PLAN-L3-70-windows-lite-canary-admission.md
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

本sliceはReverse vehicleだけを先行登録し、Forward実装や完了証拠を捏造しない。

## R1〜R3 再接着

PLAN-L7-696合流後にL3のschema／lease要求、L6 value object、L8 oracleと実装を双方向に照合する。
初期policy instanceは#1141へ残し、本Reverseから値を補完しない。

## R4 終端条件

current HEADのClaude独立review、required CI、DB convergence、canonical merge、post-main read-afterが揃った後だけ
Forward／Reverse PLANとIssue #1134を終端化する。
