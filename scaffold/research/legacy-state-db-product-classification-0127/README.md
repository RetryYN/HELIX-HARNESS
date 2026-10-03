# SCF-B-0127 固定BASE `src/state-db/` 39件の製品責務候補研究

この束は、固定BASE `99893e5950f4025742a0f8671914be25332c038c` の旧asset bootstrapで同statusの2,228件から、`product_classification_status=candidate_needs_semantic_review` かつ `source_path` が `src/state-db/` の39件を静的に調査する research-only Scaffold です。全対象の `artifact_evidence_kind` は `implementation_source` ですが、旧実装の成立・再利用・縮退や正式な製品分類を決めません。

## 対象と結果

- 対象は39 asset / 39 record。固定BASEの台帳からasset ID、path、phase状態を独立再導出し、欠落・重複・余分を拒否します。
- 候補分類は direct product basis **28**、multi-product conflict **10**、insufficient basis **1** です。分類は各archive sourceの具体的なsource marker/span、四製品L1、`docs/concept/product-boundary.md`の候補境界、反証を照合した結果です。単なるpathやfilenameからownerを推定していません。
- Wave1–50は固定BASEの静的snapshotを読み、対象edge **13** を保持しました。Waveのlinkは製品ownerや正式routeの証拠へ昇格させません。
- SCF-B-0107、SCF-B-0117、SCF-B-0120、SCF-B-0123、SCF-B-0126とのasset ID/path重複は **0** です。分母は既存束へ単純加算せず、inventoryのoverlap宣言で固定します。

## 記録する証拠

各recordは、旧asset phase行・disposition行のdigest、archive Git blob・bytes・sha256・line count、具体的なsource spanと行テキストdigestを持ちます。候補分類には製品候補、意味説明、反証を保持します。

旧 `implementation_status` と `implementation_evidence_state` は台帳値のまま保持し、`degradation_status=unknown_pending_human_semantic_review` としています。旧failure/consumer inventoryはasset ID/source pathの静的行照合として分離し、decision/read-afterは対象IDに一致する行だけを別配列へ保持します。固定snapshot上で一致行がない場合も、global inventoryのblob/digestと `matched_lines=[]` を残します。

## authority境界

全recordとinventoryで `authority_effect=none`、`formal_product_authority=null`、`formal_asset_classification_updated=false`、`formal_implementation_status=unknown`、`successor_assignment=null`、`new_build_allowed=false` を固定しています。Bindingの `product` はScaffold登録先であり、39 assetの単一ownerを意味しません。既存台帳、formal route、successor、phase admission、実装成立は更新していません。

旧archiveのsource/runtime/test/hook/adapter/CIは実行していません。sourceは固定BASEの `git show BASE:<path>` で読むだけです。

## 検証

```text
python3 -B scaffold/legacy-state-db-product-classification-0127/generate.py
python3 -B scaffold/legacy-state-db-product-classification-0127/validate.py
# SCF-B-0127 validate: PASS records=39 categories={'direct_product_basis': 28, 'multi_product_conflict': 10, 'insufficient_basis': 1} target_wave_edges=13
python3 -B scaffold/legacy-state-db-product-classification-0127/selfcheck.py
# SCF-B-0127 selfcheck: PASS negative_cases=31
python3 -m py_compile scaffold/legacy-state-db-product-classification-0127/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは`generate.py`をimportせず、固定BASEから39件集合、source object/span、phase/disposition/history/failure/consumer、Wave edge、入力digest、authority境界を再導出します。selfcheckはtarget欠落・重複・余分、source blob/span/read mode、候補分類・反証、boundary、phase/disposition/history/implementation、Wave edge、authority昇格、入力digest、inventory宣言、BASE pin、output digestを期待error codeつきで検査します。

inventoryの全18 top-level fieldを1項目ずつ改竄するmutation sweepも実施し、未検出項目は0件でした。
