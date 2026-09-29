# 旧candidate 4,755行の未route先頭20件・再選定監査（2026-09-29）

- authority effect: `none`。#2353/#2356/#2360の分類proposal、merge済み#2361の再標本化、merge済み#2362の5 replacement route rowsを反映し、#2359のselected 20行を更新した。要求採択、successor、source coverage/closure、受入、Stage 5完了は生成しない。
- base: `origin/main` merge commit `847f7262d1248de2de5165d029a9175e027bda6c`。旧sample `4096b10020fd75fe8fc4f200855f27435912fc6f`は再標本化の除外履歴としてpinし、現行route表はmerge済み#2361のupdated 20 IDsだけを対象とする。分類・再標本化・route proposalのexact pinsは[JSON台帳](legacy-candidate4755-unknown-reselected-next20-route-audit-2026-09-29.json)に記録した。

## 選定と再標本化

#2360で元sampleから`000142/143/331/476/477`を除外し、`000180`をproduct requirement atom／unknownとして維持した。#2361 merge commit `132a56f3f2cbb1d02ad3bc08bab4f23ef93369cc`のeffective unknown product atom母集団544行から、#2350の20行、#2356の9分類訂正行、元#2359 sample 20行を除外した選定規則を適用し、次の5 IDを追加した。除外後のeligible populationは528行。更新後の20 IDはmerge済み#2361の選定と一致する。#2362も5行の差分へ修正され、今回のselected replacement IDsと一致する。

この表の20 IDsは本#2359監査の現行sampleである。#2363/#2366の別監査sampleを混在させず、旧#2359 sampleは選定除外履歴としてのみ保持する。

|順|Source ID|旧source|line|route relation|
|---:|---|---|---:|---|
|1|`LEGACY-CAND-LINE-000052`|`docs/governance/candidates/agentic-audit-future-state-delta-acceptance.md`|17|`adopted_relevant_partial`|
|2|`LEGACY-CAND-LINE-000108`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|42|`true_unknown`|
|3|`LEGACY-CAND-LINE-000109`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|43|`adopted_relevant_partial`|
|4|`LEGACY-CAND-LINE-000110`|`docs/governance/candidates/agentic-audit-future-state-delta-requests.md`|44|`adopted_relevant_partial`|
|5|`LEGACY-CAND-LINE-000140`|`docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`|41|`true_unknown`|
|6|`LEGACY-CAND-LINE-000180`|`docs/governance/candidates/agentic-audit-future-state-delta-requirements.md`|109|`true_unknown`|
|7|`LEGACY-CAND-LINE-000356`|`docs/governance/candidates/bugbot-bounded-repair-requests.md`|15|`adopted_relevant_partial`|
|8|`LEGACY-CAND-LINE-000396`|`docs/governance/candidates/bugbot-bounded-repair-requirements.md`|37|`adopted_relevant_partial`|
|9|`LEGACY-CAND-LINE-000425`|`docs/governance/candidates/bugbot-bounded-repair-requirements.md`|75|`adopted_relevant_partial`|
|10|`LEGACY-CAND-LINE-000468`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|14|`adopted_relevant_partial`|
|11|`LEGACY-CAND-LINE-000470`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|16|`adopted_relevant_partial`|
|12|`LEGACY-CAND-LINE-000472`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|18|`adopted_relevant_partial`|
|13|`LEGACY-CAND-LINE-000474`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|20|`adopted_relevant_partial`|
|14|`LEGACY-CAND-LINE-000478`|`docs/governance/candidates/ci-event-concurrency-generation-acceptance.md`|26|`unadopted_candidate_relation_only`|
|15|`LEGACY-CAND-LINE-000491`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|17|`unadopted_candidate_relation_only`|
|16|`LEGACY-CAND-LINE-000492`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|18|`adopted_relevant_partial`|
|17|`LEGACY-CAND-LINE-000496`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|23|`adopted_relevant_partial`|
|18|`LEGACY-CAND-LINE-000497`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|24|`adopted_relevant_partial`|
|19|`LEGACY-CAND-LINE-000499`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|28|`adopted_relevant_partial`|
|20|`LEGACY-CAND-LINE-000500`|`docs/governance/candidates/ci-event-concurrency-generation-requests.md`|29|`adopted_relevant_partial`|

表の6番目は`000180`で、旧sourceのAAFD-R-15 composite atom line 108–109を保持する。上表はソースline 109を識別行として示す。

## 指摘対応

- R2359-01：sample全体に同一のpredicate基準を適用し、20行ごとに採択本文の具体的な一致条件と旧sourceの残差を記録した。結果はpartial 15、unknown 3、candidate-only 2。`000470/492`はstale/missing evidenceの区別だけが関係し、queue/TTL/concurrency/cost/replacement/event-class policyは残差に置いた。
- R2359-02：#2361 merge済みの20 IDs（`000180`を含む15 retained＋5 replacement）を使用し、`000501`を除外した。#2353/#2356/#2360/#2361/#2362のmerge bytesをpinし、#2362 merge後mainへrebaseした。source adoption、coverage/closure、merge admissionは主張しない。

