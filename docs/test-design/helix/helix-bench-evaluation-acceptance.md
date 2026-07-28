---
canonical_vmodel: L1-L12
canonical_layer: L10
canonical_pair: L3
title: "HELIX-Bench 評価契約 受入テスト設計"
layer: L10
kind: test-design
status: draft
created: 2026-07-29
updated: 2026-07-29
owner: QA / 独立AI-B
plan: PLAN-L3-49-helix-bench-evaluation
parent_design: docs/design/helix/L3-requirements/helix-bench-evaluation.md
pair_artifact: docs/design/helix/L3-requirements/helix-bench-evaluation.md
---

# HELIX-Bench 評価契約 受入テスト設計

## §0 oracle方針

HELIX-BenchのL10 oracleは、実benchmark scoreではなく、L3評価契約が再現可能・provider中立・
failureを隠さない形でL4以降へ降下できることを検証する。自己申告scoreやサンプル数だけでpassにしない。

## §1 acceptance oracle

| AC ID | trace | positive oracle | negative oracle |
|---|---|---|---|
| `HELIX-BENCH-AC-001` | R-01 | 5カテゴリがexact set・exact orderで機械読取できる | カテゴリ欠落、追加、別名をscoring version不変で許可したらfail |
| `HELIX-BENCH-AC-002` | R-02 | 12指標がexact set・exact orderで機械読取できる | failure／missingを分母から除外したらfail |
| `HELIX-BENCH-AC-003` | R-03 | team compositionとharness profileを別fieldで比較できる | provider名、model名、HELIX Fullへ固定加点したらfail |
| `HELIX-BENCH-AC-004` | R-03 | development style、case-driven、specialist、runtime、team、profileが独立axisである | ScrumへPoCを内包、Design HARNESSをstyle化、team構成をruntime mode化したらfail |
| `HELIX-BENCH-AC-005` | R-04 | required task snapshot 15 fieldがexact一致する | allowed／forbidden path、base HEAD、hidden oracle digestの欠落を許したらfail |
| `HELIX-BENCH-AC-006` | R-04 | public taskとhidden oracleが分離される | hidden answer、secret、PII、private review contextがworker inputへ漏れたらfail |
| `HELIX-BENCH-AC-007` | R-05 | 同一snapshot／scorer／protocol／hardware classだけを同一cohort比較する | version差、cache差、manual interventionを無視して順位付けしたらfail |
| `HELIX-BENCH-AC-008` | R-06 | artifact／diff／test／negative oracle／review／CI／DB／merge receiptからscoreを再計算できる | model自己申告またはprose verdictだけでsuccessにしたらfail |
| `HELIX-BENCH-AC-009` | R-06 | scope／security／data-loss／leakage failureを単独表示する | 平均点で重大failureを相殺したらfail |
| `HELIX-BENCH-AC-010` | R-07 | token、wall time、CI rerun、retry、costをaccepted change単位へ正規化する | accepted change 0のrunを低cost成功として扱ったらfail |
| `HELIX-BENCH-AC-011` | R-07 | pricing source／currency／timestamp／charging classを保持する | 費用欠測を0円として比較したらfail |
| `HELIX-BENCH-AC-012` | R-08 | task／fixture／oracle／protocol／scorer digestとblind judge分離を保持する | benchmark authorがhidden oracleを見せたままjudgeを兼任したらfail |
| `HELIX-BENCH-AC-013` | R-08 | historical resultをversioned cohortとして保持する | old model／runtimeの結果をcurrent性能証拠へ流用したらfail |
| `HELIX-BENCH-AC-014` | §0 | worker admission benchを下位receiptとして参照し、system/team benchと責務分離する | `WCC-FR-07/08`を複製実装する、またはHELIX-Bench scoreだけでworkerをadmitしたらfail |

## §2 完了境界

本pairの完了は、L3 requirement、L10 oracle、trace、exact inventory、独立reviewがcurrent HEADで
一致した時点である。runner実装、dataset生成、score計測、model採用は完了条件に含めない。
