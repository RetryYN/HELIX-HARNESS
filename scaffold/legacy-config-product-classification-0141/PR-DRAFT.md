# config/** 未研究41件の四製品責務semantic research scaffold

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の legacy disposition から、`config/` prefix・`Historical`・`unresolved`・configuration の exact 41件を再導出した。全件の旧config本文を静的に読み、意味のあるsemantic spanを手動pinして、意味解釈、四製品のL1/product-boundary対応、counterevidence、bootstrap候補との一致・不一致を保存する。source/blob/SHA、regular blob mode、MANIFEST/ledger digest、coverage/unread range、implementation status、未実装・不足証拠、failure/degradation、consumer、Wave edgeを分離した。

分類結果は `direct_product_basis=26`、`multi_product_conflict=9`、`insufficient_basis=6`。directは具体spanから一製品L1、conflictは二製品以上、insufficientは対応責務証拠なしを意味する。これは研究候補であり、formal product authority、L2/L11、successor、new_build_allowed、正式asset classificationを変更しない。

分母は区別して記録する。archive populationは4,020件。既存研究の現在 `origin/main` unionは429件で、今回41件との重複は0。この current-main 429がauthoritativeであり、今回の候補分母は `429 + 41 = 470 / 4,020` になる。#2074統合前のmain 399件、#2074の31件、旧open PR #2078の120件を順に足す旧projectionは496件、今回41件を加えたprojectionは537件（いずれも /4,020）だが、#2078旧HEAD `5322a99b96f75e210c68aa56690f2da4fcb4415c` はmutable/staleableなので conditional projection として分離した。新HEAD確定後の再計算が必要である。

Binding upstreamはMANIFESTを除く固定BASE nonarchive入力65件と、current-main union算出に読む8つのmain inventoryを含む73件へ完全閉包する。validatorはcurrent-main各inventoryのblob/bytes/SHA/count/ID digest、target overlap、exact 41 set、category evidence invariants、nested duplicate key、Wave 1/37/50を含む入力freshness、archive symlink/nonregular/path/digest mismatch、Binding omission/extra/staleをfail-closeで検査する。selfcheckは44件の負例を実行する。

検証コマンド:

```text
python3 -B scaffold/legacy-config-product-classification-0141/generate.py
python3 -B scaffold/legacy-config-product-classification-0141/validate.py
python3 -B scaffold/legacy-config-product-classification-0141/selfcheck.py
python3 -m py_compile scaffold/legacy-config-product-classification-0141/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py selftest
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

レビュー依頼・merge・Issue closeは行わない。残るhuman判断はproduct owner/boundary、semantic span受入れ、phase admission、successor、実装・consumer closure、正式asset分類である。
