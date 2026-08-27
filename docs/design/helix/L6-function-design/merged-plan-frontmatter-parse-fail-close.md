---
title: "merged-plan-status frontmatter parse failure fail-close機能設計"
layer: L6
artifact_type: design
status: draft
created: 2026-08-27
updated: 2026-08-27
owner: Codex / TL
plan: docs/plans/PLAN-L7-689-merged-plan-frontmatter-parse-fail-close.md
pair_artifact: docs/test-design/helix/L8-merged-plan-frontmatter-parse-fail-close-unit-test-design.md
github_issue_id: 1001
behavior_contract_id: PLAN-FRONTMATTER-PARSE-FAIL-CLOSE-001
responsibility_owner: merged-plan-status
---

# merged-plan-status frontmatter parse failure fail-close機能設計

## 責務とauthority

本設計は、`merged-plan-status` がPLAN frontmatterを読み込む際に発生するparse failureを、
deliverableの空集合へ縮退させず、型付きviolationとしてcurrent gateへ投影する境界を定義する。
PLANのartifact ownership、V-model pair、既存のS3 PoC例外は既存authorityを維持し、parse failureの
可視化だけを本sliceの責務とする。YAML parserの一般的な例外処理や別のlint gateはこの設計へ統合しない。

## 入出力とDbC

| 関数／境界 | 入力 | 出力 | 契約 |
|---|---|---|---|
| `parsePlanDeliverables` | PLAN ID、frontmatter文字列 | typed deliverableまたはparse failure | frontmatter境界、YAML root、`generates`／`modifies`、artifact pathを検証し、失敗理由を固定する |
| merged-plan loader | PLAN集合 | `MergedPlanStatusInput` | PLAN IDと`PLAN_FRONTMATTER_PARSE_FAILED`を束縛し、失敗PLANを集合から除外しない |
| analyzer | loader結果 | deterministic violation | parse failureを`ok=true`や空のdeliverableとして投影しない |
| message surface | violation | 非機密メッセージ | raw YAML、token、credential、secretを出力しない |

前提はrepo-relativeなPLAN frontmatterを読み込むこと、事後条件はparse不能なPLANが必ず
`ok=false`の判定へ到達することとする。入力のshapeや例外を推測で補完せず、最初の失敗理由を
後段のsuccessで相殺しない。

## 失敗マッピング

- frontmatter欠落、delimiter不整合、YAML構文エラー、mapping以外のrootは
  `PLAN_FRONTMATTER_PARSE_FAILED`へ閉じる。
- `generates`／`modifies`が配列でない、entryがmappingでない、`artifact_path`が欠落・非文字列・
  空値の場合も同じfailure codeへ正規化する。
- failure recordはPLAN ID、failure code、非機密の分類だけを保持し、原文fragmentを保持しない。
- 正常な`generates`、published-baseに存在する`modifies`、既存S3 PoC exceptionは従来の判定を返す。

## 所有権とtrace

本sliceで新設するL6設計とL8テスト設計は相互の`pair_artifact`で結ぶ。PLANはL6を
`parent_design`および`generates`へ明示し、L8 oracleは`tests/merged-plan-status.test.ts`へ引用する。
既存の共有L6／L8文書を本sliceの都合で向け替えない。catalogとreviewed digestは新設設計を
採用した事実を投影する既存surfaceとして更新し、別のdesign authorityを追加しない。

## 非対象

`helix plan lint`が投げる別責務のYAMLParseError、DB schema、通知経路、review evidenceの真正性、
status confirmの自動化は対象外とする。これらをparse failureの修正で完了扱いにしない。

## Oracle対応

U-MPS-001〜015はfrontmatter境界、shape、failure provenance、redaction、正常系、ownership、
S3 exception、mutation reachabilityをそれぞれ検証する。loaderのparse failure分岐を空集合へ戻す
mutationと、analyzerがfailureを無視するmutationの双方を、専用L8設計から実行可能testへ結線する。
