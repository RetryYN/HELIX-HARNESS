---
plan_id: PLAN-L7-482-drive-model-closure
title: "PLAN-L7-482 (add-impl): 全駆動経路と横断constructの収束gate"
kind: add-impl
layer: L7
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
contract_preconditions: "PLAN-L6-87が横断constructとsurface projectionを定義する"
contract_postconditions: "既存drive-route-catalog doctorがexact分類とprojection driftをfail-closeし、catalog prefixをbranch admissionが受理する"
contract_invariants: "pure/read-only validatorを維持し、route選択やstateを変更しない"
contract_failures: "construct欠落・重複・孤児parent、surface欠落・重複をfindingへ変換する"
tdd_red_required: true
red_at: "2026-07-28T06:45:00Z"
green_at: "2026-07-28T06:46:48Z"
mutation_oracle_evidence: "U-DRCAT-011〜014／017がconstruct削除・重複・孤児parent・分類置換、right_arm surface削除、identity重複、route別branch prefix置換、未統制prefixをseedし旧validatorでredになる"
complexity_effect: net_negative
complexity_justification: "別detectorを増やさず既存schema/analyzerへbounded exact-set検査を統合し、旧README散文を削減する"
removal_trigger: "drive route schemaの上位ownerへ同等検査が統合され本delta consumer=0になった時点"
parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md
pair_artifact: docs/test-design/harness/L8-drive-route-catalog.md
agent_slots:
  - { role: se, slot_label: "SE — catalog validator／branch admission接続" }
  - { role: qa, slot_label: "QA — construct／projection／prefix mutation" }
  - { role: tl, slot_label: "TL — current HEAD収束review" }
verification_bindings:
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-011, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-012, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-013, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-014, test_path: tests/drive-route-catalog.test.ts }
  - { parent_design: docs/design/harness/L6-function-design/drive-route-catalog.md, oracle_id: U-DRCAT-017, test_path: tests/branch-kind.test.ts }
generates:
  - { artifact_path: docs/plans/PLAN-L7-482-drive-model-closure.md, artifact_type: markdown_doc }
  - { artifact_path: config/drive-route-catalog.json, artifact_type: json_config }
  - { artifact_path: src/lint/drive-route-catalog.ts, artifact_type: source_module }
  - { artifact_path: tests/drive-route-catalog.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/branch-kind.ts, artifact_type: source_module }
  - { artifact_path: tests/branch-kind.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L6-87-drive-model-closure.md
  requires:
    - docs/plans/PLAN-L6-87-drive-model-closure.md
  references:
    - docs/process/drive-route-system.md
  blocks: []
---

# PLAN-L7-482: 全駆動経路と横断constructの収束gate

catalog routeと実行episodeのidentityを分離し、既存の`drive:<Model>:<action>`を
catalog route IDへ読み替えて意味を偽らない。U-DRCAT-011〜014、typecheck、doctor、
独立AI-B reviewで閉じる。catalogに宣言したbranch prefixはU-DRCAT-017で既存branch admissionへ
同時接続し、正本どおり起票したPRが構造的にredになる状態を残さない。
