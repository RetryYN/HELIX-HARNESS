# RDP-001 outside67 PATH-006〜010 source atomization research

`MPR-SH-OUTSIDE67-001` の67 `path_revision_pair`から、PATH-006〜010の5 pairだけを選んだ静的研究 Scaffold です。基準 main は `16f694ae07cdb2d56e15045054c147c7a15d3275`、pre-isolation は `2d4991042be55268bac30a8bbcdac45b3865030a`、archive revision は `064280b5c1c5c98f949e6e3be5ef87cbe4a4b658`です。

5 pairのpre/archive snapshotは25／50／38／14／56行、合計183行です。`line-coverage.jsonl`はこの183行をpair／lineごとに一度ずつ記録し、未選定の選択範囲内line残差は0です。これは選択5 pairのsource line coverageが完了したことを示します。67 pair全体の調査完了、正式な意味atomの確定、要求採択を示さないため、`research_completion.status`は`partial_research`、`path_atomization_complete`はfalseです。未選定pairは62件残ります。

既存 merged Scaffold の PATH-008 atom 74件は `reused-atom-references.jsonl`へID・source line・canonical digestだけを参照記録し、`semantic-atoms.jsonl`へ複製しません。新規145件はPATH-006／007／009／010の各行候補です。line単位の会計は `atomized_candidate` 10、`metadata_only` 74、`composite_unresolved` 99です。PATH-008は既存atom参照のない27行をmetadataへfallbackせず、保守的に`composite_unresolved`へ置きます。複合行を推測で分割しません。原文、pre/archive exact line、blob OID、SHA-256、current counterpartのbase時点path/blob/SHAは機械可読記録に固定しています。

holdingのpath-based product／phaseは候補境界だけを保持し、四製品候補を全件に残します。正式owner、successor、phase authority、implementation、degradation、failure、consumer、decision、adoption、authorityはunknown／openのままです。旧HELIXのsource、判断履歴、failure／consumer ledgerは`legacy-evidence.jsonl`でexact source_item/path/blob anchorだけを静的参照し、no-hitを不在・完了の証拠にしません。archive旧workflow、runtime、test、CI、hook、adapter、sourceは実行していません。

## 生成物

- `selected-source-items.jsonl`: 5 pairのholding record、pre/archive exact revision、current counterpart、source bundle lineage
- `source-snapshots/`: 5 pairのpre-isolation／archive-revision exact snapshot
- `semantic-atoms.jsonl`: 新規145行候補。source fragmentを超える意味、owner、authorityを生成しない
- `reused-atom-references.jsonl`: merged PATH-008の既存74 atom ID／line／digest参照
- `line-coverage.jsonl`: 183行の重複なしmetadata／atomized／composite会計
- `source-diffs.json`: pre/archive same、current counterpart relocation/content driftの静的比較
- `legacy-evidence.jsonl`: BASE時点7 legacy ledgerのexact anchor scan（5×7、ledger digest／hit-nohit／anchorをvalidatorが再導出）
- `inventory.json`: 分母、partial completion、四製品候補境界、unknown residual、digest
- `generate.py`: merged snapshot／holding／ledgerを読む deterministic generator
- `validate.py`: 固定BASEのGit object祖先性、source line、atom reference、category、boundaryをfail-closedに検査
- `coverage-audit.py`: validatorから独立して183行の全被覆と3分類の排他を再計算
- `selfcheck.py`: 27件の意味ある負例（line／digest／重複／PATH-008分類／legacy ledger pin・hit-nohit-anchor／非祖先HEAD／形式昇格／partial completion境界）とremote進行模擬受理

## 検証

```text
python3 -B scaffold/rdp001-outside67-path006-010-atomization-096/generate.py
python3 -B scaffold/rdp001-outside67-path006-010-atomization-096/validate.py
python3 -B scaffold/rdp001-outside67-path006-010-atomization-096/coverage-audit.py
python3 -B scaffold/rdp001-outside67-path006-010-atomization-096/selfcheck.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

提出前に`origin/main`が記録baseから進んだ場合は停止し、#2043など先行研究のHEAD、holding、snapshot、current counterpartを再照合してからrebaselineします。validatorは固定BASEが検査対象HEADの祖先であることと記録digestを検証し、merge後のlive remote進行を過去のScaffoldへ遡及させません。

## 固定register入力の再照合（2026-10-10）

記録済みの期待digestに一致する`1c276ab26dc50ca5d0f2d8c25441f17c303b9919`のregister（637行・45 live source holding）を同一bytesの歴史snapshotへ固定し、validator/generatorの読取先とBindingを当該captureへ束縛する。logical path、当初BASE、候補JSON/JSONL、全183行の会計とunknown残差は保持する。当初BASEとは別の後続入力更新であり、以前のholding数と入力revisionの時間的整合、研究全体のsource/consumer closureは未完。過去の001を現在の生存holdingとして扱わず、Web/WEB-OSの現行authorityも過去研究から生成しない。generatorは読取先だけを静的照合し、全再生成は実行しない。採否、正式successor、holding解除、L3再開、Issue closeを生成しない。

## 独立reviewによるregister来歴の確定

独立review F2: 研究base 16f694ae07cdb2d56e15045054c147c7a15d3275 の入力はb68f3acae41fcd7796bf323e8eb3036aa13970c3af8608e13c5aaa1b237258dd/33行（72b9f368 captureと同一）。1c276ab2の79c1e5a6/637行は2026-09-29 refreshの記録値であり、研究時入力ではない。既存候補のrefresh記録との静的照合にだけ使い、当初baseの証拠や現在のholding/authorityへ継承しない。照合: docs/governance/audits/source-rebaseline/osa03-independent-review-input-reconciliation-2026-10-10.json
