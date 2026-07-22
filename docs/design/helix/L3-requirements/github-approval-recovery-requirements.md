---
title: "GitHub要件承認・動的監査・Recovery要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: PO / TL
pair_artifact: docs/test-design/helix/github-approval-recovery-system-test-design.md
---

# GitHub要件承認・動的監査・Recovery要件定義

## 1. 目的と適用境界

本書はL3要件変更の人間承認境界、影響graphから導出する監査scope、DBとGitHub観測の不一致、main merge後の回帰を
fail-closeでRecoveryへ接続する。AI review、CI、doctorをユーザー承認の代替にせず、自動上書きで不一致を隠さない。

## 2. 機能要件

### GH-FR-020 要件承認・動的監査・Recovery優先

L3要件の追加または意味変更はユーザー承認を必須とする。承認前はDraftを維持し、承認receiptを要件revision、回答source、
current HEADへ束縛する。AI review、CI、doctor、過去snapshotの承認をcurrent revisionの承認として再利用しない。

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
| GH-AC-019 | L3要件の追加・意味変更はcurrent revision、回答source、HEADへ束縛されたユーザー承認receiptなしでfreezeまたはmergeできない |
| GH-AC-020 | changed Lから上下隣接・Vペア・trace consumerをversion管理graphで動的導出し、未知edge、cycle、未登録consumerを監査scopeから落とさない |
| GH-AC-021 | DB replayとGitHub再観測後も不一致なら自動上書きせずRecoveryへ遷移し、Performance Recoveryを通常開発より先にdispatchする |
| GH-AC-022 | main merge後Full verification失敗時は通常mergeを停止し、Recovery Issue、修正PR、独立review、doctor、GitHub Actions、Issue closureが同一修正HEADへ収束するまで解除しない |

## 5. freeze境界

本書はL3の承認・監査・Recovery契約だけを定義する。graph schema、replay transaction、merge stop、Issue dispatchの実装はL4以降へ降下し、
本PRでは実装または実行済みclosureを主張しない。
