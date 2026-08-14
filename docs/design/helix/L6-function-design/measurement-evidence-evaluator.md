---
title: "measurement evidence evaluator 機能設計"
layer: L6
artifact_type: design
status: confirmed
created: 2026-08-14
updated: 2026-08-14
owner: Codex / TL
plan: docs/plans/PLAN-L6-107-measurement-evidence-evaluator.md
pair_artifact: docs/test-design/helix/L8-measurement-evidence-evaluator-runtime-unit-test-design.md
---

# measurement evidence evaluator 機能設計

## 1. 公開境界

`evaluateMeasurementEvidence(input: unknown): MeasurementEvaluationAnalysis`をpure functionとして公開する。
成功はimmutableな`MeasurementEvaluationResultV1`、input admission失敗はordered failure codeとredacted messageを返す。
例外、clock、filesystem、network、DB、probe processを使用しない。

## 2. 処理順序

1. root、observation、baseline unionのexact key setとscalar rangeを検査する。
2. declarationは受理済み`NfrEntryV1`として扱い、evaluatorが利用するfieldの存在と型だけをdefense-in-depthで確認する。
3. binding、freshness、representativeness、threshold、baseline、hard limitを互いに独立して全件評価する。
4. findingを6軸の固定構築順で追加する。各軸は最大1件だけを生成し、重複を構造的に作らない。
5.一つでもfailure/mismatchならred、failureなしでunknownがあればunknown、全軸成立時だけgreenを返す。

## 3. 軸判定

- binding: declarationがauthorityを持つNFR ID、revision、metric/unit、workload、environment、sampling method、windowをexact比較する。observationのdata digest、full HEAD、evidence digestは不変identity／baseline比較入力であり、期待値を持たないdeclarationとの比較を捏造しない。current HEAD／probe dataset admissionは#221が担う。
- freshness: `evaluated_at - completed_at <= max_age_seconds`をcurrentとする。評価時刻が完了前ならunknown。
- representativeness: sample countとratioを独立比較し、両方inclusiveで満たす場合だけrepresentative。
- threshold: `NfrEntryV1["threshold"]["comparator"]`を直接switchし、betweenはinclusive flagを両端へ適用する。
- baseline: declarationとobservation baselineがmeasuredで、value/unitと全context bindingが一致した場合だけusable。
- hard limit: unknown declarationはunknown。`higher_is_better`は下限、`lower_is_better`は上限としてinclusive比較する。単一値で範囲を表せない`in_range`はunknownへfail-closeする。

## 4. input admissionと時間

unknown／missing key、非finite、unsafe integer、短縮HEAD、不正digest、UTC RFC3339でない時刻、
`started_at > completed_at`は`ok:false`で拒否する。有効な`evaluated_at < completed_at`はinputを拒否せず、
freshness unknownとstable findingへ写像する。この区別によりschema rejectionと測定状態を混在させない。

binding／representativenessの`unknown`はschema v1の将来予約で、現行admissionからは生成しない。
observation時刻が不正な場合は`evaluation_time_invalid`へ一意に写像する。

## 5. 検証束縛

`U-MEVAL-001`、`U-MEVAL-002`、`U-MEVAL-003`、`U-MEVAL-004`、`U-MEVAL-005`、
`U-MEVAL-006`、`U-MEVAL-007`、`U-MEVAL-008`、`U-MEVAL-009`、`U-MEVAL-010`、
`U-MEVAL-011`、`U-MEVAL-012`、`U-MEVAL-013`、`U-MEVAL-014`、`U-MEVAL-015`を
`tests/measurement-evidence-evaluator.test.ts`へ1対1で実装する。
property相当の境界表とmutation-sensitive assertionは同test内へ置き、手法の実行だけをgreen evidenceにしない。

<!-- HELIX:design-reality-binding:v1 -->
```json
{
  "schema_version": "helix-design-reality-binding.v1",
  "declared_failure_codes": [
    "evaluation_schema_invalid",
    "observation_invalid",
    "baseline_binding_invalid",
    "evaluation_time_invalid"
  ],
  "assets": [
    {
      "asset_id": "measurement-evidence-evaluator",
      "classification": "existing_runtime",
      "artifact_path": "src/requirements/measurement-evidence-evaluator.ts",
      "resource_kind": "typescript_export",
      "resource_name": "evaluateMeasurementEvidence",
      "source_digest": "sha256:b959f487d37a19922caee5597fa1679ecaaf3b5979099473d0530c5f7f41f50b",
      "current_authority": true
    }
  ],
  "failure_reachability": [
    { "failure_code": "evaluation_schema_invalid", "asset_id": "measurement-evidence-evaluator", "test_path": "tests/measurement-evidence-evaluator.test.ts", "oracle_id": "U-MEVAL-001" },
    { "failure_code": "observation_invalid", "asset_id": "measurement-evidence-evaluator", "test_path": "tests/measurement-evidence-evaluator.test.ts", "oracle_id": "U-MEVAL-002" },
    { "failure_code": "baseline_binding_invalid", "asset_id": "measurement-evidence-evaluator", "test_path": "tests/measurement-evidence-evaluator.test.ts", "oracle_id": "U-MEVAL-010" },
    { "failure_code": "evaluation_time_invalid", "asset_id": "measurement-evidence-evaluator", "test_path": "tests/measurement-evidence-evaluator.test.ts", "oracle_id": "U-MEVAL-005" }
  ]
}
```
