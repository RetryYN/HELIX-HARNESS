# 固定BASE `src/lint/` candidate 51旧assetの製品責務候補をresearch Scaffoldへ記録

## 目的

旧asset bootstrapのcandidate_needs_semantic_review 2,228件から `src/lint/` implementation source 51件を抽出し、四製品L1・product-boundary・旧実装/縮退/failure/consumer/decision/read-afterと静的に突き合わせる。SCF-B-0108の同prefix unresolved95件とはID重複0を固定し、status意味を混同しない。

## 変更

- `SCF-B-0128` Bindingと全8成果物を追加。
- 固定BASE `cb5a45fea289d61b67cba100fd2406813021ef48` から51 asset / 51 recordを再導出。
- direct product basis 38、multi-product conflict 8、insufficient basis 5を、具体的source marker/span・対応L1要求行・product-boundary行・承認decisionの製品意味行・反証つきで保存。
- Wave対象edge 24を保持し、SCF-B-0108のunresolved95 ID集合との重複0を独立検査。
- phase/disposition、implementation/degradation、failure/consumer、decision/read-afterを候補分類から分離。
- L1 raw frontmatter（draft/awaiting_parent_approval）と、exact SHAをapproveしたeffective decision recordを分離し、4件のDecision ID・L1 SHA・decision/blob/digestをinventoryとrecordで固定。
- `authority_effect=none`、formal分類・implementation・successor・new buildを未確定のまま固定。
- record human judgmentとinventory全21 top-level key/valueを厳密検査し、selfcheckでoverlap/count/digest改竄を検証。

## 検証

```text
python3 -B scaffold/legacy-lint-candidate-product-classification-0128/generate.py
python3 -B scaffold/legacy-lint-candidate-product-classification-0128/validate.py
# PASS records=51 categories=direct_product_basis:38,multi_product_conflict:8,insufficient_basis:5 target_wave_edges=24 overlap_0108=0
python3 -B scaffold/legacy-lint-candidate-product-classification-0128/selfcheck.py
# PASS negative_cases=39
python3 -m py_compile scaffold/legacy-lint-candidate-product-classification-0128/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
python3 - <<'PY'
# inventory mutation sweep: every top-level key must be fail-closed
PY
git diff --check
```

旧archive runtime/test/CIは実行していない。merge/close、既存台帳・formal route・successorの更新はこのPRに含めない。GUIレビュー送信はroot側で行う。
