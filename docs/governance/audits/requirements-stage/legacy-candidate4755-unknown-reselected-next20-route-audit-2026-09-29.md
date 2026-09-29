# 旧candidate 4,755行の未route先頭20件・再選定監査（2026-09-29）

- authority effect: `none`。#2353の4,755行累積監査を固定母集団とし、#2350の元選定20件と#2356の分類修正提案9件を除外して再選定した。未公開の旧next20 route監査は選定根拠に使っていない。
- 固定入力: #2353 `8a75e5392a44e005bb05197d977bdbcf75b93cf0`、#2356 `b213b41735067d1716c143c92e0fa6c71d8e92d9`。行別source bytes/hash、router状態、現行relation、残差は[JSON台帳](legacy-candidate4755-unknown-reselected-next20-route-audit-2026-09-29.json)を参照。

## 選定

累積監査のeffective `condition / product_requirement_atom / unknown` 558件から、#2350 selected IDs 20件と#2356 reclassification proposal IDs 9件を除外した。残548件をsource ID数値昇順に並べた先頭20件を選定した。

|順|Source ID|旧source|line|route relation|
|---:|---|---|---:|---|
|1|`LEGACY-CAND-LINE-000052`|`docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md`|17|`adopted_relevant_partial`|
|2|`LEGACY-CAND-LINE-000108`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|42|`true_unknown`|
|3|`LEGACY-CAND-LINE-000109`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|43|`adopted_relevant_partial`|
|4|`LEGACY-CAND-LINE-000110`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|44|`adopted_relevant_partial`|
|5|`LEGACY-CAND-LINE-000140`|`docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`|41|`true_unknown`|
|6|`LEGACY-CAND-LINE-000142`|`docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`|45|`unadopted_candidate_relation_only`|
|7|`LEGACY-CAND-LINE-000143`|`docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`|46|`adopted_relevant_partial`|
|8|`LEGACY-CAND-LINE-000180`|`docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`|109|`true_unknown`|
|9|`LEGACY-CAND-LINE-000331`|`docs/governance/candidates/bugbot-bounded-repair-acceptance.md`|16|`adopted_relevant_partial`|
|10|`LEGACY-CAND-LINE-000356`|`docs/governance/candidates/bugbot-bounded-repair-requests.md`|15|`adopted_relevant_partial`|
|11|`LEGACY-CAND-LINE-000396`|`docs/governance/candidates/bugbot-bounded-repair-requirements.md`|37|`adopted_relevant_partial`|
|12|`LEGACY-CAND-LINE-000425`|`docs/governance/candidates/bugbot-bounded-repair-requirements.md`|75|`adopted_relevant_partial`|
|13|`LEGACY-CAND-LINE-000468`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|14|`unadopted_candidate_relation_only`|
|14|`LEGACY-CAND-LINE-000470`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|16|`unadopted_candidate_relation_only`|
|15|`LEGACY-CAND-LINE-000472`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|18|`unadopted_candidate_relation_only`|
|16|`LEGACY-CAND-LINE-000474`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|20|`unadopted_candidate_relation_only`|
|17|`LEGACY-CAND-LINE-000476`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|24|`unadopted_candidate_relation_only`|
|18|`LEGACY-CAND-LINE-000477`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|25|`unadopted_candidate_relation_only`|
|19|`LEGACY-CAND-LINE-000478`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|26|`unadopted_candidate_relation_only`|
|20|`LEGACY-CAND-LINE-000491`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|17|`unadopted_candidate_relation_only`|

## route relation とauthority caveat

内訳は `adopted_relevant_partial` 8件、`unadopted_candidate_relation_only` 9件、`true_unknown` 3件。各行の現行relationと残差はJSONに記録した。分類が揺れる7行は`provisional_pending_classification_review`としており、名目route内訳は確定route件数ではない。採択済みINTELLIGENCE-L2-009/015/016は対L11と2026-09-28 PO判断recordが特定するexact revisionに限って部分関係として扱う。対応するregistration receiptsはsource_atom_count=0 / authority_effect=noneであり、旧source atomの移管やcoverageを示さない。L2-073は未決candidateであり採択routeではない。CIGのnext-generation-ci relationもcandidate-onlyである。

旧source 8 assetはasset disposition ledger上すべて`Historical / historical / unresolved`で、carry-forward状態は`draft_candidate / preserved_pending_atomization`、successor IDは空である。routeラベルは意味relation分類であって、要求採択・変更・retire、successor登録、coverage/closure、L3以降の許可を生成しない。

## metadata・classification concerns

次の3点はroute集計に先立つ分類確認事項である。選定は指示どおり#2353のeffective classificationを使うが、該当行のroute結果は暫定扱いとし、次batchへ進む前に分類差分を確認する。

1. `000140` / `000142` / `000143` / `000180`：router snapshotは000140・000142・000180を`explanation`、000143を`requirement_atom`（明示correctionあり）とする一方、#2353 effective overlayは4行すべてをproduct atomとする。000140はAAFD-R-03段落の途中行、000142/000143は「Issue、Requirement…」と物理line境界で一文を切っている。000180は製品条件ではなくpromotion/process gateの可能性もある。overlay根拠、atom境界、product/process subtypeを確認する。選定集合は#2353定義のため変更せず固定し、訂正があれば次回selectorを再計算する。
2. `000476` / `000477`：`supporting requirements: ... exact 4件`、`acceptance: ... exact 7件`というID・件数列挙であり、独立したbehavior atomではなくsource metadataの可能性がある。product atomのままの場合のみ候補relationが成り立つ。
3. `000331`：独立oracle/mutation条件と「実証は未実施」という進捗metadataが同じ物理行にある。partial relationはoracle条件句に限り、実証statusを含むatom境界を確認する。
## 旧sourceと現行判断の読み分け

旧sourceではAAFD（`LEGACY-ASSET-CAC0C64EB7540180B1FE`, `8247A056F30FF91E4B8D`, `EB3700B0088F311C2295`）、Bugbot bounded repair（`901CD182B52024593E41`, `35F5F438E0F8755B1CCE`, `D881AF6AFD277B1DE934`）、CI event concurrency generation（`0B75B173425C200EA8CD`, `8B78505C1E059419875F`）の各archive sourceを読み、source lineごとのexact bytesを固定した。asset ledger上、対象群は未決Historical資産である。

## 静的検証

- JSON selection count/uniqueness、20 source line bytesとSHA-256、file SHA、#2353 row hashes、#2356/#2350 exclude集合を照合する。
- 現行L2/L11とdecision receipt revisionの参照を確認する。`scfctl validate`、govcheck、rulebook check、`git diff --check`を実施する。
- 旧runtime/CLI/test/CI/hookは実行しない。
