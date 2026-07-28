---
plan_id: PLAN-L7-479-drive-route-convergence
title: "PLAN-L7-479 (add-impl): 駆動経路Forward収束gate"
kind: add-impl
layer: L7
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 全駆動経路の再合流を機械保証する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 197
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-008
responsibility_owner: drive-route-convergence
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: pure_function
contract_preconditions: "PLAN-L6-84がroute graphとexact set反例を定義する"
contract_postconditions: "既存doctor hard gateがForward到達不能、Forward非終端、Forward出口付き循環、重複、specialist driftを拒否する"
contract_invariants: "validatorはpure/read-onlyで、route選択、PLAN、Issue、DBを変更しない"
contract_failures: "Forward出口の有無にかかわらず循環するgraph、dead-end、duplicate transition、専門工程置換をfindingへ変換する"
tdd_red_required: true
red_at: "2026-07-28T12:22:56+09:00"
green_at: "2026-07-28T12:23:33+09:00"
mutation_oracle_evidence: "U-DRCAT-008〜010を先に追加し、旧validatorで3件redを確認した。独立reviewでForward出口付き2-cycleが旧候補をgreen通過する反例を追加し、cycle検出後に10/10 greenとなった"
complexity_effect: net_neutral
complexity_justification: "既存pure lint内のbounded graph walkと集合比較だけで閉じ、別detectorやdoctor checkを追加しない"
removal_trigger: "drive route catalog ownerへ同等検査が統合され本deltaの独立traceが不要になった時点"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-008, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-009, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-010, test_path: tests/drive-route-catalog.test.ts }
agent_slots:
  - { role: se, slot_label: "SE — bounded graph walk実装" }
  - { role: qa, slot_label: "QA — seeded cycle／duplicate mutation" }
  - { role: tl, slot_label: "TL —既存doctor ownerへの統合" }
generates:
  - { artifact_path: docs/plans/PLAN-L7-479-drive-route-convergence.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/drive-route-catalog.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-route-catalog.test.ts, artifact_type: test_code }
review_evidence: []
dependencies:
  parent: docs/plans/PLAN-L6-84-drive-route-convergence.md
  requires:
    - docs/plans/PLAN-L6-84-drive-route-convergence.md
  references:
    - docs/plans/PLAN-L7-476-drive-route-catalog-gate.md
  blocks: []
---

# PLAN-L7-479: 駆動経路Forward収束gate

## 完了条件

- U-DRCAT-008〜010とtypecheckがgreen。
- 独立AI-Bがroute reachability、軸分離、既存doctor統合をcurrent HEADで確認する。
