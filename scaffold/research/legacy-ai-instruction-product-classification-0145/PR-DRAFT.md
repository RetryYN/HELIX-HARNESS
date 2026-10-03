# Draft: 固定BASE AI instruction/adapter 72件の四製品責務候補を研究束へ固定

## 問題

旧AI instruction、provider adapter、consumer templateのうち、#2078と#2090を統合した既存main研究537件と重ならない未調査範囲を、4製品L1に照らす候補研究として再現可能に固定する。

## 変更

- 固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` のunresolved候補75件から、#2078の3重複を除いた72件を対象化。
- 旧sourceのmanual span、archive blob/type/mode/SHA/MANIFEST、4製品L1/product-boundary候補、counterevidence、phase candidate、implementation evidence、history/failure/consumerを分離して記録。
- independent source auditで72/72 span原文一致、adapter template 34/34、最新main537および対象間のID/path-SHA重複0を照合。#2090の41件snapshotは履歴証拠としてmain内0141 ledgerにbyte一致し、main unionへ一度だけ計上。#2092のSCF-B-0144は既存main assetの36件照合で、`adds_assets_to_main_union=false`・本targetとのID/path-SHA重複0を独立確認。
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

全検証PASS: independent source auditは72/72 source span、34/34 adapter template、main 537に含まれる#2090 historical 41件、target overlap 0。generatorは72 records・カテゴリ28/41/3を出力。validatorはgeneratorの再生成と完全一致、ordered negative cases 47件すべて期待errorで拒否、`py_compile` PASS、`scaffold/tools/scfctl.py validate`は135 bindings/fail=0、stale=0、residuals=0、`git diff --check` PASS。意味解釈の採否は人間判断待ちであり、このPR draftはレビュー依頼や採用を意味しない。

## 依存・停止条件

再baseline後の比較対象pin: main `8a9fdc973f3553bea78d022e8d73f109aca526da`（537件、#2078・#2090統合済み）。旧PR #2090 HEAD `4b6e1bbf122b03fd3531047290161aced34eefda` は履歴証拠として残し、その41件ledger bytes（SHA-256 `a92c3731a91f0417ccbdf28fa80913d3ec694d185ddb1ac391e58b907a9f056b`）がvendored snapshotおよびmain内0141 ledgerに完全一致することを確認します。41/41件はmainの537件unionに一度だけ含め、#2090を別集合として加算しません。#2092のSCF-B-0144は36件の既存asset照合で`adds_assets_to_main_union=false`、0145 targetとのID/path-SHA重複0を確認しました。#2078の旧HEADは独立した依存ではなく、3件の除外理由としてのみ履歴参照します。

再baselineしたmain比較revisionでの確定数は537/4020です。この候補72件との条件付きprojectionは537 + 72 = 609です。静的照合ではmain537とtarget72のID・source path/SHA重複は0です。固定revisionの再検証PASSは記載したrevisionに対する証拠の再現性を示し、将来のmainを自動追随しません。

#2094を提出しreviewを依頼する前にmainを人手で再照合します。mainが進んでいたら、固定証拠のPASSを現行性の根拠にせず提出を止め、新しい依存revisionでoverlap/source digestを再baselineしたうえでprofile、inventory、Binding、source audit、validatorを更新・再検証します。これは保存済みrevisionの再現性検査とは別の提出時停止条件であり、validatorはlive remote HEADを照会しません。PR作成側はreview依頼と指摘対応までを担い、merge・post-merge read-after・Issue closeはレビュー対応側が行います。
