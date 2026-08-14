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
  - "po_directive:PR #680でmergeしたWorkflow interview実装をReverse R0から要件・設計へ照合する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    reason: "UWJ-FR-003/004とUWJ-AC-003/004がcore／conditional質問、unresolved trace、freeze blockを既に定義する。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/workflow-interview-unresolved.md
    reason: "pure evaluator境界と副作用禁止がmerged implementationと一致する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/workflow-interview-unresolved.md
    reason: "question selection、answer admission、unresolved findingの詳細契約が実装分岐と一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/workflow-interview-unresolved.md
    reason: "evaluateWorkflowInterviewUnresolvedのtyped入出力、stable finding、write禁止が一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
    reason: "U-UWINT-001..005が正負oracleとmutation killを実テストへ束縛する。"
agent_slots:
  - { role: se, slot_label: "SE — R0/R2 implementation／design trace採取" }
  - { role: qa, slot_label: "QA — R1 mutation oracle反証" }
  - { role: tl, slot_label: "TL — R3意図照合とR4再入判定" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-557-workflow-interview-unresolved-backfill.md, artifact_type: markdown_doc }
dependencies:
  parent: null
  requires: []
  references:
    - docs/design/helix/L3-requirements/universal-workflow-ai-judgment-engine.md
    - docs/design/helix/L4-basic-design/workflow-interview-unresolved.md
    - docs/design/helix/L5-detail/workflow-interview-unresolved.md
    - docs/design/helix/L6-function-design/workflow-interview-unresolved.md
    - docs/test-design/helix/L8-workflow-interview-unresolved-unit-test-design.md
    - src/workflow/workflow-interview-unresolved.ts
    - tests/workflow-interview-unresolved.test.ts
---

# Workflow interviewとunresolved engineの設計backfill

## R0 現状採取

PR #680のmerge commit `34ab1ae15f4df4d2566c2063afcff5a6504a840a`を基準に、
`evaluateWorkflowInterview`、質問schema、未解決finding、U-UWINT-001..005、
L4/L5/L6とL8/L9のpairを採取した。DB、Git、GitHub writeやfreeze authorityの追加は観測範囲に無い。

## R1 観測テスト設計

- signal 0でもcore questionをexactly once選択する。
- trueのconditional signalだけを選択し、非該当回答を拒否する。
- 未回答、矛盾、authority不足、branch gapをsource span／history付きでblockする。
- stale回答とinvalid schemaを成功扱いしない。
- conditional filter反転mutationはU-UWINT-001/002/003の3件にkillされ、復元後5件greenとなる。

## R2 As-Is設計

実装は既存UWJ-FR-003/004の意味を変更せず、L3の質問・未解決契約をpure Zod evaluatorへ降ろしている。
永続化service、外部API、freeze/write authorityを追加していないため、L3〜L6とverification設計を
`reuse-as-is`で照合する。新しいproduct requirementやrouteは追加しない。

## R3 意図照合

Issue #185の目的はinterviewとunresolved engineの実装であり、AIによる推測確定やauthority拡張ではない。
merged diff、Claude独立review、mutation evidenceはこの境界と一致する。Issue #185はmerge commitと
canonical receiptを根拠に2026-08-14T04:12:49Zにcompletedでclose済みである。

## R4 Forward再入

R0〜R3で新しい設計gapは見つからず、全backprop scopeを`preserve`とする。
このReverse branchでは親add-impl PLANを同時変更せず、R4観測記録をdraftでmergeする。
独立review後の`docs/confirm-*` laneでのみ、`PLAN-L7-557`との双方向link、
`backfill_state: complete`、本Reverseのconfirmed遷移、outstanding snapshot更新を原子的に行う。
