# 最新mainの製品研究重複を除いた67件のimplementation_source残余を固定する research Scaffold

## 変更

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の未解決1,792件から、prior研究205件とWave未解決64件の旧union227件を再導出しました。初期`implementation_source` trancheは120件でした。最新main `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204` の8 product research bundleをasset IDとsource path/SHAで再集計し、global union429件、phase unresolvedとの交差280件を固定しました。

- 初期120件と既研究bundleの重複53件は新規targetから除外し、重複reconciliation inventoryへ移しました。17件は`same_source_same_candidate_result`、36件は`same_source_different_candidate_result`として保持します。source path/SHAとcandidate category/productsの一致だけを記録し、method identityは主張しません。
- 新規targetは67件。candidate分類はdirect product basis 30、multi-product conflict 23、insufficient basis 14です。候補はformal product/phase/implementation/consumer closureへ昇格しません。
- unresolved existing unionは280件、target処理前の`pre_target_residual_unresolved`は1,512件、新規target67件、処理後の`post_batch_remaining_unresolved`は1,445件です。global product union429件のうちunresolved外149件はこの分母へ算入していません。
- 各recordに`research_scope`、`evidence_completeness`、`overlap_status`、`bundle_revision`、`denominator_role`を追加し、初期120件のsource input digestは維持しつつ、8 product bundleをBinding upstreamへ追加しました。
- Wave1–50は全50入力をvalidatorが再走査し、598 edges / 355 unique assets、対象Wave edge 0を独立再集計します。fixed BASE git treeのexact path/type/mode（blob、100644/100755）も固定します。source anchor、旧disposition/history/failure/consumer、四製品L1、全nested record/inventoryを固定BASEから再導出します。
- `authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`を固定します。archive旧workflowは静的Git object参照のみです。
- `scripts/helix.ps1`のarchive bytes `sha256:2b86bf027686c55db9ab6e8828361db69b9e7ccbf51111c438d90ee1ed21908b`とMANIFEST entry `sha256:9e5b68aefd8920fc248fc16d0c90305d0327c39362ae3e82621cbc1b53060bd7`の不一致はhuman/source resolution pendingとして保持し、formal admission/reuseを停止します。
- 初期120件（新規67件＋重複53件）の全archive sourceを`archive_source_provenance`へ保存し、固定BASE git-treeのexact path/type/mode、blob/bytes/SHA、ledger digest、個別MANIFEST digest/match/resolution、read modeをvalidatorが全値照合します。overlap 53件は同じprovenanceを参照し、既知の`helix.ps1` MANIFEST不一致は停止境界として明示します。

## 検証

```text
python3 -B scaffold/legacy-implementation-residual-0126/generate.py
python3 -B scaffold/legacy-implementation-residual-0126/validate.py
# SCF-B-0126 validate: PASS records=67 categories={'direct_product_basis': 30, 'insufficient_basis': 14, 'multi_product_conflict': 23} target_wave_edges=0 product_union=429 unresolved_existing_union=280 pre_target_residual=1512 new_target=67 post_batch_remaining=1445 overlap=53
python3 -B scaffold/legacy-implementation-residual-0126/selfcheck.py
# SCF-B-0126 selfcheck: PASS negative_cases=66
python3 -m py_compile scaffold/legacy-implementation-residual-0126/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archive source/runtime/test/CIは実行せず、正式authorityの昇格、既存台帳変更、merge/closeは含めません。
