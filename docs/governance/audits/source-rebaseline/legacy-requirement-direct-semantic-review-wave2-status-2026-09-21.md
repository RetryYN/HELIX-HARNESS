---
title: "旧要求・旧asset直接semantic review wave 2状況"
status: candidate_incomplete
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 2状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 2、`rejected` 4、`unresolved` 3である。wave 1と合わせて5 unit、15 edgeをreview済みとし、両waveのedge集合は交差しない。

| 製品 | unit | review結果 | 旧要求実装状態 | 現行状態 | 縮退判定 |
|---|---|---|---|---|---|
| HELIX-HARNESS | `IRUNIT-HIL-FR-06-HELIX-HARNESS` | 契約一致1、非該当1、隣接挙動・atom対応なし1 | `unknown_pending_direct_implementation_and_consumer_review` | `not_established` | 旧実装自体が不明のため未判定 |
| HELIX-OS | `IRUNIT-HIL-FR-06-HELIX-OS` | 契約一致1、非該当1、隣接挙動・atom対応なし1 | `unknown_pending_direct_implementation_and_consumer_review` | `not_established` | 旧実装自体が不明のため未判定 |
| HELIX-OS | `IRUNIT-HIL-BR-12-HELIX-OS` | intake設計部分一致1、非該当2 | `unknown_pending_direct_implementation_and_consumer_review` | `not_established` | phase能力の実装状態を個別要求へ転記せず未判定 |

## 製品分離

`HIL-FR-06`のmigration sourceは一つだが、HARNESS unitは5 atom、OS unitは3 atomを保持する。Scope Gate入力、diff trace、子Issue継承の3 atomは両unitで同一原文を共有し、すべて`product_boundary_pending_human_decision`である。HARNESSだけが持つderivation guardとviolation outputの2 atomは製品固有候補である。OS unitは共有atomだけで構成され、契約sourceの被覆からOS owner確定や排他的な製品分割を生成しない。

`HIL-BR-12`の入力源3 atomはOS固有候補だが、「同じintake契約へ正規化する」atomはHARNESSの分類規則とOSのGitHub event受付を接続する共有spanである。このatomも`product_boundary_pending_human_decision`を維持し、OS単独ownerへ確定しない。

`requirement-discovery.ts`はhuman actorとcurrent human agreementを強制するが、FR-06の5 atom／3 atomには人間承認atomがない。allowed changes、non-goals、capability budgetも検査しないため、直接対応atomは0のまま、phase／product上の隣接実装として両製品edgeを`unresolved`に保った。

## phaseと実装状態

| unit | phase | 現行phase状態 | 旧phase能力 | transition |
|---|---|---|---|---|
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | PHCAP-04 | `draft_containers` | `documented_with_runtime_support` | `degraded_to_unapproved_routing_containers` |
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | PHCAP-07 | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-06-HELIX-OS` | PHCAP-04 | `draft_containers` | `documented_with_runtime_support` | `degraded_to_unapproved_routing_containers` |
| `IRUNIT-HIL-BR-12-HELIX-OS` | PHCAP-02 | `candidate_with_partial_current_registry` | `implemented_with_tests` | `degraded_to_candidate_and_static_registry` |

PHCAP-02の旧能力にはL6とL7 implementation/testの証拠がある。しかし、今回読んだ代表実装`requirement-intake-lifecycle.ts`はscreen台帳adapterのlifecycle fenceであり、BR-12のGitHub／ユーザーintake正規化ではない。phase能力と個別要求の実装状態を分け、BR-12を旧実装済みにしない。

## atom coverage receipt

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 全証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | 5 | 5 | 0 | 0 | 0 | 5 | 0 |
| `IRUNIT-HIL-FR-06-HELIX-OS` | 3 | 3 | 0 | 0 | 0 | 3 | 0 |
| `IRUNIT-HIL-BR-12-HELIX-OS` | 6 | 0 | 3 | 0 | 0 | 6 | 3 |

FR-06のcontract被覆は同一要求IDの非実行source snapshotによる。共有atom 3件の製品境界は未決であり、contract被覆完了と製品境界解決を別fieldにした。BR-12はstable ID A01〜A06を維持し、A01、A02、A06を設計partial、A03、A04、A05を全証拠なしとする。A06はHARNESSとの共有span、A01〜A05はOSのexclusive候補である。すべてのatomは`product_boundary_pending_human_decision`を保持し、shared／exclusiveのexact setで区別する。設計partialを実装被覆へ算入せず、全証拠なしとも区別する。

## 残る集合

今回reviewしたedgeを各phase候補poolから除いた未review集合は次のとおりである。exact asset ID集合のdigestはmetadataへ固定する。

| unit | 未review候補edge |
|---|---:|
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | 331 |
| `IRUNIT-HIL-FR-06-HELIX-OS` | 55 |
| `IRUNIT-HIL-BR-12-HELIX-OS` | 39 |

残る213 unitは未着手である。30件のdirect-phase-unresolved unitは候補poolが空であり、「旧実装なし」を意味しないため、本ledgerとは別のbounded global searchとして扱う。

## 検証と次作業

verifierは9 edge、14 atom、引用bytes、archive manifest、catalog join、製品別source span、shared overlap、設計partial／全証拠なし集合、phase状態、wave 1との非重複、累積件数、未review集合を再計算する。設計relationの実装偽装、phase能力から個別要求への実装過大転記、status文書のphase drift、累積edge件数driftを個別に欠陥注入し、すべて拒否した後に元bytesへ戻して再合格した。旧runtime、旧test、旧hook、旧CI、旧adapterは実行していない。

次waveでは今回の未review集合からconsumer、verification、call chainを優先し、direct-phase-unresolved queueはpool外探索の検索範囲と否定結果を別overlayへ固定する。unit全atom、consumer、acceptance、current差分が閉じるまで実装済みやnew build許可へ昇格しない。
