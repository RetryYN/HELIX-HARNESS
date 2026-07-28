---
plan_id: PLAN-L3-40-delivery-route-selection
title: "PLAN-L3-40 (add-design): delivery route意味残差をL3へ再接着"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-25 GPT5.6Pro外部監査によりG1/G3前のdelivery route意味欠落を確認"
created: 2026-07-25
updated: 2026-07-28
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: L12R-FR-002
responsibility_owner: delivery-route-selection
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: modify
ddd_modeling_decision: none
contract_preconditions: "閉鎖済みPR #90とpark中PR #127はauthorityではなく、現行L3/L10にdelivery route意味残差が存在する"
contract_postconditions: "同列development style 3種、別軸case-driven model、production共通承認、slice境界、Design Refactor境界をL3/L10 pairへ接着する"
contract_invariants: "schema、router、DB projection、L6/L7実装状態を変更せず、G1/G3承認を先取りしない"
contract_failures: "L3/L10の意味不一致、縮退production route、旧enumの正本再導入をoracleでfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
github_issue_id: 30
parent_design: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — PR #90/#127と現行mainのdelivery route意味差分を抽出"
  - role: qa
    slot_label: "QA — 縮退Scrum、Hybrid欠落、route承認欠落をL3/L10 pairで検出"
generates:
  - artifact_path: docs/plans/PLAN-L3-40-delivery-route-selection.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/l12-scrum-rebaseline-acceptance.md
    artifact_type: test_design
  - artifact_path: tests/l3-delivery-route-selection.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires: []
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/design/helix/L3-requirements/github-autonomous-operations-requirements.md
  blocks:
    - G1
    - G3
---

# PLAN-L3-40: delivery route意味残差をL3へ再接着

## §0 目的

閉鎖済みPR #90とpark中PR #127をauthorityとして復活させず、PO構想に必要なdelivery routeの
意味資産だけを現行L3/L10 pairへ原子的に再接着する。実装、schema、router、DB projectionは混載しない。

## §1 受入条件

- AC-1: VモデルとProduction Scrumを同格のdelivery engineとし、縮退品質tierを禁止する。
- AC-2: V-model、Production Scrum、V設計＋Scrum実装Hybridを同列styleとして選択し、Discovery／PoCはScrum非内包のcase-driven modelとして別軸で発動する。
- AC-3: 全production routeはL1〜L3、ユーザー要件承認、L3 freeze時のroute合意を共有する。
- AC-4: L3後slice化、L5後slice化、slice化なしをそれぞれProduction Scrum、Hybrid、Forwardへ固定する。
- AC-5: Design Refactorは外部契約不変だけを扱い、意味変更はRedesignへfail-closeする。
- AC-6: 旧`PRODUCTION_SCRUM_REDUCED_V`は入力互換に限定し、新規正本出力に使わない。

## §2 非対象

- delivery route schema、router、PLAN template、DB projectionの実装。
- PR #90/#127に含まれたGitHub、cloud、worker、CI性能、L4〜L7変更。
- G1/G3 freezeの成立主張。

## §3 検証コマンド

- `npx vitest run --project fast tests/l3-delivery-route-selection.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-40-delivery-route-selection.md`
- `npm run typecheck`
