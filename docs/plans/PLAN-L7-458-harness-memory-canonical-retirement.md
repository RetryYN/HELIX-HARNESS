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
parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
entry_signals:
  - "po_directive: harness memoryを全件追突し、必要内容を要件へ取り込み、対応後はmemoryから消す"
backprop_decision: not_required
backprop_decision_reason: "実装対象は着手前から正本化済みのHR-FR-HYB-005／HR-AC-HYB-005とPLAN-L7-407の退役契約である。本sliceで追加したworker runtime要求5件は実装対象外でL3/L12設計までに留め、PLAN-DISCOVERY-12以降のForward降下へ分離したため、このL7実装からのReverse carryはない。"
left_arm_carry:
  schema_version: left-arm-carry.v1
  decision: no_pushback
  assessed_at: "2026-07-18T19:16:00Z"
  review_binding:
    reviewer: memory_retire_rereview
    reviewed_at: "2026-07-18T19:16:00Z"
    evidence_digest: "sha256:2415a4513c595ad199d7ac119d37194bcf5a9f643f07d5a7eb12186e88802637"
  entries: []
review_evidence:
  - reviewer: memory_retire_rereview
    review_kind: intra_runtime_subagent
    worker_model: codex
    reviewer_model: gpt-5
    reviewed_at: "2026-07-18T19:16:00Z"
    tests_green_at: "2026-07-18T19:12:00Z"
    verdict: pass
    scope: "harness memory 39件の正本化・退役authority・worker runtime 6件の要求追突・Bun/Node cutover境界を独立再監査。Blocker/High 0。Git HEAD/blobとのauthority結合は将来改善のMedium。"
    green_commands:
      - { kind: unit_test, command: "bun test tests/digest.test.ts tests/design-language.test.ts tests/memory/memory-v2.test.ts tests/memory/memory-store.test.ts tests/harness-memory-reconciliation-binding.test.ts tests/semantic-frontier-consistency.test.ts tests/goal-evidence-audit.test.ts", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-18T19:12:00Z", evidence_path: docs/governance/harness-memory-reconciliation-audit-2026-07-19.md, output_digest: "sha256:f4e2bc7486ed9ef6d5fa7115661b3a23295482574ca108ddff2a0e9290511c51" }
      - { kind: typecheck, command: "bun run tsc --noEmit", runner: bun, scope: targeted, exit_code: 0, completed_at: "2026-07-18T19:12:00Z", evidence_path: docs/governance/harness-memory-reconciliation-audit-2026-07-19.md, output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" }
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
  - artifact_path: docs/design/helix/L3-requirements/pillar-functional-requirements.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/helix/L3-pillar-acceptance-test-design.md
    artifact_type: test_design
  - artifact_path: config/digest-canonicalization-inventory.json
    artifact_type: config
  - artifact_path: src/lint/semantic-frontier-consistency.ts
    artifact_type: source_module
  - artifact_path: src/lint/outstanding.ts
    artifact_type: source_module
  - artifact_path: docs/governance/helix-objective-evidence-audit.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/harness-memory-reconciliation-audit-2026-07-19.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/generated/harness-memory-retirement-authority.json
    artifact_type: config
  - artifact_path: docs/research/harness-improvement-from-grok-kimi-oss-2026-07-19.md
    artifact_type: markdown_doc
  - artifact_path: docs/plans/PLAN-DISCOVERY-12-grok-build-worktree-precedent.md
    artifact_type: markdown_doc
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
  - parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
    oracle_id: U-MEMV2-005f
    test_path: tests/memory/memory-v2.test.ts
  - parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
    oracle_id: U-MEMV2-005g
    test_path: tests/memory/memory-v2.test.ts
dependencies:
  parent: docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
  requires:
    - docs/governance/helix-harness-requirements_v1.3.md
    - docs/governance/harness-memory-reconciliation-audit-2026-07-19.md
    - docs/plans/PLAN-REVERSE-458-harness-memory-retirement-contract-recovery.md
  references:
    - docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
    - docs/plans/PLAN-REVERSE-458-harness-memory-retirement-contract-recovery.md
---

# PLAN-L7-458: 正本化済みharness memoryの証跡付き退役

## 目的

harness/projectの長期memoryを要件・ADR・設計・規則・監査へ追突した後、本文をSessionStartから確実に除外する。
手編集による無証跡削除ではなく、layer lock、fencing、冪等terminal receipt、compactionで再実行可能にする。

## 工程

1. root worktreeと安全作業ツリーのactive ID和集合を、後着memoryも含めて全件台帳化する。
2. 各memoryをcanonicalized、backfilled、superseded、historicalへexactly oneで分類し、現行要求を正本へ追突する。
3. harness/project専用`retireMemory`と`helix memory retire`を実装し、tracked authority manifestを必須化してtakeover consumeと権限を分離する。
4. legacy readerをv2 resolverへ統合し、terminal receiptをactiveとして再表示しない。
5. 全件retire後にcompactionし、両worktreeでactive 0、damaged 0を検証する。

## 受入条件

- 分岐間和集合39件が監査台帳に重複・欠落なく存在し、後着したworker runtime改善指示6件を含め、memoryだけに残る現行裁定・要求・gapが0件である。
- 要件追加分にstable IDと受入条件があり、未実装能力を実装済みと主張しない。
- retireはharness/projectだけに適用でき、consumer／layer／全ID／正本targetを束縛するauthorityがなければ追記0で拒否し、同一targetへの再実行は追記0、lost updateはfencingで拒否する。
- legacy/v2両surfaceでactive 0、damaged 0となり、receipt bodyは空である。
- targeted tests、typecheck、Biome、PLAN lint、doctorの本差分関連gateがgreenである。

## 対象外

- memory内容から派生したDesign HARNESS、Authoring Admission、NFR registryのruntime実装。
- release、tag、cutover、配布先切替。
- unrelated Recovery backlogと既存全体テスト基盤のtimeout修復。

本PLANのgreen commandにある`bun`はNode cutover terminal receipt前の現行検証runnerを記録した証跡であり、
新規runtime authorityまたは将来依存ではない。target authorityはADR-009/010のNode＋Pythonで、Bunは廃止対象である。
