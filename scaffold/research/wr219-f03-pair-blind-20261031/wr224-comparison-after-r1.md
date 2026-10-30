# WR224固定blindとWR227 R1 L4設計の比較

状態: scaffold比較証拠。authorityへの効果: なし。

## 固定blindと比較元

`wr224-independent-blind-derivation.json` は比較前の固定artifactからbyte単位で複製し、SHA-256 `c363ed8bfbf87130be01506092c91d6058c1ffb84452b00fc75cf578f5f79ef5` を保持する。これはIssue #3510 comment 6532068000で指定されたartifactである。blind後の比較はIssue #3510 comment 6532122968、値域全体に関するR1指摘はPR #3970 comment 6532547942にある。blindのsource pinは承認済みL3 `/requirements/66` とL10 `/cases/66` のrevision `771dd7e802189506d88cf9d9570c42b94cf7b8fb`、およびbase `0e0941444f099680ae227194d5ccfb31f1cbfc4c` で許可されたL4散文である。

blind導出では、許可された散文が支持するのは証拠に基づく部分比較結果／候補資料であり、artifactのlifecycle stateではないと判断した。また、`pair_result`/`valley_result`の識別子、schema、validation predicate、projectionは、これらの散文だけから一意に定まらないと記録した。固定L8/L9期待との比較後、comment 6532122968ではL4 `pair_trace/missing` とL8/L9 `supported_synthetic_condition` の不一致、および別々のorigin/trace ticket候補を未決として維持した。blindは期待値を見ておらず、情報へアクセスした順序の違いも保持する。

## R1設計で使った値域全体のinventory

以下はすべて静的なJSON確認であり、実行動作ではない。

- L8 `/cases/3/cases`（45行）: `pair_result` はstate knownが39、conflictが3、staleが3。known値は`supported_synthetic_condition`。`valley_result` はstate knownが43、conflictが1、missingが1。known値は`supported_synthetic_condition`。
- L8 `/cases/3/cases/14,15,27,39-42,44` はknown以外のstateの行である。pairの6行はwrong-pair（`14,39,41`）とforeign-revision（`15,40,42`）。各L8 `pair_results` mapでは影響を受けるlayerひとつが、それぞれL9、L8、L10で、state conflict/staleかつvalue nullとなり、他の二層はknown/supportedのままである。valley row 27はpre-body Red witness missing、row 44は005 binding qualification missingである。L8 `/cases/3/valley_content_counterexamples/0-9` には追加のvalley `state=conflict/value=null`が10行あり、それぞれ`pair_result=known/supported_synthetic_condition`と、3件のknown/supported `pair_results`を伴う。
- L8 `/cases/3/cases` の`pair_results`では43行がL8/L9/L10の各pairともknown/supportedである。wrong-pairとforeign-revisionの例では影響を受けるpairだけがconflictまたはstaleとなり、残る二つはsupportedのままである。10件のcontent counterexamplesも三つのpair結果すべてをsupportedのまま保持する。
- L9 `/cases/3/normal_cases/0-3` は4行すべてpair/valleyともsupportである。`/cases/3/negative_cases/0-38` はpair support 33（0-9, 12-34）、conflict 3（10, 35, 37）、stale 3（11, 36, 38）。valley support 38（23以外）、conflict 1（23）。

