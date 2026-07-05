---
title: "HELIX L2 画面・モック境界"
layer: L2
kind: design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/test-design/helix/L2-screen-ux-test-design.md
---

# HELIX L2 画面・モック境界

本書は、L2 が空白に見える問題を塞ぐための coverage boundary である。HELIX の L2 は、個別画面仕様をここで再定義する層ではなく、**人間が直接作る最後の成果物であるモック**を L10 の実データ UX 検証へ接続する層として扱う。

## 現在の正本

| 項目 | 現在の参照 |
|---|---|
| 既存 screen 設計 | `docs/design/harness/L2-screen/**` |
| HELIX の L1 要求 | `docs/design/helix/L1-requirements/pillar-requirements.md` |
| L10 対 | `docs/design/helix/L10-ux/ux-evidence-boundary.md` |
| test-design 対 | `docs/test-design/helix/L2-screen-ux-test-design.md` |

## 境界

- HELIX 固有の画面要求は、L1 §2.8 の asset/progress visualization と L3 semantic frontier に接続する。
- `PLAN-DISCOVERY-10-helix-asset-visualization` が S4 confirmed になるまで、L2 から新しい UI 実装 scope を確定しない。
- `src/web/**` は component-derived UI slice の証跡であり、L10 UX/WCAG pair の完了証跡ではない。
- L2 は旧 state path から現行 `.helix` への cutover を承認しない。名称移行は L14 `PLAN-M-02` の cutover decision に従う。

## 受入条件

| ID | 条件 |
|---|---|
| L2-AC-01 | L1/HOT-P9 の visualization 要求から L2/L10 の未完了 frontier を辿れる |
| L2-AC-02 | L2 文書だけで L7 実装完了または L14 全件達成を主張しない |
| L2-AC-03 | S4 判断前の visualization を confirmed UI design として扱わない |
