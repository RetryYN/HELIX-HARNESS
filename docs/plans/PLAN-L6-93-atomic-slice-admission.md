---
plan_id: PLAN-L6-93-atomic-slice-admission
title: "PLAN-L6-93 (add-design): Atomic Slice Admission関数設計"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-02 Issue #339 L3Q-IT-023をL6/L7へ降下する"
created: 2026-08-02
updated: 2026-08-02
owner: Codex / TL
github_issue_id: 339
engineering_discipline_required: true
behavior_contract_id: GH-AC-035
responsibility_owner: atomic-slice-admission
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L5-85の型・failure・state・L8 oracleがPR #337でmainへmerge済み"
contract_postconditions: "pure canonicalizer／evaluator／design candidate selectorが副作用なしで一意になる"
contract_invariants: "exactly-one contract/owner、no-code-first、current blocker、exact path/companion、same-HEAD receipt"
contract_failures: "invalid、stale、no-code skip、blocker defer、binding、multiple owner、path/companion/expansion driftをfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存guard結果を1 pure moduleへ合成し、新detector/schema/state/table/jobを追加しない"
removal_trigger: "既存consumerとのdual-green後、旧分岐consumer=0 receipt成立時"
parent_design: docs/design/helix/L5-detail/atomic-slice-admission.md
pair_artifact: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — pure型／canonicalizer／evaluator" }
  - { role: qa, slot_label: "QA — negative／mutation／stale oracle" }
  - { role: tl, slot_label: "TL — 既存owner再利用と非過剰設計監査" }
generates:
  - { artifact_path: docs/plans/PLAN-L6-93-atomic-slice-admission.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L6-function-design/atomic-slice-admission.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-atomic-slice-admission-runtime-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L5-85-atomic-slice-admission.md
  requires:
    - docs/plans/PLAN-L4-59-atomic-slice-admission.md
    - docs/design/helix/L5-detail/atomic-slice-admission.md
    - docs/test-design/helix/L8-atomic-slice-admission-unit-test-design.md
    - docs/test-design/helix/L9-atomic-slice-admission-system-test-design.md
  blocks:
    - docs/plans/PLAN-L7-494-atomic-slice-admission.md
---

# PLAN-L6-93: Atomic Slice Admission関数設計

1. L5型とfailure precedenceを公開pure functionへ一対一で降下する。
2. L6 unit test designでL8/L9 oracle exact traceとmutationを固定する。
3. 設計候補を4 complexity observablesとp95で比較し、既存owner再利用案を選ぶ。
4. independent AI-B review後にpairをconfirmedへ遷移する。
5. PLAN-L4-59所有のL9 artifactは再所有せず、ST-ATOMIC-011の測定条件だけを具体化する。
