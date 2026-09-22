# research: classify 59 residual runtime legacy assets

## 目的

固定BASEの未確定旧assetから、`candidate_needs_semantic_review`、`implementation_source`、`src/runtime/`を満たす59件を、旧sourceの具体spanと承認済み四製品境界の証拠でresearch-only Scaffoldへ記録する。既存main241/open196研究とのID重複を0件として固定し、候補と正式routingを分離する。

## 変更

- SCF-B-0133 Bindingと8成果物を追加。
- 固定BASE `36784d25aa4cc53d89c28c2ff81b4009db234605` から59 asset / 59 record、Wave edge40、リンク資産37を再導出。
- direct product basis 31、multi-product conflict 24、insufficient basis 4を、旧source具体span、source blob/digest、承認済みL1具体行、product-boundary具体行、decision意味行、反証とともに保存。
- phase、legacy implementation/degradation、history、failure、consumer、decision/read-after、Wave観測を別フィールドで保持。
- main241/open196との重複0、asset分母59、Wave edge分母40を固定BASEと、先行bundleから取得したID集合の出所・digestを伴うvalidator固定pinで検査。main/openのID集合は分類oracleではなく、`PROFILE_PINS`は旧source/L1の手動semantic-review結果をgenerate/validateへ独立記載。
- `authority_effect=none`、formal分類・implementation・successor・new buildを未確定のまま固定。
- validatorは`generate.py`をimportせず、generatorのPROFILE_PINSをcategory/products/L1/marker/reasonごとに改竄して再生成する負例を、category invariantまたはrecord evidenceの期待error codeで検査する。手動duplicated pinを使い、generator改竄が自己承認されないことを固定する。

## 検証

```text
python3 -B scaffold/legacy-runtime-residual-product-classification-0133/generate.py
python3 -B scaffold/legacy-runtime-residual-product-classification-0133/validate.py
# SCF-B-0133 validate PASS records=59 edges=40 counts={'direct_product_basis': 31, 'multi_product_conflict': 24, 'insufficient_basis': 4}
python3 -B scaffold/legacy-runtime-residual-product-classification-0133/selfcheck.py
# SCF-B-0133 selfcheck PASS negative_cases=49
python3 -m py_compile scaffold/legacy-runtime-residual-product-classification-0133/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archive runtime/test/CIは実行していない。既存台帳・formal product route・successorは変更せず、merge/closeもしない。
