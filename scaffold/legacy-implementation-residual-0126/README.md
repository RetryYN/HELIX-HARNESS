# SCF-B-0126 固定BASE implementation_source 残余120件の製品責務研究

`SCF-B-0126` は、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の旧asset台帳とarchive Git objectを静的に読み、実装成立・正式product owner・consumer closureを決めずに、四製品の責務候補をresearch-only Scaffoldへ保存します。

未解決1,792件から、先行研究asset-ID集合205件とWave未解決64件（重複42件）を分離し、既存研究unionを227件として固定しました。残余分母は1,565件、そのうち未解決`implementation_source`の対象は120件です。prefixだけでは先行研究接続を証明できない53件は、固定ID/pathを`unresearched_prefix_asset_*`としてinventoryに列挙し、対象へinsufficient basisのまま含めています。これは既存研究として扱わず、追加の静的調査が必要な残余です。

対象は120 asset / 120 recordで、candidate分類はdirect product basis 30、multi-product conflict 23、insufficient basis 67です。insufficientの67件には上記53件を含みます。候補は旧sourceの具体span、source blob/bytes/digest、承認済み四製品L1、product-boundary、旧disposition/history/failure/consumerを突合した結果であり、formal product authority・phase・実装成立を宣言しません。

各recordには`anchor_line_coverage`（source line数、anchor line数、比率）を保持します。既存67件のanchor集計は1,023/10,997行=9.3%、最大18行で、未読領域を残します。追加53件は1行の不足証拠anchorであり、source pathだけをsemantic linkへ昇格していません。

Wave1–50は50 files、598 edges、355 unique assetsを固定BASEから再走査し、対象Wave edgeは0です。旧assetのimplementation/degradation/failure/consumer/statusは観測値として保持し、consumer closure・正式status・successorを生成しません。全record/inventoryで`authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`を固定しています。

validatorはgenerate.pyをimportせず、53件のID/path集合、prior205件のdigest、union227/残余1,565、source anchor、category cardinality（direct=1 product、conflict>=2、insufficient=0）、全nested record/inventoryを固定BASEから独立再導出します。selfcheckは実行集合43 negative casesを期待error code付きで検査し、generatorのcategory/products改竄再生成、human judgment/review pin、ledger digest、Wave/union分母、inventory keyの負例も含めます。

## 検証

```text
python3 -B scaffold/legacy-implementation-residual-0126/generate.py
python3 -B scaffold/legacy-implementation-residual-0126/validate.py
# SCF-B-0126 validate: PASS records=120 categories={'direct_product_basis': 30, 'insufficient_basis': 67, 'multi_product_conflict': 23} target_wave_edges=0 union=227
python3 -B scaffold/legacy-implementation-residual-0126/selfcheck.py
# SCF-B-0126 selfcheck: PASS negative_cases=43
python3 -m py_compile scaffold/legacy-implementation-residual-0126/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archive source/runtime/test/CIは実行していません。既存台帳・Wave snapshot・formal authority・merge/closeは変更しません。
