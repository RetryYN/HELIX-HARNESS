---
title: "GitHub要件承認・動的監査・Recovery システムテスト設計"
layer: L10
artifact_type: test_design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: QA
pair_artifact: docs/design/helix/L3-requirements/github-approval-recovery-requirements.md
---

# GitHub要件承認・動的監査・Recovery システムテスト設計

- pair: `docs/design/helix/L3-requirements/github-approval-recovery-requirements.md`
- status: draft
- 実行層: L10

## テスト束

| Test ID | 対応AC | 入力 | 期待結果 |
|---|---|---|---|
| GH-T-019 | GH-AC-019 | 要求↔モック↔要件の遷移、差し戻し、証拠確認、AI齟齬修正、5問単位の認識合わせ、回答即時反映、未解決ゼロ監査、全revision提示、最終合意、承認後PR、別AI reviewを一つずつ欠落または別revision/HEAD化する | 全手順を経たcurrent revision・回答source・HEAD束縛のユーザー承認後だけPR化し、別AI review後だけmergeを許可する |
| GH-T-020 | GH-AC-020 | changed Lへ新consumer、未知edge、cycle、未登録nodeを追加し、固定scope表との差分を作る | version管理graphから閉包を再導出し、固定表にない到達先も監査対象にして未知要素をfail-closeする |
| GH-T-021 | GH-AC-021 | DB replayとGitHub再観測後も不一致を残し、通常開発とPerformance Recoveryを同時投入する | 自動上書きを拒否してRecovery化し、Performance Recoveryを先にdispatchする |
| GH-T-022 | GH-AC-022 | main merge後Full失敗にRecovery Issue、修正PR、独立review、doctor、GitHub Actions、Issue closureを一つずつ欠落または別HEAD化する | 通常merge停止を維持し、全修正証拠が同一HEADへ収束してIssueをcloseした場合だけ解除する |

## 証跡要件

承認receiptは要件revision、回答source、HEAD、actor、timestampを持つ。監査scope receiptはgraph version、start node、traversal policy、
到達node/edge、unknown/cycleを持つ。Recovery receiptはtrigger、修正Issue/PR、修正HEAD、review・doctor・Actions digest、closureを保存する。
