---
title: "旧要求・旧asset直接semantic review wave 10状況"
status: candidate
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 旧要求・旧asset直接semantic review wave 10状況

218要求unitのうち新たに3 unit、候補edge 9件を直接照合した。結果は`confirmed` 3、`rejected` 0、`unresolved` 6である。wave 1〜9と合わせて29 unit、87 edgeをreview済みとし、edge pairは交差しない。

| # | unit | 製品 | 旧要求実装状態 | 現行要求実装状態 | 縮退評価 |
|---:|---|---|---|---|---|
| 1 | `IRUNIT-HIL-BR-04-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_direct_asset_semantic_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 2 | `IRUNIT-HIL-BR-13-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_direct_asset_semantic_review` | `not_established` | `unresolved_legacy_implementation_unknown` |
| 3 | `IRUNIT-HIL-FR-43-HELIX-HARNESS` | HELIX-HARNESS | `unknown_pending_direct_asset_semantic_review` | `not_established` | `unresolved_legacy_implementation_unknown` |

要求snapshotだけを`confirmed`とし、design・implementationは部分候補・未実行の`unresolved`とした。consumer closure、現行replacement、製品境界の人間判断、new build許可は未確定である。

## atom被覆

| unit | atom総数 | 契約confirmed | 設計partial | 設計kind保留 | 実装confirmed | 実装unresolved | 実装未被覆 | 設計・実装証拠なし |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| `IRUNIT-HIL-BR-04-HELIX-HARNESS` | 3 | 3 | 1 | 0 | 0 | 1 | 2 | 2 |
| `IRUNIT-HIL-BR-13-HELIX-HARNESS` | 3 | 3 | 3 | 0 | 0 | 3 | 0 | 0 |
| `IRUNIT-HIL-FR-43-HELIX-HARNESS` | 4 | 4 | 0 | 4 | 0 | 1 | 3 | 3 |

`設計kind保留`はdesign pathにあるがcatalog kindが`requirement`のFR43 assetを示す。通常の設計partialへ算入せず、保留atomは`設計・実装証拠なし`から差し引かない。

## phaseと探索状態

| unit | phase | 現行phase状態 | 旧phase能力状態 | transition候補 |
|---|---|---|---|---|
| `IRUNIT-HIL-BR-04-HELIX-HARNESS` | `PHCAP-09` | `candidate` | `documented_candidate` | `degraded_to_rederived_candidate` |
| `IRUNIT-HIL-BR-13-HELIX-HARNESS` | `PHCAP-03` | `candidate` | `implemented_partial` | `degraded_to_candidate` |
| `IRUNIT-HIL-BR-13-HELIX-HARNESS` | `PHCAP-05` | `draft` | `documented_with_test_design_partial` | `degraded_to_draft` |
| `IRUNIT-HIL-BR-13-HELIX-HARNESS` | `PHCAP-06` | `candidate_only` | `documented_with_implementation_assets` | `degraded_to_candidate` |
| `IRUNIT-HIL-FR-43-HELIX-HARNESS` | `PHCAP-03` | `candidate` | `implemented_partial` | `degraded_to_candidate` |

bounded searchはcatalog 4,020件を全件照合し、選択assetを候補集合へ含めた。候補集合と未review集合の件数・digestはmetaへ保存した。候補pool membershipはsemantic linkではない。

正規分解台帳にHELIX-Web／Web-OS unitは0件であり、Wave10の製品対象はHELIX-HARNESSに限定する。3 unitは全てshared source spanなしだが、product boundary decisionは未完了である。残る189 unitは未着手であり、`new_build_allowed:false`を維持する。
