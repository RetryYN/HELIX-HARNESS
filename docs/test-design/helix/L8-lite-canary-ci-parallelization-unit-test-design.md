---
title: "Lite canary CI parallelization単体・workflowテスト設計"
layer: L8
executed_at_layer: L7
sub_doc: unit-test-design
artifact_type: test_design
status: confirmed
created: 2026-08-26
updated: 2026-08-26
owner: QA / TL
plan: docs/plans/PLAN-L7-682-lite-canary-ci-parallelization.md
pair_artifact: docs/design/helix/L6-function-design/lite-canary-ci-parallelization.md
---

# Lite canary CI parallelization単体・workflowテスト設計

| U-ID | 対象 | 反例と期待結果 | test citation |
|---|---|---|---|
| U-LITECI-001 | closure非接触PR | fast profile／manifest／closureがgreenで非接触変更なら `authorized_skip:closure_unaffected` | `tests/impact-ci.test.ts` |
| U-LITECI-002 | fail-close selector | closure接触、削除、rename、generated dependency、manifest、uncertainty、path read failure、stale digest、fast check各失敗を `required` にする | `tests/impact-ci.test.ts` |
| U-LITECI-003 | context boundary | main push、nightly、release-candidate dispatchは非接触でも `required` にする | `tests/impact-ci.test.ts` |
| U-LITECI-004 | digest binding | source HEADとcandidate HEADの不一致をstale digestとして `required` にする | `tests/impact-ci.test.ts` |
| U-LITECI-005 | auxiliary coverage | Windows durability実装／テストまたはLite配布文書入力の変更をclosure接触として `required` にする | `tests/impact-ci.test.ts` |
| U-DISTCLOSE-016 | fast check | 同一repo HEADでprofile、manifest projection、dependency closureを検査し、path read failureを型付きで返す | `tests/distribution-dependency-closure.test.ts` |
| U-DISTCLOSE-017 | coverage source存在 | 配布文書／Windows durability coverage sourceの欠落を `path_read_failed` と `closure_ok=false` へ倒す | `tests/distribution-dependency-closure.test.ts` |
| U-DISTCLOSE-018 | coverage transitive closure | Windows durability／Lite canary coverage pathから到達する推移import依存もclosureへ含め、変更時に `required` へ倒す | `tests/distribution-dependency-closure.test.ts` |
| U-LITECI-WF-001 | selector wiring | workflowが毎回 `lite-canary-selector` を起動し、heavy stepsを `required` に限定し、typed lane statusへ束縛する | `tests/harness-check-workflow.test.ts` |
| U-LITECI-WF-002 | job DAG | LiteとFullに相互 `needs` がなく、Windowsの依存先がLinux Lite jobだけである | `tests/harness-check-workflow.test.ts` |
| U-LITECI-WF-003 | aggregate oracle | 全laneについて success または `authorized_skip:closure_unaffected` だけを受理し、untyped skipを拒否する | `tests/harness-check-workflow.test.ts` |
| U-LITECI-WF-004 | relation graph projection | `docs/design/design-catalog.yaml` を design node として投影し、変更impactで `missing-projection` を返さない | `tests/relation-graph-loader.test.ts` |

## 検証方針

selectorは純粋な入力契約を table test で厚く検証し、filesystem／Gitの fast check は
distribution closure test で実体を確認する。workflow testは YAML の job dependency、
step condition、output binding、aggregate の受理集合を mutation oracle として検査する。
全ての失敗経路は軽い lane の成功へ丸めず、heavy canaryまたは最終 aggregate failureへ到達する
ことを受入条件とする。
