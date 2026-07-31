---
plan_id: PLAN-REVERSE-487-requirement-discovery-event-projection
title: "PLAN-REVERSE-487: Requirement Discovery event projectionの設計backfill"
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
github_issue_id: 284
behavior_contract_id: REQUIREMENT-DISCOVERY-EVENT-PROJECTION
responsibility_owner: requirement-discovery-event-projection
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-31 Requirement Engine実装を現行L1-L12正本へReverse接着する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    reason: "RDJ-FR-001..012がL1/L2/L3 authority、8 surface、人間判断、3軸分離を既に定義する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/requirement-translation-obligation.md
    reason: "既存RequirementDefinitionLedger前段の翻訳obligation境界を変更しない。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md
    reason: "17 event、candidate lifecycle、human authority、10条件収束のpure契約が実装と一致する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md
    reason: "U-RDJ-000..007が実テストへexact citationされ、正負oracleを保持する。"
agent_slots:
  - role: se
    slot_label: "SE — R0/R2実装・設計trace再構成"
  - role: qa
    slot_label: "QA — R1 authority／chain／lifecycle反証"
  - role: tl
    slot_label: "TL — R3意図照合とR4 gap-only判定"
generates:
  - { artifact_path: docs/plans/PLAN-REVERSE-487-requirement-discovery-event-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/plans/PLAN-L7-487-requirement-discovery-event-projection.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L5-detail/requirement-translation-obligation.md, artifact_type: design_doc }
  - { artifact_path: docs/design/helix/L6-function-design/requirement-discovery-event-projection.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md, artifact_type: test_design }
  - { artifact_path: config/requirement-discovery-event-schema.json, artifact_type: json_config }
  - { artifact_path: src/requirements/requirement-discovery.ts, artifact_type: source_module }
  - { artifact_path: tests/requirement-discovery.test.ts, artifact_type: test_code }
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-L7-487-requirement-discovery-event-projection.md
    - docs/plans/PLAN-L6-88-requirement-discovery-event-projection.md
    - docs/plans/PLAN-L3-53-requirement-discovery-json-authority.md
    - docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    - docs/design/helix/L5-detail/requirement-translation-obligation.md
    - docs/design/helix/L6-function-design/requirement-discovery-event-projection.md
    - docs/test-design/helix/L8-requirement-discovery-event-projection-unit-test-design.md
    - tests/requirement-discovery.test.ts
---

# PLAN-REVERSE-487: Requirement Discovery event projectionの設計backfill

## R0 現状採取

PR #291で追加されたstrict event union、canonical digest、candidate lifecycle、human-only decision、
deterministic reducer、10条件収束とU-RDJ-000..007をcurrent HEADから採取する。DB、network、filesystem、
L3 canonical writerは実装されていないため、Requirement Discovery Engine全体の完了として数えない。

## R1 観測テスト設計

- schemaとL3正本は同じ8 surfaceを持ち、片側driftを拒否する。
- event改変、chain gap、mixed initiative、unknown field、duplicate questionを拒否する。
- AI accept／reject／agreement、L2 frozen、score-only convergenceを拒否する。
- `none`は理由と再評価条件を必須とし、assigned surfaceへの専用field混入を拒否する。

## R2 As-Is設計

実装は既存L3 authority、L5 translation obligation、L6 pure function契約、L8 oracleを変更せず具体化する。
別Requirement Engine、別DB、canonical writer、CLI、filesystem portを追加していない。

## R3 意図照合

PO意図はL1人間向け要求、L2 append-only discovery、L3 strict JSON canonicalを分離し、AIが人間判断を
捏造しないRequirement Discovery Loopを作ることである。本sliceはそのnoncanonical pure projectionだけを閉じ、
production interview/runtime、canonical cutover、下流L4〜L12完了を主張しない。

## R4 Forward再入

全backprop scopeは`preserve`であり追加gapはない。`forward_routing: gap-only`として本Reverseと
`PLAN-L7-487`を双方向linkし、pure projection sliceだけのcompletion claimを許可する。
