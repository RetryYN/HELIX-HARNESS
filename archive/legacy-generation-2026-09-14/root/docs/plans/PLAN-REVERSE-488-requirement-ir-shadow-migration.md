---
plan_id: PLAN-REVERSE-488-requirement-ir-shadow-migration
title: "PLAN-REVERSE-488: Requirement IR shadow migrationの設計backfill"
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
github_issue_id: 285
behavior_contract_id: REQUIREMENT-IR-SHADOW-MIGRATION
responsibility_owner: requirement-ir-shadow-migration
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-31 Requirement IR shadow移行とretirementを現行L1-L12正本へReverse接着する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    reason: "RDJ authorityが意味不変migrationとcanonical cutoverを分離し、現在はJSONだけを正本とする。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/requirement-translation-obligation.md
    reason: "153/24/72/24とowner／oracle traceの翻訳obligationを変更しない。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
    reason: "意味不変compiler、exact denominator、既知12 owner、Design Template空portのmigration契約を履歴証拠として保持する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md
    reason: "U-RIR-000..006が実テストへexact citationされ、migrationとretirement後も回帰oracleを保持する。"
agent_slots:
  - role: se
    slot_label: "SE — R0/R2 migration／retirement trace再構成"
  - role: qa
    slot_label: "QA — R1 denominator／digest／owner反証"
  - role: tl
    slot_label: "TL — R3旧authority非再活性化とR4 gap-only判定"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-488-requirement-ir-shadow-migration.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/requirement-translation-obligation.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/requirement-ir-authority.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-ir-shadow-generator.ts, artifact_type: source_module }
  - { artifact_path: src/requirements/requirement-ir-shadow.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-ir-shadow.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-L7-488-requirement-ir-shadow-migration.md
    - docs/plans/PLAN-L6-89-requirement-ir-shadow-migration.md
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
    - docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
    - docs/test-design/helix/L8-requirement-ir-shadow-migration-unit-test-design.md
    - config/requirement-ir-authority.json
    - tests/requirement-ir-shadow.test.ts
---

# PLAN-REVERSE-488: Requirement IR shadow migrationの設計backfill

## R0 現状採取

PR #294で実施した153/24/72/24の意味不変shadow compiler、既知12 requirement owner是正、
Design Template JSONの3空port、U-RIR-000..006を採取する。checked-in shadow schema／snapshotは
後続`PLAN-L7-490`でconsumer 0を確認して削除済みであり、current authorityへ戻さない。

## R1 観測テスト設計

- exact denominator、stable ID、statement digest、primary owner exactly-oneを検証する。
- owner contractの3 HAC／1 HAT、既知12 requirementのowner exact setを検証する。
- 発見証拠を捏造せず、Design Template portを推測で補完しない。
- current authorityはJSONだけで、旧Markdownはmigration／compatibility read-onlyである。

## R2 As-Is設計

shadow compilerはcanonical cutover前の一時migration componentとして意味不変を証明した。
後続490はcanonical JSON、generated view、DB projectionへ切り替え、shadow artifactを削除した。
したがって過去の「Markdown current authority」は履歴条件であり、現行判断へ再利用しない。

## R3 意図照合

PO意図は既存153 requirementを失わずJSON正本へ移し、旧定義を互換読込専用へ隔離することである。
本sliceはshadow migrationとretirementの証拠だけを閉じ、別engine、dual authority、旧writerを復活させない。

## R4 Forward再入

全backprop scopeは`preserve`で追加gapはない。`forward_routing: gap-only`として本Reverseと
`PLAN-L7-488`を双方向linkし、完了claimは移行・retirement済みsliceに限定する。
