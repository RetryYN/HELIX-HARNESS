---
plan_id: PLAN-L6-64-memory-cross-runtime-surface
title: "PLAN-L6-64 (add-design): harness memory の cross-runtime surface — Codex 拡張チャット / 委譲 prompt への注入設計"
kind: add-design
layer: L6
drive: be
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-11 /goal「ハーネスメモリの構造を強化して ClaudeCode と Codex 拡張（チャット画面）」— memory surface を Claude Code 片翼から両 runtime 対応へ"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "memory surface の到達面を Codex 側へ広げる harness 内部配線の設計。hybrid 運用規約（AGENTS.md / adapter rule markers）の記述更新は伴うが、product の外部 contract を変えない。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/harness-memory-compaction.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — Codex 拡張チャット / 委譲 prompt / team run への memory 注入経路の設計"
  - role: tl
    slot_label: "TL — 注入 budget・secret 境界・adapter rule marker 整合のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/memory-cross-runtime-surface.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L6-56-harness-memory-compaction.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - docs/plans/PLAN-L6-62-harness-memory-structure.md
    - src/runtime/adapter.ts
    - src/cli.ts
    - .codex/hooks.json
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T03:25:00+09:00"
    tests_green_at: "2026-07-11T03:23:47+09:00"
    verdict: approve_after_fixes
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "L6 設計（注入経路選定 (a) 動的 command 出力 / 委譲契約 memory_lines / ランタイム別 budget / MEMX-S1..S5）と L7-406 実装の整合レビュー。Important 是正で設計 §4 の段階導入宣言を composeDelegationInjection surface policy として機械固定し、設計へ MEMX-S5 を追補。L8 単体テスト設計へ oracle route（U-MEMX-001..005）を pair 追記済み。実装 green は PLAN-L7-406 の green_commands を参照（同一 run、digest sha256:a3c2aec3d6161fe5506d213450437db1c3585f0ad284f2a4d8023cffa2289bae）。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/runtime-adapter.test.ts tests/feedback-surface.test.ts tests/attempt-escalation.test.ts --project fast"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:23:47+09:00"
        evidence_path: tests/runtime-adapter.test.ts
        output_digest: "sha256:a3c2aec3d6161fe5506d213450437db1c3585f0ad284f2a4d8023cffa2289bae"
---

# PLAN-L6-64 (add-design): harness memory の cross-runtime surface

## 起点 signal

- PO 指示（2026-07-11 /goal）: harness memory を Claude Code と Codex 拡張（チャット画面）の
  両対応へ強化する。実測（audit §2.2 M3）: `surfaceMemory` の消費は Claude SessionStart hook
  （`src/cli.ts:3107`）と `helix memory surface`（`src/cli.ts:1785`）のみで、`helix codex` 委譲
  prompt（`src/runtime/adapter.ts`）にも Codex 拡張チャット session にも harness memory は
  一切注入されていない。hybrid 運用で Codex が並行作業の主力である以上、この片翼状態は
  handover 廃止後の情報到達を欠損させる。

## 0. 現状と gap

- `.codex/hooks.json` は PreToolUse guard 3 種（agent-guard / work-guard / git-command-guard）のみで
  SessionStart 相当の注入 hook を持たない（実測 2026-07-11）。
- Codex chat session の repo 文脈は AGENTS.md の静的規約 + `.helix/handover/CURRENT.json` 確認規約
  （AGENTS.md session start 手順）に依存しており、後者は PLAN-L6-61 で廃止対象。代替の動的注入面を
  設計しないと Codex 側だけ引き継ぎ情報が細る。
- `~/.codex/AGENTS.md` の handover 記述は既に実在しない識別子を指しており（audit H7）、静的 prose に
  よる到達は腐ることが実証されている。

## 1. スコープ（L6 機能設計で確定する事項）

1. **Codex 拡張チャット session への注入経路の選定**: 候補を比較し機構を確定する。
   (a) Codex 側 session 初回に `helix session start` 相当（memory + feedback surface を stdout 出力）
   を実行する規約 + それを担保する機械検査、(b) AGENTS.md の managed block へ `helix` が surface
   snapshot を再生成埋め込みする方式（stale 化リスクは生成時刻 + 再生成 gate で緩和）、
   (c) Codex CLI/拡張の hook 面（`.codex/hooks.json`）に将来 session-start hook が来た場合の追随。
   選定判断は「静的 prose は腐る（H7 実証）」を制約として動的生成を優先する。
2. **委譲 prompt への注入**: `helix codex --role ... --task ...` / `helix claude ...` の委譲 prompt
   組み立て（`src/runtime/adapter.ts`）へ memory surface（v2 の type / layer 選定に基づく関連分）を
   注入する契約。判断ブリーフ（judgment-core、PLAN-L7-337）との合成順序と重複回避を定義する。
3. **team run worker への注入**: `helix team run` の worker prompt に対する同様の注入と、role 別の
   budget 差（判断系 role は constraint/decision 優先、worker は task 関連のみ等）。
4. **per-runtime budget**: chat（人間可読・冗長許容）と delegation prompt（token 予算厳格）で
   surface budget（件数・文字数・type 構成）をパラメタ化する（PLAN-L6-62 §1.4 の budget 機構を
   呼出面から使う）。
5. **secret / 漏洩境界**: 注入は既存 secret 拒否済み entry のみを対象とし、生成物（AGENTS.md
   managed block 等）に絶対パス・secret を書かない検査（PLAN-L7-145 の教訓）を oracle 化する。

## 2. 対象外

- memory entry 構造・takeover 層そのもの（PLAN-L6-62）。
- handover 消費面の撤去と指示面書き換えの実施（PLAN-L6-61。本 PLAN は代替経路の設計）。
- Codex CLI 本体・拡張の改造（HELIX が管理する local CLI + hook surface の範囲で設計する）。
- 実装（後続 L7 PLAN。plan-descent gate に従い本 L6 pair 確定後に起票）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): 注入経路 (a)/(b)/(c) の比較設計と選定（L6 機能設計 doc + L7 unit test
  design pair 追記）。
- step 2 (mode: serial): レビュー（別 runtime または intra_runtime_subagent。Codex 側の実行実態は
  cross-runtime レビューで検証）→ 是正。
- step 3 (mode: serial): L7 実装 PLAN 起票（plan-descent gate: 本 L6 pair が前提）。

## 4. 受入条件

- L6 設計 doc が §1 の 1..5 を oracle 付きで規定し、pair test-design と 1:1。
- 選定した注入経路について「Codex 拡張チャット session が memory surface を受け取る」ことの
  検証手順（実 session での確認 or 機械検査）が定義される。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-64-memory-cross-runtime-surface.md` green。
- 実装は本 PLAN の範囲外（後続 L7 PLAN）。
