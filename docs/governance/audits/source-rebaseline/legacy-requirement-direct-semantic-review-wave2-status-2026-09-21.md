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
| HELIX-HARNESS | `IRUNIT-HIL-FR-06-HELIX-HARNESS` | 契約一致1、非該当1、scope authority部分一致1 | `unknown_pending_direct_implementation_and_consumer_review` | `not_established` | 旧実装自体が不明のため未判定 |
| HELIX-OS | `IRUNIT-HIL-FR-06-HELIX-OS` | 契約一致1、非該当1、scope authority部分一致1 | `unknown_pending_direct_implementation_and_consumer_review` | `not_established` | 旧実装自体が不明のため未判定 |
| HELIX-OS | `IRUNIT-HIL-BR-12-HELIX-OS` | intake設計部分一致1、非該当2 | `unknown_pending_direct_implementation_and_consumer_review` | `not_established` | phase能力の実装状態を個別要求へ転記せず未判定 |

## 製品分離

`HIL-FR-06`のmigration sourceは一つだが、HARNESS unitはderivation guardとviolation outputを含む5 atom、OS unitはscope authority、diff trace、子Issue継承の3 atomを保持する。契約sourceの同一性から両製品の実装ownerを一つに戻さない。

`requirement-discovery.ts`はhuman actorとcurrent human agreementを強制するためscope authorityの一部に近い。OS候補とは整合するがScope Gate、diff trace、子Issue継承を閉じず、HARNESS側ではさらに製品候補外である。両edgeを`unresolved`に留めた。

## phaseと実装状態

| unit | phase | 現行phase状態 | 旧phase能力 | transition |
|---|---|---|---|---|
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | PHCAP-04 | `draft_containers` | `documented_with_runtime_support` | `degraded_to_unapproved_routing_containers` |
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | PHCAP-07 | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-06-HELIX-OS` | PHCAP-04 | `draft_containers` | `documented_with_runtime_support` | `degraded_to_unapproved_routing_containers` |
| `IRUNIT-HIL-BR-12-HELIX-OS` | PHCAP-02 | `candidate_with_partial_current_registry` | `implemented_with_tests` | `degraded_to_candidate_and_static_registry` |

PHCAP-02の旧能力にはL6とL7 implementation/testの証拠がある。しかし、今回読んだ代表実装`requirement-intake-lifecycle.ts`はscreen台帳adapterのlifecycle fenceであり、BR-12のGitHub／ユーザーintake正規化ではない。phase能力と個別要求の実装状態を分け、BR-12を旧実装済みにしない。

## atom coverage receipt

| unit | atom総数 | 契約confirmed | 実装confirmed | 実装unresolved | 実装未被覆 |
|---|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | 5 | 5 | 0 | 1 | 4 |
| `IRUNIT-HIL-FR-06-HELIX-OS` | 3 | 3 | 0 | 1 | 2 |
| `IRUNIT-HIL-BR-12-HELIX-OS` | 6 | 0 | 0 | 0 | 6 |

FR-06のcontract被覆は同一要求IDの非実行source snapshotによる。BR-12の設計部分一致は、GitHub Issue／PRと共通Issue contractの関係を示すが、CI event、ユーザー差し込みIssue／PLANを閉じず、設計を実装被覆へ算入しない。

## 残る集合

今回reviewしたedgeを各phase候補poolから除いた未review集合は次のとおりである。exact asset ID集合のdigestはmetadataへ固定する。

| unit | 未review候補edge |
|---|---:|
| `IRUNIT-HIL-FR-06-HELIX-HARNESS` | 331 |
| `IRUNIT-HIL-FR-06-HELIX-OS` | 55 |
| `IRUNIT-HIL-BR-12-HELIX-OS` | 39 |

残る213 unitは未着手である。30件のdirect-phase-unresolved unitは候補poolが空であり、「旧実装なし」を意味しないため、本ledgerとは別のbounded global searchとして扱う。

## 検証と次作業

verifierは9 edge、14 atom、引用bytes、archive manifest、catalog join、製品別source span、phase状態、wave 1との非重複、累積件数、未review集合を再計算する。設計relationの実装偽装、phase能力から個別要求への実装過大転記、status文書のphase drift、累積edge件数driftを個別に欠陥注入し、すべて拒否した後に元bytesへ戻して再合格した。旧runtime、旧test、旧hook、旧CI、旧adapterは実行していない。

次waveでは今回の未review集合からconsumer、verification、call chainを優先し、direct-phase-unresolved queueはpool外探索の検索範囲と否定結果を別overlayへ固定する。unit全atom、consumer、acceptance、current差分が閉じるまで実装済みやnew build許可へ昇格しない。
