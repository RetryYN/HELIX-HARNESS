---
feature_ticket_id: FT-OS-REVIEWHANDOFF-001
title: "共通ルール参照とClaude／Codex review引継ぎ"
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

両runtimeが同じ版の規則と同じreview対象を参照し、依頼・指摘・修正の取り違えを減らす。
親はConcept v4.1とHELIXOS-L1-002／003／004／008／009。
exact revisionは[調査記録](../audits/source-rebaseline/rule-review-handoff-investigation-2026-09-20.md)と
[承認record](../decisions/concept-v4.1-and-four-l1-approval-2026-09-17.md)へ束縛する。
接続候補はHELIXOS-L2-003／004／007／010と対応L11であり、このticketから採否・正式実装許可を生成しない。

## 今回の作業scope

ユーザーの調査・Issue接続・PR・仮組みの依頼を作業scopeとして保持する。要求承認のdecision recordではない。
現在の作業入口の仮組み許容に従い、SCF-B-0003として次だけを置く。

- 現行規則、decision record、候補参照を種別・revision付きで共有するパケット。
- Claude→Codex／Codex→Claudeの依頼・応答対応を静的に検査する道具。
- 調査根拠、否定例、実通信未検証の表示。

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
検査合格は`scaffold`証拠だけ。実通信、本人性、意味review、正式受入、merge admissionは未判定。
旧CLI・旧hook・旧runtimeは起動しない。AGENTS／CLAUDE／settingsを変更しない。
Claude／CodexのCLI・API・IDE・Worker・GitHub review起動経路は、経路と作用が明示許可されるまで停止する。
Issue／PR作成の許可からreviewer起動、merge、Issue closeを推定しない。

## 後続と置換

L2／L11採否→L3／L10で正式なcontext・配送・応答照合を導出する。
正式側へ役割・義務・接続・検査・否定例を移し、#1866でcheck-replacement→retireを行う。
GitHubへの投影source commitとdigestはIssue本文および別の投影receiptへ記録し、本文に自己commit SHAを埋め込まない。
