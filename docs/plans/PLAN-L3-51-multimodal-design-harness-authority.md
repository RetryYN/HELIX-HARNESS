---
plan_id: PLAN-L3-51-multimodal-design-harness-authority
title: "PLAN-L3-51 (add-design): multi-modal Design HARNESS authorityをL3/L10へ定義"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-29 Design HARNESS調査の要件と一部設計を現行authorityへ取り込む"
created: 2026-07-29
updated: 2026-07-29
owner: Codex / TL
engineering_discipline_required: true
behavior_contract_id: VDH-MULTIMODAL-FR-001
responsibility_owner: design-harness-multimodal-authority
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: retained
no_code_decision: add_code
ddd_modeling_decision: aggregate
contract_preconditions: "PLAN-L3-47〜50と既存VDH-FR-001〜019のauthority／責務境界が固定されている"
contract_postconditions: "原文全章と設計atomの降下先、7 modality、5 lifecycle、14 IR責務、8 verification domain、4 Reverse source、promotion／provenance境界がL3/L10へ束縛される"
contract_invariants: "tool/provider/storage/modelをcanonical authorityにせず、#192 admissionと既存VDH runtimeを複製しない"
contract_failures: "generator直canonical、visual-only completion、tool正本化、confidence自動昇格、unknown rights／residency、旧定義再利用をfail-closeする"
tdd_red_required: false
complexity_effect: net_neutral
complexity_justification: "UI中心の既存要件を置換せずmulti-modal上位envelopeへ接続し、tool固有正本と重複promotion実装を防ぐ"
removal_trigger: "既存VDH authorityへ同一意味が統合され本deltaのconsumerが0になった時点"
github_issue_id: 256
parent_design: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — modality、IR、promotion、authority境界を定義"
  - role: qa
    slot_label: "QA — lifecycle polarity、evidence、security、research隔離を検証"
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-29T02:56:22Z"
    reviewed_at: "2026-07-29T02:57:42Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #265 HEAD 41b97262bea3cb48870f19cdea2195b8ac8c4a83をclean detached checkoutでread-only reviewした。原文8 H2見出し、3..620の連続行範囲、13 semantic unit、7 modality、5 lifecycle、14 IR責務、8 verification domain、4 Reverse source、L3/L10 pair、旧authority非混入を照合し、Critical／High 0、blocker 0、approveと判定した。authoring runtimeの3 files／22 tests green後に同一HEAD／clean tree／test countを再確認した。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/265#issuecomment-5112276487"
    green_commands:
      - kind: unit_test
        command: "npx --no-install vitest run --project fast tests/l3-multimodal-design-harness-authority.test.ts tests/design-language.test.ts tests/l3-progression-authority.test.ts"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-29T02:56:22Z"
        evidence_path: tests/l3-multimodal-design-harness-authority.test.ts
        output_digest: "sha256:00195008b29bf1b004c01507f7617a52109eed8239a24fea2195bb9a5d362926"
generates:
  - artifact_path: docs/plans/PLAN-L3-51-multimodal-design-harness-authority.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/design-catalog.yaml
    artifact_type: design_doc
  - artifact_path: docs/design/helix/L3-requirements/multimodal-design-harness-authority.md
    artifact_type: design_doc
  - artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md
    artifact_type: markdown_doc
  - artifact_path: docs/research/design-harness-deep-research-coverage-2026-07-29.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/helix/multimodal-design-harness-authority-acceptance.md
    artifact_type: test_design
  - artifact_path: src/lint/l3-progression-reviewed-digests.ts
    artifact_type: source_module
  - artifact_path: tests/l3-g3-freeze-packet-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/l3-multimodal-design-harness-authority.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/design/helix/L3-requirements/ai-vision-design-harness-engine.md
  requires:
    - docs/plans/PLAN-L3-47-lifecycle-stage-completion-goals.md
    - docs/plans/PLAN-L3-48-requirement-style-case-authority.md
    - docs/plans/PLAN-L3-49-helix-bench-evaluation.md
    - docs/plans/PLAN-L3-50-technology-stack-authority.md
  references:
    - docs/plans/PLAN-L3-17-ai-vision-design-harness-engine.md
  blocks: []
---

# PLAN-L3-51: multi-modal Design HARNESS正本

## §工程表

### Step 1: source gap classification [直列]

- research inputを既存VDH 19要件、#192、#177、#230と突合する。
- source atomを4 dispositionへexactly-once分類する。
- 全章と設計atom familyのdownstream ownerをrepo-owned coverage ledgerへ固定する。

### Step 2: L3 authority delta [直列]

- 7 modality、5 lifecycle、14 IR責務、exchange、8 verification domainを固定する。
- promotion、Reverse、provenance、security／legal境界を固定する。

### Step 3: L10 polarity oracle [直列]

- tool正本化、直canonical、visual-only、confidence自動昇格、rights／residency違反を拒否する。

### Step 4: independent review [直列]

- authoring runtimeと異なる独立AI-Bがcurrent HEADをread-only検証し、Critical／High／Medium 0と
  full CI greenを同一HEADへ束縛してからconfirm／mergeする。

## §1 受入条件

- AC-1: 原文全章、設計atom family、4 exact set、14 IR責務が機械検証される。
- AC-2: Design HARNESSはstyle／case／layerと別軸である。
- AC-3: external outputはcandidateから開始する。
- AC-4: current evidenceとindependent authorityなしにcanonicalへ昇格しない。
- AC-5: Reverse confidenceをauthorityへしない。
- AC-6: security、license、IP、residency、transmissionをpromotion前に検査する。
- AC-7: tool評価はresearch候補であり採用証拠ではない。
- AC-8: L4以降の設計・実装を混載しない。

## §2 検証コマンド

- `npx vitest run --project fast tests/l3-multimodal-design-harness-authority.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L3-51-multimodal-design-harness-authority.md`
- `npm run typecheck`
