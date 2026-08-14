---
plan_id: PLAN-REVERSE-558-measurement-evidence-evaluator-backfill
title: "PLAN-REVERSE-558: measurement evidence evaluatorの設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: draft
completion_claim_allowed: false
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 220
behavior_contract_id: MEASUREMENT-EVIDENCE-EVALUATOR-001
responsibility_owner: measurement-harness
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-measurement-evidence-evaluator-runtime-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-14 Issue #220のmeasurement evaluator実装をReverse R0から設計へ照合する"
backprop_scope:
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md
    reason: "6軸評価、verdict、#221 probe/history境界がpure evaluator実装と一致する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/measurement-evidence-evaluator.md
    reason: "exact input、observation、baseline、finding契約が実装と正負oracleへ一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
    reason: "pure function、admission、6軸独立評価、固定finding順、verdict導出がexportと一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
    reason: "L5 schema／境界値契約をU-MEVAL-001..015の正負oracleへ束縛する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-measurement-evidence-evaluator-runtime-unit-test-design.md
    reason: "L6 runtime責務を同じ15 oracleへexact citationし、L5 pairと分離している。"
agent_slots:
  - { role: se, slot_label: "SE — R0 implementation／trace採取" }
  - { role: qa, slot_label: "QA — R1 schema／oracle反証" }
  - { role: tl, slot_label: "TL — R2設計、R3意図、R4再入判断" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-558-measurement-evidence-evaluator-backfill.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/measurement-evidence-evaluator.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L8-measurement-evidence-evaluator-runtime-unit-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
  requires:
    - docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
  references:
    - docs/plans/PLAN-L6-107-measurement-evidence-evaluator.md
    - docs/design/helix/L5-detail/measurement-evidence-evaluator.md
    - docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
    - docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
    - docs/test-design/helix/L8-measurement-evidence-evaluator-runtime-unit-test-design.md
    - src/requirements/measurement-evidence-evaluator.ts
    - tests/measurement-evidence-evaluator.test.ts
---

# measurement evidence evaluatorの設計backfill

## R0 現状採取

PR #691のdraft implementation、`evaluateMeasurementEvidence`、U-MEVAL-001..015、
L5／L6／L8の設計traceを採取する。pure evaluatorはinput admission、6軸status、stable finding、
verdictだけを担い、probe execution、current HEAD／dataset admission、metric history、DB、GitHub mutationを
持たない。

## R0 境界

- #220のmeasurement evaluationとthreshold verdictだけを対象にする。
- #221のprobe execution、current HEAD／dataset admission、history／DB保存を対象外とする。
- #223のfinding dispositionとGitHub mutationを対象外とする。
- current-head CIと独立reviewが成立するまでconfirmedへ遷移しない。

## R1 skip判定

`confirmed_reverse_type: design`はrequirements §3.3のR1 skip対象である。workflow phaseをR1へ偽装せず、
invalid declaration、comparator、hard limit、finding、red／unknown verdict、input／result identityの反例を
R2のAs-Is照合入力として実測する。

## R2 As-Is設計

L4の6軸評価と責務境界、L5のexact schema／baseline／finding、L6のpure evaluator関数契約は、
`src/requirements/measurement-evidence-evaluator.ts`の実装分岐と一致する。declarationがauthorityを持つ
ID、revision、metric/unit、workload、environment、sampling、windowだけをbinding比較し、data digest、
full HEAD、evidence digestをdeclarationと比較したと偽らない。これらはobservation identity／baseline入力とし、
current HEAD／dataset admissionは#221へ維持する。

L5用L8とL6 runtime用L8はexact file pairへ分離され、U-MEVAL-001..015を同じproduction testへ異なる
設計責務から束縛する。schema rejectionとvalid unknownを混在させず、failure／mismatchをgreenへ縮退しない。
従ってL4〜L6と両L8を`preserve`と判定する。

## R3 意図照合

Issue #220の意図は、受理済みNFR declarationとimmutable observationからfreshness、binding、
representativeness、threshold、baseline、hard limitを評価し、stable findingとgreen/red/unknown verdictを
返すことである。本sliceはpure evaluationだけを実装し、#221のprobe execution、current HEAD／dataset admission、
history／DB保存、#223のfinding disposition／GitHub mutationを先取りしないため、責務境界を満たす。

## R4 Forward再入

R0〜R3で設計、実装、oracle間に新しい意味差分は見つからなかった。全backprop scopeを`preserve`、
`promotion_strategy: reuse-as-is`、`forward_routing: gap-only`とする。Forward再入先は#221であり、
#220 terminal closureは本Reverseと`PLAN-L7-560`の双方向link、current-head CI、独立review後に限る。

本PLANはR4分析を先行記録しても`status: draft`／`completion_claim_allowed: false`を維持する。
#691のcanonical merge後にmainへ再束縛し、green evidenceとreview receiptを得た同一原子変更でのみconfirmedへ遷移する。
