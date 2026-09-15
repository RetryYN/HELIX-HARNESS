---
plan_id: PLAN-L3-49-helix-bench-evaluation
title: "PLAN-L3-49 (add-design): HELIX-Bench評価契約をL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-29 HELIX本体・組織編成・harness profileを比較する独自benchを要件化する"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: HELIX-BENCH-FR-001
responsibility_owner: helix-benchmark-evaluation-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L3-48でcurrent requirement surfaceのstyle／case／specialist境界が固定されている"
contract_postconditions: "HELIX-Benchの5カテゴリ、12指標、比較axis、task snapshot、run protocol、scoring、cost、integrityがL3/L10 pairへ束縛される"
contract_invariants: "runner、dataset、dashboard、provider接続、worker admissionを実装せず、既存worker admission benchを複製しない"
contract_failures: "provider優遇、failure除外、hidden oracle漏洩、比較cohort混在、費用欠測0円化、historical score流用をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "既存bench断片を重複実装せず上位評価契約へ集約し、L4以降の実装境界を明確にする"
removal_trigger: "上位product evaluation authorityへ統合され本deltaのconsumerが0になった時点"
github_issue_id: 251
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — benchmark責務、比較axis、再現性境界を定義"
  - role: qa
    slot_label: "QA — exact set、failure polarity、provider中立性を検証"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-28T23:11:23Z"
    reviewed_at: "2026-07-28T23:11:28Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #262 HEAD 5e535ecc6dd24861084d3653de7bcfd77da9f1deをClaude AI-Bがread-only検証した。ef6c08be時点で指摘したblocker 3件（design-language english prose 6件、biome format、polarity mutation 2件生存）の解消を確認し、R-08のhistorical result再利用禁止、§0のaxis分離、R-06のscope violation非相殺の3 mutationがいずれもoracleをredにすることを実測した。宣言8 pathとactual diffの一致、design catalog digestの3 owner同期も確認済み。G-10 completion rowはdraft中だけoutstanding countが動くため更新せず、本PLANのconfirmed遷移で収束させる。green_commandsはreviewer runtimeが当該HEADで実測した値である。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/262#issuecomment-5110485064"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/l3-helix-bench-evaluation.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/l3-progression-authority.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T23:11:23Z"
        evidence_path: tests/l3-helix-bench-evaluation.test.ts
        output_digest: "sha256:d0845c93e26079b57a9bf22ed47e20ace346b1c0baf5b60501a17d7584f20c8b"
generates:
  - artifact_path: docs/plans/PLAN-L3-49-helix-bench-evaluation.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/helix-bench-evaluation.md
    artifact_type: design_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/helix-bench-evaluation-acceptance.md
    artifact_type: test_design
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-helix-bench-evaluation.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires:
    - docs/plans/PLAN-L3-43-management-integration-cell-model.md
    - docs/plans/PLAN-L3-47-lifecycle-stage-completion-goals.md
    - docs/plans/PLAN-L3-48-requirement-style-case-authority.md
  references:
    - docs/plans/PLAN-L3-18-worker-contract-benchmark-promotion.md
    - docs/design/helix/L3-requirements/worker-common-contract.md
    - docs/test-design/helix/worker-common-contract-acceptance.md
  blocks: []
---

# PLAN-L3-49: HELIX-Bench評価契約

## §0 目的

HELIX-Benchをworker単体選定の別名にせず、要求からaccepted changeまでを完遂する組織編成と
harness profileの品質・安全・costを比較する上位L3/L10 contractとして定義する。

## §工程表

### Step 1: existing bench inventory [直列]

- `HR-FR-HIL-22`、`WCC-FR-07/08`、Task Performance Scorecardを棚卸しする。
- worker admission benchを複製せず、下位receiptとして再利用する。

### Step 2: L3 evaluation contract [直列]

- 5カテゴリ、12指標、2比較axis、task snapshot、run protocol、evidence、cost、integrityを固定する。
- style／case／specialist／runtime／team／profileを混在させない。

### Step 3: L10 positive／negative oracle [直列]

- exact set、provider中立性、failure非相殺、hidden oracle分離、cohort比較、費用欠測を検査する。

### Step 4: independent review [直列]

- authoring runtimeと異なる独立AI-Bがcurrent HEADをread-only検証し、Critical／High／Medium 0と
  full CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: 5カテゴリと12指標がexact setである。
- AC-2: team compositionとharness profileが別axisである。
- AC-3: task snapshotとrun protocolが再現可能である。
- AC-4: raw receiptからscore、cost、confidence intervalを再計算できる。
- AC-5: 重大failure、欠測、未収束を平均または欠損除外で隠さない。
- AC-6: provider／model／HELIX Fullへ固定優遇がない。
- AC-7: worker admission benchとの責務重複がない。
- AC-8: runner、dataset、dashboard、provider接続を実装しない。

## §2 検証コマンド

- `npx vitest run --project fast tests/l3-helix-bench-evaluation.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-49-helix-bench-evaluation.md`
- `npm run typecheck`
