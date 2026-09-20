---
title: "旧要求・旧asset直接semantic review wave 5状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 5状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 4、
`unresolved` 2である。wave 1〜4と合わせて14 unit、42 edgeをreview済みとし、edge pairは交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-BR-05-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 2 | `IRUNIT-HIL-BR-17-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 3 | `IRUNIT-HIL-BR-22-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |

BR-05はRedesign/Retrofit routeとconsumer gateの設計を持つが、audit trigger、再freeze、実装entryのconsumer closureは確認できない。
refactor候補scannerは要求作用を直接担わないため棄却した。

BR-17のcurrent PR review admissionとreview lane closureはreview経路の近接assetであるが、finding disposition、writer返却、
`successor_issue`、後続Issue再流入禁止を定義・実装しないため両方を棄却した。

BR-22はRequirement JSONからDesign Template、Design Instance、pair graphへ至る設計flowを持つ。これはtemplate接続の
部分証拠だが、設計義務の原子的生成・消込とclosed-set完全性は未確認である。requirements binding設定schemaは棄却した。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-BR-05-HELIX-HARNESS` | 3 | 3 | 1 | 0 | 0 | 3 | 2 |
| `IRUNIT-HIL-BR-17-HELIX-HARNESS` | 8 | 8 | 0 | 0 | 0 | 8 | 8 |
| `IRUNIT-HIL-BR-22-HELIX-HARNESS` | 4 | 4 | 1 | 0 | 0 | 4 | 3 |

## phaseと探索状態

| unit | phase | 現行phase状態 | 旧phase能力状態 | transition候補 |
|---|---|---|---|---|
| `IRUNIT-HIL-BR-05-HELIX-HARNESS` | `PHCAP-18` | `requirement_candidate` | `implemented_with_tests` | `degraded_to_candidate` |
| `IRUNIT-HIL-BR-17-HELIX-HARNESS` | `PHCAP-12` | `scaffold_operating` | `implemented_with_tests` | `degraded_to_operating_contract_and_gui_scaffold` |
| `IRUNIT-HIL-BR-22-HELIX-HARNESS` | `PHCAP-03` | `candidate` | `implemented_partial` | `degraded_to_candidate` |
| `IRUNIT-HIL-BR-22-HELIX-HARNESS` | `PHCAP-06` | `candidate_only` | `documented_with_implementation_assets` | `degraded_to_candidate` |

bounded searchはcatalog 4,020件を全件照合し、BR-05は86件、BR-17は44件、BR-22は27件を候補にした。
各unitで3件をreviewし、残る83件、41件、24件は未reviewである。phase表はcrosswalkの候補状態の転記であり、
要求単位の縮退確定ではない。

正規分解台帳にHELIX-Web／Web-OS unitは0件であるため、現行draftや近接assetからunitを新造していない。
残る204 unitは未着手である。consumer closure、要求採否、phase採否、製品owner判断、現行replacementは未確定で、
`new_build_allowed:false`を維持する。
