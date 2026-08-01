---
plan_id: PLAN-L5-84-impact-ci-recovery
title: "PLAN-L5-84 (add-design): Impact CI Recovery詳細設計"
kind: add-design
layer: L5
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 L3Q-PC-039をPLAN-L4-58確定後のL5/L8へ降下する"
created: 2026-08-01
updated: 2026-08-02
owner: Codex / TL
review_evidence:
  - reviewer: "Claude Code / claude-opus-5"
    review_kind: cross_agent
    worker_model: codex-gpt-5.6
    reviewer_model: claude-opus-5
    reviewed_at: "2026-08-01T13:08:05Z"
    tests_green_at: "2026-08-01T13:05:18Z"
    verdict: pass
    scope: "PR #331 HEAD 09bcc935859fb256876c5a7545eb6dc1d85e8c7bをcontent-only read-only再review。前回M-1とL-1/L-2の閉鎖、executionSurface別receipt、TS7 cutover境界を確認し、Critical/High 0、Medium 2はいずれも非blocker。M-2集計key、M-3 pair oracle、Lowの検査先送り文言は同scopeの確定commitで局所是正し、final exact-HEAD reviewを別途要求する。session: 3b6eece7-e8bf-4146-90a2-502c84772530"
    green_commands:
      - { kind: unit_test, command: "npx --no-install vitest run --project fast tests/impact-ci-recovery-detail-design.test.ts tests/impact-ci-recovery-design.test.ts tests/design-coverage.test.ts tests/l3-progression-authority.test.ts tests/design-language.test.ts", runner: node, scope: targeted, exit_code: 0, completed_at: "2026-08-01T13:05:18Z", evidence_path: tests/impact-ci-recovery-detail-design.test.ts, output_digest: "sha256:e2ecc0657f9ad5569130dffbbde10703d17b42912a15db61d9d08389cc4eb417", result: "5 files / 41 tests pass; PLAN lint and typecheck pass" }
github_issue_id: 93
engineering_discipline_required: true
behavior_contract_id: GH-AC-017
responsibility_owner: impact-ci-recovery
change_slice: atomic
refactor_step: introduce_contract
legacy_retirement_state: dual_green
no_code_decision: no_change
ddd_modeling_decision: value_object
contract_preconditions: "L3Q-PC-038のL4/L9 pairがconfirmedかつmainへmerge済み"
contract_postconditions: "verification inventory、impact selector、profile receipt、post-merge回収、性能集計の実装可能な型・順序・failureとL8 mutationが一意になる"
contract_invariants: "selected/deferredはinventory exact partitionで、unknown/high-riskはfullへfail-closeし、性能超過だけでcorrectness greenをredにしない"
contract_failures: "inventory不正、stale snapshot、unknown縮退、partition不一致、別HEAD receipt、回収欠落、二重terminalを拒否する"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存gateとrelation graphを単一selectorへ再利用し、PRごとの無条件full実行と重複選択ロジックを削減する"
removal_trigger: "旧harness-check単一経路のconsumer=0、post-merge回収欠落0が30日継続し、rollback演習がgreenになった時点"
pair_artifact: docs/test-design/helix/L5-impact-ci-recovery-integration-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — inventory/value object/selector詳細" }
  - { role: qa, slot_label: "QA — partition/stale/recovery mutation" }
  - { role: tl, slot_label: "TL — 既存owner再利用とL6 carry境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-84-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L5-impact-ci-recovery-integration-test-design.md, artifact_type: test_design }
  - { artifact_path: tests/impact-ci-recovery-detail-design.test.ts, artifact_type: test_code }
  - { artifact_path: docs/design/design-catalog.yaml, artifact_type: design_doc }
  - { artifact_path: docs/governance/l3-rebaseline-g3-freeze-packet.md, artifact_type: markdown_doc }
  - { artifact_path: src/lint/l3-progression-reviewed-digests.ts, artifact_type: source_module }
  - { artifact_path: tests/l3-g3-freeze-packet-v2.test.ts, artifact_type: test_code }
dependencies:
  parent: docs/plans/PLAN-L4-58-impact-ci-recovery.md
  requires:
    - docs/design/helix/L4-basic-design/impact-ci-recovery.md
    - docs/test-design/helix/L9-impact-ci-recovery-system-test-design.md
    - docs/governance/l3-downstream-queue.json
  references:
    - src/lint/relation-graph.ts
    - .github/workflows/harness-check.yml
    - docs/design/helix/L3-requirements/technology-stack-authority.md
  blocks:
    - queue:L3Q-IT-024
    - issue:93
---

# PLAN-L5-84: Impact CI Recovery詳細設計

## 訂正記録

- 2026-08-02: confirm後のL6/L7降下で、L5とL6が同じL8単体テスト設計をpairとして所有する
  一意性衝突が判明した。L5のpairを
  `docs/test-design/helix/L5-impact-ci-recovery-integration-test-design.md`へ訂正し、L5 selector契約の
  結合oracle 6件を分離した。旧pair
  `docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md`はL6/L7の単体oracle 13件だけを所有する。
  この訂正は機能scopeを増やさず、confirm済み主張のsilent overwriteを避けるための双方向記録である。

## 工程表

### Step 1: existing owner inventory [直列]

- relation graph、PLAN metadata、Vitest project、governance gate、DB、doctorをread-only inventory化する。
- component別file、新runner、新DB tableを作らない最小実装境界を固定する。

### Step 2: L5 selector／receipt contract [直列]

- canonical型、選択順序、risk precedence、exact partition、stale判定、terminal条件を固定する。
- performance receiptをcorrectness receiptと分離する。

### Step 3: L8 mutation oracle [直列]

- inventory縮退、unknown縮退、companion欠落、別HEAD、回収欠落、二重terminalをkillする。
- L6/L7 runtime test citationを先取りしない。

### Step 4: independent review [直列]

- authoring runtimeと異なるAI-BがL4/L9 descent、実装可能性、非縮退、過剰抽象化をread-only検証する。

## 受入条件

- AC-1: `L3Q-PC-039`だけを閉じ、L6/L7実装、workflow、cache、parallel workerを追加しない。
- AC-2: inventory、selector、receiptの型とアルゴリズムが入力・順序・failureまで一意である。
- AC-3: selected/deferredがinventory exact partitionでunknown/high-riskはfullになる。
- AC-4: post-mergeがdeferred exact setをexactly once回収し、nightlyで履歴を消さない。
- AC-5: 13件のL8 oracleが正負/mutationを持ち、runtime実行済みを過大主張しない。

## 検証

- `npx --no-install vitest run --project fast tests/impact-ci-recovery-detail-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L5-84-impact-ci-recovery.md`
