---
title: "typed skill applicability runtime routing L8単体テスト設計"
layer: L8
sub_doc: unit-test-design
artifact_type: test_design
executed_at_layer: L7
kind: add-design
status: draft
created: 2026-08-01
updated: 2026-08-26
owner: QA
plan: docs/plans/PLAN-L5-83-development-model-runtime-routing.md
pair_artifact: docs/design/helix/L5-detail/development-model-runtime-routing.md
---

# typed skill applicability runtime routing L8単体テスト設計

| Oracle | 正例 | 反例／mutation |
|---|---|---|
| U-SKAPP-001 | requirementsとclassification registryのversion／digestを同時検証 | 片方のdigest、version、source pathを変えたregistryを拒否 |
| U-SKAPP-002 | positive／negative typed pairを別集合で受理 | unknown identity、axis mismatch、duplicate、polarity conflict、空positiveを拒否 |
| U-SKAPP-003 | legacy一意tokenをtyped pairへ変換しsource warningを返す | `Forward`／`Scrum`をambiguous、unknownをunsupportedとして拒否 |
| U-SKAPP-004 | scaffoldがtyped pairと極性だけを生成 | `drive_models`または旧4軸固定fieldの再生成を拒否 |
| U-SKAPP-005 | DBがpair＋polarityを正規化行として再現可能に投影 | CSV／単一model fieldへの畳み込みとlegacy列のcurrent利用を拒否 |
| U-SKAPP-006 | recommendationが同一typed pairだけを理由にする | 別axis一致による相殺、negative一致、legacy一致加点を拒否 |
| U-SKAPP-007 | current-location／CLIがtyped pairとregistry bindingを出力 | `matched_drive_models`／`source_drive_models`再出力を拒否 |
| U-SKAPP-008 | `kind=poc` S3/S4を`scrum_type`無しで受理 | PoCをScrum phase化、scrum_type必須化を拒否 |
| U-SKAPP-009 | legacy-only skillを`compatibility_only`として除外 | #322前のskillをcurrent candidateへ混入するmutationを拒否 |
| U-SKAPP-010 | CLIがtyped pairをscaffoldへ渡し、legacy一意tokenはinput-only変換する | current／legacy併記、曖昧`Forward`／`Scrum`、unknown tokenを拒否 |

U-SKAPP-001〜003は`tests/skill-applicability-registry.test.ts`、U-SKAPP-004／009／010は
assignment／scaffold／CLIのtargeted testへ接続済み。U-SKAPP-005〜008は#248の後続原子sliceで接続し、
authoringだけでDB／recommendation移行完了を主張しない。

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-DESIGNCOV-015 | 新規L5設計のadmission | catalog item未登録と凍結baselineへの不正追加を拒否 | `tests/design-coverage.test.ts` |
| U-DESIGNCOV-016 | catalog digestのG3再束縛 | reviewed owner、G3 packet、freeze oracleの1面でも旧digestなら拒否 | `tests/l3-g3-freeze-packet-v2.test.ts` |

reviewed digestのstale検出は既存owner `tests/l3-progression-authority.test.ts` の
`verifyL3ProgressionAuthority` oracleへ委譲する。`U-DESIGNCOV-016`はG3 packetとfreeze oracleを
current catalog digestへ束縛する責務だけを持ち、reviewed ownerの検出実装を重複させない。

## 実行単位

- Fast: registry loader、typed value object、assignment、scaffold、frontmatter、catalog、recommendation、current-locationのtargeted test。
- Integration: DB rebuildを2回行いprojection／checkpoint digest一致、legacy current-output 0を確認する。
- Full admission: final candidate HEADでfull CIを1回だけ実行する。

## Mutation閉鎖

registry digestをずらす、polarity conflict拒否を外す、legacy columnをscoreへ戻す、`scrum_type`必須条件を戻す、
CLI legacy keyを1件復活させる各mutationが最低1 oracleをredにする。
