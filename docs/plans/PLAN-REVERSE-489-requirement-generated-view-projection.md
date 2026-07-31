---
plan_id: PLAN-REVERSE-489-requirement-generated-view-projection
title: "PLAN-REVERSE-489: Requirement generated view／DB projectionの設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
created: 2026-07-31
updated: 2026-07-31
owner: Codex / TL
github_issue_id: 286
behavior_contract_id: REQUIREMENT-IR-GENERATED-VIEW-PROJECTION
responsibility_owner: requirement-ir-generated-view-projection
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-31 generated view／DB projectionを現行JSON authorityへReverse接着する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    reason: "JSONだけをcurrent authorityとし、generated Markdownをread-only view、旧Markdownをcompatibility read-onlyへ隔離する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/requirement-translation-obligation.md
    reason: "153/24/72/24とowner／oracle traceの翻訳obligationを変更しない。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/requirement-generated-view-projection.md
    reason: "決定論的generated view、round-trip、DB projection、manifest不在互換をcutover前の移行設計証拠として保持する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
    reason: "U-RGV-001..009をgenerated view／projectionの回帰oracleとして保持する。"
agent_slots:
  - role: se
    slot_label: "SE — R0/R2 generated view／projection trace再構成"
  - role: qa
    slot_label: "QA — R1 round-trip／digest／orphan反証"
  - role: tl
    slot_label: "TL — R3 shadow authority非再活性化とR4 gap-only判定"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-489-requirement-generated-view-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-489-requirement-generated-view-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/requirement-translation-obligation.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-generated-view-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/generated/requirements/requirement-definition.generated.md, artifact_type: markdown_doc }
  - { artifact_path: src/requirements/requirement-generated-view.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-generated-view.test.ts, artifact_type: test_code }
  - { artifact_path: tests/requirement-generated-view-db.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-L7-489-requirement-generated-view-projection.md
    - docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
    - docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L6-function-design/requirement-generated-view-projection.md
    - docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
    - config/requirement-ir-authority.json
    - tests/requirement-generated-view.test.ts
    - tests/requirement-generated-view-db.test.ts
---

# PLAN-REVERSE-489: Requirement generated view／DB projectionの設計backfill

## R0 現状採取

PR #296で実施したstable-ID shard loader、決定論的generated Markdown、semantic round-trip、
既存harness.dbへの273 row投影、manifest不在consumerの0 row互換、U-RGV-001..009を採取する。
当時の`shadow_noncanonical`と「legacy Markdown current」はcutover前の履歴条件であり、現行判断へ戻さない。

## R1 観測テスト設計

- path、kind、count、key、shard/root digest driftを拒否する。
- JSON→generated Markdown→normalized JSONの意味不変とbyte再現を検証する。
- DB rebuild x2、273 row、owner／oracle orphan 0、manifest不在0 row互換を検証する。
- current authorityはcanonical JSONだけで、generated Markdownはread-only view、旧Markdownはcompatibility read-onlyとする。

## R2 As-Is設計

generated viewとDB shadow projectionはcanonical cutover前の一時migration componentとして意味不変を証明した。
後続`PLAN-L7-490`はJSONをcanonicalへ昇格し、DBをcanonical `requirement_ir` projectionへ切り替え、
shadow table／checked-in shadow artifactをretireした。489の設計はこの移行履歴と回帰oracleだけを保存する。

## R3 意図照合

PO意図は機械可読JSON正本と人間可読生成viewを分離し、旧定義を互換読込専用へ隔離することである。
本sliceはgenerated view／projectionの証拠を閉じるが、shadow authority、dual writer、別DB、旧tableを復活させない。

## R4 Forward再入

全backprop scopeは`preserve`で追加gapはない。`forward_routing: gap-only`として本Reverseと
`PLAN-L7-489`を双方向linkし、完了claimをgenerated view／projectionの実装・移行証拠に限定する。
