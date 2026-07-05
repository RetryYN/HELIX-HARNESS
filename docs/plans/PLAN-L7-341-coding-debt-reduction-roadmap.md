---
plan_id: PLAN-L7-341-coding-debt-reduction-roadmap
title: "PLAN-L7-341 (refactor): コーディング債務削減ロードマップ — complexity baseline / 循環依存 grandfather の段階 ratchet"
kind: refactor
layer: L7
drive: fullstack
status: confirmed
created: 2026-07-06
updated: 2026-07-06
backprop_decision: not_required
backprop_decision_reason: "coding-rules の既存 gate 意味を変えず、grandfather された既存 debt (cognitive complexity baseline / 循環依存 12 件) を behavior-invariant refactor で段階的に引き下げるのみ。設計・要件の意味変更なし。"
owner: Claude (Fable)
parent_design: docs/process/modes/refactor.md
pair_artifact: tests/coding-rules.test.ts
agent_slots:
  - role: se
    slot_label: "SE - behavior-invariant refactor と baseline ratchet の実施"
  - role: tl
    slot_label: "TL - 挙動不変性と regression fence の妥当性レビュー"
generates:
  - artifact_path: docs/plans/PLAN-L7-341-coding-debt-reduction-roadmap.md
    artifact_type: markdown_doc
  - artifact_path: docs/governance/coding-rules.md
    artifact_type: markdown_doc
  - artifact_path: biome.json
    artifact_type: source_module
  - artifact_path: src/lint/coding-rules.ts
    artifact_type: source_module
dependencies:
  parent: null
  requires:
    - docs/governance/coding-rules.md
    - src/lint/coding-rules.ts
    - biome.json
  references:
    - docs/plans/PLAN-REVERSE-23-coding-rules-workflow.md
related_docs:
  - docs/governance/helix-harness-requirements_v1.2.md
review_evidence:
  - reviewer: codex-tl
    review_kind: intra_runtime_subagent
    reviewed_at: "2026-07-06T06:18:00+09:00"
    tests_green_at: "2026-07-06T06:18:00+09:00"
    verdict: approve
    scope: "coding-rules gate と coding debt roadmap の現状を確認。src/lint/coding-rules.ts は既に merge 済みの生成物であり、PLAN を archive ではなく confirmed に揃えた。追加の debt 削減 slice は backlog として扱う。"
    worker_model: codex
    reviewer_model: codex-intra-runtime
    green_commands:
      - kind: unit_test
        command: "bun test tests/coding-rules.test.ts --timeout 300000"
        runner: bun
        scope: targeted
        exit_code: 0
        completed_at: "2026-07-06T06:18:00+09:00"
        evidence_path: tests/coding-rules.test.ts
        output_digest: "sha256:55076515f080791c43073cf79af2ffd95d8b90a9ffa4a977001c4a785717a0b3"
---

# PLAN-L7-341 (refactor): コーディング債務削減ロードマップ

## 実装確認（PO 指示 2026-07-06）

本 PLAN は archive では閉じず、生成物が既に存在する事実に合わせて confirmed とする。
coding-rules gate は現行 baseline で green。大きな behavior-invariant refactor slice は別 backlog として
扱い、baseline の引き上げは許可しない。

## 目的（PO 要求 2026-07-06「保守性などの性能を向上させるためのコーディングルールの整備」）

コーディング規約は文書（coding-rules.md）+ 機械強制（src/lint/coding-rules.ts + Biome）+ CI の
3 層が整備済みだが、grandfather された既存債務に削減ロードマップが無い:

- Biome `noExcessiveCognitiveComplexity` の baseline `maxAllowedComplexity: 187`（現状追認値）。
- `GRANDFATHERED_CIRCULAR_DEPENDENCY_KEYS` の既存循環依存 12 件。

新規劣化は fail-close で塞がれている一方、既存債務は放置すると恒久化する。本 PLAN は
behavior-invariant refactor により債務を段階的に削減し、baseline を ratchet（引き下げ後は
戻さない）する。

## 設計方針

- **regression fence の下で挙動不変**: 各 ratchet 単位で全回帰 green を維持し、public contract を
  変えない（code-simplify skill の規律に従う）。
- **ratchet 方式**: baseline 値の引き下げは「削減実績 → baseline 追随」の順で行い、
  先に baseline を下げて red を作らない。
- **一括りにしない**: 複雑度上位関数・循環依存を 1 件ずつ独立 slice として削減し、
  各 slice ごとに commit する。

## スコープ

### Step 1 — 実測棚卸し（serial）
- 複雑度上位関数の一覧と循環依存 12 件の現状を実測し、削減順（効果 × リスク）を決める。

### Step 2 — 循環依存の削減（parallel 可、slice 単位）
- 依存方向の整理・module 分割で循環を解消し、`GRANDFATHERED_CIRCULAR_DEPENDENCY_KEYS` から
  解消済み key を削除（ratchet）する。

### Step 3 — 高複雑度関数の分割（parallel 可、slice 単位）
- 上位関数を段階分割し、`maxAllowedComplexity` を実測値へ追随して引き下げる。

### Step 4 — ロードマップの明文化（serial）
- coding-rules.md へ「baseline は削減実績に追随して引き下げ、引き上げ禁止」の ratchet 規律を追記する。

### OUT / 非対象
- 新規 lint ルールの追加（既存ルールの債務削減のみ）。
- テストコードの複雑度規制強化（source 側の削減が先）。

## 受入条件
- 各 slice で `bun run typecheck` / `bun run lint` / `npx vitest run` / `helix doctor` green。
- baseline 値（complexity / 循環依存 key 数）が着手時実測より単調減少していること。
- confirmed 化の前に review evidence を記録する。

## スケジュール
- mode: serial（Step 1 → Step 4）。Step 2 / Step 3 の slice 内は parallel 可。

## 壊さない / 再発させない
- baseline の引き上げ（ratchet 逆行）をしない。
- refactor に機能変更・仕様変更を混入しない（behavior-invariant 境界を slice ごとに検証）。

## §6 用語更新 (living glossary delta)

| 用語 | 種別 (新規 / 精緻化) | 定義 / 変更点 | L0 §10 back-merge (導入層 / 更新層) |
|---|---|---|---|
| baseline ratchet | 新規 | grandfather baseline を削減実績に追随して単調に引き下げ、引き上げを禁止する運用 | 導入層 L7、confirmed 時に back-merge |

## §7 機能要求更新 (FR registry delta)

機能要求更新なし（behavior-invariant refactor であり、機能を追加・変更しない）。
