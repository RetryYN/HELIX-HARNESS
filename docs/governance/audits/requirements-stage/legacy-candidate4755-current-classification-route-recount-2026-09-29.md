# 旧candidate 4,755行の分類・route全量再集計

- audit id: `legacy-candidate4755-current-classification-route-recount-2026-09-29`
- 基準commit: `5acdca501cb4d8b99536ea9a99a99ec80c0e843a`（#2340 merge後）
- authority effect: `none`。全入力のSHA-256、ID全量、検算値は[JSON監査](legacy-candidate4755-current-classification-route-recount-2026-09-29.json)に固定する。
- 方法: pinned 4,755行routing JSONLを全件列挙し、carry-forward ledgerと全source identity/digestを突合。#2336までの12件のclassification corrections、#2338の10行route crosswalk、#2339の9行RTG crosswalkをfull `source_item_id` で適用した。元routing JSONL、12件を記録した先行count監査、各overlayは変更していない。

## 全量集計

| effective classification / route | 件数 |
|---|---:|
| structure | 926 |
| explanation | 2,940 |
| condition (`requirement_atom`) | 889 |
| └ route known | 315 |
| └ route unknown | 574 |
| **total** | **4,755** |

route-known 315件は、既存のsource-relation/coverage-unresolved 141件とunadopted-candidate-relation-only 155件に、#2338で状態を更新した10行と#2339でpartialと照合した9行を加えた値。bounded crosswalk outcomesはpartial 16、unresolved 2、covered_limited 1。これらは全て対象行単位のroute状態であり、旧candidate source全体のclosureではない。

## classification correctionsと重複確認

先行12件は、`LEGACY-CAND-LINE-000142`（R2253-01）、`LEGACY-CAND-LINE-003082`（R2254-01）、#2336のdescription-condition overlay 10 IDs。これら12件のうち後続#2338 crosswalkが10件のrouteを限定照合した。#2339は別の9 IDsを扱い、7件をexplanationからconditionへ訂正し、2件は既存requirement_atomのままrouteをpartialとした。

#2339の7件は先行12件と互いに素であり、全19件の分類追加IDを一度だけ計上した。#2338の10行は分類追加集合ではなく、既にconditionとして数えた行へのroute outcome更新である。#2339の9行中2件はcondition分類数へ再加算していない。

- condition: `870 + 12 + 7 = 889`
- explanation: `2,959 - 12 - 7 = 2,940`
- route unknown: `586 - 10 - 2 = 574`。#2339の新規7 conditionは旧explanation分母にあったため、586から差し引かない。
- route known: `296 + 10 + 9 = 315`

先行の[累積分類件数監査](legacy-candidate-effective-classification-counts-2026-09-29.md)の`882 condition / 2,947 explanation / 586 route-unknown`は、その監査入力時点のhistorical値として保持する。本再集計は別のappend-only監査であり、先行artifactは書き換えていない。

## route outcomeと範囲

#2338の10行はpartial 7、unresolved 2、covered_limited 1。#2339の9行はすべてpartial。partialは対応と残条件が併存する状態、covered_limitedは採択済みpairが指定した旧source条件だけを扱う状態、unresolvedは適用可能な対応で旧条件を閉じていない状態を示す。いずれも後続要求のformal successorやsource全体closureを意味しない。

この記録は固定された4,755行集合と明示された監査入力に対する分類とroute statusの再集計である。全体の現行source coverage、successorの存在・完全性、要求全体の採否やstage完了を主張しない。旧candidate authorityは`historical_candidate`のままである。

## 静的検証

base JSONLとcarry-forward ledgerを実際に全行列挙し、各4,755件のsource ID、path、line、file SHA-256、line SHA-256を照合した。IDは`LEGACY-CAND-LINE-000001`〜`LEGACY-CAND-LINE-004755`の一意な全集合。指定crosswalkの各ID、旧source line digest、prior correction集合の相互排他、分類総数、known/unknown route合計を確認した。全入力SHAと集合別IDはJSONに保存した。旧CLI、runtime、test、CIは実行していない。
