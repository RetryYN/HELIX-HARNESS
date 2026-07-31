---
plan_id: PLAN-L3-44-authoring-style-case-authority
title: "PLAN-L3-44 (add-design): authoring surfaceをstyle／case-driven新定義へ再束縛"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-29 Issue #244のcurrent authoring surfaceを新authorityへ再束縛する"
created: 2026-07-29
updated: 2026-08-01
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-AUTHORING-001
responsibility_owner: development-model-authoring-surface
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PR #240で3 development styleと別軸case-driven modelがcurrent mainへ着地している"
contract_postconditions: "指定9 authoring surfaceが新style exact setとS0 hypothesis〜S4 decideを生成し、PoCをScrum phaseとして案内しない"
contract_invariants: "L1〜L12以外をauthorityにせず、historical artifact、runtime schema、design／verification surfaceを変更しない"
contract_failures: "PoCのScrum内包、Hybrid欠落、旧S0 backlog sequence、Bun実行例、S4後のForward固定をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
github_issue_id: 244
parent_design: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — authoring guidanceをstyle軸とcase-driven軸へ分離"
  - role: qa
    slot_label: "QA — exact inventoryと旧生成文言0を検証"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T17:21:17Z"
    reviewed_at: "2026-07-31T17:21:22Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #318 HEAD e82cab25e330f90137dcc8ee3686304588c44564をClaude AI-Bがread-only検証した。content blockerなしを確認し、draft中だけoutstandingが20→21となるbootstrapについて、statusをconfirmedへ遷移するとgoal-evidence-audit、CLI outstanding exact set、doctor objective-evidence-auditが全て20へ戻ることを独立再現した。前回提示したaudit／test 3 pathのscope拡張は不要として撤回し、declared scope内のPLAN transitionだけで閉じるapprove_after_fixesを発行した。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/318#issuecomment-5145629893"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/goal-evidence-audit.test.ts tests/design-language.test.ts tests/authoring-style-case-authority.test.ts tests/l12-hybrid-recognition.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-31T17:21:17Z"
        evidence_path: tests/authoring-style-case-authority.test.ts
        output_digest: "sha256:2a7990f100b4624599c830cb32696192417b5c47a86db5c284ed889537843873"
generates:
  - artifact_path: docs/plans/PLAN-L3-44-authoring-style-case-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/poc.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/design-tailoring.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/api-and-interface-design.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/documentation-and-adrs.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/spec-driven-development.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/acceptance-criteria-thinking.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/research.md
    artifact_type: markdown_doc
  - artifact_path: docs/skills/estimation.md
    artifact_type: markdown_doc
  - artifact_path: docs/templates/plan/poc/template.md
    artifact_type: markdown_doc
  - artifact_path: tests/authoring-style-case-authority.test.ts
    artifact_type: test_code
  - artifact_path: tests/l12-hybrid-recognition.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
  requires:
    - docs/plans/PLAN-L3-40-delivery-route-selection.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks:
    - issue:245
    - issue:246
---

# PLAN-L3-44: authoring surfaceの新authority再束縛

## §0 目的

current L1〜L12正本だけを入力に、指定されたskillとPoC templateを3 development styleと
別軸case-driven modelへ再束縛する。旧定義は新規案内へ使わず、runtime metadata移行は後続の
verification／runtime ownerで閉じる。

## §工程表

### Step 1: exact inventory [直列]

- Issue #244の9ファイルだけをcurrent authoring surfaceとして扱う。
- historical、design、runtime、review surfaceへ監査範囲を拡張しない。

### Step 2: authoring contract [直列]

- `FULL_L1_L12_V`、`PRODUCTION_SCRUM`、`V_DESIGN_SCRUM_IMPLEMENTATION`を同列styleとして記す。
- Discovery／PoCをScrum非内包のcase-driven modelとして分離する。
- `S0 hypothesis → S1 experiment plan → S2 poc → S3 verify → S4 decide`を生成する。

### Step 3: negative oracle [直列]

- Scrum phaseとしてのPoC、旧S0/S1名、`PLAN-SCRUM`、Bun実行例、S4後のForward固定を拒否する。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-Bがcurrent HEADをread-only検証し、Critical／High／Medium 0と
  full CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: exact 9 authoring filesが3 development styleのexact setを持つ。
- AC-2: Discovery／PoCを別軸case-driven modelとして案内する。
- AC-3: S0〜S4の名称が新定義と一致する。
- AC-4: PoC templateがScrum由来ID／fieldやBun commandを新規生成しない。
- AC-5: S4 adoptは選択済みproduction styleへ接続し、Forward固定にしない。
- AC-6: 変更scopeを9 authoring files、PLAN、authoring oracle、既存L12 recognition oracleに限定する。

## §2 非対象

- skill recommender、PLAN frontmatter schema、DB projectionのruntime実装。
- 設計／工程、レビュー／完了判定の範囲。
- historical evidenceの書換え。

## §3 検証コマンド

- `npx vitest run --project fast tests/authoring-style-case-authority.test.ts`
- `npx vitest run --project fast tests/l12-hybrid-recognition.test.ts`
- `npx vitest run --project fast tests/asset-catalog.test.ts tests/skill-assignment.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-44-authoring-style-case-authority.md`
- `npm run typecheck`
