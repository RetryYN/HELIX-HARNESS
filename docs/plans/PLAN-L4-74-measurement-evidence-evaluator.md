---
plan_id: PLAN-L4-74-measurement-evidence-evaluator
title: "PLAN-L4-74 (add-design): measurement evidence evaluator 基本設計"
kind: add-design
layer: L4
drive: agent
status: draft
completion_claim_allowed: false
route_mode: add-feature
entry_signals:
  - "po_directive:Issue #220 の measurement context／freshness／representativeness／threshold 判定を HR-NFR-REG-004/006 へ exact trace する"
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
github_issue_id: 220
engineering_discipline_required: true
behavior_contract_id: MEASUREMENT-EVIDENCE-EVALUATOR-001
responsibility_owner: measurement-harness
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: policy
contract_preconditions: "Issue #219 の typed NFR registry が current declaration authority であり、observation は workload／environment／data／sampling／window／HEAD／evidence digest と trusted evaluation time を明示する"
contract_postconditions: "binding、freshness、representativeness、thresholdを独立した決定論的statusへ評価し、baseline不明、stale、非代表、異HEAD、hard limit超過、推測値をgreenへ縮退しないL4/L9境界を固定する"
contract_invariants: "pure evaluatorはprobe実行、network、clock read、DB／履歴writeを行わない。final greenは全必須statusが成立した時だけ導出し、unknownをpassへ変換しない"
contract_failures: "declaration／observation binding不一致、欠落・非finite値、期限超過、代表率不足、比較方向・単位不一致、baseline／hard limit不明をstable findingとしてfail-closeする"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。本PLANはL4/L9 pairの責務境界とsystem oracleを固定し、production codeのred→greenは後続PLAN-L7-560で扱う"
complexity_effect: net_negative
complexity_justification: "NFRごとの個別boolean判定を一つのpure evaluator contractへ統合し、宣言・観測・実行・履歴の責務を分離する"
removal_trigger: "後継measurement evaluatorが同等以上のbinding／freshness／representativeness／threshold fail-close契約を提供し全consumerが移行した時"
pair_artifact: docs/test-design/helix/L9-measurement-evidence-evaluator-system-test-design.md
backprop_decision: not_required
backprop_decision_reason: "HR-NFR-REG-004/006とrequirements受入条件の既存意味を基本設計へ降下するadditive changeで、上位要求を変更しない"
agent_slots:
  - { role: aim, slot_label: "AIM — registry／observation／probe履歴の責務境界" }
  - { role: qa, slot_label: "QA — unknown propagationと境界値のL9反証" }
  - { role: tl, slot_label: "TL — requirements exact traceと#221非侵入監査" }
generates:
  - { artifact_path: docs/design/helix/L4-basic-design/measurement-evidence-evaluator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-measurement-evidence-evaluator-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/plans/PLAN-L3-06-helix-pillar-descent.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L4-basic-design/nfr-typed-registry-quality-taxonomy.md
    - docs/plans/PLAN-REVERSE-494-nfr-typed-registry-backfill.md
  blocks:
    - docs/plans/PLAN-L5-101-measurement-evidence-evaluator.md
    - issue:220
---

# measurement evidence evaluator 基本設計（L4/L9 pair）

## 目的

Issue #220 の behavior contract を、受理済み NFR declaration と immutable observation から
検証状態を導出する pure evaluator と、system-level fail-close oracleへ分解する。

## 対象と非対象

- 対象: context binding、freshness、representativeness、threshold、baseline、hard limit、最終verdict。
- 対象: `HR-NFR-REG-004/006` の測定対象と反証手法を共通contractへ束縛すること。
- 非対象: probe実行、retry、scheduler、metric event／履歴／DB保存（#221）。
- 非対象: finding disposition（#223）とworkflow固有allocation判断（#188）。

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | L4で宣言／観測／評価／履歴の境界を固定 | [直列] | #219／#221との責務重複0 |
| 2 | L9でunknown／stale／非代表／閾値違反を反証 | [直列] | false-green 0 |
| 3 | L5/L8 schemaへ降下 | [直列] | statusとfindingが一意 |
| 4 | L6/L7 pure evaluatorを実装 | [直列] | current-head review／CI green |

本PLANは独立レビューとcurrent-head CIが揃うまでdraftを維持する。
