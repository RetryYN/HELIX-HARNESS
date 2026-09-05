---
status: draft_candidate
canonical_layer: L10
canonical_pair: L3
plan: PLAN-L3-91-design-grounding-human-convergence
parent_design: docs/governance/candidates/design-grounding-human-convergence-requirements.md
---

## 受入（原稿10件、正負oracleへ展開）
1 未知の重要前提が未調査なら該当Design Readyを拒否、根拠の有効再利用は許可。
2 Evidenceから設計採用/非採用を追跡。
3 ダサい/不明瞭/見せ方不足を別分類し複数・未解決を保持。
4 communication failureだけならDesign再生成を要求しない。
5 accepted axisの無根拠変更を拒否。
6 objective greenとhuman rejectを相殺しない。
7 原文改変/AI提案の人間承認偽装を拒否。
8 既存Registry/Applicability責務を重複実装しない。
9 wrong revision/authority/evidence、再発の偽装解消を個別拒否。
10 Full E2Eと将来Lite最小契約のdependency closure/consumer検証を分離。

## 導入と追跡
census→owner/contract map→L1/L3/L10候補・正本化→DG→HR→DC→既存接続→deterministic/mutation/staleテスト→実project dogfood。共通要求への依存は使用slice単位。#1556全体完了を全Design作業の停止条件にしない。
原稿全文はrepoの取込台帳へGit保全・一致検証後にroot原稿を削除する。実装/承認/削除未完了をIssueだけで完了扱いにしない。



## 要件対応

AC1/2→DG-R-01..04、AC3/4/7→HR-R-01..04、AC5/6/9→DC-R-01..04、AC8/10→既存責務・配布境界。
全項目は受入仕様であり未実行。評価時刻・policy・入力revisionを固定した機械評価を再現し、AI再生成文面の完全一致は要求しない。
L12では意図不一致、再生成、受容軸退行、割込み、検収時間・費用をrisk別baselineと比較し、単なるiteration減少を成功としない。
