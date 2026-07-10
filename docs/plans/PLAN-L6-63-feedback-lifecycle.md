---
plan_id: PLAN-L6-63-feedback-lifecycle
title: "PLAN-L6-63 (add-design): feedback lifecycle の機能設計 — lifecycle 台帳 / telemetry TTL auto-ack / consumed 非表示 / memory promotion nudge（上流概念採取）"
kind: add-design
layer: L6
drive: db
status: draft
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-11 /goal「UT-TDD_AGENT-HARNESS をすべて追突して HELIX へ引き込んで強化できるものはないか確認してプラン起票」— handover 廃止の前提として feedback_events の飽和（open=2010、うち telemetry=1929、2026-07-11 SessionStart 実測）を、上流 PR#40 で実証済みの lifecycle 概念の採取で解消する"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "feedback_events の正本地位（PLAN-L7-110）は不変のまま、その上に lifecycle 状態（open→ack→closed 系）の台帳を追加する harness 内部強化。product の外部 contract を変えない。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-110-takeover-feedback-surface.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE — feedback_lifecycle 台帳（source_generation / TTL / 再 open 防止）の契約設計"
  - role: tl
    slot_label: "TL — 正本地位不変・fail-open 境界（nudge 非 block）・local feedback engine への適合レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-63-feedback-lifecycle.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/feedback-lifecycle.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L7-110-takeover-feedback-surface.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - docs/plans/PLAN-L6-62-harness-memory-structure.md
    - src/feedback/surface.ts
    - src/runtime/session-log.ts
    - src/state-db/projection-writer.ts
---

# PLAN-L6-63 (add-design): feedback lifecycle の機能設計

## 起点 signal

- 引き継ぎの正本は harness.db feedback_events（PLAN-L7-110）だが、SessionStart 実測（2026-07-11）で
  open=2010・telemetry=1929・missing-test-oracle-id=1434 と飽和しており、actionable が telemetry に
  埋没する（audit §2.2 M4）。handover を廃止して DB 直読へ一本化するには、この飽和を lifecycle で
  構造的に解消する必要がある。
- 上流 PR#40（work/memory-telemetry-lifecycle）が同型問題を解決済み（上流 PLAN-L6-68 / L7-392
  confirmed）。ADR-001 に従い概念のみ採取し TS/Bun の local 設計へ再構成する。

## 0. 現状と gap

- local に `feedback_lifecycle` 相当の台帳・projection は無い（grep 0 件、実測 2026-07-11）。
- projection は再生成のたびに open を再構築するため、「解消済み」を DB 側に永続する手段が
  status 列の直接更新しかなく、再投影で復活し得る（上流が source_generation 追跡で封じた問題）。
- session-log の `SessionEventType` に `memory_write` が無く、「session の成果を memory に記録し
  忘れた」ことを機械検出できない（手書き handover へ依存が残る根因の一つ）。

## 1. スコープ（L6 機能設計で確定する事項）

1. **feedback_lifecycle 台帳**: append-only ログ（`.helix/logs/` 配下）+ harness.db projection の
   pair。`source_generation` で「closed / superseded にした世代の signal は再投影で open へ戻らない」
   不変条件を定義する。状態機械（open → ack → closed / superseded）と遷移権限を確定する。
2. **telemetry TTL auto-ack**: bucket=telemetry の signal が open のまま TTL（既定 24h、policy const）
   を超えたら自動 ack して SessionStart surface から退避する。gate / actionable は TTL 対象外
   （source 解消時のみ closed）。
3. **consumed 非表示**: surface 済み・ack 済み feedback の非再表示規則と、隠れた件数の breadcrumb
   集計（hiddenActionable 相当）。同一 finding が複数 source（feedback_events / findings）から
   二重表示される問題の重複排除もここで規定する。
4. **memory promotion nudge**: Stop hook（session summary）で「session 内に commit / plan_switch の
   ok event があり、かつ `memory_write` の ok event が無い」場合に warn 1 行を nudge する純関数契約。
   非 block（fail-open）、already_nudged 抑制、本文 / diff は読まない。`memory_write` event type の
   追加は PLAN-L6-62 §1.5 と共有。
5. **local 適合**: local の surface は findings / quality_signals から直接組み立てる実装であり
   （上流と系統差）、上流 code の移植ではなく local feedback engine / projection-writer の契約へ
   再設計する。効果測定 oracle として「SessionStart 表示の telemetry 埋没が解消され actionable が
   budget 内で可視化される」ことを定義する。

## 2. 対象外

- feedback_events の schema・正本地位の変更（意味論は PLAN-L7-110 のまま）。
- surface の group-first 多様性 cap（即効 port は PLAN-L7-404。本 PLAN は lifecycle 側）。
- memory entry 構造そのもの（PLAN-L6-62）。
- 実装（後続 L7 PLAN。plan-descent gate に従い本 L6 pair 確定後に起票）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): L6 機能設計 doc + L7 unit test design pair 追記（状態機械 / TTL / 再 open
  防止 / nudge の oracle）。
- step 2 (mode: serial): レビュー（別 runtime または intra_runtime_subagent）→ 是正。
- step 3 (mode: serial): L7 実装 PLAN 起票（plan-descent gate: 本 L6 pair が前提）。

## 4. 受入条件

- L6 設計 doc が §1 の 1..5 を oracle 付きで規定し、pair test-design と 1:1。
- 「再投影で closed が open へ戻らない」不変条件が oracle として明記される。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-63-feedback-lifecycle.md` green。
- 実装は本 PLAN の範囲外（後続 L7 PLAN）。
