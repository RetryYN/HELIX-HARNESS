---
plan_id: PLAN-REVERSE-490-requirement-json-authority-cutover
title: "PLAN-REVERSE-490: Requirement JSON authority cutoverの設計backfill"
kind: reverse
layer: cross
workflow_phase: R4
confirmed_reverse_type: design
route_mode: reverse
forward_routing: gap-only
promotion_strategy: reuse-as-is
drive: agent
status: confirmed
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
github_issue_id: 287
behavior_contract_id: REQUIREMENT-JSON-AUTHORITY-CUTOVER
responsibility_owner: requirement-json-authority
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
entry_signals:
  - "po_directive:2026-08-01 JSON canonical cutoverとlegacy隔離を現行L1-L12へReverse接着する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    reason: "L1 human intent、L2 candidate、L3 strict JSON canonicalを分離し、全style共通かつcase／specialist別軸を維持する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/requirement-translation-obligation.md
    reason: "153/24/72/24、owner／oracle、Design Template portのexact obligationをcanonical shardへ保持する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md
    reason: "JSON canonical、generated read-only、legacy compatibility-only、DB v41、shadow retirementを単一cutover契約として保持する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
    reason: "U-RAC-001..006とdual-authority mutationをcurrent authority回帰oracleとして保持する。"
agent_slots:
  - role: se
    slot_label: "SE — R0/R2 authority／projection／retirement trace再構成"
  - role: qa
    slot_label: "QA — R1 digest／consumer／shadow残存反証"
  - role: tl
    slot_label: "TL — R3 dual authority 0とR4 gap-only判定"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-490-requirement-json-authority-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/requirement-translation-obligation.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-json-authority-cutover.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/requirement-ir-authority.json, artifact_type: json_config }
  - { artifact_path: config/requirement-ir-schema.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/manifest.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/requirements.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/system_contracts.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/acceptance_cases.json, artifact_type: json_config }
  - { artifact_path: requirements-ir/system_tests.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-authority-gate.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-authority.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-L7-490-requirement-json-authority-cutover.md
    - docs/plans/PLAN-L6-91-requirement-json-authority-cutover.md
    - docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L6-function-design/requirement-json-authority-cutover.md
    - docs/test-design/helix/L8-requirement-json-authority-cutover-unit-test-design.md
    - config/requirement-ir-authority.json
    - requirements-ir/manifest.json
    - tests/requirement-authority.test.ts
---

# PLAN-REVERSE-490: Requirement JSON authority cutoverの設計backfill

## R0 現状採取

PR #298で実施したcanonical shard、generated view、compatibility exact set、DB `requirement_ir` v41、
shadow artifact／table retirement、authority doctor、U-RAC-001..006を採取する。canonical shard 4件は
`PLAN-L7-490`のowned artifactとして明示し、要件正本の無所有状態を解消する。

## R1 観測テスト設計

- 153/24/72/24、stable ID、record/root digest driftを拒否する。
- generated viewのbyte parity、compatibility 4件のdigest／frontmatterを検証する。
- allowlist外legacy semantic read、dual authority mutation、shadow artifact／table残存を拒否する。
- DB v41を2回rebuildし273 row、owner／oracle orphan 0、stale 0を検証する。

## R2 As-Is設計

`requirements-ir/manifest.json`と4 canonical shardだけがsemantic authorityである。generated Markdownは
read-only view、旧Markdownはdigest固定compatibility inputであり、いずれからもcanonical JSONへ逆流しない。
Nodeが唯一のtransaction writerとしてDB projectionをcommitし、旧shadow surfaceはretire済みとする。

## R3 意図照合

PO意図は現行L1〜L12だけを唯一のauthorityとし、旧定義を互換読込専用へ隔離することである。
本cutoverはV／Scrum／Hybridの共通Requirement Engineを確定し、Discovery／PoC caseと
Design HARNESS specialistを別軸のまま接続する。別engine、dual authority、旧writerを追加しない。

## R4 Forward再入

全backprop scopeは`preserve`で新たな設計gapはない。`forward_routing: gap-only`として本Reverseと
`PLAN-L7-490`を双方向linkし、完了claimをcanonical cutover、projection、legacy retirementへ限定する。
