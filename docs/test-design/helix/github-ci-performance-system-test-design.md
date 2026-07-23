---
title: "GitHub CI性能・Recovery システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-ci-performance-requirements.md
---

# GitHub CI性能・Recovery システムテスト設計

- pair: `docs/design/helix/L3-requirements/github-ci-performance-requirements.md`
- status: draft
- 実行層: L10

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-017 | GH-AC-017 | PR targeted/critical、high-risk PR full、main merge後full、nightly fullへ同じ検査inventoryを投入し、selected/skipped集合、環境、HEAD、cold/warm cache、区間duration、receipt digest、item→最初のterminal receipt linkを収集する。重要検査、Full verification、一次回収、nightly補完を欠落または二重計上するfixtureも投入する | 別環境・別receiptの実測から重要検査p95 60秒、Full verification p95 3分を判定し、unknown/high-riskのtargeted縮退、main後一次回収欠落、nightly補完欠落、二重計上、別HEAD、集計根拠不明を合格にしない |
| GH-T-018 | GH-AC-018 | correctness greenのまま性能予算だけを超過させ、Recovery Issue欠落、計測項目欠落、検査削減、閾値緩和、GitHub Actionsへの先送りを個別投入する | correctness結果を性能だけで偽failureにせず、完全なRecovery Issueを同episodeで起票し、縮退改善を拒否して独立review・再計測・closureまで追跡する |

## 証跡要件

各実行はsource HEAD、runner/environment identity、cold/warm cache、検査集合digest、開始・終了時刻、区間duration、exit code、
output digestを保存する。p50/p95は母集団、期間、除外理由を持ち、単発最速値や画面表示だけを性能達成証拠にしない。
