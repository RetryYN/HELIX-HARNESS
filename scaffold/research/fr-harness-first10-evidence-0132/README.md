# HELIX-HARNESS FR先頭10 unit 旧実装状態 evidence partition

この束は、固定BASE `94d99ebb4c55c2edb0575ac2dc100af0d5b93b90` から、crosswalkの行順で最初に現れる `IRUNIT-HIL-FR-*-HELIX-HARNESS` 10 unitを再導出し、現行mainの既存 `scaffold/fr-implementation-evidence-0109` 行、Wave 1–50 semantic edge、旧asset台帳、phase分類、decision/read-afterを静的に照合する研究用Scaffoldです。既存の218 product unitの10件を再包装するだけで、新しいunitは追加しません（`new_unit_count=0`）。

対象は次の10 unitです。

`FR-03`, `FR-04`, `FR-05`, `FR-06`, `FR-07`, `FR-09`, `FR-11`, `FR-17`, `FR-18`, `FR-19`（各 `HELIX-HARNESS`）。これは固定BASE crosswalkで `product_scope=["HELIX-HARNESS"]` に一致する行の先頭10件です。

## 読み方

各unitに3 Wave edge、合計30 edge、重複を除く旧asset 22件を記録しています。各assetには、固定BASEの台帳record全体、phase分類record全体、decision/read-after全record、旧archive sourceのGit blob OID・byte SHA・line anchorを保存しました。Wave edgeの `evidence_refs` は次の元記録方式で検証します。

- Wave 1–17: 選択spanのraw bytes（最終改行を含む）。
- Wave 18–50: 各行のCR/LFを除いてLFでjoinし、末尾改行を付けない。

`scaffold/fr-implementation-evidence-0109/evidence.jsonl` の既存行は、固定BASEのpath・line・JSON行digestと完全一致させています。その既存bundleは `base_revision` を持たないため、この束は既存行を権威化せず、入力全体と旧sourceを固定BASE Git objectから独立再導出します。

## 判定境界

10 unitすべてで、旧実装、旧縮退、旧障害、旧consumer closure、現行実装、受入、未実装は `unknown` のままです。理由は各unitの `status_partition` に記録しました。Wave edgeの `confirmed` semantic link、implementation_sourceの存在、phase分類候補、consumer reference、静的counter-evidenceは、それぞれasset/edge-levelの直接観測であり、unitの実装成立・縮退・障害・未実装・受入へ昇格させていません。

phaseについては、旧phase候補と `PHCAP-*` を `candidate_only` として記録します。`authority_effect=none`、product/phase authority、successor、formal statusは未確定です。旧archiveのruntime、test、CI、workflow、hook、adapter、sourceは実行していません。

SCF-B-0129（HELIX-OS FR先頭10 unit）とrole文字列は共有しますが、SCF-B-0132はHELIX-HARNESS FR先頭10 unitの別product／別固定BASE／別target sliceです。SCF-B-0132のBindingはcounterpart ID `SCF-B-0129`を`overlap_reason`で参照し、target unit・Wave edge・asset集合・入力digest・正式evidenceを相互に置換しません。HELIX-LABOは候補集合に含めません。

## 成果物

- `inventory.json`: 固定BASE、selection、分母、入力digest、authority boundary。
- `evidence.jsonl`: 10 unitごとのsource/crosswalk、既存partition、Wave edge、asset台帳、source anchor、状態partition。
- `build.py`: 固定BASE Git objectからの決定的再生成。
- `validate.py`: BASE祖先性、入力digest、unit/edge/asset集合、crosswalk/current row、ledger/phase/history、source blob/anchor、状態昇格、authority境界のfail-closed検査。evidence行のsource/current/binding/status/directly-established/unresolvedとasset boundary、inventoryのforbidden_operationsを期待構造全体と比較し、closure_status・asset_ids・phase_idsの昇格や未知fieldも拒否します。
- `selfcheck.py`: 改竄・重複・候補昇格・架空binding・BASE/input/output digest・closure/asset/phase/history/edge/status/inventory/forbidden-operation/directly-established/unresolvedの負例46件。
- `../bindings/SCF-B-0132.json`: 全成果物と依存入力を登録するBinding。
- `PR-DRAFT.md`: Draft PR本文。

## 検証

```text
python3 -B scaffold/fr-harness-first10-evidence-0132/build.py
python3 -B scaffold/fr-harness-first10-evidence-0132/validate.py --bundle scaffold/fr-harness-first10-evidence-0132
python3 -B scaffold/fr-harness-first10-evidence-0132/selfcheck.py
python3 -B scaffold/tools/scfctl.py validate
python3 -B scaffold/tools/scfctl.py stale
python3 -B scaffold/tools/scfctl.py residuals
git diff --check
```

旧archiveの実行経路は検証対象に含めません。正式な実装・縮退・未実装・受入・authorityの更新、merge、closeはこの束の責務外です。
