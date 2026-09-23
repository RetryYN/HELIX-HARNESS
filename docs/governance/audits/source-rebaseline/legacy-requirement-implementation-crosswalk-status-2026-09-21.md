---
title: "製品要求unit・旧HELIX実装証拠crosswalk状況"
status: candidate_incomplete
authority_effect: none
source_revision: legacy-generation-2026-09-14
pr_class: research_premise
---

# 製品要求unit・旧HELIX実装証拠crosswalk状況

## 現在地

218件の要求unit候補をPhase Capability Inventoryへ接続した。188 unitは直接phase候補を持ち、321件のunit-phase候補linkになった。30 unitは直接phase未解決のまま保持した。未解決30件の製品scopeはHELIX-HARNESS 6件、HELIX-OS 24件である。

321 linkのうち、phase別rationaleの引用がunitの逐語source span要素と完全一致するものは87件、span要素内の逐語部分文字列と一致するものは51件、逐語根拠を構造的に結べないものは183件である。後者を含む117 unitは`phase_evidence_trace_review_queue`へ残した。候補phaseの意味採否はいずれも未完であり、trace済み138件も直接asset linkや実装成立を示さない。

| 製品scope | unit数 |
|---|---:|
| HELIX-HARNESS | 85 |
| HELIX-OS | 132 |
| HARNESS–OS connection | 1 |

phase台帳の代表旧asset 84件中78件を、該当phaseを持つ要求unitから参照できるようにした。残る6件はPHCAP-15／17の代表assetであり、要求unit側に両phaseの直接候補がないため、未接続集合としてmetadataへ明示した。これはphase能力の調査入口であり、要求とassetの直接意味linkは0件である。

各unitはphase候補と交差するasset ID集合、およびそこからlow confidenceの製品候補とも交差するasset ID集合を持つ。これにより件数だけでなく、固定したasset catalogから具体asset、source digest、artifact種別、consumer観測へ再読できる。代表assetはこれらの詳細をcrosswalk内にも保持する。集合membershipは意味的一致を示さず、直接linkとは別に保持する。

unitとphase候補assetのmembershipは延べ87,731件、さらに製品候補とも交差するmembershipは延べ56,453件である。unique assetではphase交差2,608件、phase・製品候補交差1,832件である。製品scope別のunique後者はHELIX-HARNESS 841件、HELIX-OS 1,666件、HARNESS–OS connection 439件で、scope間重複を含む。

## 縮退・未実装の接続

321 unit-phase linkのtransition assessmentは次のとおりである。件数はunitではなくunit-phaseの延べ件数である。

| transition assessment | link数 |
|---|---:|
| `degraded_to_candidate` | 103 |
| `not_reimplemented_formally` | 68 |
| `degraded_to_requirement_and_limited_bootstrap` | 43 |
| `degraded_to_draft` | 32 |
| `degraded_to_unapproved_routing_containers` | 24 |
| `degraded_to_operating_contract_and_gui_scaffold` | 19 |
| `degraded_to_rederived_candidate` | 15 |
| `degraded_to_manual_operating_contract` | 7 |
| `semantic_equivalence_unresolved` | 5 |
| `degraded_to_candidate_and_static_registry` | 3 |
| `degraded_to_draft_and_crosswalk` | 1 |
| `rederived_current` | 1 |

`not_reimplemented_formally`を含むunitは68件である。何らかの`degraded_*`を含むunitは重複を許して複数カテゴリへ現れる。これらはphase能力の現行差分であり、要求unit固有の実装状態ではない。

## 旧実装証拠

旧phase側には、実装・test・workflowを含む静的assetの存在を示す状態がある。unit-phase linkでは`implemented_with_tests`が90件、`implemented_with_workflow_and_test_design`が25件、`implemented_partial`が17件などである。

一方、全218 unitについて直接asset意味link、consumer closure、旧test実行、現行適合が未確認である。このため要求unitの旧実装状態は全件`unknown_pending_direct_asset_semantic_review`、現行要求実装状態は全件`not_established`とした。旧phaseに実装sourceやtestがあることを、要求が実装済みだったという主張へ昇格させていない。

## 成果物

- `legacy-requirement-implementation-crosswalk-premise-packet-2026-09-21.md`: 一つの判断論点とknown／assumption／unknown／conflict／stale、反例、再調査条件。
- `legacy-requirement-implementation-crosswalk-bootstrap.jsonl`: 218 unitのcrosswalk。
- `legacy-requirement-implementation-crosswalk-bootstrap.meta.json`: 集計、入力digest、出力digest、未完了条件。
- `build_legacy_requirement_implementation_crosswalk.py`: 三入力からの決定論的再導出。
- `verify_legacy_requirement_implementation_crosswalk.py`: exact setと過大主張防止の静的検証。

静的検証は`records=218 phase_linked=188 phase_unresolved=30 unit_phase_links=321 representative_assets=78`で合格した。候補asset poolのphase交差・phaseと製品候補の交差はverifier内の別式で全218 unitを再計算する。その他のrecord全体はbuilder再導出との一致と過大主張防止assertionで検査する。直接asset linkの早期追加とmetadata件数改変をそれぞれ欠陥注入し、再導出不一致として拒否することも確認した。

## 未完了条件

1. 188 unitのphase候補採否と30 unitのphase解決。
2. 218 unitすべての直接asset意味review。
3. 4,020 assetすべてのconsumer closure。
4. 製品境界、routing訂正5件、successor／L11の人間decision。
5. 要求unit単位の旧実装、縮退、未実装、現行差分の独立review。

これらは全量crosswalkと全旧資産の評価を完了と主張できない条件であり、個別要求の要否・製品scope判断を一律に止める条件ではない。個別unitではscope確定後、L3で選んだ関係旧資産だけを必要な根拠まで調べ、未選定資産の全件consumer closureを開始前提にしない（[旧資産の判断時期に関するPO決定](../../decisions/legacy-asset-review-timing-2026-09-23.md)）。旧能力・要求実装済み・再利用可否は証拠のある範囲でだけ判断する。[Phase Capability Inventory](../../phase-capability-inventory.json)の`new_build_allowed:false`は変更せず、正式設計・実装は[新世代作業入口](../../new-generation-start-here.md)の停止を維持する。
