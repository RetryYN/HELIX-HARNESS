---
feature_ticket_id: FT-OS-REVIEWHANDOFF-001
title: "共通ルール参照とVS Code GUIレーン間通知"
product_target: HELIX-OS
state: proposed_upstream_waiting
authority_effect: work_projection_only
created: 2026-09-20
primary_role: progression
priority_order: 11
parent_requirements: [HELIXOS-L2-003, HELIXOS-L2-004, HELIXOS-L2-007, HELIXOS-L2-010]
acceptance_source: docs/helix-os/L11-acceptance/governance-acceptance.md
depends_on: [FT-OS-REQREG-001]
github_projection:
  issue: 1884
  url: https://github.com/RetryYN/HELIX-HARNESS/issues/1884
  projection_receipt_ref: docs/governance/audits/source-rebaseline/github-review-handoff-projection-2026-09-20.md
  read_after_state: OPEN
related_parent_issue: 1864
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

## 正式Featureのscopeと停止条件

このticketは正式な共通規則参照・通知経路の要求候補を整理する。`proposed_upstream_waiting`のため、正式な設計・実装・runtime起動は開始しない。
parent_requirementsは未承認L2候補への接続であり、承認済み親Concept／L1からの具体化を待つ。GitHub番号は親要求identityではない。
仮組みSCF-B-0003は別identityであり、本ticketを起動許可に使わない。
既存GUIへ接続する操作scope・原文・実装判断は[別記録](../audits/source-rebaseline/gui-handoff-operation-scope-2026-09-20.md)、仮組み契約は[README](../../../scaffold/review-handoff/README.md)へ分離する。

## Issue接続と責務

- #1864: GitHub上の関連親Issue。旧レーン設定の11論点の引継ぎを残す。本作業でcloseしない。
- #1859: context、依頼scope、将来の起動・隔離。
- #1860: exact HEADの指摘返却と修正後の再review。
- #1866: 仮設の置換・撤去。正式側への対応確認までcloseしない。
- #1812: 将来のGitHub配送とread-after。今回のtoolは外部へ送信しない。

## authority境界

仮組みの合格や実GUIのACKから正式Featureの採否・承認・受入を生成しない。
旧CLI・旧hook・旧runtimeは起動しない。Issue／PR作成からmerge・Issue close・別通路のreviewer起動を推定しない。

## 後続と置換

L2／L11採否→L3／L10で正式なcontext・配送・応答照合を導出する。
正式側へ役割・義務・接続・検査・否定例を移し、#1866でcheck-replacement→retireを行う。
GitHubへの投影source commitとdigestはIssue本文および別の投影receiptへ記録し、本文に自己commit SHAを埋め込まない。

## 2026-09-20 scaffold merge後の状態

PR #1885はmerge commit `3a00732031d78f2e19b98b6da39ca317f691bdc2`でmainへ統合された。成立したのは`authority_effect: none`のSCF-B-0003だけであり、本ticket、親要求、L3／L10、受入、CI、運用成立は生成していない。
merge完了応答の受領後、初回consumer接続は契約どおり撤去し、Claude／Codexの所有hook 0件と一時worktree削除を確認した。

利用者の後続指示「それで進めて」は、期限付きGUI経路を復旧しながら正式化を進める作業指示として扱う。再接続はSCF-B-0003の別revisionであり、現在boot内・2026-09-21 23:59 JST・再接続revisionのPR merge/close・停止指示・正式経路への置換のうち最早時点までに限定する。正式Featureの採否・実装許可には使わない。
