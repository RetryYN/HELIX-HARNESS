---
plan_id: PLAN-REVERSE-491-design-template-json-authority
title: "PLAN-REVERSE-491: Design Template JSON純粋コアの設計backfill"
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
github_issue_id: 290
behavior_contract_id: DESIGN-TEMPLATE-JSON-AUTHORITY
responsibility_owner: design-template-json-authority
change_slice: atomic
pair_artifact: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
entry_signals:
  - "po_directive:2026-07-31 設計テンプレートJSON化を現行L1-L12正本へ接着する"
backprop_scope:
  - layer: L3-requirements
    decision: preserve
    evidence_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    reason: "RDJ-FR-008と§2.1がtemplate／obligation／artifact kindの接続口を既に定義する。"
  - layer: L4-basic-design
    decision: preserve
    evidence_path: docs/design/helix/L4-basic-design/design-template-json-authority.md
    reason: "template、registry、applicability、shadow、viewのcomponent境界がL7実装と一致する。"
  - layer: L5-detailed-design
    decision: preserve
    evidence_path: docs/design/helix/L5-detail/design-template-json-authority.md
    reason: "strict field、状態、例外、capacity、semantic digest契約がL7実装と一致する。"
  - layer: L6-function-design
    decision: preserve
    evidence_path: docs/design/helix/L6-function-design/design-template-json-authority.md
    reason: "5 pure functionの事前・事後・不変・失敗契約が実装exportと一対一である。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
    reason: "U-DTJ-001..017が実テストへexact citationされ、正負oracleを保持する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L4-design-template-json-authority-system-test-design.md
    reason: "L4↔L9のsystem境界はpure coreの完了範囲と後続Portfolio Plannerを分離する。"
  - layer: verification-design
    decision: preserve
    evidence_path: docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md
    reason: "L5↔L8のintegration境界はpure coreと後続writer／generatorを分離する。"
agent_slots:
  - role: se
    slot_label: "SE — R0/R2 implementation／design trace再構成"
  - role: qa
    slot_label: "QA — R1 oracle exact setと副作用境界の反証"
  - role: tl
    slot_label: "TL — R3意図照合とR4 Forward再入判定"
generates:
  - artifact_path: docs/plans/PLAN-REVERSE-491-design-template-json-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-L7-491-design-template-json-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L4-basic-design/design-template-json-authority.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L5-detail/design-template-json-authority.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L6-function-design/design-template-json-authority.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L4-design-template-json-authority-system-test-design.md
    artifact_type: test_design
  - artifact_path: docs/test-design/helix/L5-design-template-json-authority-integration-test-design.md
    artifact_type: test_design
dependencies:
  parent: null
  requires: []
  references:
    - docs/plans/PLAN-L7-491-design-template-json-authority.md
    - docs/design/helix/L3-requirements/requirement-discovery-json-authority.md
    - docs/design/helix/L4-basic-design/design-template-json-authority.md
    - docs/design/helix/L5-detail/design-template-json-authority.md
    - docs/design/helix/L6-function-design/design-template-json-authority.md
    - docs/test-design/helix/L8-design-template-json-authority-unit-test-design.md
    - tests/design-template-authority.test.ts
---

# PLAN-REVERSE-491: Design Template JSON純粋コアの設計backfill

## R0 現状採取

PR #308で追加された`src/design/design-template-authority.ts`の5 pure function、17 test、module境界、
副作用surfaceを採取する。観測対象はcurrent HEADへ固定し、後続Portfolio Planner、Design Instance writer、
Markdown／図表generatorを実装済みとして数えない。

`has_existing_tests=true`。観測対象は`tests/design-template-authority.test.ts`の
`U-DTJ-001..017`であり、unknown field、unsafe integer、legacy pair、digest drift、capacity、入力mutationを
個別反例として保持する。

## R1 観測テスト設計

- template／registry／applicability／shadow／viewの5責務がL6 functionと一対一である。
- current pairは`L1↔L12`から`L6↔L7`だけを受理し、legacy pairをauthorityへ昇格しない。
- applicabilityは`applicable`／`not_applicable`／`evaluation_error`を混同しない。
- filesystem、network、DB、process、writerへの副作用は0である。
- semantic digestとgenerated view parityは入力順や入力object mutationに依存しない。

## R2 As-Is設計

実装は既存L4 component、L5 strict aggregate、L6の5 pure function契約を変更せず具体化している。
新しい正本、別registry、別digest実装、永続化ownerは追加していない。したがって上位設計の意味変更や
Redesignへのrerouteは不要で、既存設計を`preserve`する。

## R3 意図照合

PO意図は、設計テンプレートの機械検証対象をJSON authorityへ移しながら、説明・代替案・trade-offを
生成／補足viewとして保持することである。本sliceはそのauthority pure coreだけを閉じ、
Portfolio Planner、Design Instance生成、pair graph freezeを後続episodeとして残すため、過大な完了claimをしない。

## R4 Forward再入

`PLAN-L7-491`と本Reverseを双方向linkし、既存L3接続口、L4/L5/L6設計、L8/L9 oracleへ再接着する。
独立reviewとCIがcurrent HEADで成立した後だけ本PLANをconfirmedへ遷移し、
`PLAN-L7-491.completion_claim_allowed`をpure core sliceに限ってtrueへ変更する。
