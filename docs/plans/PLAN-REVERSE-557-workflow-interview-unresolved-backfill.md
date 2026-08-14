---
plan_id: PLAN-REVERSE-557-workflow-interview-unresolved-backfill
title: "PLAN-REVERSE-557: Workflow interviewとunresolved engineの設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 185
behavior_contract_id: WORKFLOW-INTERVIEW-UNRESOLVED-001
responsibility_owner: universal-workflow-judgment
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-14 Issue #185のinterview／unresolved実装を要求正本と上位設計へReverse照合する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    reason: "UWJ-FR-003/004とUWJ-AC-003/004が質問選択、回答拘束、未解決分類、freeze blockを既に要求する。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/workflow-interview-unresolved.md
    reason: "pure evaluator、非永続化、AI非決定のcomponent境界が実装と一致する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/workflow-interview-unresolved.md
    reason: "15種の質問、回答binding、未解決taxonomy、fail-close条件が実装schemaと一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/workflow-interview-unresolved.md
    reason: "question選択とunresolved projectionのpure function契約がruntime exportと一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
    reason: "U-UWINT-001..005が正負oracleとして実テストへ束縛されている。"
agent_slots:
  - { role: se, slot_label: "SE — R0実装・設計trace採取" }
  - { role: qa, slot_label: "QA — R1 conditional／stale／schema反証" }
  - { role: tl, slot_label: "TL — R2/R3要求照合とR4再入判定" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-557-workflow-interview-unresolved-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/workflow-interview-unresolved.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/workflow-interview-unresolved.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/workflow-interview-unresolved.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
  requires:
    - docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
  references:
    - docs/plans/PLAN-L7-557-workflow-interview-unresolved.md
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    - docs/design/helix/L4-basic-design/workflow-interview-unresolved.md
    - docs/design/helix/L5-detail/workflow-interview-unresolved.md
    - docs/design/helix/L6-function-design/workflow-interview-unresolved.md
    - docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
    - src/workflow/workflow-interview-unresolved.ts
    - tests/workflow-interview-unresolved.test.ts
---

# PLAN-REVERSE-557: Workflow interviewとunresolved engineの設計backfill

## R0 現状採取

Issue #185のUWJ-FR-003/004を具体化した質問選択、answer binding、未解決分類、freeze blockと
`U-UWINT-001..005`をcurrent HEADから採取する。DB、Git、GitHub writeや人間判断の代行は実装されて
いないため、Universal Workflow全体の完了として数えない。

## R1 観測テスト設計

- signalが0件でもcore質問をexactly once選択する。
- trueのconditionalだけを選び、非該当回答を拒否する。
- stale binding、未回答、矛盾、authority不足、branch gapをstable findingへ分類する。
- 空source、unknown version／fieldをschema境界で拒否する。

## R2 As-Is設計

実装は既存L3要求を、Zod schemaと副作用のないevaluatorへ具体化している。永続化owner、canonical
writer、外部dispatch、人間のaccept／reject authorityを追加していないため、L3からL6の設計は
`reuse-as-is`で照合する。

## R3 意図照合

Issue #185の意図は、曖昧さを推測で埋めず必要な質問と未解決理由を決定的に返すことである。本sliceは
回答の収集や判断確定を行わず、source spanと履歴を保持してfreezeを拒否するため、要求正本の人間authorityを
狭めない。

## R4 Forward再入

全backprop scopeは`preserve`で追加gapはない。`forward_routing: gap-only`として本Reverseと
`PLAN-L7-557`を双方向linkし、interview／unresolved pure contractだけをForwardへ再入させる。
current-head CIとcross-runtime reviewが成立するまではdraftを維持する。
