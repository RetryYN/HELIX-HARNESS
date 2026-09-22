# SCF-B-0109 HIL-FR-01〜20 旧資産証拠partition研究

HIL-FR-01〜20を製品unitへ分けた29 unit（HELIX-OS 18、HELIX-HARNESS 11）について、固定BASEから旧実装候補、縮退候補、failure関連記述、consumer参照を静的に分離するresearch-only Scaffoldである。Wave 1〜50の87 semantic edgeと46 unique旧assetを、原文、旧資産台帳、decision/read-after、phase/product classification、PHCAP20定義、四製品L1のbytesへ結び付ける。

このbundleの記録は、次の状態を独立に保持する。

- `implementation_evidence`: `implementation_source`／`test_source`のsource存在候補とdesign参照。unit実装成立や旧実行は示さない。
- `degradation_evidence`: crosswalkのphase capability transitionとWaveのconstraint。unit縮退やphase確定は示さない。
- `failure_evidence`: `coverage.failure`、counterevidence、unresolved。旧failure receiptは0件であり、実行failureはunknownに保つ。
- `consumer_evidence`: Wave edge、旧asset ledger、decision、read-afterのconsumer参照。closureはpendingである。

crosswalkの`representative_legacy_assets`とcandidate poolは検索候補として保存し、direct semantic linkや実装証拠へ昇格しない。FR01〜20以外とHIL-BR unitは対象外である。

## 成果物

- `inventory.json`: 固定BASE、入力Git bytes digest、29 unit／87 edge／46 assetの分母、unit別宣言、partition境界。
- `evidence.jsonl`: unitごとの原文anchor、decomposition、Wave edge、旧asset source/history/failure/consumer、代表asset、current context、未解決理由。
- `build.py`: 固定BASEを`git show`で静的に読み、bundleを決定的に再生成する。
- `validate.py`: unit集合、Wave edge集合、asset集合、入力digest、source anchor、旧asset blob/history、partition、authority境界、BASE祖先性をfail-closedに検証する。
- `selfcheck.py`: 20個の負例で期待error codeを照合する。
- `../bindings/SCF-B-0109.json`: 全成果物と入力責務をScaffold Bindingへ登録する。

## 検証

```text
python3 scaffold/fr-implementation-evidence-0109/build.py
python3 scaffold/fr-implementation-evidence-0109/validate.py
python3 scaffold/fr-implementation-evidence-0109/selfcheck.py
```

旧archiveのsource、test、runtime、hook、CIは実行しない。現行runtime／CIも実行せず、current implementation／acceptance／operationはunknownに保つ。validatorのPASS、source存在、coverage.failure、transition assessment、consumer参照から、実装成立、未実装、縮退、failure、closure、phase/product authority、successorを生成しない。

このbundleは#1813の進捗参照用の研究成果であり、正式crosswalk、PHCAP、product L1、authorityを変更しない。#2055／#2057のBR bundleとはHIL-FR対象の静的partitionとして分離している。
