---
title: "Requirement generated view／DB shadow projection機能設計"
layer: L6
kind: add-design
status: confirmed
created: 2026-07-30
updated: 2026-07-30
owner: Codex / TL
plan: docs/plans/PLAN-L6-90-requirement-generated-view-projection.md
parent_design: docs/design/helix/L6-function-design/requirement-ir-shadow-migration.md
pair_artifact: docs/test-design/helix/L8-requirement-generated-view-projection-unit-test-design.md
---

# Requirement generated view／DB shadow projection機能設計

## §0 位置づけ

PR3の4 stable-ID keyed shardとroot manifestを唯一の入力にし、人間向けMarkdown viewと
既存harness.db内のshadow read modelを決定論的に再構築する。PR5 cutover前なので
JSONと生成viewはいずれも`shadow_noncanonical`であり、現行Markdown正本のauthorityを奪わない。

別DB、別Requirement Engine、canonical writer、direct edit rejectionは作らない。

## §1 公開契約

| API | precondition | postcondition | failure |
|---|---|---|---|
| `loadRequirementIrShadowFromShards(repoRoot)` | manifestと4 shardが存在 | 153/24/72/24とroot digestを再構築 | path escape、kind、count、key、shard/root digest driftをthrow |
| `renderRequirementGeneratedView(shadow)` | `shadow_noncanonical` IR | authority header、人間向け表、semantic markerを生成 | source変更なし |
| `parseRequirementGeneratedView(markdown)` | generator出力 | normalized IRと同一root digestを返す | header、record、count、schema driftをthrow |
| `projectRequirementIrShadow(repoRoot, db)` | schema v40の既存harness.db。manifestがないconsumer／最小fixtureも許容 | manifest存在時は273 rowを単一transaction内へshadow投影し、不在時は0 rowのまま既存rebuildを維持 | manifest存在後のshard欠落、owner/oracle/digest不一致をテストで拒否 |

## §2 生成ビュー

生成先は`docs/generated/requirements/requirement-definition.generated.md`とする。
先頭に「requirements-ir shadowから生成」「PR5 cutoverまではlegacy Markdownがcurrent authority」を表示し、
153 requirements、24 system contracts、72 HAC、24 HATを人間向けtableへ投影する。

record全体のsemantic markerはround-trip parser用であり、JSON authorityの複製ではなく生成物である。
checked-in viewはgenerator出力とbyte一致を要求する。
generated viewはold-authority認識inventoryの入力にせず、JSONとのbyte／semantic parity gateで統制する。
これにより互換語を含む生成表示をcurrent authority候補として誤分類しない。

## §3 harness.db shadow投影

既存schema registryへ`requirement_ir_shadow` tableを1つ追加し、schema revisionを40へ上げる。
列はrecord identity、kind、schema/digest、root digest、owner、oracle、status、source path、authorityだけとし、
要求本文やraw JSONをDBへ複製しない。

2回rebuildで273 rowが完全一致し、次を要求する。

- denominator = 153/24/72/24
- 全rowのroot/record digestがcurrent shardと一致
- requirement／contract／acceptanceのownerがsystem contract rowへ解決
- oracleがsystem test rowへ解決
- stale 0、orphan 0、projection finding 0を維持
- Requirement IRを持たないconsumer／最小fixtureではprojectionを0 rowに保ち、既存DB rebuildを壊さない

## §4 非対象

- JSON canonical cutover、legacy Markdownのgenerated view置換
- 人間編集のproposal event、direct edit rejection
- G1/G3 freeze packet、Design Template JSONの実装
