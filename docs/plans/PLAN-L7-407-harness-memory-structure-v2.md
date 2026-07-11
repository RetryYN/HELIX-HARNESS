---
plan_id: PLAN-L7-407-harness-memory-structure-v2
title: "PLAN-L7-407 (impl): harness memory structure v2 — schema/provenance/lifecycle/takeover/fenced compaction"
kind: impl
layer: L7
drive: be
status: confirmed
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
  - artifact_path: docs/design/harness/L6-function-design/harness-memory-structure.md
    artifact_type: design_doc
  - artifact_path: src/memory/memory-v2.ts
    artifact_type: source_module
  - artifact_path: src/memory/index.ts
    artifact_type: source_module
  - artifact_path: src/runtime/session-log.ts
    artifact_type: source_module
  - artifact_path: src/cli.ts
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
review_evidence:
  - reviewer: vpair_reaudit (Codex independent review agent)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T03:46:19+09:00"
    tests_green_at: "2026-07-11T03:45:45+09:00"
    verdict: pass
    worker_model: gpt-5-codex
    reviewer_model: gpt-5-codex
    scope: "設計対テスト対実装の最終レビュー。blocker/highなし。SQLite初回競合のbounded retry、calendar round-trip UTC検証、atomic event dedupe、real failure診断、full-intent/predecessor operation ID、x→y→x更新を確認しapprove。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/memory/memory-v2.test.ts tests/memory/memory.test.ts tests/memory/memory-store.test.ts tests/memory-compaction.test.ts tests/session-log.test.ts tests/runtime-adapter.test.ts tests/vmodel-pair.test.ts tests/oracle-test-trace.test.ts tests/ddd-tdd-rules.test.ts tests/design-language.test.ts tests/review-evidence.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:44:57+09:00"
        evidence_path: tests/memory/memory-v2.test.ts
        output_digest: "sha256:70d558b72c54b15e3982593d7345eb97ee69212488b8232ac4c7405c0dd662ec"
      - kind: typecheck
        command: "bun run typecheck"
        runner: bun
        scope: full
        exit_code: 0
        completed_at: "2026-07-11T03:44:57+09:00"
        evidence_path: tsconfig.json
        output_digest: "sha256:66b7891ce526a88565ae7a744315255c3e05c6a6cc1b7392190855c5f35271d0"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L7-407-harness-memory-structure-v2.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:44:57+09:00"
        evidence_path: docs/plans/PLAN-L7-407-harness-memory-structure-v2.md
        output_digest: "sha256:e78e427122f2b573652b511302a10d22379461514df8e85248a2bebb6f1291d3"
      - kind: doctor
        command: "bun run src/cli.ts doctor"
        runner: bun
        scope: gate
        exit_code: 0
        completed_at: "2026-07-11T03:45:45+09:00"
        evidence_path: src/cli.ts
        output_digest: "sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
---

# PLAN-L7-407: harness memory structure v2 実装

## §0 目的

confirmed L6 memory v2 contractをTypeScript/Bunへ降下し、handover file廃止前に短寿命takeover、
provenance/lifecycle、決定論surface、情報無損失のfenced compactionを利用可能にする。

## §1 工程表

1. [直列] L8 unit test-designへMEMV2-S1a..S8bを`U-MEMV2-*`として宣言し、Red fixtureを追加する。
2. [直列] v1 normalizer、schema validator、legacy API adapterを実装する。
3. [直列] v2 JSONL event store、SQLite `BEGIN IMMEDIATE` coordination、fencing token付きappend/replaceを実装する。
4. [直列] takeover write/expire/deliver/consumeと決定論surface budgetを実装する。
5. [直列] `compactMemoryV2`をtemp→fsync→fenced atomic replaceで実装し、旧`compactMemory`を不変に保つ。
6. [直列] targeted/full tests、typecheck、lint、doctor、別runtimeレビューで閉じる。

## §2 受入条件

- MEMV2-S1a..S8bの14 subcaseが実test citation付きでgreen。
- v1 JSONL、旧API signature/返値、12件/240文字既定、U-MEMC-001..004が退行しない。
- stdout失敗、short append、session event失敗、append後coordination commit不明/retry、transaction外/stale fencing tokenをfixtureで再現する。
- 既存3引数CLIはv2既定、明示`--legacy-v1`のみ旧経路。memory_write eventはdeterministic IDでretry時も1件に収束する。
- concurrent write/consume/compactionでentry消失とterminal tombstone重複がない。
- secret/PII-like metadata、未知enum、矛盾lifecycle、不正linkをfail-closeする。
- `bun run typecheck`、targeted Vitest、Biome、doctor、PLAN lintがgreen。

## §3 対象外

- feedback lifecycle（PLAN-L6-63）。
- Codex/Claude runtime注入（PLAN-L6-64とそのL7 descent）。
- handover CLI/CURRENT.json撤去（PLAN-L6-61、受け皿実装後）。
- PLAN-M-02 identifier cutover、外部infra/auth/secret apply。
