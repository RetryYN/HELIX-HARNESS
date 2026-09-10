---
title: "compatibility-only PLANへの現行依存を遮断する詳細設計"
layer: L6
status: draft
plan: docs/plans/PLAN-RECOVERY-1591-compatibility-parent-trace.md
parent_design: docs/design/helix/L6-function-design/typed-plan-workflow-identity.md
pair_artifact: docs/test-design/helix/L8-plan-compatibility-parent-trace.md
---

# 現行PLANとhistorical provenanceの分離

## 上流と責務

Issue #1591、要件v1.3 §1のcompatibility input境界、既存typed PLAN identityの
`U-TPWLEG-001..004`を具体化する。責務ownerは`legacy-authority-migration`である。
既存資産は`frontmatter.ts`、`plan/lint.ts`、digest付き951件inventory、その既存loaderを再利用する。
旧HELIXのPLAN／trace機能は機能由来であり、現行authorityや旧runtimeの再導入根拠にしない。

## 判定契約

- `docs/plans`の非archived PLANがcurrent依存を出力する場合、inventory登録済みPLANを
  `dependencies.parent`、`requires`、`references`へ指定すると拒否する。
- 参照元自身のinventory所属、旧更新日、confirmed状態、来歴の併記は免除条件にしない。
- 対象照合はPLAN IDを用い、path、相対path、Windows区切り、fragmentでも迂回できない。
- archived PLANの旧dependencyは互換reader用に保存する。型付き来歴の不正はarchivedでも拒否する。
- inventoryの既存schema／scope／件数／digest検証が失敗した場合は、文書0件でも拒否する。
  件数951とdigestを先行緩和せず、対象PLANの再承認・status昇格は行わない。

## 型付き来歴

frontmatter直下の`historical_provenance`は任意の配列とする。各要素は次のstrict objectである。

| field | 契約 |
|---|---|
| relation | literal `historical_provenance` |
| authority_scope | literal `compatibility_input_only` |
| plan_id | 既存PLAN ID schemaへ適合 |
| path | `docs/plans/PLAN-*.md`の正規相対path |
| reason | 空白だけを許さない来歴保存理由 |

PLAN IDとpathの組をinventoryへexact照合する。余剰field、未知ID、path不一致、重複、
文字列だけの来歴、current scope、parent relationは拒否する。dependency配下への配置も拒否する。
これは現在の実行順序・承認・充足を示さず、dependency／reference edgeへ変換しない。
従来のdependency readerを変更せず、frontmatter readerで型付き情報を保持する。

対案は`dependencies.references`をstring/object unionにする方式である。既存のgraph／DB readerが
同じ配列をcurrent referenceへ投影するため誤投影の影響半径が大きく、独立fieldを採用する。
prose markerだけを置く方式は機械判定できないため採用しない。

## 正規経路と影響範囲

純関数`analyzePlanCompatibilityDependencies`が判定を所有し、既存PLAN loaderとinventory loaderから
snapshotを受け取る。既定`helix plan lint`は他のDB依存gateに先立ち拒否できる。
`--gate governance`／`frontmatter`にも合成するため、既存doctor `plan-governance`から同じ判定を使う。
導入時の既存違反はpath・reason・detailのexact edgeを機械生成baselineへ固定する。baseline外の追加・変更は
同じPLAN内でもfail-closeし、解消済みedgeは再登録せず単調減少させる。DBのauthoritative writeは本sliceの対象外とする。

## 実consumer移行の分割境界

| 後続PLAN | 現在の依存先／保持する来歴 |
|---|---|
| PLAN-L3-70 | CI性能要件へparentを移し、PLAN-L3-22を来歴へ保存 |
| PLAN-L6-81 | 経路選択を所有するGitHub自律運用要件へparentを移し、PLAN-L3-19を来歴へ保存 |
| PLAN-L7-462 | Issue closeを所有するGitHub自律運用要件へparentを移し、PLAN-L3-19を来歴へ保存 |
これら3件とPLAN-L3-36／52は本validator PRへ混載しない。各PLANのworkflow identityとownerを保った
原子migration PRで処理し、既承認要求の意味を変えない。

## 残義務

全inventoryに対する既存current consumerはexact-edge baselineで可視化し、新規増加を拒否する。
本sliceは既存edgeをexact baselineへ固定し、増加を拒否する。上記5件を含む残存edge、DB projection／replay、
main read-afterでconsumer 0が成立するまでは#1591全体の終端・完了を主張しない。
