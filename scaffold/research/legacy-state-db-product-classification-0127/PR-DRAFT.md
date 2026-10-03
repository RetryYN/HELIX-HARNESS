# 固定BASE `src/state-db/` 39旧assetの製品責務候補をresearch Scaffoldへ記録

## 目的

旧asset bootstrapで `product_classification_status=candidate_needs_semantic_review` のまま残る2,228件から `src/state-db/` 39件を選び、四製品L1・product-boundary・旧実装/縮退/failure/consumer/decision/read-afterと静的に突き合わせる。source spanを伴う候補分類を記録し、正式product authorityや実装成立へ昇格しない。

## 変更

- `SCF-B-0127` Bindingと全8成果物を追加。
- 固定BASE `99893e5950f4025742a0f8671914be25332c038c` から39 asset / 39 recordを再導出。
- direct product basis 28、multi-product conflict 10、insufficient basis 1を、具体的source marker/span・L1/boundaryの反証つきで保存。
- Wave対象edge 13を保持し、SCF-B-0107/0117/0120/0123/0126との重複0を固定。
- phase/disposition、implementation/degradation、failure/consumer、decision/read-afterを候補分類から分離。
- `authority_effect=none`、formal分類・implementation・successor・new buildを未確定のまま固定。
- recordのhuman judgment固定、inventory全18 top-level key/value比較と18項目mutation sweep（未検出0件）を追加。

## 検証

```text
python3 -B scaffold/legacy-state-db-product-classification-0127/generate.py
python3 -B scaffold/legacy-state-db-product-classification-0127/validate.py
# PASS records=39 categories=direct_product_basis:28,multi_product_conflict:10,insufficient_basis:1 target_wave_edges=13
python3 -B scaffold/legacy-state-db-product-classification-0127/selfcheck.py
# PASS negative_cases=31
inventory mutation sweep: checked=18 uncaught=0
python3 -m py_compile scaffold/legacy-state-db-product-classification-0127/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archive runtime/test/CIは実行していない。merge/close、既存台帳・formal route・successorの更新はこのPRに含めない。関連Issueへの進捗参照はレビュー側で付与し、close操作は行わない。
