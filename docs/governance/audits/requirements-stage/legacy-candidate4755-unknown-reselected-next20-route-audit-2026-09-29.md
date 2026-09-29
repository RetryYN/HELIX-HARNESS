# 旧candidate 4,755行の未route先頭20件・再選定監査（2026-09-29）

- authority effect: `none`。#2353/#2356/#2360の分類proposalと#2361の再標本化を反映し、#2359のselected 20行を更新した。#2362の6 replacement route proposalは限定的な意味relationとして反映する。要求採択、successor、source coverage/closure、受入、Stage 5完了は生成しない。
- 監査起点: #2359 exact sample `4096b10020fd75fe8fc4f200855f27435912fc6f`。分類・再標本化・route proposalのexact pinsは[JSON台帳](legacy-candidate4755-unknown-reselected-next20-route-audit-2026-09-29.json)に記録した。

## 選定と再標本化

#2360で元sampleのうち`000142/143/180/331/476/477`を除外し、14行を維持した。#2361のeffective unknown product atom母集団543行から、#2350の20行、#2356の9分類訂正行、元#2359 sample 20行を除外した選定規則を適用し、次の6 IDを追加した。除外後のeligible populationは528行。更新後の20 IDは#2361と完全一致する。

|順|Source ID|旧source|line|route relation|
|---:|---|---|---:|---|
|1|`LEGACY-CAND-LINE-000052`|`docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md`|17|`adopted_relevant_partial`|
|2|`LEGACY-CAND-LINE-000108`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|42|`true_unknown`|
|3|`LEGACY-CAND-LINE-000109`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|43|`adopted_relevant_partial`|
|4|`LEGACY-CAND-LINE-000110`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|44|`adopted_relevant_partial`|
|5|`LEGACY-CAND-LINE-000140`|`docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`|41|`true_unknown`|
|6|`LEGACY-CAND-LINE-000356`|`docs/governance/candidates/bugbot-bounded-repair-requests.md`|15|`adopted_relevant_partial`|
|7|`LEGACY-CAND-LINE-000396`|`docs/governance/candidates/bugbot-bounded-repair-requirements.md`|37|`adopted_relevant_partial`|
|8|`LEGACY-CAND-LINE-000425`|`docs/governance/candidates/bugbot-bounded-repair-requirements.md`|75|`adopted_relevant_partial`|
|9|`LEGACY-CAND-LINE-000468`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|14|`unadopted_candidate_relation_only`|
|10|`LEGACY-CAND-LINE-000470`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|16|`unadopted_candidate_relation_only`|
|11|`LEGACY-CAND-LINE-000472`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|18|`unadopted_candidate_relation_only`|
|12|`LEGACY-CAND-LINE-000474`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|20|`unadopted_candidate_relation_only`|
|13|`LEGACY-CAND-LINE-000478`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|26|`unadopted_candidate_relation_only`|
|14|`LEGACY-CAND-LINE-000491`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|17|`unadopted_candidate_relation_only`|
|15|`LEGACY-CAND-LINE-000492`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|18|`adopted_relevant_partial`|
|16|`LEGACY-CAND-LINE-000496`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|23|`adopted_relevant_partial`|
|17|`LEGACY-CAND-LINE-000497`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|24|`adopted_relevant_partial`|
|18|`LEGACY-CAND-LINE-000499`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|28|`adopted_relevant_partial`|
|19|`LEGACY-CAND-LINE-000500`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|29|`adopted_relevant_partial`|
|20|`LEGACY-CAND-LINE-000501`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|30|`adopted_relevant_partial`|

## route relation とauthority caveat

内訳は`adopted_relevant_partial` 12件、`true_unknown` 2件、`unadopted_candidate_relation_only` 6件。元sampleから維持した14行のrelationは既存の行別評価を保ち、追加6行は#2362 proposalが示す採択済みgeneric L2/L11 revisionとの限定的relationを記録する。#2362のNCI-HARNESS/NCI-OS参照は未採択candidateのためadopted件数へ加えない。各行のrelationと具体的残差はJSONに記録した。

HELIXINTELLIGENCE-L2-073の対象exact L2/L11 revisionは、2026-09-29 PO判断記録`MPR-RC-HELIXINTELLIGENCE-L2-073-002`で採択済みである。ただし、そのsourceであった旧AAFD-R-04の`000142/000143`は本再標本化sampleから除外された。L2-073採択は残存sampleのrouteを生成せず、AAFD全体のcoverage/closureも示さない。

旧source群はasset disposition ledger上historical/unresolvedで、carry-forwardは`draft_candidate / preserved_pending_atomization`、successor IDは空である。routeは意味relation分類のみであり、旧要求の採択・変更・retire、successor登録、source coverage/closure、L3以降の許可を生成しない。

## classification・atom境界の反映

1. `000140/142/143`：#2360は3行を`condition / product_requirement_atom`として維持し、AAFD-R-03/04のatom境界を照合した。`000142/143`は本sampleから除外され、`000140`のみ残る。`000140`のrouteは`true_unknown`のまま。
2. `000180`：#2360はpromotion/process gate条件として`management_process_condition`へ移し、product-route母集団から除外した。旧human gateを現行の追加承認手続きへ転用しない。
3. `000476/477`：CIG requirement/acceptance IDと件数のみのsource metadataとして`explanation`へ移し、sampleから除外した。原文はarchiveに保持する。
4. `000331`：oracle/mutation acceptance criterionと`実証は未実施`のstatus metadataの境界を明確にした。#2361再標本化でsampleから除外した。
5. replacement six：各行の#2362 partial relationは提案値として記録し、event-class固有の制約など行別残差を保った。

## 旧sourceと現行判断の読み分け

- `LEGACY-ASSET-CAC0C64EB7540180B1FE` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md`
- `LEGACY-ASSET-8247A056F30FF91E4B8D` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requests.md`
- `LEGACY-ASSET-EB3700B0088F311C2295` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`
- `LEGACY-ASSET-35F5F438E0F8755B1CCE` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requests.md`
- `LEGACY-ASSET-D881AF6AFD277B1DE934` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/bugbot-bounded-repair-requirements.md`
- `LEGACY-ASSET-0B75B173425C200EA8CD` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`
- `LEGACY-ASSET-8B78505C1E059419875F` — `archive/legacy-generation-2026-09-14/root/docs/governance/candidates/ci-event-concurrency-generation-requests.md`

旧source行・file・physical-line SHA-256はJSONに固定し、legacy asset disposition ledgerを参照した。対応の旧sourceは再利用統制に従って意味を再導出し、archive内runtime等は実行していない。

## 静的検証

- JSONのselected IDs/uniquenessを#2361のexact resamplingと照合する。selected 20行のsource file、line、physical-line SHA-256をarchive bytesと照合する。
- #2360/#2361/#2362、#2353/#2356/#2359、router/carry-forward/decision pinsを確認する。
- `scfctl validate`、`govcheck.py`、`gen_rulebook.py --check`、`git diff --check`を実施する。旧runtime/CLI/test/CI/hookは実行しない。
