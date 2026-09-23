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

独立source audit、generator、validator、35 negative cases、`py_compile`、`scaffold/tools/scfctl.py validate`、`git diff --check`を予定する。意味解釈の採否は人間判断待ちであり、このPR draftはレビュー依頼や採用を意味しない。

## 依存・作成状態

比較対象pin: main `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204`、PR #2078 `8c8cf851b47c88f6d814dc828a38743fc3cd45b3`、PR #2090 `ef3e1de17f8cd3818d38d5ff9ca512d2eb62f9ac`。現在4件の関連Draft PRが進行中のため、この変更のPRは未作成。依存関係と既存レビュー結果を確認後に作成可否を判断する。
