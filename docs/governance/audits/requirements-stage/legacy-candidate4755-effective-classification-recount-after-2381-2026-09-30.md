# 旧candidate 4,755行の#2381後 proposal-effective 再集計

## 概要

- 対象: #2353の全4,755 `row_records`に、merged #2356 → #2360 → #2363 → #2366 → #2367 → #2368 → #2369 → #2381の分類proposalを、exact source IDで順に適用した再集計。
- 基準main: `6e62f76986f19d14281cb2a96eca460c5430dcc6`（#2381 merge後）。JSONに各入力のcommit、path、content SHA-256、Git blob SHAを固定した。特に#2381はmerge commit `6e62f76986f19d14281cb2a96eca460c5430dcc6`上のoverlay JSON blob `47d52add2120ccfe2f278130c42119e9bfcf8354`を確認した。
- authority effect: `none`。これはproposal-effective分類とrouteラベルの件数照合であり、要求採択、successor、coverage、受入、実装、Stage 5完了を示さない。

## 入力と適用順

| ref | source commit | row count | input JSON SHA-256 |
|---|---|---:|---|
| #2353 baseline | `97672630b7de70fd4433827730c390cbabd90a99` | 4,755 | `2c025c878ce1b63d93531ee980b08c785ba9273d6db6f751cf3237ce31d6696c` |
| #2356 | `9ae894346ce13888947fb3d4f2e9aafc79fbdcfa` | 9 | `726d03d543cf4d2876bded38c6e87d2054da8b7c81175033ea4a8a48e1405164` |
| #2360 | `5ca82b8ff4122a6f2141ed15e25420fafc01e4e0` | 7 | `4cedbd4504626c05e511e7e5c67ecb7462cccd82ae9377e29d8ca54b6d6047bb` |
| #2363 | `e7f5f54c86e45c2904c129cd24c94d589bafb4bd` | 16 | `12986b5f2f014120cd2a7e674cf999527d6f659e06779d89fdfc87c16fc93384` |
| #2366 | `a9b36cd43866d30aaca7c1edc654a44a36e47eb3` | 14 | `d42792e8c50402353d6c66a941e00062b7288f267fcecfc0e2eabd7ae93ab8f6` |
| #2367 | `b438bf16a3e3e4f21cf4a9762ae59c7d7efccaf7` | 51 | `c9b3eec4b150f2ab6b73f790b8feb1bcb8aab91c1b6a30a522f9ba65364a130d` |
| #2368 | `f89f71e0371440e9e10636499192c2311872b024` | 47 | `512cf6bb34a5ee5856d0fa8d78af1177880d82a26e95effc36c3562763b62a95` |
| #2369 | `081b0b6612b802cfcb02b3cecda1559dd9a3ce13` | 2 | `5ed02b037f78ca25991b396e232e8b1ee754b0c91b056ed6640c9fb1c47cf0c0` |
| #2381 | `6e62f76986f19d14281cb2a96eca460c5430dcc6` | 10 | `512f9ceafe935648d459d6b268ff4d3952f0e8264298213ad278256236b5f40e` |

各overlayのGit blob SHA、正確なpath、sorted source-ID set digestはJSONに記録した。8 overlay ID集合はすべて相互に重ならず、#2353 row IDへexactly onceでjoinした。各ID集合・content digestが固定された入力から、#2353 full rowsを一度だけ更新して再集計した。後続proposalによる先行行の上書きはない。

## product/unknown poolと監査済みunion

|適用段階|proposal-effective product/unknown|
|---|---:|
| #2353 | 558 |
| #2356 | 549 |
| #2360 | 544 |
| #2363 | 532 |
| #2366 | 521 |
| #2367 | 507 |
| #2368 | 486 |
| #2369 | 488 |
| #2381 | **478** |

#2378 prior route unionは261 prior IDsと同commit選定29 IDsのdisjoint unionで290件。#2380選定27 IDsは#2378 unionと交差せず、**製品条件pool向けroute監査union**は317件。別にmerged #2379のHMC 30件もroute監査済みで、317件と交差しないため、全route監査unionは347件である。#2379の30件はすべて本product/unknown poolの対象外であり、両unionのpoolとの交差は同じ288件となる。全row stateへoverlayを適用した後の478 product/unknown IDsから、未監査poolは`478 - 288 = 190`件。#2379のpath・SHAと交差検証はJSONに記録した。

003940、003941、003942、003961–003964、003984–003986の#2381対象10件は、#2380で既にroute監査済みである。分類proposalを適用するとpoolとpool内監査済み交差がともに10減るが、製品条件pool向けunion317と全route監査union347は変わらず、未監査数も190のまま。

## 全量effective件数

| effective classification | #2381適用後 |
|---|---:|
| structure | 926 |
| explanation | 2,965 |
| condition | 864 |
| **total** | **4,755** |

| condition subtype | #2381適用後 |
|---|---:|
| product_requirement_atom | 827 |
| management_process_condition | 36 |
| concept_condition | 1 |
| **condition total** | **864** |

| route status（condition内） | #2381適用後 |
|---|---:|
| unknown | 479 |
| source_relation_coverage_unresolved | 141 |
| unadopted_candidate_relation_only | 162 |
| adopted_relevant_partial | 27 |
| partial | 16 |
| management_successor_unresolved | 36 |
| unresolved | 2 |
| outside_product_route_population | 0 |
| covered_limited | 1 |
| **condition total** | **864** |

product subtypeは`827 = known 349 + unknown 478`。ここで`known`はproduct atomのroute label上で`unknown`以外となる件数で、coverageや採択ではない。overlayごとのclass/subtype/route差分はJSONに記録した。

## 維持されたsourceと過去監査

- 003965は全overlay後も`condition / product_requirement_atom / unknown`である。#1358/#1363をfixtureから除外し、C-01/C-02をepoch/freeze oracleとして指定する隣接規範行であり、#2381のmetadata行overlayに含めていない。
- #2380 route auditのcontent SHA-256は再集計前後とも`341b97fd4109118c747c3a5b5c62f10f092ef4df330d45e4eaae9910f6994f56`。#2380は27件（partial 16、unknown 11）の履歴記録として変更していない。

## 静的確認と限界

4,755 row IDの一意性・連番、各overlay ID join、overlay間intersection、classification/subtype/routeの総数、478 poolと317-ID製品条件向けunion／347-ID全route監査unionとの交差、003965の保持を静的に確認した。旧archiveのscript、CLI、workflow、test、hook、runtime、CIは実行していない。再集計から要求採択、successor、source coverage、受入、実装、実行、Stage 5 closureを生成しない。
