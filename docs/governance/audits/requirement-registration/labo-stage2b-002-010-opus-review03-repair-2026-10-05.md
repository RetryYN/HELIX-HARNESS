# LABO Stage 2b review03 修正記録

- 対象：HELIXLABO-L2-002〜010（1.0候補）。要求意味、owner、scope、versionは変更していない。
- Formal review: [#2585 comment 5987611541](https://github.com/RetryYN/HELIX-HARNESS/pull/2585#issuecomment-5987611541)。本文SHA-256（UTF-8）`91672497d8e3d45154da266482b75991eb765d5bc409eae42b6e663331a3d570`、6383 bytes。
- 修正本文revision: `f79f7309fc7216b1dab7521b8a1558f74fd2a846`。変更commit: `38a2a1b9b2b1381fbd03a9dbfcd165044c798e9e`, `f79f7309fc7216b1dab7521b8a1558f74fd2a846`。
- Stage1 prefix: 6/6文書でmain `1fcd83982bbb93c0630951c80dfd076e98caa54c` とbyte一致。
- 固定source: immutable repair04の93件全source full-file SHA／raw-LF span SHAを再計算し一致。repair05本文SHAも再照合。旧時点record 14件は指定Git revisionとworktreeのSHA/bytesがすべて一致し、書き換えていない。

## 所見の処置

- m1: 20列をcontext 11、観測値4、条件付きevent5に分類し、source envelopeとfield-stateの区別、missing/unknown/not_observedを独立caseで記録。
- m2: 002/003/004のAC↔CASE対応をcase見出しに照合。正式指摘に加え、同じ表で見つかった002-CASE-08、006-CASE-11の既存ずれも直した。
- m3: 006-CASE-15/16をAC-01へ、CASE-14をAC-03から除外。
- m4: LABO-008-AC-03の返却先を固定L2-008の現行責務ownerへ統一。
- m5: AC-02専用009-CASE-12をNFR-009-01から除外。
- m6: 002–005測定候補表を4列に整え、母集団・分母・判定材料を復元。
- m7: timing/volume行のリンク先をL3 NFR line 31に訂正。
- m8: repair05を現行NFR本文から直接参照し、repair04の誤った当時claimは不変の記録として保持して訂正経緯を記録。

## 検証と境界

`/tmp/verify_pr2585_r03_fixed.py`、`/tmp/check_pr2585_r03_crosswalk.py`、`/tmp/check_pr2585_r03_nfr_columns.py`、93 source pin再計算、repair05 SHA照合、6 Stage1 prefix照合、`git diff --check` がPASS。repair04の旧body 3d082ではNFRの選択trace列が11/13（008/009不一致）、repair05 body b6a7では13/13、今回も13/13です。functional CASE見出しは対象002–010で146件。旧CLI、旧runtime、旧test/CI、Bunは実行していない。

この記録は作成側の修正証拠であり、独立review、PO承認、実装・実行・release許可を生成しない。修正本文は未承認候補のままである。6文書SHA、current changed-line pin、歴史的recordのGit revision/SHA/bytes、source pinの監査参照は隣接JSONに固定した。
