---
title: "Infinity Loop 独自概念 要件整合監査"
status: draft
confirmed_at: 2026-07-22
owner: Codex / TL
plan: PLAN-L3-21-contextual-pr-review-db-convergence
---

# Infinity Loop 独自概念 要件整合監査

## 1. 証拠で確定済みのため質問しない事項

| 論点 | 証拠 | 判定 |
|---|---|---|
| loopの単位 | L0 P1、HIL-BR-10、HR-FR-HIL-02、HST-HIL-001 | Issue/PLAN/PR/CI/audit/DB/memoryを一episodeで閉じ、engineは次episodeを継続する |
| 完了条件 | HIL-FR-01/07、Closure Gate、HST-HIL-023 | receipt joinが同一HEADへ収束した時だけepisodeをcloseする |
| budget到達 | HIL-NFR-03、HR-FR-HIL-02 | 完了扱いにせずcheckpoint＋未完了で再開する |
| 学習昇格 | HIL-BR-11、HST-HIL-016 | recipe→shadow→skill/detector/gate。再現fixtureと効果測定前の強制昇格は禁止 |
| DB正本 | HIL-BR-10、GH-FR-018、HST-HIL-035 | event replay、projection/checkpoint/schema、GitHub再観測を同一HEADで照合する |
| 将来Update | GH-FR-022、HST-HIL-040、Issue #91 | label/trace付きopen backlogは正常で、active blockerではない |

## 2. 検出して是正した齟齬

1. L0/L1の「不可逆なら停止」を、本番／高影響actionの実行直前だけaction-bound承認とする契約へ是正した。
   branch、staging、backup、rollbackで安全化できる診断・修正は自走する。
2. 「全Issueが即Reverse必須」を「実行へadmitされた全Issue」へ是正した。future Update backlogはactive化時に
   Reverse契約へ入る。

## 3. ユーザー判断が必要な未決事項

単一runtime時の`degraded_mode`だけが、Claude↔Codexの別family review必須指示と両立するか未確定である。
その他の候補は既存receiptと要件で解決済みのため質問しない。
