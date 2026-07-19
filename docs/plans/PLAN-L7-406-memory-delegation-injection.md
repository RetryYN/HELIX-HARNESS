---
plan_id: PLAN-L7-406-memory-delegation-injection
title: "PLAN-L7-406 (impl): 委譲 prompt への harness memory recall 注入 — AdapterContextInjection.memory_lines と DELEGATION_MEMORY_BUDGET の実装"
kind: impl
layer: L7
drive: be
status: confirmed
route_mode: forward
entry_signals:
  - "po_directive:2026-07-11 /goal「ハーネスメモリとスキル関係の実装をお願い」+ 追記「サブエージェント関連も頼むわ」（PLAN-L6-64 §1.2 委譲 prompt 注入 slice の実装解禁）"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "PLAN-L6-64（memory-cross-runtime-surface）の L6 設計 §3/§4 どおりの L7 実装。memory 意味論・adapter の既存 prompt 構成契約の変更なし（末尾 section 追加のみ）。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — adapter memory recall section + 委譲 CLI resolver の実装と test 新設"
  - role: qa
    slot_label: "QA — MEMX-S1..S4 oracle 網の検証"
generates:
  - artifact_path: docs/plans/PLAN-L7-406-memory-delegation-injection.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/runtime/adapter.ts
    artifact_type: source_module
  - artifact_path: src/runtime/adapter-policy.ts
    artifact_type: source_module
  - artifact_path: src/runtime/memory-injection.ts
    artifact_type: source_module
  - artifact_path: tests/runtime-adapter.test.ts
    artifact_type: test_code
dependencies:
  parent: docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
  requires:
    - docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - src/runtime/adapter.ts
    - src/runtime/adapter-policy.ts
    - src/cli.ts
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T03:25:00+09:00"
    tests_green_at: "2026-07-11T03:23:47+09:00"
    verdict: approve_after_fixes
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=approve_after_fixes → 是正済み。Important 1 件: 共有 resolver 経由で team run worker prompt にも memory recall が注入され、設計 §4 の『段階導入（blast radius 制御）』宣言を超過 → composeDelegationInjection（src/runtime/memory-injection.ts 新設）の surface policy（delegation のみ有効、team_run/task_route は機械的に落とす）で fail-close 化し、U-MEMX-005 regression oracle を追加。Minor 2 件（hidden breadcrumb の bucket 別内訳、group 化ロジックの二重実装）は挙動非劣化のため follow-up 扱い。Good: ヘッダ集計の cap 前実数不変、memory_lines 空の byte 同一 no-op、db close の try/finally 維持、fileMemoryDeps の fail-soft。是正後 50/50 green + E2E（helix claude plan JSON stdin に MEMORY_RECALL_HEADER を実測確認、team_run surface は U-MEMX-005 で非注入を機械保証）。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/runtime-adapter.test.ts tests/feedback-surface.test.ts tests/attempt-escalation.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:18:54+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:a6fd09fb2efd85b00725cd8154965c91452a326977012d3e2c0842724dfbf4ec"
      - kind: unit_test
        command: "bunx vitest run tests/runtime-adapter.test.ts tests/feedback-surface.test.ts tests/attempt-escalation.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:23:47+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:a3c2aec3d6161fe5506d213450437db1c3585f0ad284f2a4d8023cffa2289bae"
---

# PLAN-L7-406 (impl): 委譲 prompt への harness memory recall 注入

## 0. 範囲

PLAN-L6-64 の設計 §3（委譲 prompt 注入契約）と §4（per-runtime budget）の実装 slice。
Codex 拡張チャット経路（§2、動的 command 出力）は既存 `helix session start` / `helix memory show`
が担い、AGENTS.md 手順文言の書き換えは PLAN-L6-61（handover 撤去）の変更セットで行う。
team run / orchestration pair-agent への注入は follow-up slice（§4 の段階導入）。

## 1. 実装内容

1. `src/runtime/adapter-policy.ts`: `MEMORY_RECALL_HEADER` と
   `DELEGATION_MEMORY_BUDGET = { maxEntries: 6, maxBodyChars: 200 }` を exported policy const で追加。
2. `src/runtime/adapter.ts`: `AdapterContextInjection.memory_lines?: string[]` を追加し、
   `formatAdapterPrompt` が既存 section 順序の末尾に memory recall section を合成する
   （空/未定義は no-op で既存 prompt と同一）。adapter は IO を持たない（純関数のまま）。
3. `src/runtime/memory-injection.ts`（新設）: `composeDelegationInjection` が skill 注入と
   memory recall を surface policy（`delegation` のみ有効 / `team_run`・`task_route` は落とす）で
   合成する純関数。設計 §4 の段階導入を機械固定する（review Important 所見 2026-07-11 の是正）。
4. `src/cli.ts`: 委譲 CLI（`helix codex` / `helix claude`）の injection resolver が
   `surfaceMemory(fileMemoryDeps, DELEGATION_MEMORY_BUDGET)` の行を surface=`delegation` で合成する。
   skill 0 件でも memory があれば注入する（独立条件、MEMX-S4）。team run / task route の呼出面は
   surface 指定により memory 非注入のまま。
5. test 新設: `tests/runtime-adapter.test.ts` へ MEMX-S1/S2/S4/S5 相当（U-MEMX-001/001b/002/004/005）、
   budget（MEMX-S3 = U-MEMX-003）は surfaceMemory と委譲 budget const の結合で cover。実装と同時に
   pair test-design（L8-unit-test-design.md）へ `U-MEMX-*` oracle 行を宣言する。

## 2. 対象外

- memory entry 構造 v2 / takeover / lifecycle（PLAN-L6-62 の descent、別 impl PLAN）。
- team run / pair-agent worker prompt への注入（follow-up、設計 §4）。
- AGENTS.md / adapter rule marker の文言変更（PLAN-L6-61 の atomic 変更セット）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): test-first（Red）— MEMX oracle を tests へ追加。
- step 2 (mode: serial): 実装（Green）→ refactor。typecheck / test:fast / doctor green。
- step 3 (mode: serial): レビュー（intra_runtime_subagent 以上）→ review_evidence 記録 → confirm
  （confirm と同時に generates へ source_module / test_code を登録する）。

## 4. 受入条件

- MEMX-S1..S4 oracle green（memory_lines 非空で header+全行、空で byte 同一、skill との共存順序、
  skill 0 件 + memory 有りで注入）。
- 既存 adapter test（prompt 構成・skill 注入）が無変更で green（後方互換）。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-406-memory-delegation-injection.md` green。
