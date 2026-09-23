# Draft: 固定BASE AI instruction/adapter 72件の四製品責務候補を研究束へ固定

## 問題

旧AI instruction、provider adapter、consumer templateのうち、既存main研究429件、PR #2078の67件、PR #2090の41件と重ならない未調査範囲を、4製品L1に照らす候補研究として再現可能に固定する。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` のunresolved候補75件から、#2078の3重複を除いた72件を対象化。
- 旧sourceのmanual span、archive blob/type/mode/SHA/MANIFEST、4製品L1/product-boundary候補、counterevidence、phase candidate、implementation evidence、history/failure/consumerを分離して記録。
- independent source auditで72/72 span原文一致、adapter template 34/34、main/#2078/#2090および対象間のID/path-SHA重複0を照合。
- research-only Scaffold Binding、generator、validator、独立source audit、35 ordered negative selfchecksを追加。

## 候補集計

- direct product basis: 28
- multi-product conflict: 41
- insufficient basis: 3
- phase candidate status: unresolved_with_candidate 35、unresolved 22、multi_phase_candidate 11、classified_candidate 4
- legacy implementation status: unknown 72
- consumer closure: pending。Wave semantic edge: 1

## 境界

すべて候補研究であり、formal product/phase/owner/successor/implementation classification、consumer closure、new build permissionを更新しない。`authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`。LABO分類は適用しない。旧archive runtime/source/test/hook/adapter/CIは実行していない。

## 検証

全検証PASS: independent source auditは72/72 source span、34/34 adapter template、overlap 0。generatorは72 records・カテゴリ28/41/3を出力。validator PASS、ordered negative cases 35件すべて期待errorで拒否、`py_compile` PASS、`scaffold/tools/scfctl.py validate`は132 bindings/fail=0、`git diff --check` PASS。意味解釈の採否は人間判断待ちであり、このPR draftはレビュー依頼や採用を意味しない。

## 依存・停止条件

比較対象pin: main `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204`、PR #2078 `8c8cf851b47c88f6d814dc828a38743fc3cd45b3`、PR #2090 `ef3e1de17f8cd3818d38d5ff9ca512d2eb62f9ac`。#2078は67件source set、#2090は41件config setの重複排除とsnapshot digestの直接依存です。#2092は#2078とmainのoverlap reconciliationを扱うため、最終target/exclusion集合を確定する前提です。#2091はSCF-B-0118 validator修正であり、この72件source集合の直接依存ではありません。

現在のmain確定数は429/4020であり、この72件はmainの確定数に加算しません。429 + #2078の67 + #2090の41 + この候補72 = 609は、未統合Draft PRを含む条件付きprojectionにすぎません。#2092のreconciliation後に重複集合とprojectionを再計算します。

#2078/#2090/#2092の統合後、mainと両PRの実HEADを再取得してbaseと排他集合を照合します。候補72件のID/source path-SHAに差分またはoverlapが出た場合は、このPRのreviewに進まず、profile、inventory、Binding、source audit、validatorを再生成・再検証します。PR作成側ではreview依頼、merge、Issue closeを行いません。
