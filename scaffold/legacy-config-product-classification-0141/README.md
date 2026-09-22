# SCF-B-0141 config/** 41件の四製品責務研究

`SCF-B-0141` は、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の旧資産台帳から、`source_path` が `config/` で始まる未研究41件を対象にする research-only Scaffold Binding です。41件すべてについて旧config本文をGit objectとして静的に読み、具体的なsemantic span、意味解釈、四製品のL1/product-boundary対応、counterevidence、bootstrap候補との一致・不一致を手動pinします。

分類は `direct_product_basis=26`、`multi_product_conflict=9`、`insufficient_basis=6` です。directはsemantic spanから一製品L1へ対応し、conflictは二製品以上へ対応し、insufficientは対応する責務証拠がありません。bootstrap `candidate_product_targets` は比較材料であり、分類の単独根拠ではありません。LABOや四製品以外の候補は受け付けません。

各source receiptはGit `ls-tree` の正確なpath、mode `100644`、type `blob`、blob、bytes、SHA-256を確認し、固定BASEのMANIFESTとlegacy ledger digestを一致させます。semantic spanの行範囲、coverage、未読範囲を保持します。実装状態、未実装・不足証拠、degradation/failure、consumer、decision/read-after、Wave edgeは責務分類から分離しています。Wave 1–50は50ファイル・598 edgeを静的走査し、対象assetのedgeは1件です。

分母の扱いは次の通りです。

- 現在の `origin/main` 既存研究union: 429 / archive population 4,020。今回41件との重複は0で、authoritativeです。
- `origin/main` 前の399、#2074の31、旧open PR #2078の120を使った496 / 4,020と、そこへ41件を加えた537 / 4,020はconditional projectionです。#2078旧HEAD `5322a99b96f75e210c68aa56690f2da4fcb4415c` はmutable/staleableで、authoritative unionには含めません。
- authoritativeな統合候補分母は `429 + 41 = 470 / 4,020` です。いずれも正式採否や完了を意味しません。

Binding upstreamはMANIFESTを除くfixed BASE nonarchive入力65件と、current-main union算出に読む8つのmain inventory（計73件）へ完全閉包します。inventoryと独立validatorは、対象集合、nested duplicate key、入力 omission/extra/stale、archive regular-blob guard、MANIFEST/ledger mismatch、category evidence invariants、union overlap、Binding closure、authority境界をfail-closeで検査します。旧archiveはGit object/static readだけに限定し、source/runtime/test/CI/workflow/hook/adapterを実行しません。

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
