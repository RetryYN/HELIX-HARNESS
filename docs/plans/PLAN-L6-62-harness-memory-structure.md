---
plan_id: PLAN-L6-62-harness-memory-structure
title: "PLAN-L6-62 (add-design): harness memory 構造強化 v2 — type/provenance/lifecycle/takeover 層と surface 多様性 budget の機能設計"
kind: add-design
layer: L6
drive: be
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-11 /goal「ハーネスメモリの構造を強化して ClaudeCode と Codex 拡張（チャット画面）」— handover 廃止の受け皿として memory 構造を強化する"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "harness 内部の memory 機構強化。既存 memory 意味論（supersede / secret 拒否 / surface budget、PLAN-L6-56 の compaction 不変条件）は拡張互換で維持し、product の外部 contract を変えない。"
owner: Claude (Fable)
parent_design: docs/design/harness/L6-function-design/harness-memory-compaction.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — memory entry schema v2（type/provenance/lifecycle/link）と takeover 層の契約設計"
  - role: tl
    slot_label: "TL — 後方互換（既存 jsonl・compaction 不変条件）と surface budget 設計のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-62-harness-memory-structure.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/harness-memory-structure.md
    artifact_type: design_doc
  - artifact_path: docs/test-design/harness/L7-unit-test-design.md
    artifact_type: test_design
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L6-56-harness-memory-compaction.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - docs/plans/PLAN-L6-61-handover-retirement.md
    - src/memory/memory-types.ts
    - src/memory/index.ts
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T03:14:30+09:00"
    tests_green_at: "2026-07-11T03:08:06+09:00"
    verdict: approve
    worker_model: codex
    reviewer_model: codex-intra-runtime
    scope: "memory v2 schema/v1互換/takeover lifecycle/surface budget/compaction不変/V-pairをseverity-firstで4巡レビュー。terminal tombstoneと旧compaction衝突、API互換、物理SSoT、副作用順序、cross-process lock、lease回収raceをcompactMemoryV2分離とfencing tokenで是正し、blocker/high残存なし。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/vmodel-pair.test.ts tests/oracle-test-trace.test.ts tests/ddd-tdd-rules.test.ts"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:08:06+09:00"
        evidence_path: docs/test-design/harness/L7-unit-test-design.md
        output_digest: "sha256:4854f85d8bd0d774108847749598ebbca556cbbbf6ed5384c4e31dd22c6b9f0d"
      - kind: lint
        command: "bun run src/cli.ts plan lint docs/plans/PLAN-L6-62-harness-memory-structure.md"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:08:20+09:00"
        evidence_path: docs/plans/PLAN-L6-62-harness-memory-structure.md
        output_digest: "sha256:414cc986f2142a55771d6f6598e163499678cea2d7ff7c48a1e660456e0fde33"
---

# PLAN-L6-62 (add-design): harness memory 構造強化 v2

## 起点 signal

- PO 指示（2026-07-11 /goal）: handover を廃止し harness memory を強化する。現行 memory は
  `layer/key/body/supersedes/createdAt` の最小構造（audit §2.2 M1）で、handover の受け皿となるには
  構造・lifecycle・surface の 3 面が不足している。

## 0. 現状と gap

正本 = `docs/governance/handover-retirement-memory-audit-2026-07-11.md` §2.2。要点:

- M1: entry に type / provenance（plan_id・session・runtime）/ lifecycle / 関連 link が無い。
- M2: surface が「直近 12 件 + 240 chars」の時系列 slice のみで relevance / 多様性選定が無い。
- M5: 短寿命の仕掛かり状態（takeover note 相当）を受け止める層が無い。L6-57 が「両方必要」と
  判断した根拠はこの欠落であり、廃止にはここを塞ぐ必要がある。

## 1. スコープ（L6 機能設計で確定する事項）

1. **entry schema v2**: 種別 type（decision / constraint / feedback / state / reference）、由来
   provenance（plan_id・session_id・runtime・origin）、寿命 lifecycle（active / consumed / expired、
   任意 TTL）、関連 link（他 entry key への参照）を追加した entry 契約。既存 field の意味論
   （key 単位 supersede・secret 拒否）は不変。
2. **後方互換**: 既存 `.helix/memory/*.jsonl` の v1 行を読み続ける（欠損 field は既定値へ縮退）か、
   一回性 migration（compaction 経路の拡張）かを設計判断として確定する。
   PLAN-L6-56 compaction の不変条件（`listMemory` / `surfaceMemory` / `findByKey` 観測不変）を
   v2 でも保つ拡張規則を定義する。
3. **takeover 層**: `harness` / `project` に加え短寿命層 `takeover` を新設する。one-shot consumed
   （surface されたら consumed へ遷移し次回から出さない）、書き込みは人間判断・申し送りに限定、
   secret 拒否は同一、の契約。foreign-edit-override marker（one-shot 消費 + audit log）の既存
   pattern を先例として流用する。
4. **surface v2**: type / layer / lifecycle を加味した選定（takeover 最優先 → constraint/decision →
   その他）、group-first の多様性保証（単一 type の budget 独占防止。上流 group-first cap と同型の
   概念、PLAN-L7-404 と整合）、budget（件数・文字数）の per-呼出面パラメタ化。
5. **write 経路**: `helix memory write` の v2 field 対応と、session-log への `memory_write`
   event type 追加（PLAN-L6-63 の promotion nudge の前提となる観測点）。

## 2. 対象外

- feedback_events と feedback lifecycle の変更（PLAN-L6-63 の範囲）。
- Codex 拡張チャット・委譲 prompt への注入経路（PLAN-L6-64）。
- handover 消費面の撤去（PLAN-L6-61）。
- LLM による要約・自動生成 memory（deterministic 整理のみ、PLAN-L6-56 の判断を踏襲）。
- 実装（後続 L7 PLAN。plan-descent gate に従い本 L6 pair 確定後に起票）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): L6 機能設計 doc + L7 unit test design pair 追記（schema v2 / takeover /
  surface v2 の oracle）。
- step 2 (mode: serial): レビュー（別 runtime または intra_runtime_subagent）→ 是正。
- step 3 (mode: serial): L7 実装 PLAN 起票（plan-descent gate: 本 L6 pair が前提）。

## 4. 受入条件

- L6 設計 doc が §1 の 1..5 を oracle 付きで規定し、pair test-design と 1:1。
- 既存 memory 意味論の不変条件（supersede / secret 拒否 / compaction 観測不変）が oracle として明記。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-62-harness-memory-structure.md` green。
- 実装は本 PLAN の範囲外（後続 L7 PLAN）。
