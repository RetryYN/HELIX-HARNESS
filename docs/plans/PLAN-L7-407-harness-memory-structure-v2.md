---
plan_id: PLAN-L7-407-harness-memory-structure-v2
title: "PLAN-L7-407 (impl): harness memory structure v2 — schema/provenance/lifecycle/takeover/fenced compaction"
kind: impl
layer: L7
drive: be
status: draft
route_mode: forward
created: 2026-07-11
updated: 2026-07-11
owner: Codex / TL
parent_design: docs/design/harness/L6-function-design/harness-memory-structure.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
entry_signals:
  - "po_directive:2026-07-11 handoverを廃止してharness memoryを強化し、Claude Code/Codex両対応へ進める"
backprop_decision: not_required
backprop_decision_reason: "confirmed L6 contractの実装降下。上位要求の意味追加は行わない。"
agent_slots:
  - role: se
    slot_label: "SE — v1 adapter、v2 event store、fenced layer lock、takeover lifecycle実装"
  - role: qa
    slot_label: "QA — MEMV2-S1a..S8bのRed/Green oracleとcrash/race fixture"
  - role: tl
    slot_label: "TL — legacy API、compaction不変、情報無損失、secret境界レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/memory/memory-types.ts
    artifact_type: source_module
  - artifact_path: src/memory/memory-store.ts
    artifact_type: source_module
  - artifact_path: src/memory/index.ts
    artifact_type: source_module
  - artifact_path: src/memory/memory-compaction.ts
    artifact_type: source_module
  - artifact_path: tests/memory/memory-v2.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-62-harness-memory-structure.md
  requires:
    - docs/plans/PLAN-L6-56-harness-memory-compaction.md
    - docs/design/harness/L6-function-design/harness-memory-structure.md
  references:
    - docs/test-design/harness/L7-unit-test-design.md
    - docs/design/harness/L6-function-design/harness-memory-compaction.md
---

# PLAN-L7-407: harness memory structure v2 実装

## §0 目的

confirmed L6 memory v2 contractをTypeScript/Bunへ降下し、handover file廃止前に短寿命takeover、
provenance/lifecycle、決定論surface、情報無損失のfenced compactionを利用可能にする。

## §1 工程表

1. [直列] L8 unit test-designへMEMV2-S1a..S8bを`U-MEMV2-*`として宣言し、Red fixtureを追加する。
2. [直列] v1 normalizer、schema validator、legacy API adapterを実装する。
3. [直列] v2 JSONL event store、cross-process layer lock、fencing token付きappend/replaceを実装する。
4. [直列] takeover write/expire/deliver/consumeと決定論surface budgetを実装する。
5. [直列] `compactMemoryV2`をtemp→fsync→fenced atomic replaceで実装し、旧`compactMemory`を不変に保つ。
6. [直列] targeted/full tests、typecheck、lint、doctor、別runtimeレビューで閉じる。

## §2 受入条件

- MEMV2-S1a..S8bの14 subcaseが実test citation付きでgreen。
- v1 JSONL、旧API signature/返値、12件/240文字既定、U-MEMC-001..004が退行しない。
- stdout失敗、append失敗、session event失敗、lock timeout、lease回収後stale holderをfixtureで再現する。
- concurrent write/consume/compactionでentry消失とterminal tombstone重複がない。
- secret/PII-like metadata、未知enum、矛盾lifecycle、不正linkをfail-closeする。
- `bun run typecheck`、targeted Vitest、Biome、doctor、PLAN lintがgreen。

## §3 対象外

- feedback lifecycle（PLAN-L6-63）。
- Codex/Claude runtime注入（PLAN-L6-64とそのL7 descent）。
- handover CLI/CURRENT.json撤去（PLAN-L6-61、受け皿実装後）。
- PLAN-M-02 identifier cutover、外部infra/auth/secret apply。