| L9 field値 | case IDとrow pointer | 対応するL8期待row | fixtureに記録された理由 | annotation/audit境界 |
|---|---|---|---|---|
| pair `conflict` | `H003-F03-WRONG-L9-PAIR` `/negative_cases/10`; `H003-F03-L8-WRONG-PAIR` `/negative_cases/35`; `H003-F03-L10-WRONG-PAIR` `/negative_cases/37` | `H003-L8-F03-WRONG-L9-PAIR` `/cases/14`; `H003-L8-F03-L8-WRONG-PAIR` `/cases/39`; `H003-L8-F03-L10-WRONG-PAIR` `/cases/41` | mutationが左layerを置換（`L4→L3`, `L5→L2`, `L3→L2`）し、期待pairが対象pairと不整合になる | L9 assignmentは`F03_PAIR_SCOPE_CONFLICT`の候補annotation。projection row 11-13は`unknown/unformed`を示し、従来の候補codeを無効化する。形成済みfindingは主張しない。 |
| pair `stale` | `H003-F03-FOREIGN-PAIR-REVISION` `/negative_cases/11`; `H003-F03-L8-FOREIGN-REVISION` `/negative_cases/36`; `H003-F03-L10-FOREIGN-REVISION` `/negative_cases/38` | `H003-L8-F03-FOREIGN-PAIR-REVISION` `/cases/15`; `H003-L8-F03-L8-FOREIGN-REVISION` `/cases/40`; `H003-L8-F03-L10-FOREIGN-REVISION` `/cases/42` | mutationが比較対象revisionを`REQ@r1→REQ@r0`へ変え、対象に対する資料がcurrentではなくなる | L8 stateはstale/value null。L9にはこれらの行のassignmentがなく、L4にも独立したstale classはない。class mappingは追加しない。 |
| valley `conflict` | `H003-F03-PRE-BODY-RED-ABSENT` `/negative_cases/23` | `H003-L8-F03-PRE-BODY-RED-ABSENT` `/cases/27`; L8の独立した10件のvalley content counterexamples `/valley_content_counterexamples/0-9` | mutationが期待された`pre_body_red`を`mutation_after_body`へ置換する。counterexamplesはfreeze/Red/Green/reverify evidenceの各不整合を示す | L9 rowにはnegative-class assignmentもprojection audit rowもない。L8 counterexamplesは別のL5/L8作業に属するL8 fixture期待として残す。 |
| pair/valley `supported_synthetic_condition` | L9 normal rows 0-3とnegative rows 0-9,12-34はpair support。valley rows 0-22,24-38。origin/trace rows 0,2を含む。 | 合致するsynthetic `source_packet_ref`を持つL8 known wrapper。具体例は`H003-L8-F03-ORIGIN-MISSING` `/cases/4` と`H003-L8-F03-TRACE-MISSING` `/cases/6`。 | fixture source packetはそのsynthetic input conditionをsupportする。origin-null/trace-emptyでは処理が成功したpair/valley結果を返した証拠にはならない。 | 期待値と未実行の境界を維持する。projection auditがある行は`unknown/unformed`のまま。support markerはfindingを生成も取消もしない。 |

`F03_REQUIRED_PAIR_MISSING` は`pair_trace/missing`のまま維持する。この条件は、必要pairまたは原traceがないのに、実際の処理結果がそれを成立扱いした場合に関する。固定blindはL3/L10から具体的な出力やfield schemaを導出しておらず、固定raw/mutationも処理結果の観測ではない。そのためorigin/traceの`supported_synthetic_condition`はfixture sourceがそのsynthetic conditionをsupportするという意味で維持する。これは`missing`、`conflict`、または成功したpair結果へ置き換えない。`conflict`と`stale`は上記の別個のfixture期待statusとして残す。support以外の値を持つL9 7行はすべて理由を記録済みである。このL4/L9設計変更ではL8/L9の期待値を編集しない。

L8だけにある`H003-L8-F03-005-BINDING-QUALIFICATION-MISSING-WHOLE`は`valley_result state=missing/value=null`であり、同一IDのL9 rowはない。したがってこれはL8/L9期待の直接対応pairではない。別のL5/L8作業に向けてL8 caseを維持し、対応するL9値を推定しない。

## 値の割当理由に関するR2再確認

固定L9 sourceの該当9行をcase ID、mutation path、pair/valley expected値ごとに照合した。pair conflict/staleの6行はすべて`paired_comparisons`配下を変異させ、valley conflictの1行は`valley.content.steps`を変異させる。origin/traceの2行はそれぞれ`origin`と`trace`を変異させ、pair/valley expected値を`supported_synthetic_condition`としている。具体的なpointerと値はscaffold監査JSONの`prior_design_evidence.status_assignment_rule_resolution.source_rows`に記録する。

この9行ではmutation pathとexpected値の対応が観測できるが、相関から「値はmutation対象fieldだけで割り当てる」などの一般則は導けない。L3/L10と許可L4散文も、origin/trace mutationにsupport値を割り当てる根拠や、pair/valley値の割当規則を定めていない。したがって書き分けの原理は未解決として明示し、既存fixture値を保持する。origin/traceのsupportはsource packetがsynthetic input conditionをsupportするという期待値の記録であり、処理成功の根拠ではない。

## 設計選択と境界

L4設計では`supported_synthetic_condition`、`conflict`、`stale`をcase単位のsynthetic expected-partial statusとして説明し、L8のstate/value envelopeをL9の平坦なexpected material表現と区別する。すべての値を未実行の出力／finding projectionから分離する。L4にはwrong-pair annotationの`F03_PAIR_SCOPE_CONFLICT` classがあるが独立したstale classはない。L4変更ではstale classificationやmappingを追加しない。L9 executionは`not_executed`、effectは`none`のまま、audit対象のprojection-finding statusは`unknown/unformed`のまま維持する。

この選択は承認済みL3/L10 scope、origin/traceの意味、ticket issuerの境界、既存値を保持する。変更するのは既存synthetic expected-value domainのL4での説明だけである。trace-missingをorigin-missingのticket triggerに含めるかは要求候補として未決のままとし、ここでは決定しない。
