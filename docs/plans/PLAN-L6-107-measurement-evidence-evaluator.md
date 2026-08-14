---
plan_id: PLAN-L6-107-measurement-evidence-evaluator
title: "PLAN-L6-107 (add-design): measurement evidence evaluator機能設計"
kind: add-design
layer: L6
drive: agent
status: draft
completion_claim_allowed: false
route_mode: add-feature
entry_signals: ["po_directive:Issue #220 のL5 schemaをpure evaluator関数境界へ降下する"]
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
ddd_modeling_decision: domain_service
contract_preconditions: "PLAN-L5-101がinput／observation／baseline／6軸result exact schemaとU-MEVAL-001..015を定義している"
contract_postconditions: "evaluateMeasurementEvidenceのadmission、6軸独立評価、ordered finding、verdict導出を実装可能な粒度で固定する"
contract_invariants: "pure、deterministic、input immutable。clock／probe／network／filesystem／DBへ触れず、unknown／failureをgreenへ縮退しない"
contract_failures: "schema違反はanalysis failure、validだが評価不能な状態はaxis unknownへ分離し、binding drift、stale、非代表、threshold、baseline、hard limitを全件評価する"
tdd_red_required: false
tdd_red_waiver_reason: "kind=add-design。production codeとoracleのRed→GreenはPLAN-L7-560が担う"
complexity_effect: net_negative
complexity_justification: "measurement固有判定を単一pure moduleへ集約し、各consumerのboolean比較重複を防ぐ"
removal_trigger: "後継schema evaluatorへ全consumerが移行しv1 usageが0になった時"
pair_artifact: docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
backprop_decision: not_required
backprop_decision_reason: "L5 reviewで曖昧だったschema rejectionとfreshness unknownを具体化し、declarationがauthorityを持たないdata digest／HEAD／evidence digestをbinding軸としたL4/L9の過大claimは同一sliceで是正済み。追加backpropは不要"
agent_slots:
  - { role: se, slot_label: "SE — pure evaluator関数設計" }
  - { role: qa, slot_label: "QA — admission／6軸／verdict反証" }
  - { role: tl, slot_label: "TL — #219 declarationと#221 probe境界監査" }
generates:
  - { artifact_path: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-measurement-evidence-evaluator-runtime-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md, artifact_type: markdown_doc }
dependencies:
  parent: docs/plans/PLAN-L5-101-measurement-evidence-evaluator.md
  requires:
    - docs/design/helix/L5-detail/measurement-evidence-evaluator.md
  blocks:
    - docs/plans/PLAN-L7-560-measurement-evidence-evaluator.md
    - issue:220
---

# measurement evidence evaluator機能設計（L6/L7 pair）

## §工程表 schedule

| Step | 作業 | 並列/直列 | 完了条件 |
|---|---|---|---|
| 1 | input admissionと型境界を定義 | [直列] | schema failureとaxis unknownが分離 |
| 2 | 6軸とverdict導出を定義 | [直列] | 全分岐が一意 |
| 3 | L7 production codeと15 oracleを実装 | [直列] | U-MEVAL-001..015 green |
| 4 | 独立レビュー | [review] | current HEAD blocker 0 |

L7実装のcurrent-head reviewとCIが揃うまでdraftを維持する。
