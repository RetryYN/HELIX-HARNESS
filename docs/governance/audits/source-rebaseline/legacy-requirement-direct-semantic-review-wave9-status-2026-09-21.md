---
title: "旧要求・旧asset直接semantic review wave 9状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 9状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 0、
`unresolved` 6である。wave 1〜8と合わせて26 unit、78 edgeをreview済みとし、edge pairは交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-FR-60-HELIX-OS` | HELIX-OS | `unknown_pending_direct_asset_semantic_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 2 | `IRUNIT-HIL-FR-61-HELIX-OS` | HELIX-OS | `unknown_pending_direct_asset_semantic_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 3 | `IRUNIT-HIL-FR-62-HELIX-OS` | HELIX-OS | `unknown_pending_direct_asset_semantic_review` | `not_established` | `unresolved_legacy_implementation_unknown` |

要求snapshotは同一ID・同一sourceの契約だけを`confirmed`とした。FR-60のdesign/implementationはallowlist、worker/verifier
分離の部分候補、FR-61のdesign/implementationは候補runtimeの事前bench契約の部分候補、FR-62のdesign/implementationは
実task scorecardではなくcost/admissionの部分候補である。designとimplementationは全て`unresolved`、未実行であり、
旧実装成立、consumer closure、現行replacementは確定しない。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-FR-60-HELIX-OS` | 5 | 5 | 2 | 0 | 2 | 3 | 3 |
| `IRUNIT-HIL-FR-61-HELIX-OS` | 3 | 3 | 2 | 0 | 1 | 2 | 1 |
| `IRUNIT-HIL-FR-62-HELIX-OS` | 5 | 5 | 1 | 0 | 2 | 3 | 3 |

## phaseと探索状態

| unit | phase | 現行phase状態 | 旧phase能力状態 | transition候補 |
|---|---|---|---|---|
| `IRUNIT-HIL-FR-60-HELIX-OS` | `PHCAP-07` | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-60-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |
| `IRUNIT-HIL-FR-61-HELIX-OS` | `PHCAP-07` | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-61-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |
| `IRUNIT-HIL-FR-62-HELIX-OS` | `PHCAP-07` | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-62-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |

bounded searchはcatalog 4,020件を全件照合し、FR-60は2,166件、FR-61は53件、FR-62は22件を候補にした。
各unitで3件をreviewし、残る2,163件、52件、21件は未reviewである。候補pool membershipはsemantic linkではない。
phase表はcrosswalk候補の転記であり、要求単位の縮退確定ではない。

正規分解台帳にHELIX-Web／Web-OS unitは0件である。残る192 unitは未着手である。consumer closure、要求採否、
phase採否、製品owner判断、現行replacementは未確定で、`new_build_allowed:false`を維持する。
