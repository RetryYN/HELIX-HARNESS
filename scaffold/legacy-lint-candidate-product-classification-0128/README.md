# SCF-B-0128 固定BASE `src/lint/` candidate 51件の製品責務候補研究

この束は、固定BASE `cb5a45fea289d61b67cba100fd2406813021ef48` の旧asset bootstrapで `product_classification_status=candidate_needs_semantic_review` の2,228件から、`artifact_evidence_kind=implementation_source` かつ `source_path=src/lint/` の51件を静的に調査する research-only Scaffold です。SCF-B-0108の同prefix `product_classification_status=unresolved` 95件とは、固定BASEでasset ID集合を再導出し、重複0を確認しています。

## 対象と結果

- 対象は51 asset / 51 record。candidate status、implementation source、src/lint prefixを固定BASEのphase台帳から独立再導出します。
- 候補分類は direct product basis **38**、multi-product conflict **8**、insufficient basis **5** です。各分類は具体的なarchive source marker/span、対応するL1要求行、`docs/concept/product-boundary.md`の製品行、承認decision recordの製品意味行、反証を突き合わせたものです。path・filename・汎用語だけでownerを決めていません。L1のraw frontmatter（draft/awaiting_parent_approval）と、exact SHAをapproveしたeffective decisionを分離して記録します。
- Wave1–50の固定BASE snapshotから対象edge **24** を保持し、Wave製品scopeは正式ownerへ継承しません。
- SCF-B-0108の同prefix unresolved95件とのID重複は **0**。両statusの分母を混同せず、inventoryで95 ID digestとoverlapを固定します。

## 記録する証拠

各recordは旧phase/disposition行のdigest、archive Git blob・bytes・sha256・line count、具体source spanと行テキストdigestを持ちます。候補分類にはcandidate products、意味説明、counter-evidenceを保持します。candidate_product_basisには候補製品ごとの旧source semantic marker/行・L1要求行・product-boundary行・decision record製品意味行の実行行・本文digest・SHA参照を固定します。

旧`implementation_status`と`implementation_evidence_state`は台帳値のまま保持し、`degradation_status=unknown_pending_human_semantic_review`としています。旧failure/consumer inventoryはasset ID/source pathの静的行照合として分離し、decision/read-afterは対象ID一致行を別配列で保持します。Wave linksも観測値として保持します。

## authority境界

全recordとinventoryで`authority_effect=none`、`formal_product_authority=null`、`formal_asset_classification_updated=false`、`formal_implementation_status=unknown`、`successor_assignment=null`、`new_build_allowed=false`を固定しています。Bindingの`product`はScaffold登録先であり、51件の単一ownerを意味しません。既存台帳、formal route、successor、phase admission、実装成立は更新していません。

旧archive source/runtime/test/hook/adapter/CIは実行していません。sourceは固定BASEの`git show BASE:<path>`で読むだけです。

## 検証

```text
python3 -B scaffold/legacy-lint-candidate-product-classification-0128/generate.py
python3 -B scaffold/legacy-lint-candidate-product-classification-0128/validate.py
# SCF-B-0128 validate: PASS records=51 categories={'direct_product_basis': 38, 'multi_product_conflict': 8, 'insufficient_basis': 5} target_wave_edges=24 overlap_0108=0
python3 -B scaffold/legacy-lint-candidate-product-classification-0128/selfcheck.py
# SCF-B-0128 selfcheck: PASS negative_cases=39
python3 -m py_compile scaffold/legacy-lint-candidate-product-classification-0128/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

validatorは`generate.py`をimportせず、固定BASEから51件集合、SCF-B-0108 unresolved95件集合、source object/span、phase/disposition/history/failure/consumer、Wave edge、入力digest、authority境界を再導出します。selfcheckはtarget欠落・重複・余分、source blob/span/read mode、候補分類・反証、L1 raw/effective approval・decision digest、boundary、phase/disposition/history/implementation、Wave edge、overlap/count/digest、human judgment、authority昇格、inventory宣言、BASE pin、output digestを期待error codeつきで検査します。
