---
plan_id: PLAN-L4-57-development-model-verification-projection
title: "PLAN-L4-57 (add-design): review／verification／completionをcurrent modelへ再束縛"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 Issue #246のreview／verification／completion oracleを新authorityへ再束縛する"
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
github_issue_id: 246
engineering_discipline_required: true
behavior_contract_id: AUTH-SURFACE-VERIFY-001
responsibility_owner: development-model-verification-projection
change_slice: atomic
refactor_step: dual_green
legacy_retirement_state: dual_green
no_code_decision: modify
ddd_modeling_decision: value_object
contract_preconditions: "PLAN-L4-56でstyle／case／specialistの設計projectionが別軸へ固定されている"
contract_postconditions: "current review／test-design／completionが3 style、case別軸、specialist別軸とL1-L12 right armだけを判定する"
contract_invariants: "historical evidenceを改変せず、legacy-only greenでcurrent failureを相殺せず、runtime routing実装を変更しない"
contract_failures: "旧routeのcurrent期待、PoCのScrum内包、旧layer completion、active Bun verification commandをfail-closeする"
tdd_red_required: true
red_at: "2026-07-31T20:34:52Z"
green_at: "2026-08-01T00:09:24Z"
mutation_oracle_evidence: "tests/development-model-verification-projection.test.tsのU-AUTH-VERIFY-001〜004がstyle欠落、PoCのScrum内包、変更owner test-design内の6 right-arm pair欠落、旧7 pair、active Bun command、legacy route outputのseeded記述を拒否し、U-AUTH-VERIFY-005のconfirmed poc fixtureが既存Reverse合流欠落をbehaviorとしてredにする。AI-B reviewで旧pair／compatibility混入と自己参照oracleを検出し、current HEADのtargeted greenで欠陥をkillした"
complexity_effect: net_negative
complexity_justification: "current canonical 7箇所へ散在する旧判定を単一verification projection oracleへ集約する"
removal_trigger: "compatibility consumer 0を証明し旧判定語彙を完全削除できた時点"
pair_artifact: docs/test-design/helix/L4-pillar-system-test-design.md
agent_slots:
  - { role: qa, slot_label: "QA — exact style／case polarityとright-arm pairを検証" }
  - { role: tl, slot_label: "TL — compatibility入力とcurrent completionを分離" }
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T20:34:52Z"
    reviewed_at: "2026-07-31T20:34:52Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #324 HEAD efc27ef2a00926137034361c0684295aebb359bdをClaude AI-Bがread-only content reviewした。H1=L7/L8物理gate境界、H2=L2↔L11欠落、H3=PR本文構文によるCI早期失敗、M1=draft digest、M2〜M4=oracle強度、M5=historical引用改変をblockerとして返却した。修正後の新HEADで再reviewとfull CIを要求する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/324#issuecomment-5147217988"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T20:49:51Z"
    reviewed_at: "2026-07-31T20:49:51Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #324 HEAD 067ea1b8dbfbf0581bcc0e29cb54d90d4b6be53cをClaude AI-Bがread-only再reviewした。前回H1/H2/M2〜M5解消を確認し、PLANがcompatibility read-only 4 pathをgeneratesへ再利用したcanonical_reuse_blocked_referenceだけをHigh blockerとして返却した。該当4 pathを変更・PLAN edge・reviewed-safe登録から除外し、current canonical 11 pathへscopeを縮小して解消する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/324#issuecomment-5147339214"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T21:01:51Z"
    reviewed_at: "2026-07-31T21:06:15Z"
    verdict: approve_after_fixes
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #324 HEAD cead04abf0147b3dccd106afaea2c4555b9e86b7をClaude AI-Bがread-only再reviewした。canonical_reuse_blocked_reference解消、11-path exact scope、oracle強度維持を確認し、PLAN confirmed化、digest同期、current PR manifestを次pushのCI eventへ反映する条件でapprove_after_fixesとした。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/324#issuecomment-5147459498"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/development-model-verification-projection.test.ts tests/l12-hybrid-recognition.test.ts tests/ai-vision-design-harness-requirements-binding.test.ts tests/scrum-reverse.test.ts tests/ddd-tdd-rules.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-07-31T21:01:51Z", evidence_path: tests/development-model-verification-projection.test.ts, output_digest: "sha256:557af3e9e277b46cc3664b1bead856448f049d986f8b8d46956b218d0cbe607e", result: "65/65 pass" }
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-07-31T23:58:24Z"
    reviewed_at: "2026-08-01T00:07:00Z"
    verdict: fail
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #324 HEAD 1e61660a6f87ce1269cd1444032a7c857dee98d1をClaude AI-Bがread-only収束reviewした。内容上はL4 test-designの6-pair列挙がrecognition conflictへ非対称に残るM-1を返し、CIは意図的cancelのため未実行と判定した。M-1をreviewed-safeへdigest束縛し、文書日付を同期した次HEADでtargeted testと再reviewを要求する。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/324#issuecomment-5148484651"
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    tests_green_at: "2026-08-01T00:09:24Z"
    reviewed_at: "2026-08-01T00:15:36Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    scope: "PR #324 HEAD 4f2b2f8ed5c843a7efbd77d5f21f8590ba8025b3をClaude AI-Bがread-only収束reviewした。M-1のrecognition conflict非対称とL-2の日付不整合が解消され、digest／count／fail-close／oracle実在性を静的再検算し、correctness／security／data-loss blocker 0でapproveした。receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/324#issuecomment-5148527115"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/development-model-verification-projection.test.ts tests/l12-hybrid-recognition.test.ts tests/scrum-reverse.test.ts tests/ddd-tdd-rules.test.ts tests/ci-governance-self-heal.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T00:09:24Z", evidence_path: tests/development-model-verification-projection.test.ts, output_digest: "sha256:2bf823f31f5558fede27cf4cd233e8a62f0f8e8196aab4cb43b520f1a29ce123", result: "66/66 pass" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-57-development-model-verification-projection.md, artifact_type: markdown_doc }
  - { artifact_path: tests/development-model-verification-projection.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l12-hybrid-recognition.test.ts, artifact_type: test_code }
  - { artifact_path: src/lint/l12-hybrid-reviewed-safe-v2.ts, artifact_type: source_module }
  - { artifact_path: docs/test-design/helix/hybrid-rebaseline-v0.5.0-intake-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/hybrid-rebaseline-v0.5.0-collision-acceptance.md, artifact_type: test_design }
  - { artifact_path: docs/test-design/helix/L4-pillar-system-test-design.md, artifact_type: test_design }
