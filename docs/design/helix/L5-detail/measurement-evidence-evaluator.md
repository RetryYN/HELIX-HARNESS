---
title: "measurement evidence evaluator 詳細設計"
layer: L5
artifact_type: design
status: draft
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L5-101-measurement-evidence-evaluator.md
pair_artifact: docs/test-design/helix/L8-measurement-evidence-evaluator-unit-test-design.md
---

# measurement evidence evaluator 詳細設計

## 1. schema authority と責務

schema versionは`helix-measurement-evaluation.v1`とする。入力はIssue #219の受理済みtyped NFR entry、
immutable observation、caller注入のtrusted evaluation timeから成る。declarationの構造検査は
NFR registry authorityへ委ねるが、evaluatorは参照ID、revision、metric、unit、contextを再照合する。

本schemaはprobe command、retry、scheduler、DB path、SQL、history rowを持たない。これらは#221の責務である。

## 2. 評価入力のexact set

rootは次の4 fieldだけを持つ。unknown field、欠落field、入力objectのmutationを拒否する。

| field | contract |
|---|---|
| `schema_version` | exact `helix-measurement-evaluation.v1` |
| `declaration` | 受理済み`helix-nfr-registry.v1` entryのread-only value |
| `observation` | §3のexact object |
| `evaluated_at` | caller注入のUTC RFC 3339 instant |

`evaluated_at`をwall clockから取得しない。timezone欠落、invalid date、leap normalizationはinput admissionを
`evaluation_time_invalid`で拒否する。有効なUTC instantだがobservation完了時刻より前なら、構造違反へ丸めず
freshness=`unknown`と`freshness_evaluated_before_completion` findingを返す。

## 3. 不変observationのexact set

| group | fields |
|---|---|
| identity | `observation_id`、`nfr_id`、`registry_revision` |
| metric | `metric_id`、`unit`、`value` |
| context | `workload_id`、`environment_profile_id`、`data_digest` |
| sampling | `sampling_method`、`sample_count`、`representativeness_ratio` |
| window | `window_kind`、`window_value`、`window_unit`、`started_at`、`completed_at` |
| evidence | `measured_head`、`evidence_digest`、`baseline_binding` |

IDは非空、revisionとsample countはpositive safe integer、ratioはfiniteかつ`0..1`、valueとwindow valueは
finiteとする。digestは`sha256:<64 hex>`、HEADは40 hexとし、短縮SHAやbranch名を受理しない。

`started_at <= completed_at`をinput admissionで要求する。`completed_at <= evaluated_at`はfreshness判定で扱う。
宣言windowとobservation windowはkind／value／unitがexact一致しなければbinding mismatchであり、秒への
暗黙換算や文字列の類似一致をしない。

unknown field、欠落field、型／range／時刻形式違反はresultの6軸へ押し込まず、
`MeasurementEvaluationAnalysis = { ok: true; value: result } | { ok: false; failureCodes; messages }`の
input admission failureとして返す。failure codeは`evaluation_schema_invalid`、`observation_invalid`、
`baseline_binding_invalid`、`evaluation_time_invalid`の固定順とする。

## 4. baseline束縛union

| kind | exact fields | 意味 |
|---|---|---|
| `unknown` | `status`、`reason` | baseline未取得。green禁止 |
| `measured` | `status`、`run_id`、`nfr_id`、`registry_revision`、`metric_id`、`unit`、`workload_id`、`environment_profile_id`、`data_digest`、`window_kind`、`window_value`、`window_unit`、`measured_head`、`evidence_digest`、`value` | 同一contract/contextへ束縛できる候補 |

`measured`でも一つでもcontextが異なればbaseline=`mismatch`とする。current observationからbaseline fieldを
補完せず、値が等しいだけでusableにしない。

## 5. 評価resultのexact set

resultは次だけを持つ。

- `schema_version`、`nfr_id`、`observation_id`、`evaluated_at`。
- `binding` (`match|mismatch|unknown`)。
- `freshness` (`current|stale|unknown`)。
- `representativeness` (`representative|non_representative|unknown`)。
- `threshold` (`pass|fail|unknown`)。
- `baseline` (`usable|mismatch|unknown`)。
- `hard_limit` (`pass|fail|unknown`)。
- `verdict` (`green|red|unknown`)。
- `findings`（§6のread-only配列）。

`green`は6 statusがそれぞれ`match/current/representative/pass/usable/pass`の場合だけである。
明示failure／mismatchが一つでもあれば`red`、failureがなくunknownが一つでもあれば`unknown`とする。

## 6. stable finding契約

finding exact setは`code`、`axis`、`severity`、`message`、`expected_ref`、`observed_ref`とする。
severityは`error|unknown`、axisは6 statusのいずれかである。raw evidence、credential、PII、absolute pathを
messageへ含めない。codeは次の固定順でdedupeする。

1. `binding_*`
2. `freshness_*`
3. `representativeness_*`
4. `threshold_*`
5. `baseline_*`
6. `hard_limit_*`

複数軸を評価し、最初のfailureで打ち切らない。同一入力はfinding配列を含めbyte-equivalentな意味結果を返す。

## 7. comparator と境界

comparator authorityはregistry実装がexportする`NfrEntryV1["threshold"]["comparator"]`のexact union
`lt|lte|eq|gte|gt|between`である。これを宣言どおり評価する。`between`はlower／upperとinclusive flagを使い、
`lower <= upper`はregistry admission済みでも再検証不能ならunknownとする。`higher_is_better`、
`lower_is_better`、`in_range`をcomparatorへ暗黙変換しない。

freshnessは`age_seconds <= max_age_seconds`をcurrentとする。representativenessはsample countが宣言minimum以上、
かつratioがminimum ratio以上の場合だけrepresentativeとする。境界同値を一貫してinclusiveに扱う。

## 8. L8 pair と後続境界

`U-MEVAL-001..015`がschema、binding、time、sampling、comparator、baseline、hard limit、verdict、finding、
immutabilityを担当する。L6/L7でproduction evaluatorとtestsへcitationを追加した時点でL8 statusをconfirmedへ
遷移する。probe実行とappend-only metric historyは#221まで要求しない。

## 9. 設計実在性束縛

runtime assetとfailure witnessはL6/L7実装sliceで追加する。未実装の型やfailure codeを現時点で実在扱いしない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [],
  "assets": [],
  "failure_reachability": []
}
```
