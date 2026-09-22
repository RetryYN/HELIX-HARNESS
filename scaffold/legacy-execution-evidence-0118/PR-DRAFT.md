# Draft PR: SCF-B-0118 旧execution/result receipt 28件のasset-level evidence partition

## 目的

旧asset ledger 4,020行を固定BASE `44d546a40d2b4fa88701faf93ea8b618f4f1b86c` から静的に再導出し、execution/result 系28件について、旧sourceのGit object／blob／SHA／該当行、観測できる実行・failure marker・result、unit／requirement／acceptance直接結合の有無を個別に固定する。

## 結果

- 218 product unit／153 source ID、Wave1–50 598 edge／355 unique asset、旧asset ledger 4,020行を探索範囲として固定した。
- regex `(?:\.vitest\.log$|/vitest-targeted|test-result|receipt\.json$|full-receipt)` に一致する28件をledger順で全件対象化した。
- 非一致3,992行は除外した。`.helix/evidence/` 60行、`tests/` 597行、path名に `lint` を含む197行、`review-*/head.txt` 3行を含み、通常のtest source／lint logをreceiptへ混入させていない（分類は重複し得る）。
- 21件はJSON test summary、5件はtext summary、2件はhead/base/tested merge identity receipt。安全な状態機械の再生成後は24件がasset-level `pass_observed`、1件が`pass_with_pending`、2件がidentity-only、1件（`LEGACY-ASSET-CE767996F54E28A6486B`）が`fatal:` markerとpass summaryの矛盾としてverdictなし・asset-level failure observedになった。unit-level failure／縮退とは分類していない。
- JSONはsuite/test countの非負整数・総和整合・正のpass countを必須とし、textは正のpass／failed countとexit codeを分離して判定する。`0 failed` はfailure markerにせず、正のfailed count・fatal/error・非zero exitはfailure observationへ記録し、passとの併記はcontradictoryとしてverdictなしにする。
- 監査再現で従来実装の5条件（JSON `success=0/fail=2`、JSON count全zero、JSON suite count欠測／不整合、text `0 passed/2 failed`、pass summary後の`exit=2`）が誤ってpassになったことを固定し、いずれもverdictなしへ倒した。実データは `pass_observed` 25→24、verdictなし2→3、`pass_with_pending` 1件は不変。CE767はpass summaryとfatal markerが混在するためverdictなし＋asset-level failure observedとした。unit-level verdict／acceptance verdictは全件不変で、生成していない。
- selected 28件はWave edge、crosswalk direct／representative link、decision／read-after direct referenceに該当しない。candidate poolは検索候補であり、unit結合へ昇格しない。
- 各recordは旧実装、縮退、current実装、acceptanceをunknown／absentとして保持する。test pass、pending、fatal／lint、receipt identityを実装・縮退・未実装・受入へ昇格しない。
- inventoryはbundle_kind `research_scaffold_asset_level_receipt_partition`、expected_asset_count `28` と実record数、宣言済みtop-level key集合を固定照合し、3種類の改竄をselfcheckで拒否する。

## 変更範囲

- `scaffold/legacy-execution-evidence-0118/` にREADME、inventory、evidence JSONL、shared state machine、独立generator／validator oracle／selfcheck、Draft本文を追加。
- `scaffold/bindings/SCF-B-0118.json` を登録し、全成果物と固定BASE入力をBinding artifacts／upstreamへ登録した。
- formal crosswalk、authority、successor、legacy dispositionは変更していない。

## 検証

```text
python3 -B scaffold/legacy-execution-evidence-0118/generate.py  # PASS
python3 -B scaffold/legacy-execution-evidence-0118/validate.py  # PASS: 28
python3 -B scaffold/legacy-execution-evidence-0118/selfcheck.py  # PASS: 24 negative cases + 13 observation-state cases
python3 scaffold/tools/scfctl.py validate  # PASS: 105 bindings / fail=0
python3 scaffold/tools/scfctl.py stale     # PASS: stale=0
python3 scaffold/tools/scfctl.py residuals # PASS: residuals=0
git diff --check                         # PASS
```

旧archiveはGit objectの静的読取に限定し、旧runtime／test／CIを実行していない。merge／closeは行わない。

Progress reference: #1813（closeは行わない）。
