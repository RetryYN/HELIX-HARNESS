---
title: "旧要求・旧asset直接semantic review wave 8状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 8状況

## 結果

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 0、
`unresolved` 6である。wave 1〜7と合わせて23 unit、69 edgeをreview済みとし、edge pairは交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-FR-65-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 2 | `IRUNIT-HIL-FR-66-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 3 | `IRUNIT-HIL-FR-67-HELIX-OS` | HELIX-OS | `unknown_pending_remaining_bounded_search_and_consumer_review` | `not_established` | `unresolved_legacy_implementation_unknown` |

FR-65はprovider環境allowlistとstdin引渡しを部分確認したが、明示close、wall-clock timeout、lint/doctor検出、証拠集合は
成立していない。FR-66はschema/digestの再検証を部分確認したが、authority policy、出力非実行の全対象、FS差分と指示外副作用の
rejectは成立していない。FR-67は`.git`拒否、secret境界、manifest/digestを部分確認したが、sparse worktree生成、履歴排除、
払い出し前scanと完全なaudit evidenceは成立していない。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-FR-65-HELIX-OS` | 5 | 5 | 1 | 0 | 1 | 4 | 3 |
| `IRUNIT-HIL-FR-66-HELIX-OS` | 5 | 5 | 1 | 0 | 1 | 4 | 4 |
| `IRUNIT-HIL-FR-67-HELIX-OS` | 5 | 5 | 3 | 0 | 2 | 3 | 1 |

## phaseと探索状態

| unit | phase | 現行phase状態 | 旧phase能力状態 | transition候補 |
|---|---|---|---|---|
| `IRUNIT-HIL-FR-65-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |
| `IRUNIT-HIL-FR-66-HELIX-OS` | `PHCAP-07` | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-66-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |
| `IRUNIT-HIL-FR-67-HELIX-OS` | `PHCAP-07` | `candidate_only` | `documented_with_test_design` | `not_reimplemented_formally` |
| `IRUNIT-HIL-FR-67-HELIX-OS` | `PHCAP-10` | `draft_requirement_and_bootstrap_decision` | `implemented_with_tests` | `degraded_to_requirement_and_limited_bootstrap` |

bounded searchはcatalog 4,020件を全件照合し、FR-65は135件、FR-66は145件、FR-67は35件を候補にした。
各unitで3件をreviewし、残る132件、142件、28件は未reviewである。phase表はcrosswalk候補の転記であり、
要求単位の縮退確定ではない。

正規分解台帳にHELIX-Web／Web-OS unitは0件である。残る195 unitは未着手である。consumer closure、要求採否、
phase採否、製品owner判断、現行replacementは未確定で、`new_build_allowed:false`を維持する。
