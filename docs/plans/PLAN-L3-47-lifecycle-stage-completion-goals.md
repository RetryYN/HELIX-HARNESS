---
plan_id: PLAN-L3-47-lifecycle-stage-completion-goals
title: "PLAN-L3-47 (add-design): 工程ゴールと完了権限をL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-29 要求・要件・基本設計・詳細設計・実装・検証・運用のゴールを明文化する"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: STAGE-GOAL-FR-001
responsibility_owner: lifecycle-stage-completion-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "L1-L12の層名とpairは正本化済みだが、7工程の意味ゴールと共通exit receiptが単一L3契約へ閉じていない"
contract_postconditions: "7工程がexact owner、required output、正負oracle、未解決一覧、current HEAD receiptを持ち、3 styleと別軸case／specialistが同じ完了権限に従う"
contract_invariants: "L1-L12以外をcurrent authorityへ戻さず、L4以降の設計／実装／実行完了を先取りしない"
contract_failures: "成果物存在だけの完了、stale evidence、片側oracle、未解決隠蔽、旧定義によるcurrent failure相殺をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
github_issue_id: 249
parent_design: docs/governance/helix-harness-requirements_v1.3.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — L1-L12各工程のentry／exit／owner／pair境界を確定"
  - role: qa
    slot_label: "QA — 正負oracle、stale evidence、未解決隠蔽、旧authority混入をmutation検証"
generates:
  - artifact_path: docs/plans/PLAN-L3-47-lifecycle-stage-completion-goals.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/lifecycle-stage-completion-goals.md
    artifact_type: design_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/lifecycle-stage-completion-goals-acceptance.md
    artifact_type: test_design
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-lifecycle-stage-completion-goals.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/governance/helix-harness-requirements_v1.3.md
  requires:
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
    - docs/plans/PLAN-L3-40-delivery-route-selection.md
    - docs/plans/PLAN-L3-43-management-integration-cell-model.md
  references:
    - docs/process/gates.md
    - docs/governance/infinity-loop-design-progress-ledger.md
  blocks:
    - issue:30
---

# PLAN-L3-47: 工程ゴールと完了権限

## §0 目的

要求定義から運用までの7工程を、成果物名ではなく機械検証可能な完了意味へ束縛する。
L3/L10 pairだけを変更し、下流実装を開始しない。

## §工程表

### Step 1: current authority抽出 [直列]

- L1〜L12正規pairと既存G1〜G12の意味を読み、cutover指示書§5のcompatibility schemeと旧縮退routeを
  入力authorityから除外する。

### Step 2: L3工程ゴール [直列]

- 7工程のgoal、owner、required output、unresolved item、exit receiptを`STAGE-GOAL-FR-001`へ統合する。

### Step 3: L10正負oracle [直列]

- 各工程にpositive／negative oracleを対で置き、stale HEAD、未解決隠蔽、片側oracle、旧authority混入を拒否する。

### Step 4: 独立review [直列]

- authoring runtimeと異なるAI-Bがcurrent HEADをread-only検証し、Critical／High／Medium 0とfull CI greenを
  同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: `STAGE-GOAL-FR-001` exactly oneと`STAGE-GOAL-R-01`〜`07`が存在する。
- AC-2: `STAGE-GOAL-AC-001`〜`014`が全工程の正負境界を被覆する。
- AC-3: 3 development styleが同じ工程ゴールを使い、case-driven modelとspecialist processは別軸を保つ。
- AC-4: `stage_exit_contract` exact setがowner、scope、未解決、HEAD、digest、独立reviewを含む。
- AC-5: 旧定義はcompatibility inputだけに限定し、current output／review／completionへ出さない。

## §2 非対象

- L4以降の設計降下、source、schema、detector、runtime、CI実装。
- 新しいstyle、case-driven model、specialist process、layerの追加。
- 既存PRのscope expansion。

## §3 検証コマンド

- `npx --no-install vitest run --project fast tests/l3-lifecycle-stage-completion-goals.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-47-lifecycle-stage-completion-goals.md`
- `npm run typecheck`
