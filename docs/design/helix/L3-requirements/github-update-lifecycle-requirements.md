---
title: "GitHub Update lifecycle要件定義"
layer: L3
kind: add-design
status: draft
created: 2026-07-23
updated: 2026-07-23
owner: PO / TL
pair_artifact: docs/test-design/helix/github-update-lifecycle-system-test-design.md
---

# GitHub Update lifecycle要件定義

## 1. 目的と適用境界

本書は将来改善を表すUpdate Issueを、Feature、Recovery、Incidentから分離して長期backlogとして追跡するlabel、priority、trace、
activation、closure契約を定義する。正常なopen Updateをactive blockerや異常放置へ誤算入しない。

## 2. 機能要件

### GH-FR-022 Update Issueのlabel lifecycle

Update Issueはopenのまま残ることを正常状態とし、`update`、lifecycle、priority、area、関連requirement/PLAN/Issue traceで分類する。
`state:backlog`かつ`priority:future`は現行freeze/implementationのactive blockerへ数えず、scope消失とも扱わない。

active化時はpriority、対象requirement、PLAN、acceptance、再開条件を更新し、完了時だけclosure receipt付きPRでcloseする。
label欠落、相互矛盾state、trace欠落、期限付きdeferの期限超過をreconcile findingとする。

UpdateはFeatureへ種類変更しない。正本へ取り込む場合もUpdate identityとdecision historyを保持してForwardまたはProduction Scrum PLANへ接続する。
実装上の問題はRecovery、操作・環境・外部serviceのtroubleはIncidentへexactly oneで分類する。

priorityは`P0`（main復旧、security、data integrity）、`P1`（開発速度基盤、早期実証Feature）、`P2`（通常Feature）、
`P3`（Update）を正本とする。依存解放による繰上げはdependency edgeと根拠receiptを必須にする。

## 3. 受入条件

| AC | 合格条件 |
|---|---|
| GH-AC-029 | open Updateが`update`、lifecycle、priority、area、traceを持てば正常backlogとして表示され、active blockerや異常openへ誤算入されない |
| GH-AC-030 | P0〜P3がIssue種別・依存根拠と整合し、実装問題がRecovery、操作troubleがIncidentへexactly oneで分類され、UpdateがFeatureへ種類変更されない |

## 4. freeze境界

本書はUpdate lifecycleのL3契約だけを定義する。Issue Form、label reconciler、DB projection、priority dispatcherの実装はL4以降へ降下する。
