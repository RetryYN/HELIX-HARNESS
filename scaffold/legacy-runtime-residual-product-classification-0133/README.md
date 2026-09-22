# SCF-B-0133 固定BASE `src/runtime/` residual 59件の製品責務候補研究

この束は、固定BASE `36784d25aa4cc53d89c28c2ff81b4009db234605` の旧asset phase-product bootstrapから、`product_classification_status=candidate_needs_semantic_review`、`artifact_evidence_kind=implementation_source`、`source_path=src/runtime/` を同時に満たす59資産を静的に調査するresearch-only Scaffoldです。旧archiveのsourceは固定BASE Git objectから読むだけで、runtime/test/CI/workflow/hook/adapterは実行していません。

対象は59 asset / 59 record、Wave edgeは40、リンク資産は37です。source本文の具体的なmarker/span/blob/bytes/line count/行digestを、承認済み4製品L1の具体行、`docs/concept/product-boundary.md`の製品行、承認decisionの意味行、旧判断史・failure・consumer・read-afterと分離して記録しました。候補集計は direct product basis 31、multi-product conflict 24、insufficient basis 4 です。これは候補研究の状態であり、単一owner・formal product分類・実装成立を宣言しません。

main確定研究241件とopen候補196件は固定validator pinから独立に再計算し、対象59件との重複を0件として検査します。既存bundleを分類oracleにはせず、生成器のprofile改竄後に再生成してもvalidator側固定pinで拒否する負例を含めます。

全record/inventory/Bindingで`authority_effect=none`、`formal_asset_classification_updated=false`、`formal_implementation_status=unknown`、`successor_assignment=null`、`new_build_allowed=false`を保持します。既存台帳、formal route、successor、phase admissionは更新していません。

## 検証

```text
python3 -B scaffold/legacy-runtime-residual-product-classification-0133/generate.py
# SCF-B-0133 generated 59 {'direct_product_basis': 31, 'multi_product_conflict': 24, 'insufficient_basis': 4} wave_edges 40
python3 -B scaffold/legacy-runtime-residual-product-classification-0133/validate.py
# SCF-B-0133 validate PASS records=59 edges=40 counts={'direct_product_basis': 31, 'multi_product_conflict': 24, 'insufficient_basis': 4}
python3 -B scaffold/legacy-runtime-residual-product-classification-0133/selfcheck.py
# SCF-B-0133 selfcheck PASS negative_cases=36
python3 -m py_compile scaffold/legacy-runtime-residual-product-classification-0133/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

merge、close、formal authorityの付与は行いません。レビュー依頼はrootの既存通路で行います。
