---
plan_id: PLAN-L3-37-atomic-downstream-queue
title: "PLAN-L3-37 (add-design): 原子的開発契約のdownstream queue採番"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 原子的開発5責務をGitHub運用・工程表・DB次タスク抽出へ投影し、L4/L9・L5/L8・L6/L7を別PRでexact採番する"
created: 2026-07-24
updated: 2026-07-24
owner: Codex / TL
github_issue_id: 30
parent_design: docs/plans/PLAN-L3-36-atomic-development-contract.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — 原子的開発5責務のpair依存DAGを採番"
  - role: qa
    slot_label: "QA — 84枠の一意性、既存69枠不変、5責務のexact被覆を検証"
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-23T20:31:49Z"
    tests_green_at: "2026-07-23T20:17:32Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-fable-5
    scope: "PR #113 review HEAD 4e0bba80e51847d363086d53aefa55548c92fa44 の原子的開発5責務15枠exact採番、既存69枠不変、45/27/12=84分母、dependency DAGだけをconfirmする。GitHub Actions run 30038397724 attempt 2、clean detached DB rebuild 2回一致（schemaVersion=39、tables=90、rows=48580、orphanTraceEdges=0）、Claude AI-B read-only review approveを束縛した。これはG1/G3 freeze、pair closure、L6/L7実装、L8〜L12実行証拠の完了ではない。review receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/113#issuecomment-5063114983"
    green_commands:
      - kind: unit_test
        command: "npm test"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-23T20:17:32Z"
        evidence_path: tests/l3-downstream-queue.test.ts
        output_digest: "sha256:8b4f4b79f91c58a55a485eeab529deb584b1f552f6fc65839cb1cf046459beae"
generates:
  - artifact_path: docs/plans/PLAN-L3-37-atomic-downstream-queue.md
    artifact_type: markdown_doc
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/plans/PLAN-L3-36-atomic-development-contract.md
  references:
    - docs/governance/l3-downstream-queue.json
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
    - tests/l3-downstream-queue.test.ts
  blocks: []
---

# PLAN-L3-37: 原子的開発契約のdownstream queue採番

## §0 目的

PLAN-L3-36で定義した5責務を、L4/L9、L5/L8、L6/L7の依存順序を持つ15枠として
既存queueへ追補する。既存69件の`queue_id`を変更せず、末尾へ追加して参照安定性を保つ。

## §工程表

### Step 1: pair closure追補 [直列]

- 5 workstreamへL4/L9とL5/L8を各1枠、`L3Q-PC-036..045`として追加する。
- L5/L8は同じworkstreamのL4/L9だけに依存させる。

### Step 2: L6/L7追補 [直列]

- 5 workstreamへL6/L7を各1枠、`L3Q-IT-023..027`として追加する。
- L6/L7は同じworkstreamのL5/L8だけに依存させる。

### Step 3: 分母再固定 [直列]

- pair closure 45、implementation/TDD 27、refactor 12、合計84を機械検査する。
- 原子的開発5責務が各3 pairをexactly onceで持つことを検査する。

## §1 受入条件

- AC-1: 既存`L3Q-PC-001..035`、`L3Q-IT-001..022`、`L3Q-RF-001..012`を変更しない。
- AC-2: `L3Q-PC-036..045`と`L3Q-IT-023..027`が欠番・重複なく存在する。
- AC-3: 5 workstreamがL4/L9、L5/L8、L6/L7を各1件持ち、依存DAGが上流順である。
- AC-4: pre-execution denominatorが84である。

## §2 非目標

- 本PLANではL4以降のdesign artifactやruntime implementationを作らない。
- G1/G3 freeze、pair freeze、実装完了、L8以降のexecution receiptを主張しない。
- queue予約をcanonical PLAN IDや実行順の承認とみなさない。

## §3 検証コマンド

- `npx vitest run --project fast tests/l3-downstream-queue.test.ts tests/l3-g3-freeze-packet-v2.test.ts`
- `npm run typecheck`
- `npm run helix -- plan lint docs/plans/PLAN-L3-37-atomic-downstream-queue.md`
