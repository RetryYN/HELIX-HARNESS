---
plan_id: PLAN-L3-42-delivery-route-downstream-queue
title: "PLAN-L3-42 (add-design): delivery routeのdownstream queue採番"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-25 GPT5.6Pro外部監査でdelivery routeのL3/L10意味欠落を確認"
created: 2026-07-25
updated: 2026-07-26
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: L12R-FR-002
responsibility_owner: delivery-route-selection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "PLAN-L3-40でdelivery routeのL3/L10意味は閉じたが、対応するdownstream予約が0件である"
contract_postconditions: "delivery_route_convergenceをL4/L9、L5/L8、L6/L7へexactly once予約する"
contract_invariants: "既存84枠のID・意味・依存を変えず、pair closure・実装・TDDの完了を先取りしない"
contract_failures: "予約欠落、重複、依存逆転、既存slot driftをqueue oracleでfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
github_issue_id: 30
parent_design: docs/plans/PLAN-L3-40-delivery-route-selection.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — delivery route責務をL4/L9、L5/L8、L6/L7へexact予約"
  - role: qa
    slot_label: "QA — 既存84枠不変、追加3枠の一意性と依存DAGを検証"
generates:
  - artifact_path: docs/plans/PLAN-L3-42-delivery-route-downstream-queue.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-downstream-queue.json
    artifact_type: config
  - artifact_path: tests/l3-downstream-queue.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-40-delivery-route-selection.md
  requires:
    - docs/plans/PLAN-L3-40-delivery-route-selection.md
  references:
    - docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
    - docs/test-design/helix/l12-scrum-rebaseline-acceptance.md
  blocks:
    - G1
    - G3
---

# PLAN-L3-42: delivery routeのdownstream queue採番

## §0 目的

PLAN-L3-40で再接着したdelivery route責務をL3/L10文書だけで終わらせず、L4/L9、L5/L8、L6/L7へ
exactly onceで予約する。既存84枠のIDと意味を変更せず、末尾3枠だけを追補する。

## §工程表

### Step 1: pair closure予約 [直列]

- `L3Q-PC-046`へL4/L9、`L3Q-PC-047`へL5/L8を予約する。
- L5/L8は同一workstreamのL4/L9だけに依存させる。

### Step 2: implementation/TDD予約 [直列]

- `L3Q-IT-028`へL6/L7を予約し、`L3Q-PC-047`だけに依存させる。

### Step 3: 分母補正 [直列]

- pair closure 47、implementation/TDD 28、refactor 12、合計87へ補正する。

## §1 受入条件

- AC-1: 既存84枠のqueue ID、workstream、pair、dependencyを変更しない。
- AC-2: `delivery_route_convergence`がL4/L9、L5/L8、L6/L7をexactly once持つ。
- AC-3: 依存順はL4/L9→L5/L8→L6/L7でcycleを持たない。
- AC-4: queue予約をpair closure、実装、TDD、実行証拠の完了と数えない。

## §2 非対象

- L4以降の設計artifact、route schema/router、DB projection、runtime実装。
- G1/G3 freezeの成立主張。
- 既存queue slotの再採番。

## §3 検証コマンド

- `npx vitest run --project fast tests/l3-downstream-queue.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-42-delivery-route-downstream-queue.md`
- `npm run typecheck`
