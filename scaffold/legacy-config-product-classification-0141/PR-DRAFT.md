# SCF-B-0141: config/** 41件のresearch-only製品責務分類

`legacy-asset-disposition.jsonl` の `config/` prefix から得た未研究41 assetを、固定BASEのGit objectだけで照合するScaffold Bindingを追加した。source path/blob/bytes/SHA、configurationとしての実装証拠状態、phase候補、未実装・不足証拠、failure/degradation、consumer、Wave edgeを分離して保存する。

分類は `direct_product_basis=15`、`multi_product_conflict=11`、`insufficient_basis=15`。これは暫定research候補であり、formal product authority、L2/L11、successor、new_build_allowedを変更しない。

分母の扱いは次の通り。

- origin/main統合前の既存研究union: 399 / archive manifest 4,020
- PR #2074（31件）とPR #2078（120件）を候補として両方含めたunion: 496 / 4,020
- #2074がmainへ統合された現在のmain union: 429 / 4,020
- #2074 → #2078 → 本PRの統合順: 429 → 496 → 537
- 本PRのconfig/41件は、main399、#2074、#2078の各asset ID集合と重複0

検証は独立validator、negative selfcheck 24件、共通`scfctl`（validate/selftest/stale/residuals）で行う。旧archiveの実行、旧CI・旧testのoracle利用、merge、Issue close、review依頼は行わない。残るhuman判断はproduct owner/boundary、configuration semantic anchor、phase admission、successor、実装・consumer closure、正式asset分類です。
