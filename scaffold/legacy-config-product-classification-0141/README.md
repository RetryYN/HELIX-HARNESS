# SCF-B-0141 config/** 41件の四製品責務研究

`SCF-B-0141` は、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の旧資産台帳から、`source_path` が `config/` で始まる41件を対象にした research-only のScaffold Bindingです。#2074統合前のorigin/main研究union（399件）、#2074統合後の現在main（429件）、PR #2078（120件）をasset IDで照合し、両open PRを含む候補union（496件）と対象41件との重複が0であることを固定します。

対象はすべて `artifact_evidence_kind=configuration`、`implementation_evidence_state=configuration_present_unexecuted`、`legacy_implementation_status=unknown` です。静的なJSON sourceのblob、bytes、SHA-256、行数、先頭非空行のanchorを保存し、旧disposition、phase候補、failure inventory、consumer inventory、decision/read-afterを別々の証拠として保持します。Wave 1–50は50ファイル・598 edgeを走査し、対象assetのedgeは1件（`config/requirement-discovery-event-schema.json`）です。

候補分類は、phase snapshotの暫定候補を根拠の一部として扱います。単一候補15件を`direct_product_basis`、複数候補11件を`multi_product_conflict`、候補なし15件を`insufficient_basis`とし、いずれも人間のproduct owner・phase・successor・正式implementation判断を生成しません。候補は4製品（HELIX-HARNESS、HELIX-OS、HELIX-Web、HELIX-Web-OS）だけを許し、LABOや未知の製品名を受け付けません。

inventoryと独立validatorは、対象の欠落・重複・余分、source/blob/SHA、入力freshness、JSON重複key、Wave edge、category partition、既存研究union、consumer/failure evidence、authority境界、固定BASE祖先性をfail-closeで検査します。旧archiveは `git show BASE:<path>` とGit blob参照だけに限定し、source/runtime/test/CI/workflow/hook/adapterを実行しません。

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

PR本文では、origin/main統合前の399/4020、PR #2074・#2078を含む候補union496/4020、現在main（#2074統合後）の429/4020を区別して記載します。main399 → PR #2074統合後429 → PR #2078込み496 → 本41件込み537という統合順の候補分母は、研究証拠の分母であり、正式採否や完了を意味しません。
