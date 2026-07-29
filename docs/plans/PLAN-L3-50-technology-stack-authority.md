---
plan_id: PLAN-L3-50-technology-stack-authority
title: "PLAN-L3-50 (add-design): HELIX technology stack authorityをL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: confirmed
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
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-29T00:24:43Z"
    reviewed_at: "2026-07-29T00:26:10Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #263 HEAD e5132c65b8ae3bfed60a443e25fd57e57b45cd41をClaude AI-Bがread-only検証した。前HEAD 9844b6ee時点で指摘したblocker 2件の解消を実測確認した。①design catalog baselineへの追記でDESIGN_BASELINE_FINGERPRINT pinがdriftしdesign-coverageがredだった件は、baselineではなくitem requirement-spec (category=req) のartifactへ登録し直す方式で解消され、baseline部分はorigin/mainとbyte一致 (sha256:87e76a367942744ea52bab77a74bb0ce4c37bbd503ccd1bd02f46146fb388520) でpin更新が不要になった。宣言8 pathも維持されている。②acceptance oracleがPLAN本体にstatus: draftをpinしておりconfirm遷移自体がU-007をredにする自己矛盾だった件は、status∈{draft,confirmed}判定へ緩和され、代わりにrequirement pathがcatalog内でexactly onceかつbaselineセクションより前に出現することを固定する再発防止oracleが追加された。同一local環境でorigin/mainとPR HEADのdoctorを別worktreeで比較し、main baselineのfailing-checksがcodexHookTrust/teamReviewReceipts/greenCommandDigestの3件で2回連続再現安定であること、PR HEADの追加redがmergedPlanStatusとobjectiveEvidenceAuditの2件のみで、いずれもstatus: confirmedへ遷移させると収束する既知transitionであることを実測した (design-coverageは総合49.5% done=47/todo=48/na=27でmainと同一、劣化なし)。G-10 completion rowの基準値は変更していない。negative polarityはmutation実測7/7 kill: Bunをoptional_measured_componentへ降格、required_stack_fieldsからunresolved_items欠落、Node.js 26 Current自動採用への反転、TypeScript 7がGo実装であることをGo採用根拠にする反転、AC 12→11削減、requirement pathのbaseline再追加、requirement pathのcatalog item除去。一次情報receipt 3件は実URLを取得して実在と内容整合を確認した (TypeScript 7.0 GA 2026-07-08と@typescript/typescript6互換経路、Node.js v24 Krypton=Active LTS / v26=Current、Python 3.14 2025-10-07でfree-threadedはPEP 779公式・JITはexperimental)。active Bun surfaceは.github/.claude/scripts/src/config/package.jsonで実測0件であり、docs prose残存は#253へ退役route済みかつ§2完了境界が完了を主張していないため誤claimではない。green_commandsはreviewer runtimeが当該HEADで実測した値である。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/263#issuecomment-5111314909 (current HEADに対するapprove receipt)。HEAD 9844b6eeに対するchanges requested receipt https://github.com/RetryYN/HELIX-HARNESS/pull/263#issuecomment-5111192014 は判定が異なるため本approveのreceiptとしては束縛せず、履歴として保持する"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/l3-technology-stack-authority.test.ts tests/l3-g3-freeze-packet-v2.test.ts tests/design-coverage.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-29T00:24:43Z"
        evidence_path: tests/l3-technology-stack-authority.test.ts
        output_digest: "sha256:832862eeba41db07d17f5cd3af6e857ac51b204bab25a9fe65d35573d28a9435"
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
  - artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts
    artifact_type: source_module
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-technology-stack-authority.test.ts
    artifact_type: test_code
  - artifact_path: tests/l12-hybrid-recognition.test.ts
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

# PLAN-L3-50: HELIX technology stack authority 技術正本

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
