---
plan_id: PLAN-L5-84-impact-ci-recovery
title: "PLAN-L5-84 (add-design): Impact CI Recovery詳細設計"
kind: add-design
layer: L5
drive: agent
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-08-01 L3Q-PC-039をPLAN-L4-58確定後のL5/L8へ降下する"
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
ddd_modeling_decision: value_object
contract_preconditions: "L3Q-PC-038のL4/L9 pairがconfirmedかつmainへmerge済み"
contract_postconditions: "verification inventory、impact selector、profile receipt、post-merge回収、性能集計の実装可能な型・順序・failureとL8 mutationが一意になる"
contract_invariants: "selected/deferredはinventory exact partitionで、unknown/high-riskはfullへfail-closeし、性能超過だけでcorrectness greenをredにしない"
contract_failures: "inventory不正、stale snapshot、unknown縮退、partition不一致、別HEAD receipt、回収欠落、二重terminalを拒否する"
tdd_red_required: false
complexity_effect: net_negative
complexity_justification: "既存gateとrelation graphを単一selectorへ再利用し、PRごとの無条件full実行と重複選択ロジックを削減する"
removal_trigger: "旧harness-check単一経路のconsumer=0、post-merge回収欠落0が30日継続し、rollback演習がgreenになった時点"
pair_artifact: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md
agent_slots:
  - { role: se, slot_label: "SE — inventory/value object/selector詳細" }
  - { role: qa, slot_label: "QA — partition/stale/recovery mutation" }
  - { role: tl, slot_label: "TL — 既存owner再利用とL6 carry境界" }
generates:
  - { artifact_path: docs/plans/PLAN-L5-84-impact-ci-recovery.md, artifact_type: markdown_doc }
  - { artifact_path: docs/design/helix/L5-detail/impact-ci-recovery.md, artifact_type: design_doc }
  - { artifact_path: docs/test-design/helix/L8-impact-ci-recovery-unit-test-design.md, artifact_type: test_design }
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
  blocks:
    - queue:L3Q-IT-024
    - issue:93
---

# PLAN-L5-84: Impact CI Recovery詳細設計

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
- AC-5: 12件のL8 oracleが正負/mutationを持ち、runtime実行済みを過大主張しない。

## 検証

- `npx --no-install vitest run --project fast tests/impact-ci-recovery-detail-design.test.ts`
- `npm run helix -- plan lint docs/plans/PLAN-L5-84-impact-ci-recovery.md`
