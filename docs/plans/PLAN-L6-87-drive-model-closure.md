---
plan_id: PLAN-L6-87-drive-model-closure
title: "PLAN-L6-87 (add-design): 全駆動経路と横断constructの収束設計"
kind: add-design
layer: L6
drive: agent
status: draft
route_mode: add-feature
backfill_state: pending_reverse
completion_claim_allowed: false
entry_signals:
  - "po_directive:2026-07-28 Forward／Scrum／Hybrid以外を含む全駆動経路を同じ精度で定義する"
created: 2026-07-28
updated: 2026-07-28
owner: Codex / TL
github_issue_id: 204
engineering_discipline_required: true
behavior_contract_id: U-DRCAT-011
responsibility_owner: drive-model-closure
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retire_after_consumer_zero
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "15 route catalogとForward収束gateがcurrentである"
contract_postconditions: "横断construct分類とIssue〜右腕projectionを既存catalog ownerへ統合する"
contract_invariants: "新routeを追加せず、route／subroute／trigger／専門工程を混同しない"
contract_failures: "construct欠落・重複・孤児parent、surface欠落、旧L0-L14 current説明を拒否する"
complexity_effect: net_negative
complexity_justification: "旧mode READMEの重複・矛盾散文を削減し、既存catalogへ2 bounded sectionだけ追加する"
removal_trigger: "同じ分類とprojectionが上位workflow schemaへ統合されconsumer=0になった時点"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
agent_slots:
  - { role: se, slot_label: "SE — 15 route／横断construct／identity設計" }
  - { role: qa, slot_label: "QA — exact set／surface／branch prefix反例" }
  - { role: tl, slot_label: "TL — route分類とForward再合流監査" }
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-011, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-012, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-013, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-014, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-017, test_path: tests/branch-kind.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L6-87-drive-model-closure.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/drive-route-system.md, artifact_type: markdown_doc }
  - { artifact_path: docs/process/modes/README.md, artifact_type: markdown_doc }
  - { artifact_path: docs/governance/workflow-and-specialist-harness-audit-2026-07-28.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/harness/L6-function-design/drive-route-catalog.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/harness/L8-drive-route-catalog.md, artifact_type: test_design }
  - { artifact_path: src/lint/branch-kind.ts, artifact_type: source_module }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-84-drive-route-convergence.md
  requires:
    - docs/plans/PLAN-L7-479-drive-route-convergence.md
  references:
    - config/drive-route-catalog.json
  blocks: []
---

# PLAN-L6-87: 全駆動経路と横断constructの収束設計

## 設計判断

15 route exact setは維持する。Scrum Reverse、Redesign、Design/Performance Refactor、
Security、NFR/Measurement findingを分類付きconstructへ固定し、Issueからright-armまでの
共通projectionを全routeへ課す。15 routeの意味identityである`catalog_route_id`と、
1回の実行を表す`episode_route_id`は別fieldとし、旧DB episode IDを破壊的に置換しない。
