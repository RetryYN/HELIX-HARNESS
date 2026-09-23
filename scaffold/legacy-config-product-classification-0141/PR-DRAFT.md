# config/** 未研究41件の四製品責務semantic research scaffold

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の legacy disposition から、`config/` prefix・`Historical`・`unresolved`・configuration の exact 41件を再導出した。全件について旧config sourceのblob/SHAと、選択したsemantic spanを固定し、意味解釈、四製品のL1/product-boundary対応、counterevidence、bootstrap候補との一致・不一致を保存する。このbundleは旧config本文全体を読了・レビューしたとは主張しない。`unanchored_line_ranges` は1始まり・両端を含むsource行番号で、総行 `[1, source_line_count]` から選択span `[line_start, line_end]` を除いた範囲を機械的に表し、未読・既読や全文読了は示さない。source/blob/SHA、regular blob mode、MANIFEST/ledger digest、anchor coverage、implementation status、未実装・不足証拠、failure/degradation、consumer、Wave edgeを分離した。

分類結果は `direct_product_basis=26`、`multi_product_conflict=9`、`insufficient_basis=6`。directは具体spanから一製品L1、conflictは二製品以上、insufficientは対応責務証拠なしを意味する。これは研究候補であり、formal product authority、L2/L11、successor、new_build_allowed、正式asset classificationを変更しない。

分母は区別して記録する。archive populationは4,020件。既存研究の現在 `origin/main` unionは429件で、今回41件との重複は0。このcurrent-main 429がauthoritativeであり、今回の候補分母は `429 + 41 = 470 / 4,020` になる。496件、今回41件を加えた537件は、main前399件、#2074の31件、旧#2078 HEAD `5322a99b96f75e210c68aa56690f2da4fcb4415c` の120件から記録した歴史的projectionである。このHEADは現在の#2078 HEADを表さず、validatorは旧集合とのoverlapを未検証として扱う。現在のopen-PR unionやauthoritative分母として使わず、merge後にmainを再baselineして再計算する。

Binding upstreamはMANIFESTを除く固定BASE nonarchive入力65件と、current-main union算出に読む8つのmain inventoryを含む73件へ完全閉包する。validatorはcurrent-main各inventoryのblob/bytes/SHA/count/ID digest、authoritative current-mainとのtarget overlap、exact 41 set、category evidence invariants、nested duplicate key、Wave 1/37/50を含む入力freshness、archive symlink/nonregular/path/digest mismatch、Binding omission/extra/staleをfail-closeで検査する。旧#2078 HEAD projectionとそのoverlapは未検証値として明示する。selfcheckは45件の負例を実行する。

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
