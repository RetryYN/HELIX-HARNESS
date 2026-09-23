# Draft: 固定BASE AI instruction/adapter 72件の四製品責務候補を研究束へ固定

## 問題

旧AI instruction、provider adapter、consumer templateのうち、既存main研究496件（統合済み#2078の67件を含む）、PR #2090の41件と重ならない未調査範囲を、4製品L1に照らす候補研究として再現可能に固定する。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` のunresolved候補75件から、#2078の3重複を除いた72件を対象化。
- 旧sourceのmanual span、archive blob/type/mode/SHA/MANIFEST、4製品L1/product-boundary候補、counterevidence、phase candidate、implementation evidence、history/failure/consumerを分離して記録。
- independent source auditで72/72 span原文一致、adapter template 34/34、最新main496/#2090および対象間のID/path-SHA重複0を照合。#2092のSCF-B-0144は既存main assetの36件照合で、union追加0・本targetとのID/path-SHA重複0を独立確認。
- research-only Scaffold Binding、generator、再生成一致validator、独立source audit、47 ordered negative selfchecksを追加。

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

全検証PASS: independent source auditは72/72 source span、34/34 adapter template、overlap 0。generatorは72 records・カテゴリ28/41/3を出力。validatorはgeneratorの再生成と完全一致、ordered negative cases 47件すべて期待errorで拒否、`py_compile` PASS、`scaffold/tools/scfctl.py validate`は133 bindings/fail=0、`git diff --check` PASS。意味解釈の採否は人間判断待ちであり、このPR draftはレビュー依頼や採用を意味しない。

## 依存・停止条件

再baseline後の比較対象pin: main `7bed4fcd1f50721592b0ce25a8c5d4ee71220b0b`（496件、#2078統合済み）、PR #2090 `4b6e1bbf122b03fd3531047290161aced34eefda`（config 41件）。#2090の41件classification ledgerは旧pinとbyte一致（SHA-256 `a92c3731a91f0417ccbdf28fa80913d3ec694d185ddb1ac391e58b907a9f056b`）し、ID/path/SHA集合も一致します。inventory snapshotは新HEADのSHA-256 `f4b5fd82731660bf9bb8885ff4b4451b32cf08319aa0f91b09b5e3970cbf268d`へ更新しました。#2092で統合されたSCF-B-0144は36件の既存asset照合で`adds_assets_to_main_union=false`、旧main 496件からのID増分0、0145 targetとのID/path-SHA重複0を確認しました。#2078の旧HEADは独立した依存ではなく、3件の除外理由としてのみ履歴参照します。validatorと独立source auditは、#2090のvendored snapshotsが固定Git object bytesと一致することを検査します。

再baselineしたmain比較revisionでの確定数は496/4020です。#2090とこの候補72件はいずれも未統合Draftで、496 + 41 + 72 = 609は条件付きprojectionです。静的照合では各隣接集合および合計集合のID・source path/SHA重複は0です。固定revisionの再検証PASSは記載したrevisionに対する証拠の再現性を示し、将来のmainまたは#2090 HEADを自動追随しません。

#2094を提出しreviewを依頼する前に、#2090の意図するexact HEADとmainを人手で再照合します。いずれかが進んでいたら、固定証拠のPASSを現行性の根拠にせず提出を止め、新しい依存revisionでoverlap/source digestを再baselineしたうえでprofile、inventory、Binding、source audit、validatorを更新・再検証します。これは保存済みrevisionの再現性検査とは別の提出時停止条件であり、validatorはlive remote HEADを照会しません。PR作成側はreview依頼と指摘対応までを担い、merge・post-merge read-after・Issue closeはレビュー対応側が行います。
