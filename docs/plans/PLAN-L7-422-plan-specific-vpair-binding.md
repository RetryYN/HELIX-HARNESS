---
plan_id: PLAN-L7-422-plan-specific-vpair-binding
title: "PLAN-L7-422 (impl): PLAN固有Vペア4点結合gate — L6設計・L8 oracle・生成testをfail-closeで拘束する"
kind: impl
layer: L7
drive: agent
status: draft
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 /goal『設計とテスト設計/検証設計でVペアを作る。抜け漏れ絶対許さない』をPLAN-L6-65 confirmed後に実装へ降下"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "confirmed PLAN-L6-65の機能契約を実装するL7降下。新規上位要求は追加しない。"
owner: Codex
parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/governance/helix-harness-concept_v3.1.md
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-006
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-007
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-008
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-009
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-010
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-011
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-012
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-013
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-014
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-015
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-016
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-017
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-018
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-019
    test_path: tests/plan-descent-specific-parent-binding.test.ts
  - parent_design: docs/design/harness/L6-function-design/plan-descent-specific-parent-binding.md
    oracle_id: U-PSPB-020
    test_path: tests/plan-descent-specific-parent-binding.test.ts
agent_slots:
  - role: be-logic
    slot_label: "BE logic — pure analyzer/authority/AST adapter"
  - role: qa-test
    slot_label: "QA — U-PSPB-006..020 red/green/oracle偽装検証"
  - role: tl
    slot_label: "TL — plan lint/doctor wiring・baseline authority・real repo判定"
generates:
  - artifact_path: docs/plans/PLAN-L7-422-plan-specific-vpair-binding.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/plan-specific-vpair-binding.ts
    artifact_type: typescript_source
  - artifact_path: src/schema/frontmatter.ts
    artifact_type: typescript_source
  - artifact_path: src/plan/lint.ts
    artifact_type: typescript_source
  - artifact_path: src/doctor/index.ts
    artifact_type: typescript_source
  - artifact_path: config/plan-specific-vpair-binding-authority.json
    artifact_type: config
  - artifact_path: docs/plans/PLAN-L7-419-skill-mythos-uplift.md
    artifact_type: markdown_doc
  - artifact_path: tests/skill-pack-uplift.test.ts
    artifact_type: test_code
  - artifact_path: tests/plan-descent-specific-parent-binding.test.ts
    artifact_type: test_code
  - artifact_path: tests/slow/doctor.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
  requires:
    - docs/plans/PLAN-L6-65-plan-specific-vpair-binding.md
    - docs/plans/PLAN-L7-347-plan-descent-gate-impl.md
  references:
    - docs/plans/PLAN-L7-419-skill-mythos-uplift.md
---

# PLAN-L7-422: PLAN固有Vペア4点結合gate

## 0. 目的

PLAN-L6-65 confirmed contractを実装し、path存在だけの偽Vペアを起票・doctorの双方で拒否する。
PLAN ID、L6 parent、L8 exact oracle row、生成test内の実行可能caseを同一tupleで結合する。

## 1. 実装範囲

- strict `verification_bindings` schemaとpure analyzer/Node adapterを追加する。
- immutable initial authorityとresolved hash-chain tombstoneを検証する。
- plan lint単一/全走査、doctor hard gateへ同じanalyzerを配線する。
- PLAN-L7-419を固有L6/U-SKUP/test case/bindingへbackfillする。
- 既存debtはexact finding authorityでのみratchetし、新規PLANを免除しない。

## 2. 完了条件

- U-PSPB-006..020が各1件以上のred反例とgreen oracleを持つ。
- test comment/dead string/skip/todo/dynamic titleでoracle citationを偽装できない。
- `PLAN-L7-419` と本PLANがactive exemptionなしでgreenになる。
- targeted test、typecheck、lint、plan lint、doctorがgreen。

## 3. スケジュール

- step 1 (parallel): pure analyzer/testとschema/PLAN-L7-419 backfillを分離実装。
- step 2 (serial): authority生成、lint/doctor配線、real repo redを解消。
- step 3 (parallel): independent reviewと全回帰。
