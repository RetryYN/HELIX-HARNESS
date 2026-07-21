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

## 2. 目的達成に必要な定義補正

1. L0/L1の「不可逆なら停止」を、本番／高影響actionの実行直前だけaction-bound承認とする契約へ是正した。
   branch、staging、backup、rollbackで安全化できる診断・修正は自走する。
2. 「全Issueが即Reverse必須」を「実行へadmitされた全Issue」へ是正した。future Update backlogはactive化時に
   Reverse契約へ入る。

## 3. 追加確定

reviewは反対familyを前提にせず、AI-A（作成・修正）とAI-B（監査・merge判断）の2実行主体を常用する。
family/providerは不問、identity/session/contextを分離し、単一AI fallbackと`degraded_mode`は持たない。

## 4. 全文再監査の訂正記録

2026-07-22 の全文検索では関連語を含む行を702行検出した。これは702件の要件矛盾を意味しない。
検索結果を次の4分類で扱い、現行正本の矛盾だけを是正対象とする。

1. **現行定義の不足**: L1業務要求、L4基本設計、agent-team規約、PR監査テスト設計に残った
   family/provider中心の独立性判定を、やりたい運用を成立させるAI-A/AI-Bのidentity/session/context分離へ置換する。
2. **実装追従が必要**: `src/runtime/detect.ts` 等に残る`intra_runtime_subagent`縮退と
   family差を前提にした判定は、L7実装で新契約へ移行しなければならない。要件・設計だけのgreenで
   実装追従済みとは扱わない。
3. **互換識別子**: schema field、error code、既存APIの`cross_runtime`等は名称だけで矛盾と判定せず、
   semantic contractを検査する。改名が必要なら互換migrationを別途束縛する。
4. **履歴証跡**: confirmed PLANの過去receipt・review記録は改竄しない。現行directiveによりsupersededと
   判定した旨を追記し、当時の証跡本文を一括置換しない。

監査の合格条件は旧文言との無矛盾ではなく、VモデルとProduction Scrumの両delivery engineで、二主体review、
同一HEAD、文脈、DB追従、CI、merge判断が実際に閉じることである。したがって、以前の「未解消なし」という
記載・報告は誤りである。現時点の残件はL7 runtime/gate/team実装と
その回帰テストであり、これを閉じるまで二主体契約の機械適用完了を主張しない。
