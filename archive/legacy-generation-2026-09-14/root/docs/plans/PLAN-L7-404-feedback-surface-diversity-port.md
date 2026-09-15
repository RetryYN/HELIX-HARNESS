---
plan_id: PLAN-L7-404-feedback-surface-diversity-port
title: "PLAN-L7-404 (troubleshoot): SessionStart feedback surface の単一クラスタ独占を group-first cap で是正 + escalation surface 上限 — 上流 l7-context-efficiency-surface の概念移植"
kind: troubleshoot
layer: L7
drive: be
status: confirmed
route_mode: incident
entry_signals:
  - "po_directive:2026-07-11 /goal「UT-TDD_AGENT-HARNESS をすべて追突して HELIX へ引き込んで強化できるものはないか確認してプラン起票」— handover 廃止 → DB 直読一本化の前提として SessionStart surface の可視性欠陥（absence-blindness、実測）を上流 work/l7-context-efficiency-surface の概念採取で即効是正"
created: 2026-07-11
updated: 2026-07-11
backprop_decision: not_required
backprop_decision_reason: "SessionStart surface の表示選定 defect 修正（表示ロジックのみ）。feedback_events の正本地位・schema・上位設計 contract を変えない。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-110-takeover-feedback-surface.md
pair_artifact: docs/test-design/harness/L8-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: aim
    slot_label: "AIM — defect 再現条件と表示予算の意思決定（troubleshoot 起点の incident 判断）"
  - role: se
    slot_label: "SE — group-first 選定（bucket:severity:signal_type）と escalation cap の TS 実装 + 決定論 oracle"
  - role: tl
    slot_label: "TL — 表示予算・breadcrumb 整合・既存 renderTakeoverFeedback 後方互換のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-404-feedback-surface-diversity-port.md
    artifact_type: markdown_doc
  - artifact_path: docs/test-design/harness/L8-unit-test-design.md
    artifact_type: test_design
  - artifact_path: src/feedback/surface.ts
    artifact_type: source_module
  - artifact_path: src/runtime/attempt-escalation.ts
    artifact_type: source_module
  - artifact_path: tests/feedback-surface.test.ts
    artifact_type: test_code
  - artifact_path: tests/attempt-escalation.test.ts
    artifact_type: test_code
dependencies:
  parent: null
  requires:
    - docs/plans/PLAN-L7-110-takeover-feedback-surface.md
  references:
    - docs/governance/handover-retirement-memory-audit-2026-07-11.md
    - docs/plans/PLAN-L6-63-feedback-lifecycle.md
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-11T03:25:00+09:00"
    tests_green_at: "2026-07-11T03:23:47+09:00"
    verdict: pass
    worker_model: claude-fable-5
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー（commit d89f10a5 対象）。Critical/Important なし。Good: group-first cap は選定前の全件から bySeverity/byBucket/telemetryBySignal を確定してから cap するためヘッダ集計が実数のまま不変（oracle で担保）、escalation cap の既定 10 / 0=無制限。Minor 2 件（hidden breadcrumb の bucket 別内訳精度、renderGroupedItems と選定側 group 化の二重実装）は挙動非劣化のため follow-up 扱い（PLAN-L6-63 の surface 統合時に解消候補）。上流 l7-context-efficiency-surface commit 60fa4207 の概念採取・TS 再実装。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/runtime-adapter.test.ts tests/feedback-surface.test.ts tests/attempt-escalation.test.ts --project fast"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-11T03:23:47+09:00"
        evidence_path: tests/feedback-surface.test.ts
        output_digest: "sha256:a3c2aec3d6161fe5506d213450437db1c3585f0ad284f2a4d8023cffa2289bae"
---

# PLAN-L7-404 (troubleshoot): feedback surface の group-first cap + escalation 上限

## 0. defect（実測 2026-07-11）

1. `src/feedback/surface.ts:228` — `items.filter((item) => item.bucket !== "telemetry").slice(0, limit)`
   の単純 slice のため、単一 signal_type の大量クラスタが表示予算を独占し、他の問題種別が
   丸ごと不可視化する（absence-blindness）。実際に SessionStart 実測で actionable 81 件のうち
   表示は先頭 slice のみで、種別の多様性が保証されない。
2. `src/runtime/attempt-escalation.ts:127` — `renderEscalationSignals(signals)` に表示上限が無く、
   SessionStart surface 群で escalation だけ無制限（他 surface は cap 方針あり）という非一貫。

上流 branch `work/l7-context-efficiency-surface`（commit `60fa4207`、上流 PLAN-L7-403 confirmed）が
同型 defect を group-first 選定で解決済み。ADR-001 に従い code copy ではなく概念を TS/Bun の
local 実装へ再構成する。

## 1. 是正内容

1. **group-first 選定**: `feedbackGroupKey(item)`（`bucket:severity:signal_type`）で group 化し、
   「上位 N group を選ぶ」選定へ変更する。group には実件数（count）を保持し、表示行は group 単位で
   畳む。breadcrumb（`+N more actionable`）も group / 実件数の両方が判読できる形へ修正する。
2. **escalation cap**: `renderEscalationSignals(signals, { maxSignals })`（既定 10、`0` は無制限）へ
   拡張し、超過分は件数 breadcrumb で示す。
3. **後方互換**: 表示予算（limit）の意味は「表示 group 数」へ変わるため、既存 oracle
   （tests/feedback-surface.test.ts ほか）を更新し、`renderTakeoverFeedback` のヘッダ集計
   （open / gate / actionable / telemetry 件数）は不変であることを oracle 化する。

実装時（confirm と同時）に `generates:` へ `src/feedback/surface.ts` / `src/runtime/attempt-escalation.ts`
（source_module）と `tests/feedback-surface.test.ts` / `tests/attempt-escalation.test.ts`（test_code）を
登録する（merged-plan-status gate: draft 中は既存 merged file を deliverable として claim しない）。

## 2. 対象外

- feedback lifecycle（TTL auto-ack / consumed 非表示 / source_generation）は PLAN-L6-63 の設計範囲。
  本 PLAN は表示選定のみの即効 defect fix。
- memory surface の多様性設計（PLAN-L6-62 §1.4。本 PLAN の group-first と同型概念だが対象が別）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): test-first（Red）— group-first 選定と escalation cap の決定論 oracle を
  tests/feedback-surface.test.ts / tests/attempt-escalation.test.ts へ追加し、pair test-design
  （L7-unit-test-design.md）へ oracle 行を同時宣言。
- step 2 (mode: serial): 実装（Green）→ refactor。`bun run test:fast` + doctor green。
- step 3 (mode: serial): レビュー（別 runtime または intra_runtime_subagent）→ review_evidence 記録。

## 4. 受入条件

- 単一 signal_type が 100 件あっても他 group が表示される oracle が green。
- escalation 11 件で 10 件 + breadcrumb 1 行になる oracle が green。
- ヘッダ集計（open / bucket 件数）が変更前後で不変である oracle が green。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L7-404-feedback-surface-diversity-port.md` green、
  typecheck / Vitest / Biome / doctor green を review_evidence の green_commands として記録。
