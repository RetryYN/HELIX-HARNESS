---
title: "旧要求・旧asset直接semantic review wave 7状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 7状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 3、
`unresolved` 3である。wave 1〜6と合わせて20 unit、60 edgeをreview済みとし、edge pairは交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-BR-20-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 2 | `IRUNIT-HIL-FR-29-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 3 | `IRUNIT-HIL-NFR-16-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |

3 unitは旧`HOT-HIL-28`の同じCI quarantine能力に接続する。BR-20は業務条件、FR-29は機能、NFR-16は
適用制約を保持する別の要求identityであり、採否や後継要求を生成せずunit別edgeとして照合した。BR-20のminimum gate
spanはHARNESS unitとも共有されるため、製品境界判断待ちを維持する。

L5 designはcheck、exact fingerprint、baseline、owner、期限、minimum gate、失効と証拠を具体化する。一方、最も近い
sourceの`DeferredQuarantine`はdeferred obligationのowner、expiry、replacement oracleを検査する別概念であり、CI failureの
fingerprint、baseline、check scope、minimum gate、application receiptを持たない。3件のsource edgeは直接linkを`rejected`とした。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-BR-20-HELIX-OS` | 3 | 3 | 3 | 0 | 0 | 3 | 0 |
| `IRUNIT-HIL-FR-29-HELIX-OS` | 4 | 4 | 4 | 0 | 0 | 4 | 0 |
| `IRUNIT-HIL-NFR-16-HELIX-OS` | 3 | 3 | 3 | 0 | 0 | 3 | 0 |

## phaseと探索状態

| unit | phase | 現行phase状態 | 旧phase能力状態 | transition候補 |
|---|---|---|---|---|
| `IRUNIT-HIL-BR-20-HELIX-OS` | `PHCAP-11` | `candidate` | `implemented_with_workflow_and_test_design` | `degraded_to_candidate` |
| `IRUNIT-HIL-FR-29-HELIX-OS` | `PHCAP-11` | `candidate` | `implemented_with_workflow_and_test_design` | `degraded_to_candidate` |
| `IRUNIT-HIL-NFR-16-HELIX-OS` | `PHCAP-11` | `candidate` | `implemented_with_workflow_and_test_design` | `degraded_to_candidate` |

bounded searchはcatalog 4,020件を全件照合し、BR-20は116件、FR-29は17件、NFR-16は120件を候補にした。
各unitで3件をreviewし、残る113件、14件、117件は未reviewである。phase表はcrosswalkの候補状態の転記であり、
exact source spanの成立や要求単位の縮退確定ではない。

正規分解台帳にHELIX-Web／Web-OS unitは0件であるため、現行draftや近接assetからunitを新造していない。
残る198 unitは未着手である。consumer closure、要求採否、phase採否、製品owner判断、現行replacementは未確定で、
`new_build_allowed:false`を維持する。