## route relation とauthority caveat

内訳は`adopted_relevant_partial` 15件、`true_unknown` 3件、`unadopted_candidate_relation_only` 2件。20行すべてに共通して、採択済みL2/L11の固定revisionに対して少なくとも一つの具体的source predicateが意味上対応し、そのpredicateと残差を行別に記録できる場合だけ`adopted_relevant_partial`とする。対象機構名、同じ広い話題、未採択candidateへの参照だけではpartialにしない。partialは関係分類であり、旧行の採択やcoverageを意味しない。

CIG行では、`000468`のexact HEAD/run identity、`000472`のcancelled/interruptedとsuccessの区別、`000474`のrun evidence・provenance・handoff reconstruction、`000497`等のhandoff/evidence bindingが採択OS L2/L11の個別predicateと対応する。`000470`はmissing/unexecuted/staleをsuccess証拠にしない範囲だけ、`000492`はold/stale evidenceをcurrent exact-HEAD proofと区別する範囲だけをpartialとする。これらの関係はqueue/TTL、schedule replacement、bounded parallelism、cost limit、cross-event-class isolation、cancel protectionを採択しない。特に`000470`と`000492`の残差にはこの境界を明記した。`000478`と`000491`には対応する採択predicateがなくcandidate-onlyを維持する。

`000180`は`condition / product_requirement_atom / unknown`として残り、sampleにも含む。AAFD-R-15は単一model revisionのbenchmarkからrule/provider routing/Requirement/Designを自動変更しないpromotion boundaryだが、採択済みHELIXINTELLIGENCE-L2-073/L11はAAFD-R-04の未知finding・free-text direct-projection boundaryに対象を限り、line 45–46のみをsourceとしている。R-15は明示範囲外なので、同じAAFD由来またはRequirement/Designという語の一致でpartialにしない。

OS/HARNESSの根拠は#2362が固定した採択revision `f6dad2a33e24f000b87d7f09b8d40288257e74cc`のL2/L11本文である。採択本文はOS L2-019のprovenance・missing/stale/unexecutedとsuccessの区別、L2-020のexact HEAD/run identityとterminal state、L2-023のrevision/scope/unfinished-duty/reason/evidenceを持つhandoff、HARNESS L2-004/005のimpact/reverification・required oracle選択を含む。INTELLIGENCE L2-009/015/016は2026-09-28判断済みの固定revisionを参照する。path・file SHA・decision contextはJSONの`route_criterion`に固定した。

HELIXINTELLIGENCE-L2-073の対象exact L2/L11 revisionは、2026-09-29 PO判断記録`MPR-RC-HELIXINTELLIGENCE-L2-073-002`で採択済みである。`000142/000143`は同じAAFD-R-04 atomとして分類proposalで採択関係へ接続され、unknown route母集団から除外された。L2-073は残存AAFD-R-15の`000180`をrouteせず、AAFD全体のcoverage/closureも示さない。

旧source群はasset disposition ledger上historical/unresolvedで、carry-forwardは`draft_candidate / preserved_pending_atomization`、successor IDは空である。routeは意味relation分類のみであり、旧要求の採択・変更・retire、successor登録、source coverage/closure、L3以降の許可を生成しない。

## classification・atom境界の反映

1. `000140/142/143`：#2360は3行を`condition / product_requirement_atom`として維持し、AAFD-R-03/04のatom境界を照合した。`000142/143`は本sampleから除外され、`000140`のみ残る。`000140`のrouteは`true_unknown`のまま。
2. `000180`：#2360はAAFD-R-15 composite atomを`condition / product_requirement_atom / unknown`として維持した。#2361の再標本化では元sampleから残し、他の5行を除いた後のsampleにも含める。旧VERIFY/counterexample/expiry/human gateを現行の追加承認手続きへ転用しない。
3. `000476/477`：CIG requirement/acceptance IDと件数のみのsource metadataとして`explanation`へ移し、sampleから除外した。原文はarchiveに保持する。
4. `000331`：oracle/mutation acceptance criterionと`実証は未実施`のstatus metadataの境界を明確にした。#2361再標本化でsampleから除外した。
5. replacement rows：#2361が選定した5行（`000492/496/497/499/500`）を評価した。#2362の修正後5行proposalと選定集合が一致する。

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

- JSONのselected IDs/uniquenessと#2361 merge commit `132a56f3f2cbb1d02ad3bc08bab4f23ef93369cc`のexact resamplingを照合する。selected 20行のsource file、line、physical-line SHA-256をarchive bytesと照合する。
- 採択L2/L11 path/hashとdecision revision、#2360/#2361/#2362、#2353/#2356/#2359、router/carry-forward pinsを確認する。merge済み入力をmerge commit bytesへpinし、current-main baselineを#2362 merge commitへrebaseした。このproposalの独立review・merge admissionは別途必要である。
- `scfctl validate`、`govcheck.py`、`gen_rulebook.py --check`、`git diff --check`を実施する。旧runtime/CLI/test/CI/hookは実行しない。
