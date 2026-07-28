---
plan_id: PLAN-L3-50-technology-stack-authority
title: "PLAN-L3-50 (add-design): HELIX technology stack authorityをL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-29 TypeScript 7、Node/Python、Rust/Go、高速gate、Bun廃止をG3前に技術選定する"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: TECH-STACK-FR-001
responsibility_owner: helix-technology-stack-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L3-47〜49で工程ゴール、authority axis、HELIX-Benchが固定されている"
contract_postconditions: "TypeScript／Node、Python、Rust、Go、Bun、fast gateの採用境界がL3/L10へ束縛される"
contract_invariants: "package、runtime、CI、detector、skill commandを実装せず、Python意味コアとNode実行境界を同格の層別authorityとして維持する"
contract_failures: "Bun再activation、Node Current自動採用、未検証TS cutover、Python write authority、測定なしnative runtime、未解決隠蔽をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存ADRと最新toolchain選択を一つのL3/L10採用契約へ集約し、暗黙のversion選択とruntime増殖を防ぐ"
removal_trigger: "上位technology portfolio authorityへ統合され本deltaのconsumerが0になった時点"
github_issue_id: 254
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — runtime責務、version policy、採用境界を定義"
  - role: qa
    slot_label: "QA — negative oracle、Bun禁止、fast/full分離を検証"
generates:
  - artifact_path: docs/plans/PLAN-L3-50-technology-stack-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/technology-stack-authority.md
    artifact_type: design_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/technology-stack-authority-acceptance.md
    artifact_type: test_design
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-technology-stack-authority.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires:
    - docs/plans/PLAN-L3-47-lifecycle-stage-completion-goals.md
    - docs/plans/PLAN-L3-48-requirement-style-case-authority.md
    - docs/plans/PLAN-L3-49-helix-bench-evaluation.md
  references:
    - docs/adr/ADR-009-node-python-linux-runtime.md
    - docs/adr/ADR-010-python-semantic-core-node-commit-boundary.md
  blocks: []
---

# PLAN-L3-50: HELIX technology stack authority

## §0 目的

G3が古いtoolchainまたは暗黙のruntime増殖をfreezeしないよう、採用境界と未解決一覧を確定する。

## §工程表

### Step 1: current inventory [直列]

- package、ADR、runtime、CI、skillのcurrent／target／historical surfaceを分類する。
- official release、support、compatibility情報を確認日付きで記録する。

### Step 2: L3 stack contract [直列]

- 5 stack disposition、14 field、責務、version、compatibility、migration、rollbackを固定する。
- Bunをactive authorityから除外し、Rust／Goを測定付きoptional componentへ限定する。

### Step 3: L10 positive／negative oracle [直列]

- authority越境、Bun再activation、未検証cutover、native runtime濫用、未解決隠蔽を検査する。

### Step 4: independent review [直列]

- authoring runtimeと異なる独立AI-Bがcurrent HEADをread-only検証し、Critical／High／Medium 0と
  full CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: 5 dispositionと14 fieldがexact setである。
- AC-2: Python意味コアとNode実行境界が同格の層別authorityである。
- AC-3: TypeScript 5.6／6 API／7 nativeの移行境界が明示される。
- AC-4: Rust／Goは測定済みbounded component以外へ拡張されない。
- AC-5: active Bun surfaceは0である。
- AC-6: fast preflightとfull admissionが分離される。
- AC-7: 未解決5件が隠されない。
- AC-8: package、runtime、CI、detectorを実装しない。

## §2 検証コマンド

- `npx vitest run --project fast tests/l3-technology-stack-authority.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-50-technology-stack-authority.md`
- `npm run typecheck`
