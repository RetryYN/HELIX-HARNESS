---
plan_id: PLAN-L7-458-harness-memory-canonical-retirement
title: "PLAN-L7-458 (add-impl): 正本化済みharness memoryの証跡付き退役"
kind: add-impl
layer: L7
drive: be
status: confirmed
route_mode: add-feature
created: 2026-07-19
updated: 2026-07-19
owner: Codex / TL
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-18T18:20:05Z"
  review_binding:
    reviewer: codex_tl_standalone
    reviewed_at: "2026-07-18T18:20:05Z"
    evidence_digest: "sha256:0e0acac14e8b62a8f3d44da15768c3b2c6695c99281572c2df391baec047839f"
  entries: []
parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
entry_signals:
  - "po_directive: harness memoryを全件追突し、必要内容を要件へ取り込み、対応後はmemoryから消す"
backprop_decision: not_required
backprop_decision_reason: "長期harness/project memoryの退役契約は本sliceで要件とL6設計へ同時backfill済みであり、追加のReverse carryは残らない。"
agent_slots:
  - role: se
    slot_label: "SE — fenced retire API、CLI、legacy adapter統合"
  - role: qa
    slot_label: "QA — 冪等receipt、active再表示防止、全件照合oracle"
generates:
  - artifact_path: docs/plans/PLAN-L7-458-harness-memory-canonical-retirement.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/harness-memory-structure.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: docs/governance/harness-memory-reconciliation-audit-2026-07-19.md
    artifact_type: audit_evidence
  - artifact_path: src/memory/memory-v2.ts
    artifact_type: source_module
  - artifact_path: src/memory/memory-store.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
    artifact_type: source_module
  - artifact_path: tests/memory/memory-v2.test.ts
    artifact_type: test_code
  - artifact_path: tests/memory/memory-store.test.ts
    artifact_type: test_code
  - artifact_path: tests/harness-memory-reconciliation-binding.test.ts
    artifact_type: test_code
verification_bindings:
  - parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
    oracle_id: U-MEMV2-005c
    test_path: tests/memory/memory-v2.test.ts
  - parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
    oracle_id: U-MEMV2-005d
    test_path: tests/memory/memory-store.test.ts
  - parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
    oracle_id: U-MEMV2-005e
    test_path: tests/harness-memory-reconciliation-binding.test.ts
dependencies:
  parent: docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/governance/harness-memory-reconciliation-audit-2026-07-19.md
  references:
    - docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
review_evidence:
  - reviewer: codex_tl_standalone
    review_kind: intra_runtime_self_review
    worker_model: codex
    reviewer_model: codex
    reviewed_at: "2026-07-18T18:20:05Z"
    tests_green_at: "2026-07-18T18:19:30Z"
    verdict: pass
    scope: "memory 38件の分母、要件追突、retire権限分離、legacy再表示、receipt body、Bun廃止方針との整合をseverity-firstで自己監査。Blocker/High 0。"
    green_commands:
      - { kind: unit_test, command: "bun test tests/digest.test.ts tests/design-language.test.ts tests/memory/memory-v2.test.ts tests/memory/memory-store.test.ts tests/harness-memory-reconciliation-binding.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-19T03:19:30+09:00", evidence_path: docs/governance/harness-memory-reconciliation-audit-2026-07-19.md, output_digest: "sha256:5e92cf14c99e1afd68e85a199df1dbeee7ca490aacc72bdcc0efc019f9811c09" }
      - { kind: typecheck, command: "bun run typecheck", runner: bun, scope: full, exit_code: 0, completed_at: "2026-07-19T03:19:30+09:00", evidence_path: tsconfig.json, output_digest: "sha256:2a492cc4599b27e801dc1227fb948243f1efa93868c7b3de64304762682b3258" }
---

# PLAN-L7-458: 正本化済みharness memoryの証跡付き退役

## 目的

harness/projectの長期memoryを要件・ADR・設計・規則・監査へ追突した後、本文をSessionStartから確実に除外する。
手編集による無証跡削除ではなく、layer lock、fencing、冪等terminal receipt、compactionで再実行可能にする。

## 工程

1. root worktreeと安全作業ツリーのactive ID和集合を全件台帳化する。
2. 各memoryをcanonicalized、backfilled、superseded、historicalへexactly oneで分類し、現行要求を正本へ追突する。
3. harness/project専用`retireMemory`と`helix memory retire`を実装し、takeover consumeと権限を分離する。
4. legacy readerをv2 resolverへ統合し、terminal receiptをactiveとして再表示しない。
5. 全件retire後にcompactionし、両worktreeでactive 0、damaged 0を検証する。

## 受入条件

- 分岐間和集合38件が監査台帳に重複・欠落なく存在し、memoryだけに残る現行裁定・要求・gapが0件である。
- 要件追加分にstable IDと受入条件があり、未実装能力を実装済みと主張しない。
- retireはharness/projectだけに適用でき、同一targetへの再実行は追記0、lost updateはfencingで拒否する。
- legacy/v2両surfaceでactive 0、damaged 0となり、receipt bodyは空である。
- targeted tests、typecheck、Biome、PLAN lint、doctorの本差分関連gateがgreenである。

## 対象外

- memory内容から派生したDesign HARNESS、Authoring Admission、NFR registryのruntime実装。
- release、tag、cutover、配布先切替。
- unrelated Recovery backlogと既存全体テスト基盤のtimeout修復。

本PLANのgreen commandにある`bun`はNode cutover terminal receipt前の現行検証runnerを記録した証跡であり、
新規runtime authorityまたは将来依存ではない。target authorityはADR-009/010のNode＋Pythonで、Bunは廃止対象である。
