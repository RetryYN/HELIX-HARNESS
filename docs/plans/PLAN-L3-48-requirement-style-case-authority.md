---
plan_id: PLAN-L3-48-requirement-style-case-authority
title: "PLAN-L3-48 (add-design): L1/L3要求・要件正本をstyle／case／specialist軸へ再束縛"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-29 Issue #252のcurrent requirement surfaceを新authorityへ再束縛する"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-REQUIREMENT-001
responsibility_owner: development-model-requirement-projection
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L3-47の工程完了ゴールがdependency branchに存在する"
contract_postconditions: "指定5 L1/L3要求・要件正本が3 development style、別軸case-driven model、別軸specialist capability、L1〜L12 only authorityを拘束する"
contract_invariants: "L4以降の設計、runtime schema、review／completion判断、historical artifactを変更せず、変更したL1/L3意味の既存projection文字列・digest・line ownerと対応oracleだけを同期する"
contract_failures: "V/Scrum/Hybridの非同列化、Discovery／PoCのScrum内包、Design HARNESSのstyle化、old layer authority、active Bun経路をfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "要求面に混在していたstyle／case／specialist／runtime分類を直交軸へ分離し、旧taxonomyのcurrent authorityを除去する"
removal_trigger: "runtime cutover後、compatibility読込がconsumer 0を証明した時点で旧taxonomy説明をarchiveへ移す"
github_issue_id: 252
parent_design: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — requirement authorityを直交軸へ整理"
  - role: qa
    slot_label: "QA — exact scopeとpolarity mutationを検証"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-28T21:45:38Z"
    reviewed_at: "2026-07-28T21:45:43Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #261 HEAD e9f45b04db95e9791174d8f2611fe60bd10541f9をClaude AI-Bがread-only検証した。772b28c5以降に指摘したbranch prefix、L1-L12 drift gate固定値、design-language、polarity mutation、definition ledgerのline／digest、residual disposition digest、pin済み文言消失、PR body scope宣言の各blockerが解消済みであることを確認した。19 exact pathとactual diffの完全一致、単一approved receiptのAPPROVED_EXPANSION一致を実測し、追加7 fileがmarker／digest同期のみで判定ロジック・件数・ID集合・assertを変更しないことを差分で確認した。FR-L1-23／FR-L1-28／シナリオ3のpolarity反転3件がいずれもoracleをredにすることも実測した。G-10 completion rowはdraft中だけoutstanding countが動くため更新せず、本PLANのconfirmed遷移で収束させる。green_commandsはreviewer runtimeが当該HEADで実測した値である。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/261#issuecomment-5109477338"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/l3-requirement-style-case-authority.test.ts tests/l12-hybrid-recognition.test.ts tests/l12-canonical-authority.test.ts tests/infinity-loop-strict-design-contract.test.ts tests/feedback-test-owner-residual-disposition.test.ts tests/ai-vision-design-harness-requirements-binding.test.ts tests/semantic-frontier-consistency.test.ts tests/vmodel-pair.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-28T21:45:38Z"
        evidence_path: tests/l3-requirement-style-case-authority.test.ts
        output_digest: "sha256:b9249fbf39b9e779df3b75573a99a321dc8f5c104b271d5fb44e500a23204ebc"
generates:
  - artifact_path: docs/plans/PLAN-L3-48-requirement-style-case-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L1-requirements/functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/harness/L1-requirements/screen-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L1-requirements/infinity-loop-platform-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
    artifact_type: design_doc
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-requirement-style-case-authority.test.ts
    artifact_type: test_code
  - artifact_path: docs/governance/l12-hybrid-recognition-candidate-inventory-2026-07-19.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts
    artifact_type: source_module
  - artifact_path: tests/l12-canonical-authority.test.ts
    artifact_type: test_code
  - artifact_path: tests/l12-hybrid-recognition.test.ts
    artifact_type: test_code
  - artifact_path: docs/governance/feedback-test-owner-disposition-residual.json
    artifact_type: config
  - artifact_path: docs/governance/infinity-loop-requirement-definition-ledger.md
    artifact_type: markdown_doc
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: src/lint/semantic-frontier-consistency.ts
    artifact_type: source_module
  - artifact_path: tests/ai-vision-design-harness-requirements-binding.test.ts
    artifact_type: test_code
  - artifact_path: tests/semantic-frontier-consistency.test.ts
    artifact_type: test_code
  - artifact_path: tests/vmodel-pair.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
  requires:
    - docs/plans/PLAN-L3-40-delivery-route-selection.md
    - docs/plans/PLAN-L3-47-lifecycle-stage-completion-goals.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
  blocks:
    - issue:245
    - issue:251
    - issue:248
---

# PLAN-L3-48: L1/L3要求・要件正本の新authority再束縛

## §0 目的

Issue #252が指定した5つのcurrent requirement文書だけを対象に、分類を次の直交軸へ固定する。

- development styleとして`FULL_L1_L12_V` / `PRODUCTION_SCRUM` /
  `V_DESIGN_SCRUM_IMPLEMENTATION`を同列へ固定する。
- case-driven modelとしてDiscovery／PoCをScrum非内包の別軸へ固定する。
- specialist capabilityとしてDesign HARNESS、Reverse、Recovery等を別軸へ固定する。
- runtime modeとしてstandalone／claude-only／codex-only／hybridを別軸へ固定する。

旧定義はcompatibility inputの認識に限定し、current要求・要件、生成、routing、review、
verification、completionへ返さない。Bunはhistorical evidence以外のactive surfaceから廃止し、
Node/npmだけをcurrent commandとして出力する。

## §工程表

### Step 1: exact inventory [直列]

- Issue #252の5文書以外へ監査範囲を拡張しない。
- old physical filenameはrenameせず、本文authorityだけをL1〜L12へ正規化する。

### Step 2: orthogonal requirement contract [直列]

- 3 development styleを同列に固定する。
- Discovery／PoCをScrum非内包のcase-driven modelへ分離する。
- Design HARNESSをstyleではなくspecialist capabilityへ固定する。

### Step 3: compatibility boundary [直列]

- 旧layer／route taxonomyはcompatibility inputとしてのみ認識する。
- current output、fallback、rollback、verification commandにBunを使わない。

### Step 4: independent review [直列]

- authoring runtimeと異なる独立AI-Bがcurrent HEADをread-only検証し、Critical／High／Medium 0と
  full CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: 指定5文書がL1〜L12を唯一のcurrent layer authorityとして扱う。
- AC-2: 3 development styleがexact setかつ同列である。
- AC-3: Discovery／PoCはScrum非内包のcase-driven modelである。
- AC-4: Design HARNESSは別軸specialist capabilityである。
- AC-5: current output、fallback、rollback、verification commandにBunを使わない。
- AC-6: 旧taxonomyをcurrent generation／routing／review／verification／completionに使わない。
- AC-7: 変更scopeを5 requirement文書、PLAN、reviewed digest pin、対応test、および既存L12 recognition ownerの
  inventory／safe disposition／直接oracle同期に限定する。

## §2 非対象

- L4以降の設計／process文書。
- skill recommender、PLAN frontmatter schema、DB projectionのruntime cutover。
- review／completion implementationと右腕test design。
- historical evidenceの書換え。

## §3 検証コマンド

- `npx vitest run --project fast tests/l3-requirement-style-case-authority.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-48-requirement-style-case-authority.md`
- `npm run typecheck`
