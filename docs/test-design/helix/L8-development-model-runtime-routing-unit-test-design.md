---
title: "Development model runtime routing L8単体テスト設計"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-01
updated: 2026-08-01
owner: QA
plan: docs/plans/PLAN-L5-83-development-model-runtime-routing.md
pair_artifact: docs/design/helix/L5-detail/development-model-runtime-routing.md
---

# Development model runtime routing L8単体テスト設計

| Oracle | 正例 | 反例／mutation |
|---|---|---|
| U-RUNTIMEAXIS-001 | development style exact 3、case exact 2 + null、change route exact 8 + null | V_DESIGN_SCRUM_IMPLEMENTATION欠落、PoCをstyleへ追加、unknown route、文字列`none`を拒否 |
| U-RUNTIMEAXIS-002 | scaffoldが4 current fieldを生成 | `drive_models`生成、current field欠落を拒否 |
| U-RUNTIMEAXIS-003 | catalog／rebuildが4 current applicability列を同値投影 | legacy値をcurrent列へ変換、legacy列をcurrent tokenへ出力するmutationを拒否 |
| U-RUNTIMEAXIS-004 | plan/skillの同じaxisだけを独立加点 | `drive_models`一致による加点、case一致でstyle不一致を相殺するmutationを拒否 |
| U-RUNTIMEAXIS-005 | `kind=poc` S3/S4を`scrum_type`無しで受理し、任意`case_type`を検証 | PoCをScrum phase化、scrum_type必須化、unknown case typeを拒否 |
| U-RUNTIMEAXIS-006 | plan_registryへ4 current fieldを再現可能に投影 | style候補空集合のadmit／Full V補完、plan ID／kind／route_modeからの暗黙補完を拒否 |
| U-RUNTIMEAXIS-007 | current-location／CLIが4軸matched/source fieldを出力 | `selected_model`／`workflow_modes`／`matched_drive_models`／`source_drive_models`出力を拒否 |
| U-RUNTIMEAXIS-008 | legacy `drive_models`をcompatibility parseできる | legacy-only successでcurrent recommendationを生成するmutationを拒否 |
| U-RUNTIMEAXIS-009 | current field欠落skillを`compatibility_only`として除外 | 52未backfillskillをcurrent candidateへ混入するmutationを拒否 |
| U-RUNTIMEAXIS-010 | specialist processをstyle/caseと別集合で照合 | Design HARNESSをstyle、case、layerへ変換するmutationを拒否 |

上記10件のruntime test citationはIssue #248実装時までpendingであり、本設計PRではcoveredと主張しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DESIGNCOV-013 | 新規L5設計のadmission | catalogだけの追記、stale fingerprint、stale reviewed digestを拒否 | `tests/design-coverage.test.ts` |

## 実行単位

- Fast: assignment、scaffold、frontmatter、catalog、recommendation、current-locationのtargeted test。
- Integration: DB rebuildを2回行いprojection/checkpoint digest一致、legacy current-output 0を確認する。
- Full admission: final candidate HEADでfull CIを1回だけ実行する。

## Mutation閉鎖

exact enumから1値を削除／追加する、legacy columnをscoreへ戻す、`scrum_type`必須条件を戻す、
CLI legacy keyを1件復活させる、missing current fieldをlegacy変換する各mutationが最低1 oracleをredにする。
