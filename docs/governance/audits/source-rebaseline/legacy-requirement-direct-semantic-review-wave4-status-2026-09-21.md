---
title: "旧要求・旧asset直接semantic review wave 4状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 4状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 1、
`unresolved` 5である。wave 1〜3と合わせて11 unit、33 edgeをreview済みとし、edge pairは交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-BR-10-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 2 | `IRUNIT-HIL-BR-06-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 3 | `IRUNIT-HIL-BR-33-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |

BR-10にはcausation/correlation、因果順序、冪等取り込み、lifecycle transitionの設計と旧sourceがある。
これはcausality join atomの一部を扱うが、Issue、Reverse、Redesign、PLAN、commit、PR、CI、audit、memoryの
member集合とjoin切れ未完了判定、harness.db収束を確認しない。

BR-06にはordered Issue gate設計とcurrent HEAD review admission／merge read-afterの旧sourceがある。
merge遷移の一部は静的に対応するが、Admission、Reverse Evidence、Redesign、Scope、Implementation Entry、Closureの
全gateとready／implement／close consumerは未確認である。HARNESSとの共有spanのowner判断も保留する。

BR-33にはrelease publishをaction-binding approvalとdry-runまで止めるADRとdecision sourceがある。
ADRは承認境界の設計部分証拠である。decision sourceは実cutoverを扱わないため隣接sourceとして棄却し、
配布surfaceの実切替、publish、promotion、rollbackの成立証拠にはしない。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-BR-10-HELIX-OS` | 3 | 3 | 1 | 0 | 1 | 2 | 2 |
| `IRUNIT-HIL-BR-06-HELIX-OS` | 2 | 2 | 2 | 0 | 1 | 1 | 0 |
| `IRUNIT-HIL-BR-33-HELIX-OS` | 1 | 1 | 1 | 0 | 0 | 1 | 0 |

## phaseと探索状態

| unit | phase | 現行phase状態 | 旧phase能力状態 | transition候補 |
|---|---|---|---|---|
| `IRUNIT-HIL-BR-10-HELIX-OS` | `PHCAP-09` | `candidate` | `documented_candidate` | `degraded_to_rederived_candidate` |
| `IRUNIT-HIL-BR-06-HELIX-OS` | `PHCAP-13` | `operating_contract_only` | `implemented_with_draft_system_test_design` | `degraded_to_manual_operating_contract` |
| `IRUNIT-HIL-BR-33-HELIX-OS` | `PHCAP-14` | `requirement_candidate` | `implemented_partial_with_test_design` | `degraded_to_candidate` |

bounded searchはcatalog 4,020件を全件照合し、BR-10は20件、BR-06は27件、BR-33は46件を候補にした。
各unitで3件をreviewし、残る17件、24件、43件は未reviewである。phase表のtransition候補はcrosswalkの
phase capability状態の転記であり、要求単位の縮退確定ではない。

残る207 unitは未着手である。consumer closure、要求採否、phase採否、製品owner判断、現行replacementは未確定で、
`new_build_allowed:false`を維持する。
