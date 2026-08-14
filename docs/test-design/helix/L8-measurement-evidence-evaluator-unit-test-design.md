---
layer: L8
sub_doc: unit-test-design
status: confirmed
parent_design: docs/design/helix/L6-function-design/measurement-evidence-evaluator.md
pair_artifact: docs/design/helix/
related_l5: docs/design/helix/L5-detail/measurement-evidence-evaluator.md
---

# measurement evidence evaluator L8 unit test設計

## 1. 対象

L6/L7で実装するpure evaluatorのinput validation、6 status、finding、verdictを検証する。
clock、filesystem、network、DB、probe processをmockで成功させず、trusted evaluation timeを入力で注入する。

## 2. unit oracle一覧

| oracle | 観点 | 主なmutation／失敗 |
|---|---|---|
| `U-MEVAL-001` | root／observation／baseline／result exact key set | unknown field黙殺、欠落補完。実装: `tests/measurement-evidence-evaluator.test.ts` |
| `U-MEVAL-002` | ID、positive revision、full SHA、digest、finite value | short SHA、NaN／Infinity受理。実装: `tests/measurement-evidence-evaluator.test.ts` |
| `U-MEVAL-003` | declaration revision／metric／unit binding | 異revision・unitをmatch化 |
| `U-MEVAL-004` | declarationと比較可能なworkload／environment／sampling／window binding | context欠落・類似文字列補完 |
| `U-MEVAL-005` | started／completed／evaluated time順序 | wall clock read、不正date受理 |
| `U-MEVAL-006` | max age未満／同値／1秒超過 | 境界の`<`化、staleをcurrent化 |
| `U-MEVAL-007` | sample countとratioの独立境界 | count不足相殺、ratio truthy判定 |
| `U-MEVAL-008` | lt/lte/eq/gte/gtとゼロ／負／小数 | comparator反転、0のunknown化 |
| `U-MEVAL-009` | between inclusive/exclusive | lower/upper片側無視、逆範囲受理 |
| `U-MEVAL-010` | baseline unknown／measured exact union | observationからbaseline補完 |
| `U-MEVAL-011` | baseline全context／HEAD／digest binding | 同値valueだけでusable化 |
| `U-MEVAL-012` | hard limit未宣言／不明／pass／fail | threshold passによる相殺 |
| `U-MEVAL-013` | final green/red/unknown truth table | unknownをgreen、failをunknown化 |
| `U-MEVAL-014` | finding全件収集、固定順、dedupe、redaction | first-error return、入力順依存 |
| `U-MEVAL-015` | input不変、同一入力の決定性、外部effect 0 | normalization mutation、clock／I/O参照 |

## 2.1 実装束縛表

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-MEVAL-001 | exact schema | unknown／missing keyを受理したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-002 | scalar admission | short SHA、invalid digest、NaNを受理したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-003 | declaration binding | revision／metric／unit driftをmatchにしたらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-004 | context binding | workload／environment／sampling／window driftをmatchにしたらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-005 | time admission | invalid rangeを受理、評価時刻前後を混同したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-006 | freshness | inclusive境界または1秒超過を誤判定したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-007 | sampling | countとratioの一方を相殺したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-008 | scalar comparator | operator／符号／ゼロを誤判定したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-009 | between | inclusive flagまたは両端を無視したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-010 | baseline union | unknown/measured fieldを混在受理したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-011 | baseline binding | context／HEAD driftをusableにしたらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-012 | hard limit | unknown／pass／failをthresholdで相殺したらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-013 | verdict | fail／unknownをgreenにしたらRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-014 | finding | first-error、順序drift、raw値露出ならRed | `tests/measurement-evidence-evaluator.test.ts` |
| U-MEVAL-015 | purity | input mutationまたは同一入力result driftならRed | `tests/measurement-evidence-evaluator.test.ts` |

## 3. fixture行列

valid green fixtureから一観点だけを変えるtable-driven caseを作る。境界値は`max_age_seconds`、
`minimum_sample_count`、`minimum_representativeness_ratio`、各comparator threshold、between両端、hard limitを
`未満／同値／超過`で網羅する。

baselineは同一値でもrevision、unit、workload、environment、data digest、window、HEAD、evidence digestを
一つずつ変え、全caseがmismatchになることを確認する。

## 4. verdict真理値表

| condition | expected |
|---|---|
| 全6 status成立 | `green` |
| 任意1軸がfail／mismatch | `red` |
| failなし、任意1軸がunknown | `unknown` |
| threshold passかつhard limit fail | `red` |
| currentかつnon-representative | `red` |
| baseline unknownで他全成立 | `unknown` |

複数failure caseでは全findingを固定順で返し、一つのgreen statusが他軸を相殺しないことを確認する。
binding／representativenessのunknown値はschema v1の将来予約であり、現行admissionからは生成しない。

## 5. mutation／property観点

- comparator operator置換、inclusive flag反転、age境界`<=`→`<`をkillする。
- finite number集合と境界近傍を生成し、同じinputから同じresultを得る。
- findingは6軸の固定構築順で生成し、各軸から最大1件だけ生成するため重複を構造的に作らない。
- input deep-freeze下で実行し、declaration／observationを変更しない。
- property／mutation実行記録そのものをmeasurement evidenceとしてgreenにしない。

## 6. trace

| 要件／設計観点 | unit oracle |
|---|---|
| `HR-NFR-REG-004` 共通measurement context | 001..007、010..015 |
| `HR-NFR-REG-006` 反証可能な比較境界 | 008、009、013..015 |
| L4 unknown propagation | 005..007、010..013 |
| #221責務非混載 | 015 |

全`U-MEVAL-001..015`は`tests/measurement-evidence-evaluator.test.ts`へ同名testとして実装し、
L6/L7 production assetとtargeted greenを確認したため`status: confirmed`とする。
