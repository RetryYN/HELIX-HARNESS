---
plan_id: PLAN-L3-33-downstream-queue-numbering
title: "PLAN-L3-33 (add-design): G3後downstream queueのexact採番"
kind: add-design
layer: L3
drive: agent
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-23 PLAN-L3-20 G3 packet review-ready前提としてdownstream queueをexactly-onceで採番"
created: 2026-07-23
updated: 2026-07-23
owner: Codex / TL
github_issue_id: 30
parent_design: docs/governance/l3-rebaseline-g3-freeze-packet.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: tl
    slot_label: "TL — pair・implementation/TDD・refactorのqueue境界を採番"
  - role: qa
    slot_label: "QA — 初期51 slotの一意性、分母、依存DAGを検証"
review_evidence:
  - reviewer: "Claude Code / claude-fable-5"
    review_kind: cross_agent
    reviewed_at: "2026-07-23T13:06:15Z"
    tests_green_at: "2026-07-23T13:05:35Z"
    verdict: approve
    worker_model: codex-gpt-5.6
    reviewer_model: claude-fable-5
    scope: "PR #108 final HEAD b19f228d1378b5431ac781f8b21a364aeaed8949 のdownstream queue 51 slot（pair closure 23 / implementation-TDD 16 / refactor 12）の一意採番と依存DAGだけをconfirmする。GitHub Actions run 30008094308、clean隔離DB rebuild 2回一致（tables=90、rows=48421、stale=0、orphan=0）を同一HEADへ束縛した。これはG1/G3 freeze、各slotのcanonical PLAN生成、pair closure、実装またはright-arm実行証拠の完了ではない。final receipt: https://github.com/RetryYN/HELIX-HARNESS/pull/108#issuecomment-5058729248"
    green_commands:
      - kind: unit_test
        command: "npm test"
        runner: ci
        scope: full
        exit_code: 0
        completed_at: "2026-07-23T13:05:35Z"
        evidence_path: tests/l3-downstream-queue.test.ts
        output_digest: "sha256:87a39dbc85e43b54d04d5243961e11df9767fa7dbd2cd311bc56604e243ed740"
generates:
  - artifact_path: docs/plans/PLAN-L3-33-downstream-queue-numbering.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/l3-downstream-queue.json
    artifact_type: config
  - artifact_path: tests/l3-downstream-queue.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L3-20-infinity-loop-g3-freeze.md
  requires:
    - docs/plans/PLAN-L3-28-feedback-test-owner-closure-disposition.md
    - docs/plans/PLAN-L3-29-feedback-test-owner-recognition-disposition.md
    - docs/plans/PLAN-L3-30-feedback-test-owner-direct-disposition.md
    - docs/plans/PLAN-L3-31-feedback-test-owner-residual-disposition.md
    - docs/plans/PLAN-L3-32-feedback-refactor-disposition.md
  references:
    - docs/governance/l3-rebaseline-g3-freeze-packet.md
    - docs/governance/feedback-refactor-disposition.json
  blocks: []
---

# PLAN-L3-33: G3後downstream queueのexact採番

## §0 目的

G3 packetが当時集計した既知最小51小PRを、単なる件数ではなく不変の`queue_id`へexactly-onceで束縛する。
`queue_id`は作業予約IDであり、G3後に正規generatorが発行するcanonical PLAN IDを先取りしない。
後続のPLAN-L3-34監査で18枠の欠落を検出したため、現行分母と追加採番の正本は
`PLAN-L3-35-downstream-queue-correction`および`l3-downstream-queue.json`の69枠とする。

## §工程表

### Step 1: pair closure採番 [直列]

- GitHub 5責務10 slot、L3-28〜30由来6 slot、L3-31由来7 slotを`L3Q-PC-001..023`へ固定する。
- 新規L4/L9を必要とする責務は、対応するL5/L8 slotの明示dependencyにする。

### Step 2: L6/L7採番 [直列]

- 16 workstreamを`L3Q-IT-001..016`へ固定し、各slotを対応する最終pair closureへ接続する。
- この採番は実装・TDD完了を意味せず、pair closure完了前のactivationを許可しない。

### Step 3: refactor採番 [並列]

- familyとsource pathの組12件を`L3Q-RF-001..012`へ固定する。
- 同一`src/cli.ts`でもliteral/policyとCLI decompositionを別slotに保つ。

## §完了境界

本PLANが閉じるのは初期51 slotの一意な予約、phase分母、依存DAG、source-path partitionの固定までである。
現行69枠への補正はPLAN-L3-35が担う。
canonical PLAN IDの生成、各PR作成、pair freeze、L6/L7実装、L8〜L12実行証拠、G1/G3承認は含まない。

## §受入条件

- AC-1: queue IDが51件すべて一意で、連番欠落がない。
- AC-2: phase分母がpair closure 23、implementation/TDD 16、refactor 12である。
- AC-3: implementation/TDD 16件が対応するpair closureへexactly-one依存する。
- AC-4: L4/L9先行責務のL5/L8 slotが同一workstreamのL4/L9 slotへ依存する。
- AC-5: refactor 12件が6+1+5のfamily/source-path partitionと一致する。
- AC-6: queue IDとcanonical PLAN IDを混同せず、G3承認やdownstream完了を主張しない。
