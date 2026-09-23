# SCF-B-0141 config/** 41件の四製品責務研究

`SCF-B-0141` は、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の旧資産台帳から、`source_path` が `config/` で始まる未研究41件を対象にする research-only Scaffold Binding です。41件すべてについてsource blobの同一性とdigestを固定し、選択したsemantic span、意味解釈、四製品のL1/product-boundary対応、counterevidence、bootstrap候補との一致・不一致を手動pinします。このbundleは旧config本文全体を読了・レビューしたとは主張しません。

分類は `direct_product_basis=26`、`multi_product_conflict=9`、`insufficient_basis=6` です。directはsemantic spanから一製品L1へ対応し、conflictは二製品以上へ対応し、insufficientは対応する責務証拠がありません。bootstrap `candidate_product_targets` は比較材料であり、分類の単独根拠ではありません。LABOや四製品以外の候補は受け付けません。

各source receiptはGit `ls-tree` の正確なpath、mode `100644`、type `blob`、blob、bytes、SHA-256を確認し、固定BASEのMANIFESTとlegacy ledger digestを一致させます。`unanchored_line_ranges` は、1始まり・両端を含むsource行番号の範囲で、総行 `[1, source_line_count]` から選択semantic span `[line_start, line_end]` を除いた行を機械的に表します。spanの外側の行範囲であり、未読・既読の判定や全体の読了状態を示しません。implementation status、未実装・不足証拠、degradation/failure、consumer、decision/read-after、Wave edgeは責務分類から分離しています。Wave 1–50は50ファイル・598 edgeを静的走査し、対象assetのedgeは1件です。

分母の扱いは次の通りです。

- 現在の `origin/main` 既存研究union: 429 / archive population 4,020。今回41件との重複は0で、authoritativeです。
- 496 / 4,020と、そこへ41件を加えた537 / 4,020は、main前399件、#2074の31件、旧#2078 HEAD `5322a99b96f75e210c68aa56690f2da4fcb4415c` の120件から記録した歴史的projectionです。この旧HEADは現在の#2078 HEADを表さず、validatorは旧集合とのoverlapを未検証として保持します。これらの数値を現在のopen-PR unionやauthoritative分母として扱わず、merge後にmainを再baselineして再計算します。
- authoritativeな統合候補分母は `429 + 41 = 470 / 4,020` です。いずれも正式採否や完了を意味しません。

Binding upstreamはMANIFESTを除くfixed BASE nonarchive入力65件と、current-main union算出に読む8つのmain inventory（計73件）へ完全閉包します。inventoryと独立validatorは、authoritative current-main unionとのoverlap、対象集合、nested duplicate key、入力 omission/extra/stale、archive regular-blob guard、MANIFEST/ledger mismatch、category evidence invariants、Binding closure、authority境界をfail-closeで検査します。旧#2078 HEADに基づくprojectionは未検証の歴史値として明示し、merge後に再baselineします。旧archiveはGit object/static readだけに限定し、source/runtime/test/CI/workflow/hook/adapterを実行しません。

## 検証

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

残るhuman判断はproduct owner/boundary、semantic anchor受入れ、phase admission、successor、実装・consumer closure、正式asset分類です。
