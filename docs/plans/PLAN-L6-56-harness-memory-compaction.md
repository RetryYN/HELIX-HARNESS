---
plan_id: PLAN-L6-56-harness-memory-compaction
title: "PLAN-L6-56 (add-design): ハーネスメモリ compaction の機能設計 — superseded entry の物理整理と surface 品質の維持"
kind: add-design
layer: L6
drive: be
status: confirmed
route_mode: add-feature
entry_signals:
  - "po_directive:2026-07-07 「ハーネスメモリコンパクトって機能つけてる？」（未実装確認に伴う起票）"
created: 2026-07-07
updated: 2026-07-07
backprop_decision: not_required
backprop_decision_reason: "既存 memory 意味論（append-only + supersede + surface budget）を変えず、superseded/破損行の物理 compaction を追加する L6 機能設計。上位要求の変更なし。"
owner: Claude (Fable)
parent_design: docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md
pair_artifact: docs/test-design/harness/L7-unit-test-design.md
related_l0: docs/design/helix/L0-charter/helix-charter_v0.1.md
agent_slots:
  - role: se
    slot_label: "SE - compaction algorithm / 安全性（backup・atomic rewrite）の機能設計"
  - role: tl
    slot_label: "TL - append-only 意味論と audit 整合のレビュー"
generates:
  - artifact_path: docs/plans/PLAN-L6-56-harness-memory-compaction.md
    artifact_type: markdown_doc
  - artifact_path: docs/design/harness/L6-function-design/harness-memory-compaction.md
    artifact_type: design_doc
dependencies:
  parent: docs/plans/PLAN-L6-01-function-spec.md
  requires:
    - docs/plans/PLAN-L7-175-helix-orchestration-memory-impl.md
  references:
    - src/memory/memory-store.ts
    - src/memory/index.ts
review_evidence:
  - reviewer: code-reviewer (claude-sonnet-5)
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-07T06:45:00+09:00"
    tests_green_at: "2026-07-07T06:38:48+09:00"
    verdict: approve_after_fixes
    worker_model: codex
    reviewer_model: claude-sonnet-5
    scope: "5 軸レビュー verdict=reject → 是正後 approve。Critical: deriveHandoverSnapshot が plan_registry 射影（workflow_phase / version_target / 本文なし）で authority 判定を導出し fail-open → completionReadiness を構造的 blocker のみ（authorityScope=structural_only）に限定し authority 判定を非導出に是正。Important: layer file 未作成時に backup ENOENT で非 dryRun だけ落ちる非対称 → 空 file short-circuit を追加（U-MEMC-003b 回帰テスト新設）。Good: temp+rename atomic、backup 失敗時中止、deps.now() 注入で Date.now 直接依存なし。"
    green_commands:
      - kind: unit_test
        command: "bunx vitest run tests/memory-compaction.test.ts tests/handover-db-derivation.test.ts --project fast"
        runner: node
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-07T06:38:48+09:00"
        evidence_path: tests/memory-compaction.test.ts
        output_digest: "sha256:7274b69b656f8294b9441ec0b261b6a93b66fa02fe2f58d29452da4a1e14e87b"
---

# PLAN-L6-56 (add-design): ハーネスメモリ compaction の機能設計

## 起点 signal

- PO 質問（2026-07-07）「ハーネスメモリコンパクトって機能つけてる？」→ 現状調査で **未実装** を確認。

## 0. 現状と gap

`src/memory/`（PLAN-L7-175 系）は次を備える。

- append-only JSONL（`.helix/memory/{harness,project}.jsonl`）+ `supersedes` による論理上書き。
- 読み出し側の surface budget（SessionStart 注入は直近 12 件・各 240 字、`surfaceMemory`）。

gap: **物理 compaction が無い**。superseded entry と破損行が JSONL に無制限に蓄積し、
read コスト・repo state サイズが単調増加する。読み出し側の予算だけで書き込み側の膨張は抑えられない。

## 1. スコープ（L6 機能設計で確定する事項）

1. `helix memory compact [--layer harness|project]`: superseded chain と parse 不能行を除去し、
   active entry のみへ JSONL を atomic に書き直す（temp file + rename、実行前 backup、dry-run 出力）。
2. 意味論不変条件: compaction 前後で `listMemory` / `surfaceMemory` / `findByKey` の観測結果が不変。
3. 発火条件の設計: 手動 CLI を第一段とし、閾値（entry 総数 / superseded 比率）による
   doctor warning（compaction 推奨の surface）を定義する。自動発火は本 PLAN では設計のみ判断。
4. audit: compaction 実行（除去件数・backup path）を `.helix/logs/` へ記録する。

## 2. 対象外

- harness.db `feedback_events` telemetry の retention/rollup（別関心。必要なら別 PLAN で起票）。
- memory 意味論（supersede 規則・secret 拒否・surface budget 値）の変更。
- LLM による要約・マージ（deterministic 整理のみ。要約を正本にしない）。

## 3. スケジュール（schedule steps）

- step 1 (mode: serial): L6 機能設計 doc + L7 unit test design pair 追記。
- step 2 (mode: serial): レビュー（別 runtime または intra_runtime_subagent）→ 是正。
- step 3 (mode: serial): L7 実装 PLAN 起票（plan-descent gate: 本 L6 pair が前提）。

## 4. 受入条件

- L6 設計 doc が §1 の 1..4 を oracle 付きで規定し、pair test-design と 1:1。
- `bun run src/cli.ts plan lint docs/plans/PLAN-L6-56-harness-memory-compaction.md` green。
- 実装は本 PLAN の範囲外（後続 L7 PLAN）。
