---
title: "measurement evidence evaluator 基本設計"
layer: L4
artifact_type: design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L4-74-measurement-evidence-evaluator.md
pair_artifact: docs/test-design/helix/L9-measurement-evidence-evaluator-system-test-design.md
---

# measurement evidence evaluator 基本設計

## 1. 目的と authority

本設計は Issue #220、`HR-NFR-REG-004/006`、requirements受入条件
「未測定・stale・閾値未達でcompletionを拒否する」を measurement evaluation contractへ降ろす。
declaration authorityは `config/nfr-registry.json` と Issue #219 の typed contractであり、
evaluatorがregistry schema、threshold policy、観測値を補完または書換えることは禁止する。

## 2. 責務境界

| component | 責務 | 禁止事項 |
|---|---|---|
| typed declaration（#219） | metric、context、freshness policy、threshold、windowを宣言 | observationやverdictを書かない |
| immutable observation | 実測値と測定context、HEAD、evidence digest、時刻を運ぶ | 推測値や欠落値をmeasuredへ偽装しない |
| pure evaluator（#220） | declarationとobservationを比較し独立statusとfindingを返す | clock read、probe、network、DB writeをしない |
| probe/history（#221） | bounded probe実行とappend-only時系列join | evaluator policyやdeclarationを書換えない |
| completion consumer | verdictとfindingを既存completion判断へ入力 | unknown／failをgreenで相殺しない |

## 3. 入力の束縛

observationは少なくとも次をimmutableに保持する。

- `nfr_id`、registry `revision`、metric ID、unit。
- workload ID、環境profile ID、data referenceのdigest。
- sampling方式、sample件数、代表性ratio。
- window kind/value/unitと観測開始・完了時刻。
- measured HEAD、evidence digest、観測値、baseline run reference。
- callerが注入するtrusted evaluation time。

文字列名が似ている、同じmetric値である、最新らしく見えるという理由でbindingを補完しない。
evaluatorのdeclaration bindingはNFR ID、revision、metric／unit、workload、environment、sampling、windowを
exact比較する。data digest、measured HEAD、evidence digestはobservation identityであり、declarationに
期待値がないためbinding軸へ捏造しない。current HEADとprobe datasetのadmissionは#221が担う。

## 4. 独立評価軸

| 軸 | status | 成立条件 |
|---|---|---|
| binding | `match | mismatch | unknown` | declarationのNFR ID、revision、metric、unit、workload、environment、sampling、windowが明示一致 |
| freshness | `current | stale | unknown` | trusted timeとcompleted timeがparse可能で、ageが`max_age_seconds`以内 |
| representativeness | `representative | non_representative | unknown` | sample countとratioが宣言sampling／minimum ratioを満たす |
| threshold | `pass | fail | unknown` | finite value、同一unit、既知comparatorで境界を宣言どおり比較 |
| baseline | `usable | unknown | mismatch` | measured baselineが同じcontract/contextへ束縛される |
| hard limit | `pass | fail | unknown` | 宣言済みlimitを超えず、未宣言時の扱いがpolicyで明示される |

`between`、inclusive/exclusive、`higher_is_better`／`lower_is_better`／`in_range`を
別々の意味として扱う。小数境界、ゼロ、負値をtruthy/falsyへ変換しない。

## 5. 最終 verdict と unknown propagation

最終`green`は、binding=`match`、freshness=`current`、representativeness=`representative`、
threshold=`pass`、baseline=`usable`、hard limit=`pass`が全て成立した場合だけ導出する。
いずれかが`fail`／`mismatch`なら`red`、それ以外に`unknown`があれば`unknown`とする。

baseline未取得、baselineとobservationのHEAD／dataset不一致、stale、非代表sample、単位不明、推測値、
NaN／Infinity、hard limit不明をgreenへ縮退しない。複数findingはstable code順で全件返し、最初の失敗だけで
後続軸を捨てない。binding／representativenessのunknownはschema v1の将来予約である。

## 6. HR-NFR-REG-004/006 の投影

DB size、query/projection p95/p99、lock待機、busy timeout縮退、rebuild、archive/vacuum、
並行runtime、soakは、固有booleanではなく同じdeclaration／observation／evaluation contractを使う。
単一障害の未再現原因はfinding detailへ「確定」と記録せず、観測事実とcausal hypothesisを分離する。

property、model-based state machine、differential、mutation、fuzz、snapshot compatibilityは
riskに応じてevaluatorの反証へ使う。手法が存在するだけではmeasurement currentやcompletion greenにしない。

## 7. trace と L9 pair

| authority | 設計面 | L9 oracle |
|---|---|---|
| `HR-NFR-REG-004` | 共通context、freshness、代表性、p95/p99等の同一評価 | `IT-MEVAL-001..004` |
| `HR-NFR-REG-006` | 比較方向・境界・unknown propagationの反証可能性 | `IT-MEVAL-003..005` |
| requirements §10 | 未測定／stale／閾値未達／hard limit超過のcompletion拒否 | `IT-MEVAL-001..005` |

L9はproduction evaluatorとcompletion consumerの結線を検証するが、probe実行とDB履歴は#221まで要求しない。

## 8. 設計実在性束縛

実装assetとfailure witnessはL7実装sliceのcurrent HEADで追加検証する。設計段階で未確定の実在性を
先取りして受理しない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
