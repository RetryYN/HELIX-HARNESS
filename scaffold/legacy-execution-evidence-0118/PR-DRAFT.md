# Draft PR: SCF-B-0118 旧receipt source_observationのfail-closed修正

## 問題

既存SCF-B-0118の旧execution/result receipt分類は、実行結果の形だけを見て次の不完全な観測をpassへ昇格し得た。

- JSONの`success=0/fail=2`
- JSONのtest／suite count全zero
- JSONのsuite count欠測または不整合
- textの`0 passed/2 failed`
- pass summary後の`exit=2`

このため、asset-level receiptの観測とunit-levelの実装・縮退・failure・acceptanceを安全に分離できなかった。

## 修正

- `common.py` にJSON／text／identityを分類するfail-closedなshared `source_observation` state machineを置いた。
- `validate.py` はgeneratorをimportせず、独立oracleで期待結果を再導出し、selfcheckでshared state machineとの完全一致を確認する。
- JSONはsuite／test countを非負整数として要求し、suite/test総和整合と正のpass countを満たさない限りverdictを出さない。
- textは正のpass／failed countとexit codeを別々に検査する。`0 failed`はfailure markerにせず、正のfailed count・fatal/error・非zero exitはfailure observationへ記録する。passとの併記はcontradictoryとしてverdictなしにする。
- unit-level verdict／acceptance verdictは生成せず、非zero exitを含むasset-level観測だけを保存する。
- 固定BASEから28件を再生成し、validator・selfcheck・Bindingの全成果物を同期した。

## 結果

- 対象は固定BASE `44d546a40d2b4fa88701faf93ea8b618f4f1b86c` の旧asset ledger 4,020行からregexで選んだ28件（JSON 21、text 5、identity 2）。Wave1–50は598 edge／355 unique asset、探索分母は218 product unit／153 source ID。
- 変更前の保存分類は`pass_observed` 25、`pass_with_pending` 1、verdictなし2。変更後は`pass_observed` 24、`pass_with_pending` 1、verdictなし3になった。
- `LEGACY-ASSET-CE767996F54E28A6486B` はpass summaryとfatal markerが混在するため、verdictなし＋asset-level failure observedとして保存した。これはunit-level failure／縮退の判定ではない。
- 28件すべてでunit／requirement／acceptance直接結合は不在のまま、unit-level実装・縮退・failure・受入はunknown／absentを維持した。test pass、pending、fatal marker、receipt identityから実装成立や未実装を推定していない。
- formal crosswalk、authority、successor、legacy dispositionは変更していない。

## 検証

監査再現の5条件（JSON `success=0/fail=2`、JSON count全zero、JSON suite count欠測／不整合、text `0 passed/2 failed`、pass summary後の`exit=2`）は、すべてverdictなしとして固定した。`0 failed`の正常pass、pending、identity-onlyも個別に検査した。

```text
python3 -B scaffold/legacy-execution-evidence-0118/generate.py  # PASS: 28
python3 -B scaffold/legacy-execution-evidence-0118/validate.py   # PASS: 28
python3 -B scaffold/legacy-execution-evidence-0118/selfcheck.py  # PASS: 24 negative + 13 observation-state cases
python3 scaffold/tools/scfctl.py validate                      # PASS: 123 bindings / fail=0
python3 scaffold/tools/scfctl.py stale                          # PASS: stale=0
python3 scaffold/tools/scfctl.py residuals                      # PASS: residuals=0
git diff --check                                                # PASS
git diff origin/main...HEAD --check                             # PASS
```

旧archiveはGit objectの静的読取に限定し、旧runtime／test／CIは実行していない。merge／closeは行わない。

Progress reference: #1813（closeは行わない）。
