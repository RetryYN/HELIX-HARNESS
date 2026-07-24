---
title: "GitHub要件承認・動的監査・Recovery要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-23
updated: 2026-07-24
owner: PO / TL
pair_artifact: docs/test-design/helix/github-approval-recovery-system-test-design.md
---

# GitHub要件承認・動的監査・Recovery要件定義

## 1. 目的と適用境界

本書はL3要件変更の人間承認境界、影響graphから導出する監査scope、DBとGitHub観測の不一致、main merge後の回帰を
fail-closeでRecoveryへ接続する。AI review、CI、doctorをユーザー承認の代替にせず、自動上書きで不一致を隠さない。

## 2. 機能要件

### GH-FR-020 要件承認・動的監査・Recovery優先

要求、画面・モック、要件は相互遷移でき、要件定義で不足を検出した場合は要求判断または画面・モック判断へ差し戻す。
意味revisionは、証拠確認、AIによる齟齬先行修正、5問単位の認識合わせ、回答の正本への即時反映、未解決ゼロ監査、
全体revision提示、最終合意の順でユーザー承認を得る。承認だけを突然要求するpacketや、回答を未反映のまま次の質問へ進む運用を拒否する。

承認前でも非正本のreview proposalとしてDraft PRを作成できる。Draftのまま回答を正本へ反映し、
未解決ゼロ監査とcurrent revisionの承認receiptを要件revision、回答source、current HEADへ束縛する。
Ready化とmergeは必要な承認、独立AI-B review、CI、DB追従が揃った後だけ許可する。
AI review、CI、doctor、過去snapshotの承認をcurrent revisionの承認として再利用しない。

監査範囲は固定表へ埋め込まず、変更Lから上下隣接、対応Vペア、traceで到達するconsumerをversion管理された影響graphから導出する。
未知edge、cycle、未登録consumerがあればscopeを狭めずfail-closeする。

`harness.db`とGitHub観測が不一致の場合、同一HEADのevent replayによる隔離DB再構築とGitHub再観測を行う。なお不一致なら
自動上書きせずRecoveryへ遷移する。Performance Recoveryは通常開発より先にdispatchする。

main merge後Full verification失敗時は新規通常mergeを停止し、primary mode=`recovery`、trigger=`regression_dev`の修正Issueを起票する。
blocker特定、修正PR、修正主体と独立した別family review、doctor、GitHub Actionsを同一修正HEADへ束縛し、Issueをclosure receipt付きで
closeしてから通常merge停止を解除する。

## 3. 非機能要件

- `GH-NFR-012` Evolvability: layer監査scopeはversion管理されたgraph traversal policyとして拡張し、L追加、pair変更、consumer追加を固定分岐の編集なしで反映する。未知node/edge/schema versionは黙って除外せずfail-closeする。

## 4. 受入条件

| AC | 合格条件 |
|---|---|
| GH-AC-019 | 要求・モック・要件の相互遷移と差し戻し履歴を持ち、承認前は非正本Draft PRだけを許可する。証拠確認→AI齟齬修正→5問単位の認識合わせ→回答即時反映→未解決ゼロ監査→全revision提示→最終合意を経たcurrent revisionだけをReady化でき、別AI review・CI・DB追従後だけmergeできる |
| GH-AC-020 | changed Lから上下隣接・Vペア・trace consumerをversion管理graphで動的導出し、未知edge、cycle、未登録consumerを監査scopeから落とさない |
| GH-AC-021 | DB replayとGitHub再観測後も不一致なら自動上書きせずRecoveryへ遷移し、Performance Recoveryを通常開発より先にdispatchする |
| GH-AC-022 | main merge後Full verification失敗時は通常mergeを停止し、Recovery Issue、修正PR、独立review、doctor、GitHub Actions、Issue closureが同一修正HEADへ収束するまで解除しない |

## 5. freeze境界

本書はL3の承認・監査・Recovery契約だけを定義する。graph schema、replay transaction、merge stop、Issue dispatchの実装はL4以降へ降下し、
本PRでは実装または実行済みclosureを主張しない。
