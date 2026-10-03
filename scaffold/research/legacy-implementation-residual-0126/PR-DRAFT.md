# 最新mainの製品研究重複を除いた67件のimplementation_source残余を固定する research Scaffold

## 変更

固定BASE `5562f04da0f3205f9aa58205ec0d478419fc4f2e` の未解決1,792件から、prior研究205件とWave未解決64件の旧union227件を再導出しました。初期`implementation_source` trancheは120件でした。最新main `b3a3c49b34bfaa1cca5861075d1de18c0e5e7204` の8 product research bundleをasset IDとsource path/SHAで再集計し、global union429件、phase unresolvedとの交差280件を固定しました。

- 初期120件と既研究bundleの重複53件は新規targetから除外し、重複reconciliation inventoryへ移しました。17件は`same_source_same_candidate_result`、36件は`same_source_different_candidate_result`として保持します。source path/SHAとcandidate category/productsの一致だけを記録し、method identityは主張しません。
- 新規targetは67件。candidate分類はdirect product basis 30、multi-product conflict 23、insufficient basis 14です。候補はformal product/phase/implementation/consumer closureへ昇格しません。
- unresolved existing unionは280件、target処理前の`pre_target_residual_unresolved`は1,512件、新規target67件、処理後の`post_batch_remaining_unresolved`は1,445件です。global product union429件のうちunresolved外149件はこの分母へ算入していません。
- 各recordに`research_scope`、`evidence_completeness`、`overlap_status`、`bundle_revision`、`denominator_role`を追加し、初期120件のsource input digestは維持しつつ、8 product bundleをBinding upstreamへ追加しました。
- Wave1–50は全50入力をvalidatorが再走査し、598 edges / 355 unique assets、対象Wave edge 0を独立再集計します。fixed BASE git treeのexact path/type/mode（blob、100644/100755）も固定します。source anchor、旧disposition/history/failure/consumer、四製品L1、全nested record/inventoryを固定BASEから再導出します。
- `authority_effect=none`、`formal_asset_classification_updated=false`、`new_build_allowed=false`を固定します。archive旧workflowは静的Git object参照のみです。
- `scripts/helix.ps1`のphysical archive Git blobは363 bytes・`sha256:2b86bf027686c55db9ab6e8828361db69b9e7ccbf51111c438d90ee1ed21908b`で、LF→CRLF後の375 bytes・`sha256:9e5b68aefd8920fc248fc16d0c90305d0327c39362ae3e82621cbc1b53060bd7`がMANIFEST digestを再現します。静的診断だけをprovenanceへ記録し、物理blob不一致とhuman/source resolution pending、formal admission/reuse停止を維持します。
- inventoryの`classification_rule`、`authority_boundary.classification_state`、`binding_id`、`wave_source_paths`、`old_asset_source_mode`、`counts.target_assets`、`phase_candidate_distribution`、`edge_contract.missing_edges_forbidden`、`history_failure_consumer.disposition_rows`の9宣言に専用負例を追加しました。型崩れたexpected set/input digest、record boundary、record source anchorも、それぞれ`E_INVENTORY_DECLARATION`／`E_INPUT_DIGEST`／`E_RECORD_SCHEMA`／`E_SOURCE_ANCHOR`でfail-closeします。
- validatorのBASE ancestry/source取得失敗、固定commit product bundleの取得失敗、identity欠損をselfcheckからfault injectionし、それぞれ`E_BASE_NOT_ANCESTOR`、`E_BASE_SOURCE`、`E_PRODUCT_RESEARCH_INPUT`へfail-closeすることを確認します。各caseは関連する失敗点をひとつのID内で実測します。
- record全体とinventory各宣言をrecursive typed comparisonで検証します。integerは`type(x) is int`、booleanは`type(x) is bool`を必須とし、record `wave_edge_count=false`とinventory `counts.target_wave_edges=false`の負例でPythonのbool/int等価比較を拒否します。strict JSONではnonobject ledger rowとnested nonobject containerも拒否します。
- 変換規則と両digestをrecord provenanceおよびinventoryへ保存し、validatorが固定BASE object/MANIFESTから再計算します。これは不一致原因の静的説明に留まり、物理blob不一致とformal admission/reuse停止を維持します。record側・inventory側いずれの変換bytes/SHA tamperも`E_ARCHIVE_MANIFEST`で拒否します。
- 負例IDはvalidatorの`EXPECTED_NEGATIVE_CASES`、inventory、selfcheck実行収集で順序付き完全一致・重複なしを検査し、実測は100件・31 distinct error codesです。
- 初期120件（新規67件＋重複53件）の全archive sourceを`archive_source_provenance`へ保存し、固定BASE git-treeのexact path/type/mode、blob/bytes/SHA、ledger digest、個別MANIFEST digest/match/resolution、read modeをvalidatorが全値照合します。overlap 53件は同じprovenanceを参照し、既知の`helix.ps1` MANIFEST不一致は停止境界として明示します。

## 検証

```text
python3 -B scaffold/legacy-implementation-residual-0126/generate.py
python3 -B scaffold/legacy-implementation-residual-0126/validate.py
# SCF-B-0126 validate: PASS records=67 categories={'direct_product_basis': 30, 'insufficient_basis': 14, 'multi_product_conflict': 23} target_wave_edges=0 product_union=429 unresolved_existing_union=280 pre_target_residual=1512 new_target=67 post_batch_remaining=1445 overlap=53
python3 -B scaffold/legacy-implementation-residual-0126/selfcheck.py
# SCF-B-0126 selfcheck: PASS negative_cases=100 distinct_error_codes=31
python3 -m py_compile scaffold/legacy-implementation-residual-0126/*.py
python3 scaffold/tools/scfctl.py validate
python3 scaffold/tools/scfctl.py selftest
python3 scaffold/tools/scfctl.py stale
python3 scaffold/tools/scfctl.py residuals
git diff --check
```

旧archive source/runtime/test/CIは実行せず、正式authorityの昇格、既存台帳変更、merge/closeは含めません。
