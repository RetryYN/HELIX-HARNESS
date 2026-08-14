---
plan_id: PLAN-REVERSE-558-measurement-evidence-evaluator-backfill
title: "PLAN-REVERSE-558: measurement evidence evaluatorの設計backfill"
kind: reverse
layer: cross
workflow_phase: R0
confirmed_reverse_type: design
route_mode: reverse
forward_routing: pending
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
pair_artifact: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-14 Issue #220のmeasurement evaluator実装をReverse R0から設計へ照合する"
agent_slots:
  - { role: se, slot_label: "SE — R0 implementation／trace採取" }
  - { role: qa, slot_label: "QA — R1 schema／oracle反証" }
  - { role: tl, slot_label: "TL — R2設計、R3意図、R4再入判断" }
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-558-measurement-evidence-evaluator-backfill.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
  requires:
    - docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
  references:
    - docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
    - docs/design/helix/L5-detail/measurement-evidence-evaluator.md
    - docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
    - docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
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
- R1のschema反証、R2のAs-Is設計照合、R3のIssue意図照合、R4のForward再入判断は未完了とし、
  current-head CIと独立reviewが成立するまでconfirmedへ遷移しない。

## 後続工程

R1でinvalid declaration、comparator、hard limit、finding／verdict oracleを反証する。R2でL5／L6／L8と
実装分岐を照合し、R3でIssue #220の責務境界を確認する。R4でbackprop scopeと#221へのForward再入を決定する。
