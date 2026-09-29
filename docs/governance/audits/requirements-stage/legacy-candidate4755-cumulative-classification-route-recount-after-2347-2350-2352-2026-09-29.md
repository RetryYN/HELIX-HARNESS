# 旧candidate 4,755行の累積分類・route再集計（#2347、#2350、#2352提案overlay）

- 監査基準: `bf00aca56add8ca29d9a56af9a989fdeb0a7d969`（#2352 merge後のorigin/main）。
- authority effect: `none`。全92旧archiveファイルと4,755物理行をsource ID、path、line、file/line SHAで突合した。行ごとのsource ID、行内容・物理行SHA、提案overlay後の分類・routeは[JSON台帳](legacy-candidate4755-cumulative-classification-route-recount-after-2347-2350-2352-2026-09-29.json)に固定した。
- overlay順: #2347の全量baseline → #2350の20行route overlay → merge済み監査 #2352 の9行分類案。#2352 overlayは提案の影響を数えるためだけに適用し、採択状態へ変更しない。
- 行別原文・中間状態の重複を避け、JSONには最終分類・routeと行SHA、20対象IDへの29件のbounded overlay適用のみを記録する。旧原文と中間状態はpin付きrouter・carry-forward台帳・archiveに保持する。

## 累積結果

| effective classification | 件数 |
|---|---:|
| structure | 926 |
| explanation | 2918 |
| condition | 911 |
| **total** | **4755** |

| condition subtype | 件数 |
|---|---:|
| product requirement atom | 904 |
| management/process condition | 6 |
| historical Concept condition | 1 |
| **condition total** | **911** |

| condition route status | 件数 |
|---|---:|
| `source_relation_coverage_unresolved` | 141 |
| `unadopted_candidate_relation_only` | 162 |
| `partial` | 16 |
| `unresolved` | 2 |
| `covered_limited` | 1 |
| `adopted_relevant_partial` | 24 |
| `unknown` (product + Concept) | 559 |
| `management_successor_unresolved` | 6 |
| **condition total** | **911** |

製品requirement atomのroute-knownは346、unknownは558。route-knownには未採択candidate relationと限定crosswalkを含み、coverage/closureを意味しない。

## overlay差分の照合

#2347 baselineはstructure 926 / explanation 2,911 / condition 918、product atom 913であった。#2350は20件中4件を`adopted_relevant_partial`、6件を`unadopted_candidate_relation_only`、10件を`true_unknown`としてroute評価した。これにより#2347のroute statusから unknown 10件が前二者へ移る。

#2352の提案対象9件は上記10 true-unknown行のうち同一READMEの全9行。7件をproduct atomからexplanation、2件をproduct atomからmanagement/process conditionへ分類し、後者のrouteを`management_successor_unresolved`とする案である。従って提案overlay後は condition 911、explanation 2,918、product atom 904、management/process condition 6、product route unknown 558となる。9件はroute first-20選定集合から外れ、#2350のfirst-20 selectorおよび10 true-unknown件数を現行母集団の値として再利用しない。

#2347のfull recount本文/JSONと#2350のbounded auditはその時点のappend-only履歴として保持する。今回の全行joinは4,755行の累積recountを別に記録し、過去記録を編集しない。

## authorityと限界

#2352はmerge済みのbounded auditでauthority_effectはnoneである。この表は提案を適用した場合の累積分類・route見込みであり、採択・formal successor・coverage・closureを成立させない。全4,755行は`historical_candidate` / `draft_candidate` / `preserved_pending_atomization`のまま。意味変更、退役、要求stage完了、実装・受入許可は主張しない。route-knownには`partial`、`adopted_relevant_partial`、未採択candidate relation等を含む。exact successor coverageを示さない。

## 静的検証

- #2347 router、carry-forward ledger、row recordsの各4,755 IDは一意かつ連続し、path/line/file SHA/line SHAが一致。
- 92 archive file SHAと4,755 source lineのtext/digest、および各物理行bytes SHAを再検証。
- #2350の20 IDと#2352提案の9 IDをexact source IDでjoinし、重複適用なしを確認。
- 分類は4,755行、routeは911 conditionへ分割。全source authority/carry-forward状態は不変。
- 旧CLI/runtime/hook/test/CIは実行していない。
