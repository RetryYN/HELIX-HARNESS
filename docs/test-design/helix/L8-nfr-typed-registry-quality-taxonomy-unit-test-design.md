---
layer: L8
sub_doc: unit-test-design
parent_design: docs/design/helix/L6-function-design/nfr-typed-registry-quality-taxonomy.md
---

# NFR typed registry の L8 unit test 設計

## 1. 対象

`src/requirements/nfr-registry.ts` の pure analyzer と migration admission を検証する。
filesystemを使うcaseは一時repository内のsource bytesだけへ限定し、network、DB、probe実行を使わない。

## 2. unit oracle の一覧

| oracle | 観点 | 主なmutation／失敗 |
|---|---|---|
| `U-NFRREG-001` | root、entry、nested objectのexact key set | unknown fieldの黙殺 |
| `U-NFRREG-002` | stable ID、positive revision、duplicate ID | ID regex／重複判定削除 |
| `U-NFRREG-003` | 標準9特性とAI固有7特性のexact family | family混在、未知quality受理 |
| `U-NFRREG-004` | source authority必須、5 roleとlayer対応 | authority空配列／role-layer誤対応 |
| `U-NFRREG-005` | authority field分離、nfr-grade拒否、path推定禁止 | physical pathからlayer推定 |
| `U-NFRREG-006` | digest形式、source実bytes、realpath境界 | digest比較／repo escape判定削除 |
| `U-NFRREG-007` | surface、metric、workload、environment、data | context field欠落 |
| `U-NFRREG-008` | 4 sampling methodとminimum count | value/unit組合せの緩和 |
| `U-NFRREG-009` | baseline unknown／measured union | unknown reason欠落、NaN受理 |
| `U-NFRREG-010` | target、SLO、budget、limit union | unknownを0へ補完、declared unit欠落 |
| `U-NFRREG-011` | freshness ageとrepresentativeness範囲 | 0秒、ratio範囲外の受理 |
| `U-NFRREG-012` | thresholdとmetric／unit／comparator束縛 | metric不一致、逆between受理 |
| `U-NFRREG-013` | window、read-only probe、実装詳細拒否 | command／SQL field、write probe受理 |
| `U-NFRREG-014` | oracle、evidence、owner、remeasure trigger | unsafe path、非test oracle、空owner |
| `U-NFRREG-015` | production 001..003 exact required trace | partial registry受理 |
| `U-NFRREG-016` | 入力不変、同一入力の決定性 | analyzerによるnormalization mutation |
| `U-NFRREG-017` | stable-ID migrationと一段のmaterial revision | 削除、逆行、飛び越し、空bump、新規rev>1 |

## 3. 実装束縛表

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-NFRREG-001 | exact schema | unknown fieldを受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-002 | identity | 不正ID・revision・重複を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-003 | taxonomy | family混在・未知qualityを受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-004 | authority role | authority欠落・role/layer不整合を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-005 | authority分離 | compatibility authority・field混在を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-006 | source束縛 | digest drift・repo escapeを受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-007 | measurement context | surface・metric・context欠落を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-008 | sampling | method別value/unit違反を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-009 | baseline | union不整合を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-010 | objective宣言 | target・SLO・budget・limit不整合を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-011 | freshness | age・representativeness範囲外を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-012 | threshold | metric・unit・comparator不整合を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-013 | window／probe | write probe・実装詳細を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-014 | accountability | oracle・evidence・owner・trigger欠落を受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-015 | required trace | 001..003 partialを受理したらRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-016 | pure／deterministic | 入力変更・結果driftがあればRed | `tests/nfr-registry.test.ts` |
| U-NFRREG-017 | migration | stable ID削除・revision違反を受理したらRed | `tests/nfr-registry.test.ts` |
| IT-NFRREG-001 | doctor構造境界 | missing・invalid・schema driftがgreenならRed | `tests/nfr-registry-doctor.test.ts` |
| IT-NFRREG-002 | doctor required trace | production partialがgreenならRed | `tests/nfr-registry-doctor.test.ts` |

## 4. fixture 方針

- valid base fixtureから1観点だけを変える。
- object cloneは`structuredClone`を使い、前caseのmutationを次caseへ持ち越さない。
- source digest caseは一時rootにcanonical bytesを書き、bytes変更・`../`・symlink相当のrealpath境界を判定する。
- failureは`ok:false`に加えてexpected failure codeを含むことを確認する。
- taxonomyは定数配列を全走査し、代表1件だけで「9+7対応」と主張しない。

## 5. migration matrix の検証

| previous | candidate | expected |
|---|---|---|
| revision 1、内容A | revision 2、内容B | accept |
| revision 1、内容A | revision 2、内容A | empty bump failure |
| revision 1、内容A | revision 1、内容B | not incremented failure |
| extra stable IDあり | extra ID削除 | entry removed failure |
| revision 2（変更前） | revision 1（変更後） | regressed failure（逆行） |
| ID新規追加 | revision 2 | new-entry revision failure |

## 6. 実行と受入

```text
npm exec -- vitest run tests/nfr-registry.test.ts tests/nfr-registry-doctor.test.ts
npm run typecheck
```

全oracle green、型エラー0、formatter差分0を要求する。targeted greenをfull CIの代替にはしない。

## 7. trace

| requirement | unit oracle |
|---|---|
| `HR-NFR-REG-001` | 001、002、006..017 |
| `HR-NFR-REG-002` | 004、005、013 |
| `HR-NFR-REG-003` | 003、015 |
