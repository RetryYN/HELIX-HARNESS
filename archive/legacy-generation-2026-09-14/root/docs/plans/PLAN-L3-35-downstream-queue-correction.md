---
plan_id: PLAN-L3-35-downstream-queue-correction
title: "PLAN-L3-35 (add-design): residual auditに基づくdownstream queue補正"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 /goal『残存責務を再集計して欠落を閉鎖』に基づく69枠への採番補正"
created: 2026-07-23
updated: 2026-07-24
owner: Codex / TL
github_issue_id: 30
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — 6 workstreamのpair依存DAG追補"
  - role: qa
    slot_label: "QA — 69枠の一意性と残存監査被覆を検証"
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-23T16:48:05Z"
    tests_green_at: "2026-07-23T16:17:41Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-fable-5
    scope: "PR #110 final HEAD f61df975894f54a1ce36cf758b7c232b7f2b9d7a のqueue補正判断（既存51枠を保持し、6 workstreamの18枠を追補して69枠へ固定）だけをconfirmする。GitHub Actions run 30022734228、clean隔離DB rebuild 2回一致（schemaVersion=39、tables=90、rows=48478、orphanTraceEdges=0）を同一HEADへ束縛した。これはG1/G3 freeze、pair closure、実装またはright-arm実行証拠の完了ではない。final receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/110#issuecomment-5061039976"
    green_commands:
      - kind: unit_test
        command: "npm test"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-23T16:17:41Z"
        evidence_path: tests/l3-downstream-queue.test.ts
        output_digest: "sha256:f05be8c1231e556364c84a736ddd0b2bd58ce0cb96ad9cc7762e28e6318a75aa"
generates:
  - artifact_path: docs/plans/PLAN-L3-35-downstream-queue-correction.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-downstream-queue.json
    artifact_type: config
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/plans/PLAN-L3-34-residual-responsibility-recount.md
  references:
    - docs/governance/l3-residual-responsibility-audit.json
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
    - tests/l3-downstream-queue.test.ts
  blocks: []
---

# PLAN-L3-35: downstream queue補正

## §0 目的

PLAN-L3-34が検出した6 workstreamを、L4/L9、L5/L8、L6/L7の依存順序を持つ18枠として
既存queueへ追補する。既存51件の`queue_id`は変更せず、末尾へ追加して参照安定性を保つ。

## §工程表

### Step 1: pair closure追補 [直列]

- UTH acceptanceの5責務群とmodel effort policyへ、L4/L9とL5/L8を各1枠追加する。
- L5/L8は同じworkstreamのL4/L9だけに依存させる。

### Step 2: L6/L7追補 [直列]

- 6 workstreamへL6/L7を各1枠追加し、対応するL5/L8へ依存させる。

### Step 3: 分母再固定 [直列]

- pair closure 35、implementation/TDD 22、refactor 12、合計69を機械検査する。
- residual auditの6 workstreamが各3 pairをexactly onceで持つことを検査する。

## §1 受入条件

- AC-1: 既存`L3Q-PC-001..023`、`L3Q-IT-001..016`、`L3Q-RF-001..012`を変更しない。
- AC-2: `L3Q-PC-024..035`と`L3Q-IT-017..022`が欠番・重複なく存在する。
- AC-3: 6 workstreamがL4/L9、L5/L8、L6/L7を各1件持ち、依存DAGが上流順である。
- AC-4: pre-execution denominatorが69である。

## §2 非目標

- 本PLANではL4以降のdesign artifactやruntime implementationを作らない。
- G1/G3 freeze、pair freeze、実装完了、L8以降のexecution receiptを主張しない。

## §3 検証コマンド

- `npx vitest run --project fast tests/l3-downstream-queue.test.ts tests/l3-residual-responsibility-audit.test.ts`
- `npm run typecheck`
- `npm run helix -- plan lint docs/plans/PLAN-L3-35-downstream-queue-correction.md`
