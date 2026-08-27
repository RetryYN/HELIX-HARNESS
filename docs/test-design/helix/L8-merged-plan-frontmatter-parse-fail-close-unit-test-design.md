---
title: "merged-plan-status frontmatter parse failure L8単体テスト設計"
canonical_layer_scheme: L1-L12
layer: L8
executed_at_layer: L7
artifact_type: test_design
sub_doc: unit-test-design
status: draft
created: 2026-08-27
updated: 2026-08-27
owner: QA / Codex TL
plan: docs/plans/PLAN-L7-689-merged-plan-frontmatter-parse-fail-close.md
pair_artifact: docs/design/helix/L6-function-design/merged-plan-frontmatter-parse-fail-close.md
github_issue_id: 1001
behavior_contract_id: PLAN-FRONTMATTER-PARSE-FAIL-CLOSE-001
responsibility_owner: merged-plan-status
---

# merged-plan-status frontmatter parse failure L8単体テスト設計

本書は、PLAN frontmatterを読み込む`merged-plan-status`のparse failure fail-close契約を、
実行可能な`tests/merged-plan-status.test.ts`へ降ろすためのL8 oracleを定義する。壊れた入力を
空集合へ正規化して成功扱いする退行を、入力shapeごとに個別検出する。

| U-ID | 対象 | 正例 | 反例／mutation | 実行先 |
|---|---|---|---|---|
| U-MPS-001 | frontmatter境界 | 開閉delimiterを持つmappingを読む | delimiter欠落を成功扱いしない | `tests/merged-plan-status.test.ts` |
| U-MPS-002 | YAML parse | 構文正しいmappingを読む | malformed YAMLを`PLAN_FRONTMATTER_PARSE_FAILED`へ閉じる | 同上 |
| U-MPS-003 | root shape | mapping rootを受理する | sequence／scalar rootを空PLANとして受理しない | 同上 |
| U-MPS-004 | generates shape | artifact objectの配列を読む | `generates`のscalar／mapping／不正配列を拒否する | 同上 |
| U-MPS-005 | modifies shape | artifact objectの配列を読む | `modifies`のscalar／mapping／不正配列を拒否する | 同上 |
| U-MPS-006 | artifact entry shape | mapping entryを読む | null／sequence／scalar entryを拒否する | 同上 |
| U-MPS-007 | artifact_path | 非空string pathを読む | 欠落／非string／空値を拒否する | 同上 |
| U-MPS-008 | failure provenance | PLAN IDとfailure codeをtyped metadataへ束縛する | parse failureを`return []`で隠さない | 同上 |
| U-MPS-009 | analyzer projection | parse failureがdeterministic violationになる | loader failureを`ok=true`へ投影しない | 同上 |
| U-MPS-010 | redaction | generic failure messageを返す | raw YAML、credential、secretをmessageへ出さない | 同上 |
| U-MPS-011 | generates正常系 | published artifactのstatus判定を維持する | parse修正で正常なgenerated pathを落とさない | 同上 |
| U-MPS-012 | modifies既存ownership | published baseにあるmodifyを正常扱いする | parse修正で既存modifyをnew deliverable扱いしない | 同上 |
| U-MPS-013 | modifies新規path | 不正なnew modifyを検出する | published base未存在pathをsuccessへしない | 同上 |
| U-MPS-014 | S3 PoC例外 | 既存のS3 PoC exceptionを維持する | fail-close追加で既存例外を壊さない | 同上 |
| U-MPS-015 | mutation reachability | loader／analyzerの両経路を実行する | parse failure分岐を削除・空集合化するmutationをkillする | 同上 |

## Red／Green／mutationの受入境界

各shapeの壊れたfrontmatterは、PLAN IDを保持した型付きfailureと非機密の診断へ閉じる。
正常系の`generates`、published-base `modifies` ownership、S3 PoC exceptionは既存結果と一致させる。
loaderがparse failure時に空配列を返す、またはanalyzerがfailureを無視するmutationは、対象テストが
少なくとも一つ失敗して検出することを要求する。実行証跡はテスト出力digestとcurrent HEADへ束縛し、
未実測のreviewや時刻を記録しない。
