---
title: "旧要求・旧asset直接semantic review wave 2 premise packet"
status: research_premise_candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 2 premise packet

## 判断論点

製品別に分解したScope Gate要求とOSのintake正規化要求について、候補assetのどこまでが直接契約または静的実装証拠であり、旧実装不明、現行未成立、phase縮退、consumer未確認をどこから分けるべきか。

## 前提台帳

| 状態 | 内容 | 扱い |
|---|---|---|
| known | `HIL-FR-06`の同一ID sourceはHARNESS 5 atom、OS 3 atomを逐語保持する | 契約被覆に限定し、実装被覆に算入しない |
| known | `requirement-discovery.ts`はhuman actor／agreement後のL3 compileを強制する | scope authorityの一部としてunresolvedに置き、Scope Gate全体やconsumer成立を主張しない |
| known | PHCAP-02は旧能力を`implemented_with_tests`と分類する | phase能力の状態として保持し、`HIL-BR-12`個別unitへ転記しない |
| known | `requirement-intake-lifecycle.ts`はscreen台帳adapterのpermanent／replaceable／retireを検査する | GitHub／user ingress正規化とは別機能としてrejectする |
| assumption | phase候補poolは次に読むassetを絞る検索入口になる | membership自体をsemantic edgeへ昇格させない |
| unknown | Scope Gateの全atomを実装し実diffと接続する旧consumer chain | consumer、test、receiptを後続で追う |
| unknown | BR-12のCI event、ユーザー差し込みIssue／PLANを同一contractへ収束させる旧実装 | pool内外のsymbol／call chainをbounded searchする |
| unknown | 3 unitの現行正式replacement | 現行は`not_established`を維持する |
| conflict | phase能力の広い`implemented_with_tests`と、BR-12選定実装assetの非該当 | phaseと個別要求の状態軸を分離して保持する |
| stale | 親revision、crosswalk、asset catalog、archive manifest、wave 1 ledgerのいずれかが変わる | metadata digest不一致で停止し再reviewする |

## 結論と限界

直接confirmedできたのは`HIL-FR-06`の製品別契約edge 2件である。静的実装confirmedは0件で、3 unitとも旧要求実装状態は`unknown_pending_direct_implementation_and_consumer_review`、現行は`not_established`、consumer closureは`pending`とする。

このpacketは9 edgeの直接semantic reviewと後続探索順にだけ適用する。phase能力、設計文書、test sourceの存在から個別要求の実装、動作、受入、再利用可否を生成しない。

## 再調査条件と返却先

親revision、製品境界、crosswalk、asset catalog、archive manifest、wave 1 ledgerが変わる場合、またはconsumer call chain、verification、current replacement、pool外の反証が見つかった場合に再調査する。結果は親Issue #1888と対応するPHCAP-02／04／07の調査へ返す。個別要求の採否は対象revision付き人間decisionへ分離する。
