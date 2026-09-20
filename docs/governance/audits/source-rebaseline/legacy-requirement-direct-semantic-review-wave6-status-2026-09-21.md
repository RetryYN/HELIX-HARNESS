---
title: "旧要求・旧asset直接semantic review wave 6状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 6状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 0、
`unresolved` 6である。wave 1〜5と合わせて17 unit、51 edgeをreview済みとし、edge pairは交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-FR-28-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 2 | `IRUNIT-HIL-FR-32-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 3 | `IRUNIT-HIL-FR-64-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |

FR-28は三段CI designを直接確認した。source候補はcandidate/base SHAとdeferred receiptを持つが、三段stageと
predecessor chainを実装しないため、部分候補のまま実装成立に数えない。

FR-32は要求状態列を持つlifecycle designを確認した。source候補は別の7状態receiptであり、共有stateとreceiptだけを
部分候補にした。要求のregistered、eligible、mustered、leased、checkpointed、verified、releasedは未確認である。

FR-64はworktree/scratch、authority path、network、scope auditの設計・sourceを部分確認した。一方、要求する推論APIの
host+path allowlistと旧sourceのnetwork denyは一致せず、CLI設定merge/appendとquarantine連結も未確認である。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-FR-28-HELIX-OS` | 3 | 3 | 3 | 0 | 2 | 1 | 0 |
| `IRUNIT-HIL-FR-32-HELIX-OS` | 3 | 3 | 3 | 0 | 3 | 0 | 0 |
| `IRUNIT-HIL-FR-64-HELIX-OS` | 7 | 7 | 4 | 0 | 3 | 4 | 2 |

## phaseと探索状態

| unit | phase | 現行phase状態 | 旧phase能力状態 | transition候補 |
|---|---|---|---|---|
| `IRUNIT-HIL-FR-28-HELIX-OS` | `PHCAP-11` | `candidate` | `implemented_with_workflow_and_test_design` | `degraded_to_candidate` |
| `IRUNIT-HIL-FR-32-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |
| `IRUNIT-HIL-FR-64-HELIX-OS` | `PHCAP-07` | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-64-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |

bounded searchはcatalog 4,020件を全件照合し、FR-28は19件、FR-32は29件、FR-64は564件を候補にした。
各unitで3件をreviewし、残る16件、26件、561件は未reviewである。phase表はcrosswalkの候補状態の転記であり、
要求単位の縮退確定ではない。

正規分解台帳にHELIX-Web／Web-OS unitは0件であるため、現行draftや近接assetからunitを新造していない。
残る201 unitは未着手である。consumer closure、要求採否、phase採否、製品owner判断、現行replacementは未確定で、
`new_build_allowed:false`を維持する。
