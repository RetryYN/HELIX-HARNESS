# RDP-001 outside67 PATH-006〜010 source atomization research

`MPR-SH-OUTSIDE67-001` の67 `path_revision_pair`から、PATH-006〜010の5 pairだけを選んだ静的研究 Scaffold です。基準 main は `c52f27093869a0ecbdfbc416fb0bffdb49b85071`、pre-isolation は `2d4991042be55268bac30a8bbcdac45b3865030a`、archive revision は `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`です。

5 pairのpre/archive snapshotは25／50／38／14／56行、合計183行です。`line-coverage.jsonl`はこの183行をpair／lineごとに一度ずつ記録し、未選定の選択範囲内line残差は0です。これは選択5 pairのsource line coverageが完了したことを示します。67 pair全体の調査完了、正式な意味atomの確定、要求採択を示さないため、`research_completion.status`は`partial_research`、`path_atomization_complete`はfalseです。未選定pairは62件残ります。

既存 merged Scaffold の PATH-008 atom 74件は `reused-atom-references.jsonl`へID・source line・canonical digestだけを参照記録し、`semantic-atoms.jsonl`へ複製しません。新規145件はPATH-006／007／009／010の各行候補です。line単位の会計は `atomized_candidate` 10、`metadata_only` 101、`composite_unresolved` 72で、複合行を推測で分割しません。原文、pre/archive exact line、blob OID、SHA-256、current counterpartのbase時点path/blob/SHAは機械可読記録に固定しています。

holdingのpath-based product／phaseは候補境界だけを保持し、四製品候補を全件に残します。正式owner、successor、phase authority、implementation、degradation、failure、consumer、decision、adoption、authorityはunknown／openのままです。旧HELIXのsource、判断履歴、failure／consumer ledgerは`legacy-evidence.jsonl`でexact source_item/path/blob anchorだけを静的参照し、no-hitを不在・完了の証拠にしません。archive旧workflow、runtime、test、CI、hook、adapter、sourceは実行していません。

## 生成物

- `selected-source-items.jsonl`: 5 pairのholding record、pre/archive exact revision、current counterpart、source bundle lineage
- `source-snapshots/`: 5 pairのpre-isolation／archive-revision exact snapshot
- `semantic-atoms.jsonl`: 新規145行候補。source fragmentを超える意味、owner、authorityを生成しない
- `reused-atom-references.jsonl`: merged PATH-008の既存74 atom ID／line／digest参照
- `line-coverage.jsonl`: 183行の重複なしmetadata／atomized／composite会計
- `source-diffs.json`: pre/archive same、current counterpart relocation/content driftの静的比較
- `legacy-evidence.jsonl`: 7 legacy ledgerのexact anchor scan（5×7）
- `inventory.json`: 分母、partial completion、四製品候補境界、unknown residual、digest
- `generate.py`: merged snapshot／holding／ledgerを読む deterministic generator
- `validate.py`: Git object、source line、atom reference、category、boundary、current main driftをfail-closedに検査
- `selfcheck.py`: 21件の意味ある負例（line／digest／重複／形式昇格／partial completion境界）

## 検証

```text
python3 -B scaffold/rdp001-outside67-path006-010-atomization-096/generate.py
python3 -B scaffold/rdp001-outside67-path006-010-atomization-096/validate.py
python3 -B scaffold/rdp001-outside67-path006-010-atomization-096/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

`origin/main`が記録baseから進んだ場合、validatorは停止して`E_MAIN_DRIFT`を返します。#2043など先行研究のHEAD、holding、snapshot、current counterpartを再照合してからrebaselineします。
