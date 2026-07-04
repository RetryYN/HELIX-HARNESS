---
title: "HELIX L2 画面・モック UX テスト設計"
layer: L10
kind: test_design
status: confirmed
created: 2026-07-04
updated: 2026-07-04
owner: Codex
pair_artifact: docs/design/helix/L2-screen/screen-mock-boundary.md
---

# HELIX L2 画面・モック UX テスト設計

本書は L2↔L10 の片肺を防ぐための test-design boundary である。L2 モックは、L10 で実データ・実操作・WCAG 観点により検証されるまで、実装完了や運用完了の根拠にしない。

## テスト観点

| ID | 対応 | 検証観点 | 合格条件 |
|---|---|---|---|
| HUX-L2-01 | L2-AC-01 | visualization の node / edge / blocker が DB/docs 由来で再現できる | LLM 生成図を正本にせず deterministic read model から再生成できる |
| HUX-L2-02 | L2-AC-02 | component-derived UI slice と L10 UX 完了を区別する | `screen-impl-pair-freeze` が next_pair_freeze=L10 を返す状態を完了扱いしない |
| HUX-L2-03 | L2-AC-03 | S4 未了の visualization を confirmed UI scope にしない | `PLAN-DISCOVERY-10` が S4 decision なしなら frontier として残す |

## 完了境界

L10 完了には、実データでの UX 検証、accessibility evidence、未収束 blocker の表示確認、action surface の approval-bound 化が必要である。現時点では frontier として扱う。