dependencies:
  parent: docs/design/helix/L3-requirements/l12-scrum-rebaseline-requirements.md
  requires:
    - docs/plans/PLAN-L4-56-development-model-design-projection.md
    - docs/plans/PLAN-L3-44-authoring-style-case-authority.md
  references:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/governance/l12-canonical-vmodel-direction-directive_v0.1.md
  blocks:
    - issue:248
---

# PLAN-L4-57: development model verification projection（開発モデル検証projection）

## 目的

current review、test-design、completion oracleを、3 development style、別軸case-driven model、
別軸specialist process、L1〜L12 right armへ再束縛する。旧route／layerはcompatibility inputとして
認識できてもcurrent passの根拠には使わない。

## 工程表

### Step 1: exact inventory [直列]

- Issue #246のexact inventoryと本PLAN、単一owner oracleだけを変更対象にする。
- runtime routing／schemaはIssue #248、skill commandはIssue #253へ残す。

### Step 2: Red oracle [直列]

- style exact 3、PoC非Scrum、specialist非styleのpolarityを固定する。
- L1↔L12、L2↔L11、L3↔L10、L4↔L9、L5↔L8、L6↔L7の6 right-arm pairだけをcurrent判定にする。
- current verification commandのactive Bunを拒否する。

### Step 3: current projection [直列]

- legacy route／layerの成功をcurrent completionへ加算しない。
- case resultの採用後は選択済みproduction styleへ接続し、Reverseは必要時のspecialist reentryとする。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-Bがcurrent HEADをread-only検証し、full CI／DB convergenceと同一HEADへ束縛する。

## 受入条件

- AC-1: development style exact setが3件であり、Discovery／PoCを含まない。
- AC-2: case-driven modelとspecialist processをstyle判定から独立させる。
- AC-3: current pairはL1〜L12の6 right-arm pairだけを使う。
- AC-4: legacy identifier／old layer greenでcurrent failureを相殺しない。
- AC-5: 変更対象test-design内のcurrent verification commandにBunが0件である。
- AC-6: historical audit、runtime schema、skill surfaceを変更しない。

## 検証

- `npx --no-install vitest run --project fast tests/development-model-verification-projection.test.ts`
- `npx --no-install vitest run --project fast tests/vmodel-pair.test.ts tests/ai-vision-design-harness-requirements-binding.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L4-57-development-model-verification-projection.md`
- `npm run typecheck`
