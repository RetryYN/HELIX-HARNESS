---
plan_id: PLAN-L3-43-management-integration-cell-model
title: "PLAN-L3-43 (add-design): 管理・統合セル＋ペア開発セルNをL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-28 管理・統合セル1組とペア開発セルNを工程表／GitHub Projectsへ接続する"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: MIC-FR-001
responsibility_owner: management-integration-cell-orchestration
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: not_applicable
no_code_decision: add_code
ddd_modeling_decision: value_object
contract_preconditions: "PR #240でdevelopment styleとcase-driven modelの別軸化がcurrent mainへ着地し、cell topologyのL3/L10正本が存在しない"
contract_postconditions: "管理・統合セル1組とペア開発セルNの排他lease、独立review、直列merge、工程表／Projects投影をMIC-FR-001へ束縛する"
contract_invariants: "development style、case-driven model、specialist process、runtime modeを変更せず、L4〜L7実装完了を先取りしない"
contract_failures: "二重writer、競合lane、自己review／merge、stale HEAD、GitHub表示の正本逆流、旧WCC-FR-13〜15再利用をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "L3/L10の文書と既存oracleだけを追加し、scheduler、DB schema、runtime service、dependencyを増やさない"
removal_trigger: "management integration cell contractが上位の実行組織正本へ統合され、本L3/L10 deltaのconsumerが0になった時点"
github_issue_id: 241
parent_design: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — PM/TL authority、merge queue、共有正本、Projects projection境界を設計"
  - role: qa
    slot_label: "QA — 二重writer、stale HEAD、projection逆流、軸混同をnegative mutationで検証"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-28T17:16:01Z"
    tests_green_at: "2026-07-28T17:17:46Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #247 HEAD 2ef816587b25e29fa94015fce7e6c7e4291e3e03をClaude AI-Bがread-only検証し、前回blocker 3件の解消、MIC-U-004/U-007のnegative mutation kill、内容面blocker 0を確認した。draft中だけoutstanding countが22から23へ動くG-10 rowは更新せず、PLAN-L3-42と同じ二段階収束で本PLANをconfirmedへ遷移する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/247#issuecomment-5107385069"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/l3-management-integration-cell.test.ts tests/l12-hybrid-recognition.test.ts tests/l3-progression-authority.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T17:17:46Z"
        evidence_path: tests/l3-management-integration-cell.test.ts
        output_digest: "sha256:249a3146dc7bdb524d3296adbf67b6179ce5d0aba68d763fe2e894f4ce77c02d"
generates:
  - artifact_path: docs/plans/PLAN-L3-43-management-integration-cell-model.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/management-integration-cell-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/management-integration-cell-acceptance.md
    artifact_type: test_design
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-management-integration-cell.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/infinity-loop-functional-requirements.md
  requires:
    - docs/plans/PLAN-L3-40-delivery-route-selection.md
  references:
    - docs/design/helix/L3-requirements/github-operations-projection.md
    - docs/test-design/helix/github-operations-projection-acceptance.md
  blocks:
    - issue:213
    - issue:214
    - issue:215
---

# PLAN-L3-43: 管理・統合セル＋ペア開発セルN

## §0 目的

current mainのL1-L12正本だけを入力に、実行組織を管理・統合セル1組とペア開発セルNへ分離する。
closed PR #90の未着地WCC IDを再利用せず、新規`MIC-FR-001`としてL3/L10 pairを閉じる。

## §工程表

### Step 1: authority差分 [直列]

- PR #240後のdevelopment style／case-driven modelとcell topologyを別軸へ固定する。
- current mainに実在しない`WCC-FR-13`〜`WCC-FR-15`を入力authorityから除外する。

### Step 2: L3 contract [直列]

- PM dispatch、TL integration、paired cell、exact binding、conflict exclusion、capacity、Projects projectionを
  `MIC-FR-001`のsupporting requirementとして定義する。

### Step 3: L10 oracle [直列]

- 正常系だけでなく二重writer、自己review／merge、stale HEAD、projection逆流、軸混同を拒否する
  exact 12 ACを設計する。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-Bがcurrent HEADをread-only検証し、Critical／High／Medium 0とfull CI greenを
  同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: `MIC-FR-001` exactly oneと`MIC-R-01`〜`MIC-R-07`がL3に存在する。
- AC-2: `MIC-AC-001`〜`MIC-AC-012`がL10に存在し、全supporting requirementを被覆する。
- AC-3: management cellだけがfinal merge authorityを持ち、paired cellの直接main mergeを拒否する。
- AC-4: task packetとcell bindingがexact field setを持ち、競合taskへ二重leaseを発行しない。
- AC-5: 工程表／`harness.db`がauthority、GitHub Projectsがread-side projectionのままである。
- AC-6: V／Scrum／Hybrid、Discovery／PoC、Design HARNESS、runtime mode、cell topologyを別軸に保つ。
- AC-7: closed PR #90の`WCC-FR-13`〜`WCC-FR-15`を正本traceへ再利用しない。

## §2 非対象

- scheduler、lease、notification、Projects API、DB schemaの実装。
- #213〜#215、#81、#92の完了主張。
- 新しいstyle、case-driven model、specialist process、runtime mode。

## §3 検証コマンド

- `npx vitest run --project fast tests/l3-management-integration-cell.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-43-management-integration-cell-model.md`
- `npm run typecheck`
