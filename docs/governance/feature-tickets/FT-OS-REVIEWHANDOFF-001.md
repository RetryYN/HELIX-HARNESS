---
feature_ticket_id: FT-OS-REVIEWHANDOFF-001
title: "共通ルール参照とVS Code GUIレーン間通知"
product_target: HELIX-OS
state: proposed_upstream_waiting
authority_effect: work_projection_only
created: 2026-09-20
parent_issue: 1864
related_issues: [1859, 1860, 1866, 1812]
scaffold_binding: SCF-B-0003
---

# FT-OS-REVIEWHANDOFF-001

## 目的と親

同じVS CodeのClaude Code拡張とCodex拡張の既存セッション間で、実行レーンとレビュー／マージレーンの依頼・指摘返却を通知する。両者が同じ版の規則とreview対象を参照する。
親はConcept v4.1とHELIXOS-L1-002／003／004／008／009。
exact revisionは[調査記録](../audits/source-rebaseline/rule-review-handoff-investigation-2026-09-20.md)と
[承認record](../decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)へ束縛する。
接続候補はHELIXOS-L2-003／004／007／010と対応L11であり、このticketから採否・正式実装許可を生成しない。

## 今回の作業scope

ユーザーの調査・Issue接続・PR・仮組みの依頼を作業scopeとして保持する。要求承認のdecision recordではない。
ユーザーが同じVS Codeの両拡張を通知先として明示し、GUI通知経路によるレーン連携へscopeを訂正した。
現在の作業入口の仮組み許容に従い、SCF-B-0003として次を置く。

- 現行規則、decision record、候補参照を種別・revision付きで共有するパケット。
- Claude→Codex／Codex→Claudeの依頼・応答対応を静的に検査する道具。
- 期限付きレーンbinding、永続通知箱、重複抑止、claim、GUI側の明示ACK、応答の逆方向配送。
- Claude Stop asyncRewakeとCodex同期Stopのnative hook接続。新しいproviderセッションは起動しない。
- 利用者設定への最小hook登録／撤去（無関係な設定・hook trust・権限は変更しない）。
- 調査根拠、否定例、transport試験と実GUI受信確認の区別。

正式なFeatureは`proposed_upstream_waiting`のまま。仮組みは別identity（SCF-B-0003）で、正式Featureの実装完了へ算入しない。
詳細は[仮組みREADME](../../../scaffold/review-handoff/README.md)。

## Issue接続と責務

- #1864: 親。旧レーン設定の11論点の引継ぎを残す。本作業でcloseしない。
- #1859: context、依頼scope、将来の起動・隔離。
- #1860: exact HEADの指摘返却と修正後の再review。
- #1866: 仮設の置換・撤去。正式側への対応確認までcloseしない。
- #1812: 将来のGitHub配送とread-after。今回のtoolは外部へ送信しない。

## 一時検証と停止条件

パケットの参照集合欠落、改変、stale SHA、候補の規則化、同一runtime、別依頼への応答、未確認を指摘なしとする入力を拒否する。
検査合格は`scaffold`証拠だけ。別processのtransport往復とnative hook形式を検査する。実GUIでの両方向ACKは別に記録し、未取得の間はGUI連携完了を主張しない。本人性の暗号学的証明、意味review、正式受入、merge admissionは未判定。
旧CLI・旧hook・旧runtimeは起動しない。AGENTS／CLAUDE本文は変更しない。
今回許可された作用は既存VS Code GUIセッションへの通知と受信確認。利用者settingsに新設hookの参照だけを追加する。
別CLI／API／Workerの起動、GitHub review起動、merge実行はこのscopeに含めない。
Codexのhook trustはprovider側の利用者確認を尊重し、自動設定しない。レーン未登録・受信側不在・期限切れでは通知を受信済みにしない。
Issue／PR作成の許可からreviewer起動、merge、Issue closeを推定しない。

## 後続と置換

L2／L11採否→L3／L10で正式なcontext・配送・応答照合を導出する。
正式側へ役割・義務・接続・検査・否定例を移し、#1866でcheck-replacement→retireを行う。
GitHubへの投影source commitとdigestはIssue本文および別の投影receiptへ記録し、本文に自己commit SHAを埋め込まない。
