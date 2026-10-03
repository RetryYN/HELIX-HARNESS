# SCF-B-0117 `src/runtime/` unresolved product classification research

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` から、`legacy-asset-phase-product-classification-bootstrap.jsonl` の `product_classification_status=unresolved` かつ `source_path` が `src/runtime/` 配下の73資産を再導出する。phase／asset分類、formal product route、successor、implementation成立、consumer closureは変更しない。

各recordは旧archive sourceのGit blob・bytes・SHA-256、実sourceのsemantic anchor（行番号、行テキスト、行テキストdigest）、phase／asset disposition、旧decision／read-after、Wave1–50のsemantic link、unit候補、四製品boundary／L1、旧failure／consumerを結ぶ。旧archiveは実行せず、`git show BASE:<path>` の静的readだけを使う。Wave1–50は598 edge／355 unique asset、runtime対象は16 edge／16 linked asset（semantic linkはunresolved 14、rejected 2）である。

source本文の具体spanと対応L1／boundary反証を73件すべて記録し、候補を次のように分けた。

- `direct_product_basis`: 54件（HELIX-HARNESS 17、HELIX-OS 37）。具体的な実装責務を一製品L1へ対応づけたcandidateだが、正式ownerではない。
- `multi_product_conflict`: 8件（HELIX-HARNESS＋HELIX-OS）。V-model／review責務と実行・authority責務が同一sourceにあり、単一ownerを提案しない。
- `insufficient_basis`: 11件。tombstoneまたは共有utility／I/Oで、製品境界を直接示す根拠が不足する。

Waveで観測されたproduct scopeはasset ownerへ継承せず、`observed_wave_products` とedge内の観測値に保持する。全件 `authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false` とし、human judgmentを残す。

別束との重複を単純加算しない。既存のWave-linked unresolved-product 64件、src/lint unresolved implementation-source 95件、今回runtime 73件の固定BASE上の分母は、runtime∩Wave=16、runtime∩lint=0、Wave∩lint=14、三束union=202である。

検証:

```text
python3 -B scaffold/legacy-runtime-product-classification-0117/generate.py
python3 -B scaffold/legacy-runtime-product-classification-0117/validate.py
python3 -B scaffold/legacy-runtime-product-classification-0117/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは固定BASE祖先性、140入力digest、73件exact set、598／355 Wave分母、16 edge欠落／重複、source blob／bytes／digest／line_count／read_mode／semantic line anchor、73件のcategory／product／span／L1／反証／consumer境界、phase／disposition／history、record／inventory全宣言、artifact evidence分母、重複束の分母、authority昇格をfail-closedに検査する。selfcheckは37 negative casesを期待error code付きで検査する。#1813は進捗参照のみでcloseしない。
