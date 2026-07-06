---
plan_id: PLAN-L6-57-handover-db-derivation
title: "PLAN-L6-57 (add-design): handover の DB 導出化 — 手書きポインタ排除と CURRENT.json の自動生成 snapshot 縮小"
kind: add-design
layer: L6
drive: be
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-07 「ハーネスメモリを入れているからハンドオーバーっていらないと思う？」→ 廃止ではなく DB 導出化で手書き部分を縮小する方針に PO 同意（それで）"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "handover の正本が harness.db feedback_events である既定（PLAN-L7-110）は変えず、CURRENT.json の手書きポインタを DB 導出 snapshot へ置き換える L6 機能設計。上位要求・handover 意味論の変更なし。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-110-takeover-feedback-surface.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - DB 導出 snapshot の field 契約と生成タイミング設計"
  - role: tl
    slot_label: "TL - handover 正本規約（DB 正本 / prose 補助）との整合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-57-handover-db-derivation.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/handover-db-derivation.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L7-110-takeover-feedback-surface.md
  references:
    - src/handover/index.ts
    - docs/plans/PLAN-L6-56-harness-memory-compaction.md
review_evidence: []
---

# PLAN-L6-57 (add-design): handover の DB 導出化

## 起点 signal

- PO 問い（2026-07-07）「ハーネスメモリがあるなら handover は不要では？」→ 検討結果:
  メモリ（長寿命の事実）と handover（短寿命の仕掛かり状態）は時間スケールが異なり両方必要。
  ただし handover の手書きポインタは実際に drift しており（例: CURRENT.json が PLAN-L7-33 を
  指したまま active が PLAN-DISCOVERY-07 という警告）、**手書き部分を DB 導出に置き換えて
  縮小する**方針で PO 同意。

## 0. 現状と gap

- 引き継ぎ feedback の正本は harness.db `feedback_events`（PLAN-L7-110、SessionStart surface）。
- `.helix/handover/CURRENT.json` は補助 prose だが、active PLAN ポインタ等を人手更新しており
  drift する（`helix handover` の drift 警告が常態化）。

## 1. スコープ（L6 機能設計で確定する事項）

1. **DB 導出 snapshot**: active PLAN（非終端 PLAN の frontier）、検証基準点（HEAD sha）、
   open blocker（outstanding / completion readiness）を harness.db から deterministic に導出する
   handover snapshot 契約を定義する。手書き値を持たない。
2. **CURRENT.json の縮小**: 自動生成 snapshot + 任意の takeover note（自由記述 1 欄のみ）へ縮小。
   note 以外の field は生成時に上書きされ、手書き編集は drift 検出の対象とする。
3. **生成タイミング**: `helix handover` 実行時と Stop hook（session summary）での再生成を設計。
4. **メモリとの境界**: 長寿命事実はハーネスメモリ、仕掛かり状態は handover snapshot、と
   書き分け規則を明文化する（[[PLAN-L6-56]] compaction と対）。

## 2. 対象外

- feedback_events の正本地位・schema の変更（PLAN-L7-110 の意味論は維持）。
- ハーネスメモリ側の変更（compaction は PLAN-L6-56）。
- cross-runtime プロトコル（Codex 側 AGENTS.md 規約）の変更。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): L6 機能設計 doc + L7 unit test design pair 追記。
- step 2 (mode: serial): レビュー（別 runtime または intra_runtime_subagent）→ 是正。
- step 3 (mode: serial): L7 実装 PLAN 起票（plan-descent gate: 本 L6 pair が前提）。

## 4. 受入条件

- L6 設計 doc が §1 の 1..4 を oracle 付きで規定し、pair test-design と 1:1。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-57-handover-db-derivation.md` green。
- 実装は本 PLAN の範囲外（後続 L7 PLAN）。
