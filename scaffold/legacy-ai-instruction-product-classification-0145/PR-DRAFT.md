# Draft: 固定BASE AI instruction/adapter 72件の四製品責務候補を研究束へ固定

## 問題

旧AI instruction、provider adapter、consumer templateのうち、既存main研究496件（統合済み#2078の67件を含む）、PR #2090の41件と重ならない未調査範囲を、4製品L1に照らす候補研究として再現可能に固定する。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` のunresolved候補75件から、#2078の3重複を除いた72件を対象化。
- 旧sourceのmanual span、archive blob/type/mode/SHA/MANIFEST、4製品L1/product-boundary候補、counterevidence、phase candidate、implementation evidence、history/failure/consumerを分離して記録。
- independent source auditで72/72 span原文一致、adapter template 34/34、main496/#2090および対象間のID/path-SHA重複0を照合。
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

全検証PASS: independent source auditは72/72 source span、34/34 adapter template、overlap 0。generatorは72 records・カテゴリ28/41/3を出力。validator PASS、ordered negative cases 35件すべて期待errorで拒否、`py_compile` PASS、`scaffold/tools/scfctl.py validate`は133 bindings/fail=0、`git diff --check` PASS。意味解釈の採否は人間判断待ちであり、このPR draftはレビュー依頼や採用を意味しない。

## 依存・停止条件

比較対象pin: main `7afee33ae892fe1a3cf1085fac4e02d923ece01d`（496件、#2078統合済み）、PR #2090 `1da9a32b9149805f87878dd688047a0a1c9ebed3`（config 41件）。#2078の旧HEADは独立した依存ではなく、3件の除外理由としてのみ履歴参照します。#2090のsnapshotとinventory digestは当該HEADから固定します。

現在のmain確定数は496/4020です。#2090とこの候補72件はいずれも未統合Draftで、496 + 41 + 72 = 609は条件付きprojectionです。静的照合では各隣接集合および合計集合のID・source path/SHA重複は0です。

#2090のHEADとmainが進んだ場合、候補72件のID/source path-SHAに差分またはoverlapが出たらprofile、inventory、Binding、source audit、validatorを再生成・再検証します。PR作成側ではreview依頼、merge、Issue closeを行いません。
