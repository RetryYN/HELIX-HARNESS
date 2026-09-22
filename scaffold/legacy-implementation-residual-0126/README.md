# SCF-B-0126 固定BASE implementation_source 残余の製品責務研究

`SCF-B-0126` は、固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の旧asset台帳とarchive Git objectを静的に読み、実装成立・正式product owner・consumer closureを決めずに四製品の責務候補をresearch-only Scaffoldへ保存します。旧archive source/runtime/test/CIは実行していません。

未解決assetは1,792件です。prior研究205件とWave未解決64件からなる旧unionは227件、残余`implementation_source`の初期trancheは120件でした。最新main `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204` の製品別研究bundle 8本をasset IDとsource path/SHAで再集計すると、global unionは429件、そのうちphase unresolvedに属するunionは280件です。初期trancheとの重複53件は新規recordから除外し、真の新規対象67件をrecord化しました。したがってunresolved existing unionは280件、target処理前の`pre_target_residual_unresolved`は1,512件です。このbundleの新規target67件を差し引いた`post_batch_remaining_unresolved`は1,445件です。global unionのうちphase unresolved外の149件は、unresolved分母へ混入させず別のglobal provenanceとして保持しています。

重複53件は`overlap_reconciliation`へ保持し、source path/SHAが同じでも既存bundleの分類方法を黙って上書きしません。17件は`same_source_same_candidate_result`、36件は`same_source_different_candidate_result`として人間の照合待ちです。これはsource path/SHAとcandidate category/productsの一致だけを示し、method identityは主張しません。対象67件のcandidate分類はdirect product basis 30、multi-product conflict 23、insufficient basis 14です。これは研究上の候補であり、formal product/phase/implementation/consumer closureへの昇格ではありません。各recordに`research_scope`、`evidence_completeness`、`overlap_status`、`bundle_revision`、`denominator_role`を固定しています。

Wave1–50は50 files、598 edges、355 unique assetsを固定BASEから再走査し、対象Wave edgeは0です。旧assetのimplementation/degradation/failure/consumer/statusは観測値として保持し、consumer closure・正式status・successorを生成しません。全record/inventoryで`authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`を固定しています。

各recordにはsource anchorと`anchor_line_coverage`、旧disposition/history/failure/consumerの静的参照、承認済み四製品L1とproduct-boundaryのdigestを保持します。`scripts/helix.ps1`はarchive bytes `sha256:2b86bf027686c55db9ab6e8828361db69b9e7ccbf51111c438d90ee1ed21908b`とMANIFEST entry `sha256:9e5b68aefd8920fc248fc16d0c90305d0327c39362ae3e82621cbc1b53060bd7`が不一致です。formal admission/reuseは停止し、human/source resolution pendingとして固定しています。

validatorは`generate.py`をoracle importせず、固定BASEから旧union、最新mainの8 bundle（commit、blob、bytes、SHA、global union429、unresolved union280）、初期120と重複53、新規67、全nested record/inventoryを独立再導出します。inventoryの184 input digestのうち63非archive入力に加えて、8つの製品研究bundleをBinding upstreamへ登録し、path/raw SHAを照合します。archive静的121入力はSCF-OS-003のためupstreamへ入れず、inventory/recordで保持して非実行境界を明示します。selfcheckは56 negative casesを期待error code付きで実行し、strict JSON、重複・source anchor・全record、union/overlap分母、Binding upstream、generator分類pin、authority境界を検査します。

## 検証

```text
python3 -B scaffold/legacy-implementation-residual-0126/generate.py
python3 -B scaffold/legacy-implementation-residual-0126/validate.py
# SCF-B-0126 validate: PASS records=67 categories={'direct_product_basis': 30, 'insufficient_basis': 14, 'multi_product_conflict': 23} target_wave_edges=0 product_union=429 unresolved_existing_union=280 pre_target_residual=1512 new_target=67 post_batch_remaining=1445 overlap=53
python3 -B scaffold/legacy-implementation-residual-0126/selfcheck.py
# SCF-B-0126 selfcheck: PASS negative_cases=56
python3 -m py_compile scaffold/legacy-implementation-residual-0126/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

既存phase/product authority、正式台帳、merge/closeは変更していません。
