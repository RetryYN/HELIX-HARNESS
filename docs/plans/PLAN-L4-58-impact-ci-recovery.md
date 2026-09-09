---
plan_id: PLAN-L4-58-impact-ci-recovery
title: "PLAN-L4-58 (add-design): Impact CI Recovery基本設計"
kind: add-design
layer: L4
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 CI高速化を全体進行速度へ効くP1としてL3Q-PC-038から開始"
created: 2026-08-01
updated: 2026-08-01
owner: Codex / TL
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: no_change
ddd_modeling_decision: domain_service
contract_preconditions: "GH-NFR-009..011、GH-AC-017..018、L3Q-PC-038がfreeze済み"
contract_postconditions: "impact selector、3段profile、検査inventory、terminal receipt、Performance RecoveryのcomponentとL9 oracleが一意になる"
contract_invariants: "検査省略・閾値緩和・GitHub Actionsへの先送りを高速化と数えず、PR省略集合をmain後/nightlyでexact回収する"
contract_failures: "unknown impact、高risk、selector drift、inventory欠落、別HEAD receipt、二重計上、回収欠落をfail-closeする"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "PRごとの無条件full実行と重複gateを単一inventory＋deterministic selectorへ集約する"
removal_trigger: "旧harness-check単一jobがconsumer=0となり、post-merge/nightly回収receiptが30日連続で欠落0になった時点"
pair_artifact: docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — selector/profile/inventory component境界" }
  - { role: qa, slot_label: "QA — unknown/high-risk/回収欠落のL9反例" }
  - { role: tl, slot_label: "TL — correctness非縮退と既存gate再利用" }
generates:
  - { artifact_path: docs/plans/PLAN-L4-58-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L4-basic-design/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md, artifact_type: test_design }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/impact-ci-recovery-design.test.ts, artifact_type: test_code }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
review_evidence:
  - reviewer: "Kimi Code / K3 (Codex-invoked review substitute)"
    review_kind: intra_runtime_subagent
    tests_green_at: "2026-08-01T12:10:00Z"
    reviewed_at: "2026-08-01T12:11:04Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: kimi-k3
    scope: "PR #330 HEAD e43457186b07a8f0c2757661cb4807280f5dd897をread-only再review。初回HEAD 349e1878の主要4成果物、catalog digest、参照、L3Q-PC-038、PR #327 run実測のapproveを基線に、CI検出後の日本語見出し化とexternal_worker分類是正だけを照合し、Critical/High/Medium 0、contract blocker 0でapprove。session: session_f8d0575d-c577-40cc-a98d-ea09b696ca50"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/impact-ci-recovery-design.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T12:10:00Z", evidence_path: tests/impact-ci-recovery-design.test.ts, output_digest: "sha256:435f304ece8cf9ad0ffcf3bc624df8b8008df1146214a88b5b50aefaaaba8d2f" }
dependencies:
  parent: docs/plans/PLAN-L3-22-github-ci-performance-recovery.md
  requires:
    - docs/design/helix/L3-requirements/github-ci-performance-requirements.md
    - docs/design/helix/L3-requirements/github-atomic-development-requirements.md
    - docs/governance/l3-downstream-queue.json
  references:
    - .github/workflows/harness-check.yml
    - docs/design/harness/L6-function-design/development-ci-bounded-time.md
  blocks:
    - queue:L3Q-PC-039
    - issue:93
---

# PLAN-L4-58: Impact CI Recovery基本設計

## 工程表

### Step 1: 現行inventoryと実測境界 [直列]

- required workflow、local profile、gate owner、post-merge/nightly surfaceをexact inventory化する。
- PR #327 run `30695492415`の約21分をcurrent full-admission実測として保持する。

### Step 2: L4 componentとstate [直列]

- impact resolution、profile planning、inventory selection、receipt recording、Recovery classificationを分離する。
- PR preflight、candidate admission、post-merge recovery、nightly complementの状態遷移を固定する。

### Step 3: L9 negative oracle [直列]

- unknown/high-risk縮退、別HEAD、inventory欠落、二重計上、main後/nightly回収欠落を拒否する。
- correctness greenとperformance超過を別判定として検証する。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-Bが検査非縮退、fail-close、既存owner再利用をread-only検証する。

## 受入条件

- AC-1: `L3Q-PC-038`だけを閉じ、L5/L8 selector詳細とL6/L7 workflow実装を先取りしない。
- AC-2: PRで省略したitemがpost-mergeの最初のterminal receiptへexactly once接続される。
- AC-3: unknown/high-risk変更はfull candidate admissionへfail-closeする。
- AC-4: performance超過だけではcorrectnessを偽redにせず、完全なRecovery packetを要求する。
- AC-5: targeted test、PLAN lint、typecheck、独立AI-B reviewがcurrent HEADでgreenである。

## 検証

- `npx --no-install vitest run --project fast tests/impact-ci-recovery-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L4-58-impact-ci-recovery.md`
